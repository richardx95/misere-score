"use client";
import React from "react";
import { Player } from "../lib/types";

interface ScoreBoardProps {
  players: Player[];
  dealerIndex: number;
  sittingOutIds?: number[];
  lastRoundChanges?: number[];
}

export default function ScoreBoard({
  players,
  dealerIndex,
  sittingOutIds = [],
  lastRoundChanges,
}: ScoreBoardProps) {
  // Find highest score among active players to display crown
  const activeScores = players
    .filter((p) => p.isActiveInGame !== false)
    .map((p) => p.score);
  const highestScore = activeScores.length > 0 ? Math.max(...activeScores) : 0;
  const hasGameStarted = players.some((p) => p.score !== 0);

  return (
    <div className="p-3 bg-white border-2 border-neutral-900 rounded-lg shadow-xs mb-3">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xs font-black tracking-wider text-neutral-600 uppercase flex items-center gap-1.5">
          <span>Huidige Stand</span>
          {sittingOutIds.length > 0 && (
            <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded border border-amber-300 normal-case">
              {sittingOutIds.length === 1 ? "1 speler op de bank" : "2 spelers op de bank"}
            </span>
          )}
        </h2>
        {hasGameStarted && (
          <span className="text-[11px] text-neutral-500 font-mono font-bold">
            Totaal: {players.reduce((sum, p) => sum + p.score, 0)} pnt
          </span>
        )}
      </div>

      {/* Grid of Player Score Cards */}
      <div
        className={`grid gap-2 ${
          players.length <= 4
            ? "grid-cols-2 sm:grid-cols-4"
            : players.length === 5
            ? "grid-cols-2 sm:grid-cols-5"
            : "grid-cols-2 sm:grid-cols-3"
        }`}
      >
        {players.map((player, index) => {
          const isDroppedOut = player.isActiveInGame === false;
          const isSittingOut = !isDroppedOut && sittingOutIds.includes(player.id);
          const isLeader = !isDroppedOut && hasGameStarted && player.score === highestScore;
          const isDealer = !isDroppedOut && index === dealerIndex;
          const lastChange = lastRoundChanges ? lastRoundChanges[index] : null;

          // Color accents based on positive/negative/neutral
          const isPositive = player.score > 0;
          const isNegative = player.score < 0;

          return (
            <div
              key={player.id}
              className={`relative flex flex-col items-center justify-center p-2 sm:p-2.5 rounded-md border-2 transition-all ${
                isDroppedOut
                  ? "bg-neutral-100 border-neutral-300 opacity-60"
                  : isSittingOut
                  ? "bg-amber-50/50 border-amber-300"
                  : isLeader
                  ? "bg-amber-50/80 border-neutral-900 shadow-xs"
                  : "bg-white border-neutral-200"
              }`}
            >
              {/* Badges on Top */}
              <div className="flex items-center justify-between w-full min-h-[18px] mb-1">
                <div className="flex items-center gap-1">
                  {isDealer && (
                    <span className="inline-flex items-center text-[10px] font-bold px-1 py-0.2 bg-amber-200 text-amber-900 rounded border border-amber-400">
                      🎴 Deler
                    </span>
                  )}
                  {isSittingOut && (
                    <span className="inline-flex items-center text-[10px] font-black uppercase px-1 py-0.2 bg-amber-500 text-white rounded">
                      Pauze
                    </span>
                  )}
                  {isDroppedOut && (
                    <span className="inline-flex items-center text-[10px] font-black uppercase px-1 py-0.2 bg-neutral-600 text-white rounded">
                      Afgehaakt
                    </span>
                  )}
                </div>

                {/* Leader crown */}
                {isLeader && (
                  <span
                    className="inline-flex items-center justify-center text-amber-600 font-bold text-sm leading-none"
                    title="Huidige leider"
                  >
                    ♚
                  </span>
                )}
              </div>

              {/* Player Name */}
              <div
                className={`text-xs sm:text-sm font-bold uppercase tracking-wide truncate max-w-full text-center ${
                  isDroppedOut ? "line-through text-neutral-500" : "text-neutral-800"
                }`}
              >
                {player.name}
              </div>

              {/* Giant Monospace Score */}
              <div
                className={`mono-score text-2xl sm:text-3xl font-black my-0.5 tracking-tight ${
                  isDroppedOut
                    ? "text-neutral-500"
                    : isPositive
                    ? "text-emerald-700"
                    : isNegative
                    ? "text-red-700"
                    : "text-neutral-900"
                }`}
              >
                {player.score > 0 ? `+${player.score}` : player.score}
              </div>

              {/* Delta from last round */}
              {lastChange !== null && lastChange !== undefined ? (
                <div
                  className={`text-[11px] font-mono font-bold ${
                    lastChange > 0
                      ? "text-emerald-600"
                      : lastChange < 0
                      ? "text-red-600"
                      : "text-neutral-400"
                  }`}
                >
                  {lastChange > 0
                    ? `(+${lastChange})`
                    : lastChange < 0
                    ? `(${lastChange})`
                    : "(0)"}
                </div>
              ) : (
                <div className="text-[11px] font-mono opacity-0 select-none">-</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
