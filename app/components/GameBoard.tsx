"use client";
import React, { useState } from "react";
import { GameState, Player, Round, PlayerScoreChange } from "../lib/types";
import { saveGame, saveToHistory } from "../lib/storage";
import ScoreHeader from "./ScoreHeader";
import ScoreBoard from "./ScoreBoard";
import RoundEntry from "./RoundEntry";
import RoundHistory from "./RoundHistory";
import RulesModal from "./RulesModal";
import EditPlayersModal from "./EditPlayersModal";
import ConfirmModal from "./ConfirmModal";

interface GameBoardProps {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState | null>>;
  onStartNewGame: () => void;
}

export default function GameBoard({
  gameState,
  setGameState,
  onStartNewGame,
}: GameBoardProps) {
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isEditPlayersOpen, setIsEditPlayersOpen] = useState(false);
  const [isConfirmNewGameOpen, setIsConfirmNewGameOpen] = useState(false);

  const { players, dealerIndex, currentRound, rounds, ruleset } = gameState;
  const currentDealer = players[dealerIndex]?.name || "Onbekend";
  const lastRound = rounds.length > 0 ? rounds[rounds.length - 1] : null;

  // Add a round to the game
  const handleAddRound = (roundData: {
    bid: string;
    bidderId: number;
    partnerIds: number[];
    tricksMade?: number | string;
    success: boolean;
    changes: number[];
    summary: string;
  }) => {
    // 1. Calculate new scores for each player
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

    // 2. Next dealer rotates clockwise
    const nextDealerIndex = (dealerIndex + 1) % players.length;

    // 3. New round object
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
  };

  // Undo / Delete the latest round
  const handleUndoLastRound = () => {
    if (rounds.length === 0) return;

    const roundToRevert = rounds[rounds.length - 1];
    const previousRounds = rounds.slice(0, rounds.length - 1);

    // Revert player scores
    const revertedPlayers = players.map((p, i) => {
      const change = roundToRevert.changes[i] || 0;
      return {
        ...p,
        score: p.score - change,
      };
    });

    // Revert dealer index
    const previousDealerIndex =
      (dealerIndex - 1 + players.length) % players.length;

    const revertedState: GameState = {
      ...gameState,
      players: revertedPlayers,
      dealerIndex: previousDealerIndex,
      currentRound: Math.max(1, currentRound - 1),
      rounds: previousRounds,
    };

    setGameState(revertedState);
    saveGame(revertedState);
  };

  // Update player names
  const handleSavePlayerNames = (updatedNames: string[]) => {
    const updatedPlayers = players.map((p, i) => ({
      ...p,
      name: updatedNames[i] || p.name,
    }));

    const updatedState: GameState = {
      ...gameState,
      players: updatedPlayers,
    };

    setGameState(updatedState);
    saveGame(updatedState);
  };

  return (
    <div className="max-w-xl mx-auto px-2 sm:px-4 py-3 relative z-10">
      {/* Top Header with title, card suits, round badge, and actions */}
      <ScoreHeader
        currentRound={currentRound}
        dealerName={currentDealer}
        onOpenRules={() => setIsRulesOpen(true)}
        onNewGame={() => setIsConfirmNewGameOpen(true)}
        onEditPlayers={() => setIsEditPlayersOpen(true)}
      />

      {/* 1. CURRENT SCORE ON TOP */}
      <ScoreBoard
        players={players}
        dealerIndex={dealerIndex}
        lastRoundChanges={lastRound?.changes}
      />

      {/* 2. FOLLOWED BY ROUND SELECTION */}
      <RoundEntry
        players={players}
        dealerIndex={dealerIndex}
        currentRound={currentRound}
        ruleset={ruleset}
        onAddRound={handleAddRound}
      />

      {/* 3. LAST ROUNDS BELOW ROUND SELECTION + SCORING GRAPH */}
      <RoundHistory
        players={players}
        rounds={rounds}
        onUndoLastRound={handleUndoLastRound}
      />

      {/* Modals */}
      <RulesModal
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
      />

      <EditPlayersModal
        isOpen={isEditPlayersOpen}
        players={players}
        onClose={() => setIsEditPlayersOpen(false)}
        onSave={handleSavePlayerNames}
      />

      <ConfirmModal
        isOpen={isConfirmNewGameOpen}
        title="Nieuw Spel Starten?"
        message="Weet je zeker dat je een nieuw spel wilt starten? De huidige stand wordt opgeslagen in de geschiedenis."
        confirmLabel="Nieuw Spel"
        cancelLabel="Annuleren"
        onConfirm={() => {
          setIsConfirmNewGameOpen(false);
          onStartNewGame();
        }}
        onCancel={() => setIsConfirmNewGameOpen(false)}
      />
    </div>
  );
}
