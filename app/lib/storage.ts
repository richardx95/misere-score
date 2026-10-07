import { GameState } from "./types";

const STORAGE_KEY = "misere_game_state";
const HISTORY_KEY = "misere_game_history";

export const loadGame = (): GameState | null => {
  if (typeof window === "undefined") return null;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch (err) {
    console.error("Fout bij laden spel:", err);
    return null;
  }
};

export const saveGame = (state: GameState): void => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error("Fout bij opslaan spel:", err);
  }
};

export const clearCurrentGame = (): void => {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error("Fout bij wissen spel:", err);
  }
};

export const loadHistory = (): GameState[] => {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem(HISTORY_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (err) {
    console.error("Fout bij laden geschiedenis:", err);
    return [];
  }
};

export const saveToHistory = (game: GameState): void => {
  if (typeof window === "undefined") return;
  try {
    const history = loadHistory();
    const updated = [game, ...history.filter((g) => g.id !== game.id)].slice(0, 20);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error("Fout bij opslaan in geschiedenis:", err);
  }
};
