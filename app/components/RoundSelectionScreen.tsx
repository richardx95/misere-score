"use client";
import React, { useState, useEffect, useMemo } from "react";
import { Player } from "../lib/types";
import { MISERE_GAME_TYPES, GameType } from "../lib/gameTypes";
import { calculateRoundScores } from "../lib/scoring";
import { getRoundActivePlayerIds } from "../lib/rotation";
import {
  ArrowLeft,
  Check,
  X,
  Plus,
  Minus,
  AlertCircle,
  ShieldAlert,
  ChevronRight,
  RotateCcw,
} from "lucide-react";

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
  // 3-step flow: 1. Kies bieding, 2. Wie speelt er, 3. Resultaat / slagen
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Available games in strict order: Trek/met down to 13 alleen
  const availableGameTypes = MISERE_GAME_TYPES;

  // Active 4 players for this round
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

  // Selected bid ID
  const [selectedBidId, setSelectedBidId] = useState<string>("trek_met");
  // Player selection
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<number[]>([]);
  // Tricks & success
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

  // Player selection rules for the chosen bid
  const playerRule = useMemo(() => {
    if (currentGameType.isPenalty) {
      return { min: 1, max: 2, label: "1 of 2 spelers (straf)", type: "penalty" };
    }
    if (currentGameType.id === "kaartje_vragen") {
      return { min: 1, max: 2, label: "1 of 2 spelers (solo of maat)", type: "flexible" };
    }
    if (currentGameType.isMisere) {
      return { min: 1, max: 3, label: "1 t/m 3 spelers (Misère)", type: "misere" };
    }
    if (currentGameType.requiresPartner) {
      return { min: 2, max: 2, label: "Precies 2 spelers (Duo)", type: "duo" };
    }
    // Solo
    return { min: 1, max: 1, label: "Precies 1 speler (Solo)", type: "solo" };
  }, [currentGameType]);

  // Reset or adjust when bid changes
  useEffect(() => {
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

  // Handle direct tap on bid in Step 1
  const handleSelectBid = (bidId: string) => {
    setSelectedBidId(bidId);
    // Directly move to Step 2!
    setCurrentStep(2);
  };

  // Toggle active player selection in Step 2
  const handleTogglePlayer = (id: number) => {
    if (selectedPlayerIds.includes(id)) {
      setSelectedPlayerIds(selectedPlayerIds.filter((pId) => pId !== id));
    } else {
      if (playerRule.max === 1) {
        setSelectedPlayerIds([id]);
      } else if (selectedPlayerIds.length < playerRule.max) {
        setSelectedPlayerIds([...selectedPlayerIds, id]);
      } else {
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

  // Handle final submit round
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

  return (
    <div className="flex flex-col h-[100dvh] max-w-md mx-auto bg-[#f8f9fa] border-x border-neutral-300 shadow-xl overflow-hidden">
      {/* 1. Top Bar */}
      <header className="shrink-0 px-3 py-2.5 bg-white border-b-2 border-neutral-900 flex items-center justify-between">
        <button
          type="button"
          onClick={() => {
            if (currentStep === 1) onBack();
            else if (currentStep === 2) setCurrentStep(1);
            else if (currentStep === 3) setCurrentStep(2);
          }}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-neutral-800 bg-neutral-100 border border-neutral-300 rounded hover:bg-neutral-200 active:bg-neutral-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{currentStep === 1 ? "Terug" : "Vorige"}</span>
        </button>

        <div className="text-center">
          <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 block">
            Ronde {currentRound}
          </span>
          <h1 className="text-xs sm:text-sm font-black uppercase tracking-wide text-neutral-900">
            {currentStep === 1
              ? "1. Bieding Kiezen"
              : currentStep === 2
              ? "2. Wie Speelt Er?"
              : "3. Slagen & Resultaat"}
          </h1>
        </div>

        {/* Step Indicator Pills */}
        <div className="flex items-center gap-1 font-mono text-[10px] font-black">
          {[1, 2, 3].map((step) => (
            <span
              key={step}
              className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                currentStep === step
                  ? "bg-neutral-900 text-white border-neutral-900 shadow-2xs"
                  : currentStep > step
                  ? "bg-emerald-100 text-emerald-800 border-emerald-400"
                  : "bg-neutral-100 text-neutral-400 border-neutral-300"
              }`}
            >
              {currentStep > step ? "✓" : step}
            </span>
          ))}
        </div>
      </header>

      {/* 2. Body based on current step */}
      <div className="flex-1 min-h-0 overflow-y-auto p-3">
        {/* ========================================================= */}
        {/* STAP 1: KIES EEN BIEDING (Geen dropdown, directe selectie) */}
        {/* ========================================================= */}
        {currentStep === 1 && (
          <div className="space-y-2">
            <div className="p-2.5 bg-neutral-100 rounded-lg border border-neutral-300 mb-2">
              <span className="text-xs font-black uppercase text-neutral-800 block">
                Kies de gespeelde bieding:
              </span>
              <span className="text-[11px] text-neutral-500">
                Gerangschikt van laag (bovenaan) naar hoog (onderaan)
              </span>
            </div>

            {/* List of 10 Bids */}
            <div className="space-y-1.5">
              {availableGameTypes.map((g, idx) => {
                const isCurrent = selectedBidId === g.id;

                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => handleSelectBid(g.id)}
                    className={`w-full p-2.5 sm:p-3 rounded-lg border-2 text-left transition-all flex items-center justify-between ${
                      isCurrent
                        ? "bg-neutral-900 text-white border-neutral-900 shadow-xs"
                        : "bg-white text-neutral-900 border-neutral-300 hover:border-neutral-900 active:bg-neutral-100"
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-5 h-5 rounded flex items-center justify-center font-mono text-[10px] font-black ${
                            isCurrent
                              ? "bg-white text-neutral-900"
                              : "bg-neutral-100 text-neutral-600"
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <span className="text-xs sm:text-sm font-black uppercase tracking-wide truncate">
                          {g.name}
                        </span>
                      </div>
                      <p
                        className={`text-[11px] mt-0.5 truncate pl-7 ${
                          isCurrent ? "text-neutral-300" : "text-neutral-500"
                        }`}
                      >
                        {g.description}
                      </p>
                    </div>

                    <div className="shrink-0 flex items-center gap-1.5 pl-1">
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          isCurrent
                            ? "bg-neutral-800 text-neutral-200"
                            : "bg-neutral-100 text-neutral-700"
                        }`}
                      >
                        {g.basePoints}p
                      </span>
                      <ChevronRight
                        className={`w-4 h-4 ${
                          isCurrent ? "text-white" : "text-neutral-400"
                        }`}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STAP 2: WIE SPEELT ER? (Selecteer spelers in enkel raster) */}
        {/* ========================================================= */}
        {currentStep === 2 && (
          <div className="space-y-3">
            {/* Selected Bid Reminder Card */}
            <div className="p-2.5 bg-white rounded-lg border-2 border-neutral-900 flex items-center justify-between shadow-2xs">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">
                  Gekozen Bieding:
                </span>
                <span className="text-xs sm:text-sm font-black uppercase text-neutral-900">
                  {currentGameType.name} ({currentGameType.basePoints}p)
                </span>
              </div>
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="py-1 px-2.5 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 rounded text-[11px] font-bold text-neutral-800 transition-colors"
              >
                Wijzig
              </button>
            </div>

            {/* Instruction banner */}
            <div className="p-3 bg-white border-2 border-neutral-900 rounded-lg shadow-xs">
              <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-neutral-200">
                <span className="text-xs font-black uppercase text-neutral-800">
                  Selecteer speler(s):
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                    isPlayerSelectionValid
                      ? "bg-emerald-50 text-emerald-800 border-emerald-300 font-bold"
                      : "bg-neutral-100 text-neutral-700 border-neutral-300"
                  }`}
                >
                  {selectedPlayerIds.length} / {playerRule.max}{" "}
                  {playerRule.max === 1 ? "speler" : "spelers"}
                </span>
              </div>

              <div className="text-[11px] text-neutral-600 mb-3 font-medium">
                {currentGameType.isPenalty ? (
                  <span>Tik op wie de schoppen dame of laatste slag kreeg:</span>
                ) : playerRule.type === "duo" ? (
                  <span>Tik op <strong>2 spelers</strong> die samen spelen (bieder &amp; maat):</span>
                ) : playerRule.type === "solo" ? (
                  <span>Tik op de <strong>ene solo bieder</strong>:</span>
                ) : (
                  <span>Tik op de meespelende speler(s):</span>
                )}
              </div>

              {/* Single Grid of the 4 Active Players */}
              <div className="grid grid-cols-2 gap-2">
                {activePlayers.map((p) => {
                  const isSelected = selectedPlayerIds.includes(p.id);
                  const selectionOrder = selectedPlayerIds.indexOf(p.id);

                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleTogglePlayer(p.id)}
                      className={`min-h-[56px] p-2.5 rounded-lg border-2 text-left transition-all relative flex flex-col justify-between ${
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

                      <div className="flex items-center justify-between text-[10px] mt-1.5 font-mono">
                        <span
                          className={
                            isSelected ? "text-neutral-300" : "text-neutral-500"
                          }
                        >
                          {p.score > 0 ? `+${p.score}` : p.score} pnt
                        </span>
                        {isSelected && playerRule.type === "duo" && (
                          <span className="text-[9px] font-black uppercase tracking-wider text-amber-300">
                            {selectionOrder === 0 ? "Bieder" : "Maat"}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Sitting out players list */}
              {inactivePlayers.length > 0 && (
                <div className="mt-3 pt-2 border-t border-neutral-200">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                    Niet aan tafel deze ronde:
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
          </div>
        )}

        {/* ========================================================= */}
        {/* STAP 3: RESULTAAT / SLAGEN & SCORE VOORVERTONING          */}
        {/* ========================================================= */}
        {currentStep === 3 && (
          <div className="space-y-3">
            {/* Quick Recap of Bid and Players */}
            <div className="p-2.5 bg-white rounded-lg border-2 border-neutral-900 flex items-center justify-between shadow-2xs">
              <div>
                <div className="text-xs font-black uppercase text-neutral-900">
                  {currentGameType.name}
                </div>
                <div className="text-[11px] text-neutral-600 font-bold">
                  Spelers:{" "}
                  {selectedPlayerIds
                    .map((id) => players.find((p) => p.id === id)?.name)
                    .filter(Boolean)
                    .join(" & ") || "Niemand"}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="py-1 px-2 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 rounded text-[11px] font-bold text-neutral-800 transition-colors"
              >
                Spelers Wijzigen
              </button>
            </div>

            {/* Slagen / Resultaat Selector */}
            {!currentGameType.isPenalty && (
              <div className="p-3 bg-white border-2 border-neutral-900 rounded-lg shadow-xs">
                <label className="block text-xs font-black uppercase tracking-wider text-neutral-800 mb-2">
                  Wat is het resultaat?
                </label>

                {/* Troela / Troelalier 3 Quick Buttons */}
                {(currentGameType.id === "troela" || currentGameType.id === "troelalier") && (
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { id: "10+", label: "10+ slagen gehaald", sub: "+15 pnt voor bieder & maat", won: true },
                      { id: "kapot gespeeld", label: "Kapot gespeeld (13 slagen)", sub: "+20 pnt voor bieder & maat", won: true },
                      { id: "10-", label: "10- slagen (verloren)", sub: "-15 pnt voor bieder & maat", won: false },
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
                          className={`p-2.5 rounded-lg border-2 text-left transition-all ${
                            isSelected
                              ? opt.won
                                ? "bg-emerald-50 border-emerald-600 text-emerald-950 font-bold shadow-2xs"
                                : "bg-red-50 border-red-600 text-red-950 font-bold shadow-2xs"
                              : "bg-white border-neutral-300 hover:border-neutral-900 text-neutral-800"
                          }`}
                        >
                          <div className="flex items-center justify-between text-xs font-black uppercase">
                            <span>{opt.label}</span>
                            {isSelected && <span className="text-sm">✓</span>}
                          </div>
                          <div
                            className={`text-[10px] mt-0.5 ${
                              opt.won ? "text-emerald-700 font-bold" : "text-red-700 font-bold"
                            }`}
                          >
                            {opt.sub}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Trick-based games (Trek /met, Trek 5 alleen, 9 alleen, 13 alleen) */}
                {currentGameType.isTrickBased &&
                  currentGameType.id !== "troela" &&
                  currentGameType.id !== "troelalier" && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        {/* Minus button */}
                        <button
                          type="button"
                          onClick={() => setTricksWon((prev) => Math.max(0, prev - 1))}
                          disabled={tricksWon <= 0}
                          className="w-14 h-12 flex items-center justify-center rounded-lg border-2 border-neutral-900 bg-white text-neutral-900 text-xl font-black hover:bg-neutral-100 active:bg-neutral-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
                          aria-label="Eén slag minder"
                        >
                          <Minus className="w-6 h-6" />
                        </button>

                        {/* Central trick count */}
                        <div className="flex-1 flex flex-col items-center justify-center py-2 px-3 bg-neutral-100 rounded-lg border-2 border-neutral-900">
                          <div className="flex items-baseline gap-1.5">
                            <span className="mono-score text-3xl font-black text-neutral-900">
                              {tricksWon}
                            </span>
                            <span className="text-xs text-neutral-600 font-bold uppercase">
                              / 13 slagen
                            </span>
                          </div>
                          <div className="text-[11px] font-bold text-neutral-600">
                            Doel: {currentGameType.targetTricks} slagen
                          </div>
                        </div>

                        {/* Plus button */}
                        <button
                          type="button"
                          onClick={() => setTricksWon((prev) => Math.min(13, prev + 1))}
                          disabled={tricksWon >= 13}
                          className="w-14 h-12 flex items-center justify-center rounded-lg border-2 border-neutral-900 bg-white text-neutral-900 text-xl font-black hover:bg-neutral-100 active:bg-neutral-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
                          aria-label="Eén slag meer"
                        >
                          <Plus className="w-6 h-6" />
                        </button>
                      </div>

                      {/* Outcome indicator */}
                      <div className="flex items-center justify-between text-xs px-3 py-2 bg-neutral-50 rounded-md border border-neutral-300">
                        <span className="font-bold text-neutral-700">Status:</span>
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

                {/* Non-trick games (Misère, Open Misère, Kaartje Vragen) */}
                {!currentGameType.isTrickBased && (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setIsSuccess(true)}
                      className={`py-3.5 px-3 rounded-lg border-2 text-xs font-black uppercase flex items-center justify-center gap-1.5 transition-all ${
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
                      className={`py-3.5 px-3 rounded-lg border-2 text-xs font-black uppercase flex items-center justify-center gap-1.5 transition-all ${
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

            {/* Score Delta Preview Card */}
            <div className="p-3 bg-neutral-100 border-2 border-neutral-300 rounded-lg">
              <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wide text-neutral-700 mb-2">
                <span>Scoreverdeling deze ronde:</span>
                {preview.isValid && (
                  <span className="font-mono text-[10px] text-neutral-500 font-bold">
                    Som: {preview.changes.reduce((a, b) => a + b, 0)}
                  </span>
                )}
              </div>

              {preview.isValid ? (
                <div
                  className={`grid gap-1.5 text-center font-mono text-xs ${
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
                        className={`py-1.5 px-1 rounded-md border ${
                          isDropped
                            ? "bg-neutral-200 border-neutral-300 text-neutral-400"
                            : isSitting
                            ? "bg-neutral-100 border-neutral-200 text-neutral-500"
                            : isPos
                            ? "bg-emerald-50 border-emerald-300 text-emerald-800 font-black"
                            : isNeg
                            ? "bg-red-50 border-red-300 text-red-800 font-black"
                            : "bg-white border-neutral-200 text-neutral-600"
                        }`}
                      >
                        <div className="text-[10px] text-neutral-600 truncate uppercase font-bold">
                          {p.name}
                        </div>
                        <div className="text-xs sm:text-sm font-black mt-0.5">
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
        )}
      </div>

      {/* 3. Bottom Action Bar */}
      <footer className="shrink-0 p-3 bg-white border-t-2 border-neutral-900 shadow-lg">
        {currentStep === 1 && (
          <button
            type="button"
            onClick={onBack}
            className="w-full py-2.5 px-4 rounded-lg text-xs font-bold uppercase tracking-wider text-neutral-700 bg-neutral-100 border-2 border-neutral-300 hover:bg-neutral-200 transition-colors"
          >
            Annuleren
          </button>
        )}

        {currentStep === 2 && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="py-3 px-3 rounded-lg text-xs font-bold uppercase tracking-wider text-neutral-700 bg-white border-2 border-neutral-300 hover:bg-neutral-100"
            >
              Vorige
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              disabled={!isPlayerSelectionValid}
              className={`flex-1 py-3 px-4 rounded-lg text-xs sm:text-sm font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                isPlayerSelectionValid
                  ? "bg-neutral-900 text-white border-2 border-neutral-900 hover:bg-neutral-800 active:bg-black shadow-xs"
                  : "bg-neutral-200 text-neutral-400 border-2 border-neutral-300 cursor-not-allowed"
              }`}
            >
              <span>Volgende: Resultaat</span>
              <span className="text-base font-normal">➔</span>
            </button>
          </div>
        )}

        {currentStep === 3 && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="py-3 px-3 rounded-lg text-xs font-bold uppercase tracking-wider text-neutral-700 bg-white border-2 border-neutral-300 hover:bg-neutral-100"
            >
              Vorige
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!isPlayerSelectionValid || !preview.isValid}
              className={`flex-1 py-3 px-4 rounded-lg text-xs sm:text-sm font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                isPlayerSelectionValid && preview.isValid
                  ? "bg-emerald-700 text-white border-2 border-emerald-800 hover:bg-emerald-800 active:bg-emerald-900 shadow-xs"
                  : "bg-neutral-200 text-neutral-400 border-2 border-neutral-300 cursor-not-allowed"
              }`}
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Ronde {currentRound} Toevoegen</span>
            </button>
          </div>
        )}
      </footer>
    </div>
  );
}
