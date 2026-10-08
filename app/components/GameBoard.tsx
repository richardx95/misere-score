"use client";
import React, { useState } from "react";
import { GameState, Player, Round, PlayerScoreChange } from "../lib/types";
import { saveGame, saveToHistory } from "../lib/storage";
import ScoreHeader from "./ScoreHeader";
import ScoreBoard from "./ScoreBoard";
import RoundHistory from "./RoundHistory";
import RulesModal from "./RulesModal";
import ConfirmModal from "./ConfirmModal";
import { PlusCircle } from "lucide-react";

interface GameBoardProps {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState | null>>;
  onStartNewGame: () => void;
  onOpenRoundSelection: () => void;
  onOpenEditPlayers: () => void;
}

export default function GameBoard({
  gameState,
  setGameState,
  onStartNewGame,
  onOpenRoundSelection,
  onOpenEditPlayers,
}: GameBoardProps) {
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isConfirmNewGameOpen, setIsConfirmNewGameOpen] = useState(false);

  const { players, dealerIndex, currentRound, rounds, sittingOutIds } = gameState;
  const currentDealer = players[dealerIndex]?.name || "Onbekend";
  const lastRound = rounds.length > 0 ? rounds[rounds.length - 1] : null;

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

    // Revert dealer index and sitting out IDs
    const previousDealerIndex = roundToRevert.dealerIndex;
    const revertedSittingOutIds = roundToRevert.sittingOutIds ?? gameState.sittingOutIds;

    const revertedState: GameState = {
      ...gameState,
      players: revertedPlayers,
      dealerIndex: previousDealerIndex,
      currentRound: Math.max(1, currentRound - 1),
      sittingOutIds: revertedSittingOutIds,
      rounds: previousRounds,
    };

    setGameState(revertedState);
    saveGame(revertedState);
  };

  return (
    <div className="flex flex-col h-[100dvh] max-w-md mx-auto bg-[#f8f9fa] border-x border-neutral-300 shadow-xl overflow-hidden p-2.5 sm:p-3">
      {/* 1. Header (fixed) */}
      <div className="shrink-0">
        <ScoreHeader
          currentRound={currentRound}
          dealerName={currentDealer}
          onOpenRules={() => setIsRulesOpen(true)}
          onNewGame={() => setIsConfirmNewGameOpen(true)}
          onEditPlayers={onOpenEditPlayers}
        />
      </div>

      {/* 2. Top: Players with their current score (fixed) */}
      <div className="shrink-0 mb-2">
        <ScoreBoard
          players={players}
          dealerIndex={dealerIndex}
          sittingOutIds={sittingOutIds}
          lastRoundChanges={lastRound?.changes}
        />
      </div>

      {/* 3. Underneath: Button to start a new round (fixed) */}
      <div className="shrink-0 mb-2.5">
        <button
          type="button"
          onClick={onOpenRoundSelection}
          className="w-full py-3 px-4 rounded-lg text-xs sm:text-sm font-black uppercase tracking-wider text-white bg-neutral-900 border-2 border-neutral-900 hover:bg-neutral-800 active:bg-black active:translate-y-0.5 shadow-sm transition-all flex items-center justify-center gap-2"
        >
          <PlusCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Nieuwe Ronde Invoeren (Ronde {currentRound})</span>
          <span className="text-base font-normal">➔</span>
        </button>
      </div>

      {/* 4. On the bottom: Scrollview with latest rounds & graph icon */}
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

      <ConfirmModal
        isOpen={isConfirmNewGameOpen}
        title="Nieuw Misère Spel Starten?"
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
