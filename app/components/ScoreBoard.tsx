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
  // Find highest score among active players to display trophy
  const activeScores = players
    .filter((p) => p.isActiveInGame !== false)
    .map((p) => p.score);
  const highestScore = activeScores.length > 0 ? Math.max(...activeScores) : 0;
  const hasGameStarted = players.some((p) => p.score !== 0);

  return (
    <div className="p-3 bg-white border-2 border-neutral-900 rounded-lg shadow-xs mb-3">
      {/* Clean header: only Huidige Stand */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xs font-black tracking-wider text-neutral-600 uppercase">
          Huidige Stand
        </h2>
      </div>

      {/* Grid of Player Score Cards - All active players have the same clean white background */}
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
              className={`relative flex flex-col items-center justify-center p-2 sm:p-2.5 rounded-lg border-2 transition-all ${
                isDroppedOut
                  ? "bg-neutral-100 border-neutral-200 opacity-55"
                  : "bg-white border-neutral-200 hover:border-neutral-300"
              }`}
            >
              {/* Badges Bar on Top */}
              <div className="flex items-center justify-between w-full min-h-[20px] mb-1">
                <div className="flex items-center gap-1 min-w-0">
                  {/* Sitting out pause badge with wc, drink, cheese emojis */}
                  {isSittingOut && (
                    <span
                      className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 bg-neutral-100 text-neutral-800 rounded border border-neutral-300"
                      title="Pauze (even naar de wc, drankje pakken of kaasje snijden)"
                    >
                      <span className="text-[11px] leading-none">🧀🍺🚽</span>
                      <span className="text-[9px] font-black uppercase tracking-tight ml-0.5">Pauze</span>
                    </span>
                  )}

                  {/* Dropped out badge */}
                  {isDroppedOut && (
                    <span className="inline-flex items-center text-[9px] font-black uppercase px-1.5 py-0.5 bg-neutral-200 text-neutral-600 rounded">
                      Afgehaakt
                    </span>
                  )}
                </div>

                {/* Leader trophy icon */}
                {isLeader ? (
                  <span
                    className="inline-flex items-center text-sm leading-none ml-auto"
                    title="Topscorer (hoogste score)"
                  >
                    🏆
                  </span>
                ) : (
                  <span className="w-4" />
                )}
              </div>

              {/* Downward triangle pointing directly to player's name when they are the dealer (aan de beurt) */}
              {isDealer ? (
                <div
                  className="flex items-center justify-center -mb-0.5 mt-0.5 text-neutral-900"
                  title="Aan de beurt om te delen"
                >
                  <span className="text-xs font-black leading-none">▼</span>
                </div>
              ) : (
                <div className="h-3 select-none pointer-events-none" />
              )}

              {/* Player Name */}
              <div
                className={`text-xs sm:text-sm font-black uppercase tracking-wide truncate max-w-full text-center ${
                  isDroppedOut ? "line-through text-neutral-400" : "text-neutral-800"
                }`}
              >
                {player.name}
              </div>

              {/* Giant Monospace Score */}
              <div
                className={`mono-score text-2xl sm:text-3xl font-black my-0.5 tracking-tight ${
                  isDroppedOut
                    ? "text-neutral-400"
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
