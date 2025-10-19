"use client";
import React, { useState } from "react";
import DealerIndicator from "./DealerIndicator";
import ScoreTable from "./ScoreTable";
import { calculateRoundScores } from "../lib/scoring";
import { saveGame } from "../lib/storage";
import { useEffect } from "react";


type Player = {
  id: number;
  name: string;
  score: number;
  active: boolean;
};

type GameBoardProps = {
  gameState: any;
  setGameState: (state: any) => void;
};

export default function GameBoard({ gameState, setGameState }: GameBoardProps) {
  const [bidder, setBidder] = useState<number | null>(null);
  const [bid, setBid] = useState("");
  const [duoPartners, setDuoPartners] = useState<number[]>([]);
  const [success, setSuccess] = useState(true);
  const [tricksMade, setTricksMade] = useState<number | string>(0);
  const [allCards, setAllCards] = useState(false);
  const [penaltyPlayers, setPenaltyPlayers] = useState<number[]>([]);

  const togglePenaltyPlayer = (id: number) => {
    setPenaltyPlayers((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  useEffect(() => {
  if (bid === "Troela" || bid === "Troelalier") {
    // Set default to "8+" if the user just selected this bid
    setTricksMade("10+");
  } else if (bid === "Trek /met" || bid === "Trek (alleen 5)") {
    // Set numeric default for these bids
    setTricksMade(0);
  } else {
    // For other bids, clear tricks
    setTricksMade(0);
  }
}, [bid]);

useEffect(() => {
  if (bid === "Troela" || bid === "Troelalier") {
    // Map tricksMade to numeric value for success evaluation
    let tricks = 0;
    if (tricksMade === "10+") tricks = 10;
    else if (tricksMade === "10-") tricks = 9;
    else if (tricksMade === "kapot gespeeld") tricks = 13; // treat as max success
    else tricks = Number(tricksMade) || 0;

    setSuccess(tricks >= 10); // 10+ or kapot gespeeld = win
  } else if (bid === "Trek /met") {
    const tricks = Number(tricksMade) || 0;
    setSuccess(tricks >= 8); // 8+ tricks = win
  } else if (bid === "Trek (alleen 5)") {
    const tricks = Number(tricksMade) || 0;
    setSuccess(tricks >= 5); // 5+ tricks = win
  }
}, [bid, tricksMade]);


  const bids = [
    "Schoppen dame + laatste slag",
    "Trek /met",
    "Trek (alleen 5)",
    "9 alleen",
    "Troela",
    "Troelalier",
    "Kaartje vragen",
    "Misère",
    "Open Misère",
    "13 alleen",
  ];

  const handlePartnerToggle = (id: number) => {
    setDuoPartners((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSubmit = () => {
    if (bidder === null || !bid) return alert("Kies speler en bieding");

    const activePlayerIds = gameState.players
      .filter((p: Player) => p.active)
      .map((p: Player) => p.id);

// Keep the original string for Troela / Troelalier, convert to number otherwise
const tricksValue =
  bid === "Troela" || bid === "Troelalier"
    ? tricksMade // keep as string ("8+", "kapot gespeeld", "8-")
    : Number(tricksMade);


    const changes = calculateRoundScores(
      bid,
      success,
      0, // bonus removed
      gameState.players,
      bidder,
      duoPartners,
      activePlayerIds,
      tricksValue,
      allCards,
      penaltyPlayers
    );

    const updatedPlayers = gameState.players.map((p: Player, i: number) => ({
      ...p,
      score: p.score + changes[i],
    }));

    const nextDealer = (gameState.dealerIndex + 1) % gameState.players.length;

    const newState = {
      ...gameState,
      players: updatedPlayers,
      dealerIndex: nextDealer,
      currentRound: gameState.currentRound + 1,
      rounds: [
        ...gameState.rounds,
        { bidder, bid, duoPartners, success, tricksMade, changes },
      ],
    };

    setGameState(newState);
    saveGame(newState);

    // reset form
    setBidder(null);
    setBid("");
    setDuoPartners([]);
    setTricksMade(0);
    setAllCards(false);
    setPenaltyPlayers([]);
  };

  const isTrickSelectable = [
    "Trek /met",
    "Trek (alleen 5)",
    "Troela",
    "Troelalier",
  ].includes(bid);

const trickOptions =
  bid === "Troela" || bid === "Troelalier"
    ? ["10+", "kapot gespeeld", "10-"]
    : Array.from({ length: 14 }, (_, i) => i);


  return (
    <div className="space-y-4 border p-4 rounded">
      <DealerIndicator
        players={gameState.players}
        dealerIndex={gameState.dealerIndex}
      />

      <ScoreTable players={gameState.players} />

      <div className="overflow-x-auto">
        <table className="min-w-full border text-white-900">
          <thead className="bg-gray-100 text-gray-500">
            <tr>
              {gameState.players.map((p: Player) => (
                <th key={p.id} className="px-2 py-1 border">
                  {p.name}
                </th>
              ))}
              <th>Bieding</th>
              <th>Slagen</th>
              <th>Duo</th>
              <th>Succes</th>
            </tr>
          </thead>
          <tbody>
  {/* Editable row always on top */}
  <tr className="bg-yellow-200 text-gray-700">
    {gameState.players.map((p: Player) => (
      <td key={p.id} className="px-2 py-1 border text-center">
        <input
          type="radio"
          name="bidder"
          checked={bidder === p.id}
          onChange={() => setBidder(p.id)}
        />
        <div>
          {p.id === bidder
            ? "🏆"
            : duoPartners.includes(p.id)
            ? "🤝"
            : ""}
        </div>
      </td>
    ))}

    <td>
      <select
        value={bid}
        onChange={(e) => setBid(e.target.value)}
        className="border rounded px-2 py-1"
      >
        <option value="">Selecteer bieding</option>
        {bids.map((b) => (
          <option key={b}>{b}</option>
        ))}
      </select>
    </td>

    {/* Tricks column */}
    <td>
      <select
        value={tricksMade}
        onChange={(e) => setTricksMade(e.target.value)}
        disabled={!isTrickSelectable}
        className={`border rounded px-2 py-1 ${
          !isTrickSelectable ? "bg-gray-200 text-gray-500" : ""
        }`}
      >
        {!isTrickSelectable && <option>-</option>}
        {isTrickSelectable &&
          trickOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
      </select>
    </td>

    {/* Duo partners */}
    <td>
      {gameState.players
        .filter((p: Player) => p.active)
        .map((player: Player) => {
          if (player.id === bidder) return null;

          const isSoloBid = [
            "Kaartje vragen",
            "Misère",
            "Open Misère",
            "13 alleen",
            "9 alleen",
            "Trek (alleen 5)"
          ].includes(bid);

          return (
            <label
              key={player.id}
              className={`mr-2 ${
                isSoloBid ? "opacity-40 cursor-not-allowed" : ""
              }`}
            >
              <input
                type="checkbox"
                checked={duoPartners.includes(player.id)}
                onChange={() => handlePartnerToggle(player.id)}
                disabled={isSoloBid}
              />
              {player.name}
            </label>
          );
        })}
    </td>

    {/* Success checkbox */}
    <td className="text-center">
      <input
        type="checkbox"
        checked={success}
        onChange={(e) => setSuccess(e.target.checked)}
        disabled={
          ![
            "Kaartje vragen",
            "Misère",
            "Open Misère",
            "13 alleen",
            "9 alleen",
          ].includes(bid)
        }
        className={`w-5 h-5 ${
          ![
            "Kaartje vragen",
            "Misère",
            "Open Misère",
            "13 alleen",
            "9 alleen",
          ].includes(bid)
            ? "opacity-40 cursor-not-allowed"
            : ""
        }`}
      />
    </td>
  </tr>

  {/* List rounds — newest first */}
  {[...gameState.rounds]
    .slice()
    .reverse()
    .map((r: any, idx: number) => {
      const bidderName = gameState.players[r.bidder]?.name ?? "";
      const partnerNames = (r.duoPartners ?? [])
        .map((i: number) => gameState.players[i]?.name ?? "")
        .filter(Boolean);

      const playersInRound = partnerNames.length
        ? [bidderName, ...partnerNames].join(" & ")
        : bidderName;

      return (
        <tr key={idx}>
          {gameState.players.map((p: Player) => (
            <td key={p.id} className="px-2 py-1 border text-center">
              {r.changes?.[p.id] ?? 0}
            </td>
          ))}
          <td className="border px-2 py-1">{r.bid}</td>
          <td className="border px-2 py-1">{r.tricksMade ?? "-"}</td>
          <td className="border px-2 py-1">{playersInRound}</td>
          <td className="border px-2 py-1 text-center">
            {r.success ? "✔" : "✖"}
          </td>
        </tr>
      );
    })}
</tbody>
        </table>

        <button
          onClick={handleSubmit}
          className="mt-3 bg-green-500 text-white px-4 py-2 rounded"
        >
          Volgende ronde
        </button>
      </div>
    </div>
  );
}
