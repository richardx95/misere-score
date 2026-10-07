export interface Player {
  id: number;
  name: string;
  score: number;
  active?: boolean;
}

export interface PlayerScoreChange {
  playerId: number;
  oldScore: number;
  newScore: number;
  change: number;
}

export interface Round {
  id: number;
  roundNumber: number;
  dealerIndex: number;
  bid: string;
  bidderId: number;
  partnerIds: number[];
  tricksMade?: number | string;
  success: boolean;
  scoreChanges: PlayerScoreChange[];
  changes: number[];
  summary?: string;
  timestamp: number;
}

export interface GameState {
  id: string;
  players: Player[];
  dealerIndex: number;
  currentRound: number;
  rounds: Round[];
  activePlayerIds: number[];
  ruleset: "family" | "classic";
  dateStarted: string;
  isCompleted: boolean;
}
