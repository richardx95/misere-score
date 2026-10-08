"use client";
import React, { useState, useEffect } from "react";
import { Users, Play, RotateCcw, ArrowLeft, Check, UserMinus, UserCheck, Info } from "lucide-react";
import { GameState, Player } from "../lib/types";

interface PlayerSetupProps {
  mode?: "create" | "edit";
  currentPlayers?: Player[];
  savedGame?: GameState | null;
  onStartGame?: (
    players: string[],
    dealerIndex: number,
    initialSittingOutIds: number[]
  ) => void;
  onSaveEditedPlayers?: (updatedPlayers: Player[]) => void;
  onSaveEditedNames?: (names: string[]) => void;
  onResumeGame?: () => void;
  onCancelEdit?: () => void;
}

export default function PlayerSetup({
  mode = "create",
  currentPlayers,
  savedGame,
  onStartGame,
  onSaveEditedPlayers,
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
  const [activeStatuses, setActiveStatuses] = useState<boolean[]>(
    currentPlayers
      ? currentPlayers.map((p) => p.isActiveInGame !== false)
      : [true, true, true, true]
  );
  const [dealerIndex, setDealerIndex] = useState<number>(0);
  const [initialSittingOutIds, setInitialSittingOutIds] = useState<number[]>([]);

  // Initialize or update from currentPlayers
  useEffect(() => {
    if (currentPlayers) {
      setNumPlayers(currentPlayers.length);
      setPlayerNames(currentPlayers.map((p) => p.name));
      setActiveStatuses(currentPlayers.map((p) => p.isActiveInGame !== false));
    }
  }, [currentPlayers]);

  // Adjust initial sitting out IDs whenever numPlayers changes
  useEffect(() => {
    if (!isEditMode) {
      if (numPlayers === 5) {
        setInitialSittingOutIds([4]); // Default to 5th player
      } else if (numPlayers === 6) {
        setInitialSittingOutIds([4, 5]); // Default to 5th & 6th players
      } else {
        setInitialSittingOutIds([]);
      }
    }
  }, [numPlayers, isEditMode]);

  const handleNumPlayersChange = (n: number) => {
    setNumPlayers(n);
    setPlayerNames((prev) => {
      const updated = [...prev];
      while (updated.length < n) {
        updated.push(`Speler ${updated.length + 1}`);
      }
      return updated.slice(0, n);
    });
    setActiveStatuses((prev) => {
      const updated = [...prev];
      while (updated.length < n) {
        updated.push(true);
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

  // Toggle sitting out in setup for 5 or 6 players
  const handleToggleSittingOut = (idx: number) => {
    if (numPlayers === 5) {
      setInitialSittingOutIds([idx]);
    } else if (numPlayers === 6) {
      // For 6 players: choosing idx selects adjacent pair [idx, (idx+1)%6]
      const nextIdx = (idx + 1) % 6;
      setInitialSittingOutIds([idx, nextIdx]);
    }
  };

  // Toggle active/drop-out status in edit mode
  const handleToggleActiveInGame = (idx: number) => {
    const currentActiveCount = activeStatuses.filter(Boolean).length;
    const isCurrentlyActive = activeStatuses[idx];

    if (isCurrentlyActive && currentActiveCount <= 4) {
      // Cannot drop below 4 active players
      alert("Er moeten minimaal 4 actieve spelers in het spel blijven.");
      return;
    }

    const updated = [...activeStatuses];
    updated[idx] = !isCurrentlyActive;
    setActiveStatuses(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalNames = playerNames.slice(0, numPlayers).map((name, i) => {
      const trimmed = name.trim();
      return trimmed || `Speler ${i + 1}`;
    });

    if (isEditMode) {
      if (onSaveEditedPlayers && currentPlayers) {
        const updatedPlayers: Player[] = currentPlayers.map((p, i) => ({
          ...p,
          name: finalNames[i] || p.name,
          isActiveInGame: activeStatuses[i] ?? true,
        }));
        onSaveEditedPlayers(updatedPlayers);
      } else if (onSaveEditedNames) {
        onSaveEditedNames(finalNames);
      }
    } else if (onStartGame) {
      onStartGame(finalNames, dealerIndex, initialSittingOutIds);
    }
  };

  const activeCount = activeStatuses.filter(Boolean).length;

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
          {isEditMode ? "Spelers & Status Bewerken" : "Misère Spelers & Setup"}
        </h1>

        <span className="w-8" />
      </header>

      {/* 2. Scrollable Body */}
      <div className="flex-1 min-h-0 overflow-y-auto p-3.5 space-y-3.5">
        {/* Resume ongoing game alert if available */}
        {!isEditMode && savedGame && savedGame.rounds.length > 0 && !savedGame.isCompleted && (
          <div className="p-3 border-2 border-amber-600 bg-amber-50 rounded-lg shadow-xs animate-fadeIn">
            <div className="text-xs font-black text-amber-950 uppercase tracking-wide flex items-center justify-between mb-1">
              <span>Actief Spel Gevonden</span>
              <span className="px-1.5 py-0.5 rounded bg-amber-200 text-amber-900 text-[10px] font-bold">
                Ronde {savedGame.currentRound}
              </span>
            </div>
            <p className="text-xs text-amber-900 mb-2 leading-relaxed">
              Spelers: <strong>{savedGame.players.map((p) => p.name).join(", ")}</strong>
            </p>
            <button
              type="button"
              onClick={onResumeGame}
              className="w-full py-2 px-3 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white rounded text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-xs transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Verder Spelen</span>
            </button>
          </div>
        )}

        {/* Player Setup Form Card */}
        <div className="p-3.5 bg-white border-2 border-neutral-900 rounded-lg shadow-xs">
          <h2 className="text-xs font-black uppercase tracking-wider text-neutral-800 mb-3 pb-1.5 border-b border-neutral-200 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-neutral-700" />
              <span>{isEditMode ? "Spelers & Afhakers" : "Nieuw Spel Instellen"}</span>
            </span>
            {isEditMode && (
              <span className="text-[10px] font-bold text-neutral-500">
                {activeCount} van {numPlayers} actief
              </span>
            )}
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
                      className={`py-2 px-3 rounded-md border-2 text-xs font-black transition-all ${
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
                  <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-[11px] text-blue-900 flex items-start gap-1.5">
                    <Info className="w-4 h-4 shrink-0 text-blue-600 mt-0.5" />
                    <div>
                      {numPlayers === 5 ? (
                        <span>
                          <strong>5 Spelers:</strong> 4 spelers actief per ronde. 1 speler pauzeert telkens (met de klok mee).
                        </span>
                      ) : (
                        <span>
                          <strong>6 Spelers:</strong> 4 spelers actief per ronde. 2 spelers pauzeren (elke speler 2 rondes achter elkaar pauze).
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Player Names & Status */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-neutral-700 mb-1">
                {isEditMode ? "Spelers & Deelname" : "Namen van de Spelers"}
              </label>
              <div className="space-y-2">
                {Array.from({ length: numPlayers }).map((_, i) => {
                  const isActive = activeStatuses[i] ?? true;
                  return (
                    <div
                      key={i}
                      className={`p-2 rounded-md border-2 transition-all ${
                        isActive
                          ? "bg-white border-neutral-200"
                          : "bg-neutral-100 border-dashed border-neutral-300 opacity-75"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 text-xs font-mono font-bold text-neutral-400 text-right shrink-0">
                          #{i + 1}
                        </span>
                        <input
                          type="text"
                          value={playerNames[i] || ""}
                          onChange={(e) => handleNameChange(i, e.target.value)}
                          placeholder={`Speler ${i + 1}`}
                          maxLength={20}
                          className="flex-1 py-1 px-2.5 text-xs sm:text-sm font-bold rounded border border-neutral-300 focus:border-neutral-900 focus:outline-none bg-white text-neutral-900 transition-colors"
                        />

                        {!isEditMode && dealerIndex === i && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 bg-neutral-100 text-neutral-900 border border-neutral-300 rounded shrink-0">
                            ▼ Deler
                          </span>
                        )}

                        {isEditMode && (
                          <button
                            type="button"
                            onClick={() => handleToggleActiveInGame(i)}
                            className={`px-2 py-1 text-[11px] font-bold rounded flex items-center gap-1 transition-colors shrink-0 ${
                              isActive
                                ? "bg-neutral-100 text-neutral-700 border border-neutral-300 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                                : "bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200"
                            }`}
                            title={isActive ? "Zet op afgehaakt" : "Heractiveer speler"}
                          >
                            {isActive ? (
                              <>
                                <UserMinus className="w-3 h-3 text-red-600" />
                                <span>Afhaken</span>
                              </>
                            ) : (
                              <>
                                <UserCheck className="w-3 h-3 text-emerald-700" />
                                <span>Heractiveer</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>

                      {isEditMode && !isActive && (
                        <div className="mt-1 text-[10px] font-medium text-amber-800 pl-7">
                          ⏸ Afgehaakt: score is bevroren en speler slaat alle toekomstige rondes over.
                        </div>
                      )}
                    </div>
                  );
                })}
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

            {/* Initial Sitting-Out Selection (create mode with 5 or 6 players) */}
            {!isEditMode && numPlayers > 4 && (
              <div className="pt-2 border-t border-neutral-200">
                <label className="block text-xs font-bold uppercase tracking-wide text-neutral-700 mb-1">
                  {numPlayers === 5
                    ? "Wie begint er met pauzeren? (1 speler)"
                    : "Wie beginnen er met pauzeren? (2 spelers)"}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {Array.from({ length: numPlayers }).map((_, i) => {
                    const isSelected = initialSittingOutIds.includes(i);
                    const name = playerNames[i]?.trim() || `Speler ${i + 1}`;
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleToggleSittingOut(i)}
                        className={`p-2 rounded-md border-2 text-xs font-bold transition-all text-left flex items-center justify-between ${
                          isSelected
                            ? "bg-neutral-900 text-white border-neutral-900 shadow-xs"
                            : "bg-white text-neutral-800 border-neutral-300 hover:border-neutral-500"
                        }`}
                      >
                        <span className="truncate">{name}</span>
                        {isSelected && (
                          <span className="text-[10px] font-black uppercase px-1.5 py-0.5 bg-neutral-800 text-white rounded shrink-0 flex items-center gap-1">
                            <span>🧀🍺</span>
                            <span>Pauze</span>
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-1 text-[10px] text-neutral-500">
                  {numPlayers === 5
                    ? "De actieve beurt roteert daarna elke ronde met de klok mee."
                    : "Tik op een speler om het startende wisselkoppel te kiezen."}
                </p>
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
              <span>Wijzigingen Opslaan</span>
            </button>
          </div>
        ) : (
          <button
            type="submit"
            form="player-setup-form"
            className="w-full py-3 px-4 rounded-md text-xs sm:text-sm font-black uppercase tracking-wider text-white bg-emerald-700 border-2 border-emerald-800 hover:bg-emerald-800 active:bg-emerald-900 shadow-xs flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Start Misère Spel</span>
          </button>
        )}
      </footer>
    </div>
  );
}
