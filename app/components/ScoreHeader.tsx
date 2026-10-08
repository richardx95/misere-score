"use client";
import React from "react";
import { BookOpen, RefreshCw, Users, TrendingUp } from "lucide-react";

interface ScoreHeaderProps {
  currentRound: number;
  onOpenHistory: () => void;
  onOpenRules: () => void;
  onOpenEditPlayers: () => void;
  onNewGame: () => void;
}

export default function ScoreHeader({
  currentRound,
  onOpenHistory,
  onOpenRules,
  onOpenEditPlayers,
  onNewGame,
}: ScoreHeaderProps) {
  return (
    <header className="mb-2.5">
      {/* Title bar with suits & current round */}
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

        {/* Current Round badge */}
        <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-black bg-neutral-900 text-white tracking-wider uppercase">
          Ronde {currentRound}
        </span>
      </div>

      {/* Sub-bar with quick actions: Historie, Regels, Spelers, Nieuw */}
      <div className="grid grid-cols-4 gap-1.5 pt-2 text-xs">
        <button
          onClick={onOpenHistory}
          type="button"
          className="inline-flex items-center justify-center gap-1 py-1.5 px-2 text-xs font-bold bg-white border-2 border-neutral-300 rounded text-neutral-800 hover:border-neutral-900 active:bg-neutral-100 transition-colors shadow-2xs"
          title="Ronde historie en scoreverloop grafiek"
        >
          <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
          <span>Historie</span>
        </button>

        <button
          onClick={onOpenRules}
          type="button"
          className="inline-flex items-center justify-center gap-1 py-1.5 px-2 text-xs font-bold bg-white border-2 border-neutral-300 rounded text-neutral-800 hover:border-neutral-900 active:bg-neutral-100 transition-colors shadow-2xs"
          title="Spelregels en puntentelling"
        >
          <BookOpen className="w-3.5 h-3.5 text-neutral-700" />
          <span>Regels</span>
        </button>

        <button
          onClick={onOpenEditPlayers}
          type="button"
          className="inline-flex items-center justify-center gap-1 py-1.5 px-2 text-xs font-bold bg-white border-2 border-neutral-300 rounded text-neutral-800 hover:border-neutral-900 active:bg-neutral-100 transition-colors shadow-2xs"
          title="Spelersnamen en afhakers aanpassen"
        >
          <Users className="w-3.5 h-3.5 text-neutral-700" />
          <span>Spelers</span>
        </button>

        <button
          onClick={onNewGame}
          type="button"
          className="inline-flex items-center justify-center gap-1 py-1.5 px-2 text-xs font-bold bg-white border-2 border-red-300 text-red-700 rounded hover:bg-red-50 hover:border-red-600 active:bg-red-100 transition-colors shadow-2xs"
          title="Nieuw spel starten"
        >
          <RefreshCw className="w-3.5 h-3.5 text-red-600" />
          <span>Nieuw</span>
        </button>
      </div>
    </header>
  );
}
