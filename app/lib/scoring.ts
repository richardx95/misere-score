import { Player } from "./types";

/**
 * Calculates score changes for any round according to the Dutch Misère family rules.
 * Supports games with 4, 5, or 6 players where exactly 4 active players play and receive scores.
 * Players sitting out receive 0 points.
 */
export function calculateRoundScores(
  bid: string,
  success: boolean,
  bonus: number,
  players: Player[],
  bidderId: number,
  partnerIds: number[] = [],
  activePlayerIds: number[] = [],
  tricksMade: number | string = 0,
  allCards: boolean = false,
  penaltyIds: number[] = []
): number[] {
  const changes = new Array(players.length).fill(0);
  const idToIndex = Object.fromEntries(players.map((p, i) => [p.id, i]));

  // Ensure we have the 4 active player IDs (default to all active in game if not specified)
  const effectiveActiveIds =
    activePlayerIds.length > 0
      ? activePlayerIds
      : players.filter((p) => p.isActiveInGame).map((p) => p.id).slice(0, 4);

  const activeIndices = effectiveActiveIds
    .map((id) => idToIndex[id])
    .filter((idx) => idx !== undefined);

  const bidderIndex = idToIndex[bidderId] !== undefined ? idToIndex[bidderId] : -1;
  const partnerIndices = partnerIds
    .map((id) => idToIndex[id])
    .filter((idx) => idx !== undefined && activeIndices.includes(idx));

  const normalizedBid = bid.trim();

  // 1. 🂡 Schoppen dame + laatste slag (Passpel / Boetespel)
  if (
    normalizedBid === "Schoppen dame + laatste slag" ||
    normalizedBid === "Schoppen dame" ||
    normalizedBid.toLowerCase().includes("schoppen")
  ) {
    const penalizedIds =
      penaltyIds.length > 0
        ? penaltyIds
        : partnerIds.length > 0
        ? partnerIds
        : bidderId !== undefined && bidderId !== null
        ? [bidderId]
        : [];

    const penalizedIndices = penalizedIds
      .map((id) => idToIndex[id])
      .filter((idx) => idx !== undefined && activeIndices.includes(idx));

    if (penalizedIndices.length <= 1) {
      // 1 player took both penalties
      const penalized = penalizedIndices.length === 1 ? penalizedIndices[0] : bidderIndex;
      const nonPenalized = activeIndices.filter((i) => i !== penalized);

      if (penalized >= 0 && activeIndices.includes(penalized)) {
        changes[penalized] -= 15;
        const reward = nonPenalized.length > 0 ? 15 / nonPenalized.length : 5;
        nonPenalized.forEach((i) => {
          changes[i] += reward;
        });
      }
    } else {
      // 2 players took one penalty each
      const nonPenalized = activeIndices.filter((i) => !penalizedIndices.includes(i));
      penalizedIndices.forEach((i) => {
        changes[i] -= 5;
      });
      const reward = nonPenalized.length > 0 ? 10 / nonPenalized.length : 5;
      nonPenalized.forEach((i) => {
        changes[i] += reward;
      });
    }

    return ensureZeroSum(changes, activeIndices);
  }

  // 2. 🂮 Troela / Troelalier
  if (normalizedBid === "Troela" || normalizedBid === "Troelalier") {
    let base = 15;
    const tricksStr = String(tricksMade);

    if (tricksStr === "10+" || tricksStr === "10" || tricksStr === "11" || tricksStr === "12") {
      base = 15;
    } else if (tricksStr === "kapot gespeeld" || tricksStr === "13") {
      base = 20;
    } else if (tricksStr === "10-" || (typeof tricksMade === "number" && tricksMade < 10 && tricksMade > 0)) {
      base = -15;
    } else if (!success) {
      base = -15;
    }

    const duo = Array.from(new Set([bidderIndex, ...partnerIndices])).filter(
      (i) => i >= 0 && activeIndices.includes(i)
    );
    const others = activeIndices.filter((i) => !duo.includes(i));

    duo.forEach((i) => (changes[i] += base));
    const deduction = duo.length > 0 && others.length > 0 ? (base * duo.length) / others.length : base;
    others.forEach((i) => (changes[i] -= deduction));

    return ensureZeroSum(changes, activeIndices);
  }

  // 3. 🂫 Trek /met
  if (normalizedBid === "Trek /met" || normalizedBid === "Trek met") {
    const duo = Array.from(new Set([bidderIndex, ...partnerIndices])).filter(
      (i) => i >= 0 && activeIndices.includes(i)
    );
    const others = activeIndices.filter((i) => !duo.includes(i));

    const tricks = typeof tricksMade === "number" ? tricksMade : parseInt(String(tricksMade), 10) || 0;
    const isSuccess = tricks >= 8;
    let points = 0;

    if (isSuccess) {
      if (tricks === 8) points = 5;
      else if (tricks < 13) points = 5 + (tricks - 8);
      else if (tricks >= 13) points = 15;
    } else {
      points = -(5 + (7 - tricks));
    }

    duo.forEach((i) => (changes[i] += points));
    const othersChange = others.length > 0 ? (points * duo.length) / others.length : points;
    others.forEach((i) => (changes[i] -= othersChange));

    return ensureZeroSum(changes, activeIndices);
  }

  // 4. 🂪 Trek (alleen 5)
  if (normalizedBid === "Trek (alleen 5)" || normalizedBid.includes("Trek (alleen")) {
    const others = activeIndices.filter((i) => i !== bidderIndex);
    const tricks = typeof tricksMade === "number" ? tricksMade : parseInt(String(tricksMade), 10) || 0;

    let points = 0;
    if (tricks >= 5) {
      if (tricks === 5) points = 15;
      else if (tricks < 13) points = 15 + (tricks - 5) * 3;
      else if (tricks >= 13) points = 45;
    } else {
      points = -15 - (4 - tricks) * 3;
    }

    if (bidderIndex >= 0) {
      changes[bidderIndex] += points;
    }
    const othersDeduction = others.length > 0 ? points / others.length : 0;
    others.forEach((i) => (changes[i] -= othersDeduction));

    return ensureZeroSum(changes, activeIndices);
  }

  // 5. 🂡 Solo & Misère Biedingen
  const baseValues: Record<string, number> = {
    "9 alleen": 10,
    "13 alleen": 25,
    "Kaartje vragen": 15,
    "Misère": 15,
    "Open Misère": 20,
    "Open misère": 20,
  };

  const base = baseValues[normalizedBid] !== undefined ? baseValues[normalizedBid] : 15;
  const participants = Array.from(new Set([bidderIndex, ...partnerIndices])).filter(
    (i) => i >= 0 && activeIndices.includes(i)
  );

  const winners = success ? participants : activeIndices.filter((i) => !participants.includes(i));
  const losers = success ? activeIndices.filter((i) => !participants.includes(i)) : participants;

  const perOpponent = base + (bonus || 0);

  for (const l of losers) {
    changes[l] -= perOpponent * winners.length;
  }
  for (const w of winners) {
    changes[w] += perOpponent * losers.length;
  }

  return ensureZeroSum(changes, activeIndices);
}

/**
 * Ensures mathematical zero-sum integrity across all 4 active players.
 * Non-active players remain strictly at 0.
 */
function ensureZeroSum(changes: number[], activeIndices: number[]): number[] {
  const sum = activeIndices.reduce((acc, idx) => acc + changes[idx], 0);
  if (Math.abs(sum) > 0.001 && activeIndices.length > 0) {
    const remainder = Math.round(sum);
    changes[activeIndices[0]] -= remainder;
  }
  return changes.map((c) => Math.round(c));
}
