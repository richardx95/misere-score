"use client";
import React, { useState, useEffect } from "react";
import PlayerSetup from "./components/PlayerSetup";
import GameBoard from "./components/GameBoard";
import FloatingSuits from "./components/FloatingSuits";
import { GameState } from "./lib/types";
import { loadGame, saveGame } from "./lib/storage";

export default function HomePage() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [savedGame, setSavedGame] = useState<GameState | null>(null);

  useEffect(() => {
    const existing = loadGame();
    if (existing) {
      setSavedGame(existing);
      // Auto-resume if there is an active ongoing game with at least one round
      if (existing.rounds && existing.rounds.length > 0 && !existing.isCompleted) {
        setGameState(existing);
      }
    }
  }, []);

  const handleStartGame = (
    playerNames: string[],
    dealerIndex: number,
    ruleset: "family" | "classic"
  ) => {
    const newGame: GameState = {
      id: Date.now().toString(),
      players: playerNames.map((name, i) => ({
        id: i,
        name,
        score: 0,
        active: true,
      })),
      dealerIndex,
      currentRound: 1,
      rounds: [],
      activePlayerIds: playerNames.map((_, i) => i),
      ruleset,
      dateStarted: new Date().toISOString(),
      isCompleted: false,
    };

    setGameState(newGame);
    saveGame(newGame);
  };

  const handleResumeGame = () => {
    if (savedGame) {
      setGameState(savedGame);
    }
  };

  const handleStartNewGame = () => {
    setGameState(null);
  };

  return (
    <main className="min-h-screen relative overflow-x-hidden pb-8">
      {/* Subtle floating playing card suits in background */}
      <FloatingSuits />

      <div className="relative z-10">
        {gameState ? (
          <GameBoard
            gameState={gameState}
            setGameState={setGameState}
            onStartNewGame={handleStartNewGame}
          />
        ) : (
          <PlayerSetup
            onStartGame={handleStartGame}
            savedGame={savedGame}
            onResumeGame={handleResumeGame}
          />
        )}
      </div>
    </main>
  );
}
