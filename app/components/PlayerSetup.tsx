"use client";
import React, { useState } from "react";
import { Users, Play, RotateCcw } from "lucide-react";
import { GameState } from "../lib/types";

interface PlayerSetupProps {
  onStartGame: (players: string[], dealerIndex: number, ruleset: "family" | "classic") => void;
  savedGame: GameState | null;
  onResumeGame: () => void;
}

export default function PlayerSetup({
  onStartGame,
  savedGame,
  onResumeGame,
}: PlayerSetupProps) {
  const [numPlayers, setNumPlayers] = useState<number>(4);
  const [playerNames, setPlayerNames] = useState<string[]>([
    "Speler 1",
    "Speler 2",
    "Speler 3",
    "Speler 4",
  ]);
  const [dealerIndex, setDealerIndex] = useState<number>(0);
  const [ruleset, setRuleset] = useState<"family" | "classic">("family");

  const handleNumPlayersChange = (n: number) => {
    setNumPlayers(n);
    setPlayerNames((prev) => {
      const updated = [...prev];
      while (updated.length < n) {
        updated.push(`Speler ${updated.length + 1}`);
      }
      return updated.slice(0, n);
    });
    if (dealerIndex >= n) {
      setDealerIndex(0);
    }
  };

  const handleNameChange = (idx: number, val: string) => {
    const updated = [...playerNames];
    updated[idx] = val;
    setPlayerNames(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalNames = playerNames.slice(0, numPlayers).map((name, i) => {
      const trimmed = name.trim();
      return trimmed || `Speler ${i + 1}`;
    });
    onStartGame(finalNames, dealerIndex, ruleset);
  };

  return (
    <div className="max-w-md mx-auto p-4 sm:p-6">
      {/* Title with Card Suits */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-1 text-xl select-none font-serif">
          <span className="text-neutral-900">♠</span>
          <span className="text-red-600">♥</span>
          <span className="text-neutral-900">♣</span>
          <span className="text-red-600">♦</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-neutral-900">
          Misère &amp; Rikken
        </h1>
        <p className="text-xs text-neutral-600 font-medium mt-1">
          Traditionele familie score tracker
        </p>
      </div>

      {/* Resume ongoing game alert if available */}
      {savedGame && savedGame.rounds.length > 0 && !savedGame.isCompleted && (
        <div className="rikken-card p-4 mb-5 border-2 border-amber-600 bg-amber-50 shadow-sm animate-fadeIn">
          <div className="text-xs font-black text-amber-950 uppercase tracking-wide flex items-center justify-between mb-1">
            <span>Actief Spel Gevonden</span>
            <span className="px-1.5 py-0.5 rounded bg-amber-200 text-amber-900 text-[10px]">
              Ronde {savedGame.currentRound}
            </span>
          </div>
          <p className="text-xs text-amber-900 mb-3 leading-relaxed">
            Spelers: <strong>{savedGame.players.map((p) => p.name).join(", ")}</strong>
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onResumeGame}
              className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-xs transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Verder Spelen</span>
            </button>
          </div>
        </div>
      )}

      {/* Setup Card */}
      <div className="rikken-card p-4 sm:p-6 border-2 border-neutral-900 shadow-sm">
        <h2 className="text-xs font-black uppercase tracking-wider text-neutral-800 mb-4 pb-2 border-b border-neutral-200 flex items-center gap-1.5">
          <Users className="w-4 h-4 text-neutral-700" />
          <span>Nieuw Spel Instellen</span>
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Number of Players */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-neutral-700 mb-1.5">
              Aantal Spelers
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[4, 5, 6].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => handleNumPlayersChange(n)}
                  className={`py-2 px-3 rounded-md border-2 text-xs font-bold transition-all ${
                    numPlayers === n
                      ? "bg-neutral-900 text-white border-neutral-900 shadow-xs"
                      : "bg-white text-neutral-800 border-neutral-300 hover:border-neutral-900"
                  }`}
                >
                  {n} Spelers
                </button>
              ))}
            </div>
            {numPlayers > 4 && (
              <p className="mt-1 text-[11px] text-neutral-500 italic">
                Bij 5 of 6 spelers rouleert de deler elke ronde als pauzerende speler.
              </p>
            )}
          </div>

          {/* Player Names */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-neutral-700 mb-1.5">
              Namen van de Spelers
            </label>
            <div className="space-y-2">
              {Array.from({ length: numPlayers }).map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-7 text-xs font-mono font-bold text-neutral-500 text-right">
                    #{i + 1}
                  </span>
                  <input
                    type="text"
                    value={playerNames[i] || ""}
                    onChange={(e) => handleNameChange(i, e.target.value)}
                    placeholder={`Speler ${i + 1}`}
                    maxLength={20}
                    className="flex-1 py-2 px-3 text-xs sm:text-sm font-semibold rounded-md border-2 border-neutral-300 focus:border-neutral-900 focus:outline-none bg-white text-neutral-900 transition-colors"
                  />
                  {dealerIndex === i && (
                    <span className="text-[10px] font-bold px-1.5 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded shrink-0">
                      🎴 Deler
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Starting Dealer */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-neutral-700 mb-1.5">
              Startende Deler
            </label>
            <div className="relative">
              <select
                value={dealerIndex}
                onChange={(e) => setDealerIndex(Number(e.target.value))}
                className="w-full bg-white border-2 border-neutral-900 rounded-md py-2 px-3 text-xs sm:text-sm font-bold text-neutral-900 focus:outline-none appearance-none cursor-pointer"
              >
                {playerNames.slice(0, numPlayers).map((name, i) => (
                  <option key={i} value={i}>
                    {name.trim() || `Speler ${i + 1}`}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-neutral-700">
                ▼
              </div>
            </div>
          </div>

          {/* Ruleset Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-neutral-700 mb-1.5">
              Biedingen &amp; Puntensysteem
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRuleset("family")}
                className={`p-2.5 rounded-md border-2 text-left transition-all ${
                  ruleset === "family"
                    ? "bg-neutral-900 text-white border-neutral-900 shadow-xs"
                    : "bg-white text-neutral-800 border-neutral-300 hover:border-neutral-900"
                }`}
              >
                <div className="text-xs font-bold">Onze Familieregels</div>
                <div
                  className={`text-[10px] mt-0.5 ${
                    ruleset === "family" ? "text-neutral-300" : "text-neutral-500"
                  }`}
                >
                  Trek /met, Trek 5, Troela, Misère, Schoppen dame
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRuleset("classic")}
                className={`p-2.5 rounded-md border-2 text-left transition-all ${
                  ruleset === "classic"
                    ? "bg-neutral-900 text-white border-neutral-900 shadow-xs"
                    : "bg-white text-neutral-800 border-neutral-300 hover:border-neutral-900"
                }`}
              >
                <div className="text-xs font-bold">Klassiek Rikken</div>
                <div
                  className={`text-[10px] mt-0.5 ${
                    ruleset === "classic" ? "text-neutral-300" : "text-neutral-500"
                  }`}
                >
                  Rik, Betere rik, 8 alleen, Piek, Open misère
                </div>
              </button>
            </div>
          </div>

          {/* Start Button */}
          <button
            type="submit"
            className="w-full mt-4 py-3 px-4 rounded-md text-sm font-black uppercase tracking-wider text-white bg-emerald-700 border-2 border-emerald-800 hover:bg-emerald-800 active:bg-emerald-900 shadow-xs transition-all flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Start Spel</span>
          </button>
        </form>
      </div>
    </div>
  );
}
