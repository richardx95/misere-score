export interface Player {
  id: number;
  name: string;
  score: number;
  dealer?: boolean;
  isActiveInGame: boolean; // false if player dropped out mid-game
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
  activePlayerIds: number[]; // exactly 4 players who played
  sittingOutIds: number[]; // players who sat out this round (0 points)
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
  sittingOutIds: number[]; // Player IDs currently sitting out this round
  activePlayerIds: number[]; // Exactly 4 player IDs who play this round
  initialSittingOutIds?: number[];
  ruleset?: string;
  dateStarted: string;
  isCompleted: boolean;
}
