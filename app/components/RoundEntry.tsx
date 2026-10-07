"use client";
import React, { useState, useEffect, useMemo } from "react";
import { Player } from "../lib/types";
import { FAMILY_GAME_TYPES, CLASSIC_RIKKEN_GAME_TYPES, GameType } from "../lib/gameTypes";
import { calculateRoundScores } from "../lib/scoring";
import { Plus, Minus, Check, X, Users, AlertCircle } from "lucide-react";

interface RoundEntryProps {
  players: Player[];
  dealerIndex: number;
  currentRound: number;
  ruleset: "family" | "classic";
  onAddRound: (roundData: {
    bid: string;
    bidderId: number;
    partnerIds: number[];
    tricksMade?: number | string;
    success: boolean;
    changes: number[];
    summary: string;
  }) => void;
}

export default function RoundEntry({
  players,
  dealerIndex,
  currentRound,
  ruleset,
  onAddRound,
}: RoundEntryProps) {
  // Available games based on ruleset
  const availableGameTypes = useMemo(() => {
    return ruleset === "family"
      ? [...FAMILY_GAME_TYPES, ...CLASSIC_RIKKEN_GAME_TYPES]
      : [...CLASSIC_RIKKEN_GAME_TYPES, ...FAMILY_GAME_TYPES];
  }, [ruleset]);

  const [selectedBidId, setSelectedBidId] = useState<string>("trek_met");
  const [bidderId, setBidderId] = useState<number | null>(null);
  const [partnerIds, setPartnerIds] = useState<number[]>([]);
  const [tricksWon, setTricksWon] = useState<number>(8);
  const [troelaPreset, setTroelaPreset] = useState<string>("10+");
  const [isSuccess, setIsSuccess] = useState<boolean>(true);
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);

  // Current active game type object
  const currentGameType: GameType = useMemo(() => {
    return (
      availableGameTypes.find((g) => g.id === selectedBidId) ||
      FAMILY_GAME_TYPES[0]
    );
  }, [availableGameTypes, selectedBidId]);

  // Adjust default tricks/settings when bid changes
  useEffect(() => {
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

    // Reset partner if the bid does not allow one
    if (!currentGameType.requiresPartner && !currentGameType.allowsPartner && !currentGameType.isPenalty) {
      setPartnerIds([]);
    }
  }, [currentGameType]);

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
    } else if (currentGameType.id === "rik_classic" || currentGameType.id === "betere_rik_classic") {
      setIsSuccess(tricksWon >= 8);
    }
  }, [tricksWon, troelaPreset, currentGameType]);

  // Partner selection toggle
  const togglePartner = (id: number) => {
    if (currentGameType.isPenalty) {
      // For penalty (schoppen dame), up to 2 players can be selected
      setPartnerIds((prev) => {
        if (prev.includes(id)) {
          return prev.filter((p) => p !== id);
        }
        if (prev.length >= 2) {
          return [prev[1], id];
        }
        return [...prev, id];
      });
    } else {
      // Single partner
      setPartnerIds((prev) => (prev.includes(id) ? [] : [id]));
    }
  };

  // Determine current tricks value
  const currentTricksValue: string | number = useMemo(() => {
    if (currentGameType.id === "troela" || currentGameType.id === "troelalier") {
      return troelaPreset;
    }
    return tricksWon;
  }, [currentGameType, troelaPreset, tricksWon]);

  // Live score calculation preview
  const preview = useMemo(() => {
    const idToIndex = Object.fromEntries(players.map((p, i) => [p.id, i]));
    const effectiveBidderIdx = bidderId !== null ? idToIndex[bidderId] : -1;
    const effectivePartnerIndices = partnerIds.map((id) => idToIndex[id]).filter((i) => i !== undefined);

    if (effectiveBidderIdx < 0 && !currentGameType.isPenalty) {
      return {
        changes: new Array(players.length).fill(0),
        isValid: false,
        message: "Kies wie er heeft geboden",
      };
    }

    if (currentGameType.requiresPartner && partnerIds.length === 0) {
      return {
        changes: new Array(players.length).fill(0),
        isValid: false,
        message: "Kies een maat / partner",
      };
    }

    if (currentGameType.isPenalty && partnerIds.length === 0 && bidderId === null) {
      return {
        changes: new Array(players.length).fill(0),
        isValid: false,
        message: "Kies wie de schoppen dame / laatste slag kreeg",
      };
    }

    const changes = calculateRoundScores(
      currentGameType.name,
      isSuccess,
      0,
      players,
      effectiveBidderIdx >= 0 ? effectiveBidderIdx : 0,
      effectivePartnerIndices,
      players.map((p) => p.id),
      currentTricksValue,
      false,
      partnerIds
    );

    return {
      changes,
      isValid: true,
      message: "",
    };
  }, [players, bidderId, partnerIds, currentGameType, isSuccess, currentTricksValue]);

  // Submit round
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!preview.isValid) return;

    const bidder = players.find((p) => p.id === bidderId);
    const partners = partnerIds.map((id) => players.find((p) => p.id === id)?.name).filter(Boolean);

    let summary = "";
    if (currentGameType.isPenalty) {
      const penalizedNames = partnerIds.map((id) => players.find((p) => p.id === id)?.name).filter(Boolean);
      summary = `Boete voor ${penalizedNames.join(" & ")}`;
    } else {
      const team = partners.length > 0 ? `${bidder?.name} & ${partners.join(" & ")}` : (bidder?.name || "Bieder");
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
      bidderId: bidderId ?? (partnerIds[0] ?? 0),
      partnerIds,
      tricksMade: currentTricksValue,
      success: isSuccess,
      changes: preview.changes,
      summary,
    });

    // Reset for next round
    setBidderId(null);
    setPartnerIds([]);
    setShowConfirmation(true);
    setTimeout(() => setShowConfirmation(false), 2000);
  };

  return (
    <div className="rikken-card p-3 sm:p-4 mb-3 border-2 border-neutral-900 shadow-sm">
      <div className="flex items-center justify-between pb-2 mb-3 border-b border-neutral-200">
        <h2 className="text-xs font-black tracking-wider text-neutral-900 uppercase flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block animate-pulse" />
          Ronde {currentRound} Invoeren
        </h2>
        <span className="text-[11px] text-neutral-500 font-medium">
          Deler: {players[dealerIndex]?.name}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Step 1: Bieding Kiezen (Dropdown) */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 mb-1">
            1. Bieding / Speltype
          </label>
          <div className="relative">
            <select
              value={selectedBidId}
              onChange={(e) => setSelectedBidId(e.target.value)}
              className="w-full bg-white border-2 border-neutral-900 rounded-md py-2 px-3 text-xs sm:text-sm font-bold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900 appearance-none cursor-pointer"
            >
              <optgroup label="Familieregels Biedingen">
                {FAMILY_GAME_TYPES.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name} ({g.basePoints}p)
                  </option>
                ))}
              </optgroup>
              <optgroup label="Klassiek Rikken Biedingen">
                {CLASSIC_RIKKEN_GAME_TYPES.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name} ({g.basePoints}p)
                  </option>
                ))}
              </optgroup>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-neutral-700">
              ▼
            </div>
          </div>
          <p className="mt-1 text-[11px] text-neutral-500 italic leading-snug">
            {currentGameType.description}
          </p>
        </div>

        {/* Step 2: Bieder / Initiator */}
        {!currentGameType.isPenalty && (
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 mb-1">
              2. Wie Biedt / Speelt?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {players.map((p) => {
                const isSelected = bidderId === p.id;
                const isPartner = partnerIds.includes(p.id);

                return (
                  <button
                    key={p.id}
                    type="button"
                    disabled={isPartner}
                    onClick={() => setBidderId(p.id)}
                    className={`py-2 px-2.5 rounded-md border-2 text-xs font-bold transition-all text-center truncate ${
                      isSelected
                        ? "bg-neutral-900 text-white border-neutral-900 shadow-xs"
                        : isPartner
                        ? "bg-neutral-100 text-neutral-400 border-neutral-200 cursor-not-allowed"
                        : "bg-white text-neutral-800 border-neutral-300 hover:border-neutral-900 active:bg-neutral-100"
                    }`}
                  >
                    {isSelected ? "🏆 " : ""}
                    {p.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3: Partner / Maat Kiezen (if applicable) */}
        {(currentGameType.requiresPartner || currentGameType.allowsPartner || currentGameType.isPenalty) && (
          <div className="p-2.5 bg-neutral-50 rounded-md border border-neutral-200">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-700 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-neutral-600" />
                {currentGameType.isPenalty
                  ? "Schoppen Dame / Laatste Slag Ontvangers"
                  : "Kies Maat / Partner"}
              </label>
              {currentGameType.requiresPartner && partnerIds.length === 0 && (
                <span className="text-[10px] font-bold text-red-600 uppercase">Verplicht</span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {players.map((p) => {
                const isBidder = bidderId === p.id;
                const isSelected = partnerIds.includes(p.id);

                return (
                  <button
                    key={p.id}
                    type="button"
                    disabled={isBidder && !currentGameType.isPenalty}
                    onClick={() => togglePartner(p.id)}
                    className={`py-1.5 px-2 rounded-md border-2 text-xs font-bold transition-all text-center truncate ${
                      isSelected
                        ? "bg-amber-100 text-amber-950 border-amber-600 shadow-2xs font-extrabold"
                        : isBidder && !currentGameType.isPenalty
                        ? "bg-neutral-100 text-neutral-400 border-neutral-200 cursor-not-allowed"
                        : "bg-white text-neutral-700 border-neutral-300 hover:border-neutral-900"
                    }`}
                  >
                    {isSelected ? "🤝 " : ""}
                    {p.name}
                  </button>
                );
              })}
            </div>
            {currentGameType.isPenalty && (
              <p className="mt-1 text-[10px] text-neutral-500">
                1 speler (-15p voor bieder/speler, +5p anderen) • 2 spelers (-5p elk, +5p anderen)
              </p>
            )}
          </div>
        )}

        {/* Step 4: Slagen / Resultaat */}
        {!currentGameType.isPenalty && (
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 mb-1">
              3. Resultaat / Slagen
            </label>

            {/* Troela / Troelalier Quick Presets */}
            {(currentGameType.id === "troela" || currentGameType.id === "troelalier") && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                {[
                  { id: "10+", label: "10+ slagen", sub: "+15 pnt", won: true },
                  { id: "kapot gespeeld", label: "Kapot (13 slagen)", sub: "+20 pnt", won: true },
                  { id: "10-", label: "10- slagen", sub: "-15 pnt (verloren)", won: false },
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
                      className={`p-2 rounded-md border-2 text-left transition-all ${
                        isSelected
                          ? opt.won
                            ? "bg-emerald-50 border-emerald-600 text-emerald-950 font-bold"
                            : "bg-red-50 border-red-600 text-red-950 font-bold"
                          : "bg-white border-neutral-300 hover:border-neutral-900 text-neutral-800"
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span>{opt.label}</span>
                        {isSelected && <span>✓</span>}
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

            {/* Trick-based games (Trek /met, Trek alleen 5, 9 alleen, Rik, etc.) with +/- Stepper */}
            {currentGameType.isTrickBased &&
              currentGameType.id !== "troela" &&
              currentGameType.id !== "troelalier" && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {/* Minus button */}
                    <button
                      type="button"
                      onClick={() => setTricksWon((prev) => Math.max(0, prev - 1))}
                      disabled={tricksWon <= 0}
                      className="w-12 h-11 flex items-center justify-center rounded-md border-2 border-neutral-900 bg-white text-neutral-900 text-xl font-black hover:bg-neutral-100 active:bg-neutral-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
                      aria-label="Eén slag minder"
                    >
                      <Minus className="w-5 h-5" />
                    </button>

                    {/* Central display with trick counter */}
                    <div className="flex-1 flex flex-col items-center justify-center py-1.5 px-3 bg-neutral-100 rounded-md border-2 border-neutral-900">
                      <div className="flex items-baseline gap-1.5">
                        <span className="mono-score text-2xl font-black text-neutral-900">
                          {tricksWon}
                        </span>
                        <span className="text-xs text-neutral-600 font-semibold uppercase">
                          / 13 slagen
                        </span>
                      </div>
                      <div className="text-[11px] font-medium text-neutral-600">
                        Doel: {currentGameType.targetTricks} slagen
                      </div>
                    </div>

                    {/* Plus button */}
                    <button
                      type="button"
                      onClick={() => setTricksWon((prev) => Math.min(13, prev + 1))}
                      disabled={tricksWon >= 13}
                      className="w-12 h-11 flex items-center justify-center rounded-md border-2 border-neutral-900 bg-white text-neutral-900 text-xl font-black hover:bg-neutral-100 active:bg-neutral-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
                      aria-label="Eén slag meer"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Outcome pill */}
                  <div className="flex items-center justify-between text-xs px-2 py-1 bg-white rounded border border-neutral-200">
                    <span className="font-semibold text-neutral-700">Status:</span>
                    <span
                      className={`font-bold inline-flex items-center gap-1 ${
                        isSuccess ? "text-emerald-700" : "text-red-700"
                      }`}
                    >
                      {isSuccess ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Gewonnen ({tricksWon} slagen)</span>
                        </>
                      ) : (
                        <>
                          <X className="w-3.5 h-3.5" />
                          <span>Verloren ({tricksWon} slagen)</span>
                        </>
                      )}
                    </span>
                  </div>
                </div>
              )}

            {/* Non-trick games (Misère, Open Misère, Kaartje Vragen) with Win / Loss toggle */}
            {!currentGameType.isTrickBased && (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setIsSuccess(true)}
                  className={`py-2 px-3 rounded-md border-2 text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    isSuccess
                      ? "bg-emerald-600 text-white border-emerald-700 shadow-xs"
                      : "bg-white text-neutral-800 border-neutral-300 hover:border-neutral-900"
                  }`}
                >
                  <Check className="w-4 h-4" />
                  <span>Gewonnen (0 slagen)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsSuccess(false)}
                  className={`py-2 px-3 rounded-md border-2 text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    !isSuccess
                      ? "bg-red-600 text-white border-red-700 shadow-xs"
                      : "bg-white text-neutral-800 border-neutral-300 hover:border-neutral-900"
                  }`}
                >
                  <X className="w-4 h-4" />
                  <span>Verloren (slag gehaald)</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step 5: Live Score Preview */}
        <div className="p-2.5 bg-neutral-100 rounded-md border border-neutral-300">
          <div className="flex items-center justify-between text-[11px] font-bold text-neutral-600 mb-1 uppercase tracking-wide">
            <span>Score Wijziging Voorvertoning:</span>
            {preview.isValid && (
              <span className="font-mono text-neutral-500">
                Som: {preview.changes.reduce((a, b) => a + b, 0)}
              </span>
            )}
          </div>

          {preview.isValid ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 text-center font-mono text-xs">
              {players.map((p, idx) => {
                const delta = preview.changes[idx];
                const isPos = delta > 0;
                const isNeg = delta < 0;

                return (
                  <div
                    key={p.id}
                    className={`py-1 px-1 rounded border ${
                      isPos
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
                      {isPos ? `+${delta}` : delta}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-amber-800 bg-amber-50 p-1.5 rounded border border-amber-200">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>{preview.message}</span>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!preview.isValid}
          className="w-full py-2.5 px-4 rounded-md text-xs sm:text-sm font-black uppercase tracking-wider text-white bg-neutral-900 border-2 border-neutral-900 hover:bg-neutral-800 active:bg-black active:translate-y-0.5 disabled:bg-neutral-300 disabled:border-neutral-300 disabled:text-neutral-500 disabled:cursor-not-allowed transition-all shadow-xs flex items-center justify-center gap-2"
        >
          <span>Ronde {currentRound} Toevoegen</span>
          <span className="text-base font-normal">➔</span>
        </button>

        {showConfirmation && (
          <div className="text-center text-xs font-bold text-emerald-700 bg-emerald-50 py-1.5 rounded border border-emerald-300">
            ✓ Ronde succesvol toegevoegd!
          </div>
        )}
      </form>
    </div>
  );
}
