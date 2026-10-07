"use client";
import React from "react";
import { Player } from "../lib/types";

interface ScoreBoardProps {
  players: Player[];
  dealerIndex: number;
  lastRoundChanges?: number[];
}

export default function ScoreBoard({
  players,
  dealerIndex,
  lastRoundChanges,
}: ScoreBoardProps) {
  // Find the highest score to display the King crown ♚
  const highestScore = Math.max(...players.map((p) => p.score));
  const hasGameStarted = players.some((p) => p.score !== 0);

  return (
    <div className="rikken-card p-3 sm:p-4 mb-3">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xs font-bold tracking-wider text-neutral-500 uppercase">
          Huidige Stand
        </h2>
        {hasGameStarted && (
          <span className="text-[11px] text-neutral-500 font-mono">
            Totaal: {players.reduce((sum, p) => sum + p.score, 0)} pnt
          </span>
        )}
      </div>

      {/* Grid of Player Score Cards */}
      <div
        className="grid gap-2"
        style={{
          gridTemplateColumns:
            players.length <= 4
              ? "repeat(auto-fit, minmax(130px, 1fr))"
              : "repeat(auto-fit, minmax(110px, 1fr))",
        }}
      >
        {players.map((player, index) => {
          const isLeader = hasGameStarted && player.score === highestScore;
          const isDealer = index === dealerIndex;
          const lastChange = lastRoundChanges ? lastRoundChanges[index] : null;

          // Color accents based on positive/negative/neutral
          const isPositive = player.score > 0;
          const isNegative = player.score < 0;

          return (
            <div
              key={player.id}
              className={`relative flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-md border-2 transition-all ${
                isLeader
                  ? "bg-amber-50/60 border-neutral-900 shadow-xs"
                  : "bg-white border-neutral-200"
              }`}
            >
              {/* Badges on Top */}
              <div className="flex items-center justify-between w-full mb-1">
                {/* Dealer indicator */}
                {isDealer ? (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.2 bg-amber-200 text-amber-900 rounded border border-amber-400">
                    🎴 Deler
                  </span>
                ) : (
                  <span />
                )}

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
              <div className="text-xs sm:text-sm font-bold text-neutral-800 uppercase tracking-wide truncate max-w-full text-center">
                {player.name}
              </div>

              {/* Giant Monospace Score */}
              <div
                className={`mono-score text-2xl sm:text-3xl font-black my-0.5 tracking-tight ${
                  isPositive
                    ? "text-emerald-700"
                    : isNegative
                    ? "text-red-700"
                    : "text-neutral-900"
                }`}
              >
                {player.score > 0 ? `+${player.score}` : player.score}
              </div>

              {/* Delta from last round */}
              {lastChange !== null && lastChange !== undefined && (
                <div
                  className={`text-[11px] font-mono font-medium ${
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
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
