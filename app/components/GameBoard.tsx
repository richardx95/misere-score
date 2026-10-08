"use client";
import React, { useState } from "react";
import { GameState, Player } from "../lib/types";
import ScoreHeader from "./ScoreHeader";
import ScoreBoard from "./ScoreBoard";
import RulesModal from "./RulesModal";
import ConfirmModal from "./ConfirmModal";
import { PlusCircle, TrendingUp } from "lucide-react";

interface GameBoardProps {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState | null>>;
  onStartNewGame: () => void;
  onOpenRoundSelection: () => void;
  onOpenEditPlayers: () => void;
  onOpenHistory: () => void;
}

export default function GameBoard({
  gameState,
  onStartNewGame,
  onOpenRoundSelection,
  onOpenEditPlayers,
  onOpenHistory,
}: GameBoardProps) {
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isConfirmNewGameOpen, setIsConfirmNewGameOpen] = useState(false);

  const { players, dealerIndex, currentRound, rounds, sittingOutIds } = gameState;
  const lastRound = rounds.length > 0 ? rounds[rounds.length - 1] : null;

  return (
    <div className="flex flex-col h-[100dvh] max-w-md mx-auto bg-[#f8f9fa] border-x border-neutral-300 shadow-xl overflow-hidden p-2.5 sm:p-3">
      {/* 1. Header with quick actions (Historie, Regels, Spelers, Nieuw) */}
      <div className="shrink-0">
        <ScoreHeader
          currentRound={currentRound}
          onOpenHistory={onOpenHistory}
          onOpenRules={() => setIsRulesOpen(true)}
          onOpenEditPlayers={onOpenEditPlayers}
          onNewGame={() => setIsConfirmNewGameOpen(true)}
        />
      </div>

      {/* 2. Top: Players with their current scores (generous space, no cramped scrolling) */}
      <div className="shrink-0 mb-3">
        <ScoreBoard
          players={players}
          dealerIndex={dealerIndex}
          sittingOutIds={sittingOutIds}
          lastRoundChanges={lastRound?.changes}
        />
      </div>

      {/* 3. Central Call-to-Action: Enter New Round */}
      <div className="shrink-0 mb-3">
        <button
          type="button"
          onClick={onOpenRoundSelection}
          className="w-full py-3.5 px-4 rounded-lg text-xs sm:text-sm font-black uppercase tracking-wider text-white bg-neutral-900 border-2 border-neutral-900 hover:bg-neutral-800 active:bg-black active:translate-y-0.5 shadow-md transition-all flex items-center justify-center gap-2"
        >
          <PlusCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>Nieuwe Ronde Invoeren (Ronde {currentRound})</span>
          <span className="text-base font-normal">➔</span>
        </button>
      </div>

      {/* 4. Quick Game Status Footer Bar */}
      <div className="mt-auto shrink-0 p-3 bg-white border-2 border-neutral-900 rounded-lg shadow-xs flex items-center justify-between text-xs">
        <div>
          <span className="font-bold text-neutral-800">
            {rounds.length} {rounds.length === 1 ? "ronde" : "rondes"} gespeeld
          </span>
          {lastRound && (
            <div className="text-[11px] text-neutral-500 truncate max-w-[200px]">
              Laatste: {lastRound.bid} ({lastRound.success ? "Win" : "Verlies"})
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onOpenHistory}
          className="flex items-center gap-1.5 py-1.5 px-3 bg-neutral-100 border border-neutral-300 rounded-md text-xs font-bold text-neutral-800 hover:bg-neutral-200 active:bg-neutral-300 transition-colors"
        >
          <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
          <span>Bekijk Historie &amp; Grafiek</span>
        </button>
      </div>

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
