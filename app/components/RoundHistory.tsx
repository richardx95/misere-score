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
import { ListFilter, TrendingUp, RotateCcw, AlertTriangle } from "lucide-react";

interface RoundHistoryProps {
  players: Player[];
  rounds: Round[];
  onUndoLastRound: () => void;
}

// Distinct accessible colors for player lines in the graph
const PLAYER_COLORS = [
  "#16a34a", // Emerald Green
  "#2563eb", // Royal Blue
  "#dc2626", // Crimson Red
  "#9333ea", // Purple
  "#ea580c", // Orange
  "#0891b2", // Cyan
];

export default function RoundHistory({
  players,
  rounds,
  onUndoLastRound,
}: RoundHistoryProps) {
  const [viewMode, setViewMode] = useState<"list" | "graph">("list");
  const [confirmUndo, setConfirmUndo] = useState(false);

  // Generate data for the scoring progression graph
  const graphData = useMemo(() => {
    // Initial round 0 (all scores 0)
    const initialPoint: Record<string, number | string> = { round: 0 };
    players.forEach((p) => {
      initialPoint[p.name] = 0;
    });

    const data: Record<string, number | string>[] = [initialPoint];

    // Cumulative scores
    const runningScores: Record<number, number> = {};
    players.forEach((p) => {
      runningScores[p.id] = 0;
    });

    rounds.forEach((round, idx) => {
      // Apply changes
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
    <div className="p-3 border-2 border-neutral-900 rounded-lg shadow-xs flex flex-col flex-1 min-h-0 bg-white">
      {/* Header with View Toggle (List vs Graph icon) */}
      <div className="shrink-0 flex items-center justify-between pb-2 mb-2 border-b border-neutral-200">
        <h2 className="text-xs font-black tracking-wider text-neutral-900 uppercase">
          Laatste Rondes ({rounds.length})
        </h2>

        {/* Graph / List Icon Toggle */}
        <div className="flex items-center p-0.5 bg-neutral-100 border border-neutral-300 rounded-md">
          <button
            type="button"
            onClick={() => setViewMode("list")}
            className={`flex items-center gap-1 px-2 py-1 text-xs font-bold rounded transition-all ${
              viewMode === "list"
                ? "bg-neutral-900 text-white shadow-2xs"
                : "text-neutral-700 hover:text-neutral-900"
            }`}
            title="Toon lijst van rondes"
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
            title="Toon scoreverloop grafiek"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Grafiek</span>
          </button>
        </div>
      </div>

      {/* Body: Scrollable Content Area */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-0.5">
        {rounds.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center py-6 px-4 text-center text-neutral-500 bg-neutral-50 rounded-md border border-neutral-200">
            <p className="text-xs font-semibold">Nog geen rondes gespeeld.</p>
            <p className="text-[11px] mt-1 text-neutral-400">
              Tik op &ldquo;+ Nieuwe Ronde Invoeren&rdquo; om de eerste ronde te starten.
            </p>
          </div>
        ) : viewMode === "graph" ? (
          /* SCORING GRAPH VIEW */
          <div className="space-y-2 h-full flex flex-col">
            {/* Player Legend */}
            <div className="shrink-0 flex flex-wrap items-center justify-center gap-2 p-1.5 bg-neutral-50 rounded-md border border-neutral-200 text-xs font-semibold">
              {players.map((p, idx) => (
                <div key={p.id} className="flex items-center gap-1">
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-black/20"
                    style={{ backgroundColor: PLAYER_COLORS[idx % PLAYER_COLORS.length] }}
                  />
                  <span className="text-neutral-800 text-[11px]">{p.name}:</span>
                  <span className="font-mono text-[11px] font-bold">
                    {p.score > 0 ? `+${p.score}` : p.score}
                  </span>
                </div>
              ))}
            </div>

            {/* Recharts Container */}
            <div className="flex-1 min-h-[220px] bg-white rounded-md border border-neutral-200 p-1">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={graphData} margin={{ top: 8, right: 12, left: -22, bottom: 4 }}>
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
              <div className="p-2 bg-red-50 border-2 border-red-500 rounded-md flex items-center justify-between text-xs text-red-900 animate-fadeIn">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>Ronde {rounds.length} wissen?</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handleUndo}
                    className="px-2 py-0.5 bg-red-600 text-white font-bold rounded hover:bg-red-700 active:bg-red-800 text-[11px]"
                  >
                    Ja, wis
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmUndo(false)}
                    className="px-2 py-0.5 bg-white border border-neutral-300 font-semibold rounded hover:bg-neutral-100 text-[11px]"
                  >
                    Nee
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
                  className={`p-2.5 bg-white rounded-md border-2 transition-all ${
                    isLatest ? "border-neutral-900 shadow-2xs" : "border-neutral-200"
                  }`}
                >
                  {/* Top Line: Round #, Bid, Result */}
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="px-1.5 py-0.2 text-[10px] font-bold bg-neutral-900 text-white rounded">
                        R{r.roundNumber}
                      </span>
                      <span className="text-xs font-black text-neutral-900 truncate">
                        {r.bid}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <span
                        className={`text-[9px] font-black px-1.5 py-0.2 rounded uppercase ${
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
                    <div className="text-[10px] text-neutral-600 mb-1 font-medium truncate">
                      {r.summary}
                    </div>
                  )}

                  {/* Score Deltas for all players */}
                  <div
                    className={`grid gap-1 text-[11px] font-mono pt-1 border-t border-neutral-100 ${
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
                          className="flex items-center justify-between px-1.5 py-0.5 rounded bg-neutral-50"
                        >
                          <span className="text-neutral-600 truncate font-sans text-[10px]">
                            {p.name}:
                          </span>
                          <span
                            className={`font-bold ml-1 ${
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
