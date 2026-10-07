"use client";
import React from "react";
import { BookOpen, RefreshCw, UserCheck } from "lucide-react";

interface ScoreHeaderProps {
  currentRound: number;
  dealerName: string;
  onOpenRules: () => void;
  onNewGame: () => void;
  onEditPlayers: () => void;
}

export default function ScoreHeader({
  currentRound,
  dealerName,
  onOpenRules,
  onNewGame,
  onEditPlayers,
}: ScoreHeaderProps) {
  return (
    <header className="mb-3">
      {/* Title with playing card suits */}
      <div className="flex items-center justify-between pb-2 border-b-2 border-neutral-900">
        <div className="flex items-center gap-1.5">
          <span className="text-base select-none text-red-600 font-serif">♥</span>
          <span className="text-base select-none text-neutral-900 font-serif">♠</span>
          <h1 className="text-base sm:text-lg font-black tracking-wide uppercase text-neutral-900">
            Misère Score
          </h1>
          <span className="text-base select-none text-red-600 font-serif">♦</span>
          <span className="text-base select-none text-neutral-900 font-serif">♣</span>
        </div>

        {/* Round and Dealer Indicator */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-neutral-900 text-white tracking-wider uppercase">
            Ronde {currentRound}
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-900 border border-amber-300">
            <span>🎴 Deler:</span>
            <strong>{dealerName}</strong>
          </span>
        </div>
      </div>

      {/* Sub-bar with quick actions */}
      <div className="flex items-center justify-between pt-2 text-xs">
        <div className="sm:hidden flex items-center gap-1 text-xs text-neutral-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
          <span>🎴 Deler:</span>
          <strong className="text-neutral-900">{dealerName}</strong>
        </div>

        <div className="flex items-center gap-1.5 ml-auto">
          <button
            onClick={onOpenRules}
            type="button"
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-white border border-neutral-300 rounded text-neutral-800 hover:bg-neutral-100 active:bg-neutral-200 transition-colors shadow-xs"
            title="Spelregels en puntentelling"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Regels</span>
          </button>

          <button
            onClick={onEditPlayers}
            type="button"
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-white border border-neutral-300 rounded text-neutral-800 hover:bg-neutral-100 active:bg-neutral-200 transition-colors shadow-xs"
            title="Namen aanpassen"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Namen</span>
          </button>

          <button
            onClick={onNewGame}
            type="button"
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-white border border-red-300 text-red-700 rounded hover:bg-red-50 active:bg-red-100 transition-colors shadow-xs"
            title="Nieuw spel starten"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Nieuw</span>
          </button>
        </div>
      </div>
    </header>
  );
}
