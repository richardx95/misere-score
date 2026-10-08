"use client";
import React, { useState, useEffect } from "react";
import PlayerSetup from "./components/PlayerSetup";
import GameBoard from "./components/GameBoard";
import RoundSelectionScreen from "./components/RoundSelectionScreen";
import FloatingSuits from "./components/FloatingSuits";
import { GameState, Player, Round, PlayerScoreChange } from "./lib/types";
import { loadGame, saveGame, saveToHistory } from "./lib/storage";
import {
  getInitialSittingOutIds,
  getNextSittingOutIds,
  getRoundActivePlayerIds,
  getNextClockwisePlayerId,
  getActiveInGamePlayers,
} from "./lib/rotation";

type ScreenType = "setup" | "overview" | "round-entry";

export default function HomePage() {
  const [activeScreen, setActiveScreen] = useState<ScreenType>("setup");
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [savedGame, setSavedGame] = useState<GameState | null>(null);
  const [setupMode, setSetupMode] = useState<"create" | "edit">("create");

  useEffect(() => {
    const existing = loadGame();
    if (existing) {
      // Ensure sittingOutIds and activePlayerIds are defined
      if (!existing.sittingOutIds) {
        existing.sittingOutIds = getInitialSittingOutIds(existing.players);
      }
      if (!existing.activePlayerIds) {
        existing.activePlayerIds = getRoundActivePlayerIds(
          existing.players,
          existing.sittingOutIds
        );
      }
      setSavedGame(existing);

      // If there is an active ongoing game, start directly on the score overview
      if (existing.rounds && existing.rounds.length > 0 && !existing.isCompleted) {
        setGameState(existing);
        setActiveScreen("overview");
      }
    }
  }, []);

  // Handler: Start a new game
  const handleStartGame = (
    playerNames: string[],
    dealerIndex: number,
    initialSittingOutIds: number[] = []
  ) => {
    const players: Player[] = playerNames.map((name, i) => ({
      id: i,
      name,
      score: 0,
      dealer: i === dealerIndex,
      isActiveInGame: true,
    }));

    const sittingOutIds = getInitialSittingOutIds(players, initialSittingOutIds);
    const activePlayerIds = getRoundActivePlayerIds(players, sittingOutIds);

    const newGame: GameState = {
      id: Date.now().toString(),
      players,
      dealerIndex,
      currentRound: 1,
      rounds: [],
      sittingOutIds,
      activePlayerIds,
      initialSittingOutIds,
      ruleset: "family",
      dateStarted: new Date().toISOString(),
      isCompleted: false,
    };

    setGameState(newGame);
    saveGame(newGame);
    saveToHistory(newGame);
    setActiveScreen("overview");
  };

  // Handler: Resume ongoing game
  const handleResumeGame = () => {
    if (savedGame) {
      setGameState(savedGame);
      setActiveScreen("overview");
    }
  };

  // Handler: Open edit players screen
  const handleOpenEditPlayers = () => {
    setSetupMode("edit");
    setActiveScreen("setup");
  };

  // Handler: Save edited players (names & drop-out statuses)
  const handleSaveEditedPlayers = (updatedPlayers: Player[]) => {
    if (!gameState) return;

    const activeInGame = getActiveInGamePlayers(updatedPlayers);

    // Recalculate sitting out and active players for the upcoming round
    let nextSittingOutIds: number[] = [];
    if (activeInGame.length > 4) {
      const currentSittingOut = gameState.sittingOutIds || [];
      const validSittingOut = currentSittingOut.filter((id) =>
        activeInGame.some((p) => p.id === id)
      );

      const targetCount = activeInGame.length === 5 ? 1 : 2;
      if (validSittingOut.length === targetCount) {
        nextSittingOutIds = validSittingOut;
      } else {
        nextSittingOutIds = getInitialSittingOutIds(updatedPlayers);
      }
    }

    const nextActivePlayerIds = getRoundActivePlayerIds(
      updatedPlayers,
      nextSittingOutIds
    );

    // Ensure dealerIndex points to an active player
    let nextDealerIndex = gameState.dealerIndex;
    if (updatedPlayers[nextDealerIndex]?.isActiveInGame === false) {
      nextDealerIndex = activeInGame.length > 0 ? activeInGame[0].id : 0;
    }

    const updatedState: GameState = {
      ...gameState,
      players: updatedPlayers,
      dealerIndex: nextDealerIndex,
      sittingOutIds: nextSittingOutIds,
      activePlayerIds: nextActivePlayerIds,
    };

    setGameState(updatedState);
    saveGame(updatedState);
    setActiveScreen("overview");
    setSetupMode("create");
  };

  // Handler: Cancel edit
  const handleCancelEdit = () => {
    setActiveScreen("overview");
    setSetupMode("create");
  };

  // Handler: Add a completed round from the round-entry screen
  const handleAddRound = (roundData: {
    bid: string;
    bidderId: number;
    partnerIds: number[];
    activePlayerIds: number[];
    sittingOutIds: number[];
    tricksMade?: number | string;
    success: boolean;
    changes: number[];
    summary: string;
  }) => {
    if (!gameState) return;

    const { players, dealerIndex, currentRound, rounds } = gameState;

    // 1. Calculate score changes
    const scoreChanges: PlayerScoreChange[] = players.map((p, i) => {
      const change = roundData.changes[i] || 0;
      return {
        playerId: p.id,
        oldScore: p.score,
        newScore: p.score + change,
        change,
      };
    });

    const updatedPlayers: Player[] = players.map((p, i) => ({
      ...p,
      score: p.score + (roundData.changes[i] || 0),
    }));

    // 2. Compute next sitting-out and active player IDs
    const nextSittingOutIds = getNextSittingOutIds(
      updatedPlayers,
      roundData.sittingOutIds
    );
    const nextActivePlayerIds = getRoundActivePlayerIds(
      updatedPlayers,
      nextSittingOutIds
    );

    // 3. Rotate dealer to the next active player clockwise
    const activeInGame = getActiveInGamePlayers(updatedPlayers);
    const currentDealerPlayerId = players[dealerIndex]?.id ?? 0;
    const nextDealerId = getNextClockwisePlayerId(
      activeInGame,
      currentDealerPlayerId
    );
    const nextDealerIndex = players.findIndex((p) => p.id === nextDealerId);

    // 4. New round record
    const newRound: Round = {
      id: Date.now(),
      roundNumber: currentRound,
      dealerIndex,
      bid: roundData.bid,
      bidderId: roundData.bidderId,
      partnerIds: roundData.partnerIds,
      sittingOutIds: roundData.sittingOutIds,
      activePlayerIds: roundData.activePlayerIds,
      tricksMade: roundData.tricksMade,
      success: roundData.success,
      scoreChanges,
      changes: roundData.changes,
      summary: roundData.summary,
      timestamp: Date.now(),
    };

    // 5. Update Game State
    const updatedState: GameState = {
      ...gameState,
      players: updatedPlayers,
      dealerIndex: nextDealerIndex >= 0 ? nextDealerIndex : 0,
      currentRound: currentRound + 1,
      sittingOutIds: nextSittingOutIds,
      activePlayerIds: nextActivePlayerIds,
      rounds: [...rounds, newRound],
    };

    setGameState(updatedState);
    saveGame(updatedState);
    saveToHistory(updatedState);

    // Return to score overview
    setActiveScreen("overview");
  };

  // Handler: Reset/New game
  const handleStartNewGame = () => {
    setGameState(null);
    setSetupMode("create");
    setActiveScreen("setup");
  };

  return (
    <div className="relative w-full h-[100dvh] overflow-hidden bg-[#f8f9fa] select-none">
      {/* Subtle floating playing card suits in background */}
      <FloatingSuits />

      {/* Screen 1: Creation of game / Editing of names & drop-outs */}
      {activeScreen === "setup" && (
        <PlayerSetup
          mode={setupMode}
          currentPlayers={gameState ? gameState.players : undefined}
          savedGame={savedGame}
          onStartGame={handleStartGame}
          onSaveEditedPlayers={handleSaveEditedPlayers}
          onResumeGame={handleResumeGame}
          onCancelEdit={handleCancelEdit}
        />
      )}

      {/* Screen 2: Score Overview (Players on top, + Ronde button, scrollview on bottom) */}
      {activeScreen === "overview" && gameState && (
        <GameBoard
          gameState={gameState}
          setGameState={setGameState}
          onStartNewGame={handleStartNewGame}
          onOpenRoundSelection={() => setActiveScreen("round-entry")}
          onOpenEditPlayers={handleOpenEditPlayers}
        />
      )}

      {/* Screen 3: Round Selection (Misère bid, single player grid, made/lost, add button) */}
      {activeScreen === "round-entry" && gameState && (
        <RoundSelectionScreen
          players={gameState.players}
          dealerIndex={gameState.dealerIndex}
          currentRound={gameState.currentRound}
          sittingOutIds={gameState.sittingOutIds}
          activePlayerIds={gameState.activePlayerIds}
          onBack={() => setActiveScreen("overview")}
          onAddRound={handleAddRound}
        />
      )}
    </div>
  );
}
