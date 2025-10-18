"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PlayerSetupForm() {
  const [numPlayers, setNumPlayers] = useState(4);
  const [names, setNames] = useState(["", "", "", ""]);
  const [dealer, setDealer] = useState(0);
  const [activePlayers, setActivePlayers] = useState<number[]>([0,1,2,3]); // default first 4
  const router = useRouter();

  const handleStart = () => {
    // create player objects
    const players = names.slice(0, numPlayers).map((n, i) => ({
      id: i,
      name: n || `Speler ${i + 1}`,
      score: 0,
      active: activePlayers.includes(i), // use the selected active players
    }));

    // save game state
    localStorage.setItem(
      "gameState",
      JSON.stringify({
        players,
        dealerIndex: dealer,
        currentRound: 1,
        rounds: [],
        activePlayers,
      })
    );

    router.push("/game");
  };

  return (
    <div className="p-4 max-w-md mx-auto space-y-4">
      <h2 className="text-xl font-bold">Spelers instellen</h2>

      <label>Aantal spelers:</label>
      <select
        value={numPlayers}
        onChange={(e) => {
          const n = Number(e.target.value);
          setNumPlayers(n);
          setNames((prev) => [...prev.slice(0, n), ...Array(n - prev.length).fill("")]);
          setActivePlayers((prev) => prev.slice(0, n));
        }}
      >
        {[4, 5, 6].map((n) => (
          <option key={n} value={n}>{n}</option>
        ))}
      </select>

      {/* Player names and active selection */}
      {Array.from({ length: numPlayers }).map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            placeholder={`Naam speler ${i + 1}`}
            value={names[i] || ""}
            onChange={(e) => {
              const copy = [...names];
              copy[i] = e.target.value;
              setNames(copy);
            }}
            className="border p-2 w-full"
          />
          {numPlayers > 4 && (
            <label className="ml-2">
              <input
                type="checkbox"
                checked={activePlayers.includes(i)}
                onChange={() => {
                  setActivePlayers((prev) =>
                    prev.includes(i)
                      ? prev.filter((x) => x !== i)
                      : [...prev, i].slice(0, 4)
                  );
                }}
              />{" "}
              Actief
            </label>
          )}
        </div>
      ))}

      {/* Dealer selection */}
      <label>Startende deler:</label>
      <select
        value={dealer}
        onChange={(e) => setDealer(Number(e.target.value))}
      >
        {names.slice(0, numPlayers).map((n, i) => (
          <option key={i} value={i}>
            {n || `Speler ${i + 1}`}
          </option>
        ))}
      </select>

      <button
        onClick={handleStart}
        className="mt-4 bg-green-500 text-white px-4 py-2 rounded"
      >
        Start spel
      </button>
    </div>
  );
}
