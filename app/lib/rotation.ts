import { Player } from "./types";

/**
 * Returns the players who are currently active in the game (not dropped out).
 */
export function getActiveInGamePlayers(players: Player[]): Player[] {
  return players.filter((p) => p.isActiveInGame !== false);
}

/**
 * Given a list of active-in-game players and a player ID, returns the next active player ID in clockwise order.
 */
export function getNextClockwisePlayerId(
  activePlayers: Player[],
  currentId: number
): number {
  if (activePlayers.length === 0) return currentId;
  const currentIndex = activePlayers.findIndex((p) => p.id === currentId);
  if (currentIndex === -1) return activePlayers[0].id;
  const nextIndex = (currentIndex + 1) % activePlayers.length;
  return activePlayers[nextIndex].id;
}

/**
 * Computes the sitting out player IDs for the FIRST round of a game.
 * - 4 players: [] (none)
 * - 5 players: 1 player (from initialSittingOutIds or last player)
 * - 6 players: 2 players (from initialSittingOutIds or last two players)
 */
export function getInitialSittingOutIds(
  players: Player[],
  selectedInitialSittingOutIds?: number[]
): number[] {
  const active = getActiveInGamePlayers(players);
  if (active.length <= 4) {
    return [];
  }

  if (active.length === 5) {
    if (
      selectedInitialSittingOutIds &&
      selectedInitialSittingOutIds.length >= 1 &&
      active.some((p) => p.id === selectedInitialSittingOutIds[0])
    ) {
      return [selectedInitialSittingOutIds[0]];
    }
    // Default: the 5th player sits out first round
    return [active[4].id];
  }

  if (active.length === 6) {
    if (
      selectedInitialSittingOutIds &&
      selectedInitialSittingOutIds.length >= 2 &&
      selectedInitialSittingOutIds.every((id) => active.some((p) => p.id === id))
    ) {
      return selectedInitialSittingOutIds.slice(0, 2);
    }
    // Default: the 5th and 6th players sit out first round
    return [active[4].id, active[5].id];
  }

  return [];
}

/**
 * Computes the sitting out player IDs for the NEXT round based on:
 * - Current active players in game
 * - Previous round's sitting out player IDs
 */
export function getNextSittingOutIds(
  players: Player[],
  previousSittingOutIds: number[]
): number[] {
  const active = getActiveInGamePlayers(players);
  const activeCount = active.length;

  if (activeCount <= 4) {
    return [];
  }

  // Filter previous sit-outs to only those still active in the game
  const prevValid = previousSittingOutIds.filter((id) =>
    active.some((p) => p.id === id)
  );

  // 5 active players: exactly 1 player sits out per round, advancing clockwise
  if (activeCount === 5) {
    if (prevValid.length === 0) {
      return [active[0].id];
    }
    // Pick the last one from previous sitting out, and move 1 seat clockwise
    const lastSitOutId = prevValid[prevValid.length - 1];
    const nextSitOutId = getNextClockwisePlayerId(active, lastSitOutId);
    return [nextSitOutId];
  }

  // 6 active players: 2 players sit out per round.
  // Each sits out 2 consecutive rounds and plays 4 rounds.
  // Previous sitting out pair: [P1, P2]. P2 sits out again (their 2nd round),
  // and the next player clockwise from P2 joins them on the bench.
  if (activeCount === 6) {
    if (prevValid.length < 2) {
      // Fallback if previous was empty or invalid
      return [active[4].id, active[5].id];
    }

    const p2Id = prevValid[1];
    const p3Id = getNextClockwisePlayerId(active, p2Id);
    return [p2Id, p3Id];
  }

  return [];
}

/**
 * Given all players and the sitting out player IDs, returns the 4 active player IDs who play the round.
 */
export function getRoundActivePlayerIds(
  players: Player[],
  sittingOutIds: number[]
): number[] {
  const activeInGame = getActiveInGamePlayers(players);
  if (activeInGame.length <= 4) {
    return activeInGame.map((p) => p.id);
  }

  const playing = activeInGame.filter((p) => !sittingOutIds.includes(p.id));
  return playing.map((p) => p.id).slice(0, 4);
}
