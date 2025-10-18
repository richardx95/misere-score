import { useState } from "react";
import { calculateRoundScores } from "../lib/scoring";

type Player = {
  id: number;
  name: string;
  score: number;
};

export default function RoundForm({ gameState, setGameState }: any) {
  const { players, dealerIndex } = gameState;
  const [bidder, setBidder] = useState(0);
  const [bid, setBid] = useState("");
  const [success, setSuccess] = useState(true);
  const [bonus, setBonus] = useState(0);

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
    "13 alleen"
  ];

  const handleSubmit = () => {
    const pointsEarned = calculateRoundScores(bid, success, bonus, players, bidder, [], players.map((p: Player) => p.id)
);
    const newRounds = [
      ...gameState.rounds,
      { dealer: dealerIndex, bidder, bid, success, bonus, pointsEarned }
    ];
    const updatedPlayers = players.map((p: Player, i: number) => ({
  ...p,
  score: p.score + pointsEarned[i],
}));

    const nextDealer = (dealerIndex + 1) % players.length;

    setGameState({
      ...gameState,
      players: updatedPlayers,
      dealerIndex: nextDealer,
      currentRound: gameState.currentRound + 1,
      rounds: newRounds
    });

    localStorage.setItem("gameState", JSON.stringify({
      ...gameState,
      players: updatedPlayers,
      dealerIndex: nextDealer,
      currentRound: gameState.currentRound + 1,
      rounds: newRounds
    }));
  };

  return (
    <div className="space-y-2 border p-3 rounded">
      <h3 className="font-semibold">Nieuwe ronde</h3>
      <label>Biedende speler:</label>
      <select value={bidder} onChange={e => setBidder(Number(e.target.value))}>
       {players.map((p: Player, i: number) => (
  <option key={i} value={i}>
    {p.name}
  </option>
))}

      </select>
      <label>Bieding:</label>
      <select value={bid} onChange={e => setBid(e.target.value)}>
        <option value="">Selecteer...</option>
        {bids.map(b => <option key={b}>{b}</option>)}
      </select>
      <label>Geslaagd?</label>
      <input type="checkbox" checked={success} onChange={e => setSuccess(e.target.checked)} />
      <label>Bonuspunten:</label>
      <input type="number" min={0} max={4} value={bonus} onChange={e => setBonus(Number(e.target.value))} />
      <button onClick={handleSubmit} className="bg-green-500 text-white px-4 py-2 rounded">Volgende ronde</button>
    </div>
  );
}
