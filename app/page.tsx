"use client";
import React, { useState, useEffect } from "react";
import PlayerSetup from "./components/PlayerSetup";
import GameBoard from "./components/GameBoard";
import RoundSelectionScreen from "./components/RoundSelectionScreen";
import FloatingSuits from "./components/FloatingSuits";
import { GameState, Player, Round, PlayerScoreChange } from "./lib/types";
import { loadGame, saveGame, saveToHistory } from "./lib/storage";

type ScreenType = "setup" | "overview" | "round-entry";

export default function HomePage() {
  const [activeScreen, setActiveScreen] = useState<ScreenType>("setup");
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [savedGame, setSavedGame] = useState<GameState | null>(null);
  const [setupMode, setSetupMode] = useState<"create" | "edit">("create");

  useEffect(() => {
    const existing = loadGame();
    if (existing) {
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
    ruleset: "family" | "classic"
  ) => {
    const newGame: GameState = {
      id: Date.now().toString(),
      players: playerNames.map((name, i) => ({
        id: i,
        name,
        score: 0,
        active: true,
      })),
      dealerIndex,
      currentRound: 1,
      rounds: [],
      activePlayerIds: playerNames.map((_, i) => i),
      ruleset,
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

  // Handler: Save edited player names
  const handleSaveEditedNames = (updatedNames: string[]) => {
    if (!gameState) return;
    const updatedPlayers = gameState.players.map((p, i) => ({
      ...p,
      name: updatedNames[i] || p.name,
    }));

    const updatedState: GameState = {
      ...gameState,
      players: updatedPlayers,
    };

    setGameState(updatedState);
    saveGame(updatedState);
    setActiveScreen("overview");
    setSetupMode("create");
  };

  // Handler: Cancel edit names
  const handleCancelEdit = () => {
    setActiveScreen("overview");
    setSetupMode("create");
  };

  // Handler: Add a completed round from the round-entry screen
  const handleAddRound = (roundData: {
    bid: string;
    bidderId: number;
    partnerIds: number[];
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

    // 2. Rotate dealer
    const nextDealerIndex = (dealerIndex + 1) % players.length;

    // 3. New round record
    const newRound: Round = {
      id: Date.now(),
      roundNumber: currentRound,
      dealerIndex,
      bid: roundData.bid,
      bidderId: roundData.bidderId,
      partnerIds: roundData.partnerIds,
      tricksMade: roundData.tricksMade,
      success: roundData.success,
      scoreChanges,
      changes: roundData.changes,
      summary: roundData.summary,
      timestamp: Date.now(),
    };

    // 4. Update Game State
    const updatedState: GameState = {
      ...gameState,
      players: updatedPlayers,
      dealerIndex: nextDealerIndex,
      currentRound: currentRound + 1,
      rounds: [...rounds, newRound],
    };

    setGameState(updatedState);
    saveGame(updatedState);
    saveToHistory(updatedState);

    // Return to score overview!
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

      {/* Screen 1: Creation of game / Editing of names */}
      {activeScreen === "setup" && (
        <PlayerSetup
          mode={setupMode}
          currentPlayers={gameState ? gameState.players : undefined}
          savedGame={savedGame}
          onStartGame={handleStartGame}
          onSaveEditedNames={handleSaveEditedNames}
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

      {/* Screen 3: Round Selection (Specific bid, single player grid, made/lost, add button) */}
      {activeScreen === "round-entry" && gameState && (
        <RoundSelectionScreen
          players={gameState.players}
          dealerIndex={gameState.dealerIndex}
          currentRound={gameState.currentRound}
          ruleset={gameState.ruleset}
          onBack={() => setActiveScreen("overview")}
          onAddRound={handleAddRound}
        />
      )}
    </div>
  );
}
