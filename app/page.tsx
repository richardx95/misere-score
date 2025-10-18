"use client";
import PlayerSetupForm from "./components/PlayerSetupForm";

export default function HomePage() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Kaartscore Tracker</h1>
      <PlayerSetupForm />
    </main>
  );
}
