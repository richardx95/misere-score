"use client";
import React, { useState, useEffect } from "react";
import { Users, Play, RotateCcw, ArrowLeft, Check } from "lucide-react";
import { GameState, Player } from "../lib/types";

interface PlayerSetupProps {
  mode?: "create" | "edit";
  currentPlayers?: Player[];
  savedGame?: GameState | null;
  onStartGame?: (players: string[], dealerIndex: number, ruleset: "family" | "classic") => void;
  onSaveEditedNames?: (names: string[]) => void;
  onResumeGame?: () => void;
  onCancelEdit?: () => void;
}

export default function PlayerSetup({
  mode = "create",
  currentPlayers,
  savedGame,
  onStartGame,
  onSaveEditedNames,
  onResumeGame,
  onCancelEdit,
}: PlayerSetupProps) {
  const isEditMode = mode === "edit";

  const [numPlayers, setNumPlayers] = useState<number>(
    currentPlayers ? currentPlayers.length : 4
  );
  const [playerNames, setPlayerNames] = useState<string[]>(
    currentPlayers
      ? currentPlayers.map((p) => p.name)
      : ["Speler 1", "Speler 2", "Speler 3", "Speler 4"]
  );
  const [dealerIndex, setDealerIndex] = useState<number>(0);
  const [ruleset, setRuleset] = useState<"family" | "classic">("family");

  useEffect(() => {
    if (currentPlayers) {
      setNumPlayers(currentPlayers.length);
      setPlayerNames(currentPlayers.map((p) => p.name));
    }
  }, [currentPlayers]);

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

    if (isEditMode && onSaveEditedNames) {
      onSaveEditedNames(finalNames);
    } else if (onStartGame) {
      onStartGame(finalNames, dealerIndex, ruleset);
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] max-w-md mx-auto bg-[#f8f9fa] border-x border-neutral-300 shadow-xl overflow-hidden">
      {/* 1. Top Header */}
      <header className="shrink-0 px-4 py-3 bg-white border-b-2 border-neutral-900 flex items-center justify-between">
        {isEditMode ? (
          <button
            type="button"
            onClick={onCancelEdit}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-neutral-800 bg-neutral-100 border border-neutral-300 rounded hover:bg-neutral-200"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Terug</span>
          </button>
        ) : (
          <div className="flex items-center gap-1.5 text-base select-none font-serif">
            <span className="text-neutral-900">♠</span>
            <span className="text-red-600">♥</span>
            <span className="text-neutral-900">♣</span>
            <span className="text-red-600">♦</span>
          </div>
        )}

        <h1 className="text-xs sm:text-sm font-black uppercase tracking-wider text-neutral-900">
          {isEditMode ? "Namen Bewerken" : "Spelers & Biedingen"}
        </h1>

        <span className="w-8" />
      </header>

      {/* 2. Scrollable Body */}
      <div className="flex-1 min-h-0 overflow-y-auto p-3.5 space-y-3.5">
        {/* Resume ongoing game alert if available */}
        {!isEditMode && savedGame && savedGame.rounds.length > 0 && !savedGame.isCompleted && (
          <div className="rikken-card p-3 border-2 border-amber-600 bg-amber-50 shadow-sm animate-fadeIn">
            <div className="text-xs font-black text-amber-950 uppercase tracking-wide flex items-center justify-between mb-1">
              <span>Actief Spel Gevonden</span>
              <span className="px-1.5 py-0.2 rounded bg-amber-200 text-amber-900 text-[10px]">
                Ronde {savedGame.currentRound}
              </span>
            </div>
            <p className="text-xs text-amber-900 mb-2 leading-relaxed">
              Spelers: <strong>{savedGame.players.map((p) => p.name).join(", ")}</strong>
            </p>
            <button
              type="button"
              onClick={onResumeGame}
              className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-xs transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Verder Spelen</span>
            </button>
          </div>
        )}

        {/* Player Setup Form */}
        <div className="rikken-card p-3.5 bg-white border-2 border-neutral-900">
          <h2 className="text-xs font-black uppercase tracking-wider text-neutral-800 mb-3 pb-1.5 border-b border-neutral-200 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-neutral-700" />
            <span>{isEditMode ? "Spelersnamen Wijzigen" : "Nieuw Spel Instellen"}</span>
          </h2>

          <form id="player-setup-form" onSubmit={handleSubmit} className="space-y-3.5">
            {/* Number of Players (create mode only) */}
            {!isEditMode && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-neutral-700 mb-1">
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
              </div>
            )}

            {/* Player Names */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-neutral-700 mb-1">
                Namen van de Spelers
              </label>
              <div className="space-y-1.5">
                {Array.from({ length: numPlayers }).map((_, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-6 text-xs font-mono font-bold text-neutral-500 text-right">
                      #{i + 1}
                    </span>
                    <input
                      type="text"
                      value={playerNames[i] || ""}
                      onChange={(e) => handleNameChange(i, e.target.value)}
                      placeholder={`Speler ${i + 1}`}
                      maxLength={20}
                      className="flex-1 py-1.5 px-3 text-xs sm:text-sm font-bold rounded-md border-2 border-neutral-300 focus:border-neutral-900 focus:outline-none bg-white text-neutral-900 transition-colors"
                    />
                    {!isEditMode && dealerIndex === i && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 rounded shrink-0">
                        🎴 Deler
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Starting Dealer (create mode only) */}
            {!isEditMode && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-neutral-700 mb-1">
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
            )}

            {/* Ruleset Selection (create mode only) */}
            {!isEditMode && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-neutral-700 mb-1">
                  Biedingen &amp; Puntentelling
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
                      Troela, Trek/met, Trek 5, Misère
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
                      Rik, Betere rik, 8 alleen, Piek
                    </div>
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* 3. Fixed Bottom Action Button */}
      <footer className="shrink-0 p-3 bg-white border-t-2 border-neutral-900 shadow-lg">
        {isEditMode ? (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onCancelEdit}
              className="py-2.5 px-3 bg-white border-2 border-neutral-300 text-neutral-700 text-xs font-bold uppercase tracking-wider rounded-md hover:bg-neutral-100"
            >
              Annuleren
            </button>
            <button
              type="submit"
              form="player-setup-form"
              className="flex-1 py-2.5 px-4 rounded-md text-xs sm:text-sm font-black uppercase tracking-wider text-white bg-neutral-900 border-2 border-neutral-900 hover:bg-neutral-800 active:bg-black shadow-xs flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Namen Opslaan</span>
            </button>
          </div>
        ) : (
          <button
            type="submit"
            form="player-setup-form"
            className="w-full py-3 px-4 rounded-md text-xs sm:text-sm font-black uppercase tracking-wider text-white bg-emerald-700 border-2 border-emerald-800 hover:bg-emerald-800 active:bg-emerald-900 shadow-xs flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Start Spel</span>
          </button>
        )}
      </footer>
    </div>
  );
}
