"use client";
import React, { useState, useMemo } from "react";
import { Player, Round } from "../lib/types";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { ListFilter, TrendingUp, RotateCcw, AlertTriangle, ArrowLeft } from "lucide-react";

interface HistoryScreenProps {
  players: Player[];
  rounds: Round[];
  onUndoLastRound: () => void;
  onBack: () => void;
}

const PLAYER_COLORS = [
  "#16a34a", // Emerald Green
  "#2563eb", // Royal Blue
  "#dc2626", // Crimson Red
  "#9333ea", // Purple
  "#ea580c", // Orange
  "#0891b2", // Cyan
];

export default function HistoryScreen({
  players,
  rounds,
  onUndoLastRound,
  onBack,
}: HistoryScreenProps) {
  const [viewMode, setViewMode] = useState<"list" | "graph">("list");
  const [confirmUndo, setConfirmUndo] = useState(false);

  // Generate data for the scoring progression graph
  const graphData = useMemo(() => {
    const initialPoint: Record<string, number | string> = { round: 0 };
    players.forEach((p) => {
      initialPoint[p.name] = 0;
    });

    const data: Record<string, number | string>[] = [initialPoint];

    const runningScores: Record<number, number> = {};
    players.forEach((p) => {
      runningScores[p.id] = 0;
    });

    rounds.forEach((round, idx) => {
      round.scoreChanges.forEach((sc) => {
        runningScores[sc.playerId] = sc.newScore;
      });

      const point: Record<string, number | string> = {
        round: idx + 1,
      };

      players.forEach((p) => {
        point[p.name] = runningScores[p.id] ?? 0;
      });

      data.push(point);
    });

    return data;
  }, [players, rounds]);

  const handleUndo = () => {
    onUndoLastRound();
    setConfirmUndo(false);
  };

  return (
    <div className="flex flex-col h-[100dvh] max-w-md mx-auto bg-[#f8f9fa] border-x border-neutral-300 shadow-xl overflow-hidden">
      {/* 1. Header */}
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
          <h1 className="text-xs sm:text-sm font-black uppercase tracking-wide text-neutral-900">
            Historie &amp; Grafiek
          </h1>
          <span className="text-[10px] font-mono font-bold text-neutral-500">
            {rounds.length} {rounds.length === 1 ? "ronde gespeeld" : "rondes gespeeld"}
          </span>
        </div>

        {/* View Toggle: List vs Graph */}
        <div className="flex items-center p-0.5 bg-neutral-100 border border-neutral-300 rounded-md">
          <button
            type="button"
            onClick={() => setViewMode("list")}
            className={`flex items-center gap-1 px-2 py-1 text-xs font-bold rounded transition-all ${
              viewMode === "list"
                ? "bg-neutral-900 text-white shadow-2xs"
                : "text-neutral-700 hover:text-neutral-900"
            }`}
            title="Lijst weergave"
          >
            <ListFilter className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Lijst</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("graph")}
            className={`flex items-center gap-1 px-2 py-1 text-xs font-bold rounded transition-all ${
              viewMode === "graph"
                ? "bg-neutral-900 text-white shadow-2xs"
                : "text-neutral-700 hover:text-neutral-900"
            }`}
            title="Grafiek weergave"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Grafiek</span>
          </button>
        </div>
      </header>

      {/* 2. Scrollable Body */}
      <div className="flex-1 min-h-0 overflow-y-auto p-3">
        {rounds.length === 0 ? (
          <div className="h-full min-h-[300px] flex flex-col items-center justify-center p-6 text-center text-neutral-500 bg-white rounded-lg border-2 border-neutral-300">
            <TrendingUp className="w-8 h-8 text-neutral-400 mb-2" />
            <p className="text-xs font-bold text-neutral-800">Nog geen rondes geregistreerd</p>
            <p className="text-[11px] mt-1 text-neutral-500 max-w-xs">
              Zodra er een ronde is gespeeld, zie je hier de volledige geschiedenis en de scoregrafiek.
            </p>
          </div>
        ) : viewMode === "graph" ? (
          /* SCORING GRAPH VIEW */
          <div className="space-y-3 flex flex-col h-full min-h-[360px]">
            {/* Player Legend with Current Scores */}
            <div className="shrink-0 flex flex-wrap items-center justify-center gap-2 p-2 bg-white rounded-lg border-2 border-neutral-900 text-xs font-semibold shadow-xs">
              {players.map((p, idx) => (
                <div key={p.id} className="flex items-center gap-1">
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-black/20"
                    style={{ backgroundColor: PLAYER_COLORS[idx % PLAYER_COLORS.length] }}
                  />
                  <span className="text-neutral-800 text-[11px] font-bold">{p.name}:</span>
                  <span className="font-mono text-[11px] font-black">
                    {p.score > 0 ? `+${p.score}` : p.score}
                  </span>
                </div>
              ))}
            </div>

            {/* Recharts Chart */}
            <div className="flex-1 min-h-[280px] bg-white rounded-lg border-2 border-neutral-900 p-2 shadow-xs">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={graphData} margin={{ top: 10, right: 12, left: -20, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="round"
                    tick={{ fontSize: 10, fill: "#4b5563" }}
                    tickFormatter={(val) => `R${val}`}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "#4b5563" }}
                    domain={["auto", "auto"]}
                  />
                  <ReferenceLine y={0} stroke="#9ca3af" strokeWidth={1.5} />
                  <Tooltip
                    labelFormatter={(val) => `Na Ronde ${val}`}
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      borderColor: "#111111",
                      borderRadius: "6px",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                      fontSize: "11px",
                      fontWeight: 600,
                    }}
                    formatter={(val: any, name: any) => [
                      `${Number(val) > 0 ? "+" : ""}${val} pnt`,
                      name,
                    ]}
                  />
                  {players.map((p, idx) => (
                    <Line
                      key={p.id}
                      type="monotone"
                      dataKey={p.name}
                      stroke={PLAYER_COLORS[idx % PLAYER_COLORS.length]}
                      strokeWidth={2.5}
                      dot={{ r: 3, strokeWidth: 1.5, fill: "#ffffff" }}
                      activeDot={{ r: 5 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          /* ROUNDS LIST VIEW */
          <div className="space-y-2">
            {/* Undo Confirmation Bar */}
            {confirmUndo && (
              <div className="p-2.5 bg-red-50 border-2 border-red-500 rounded-lg flex items-center justify-between text-xs text-red-900 animate-fadeIn shadow-xs">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>Ronde {rounds.length} wissen?</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleUndo}
                    className="px-2.5 py-1 bg-red-600 text-white font-bold rounded hover:bg-red-700 active:bg-red-800 text-xs"
                  >
                    Ja, wis
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmUndo(false)}
                    className="px-2.5 py-1 bg-white border border-neutral-300 font-semibold rounded hover:bg-neutral-100 text-xs"
                  >
                    Annuleren
                  </button>
                </div>
              </div>
            )}

            {/* List of Rounds - Newest First */}
            {[...rounds].reverse().map((r, rIdx) => {
              const isLatest = rIdx === 0;

              return (
                <div
                  key={r.id}
                  className={`p-3 bg-white rounded-lg border-2 transition-all ${
                    isLatest ? "border-neutral-900 shadow-xs" : "border-neutral-200"
                  }`}
                >
                  {/* Top Line: Round #, Bid, Result */}
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="px-1.5 py-0.5 text-[10px] font-black bg-neutral-900 text-white rounded">
                        R{r.roundNumber}
                      </span>
                      <span className="text-xs sm:text-sm font-black text-neutral-900 truncate">
                        {r.bid}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${
                          r.success
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                            : "bg-red-100 text-red-800 border border-red-300"
                        }`}
                      >
                        {r.success ? "WIN" : "VERLIES"}
                      </span>

                      {/* Undo button for latest round */}
                      {isLatest && !confirmUndo && (
                        <button
                          type="button"
                          onClick={() => setConfirmUndo(true)}
                          className="p-1 text-neutral-400 hover:text-red-600 active:text-red-700 rounded transition-colors ml-0.5"
                          title="Herstel deze laatste ronde"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Summary */}
                  {r.summary && (
                    <div className="text-[11px] text-neutral-600 mb-1.5 font-medium truncate">
                      {r.summary}
                    </div>
                  )}

                  {/* Score Deltas for all players */}
                  <div
                    className={`grid gap-1 text-[11px] font-mono pt-1.5 border-t border-neutral-100 ${
                      players.length <= 4
                        ? "grid-cols-2 sm:grid-cols-4"
                        : players.length === 5
                        ? "grid-cols-2 sm:grid-cols-5"
                        : "grid-cols-2 sm:grid-cols-3"
                    }`}
                  >
                    {players.map((p, idx) => {
                      const change = r.changes[idx] ?? 0;
                      const isPos = change > 0;
                      const isNeg = change < 0;
                      const wasSittingOut = r.sittingOutIds?.includes(p.id);

                      return (
                        <div
                          key={p.id}
                          className="flex items-center justify-between px-2 py-1 rounded bg-neutral-50"
                        >
                          <span className="text-neutral-600 truncate font-sans text-[10px] font-bold">
                            {p.name}:
                          </span>
                          <span
                            className={`font-black ml-1 ${
                              wasSittingOut
                                ? "text-neutral-400"
                                : isPos
                                ? "text-emerald-700"
                                : isNeg
                                ? "text-red-700"
                                : "text-neutral-500"
                            }`}
                          >
                            {wasSittingOut ? "0 (Pauze)" : isPos ? `+${change}` : change}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
