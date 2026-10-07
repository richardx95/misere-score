"use client";
import React, { useState } from "react";
import { Player } from "../lib/types";
import { X, Check } from "lucide-react";

interface EditPlayersModalProps {
  isOpen: boolean;
  players: Player[];
  onClose: () => void;
  onSave: (updatedNames: string[]) => void;
}

export default function EditPlayersModal({
  isOpen,
  players,
  onClose,
  onSave,
}: EditPlayersModalProps) {
  const [names, setNames] = useState<string[]>(players.map((p) => p.name));

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(names.map((n, i) => n.trim() || `Speler ${i + 1}`));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-2xs animate-fadeIn">
      <div className="relative w-full max-w-sm bg-white rounded-lg border-2 border-neutral-900 shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 bg-neutral-50">
          <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-neutral-900">
            Spelersnamen Bewerken
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-neutral-500 hover:text-black"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          {names.map((name, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-6 text-xs font-mono font-bold text-neutral-500 text-right">
                #{i + 1}
              </span>
              <input
                type="text"
                value={name}
                maxLength={20}
                onChange={(e) => {
                  const copy = [...names];
                  copy[i] = e.target.value;
                  setNames(copy);
                }}
                className="flex-1 py-1.5 px-3 text-xs sm:text-sm font-semibold rounded border-2 border-neutral-300 focus:border-neutral-900 focus:outline-none"
              />
            </div>
          ))}

          <div className="pt-2 flex gap-2">
            <button
              type="submit"
              className="flex-1 py-2 px-3 bg-neutral-900 text-white rounded text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 flex items-center justify-center gap-1"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Opslaan</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-3 bg-white border border-neutral-300 text-neutral-700 rounded text-xs font-semibold hover:bg-neutral-100"
            >
              Annuleren
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
