"use client";
import { useEffect, useState } from "react";
import GameBoard from "../components/GameBoard";

export default function GamePage() {
  const [gameState, setGameState] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem("gameState");
    if (saved) setGameState(JSON.parse(saved));
  }, []);

  if (!gameState) return <p>Loading game...</p>;

  return (
    <div className="p-4 space-y-4">
      <GameBoard gameState={gameState} setGameState={setGameState} />
    </div>
  );
}
