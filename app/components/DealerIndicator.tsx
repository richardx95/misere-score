"use client";
import React from "react";

type DealerIndicatorProps = {
  players: { id: number; name: string }[];
  dealerIndex: number;
};

export default function DealerIndicator({ players, dealerIndex }: DealerIndicatorProps) {
  return (
    <div className="flex gap-3 flex-wrap mt-4">
      {players.map((p, i) => (
        <div
          key={p.id}
          className={`px-3 py-2 rounded border ${
            i === dealerIndex
              ? "bg-yellow-200 border-yellow-400 font-bold text-amber-900"
              : "bg-gray-100 text-amber-900"
          }`}
        >
          {p.name}
          {i === dealerIndex && " 🎴"} {/* little icon for fun */}
        </div>
      ))}
    </div>
  );
}
