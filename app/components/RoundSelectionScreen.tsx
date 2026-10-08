"use client";
import React, { useState, useEffect, useMemo } from "react";
import { Player } from "../lib/types";
import { MISERE_GAME_TYPES, GameType } from "../lib/gameTypes";
import { calculateRoundScores } from "../lib/scoring";
import { getRoundActivePlayerIds } from "../lib/rotation";
import { ArrowLeft, Check, X, Plus, Minus, AlertCircle, ShieldAlert, Users, Info } from "lucide-react";

interface RoundSelectionScreenProps {
  players: Player[];
  dealerIndex: number;
  currentRound: number;
  sittingOutIds?: number[];
  activePlayerIds?: number[];
  onBack: () => void;
  onAddRound: (roundData: {
    bid: string;
    bidderId: number;
    partnerIds: number[];
    activePlayerIds: number[];
    sittingOutIds: number[];
    tricksMade?: number | string;
    success: boolean;
    changes: number[];
    summary: string;
  }) => void;
}

export default function RoundSelectionScreen({
  players,
  dealerIndex,
  currentRound,
  sittingOutIds = [],
  activePlayerIds,
  onBack,
  onAddRound,
}: RoundSelectionScreenProps) {
  // Available games: Misère family only
  const availableGameTypes = MISERE_GAME_TYPES;

  // Compute the 4 active players for this round
  const effectiveActivePlayerIds = useMemo(() => {
    if (activePlayerIds && activePlayerIds.length > 0) {
      return activePlayerIds;
    }
    return getRoundActivePlayerIds(players, sittingOutIds);
  }, [players, sittingOutIds, activePlayerIds]);

  const activePlayers = useMemo(() => {
    return players.filter((p) => effectiveActivePlayerIds.includes(p.id));
  }, [players, effectiveActivePlayerIds]);

  const inactivePlayers = useMemo(() => {
    return players.filter((p) => !effectiveActivePlayerIds.includes(p.id));
  }, [players, effectiveActivePlayerIds]);

  const [selectedBidId, setSelectedBidId] = useState<string>("trek_met");
  // ONE SINGLE SELECTION of player IDs:
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<number[]>([]);
  const [tricksWon, setTricksWon] = useState<number>(8);
  const [troelaPreset, setTroelaPreset] = useState<string>("10+");
  const [isSuccess, setIsSuccess] = useState<boolean>(true);

  // Current active game type object
  const currentGameType: GameType = useMemo(() => {
    return (
      availableGameTypes.find((g) => g.id === selectedBidId) ||
      availableGameTypes[0]
    );
  }, [availableGameTypes, selectedBidId]);

  // Max and required players for the chosen bid
  const playerRule = useMemo(() => {
    if (currentGameType.isPenalty) {
      return { min: 1, max: 2, label: "1 of 2 spelers (met straf)", type: "penalty" };
    }
    if (currentGameType.id === "kaartje_vragen") {
      return { min: 1, max: 2, label: "1 of 2 spelers (solo of met maat)", type: "flexible" };
    }
    if (currentGameType.isMisere) {
      return { min: 1, max: 3, label: "1 t/m 3 spelers (die Misère gaan)", type: "misere" };
    }
    if (currentGameType.requiresPartner) {
      return { min: 2, max: 2, label: "Precies 2 spelers (Duo: bieder & maat)", type: "duo" };
    }
    // Solo
    return { min: 1, max: 1, label: "Precies 1 speler (Solo bieder)", type: "solo" };
  }, [currentGameType]);

  // Reset or adjust when bid changes
  useEffect(() => {
    // If selected players exceed new max, trim them
    if (selectedPlayerIds.length > playerRule.max) {
      setSelectedPlayerIds(selectedPlayerIds.slice(0, playerRule.max));
    }

    if (currentGameType.id === "troela" || currentGameType.id === "troelalier") {
      setTroelaPreset("10+");
      setIsSuccess(true);
    } else if (currentGameType.id === "trek_met") {
      setTricksWon(8);
      setIsSuccess(true);
    } else if (currentGameType.id === "trek_alleen_5") {
      setTricksWon(5);
      setIsSuccess(true);
    } else if (currentGameType.id === "9_alleen") {
      setTricksWon(9);
      setIsSuccess(true);
    } else if (currentGameType.id === "13_alleen") {
      setTricksWon(13);
      setIsSuccess(true);
    } else if (currentGameType.isMisere) {
      setIsSuccess(true);
      setTricksWon(0);
    } else {
      setIsSuccess(true);
      setTricksWon(currentGameType.targetTricks ?? 8);
    }
  }, [currentGameType, playerRule]);

  // Automatically update success for trick-based games
  useEffect(() => {
    if (currentGameType.id === "trek_met") {
      setIsSuccess(tricksWon >= 8);
    } else if (currentGameType.id === "trek_alleen_5") {
      setIsSuccess(tricksWon >= 5);
    } else if (currentGameType.id === "troela" || currentGameType.id === "troelalier") {
      setIsSuccess(troelaPreset !== "10-");
    } else if (currentGameType.id === "9_alleen") {
      setIsSuccess(tricksWon >= 9);
    } else if (currentGameType.id === "13_alleen") {
      setIsSuccess(tricksWon === 13);
    }
  }, [tricksWon, troelaPreset, currentGameType]);

  // SINGLE GRID: Toggle active player selection
  const handleTogglePlayer = (id: number) => {
    if (selectedPlayerIds.includes(id)) {
      // Deselect
      setSelectedPlayerIds(selectedPlayerIds.filter((pId) => pId !== id));
    } else {
      // Select
      if (playerRule.max === 1) {
        // Solo: immediately replace with the new selection
        setSelectedPlayerIds([id]);
      } else if (selectedPlayerIds.length < playerRule.max) {
        setSelectedPlayerIds([...selectedPlayerIds, id]);
      } else {
        // Already at max (e.g. 2 for duo): replace the last one so user doesn't get stuck
        setSelectedPlayerIds([selectedPlayerIds[0], id]);
      }
    }
  };

  // Determine current tricks value
  const currentTricksValue: string | number = useMemo(() => {
    if (currentGameType.id === "troela" || currentGameType.id === "troelalier") {
      return troelaPreset;
    }
    return tricksWon;
  }, [currentGameType, troelaPreset, tricksWon]);

  // Check if player selection matches rule
  const isPlayerSelectionValid = useMemo(() => {
    return (
      selectedPlayerIds.length >= playerRule.min &&
      selectedPlayerIds.length <= playerRule.max
    );
  }, [selectedPlayerIds, playerRule]);

  // Live score calculation preview
  const preview = useMemo(() => {
    if (!isPlayerSelectionValid) {
      let msg = "";
      if (selectedPlayerIds.length === 0) {
        msg = `Selecteer ${playerRule.label}`;
      } else if (selectedPlayerIds.length < playerRule.min) {
        msg = `Selecteer nog ${playerRule.min - selectedPlayerIds.length} speler`;
      } else {
        msg = `Maximaal ${playerRule.max} spelers toegestaan`;
      }
      return {
        changes: new Array(players.length).fill(0),
        isValid: false,
        message: msg,
      };
    }

    const bidderId = selectedPlayerIds[0];
    const partnerIds = selectedPlayerIds.slice(1);

    const changes = calculateRoundScores(
      currentGameType.name,
      isSuccess,
      0,
      players,
      bidderId,
      partnerIds,
      effectiveActivePlayerIds,
      currentTricksValue,
      false,
      selectedPlayerIds
    );

    return {
      changes,
      isValid: true,
      message: "",
    };
  }, [
    players,
    selectedPlayerIds,
    isPlayerSelectionValid,
    playerRule,
    currentGameType,
    isSuccess,
    effectiveActivePlayerIds,
    currentTricksValue,
  ]);

  // Handle submit round
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPlayerSelectionValid || !preview.isValid) return;

    const bidderId = selectedPlayerIds[0];
    const partnerIds = selectedPlayerIds.slice(1);
    const bidder = players.find((p) => p.id === bidderId);
    const partners = partnerIds
      .map((id) => players.find((p) => p.id === id)?.name)
      .filter(Boolean);

    let summary = "";
    if (currentGameType.isPenalty) {
      const names = selectedPlayerIds
        .map((id) => players.find((p) => p.id === id)?.name)
        .filter(Boolean);
      summary = `Straf voor: ${names.join(" & ")}`;
    } else {
      const team =
        partners.length > 0
          ? `${bidder?.name} & ${partners.join(" & ")}`
          : (bidder?.name || "Bieder");
      const outcome = isSuccess ? "Gewonnen" : "Verloren";
      const tricksText =
        currentGameType.id === "troela" || currentGameType.id === "troelalier"
          ? troelaPreset
          : currentGameType.isTrickBased
          ? `${tricksWon} slagen`
          : "";
      summary = `${team} - ${outcome} ${tricksText ? `(${tricksText})` : ""}`;
    }

    onAddRound({
      bid: currentGameType.name,
      bidderId,
      partnerIds,
      activePlayerIds: effectiveActivePlayerIds,
      sittingOutIds,
      tricksMade: currentTricksValue,
      success: isSuccess,
      changes: preview.changes,
      summary,
    });
  };

  const dealer = players[dealerIndex]?.name || "Onbekend";

  return (
    <div className="flex flex-col h-[100dvh] max-w-md mx-auto bg-[#f8f9fa] border-x border-neutral-300 shadow-xl overflow-hidden">
      {/* 1. Fixed Top Bar */}
      <header className="shrink-0 px-3 py-2.5 bg-white border-b-2 border-neutral-900 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-neutral-800 bg-neutral-100 border border-neutral-300 rounded hover:bg-neutral-200 active:bg-neutral-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Terug</span>
        </button>

        <div className="text-center">
          <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 block">
            Ronde {currentRound}
          </span>
          <h1 className="text-xs sm:text-sm font-black uppercase tracking-wide text-neutral-900">
            Ronde Invoeren
          </h1>
        </div>

        <span className="text-[10px] font-bold px-2 py-1 bg-neutral-100 text-neutral-900 rounded border border-neutral-300">
          <span className="text-neutral-900 font-black">▼ Deler:</span> {dealer}
        </span>
      </header>

      {/* 2. Scrollable Form Content */}
      <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-3">
        {/* Step A: Bieding Kiezen */}
        <div className="p-3 bg-white border-2 border-neutral-900 rounded-lg shadow-xs">
          <label className="block text-[11px] font-black uppercase tracking-wider text-neutral-600 mb-1">
            1. Bieding / Misère Speltype
          </label>
          <div className="relative">
            <select
              value={selectedBidId}
              onChange={(e) => setSelectedBidId(e.target.value)}
              className="w-full bg-white border-2 border-neutral-900 rounded-md py-2 px-3 text-xs sm:text-sm font-bold text-neutral-900 focus:outline-none appearance-none cursor-pointer"
            >
              {availableGameTypes.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name} ({g.basePoints}p)
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-neutral-700">
              ▼
            </div>
          </div>
          <p className="mt-1 text-[11px] text-neutral-600 font-medium">
            {currentGameType.description}
          </p>
        </div>

        {/* Step B: ONE SINGLE GRID TO SELECT / DESELECT PLAYERS */}
        <div className="p-3 bg-white border-2 border-neutral-900 rounded-lg shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[11px] font-black uppercase tracking-wider text-neutral-700">
              2. Spelers Selecteren
            </label>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                isPlayerSelectionValid
                  ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                  : "bg-amber-50 text-amber-800 border-amber-300"
              }`}
            >
              {selectedPlayerIds.length} / {playerRule.max}{" "}
              {playerRule.max === 1 ? "speler" : "spelers"}
            </span>
          </div>

          <div className="text-[11px] text-neutral-600 mb-2 font-medium">
            {currentGameType.isPenalty ? (
              <span>Tik op wie de schoppen dame of laatste slag kreeg:</span>
            ) : playerRule.type === "duo" ? (
              <span>Tik op <strong>2 spelers</strong> die samen spelen (bieder &amp; maat):</span>
            ) : playerRule.type === "solo" ? (
              <span>Tik op de <strong>ene bieder</strong>:</span>
            ) : (
              <span>Tik op de meespelende speler(s):</span>
            )}
          </div>

          {/* SINGLE GRID OF THE 4 ACTIVE PLAYERS */}
          <div className="grid grid-cols-2 gap-2">
            {activePlayers.map((p) => {
              const isSelected = selectedPlayerIds.includes(p.id);
              const selectionOrder = selectedPlayerIds.indexOf(p.id);

              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleTogglePlayer(p.id)}
                  className={`min-h-[50px] p-2.5 rounded-md border-2 text-left transition-all relative flex flex-col justify-between ${
                    isSelected
                      ? "bg-neutral-900 text-white border-neutral-900 shadow-sm"
                      : "bg-white text-neutral-900 border-neutral-300 hover:border-neutral-900 active:bg-neutral-100"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs sm:text-sm font-black uppercase tracking-wide truncate">
                      {p.name}
                    </span>
                    <span
                      className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        isSelected
                          ? "bg-white text-neutral-900"
                          : "border border-neutral-400 text-transparent"
                      }`}
                    >
                      {isSelected ? "✓" : ""}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] mt-1 font-mono">
                    <span
                      className={
                        isSelected ? "text-neutral-300" : "text-neutral-500"
                      }
                    >
                      Score: {p.score > 0 ? `+${p.score}` : p.score}
                    </span>
                    {isSelected && playerRule.type === "duo" && (
                      <span className="text-[9px] font-bold uppercase tracking-wider text-amber-300">
                        {selectionOrder === 0 ? "Bieder" : "Maat"}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Inactive & Sitting out players indicator */}
          {inactivePlayers.length > 0 && (
            <div className="mt-2.5 pt-2 border-t border-neutral-200">
              <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1 flex items-center gap-1">
                <span>Niet aan tafel deze ronde:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {inactivePlayers.map((p) => {
                  const isDroppedOut = p.isActiveInGame === false;
                  return (
                    <span
                      key={p.id}
                      className="text-[10px] font-bold px-2 py-0.5 rounded border inline-flex items-center gap-1 bg-neutral-100 text-neutral-600 border-neutral-300"
                    >
                      <span>{p.name}</span>
                      <span className="text-[9px] uppercase font-black opacity-85">
                        {isDroppedOut ? "(Afgehaakt)" : "(🧀🍺🚽 Pauze • 0p)"}
                      </span>
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Step C: Slagen & Resultaat (Made it / Lost it) */}
        {!currentGameType.isPenalty && (
          <div className="p-3 bg-white border-2 border-neutral-900 rounded-lg shadow-xs">
            <label className="block text-[11px] font-black uppercase tracking-wider text-neutral-700 mb-2">
              3. Slagen &amp; Resultaat
            </label>

            {/* Troela / Troelalier 3 Quick Buttons */}
            {(currentGameType.id === "troela" || currentGameType.id === "troelalier") && (
              <div className="grid grid-cols-1 gap-1.5">
                {[
                  { id: "10+", label: "10+ slagen gehaald", sub: "+15 pnt voor duo", won: true },
                  { id: "kapot gespeeld", label: "Kapot gespeeld (alle 13 slagen)", sub: "+20 pnt voor duo", won: true },
                  { id: "10-", label: "10- slagen (niet gehaald)", sub: "-15 pnt voor duo", won: false },
                ].map((opt) => {
                  const isSelected = troelaPreset === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setTroelaPreset(opt.id);
                        setIsSuccess(opt.won);
                      }}
                      className={`p-2.5 rounded-md border-2 text-left transition-all ${
                        isSelected
                          ? opt.won
                            ? "bg-emerald-50 border-emerald-600 text-emerald-950 font-bold shadow-2xs"
                            : "bg-red-50 border-red-600 text-red-950 font-bold shadow-2xs"
                          : "bg-white border-neutral-300 hover:border-neutral-900 text-neutral-800"
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span>{opt.label}</span>
                        {isSelected && <span className="text-sm font-black">✓</span>}
                      </div>
                      <div
                        className={`text-[10px] ${
                          opt.won ? "text-emerald-700" : "text-red-700"
                        }`}
                      >
                        {opt.sub}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Trick-based games (Trek /met, Trek alleen 5, 9 alleen, etc.) */}
            {currentGameType.isTrickBased &&
              currentGameType.id !== "troela" &&
              currentGameType.id !== "troelalier" && (
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2">
                    {/* Minus button */}
                    <button
                      type="button"
                      onClick={() => setTricksWon((prev) => Math.max(0, prev - 1))}
                      disabled={tricksWon <= 0}
                      className="w-14 h-12 flex items-center justify-center rounded-md border-2 border-neutral-900 bg-white text-neutral-900 text-xl font-black hover:bg-neutral-100 active:bg-neutral-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
                      aria-label="Eén slag minder"
                    >
                      <Minus className="w-6 h-6" />
                    </button>

                    {/* Central trick count */}
                    <div className="flex-1 flex flex-col items-center justify-center py-2 px-3 bg-neutral-100 rounded-md border-2 border-neutral-900">
                      <div className="flex items-baseline gap-1.5">
                        <span className="mono-score text-3xl font-black text-neutral-900">
                          {tricksWon}
                        </span>
                        <span className="text-xs text-neutral-600 font-bold uppercase">
                          / 13 slagen
                        </span>
                      </div>
                      <div className="text-[11px] font-semibold text-neutral-600">
                        Doel: {currentGameType.targetTricks} slagen
                      </div>
                    </div>

                    {/* Plus button */}
                    <button
                      type="button"
                      onClick={() => setTricksWon((prev) => Math.min(13, prev + 1))}
                      disabled={tricksWon >= 13}
                      className="w-14 h-12 flex items-center justify-center rounded-md border-2 border-neutral-900 bg-white text-neutral-900 text-xl font-black hover:bg-neutral-100 active:bg-neutral-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
                      aria-label="Eén slag meer"
                    >
                      <Plus className="w-6 h-6" />
                    </button>
                  </div>

                  {/* Outcome indicator */}
                  <div className="flex items-center justify-between text-xs px-3 py-1.5 bg-neutral-50 rounded border border-neutral-200">
                    <span className="font-semibold text-neutral-700">Resultaat:</span>
                    <span
                      className={`font-black inline-flex items-center gap-1 ${
                        isSuccess ? "text-emerald-700" : "text-red-700"
                      }`}
                    >
                      {isSuccess ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Gehaald ({tricksWon} slagen)</span>
                        </>
                      ) : (
                        <>
                          <X className="w-4 h-4" />
                          <span>Niet gehaald ({tricksWon} slagen)</span>
                        </>
                      )}
                    </span>
                  </div>
                </div>
              )}

            {/* Non-trick games (Misère, Open Misère, Kaartje Vragen) with Gehaald / Niet gehaald toggle */}
            {!currentGameType.isTrickBased && (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setIsSuccess(true)}
                  className={`py-3 px-3 rounded-md border-2 text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    isSuccess
                      ? "bg-emerald-600 text-white border-emerald-700 shadow-xs"
                      : "bg-white text-neutral-800 border-neutral-300 hover:border-neutral-900"
                  }`}
                >
                  <Check className="w-4 h-4" />
                  <span>Gehaald (0 slagen)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsSuccess(false)}
                  className={`py-3 px-3 rounded-md border-2 text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    !isSuccess
                      ? "bg-red-600 text-white border-red-700 shadow-xs"
                      : "bg-white text-neutral-800 border-neutral-300 hover:border-neutral-900"
                  }`}
                >
                  <X className="w-4 h-4" />
                  <span>Niet gehaald</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step D: Live Score Preview */}
        <div className="p-2.5 bg-neutral-100 border-2 border-neutral-300 rounded-lg">
          <div className="flex items-center justify-between text-[11px] font-bold text-neutral-600 mb-1 uppercase tracking-wide">
            <span>Score Wijziging Voorvertoning:</span>
            {preview.isValid && (
              <span className="font-mono text-[10px] text-neutral-500">
                Som: {preview.changes.reduce((a, b) => a + b, 0)}
              </span>
            )}
          </div>

          {preview.isValid ? (
            <div
              className={`grid gap-1 text-center font-mono text-xs ${
                players.length <= 4
                  ? "grid-cols-2 sm:grid-cols-4"
                  : players.length === 5
                  ? "grid-cols-2 sm:grid-cols-5"
                  : "grid-cols-2 sm:grid-cols-3"
              }`}
            >
              {players.map((p, idx) => {
                const delta = preview.changes[idx];
                const isPos = delta > 0;
                const isNeg = delta < 0;
                const isSitting = sittingOutIds.includes(p.id);
                const isDropped = p.isActiveInGame === false;

                return (
                  <div
                    key={p.id}
                    className={`py-1 px-1 rounded border ${
                      isDropped
                        ? "bg-neutral-200 border-neutral-300 text-neutral-400"
                        : isSitting
                        ? "bg-neutral-100 border-neutral-200 text-neutral-500"
                        : isPos
                        ? "bg-emerald-50 border-emerald-300 text-emerald-800 font-bold"
                        : isNeg
                        ? "bg-red-50 border-red-300 text-red-800 font-bold"
                        : "bg-white border-neutral-200 text-neutral-600"
                    }`}
                  >
                    <div className="text-[10px] text-neutral-600 truncate uppercase">
                      {p.name}
                    </div>
                    <div className="text-xs sm:text-sm font-black">
                      {isDropped
                        ? "0 (Af)"
                        : isSitting
                        ? "0 (🧀🍺)"
                        : isPos
                        ? `+${delta}`
                        : delta}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-amber-800 bg-amber-50 p-2 rounded border border-amber-200">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>{preview.message}</span>
            </div>
          )}
        </div>
      </div>

      {/* 3. Fixed Bottom Action Bar: 'Ronde X Toevoegen' Button */}
      <footer className="shrink-0 p-3 bg-white border-t-2 border-neutral-900 shadow-lg">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!isPlayerSelectionValid || !preview.isValid}
          className={`w-full py-3 px-4 rounded-md text-xs sm:text-sm font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
            isPlayerSelectionValid && preview.isValid
              ? "bg-neutral-900 text-white border-2 border-neutral-900 hover:bg-neutral-800 active:bg-black active:translate-y-0.5 shadow-sm"
              : "bg-neutral-200 text-neutral-400 border-2 border-neutral-300 cursor-not-allowed"
          }`}
        >
          {isPlayerSelectionValid ? (
            <>
              <span>Ronde {currentRound} Toevoegen</span>
              <span className="text-base font-normal">➔</span>
            </>
          ) : (
            <>
              <ShieldAlert className="w-4 h-4 text-neutral-400" />
              <span>{preview.message || "Selecteer spelers"}</span>
            </>
          )}
        </button>
      </footer>
    </div>
  );
}
