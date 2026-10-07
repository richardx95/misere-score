export interface Player {
  id: number;
  name: string;
  score: number;
  active?: boolean;
}

export interface RoundScoreResult {
  changes: number[];
  isSuccess: boolean;
  points: number;
  explanation: string;
}

/**
 * Calculates score changes for any round according to the Dutch Rikken & Misère family rules.
 */
export function calculateRoundScores(
  bid: string,
  success: boolean,
  bonus: number,
  players: Player[],
  bidderIndex: number,
  duoIndices: number[] = [],
  activePlayerIds: number[] = [],
  tricksMade: number | string = 0,
  allCards: boolean = false,
  penaltyPlayers: number[] = []
): number[] {
  const changes = new Array(players.length).fill(0);
  const idToIndex = Object.fromEntries(players.map((p, i) => [p.id, i]));
  
  // Determine active players (default to all players if empty)
  const effectiveActiveIds = activePlayerIds.length > 0
    ? activePlayerIds
    : players.map((p) => p.id);

  const activeIndices = players
    .map((p, i) => (effectiveActiveIds.includes(p.id) ? i : -1))
    .filter((i) => i !== -1);

  // Normalize bid name for matching
  const normalizedBid = bid.trim();

  // 1. 🂡 Schoppen dame + laatste slag (Passpel / Boetespel)
  if (
    normalizedBid === "Schoppen dame + laatste slag" ||
    normalizedBid === "Schoppen dame" ||
    normalizedBid.toLowerCase().includes("schoppen")
  ) {
    // Penalty players can be passed via duoIndices or penaltyPlayers or bidderIndex
    const penaltyIds = penaltyPlayers.length > 0
      ? penaltyPlayers
      : duoIndices.length > 0
      ? duoIndices
      : bidderIndex >= 0
      ? [players[bidderIndex]?.id].filter((id): id is number => id !== undefined)
      : [];

    const penaltyIdxList = penaltyIds
      .map((id) => (idToIndex[id] !== undefined ? idToIndex[id] : id))
      .filter((idx) => activeIndices.includes(idx));

    if (penaltyIdxList.length <= 1) {
      // 1 player took both penalties (or bidder alone)
      const penalized = penaltyIdxList.length === 1 ? penaltyIdxList[0] : bidderIndex;
      const nonPenalized = activeIndices.filter((i) => i !== penalized);

      if (penalized >= 0) {
        changes[penalized] -= 15;
        const reward = nonPenalized.length > 0 ? 15 / nonPenalized.length : 5;
        nonPenalized.forEach((i) => {
          changes[i] += reward;
        });
      }
    } else {
      // 2 players took one penalty each
      const nonPenalized = activeIndices.filter((i) => !penaltyIdxList.includes(i));
      penaltyIdxList.forEach((i) => {
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

    const partnerIndices = duoIndices.map((id) => (idToIndex[id] !== undefined ? idToIndex[id] : id));
    const duo = Array.from(new Set([bidderIndex, ...partnerIndices])).filter((i) => i >= 0 && activeIndices.includes(i));
    const others = activeIndices.filter((i) => !duo.includes(i));

    duo.forEach((i) => (changes[i] += base));
    const opponentDeduction = duo.length > 0 && others.length > 0 ? (base * duo.length) / others.length : base;
    others.forEach((i) => (changes[i] -= opponentDeduction));

    return ensureZeroSum(changes, activeIndices);
  }

  // 3. 🂫 Trek /met
  if (normalizedBid === "Trek /met" || normalizedBid === "Trek met") {
    const partnerIndices = duoIndices.map((id) => (idToIndex[id] !== undefined ? idToIndex[id] : id));
    const duo = Array.from(new Set([bidderIndex, ...partnerIndices])).filter((i) => i >= 0 && activeIndices.includes(i));
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

    changes[bidderIndex] += points;
    const othersDeduction = others.length > 0 ? points / others.length : 0;
    others.forEach((i) => (changes[i] -= othersDeduction));

    return ensureZeroSum(changes, activeIndices);
  }

  // 5. 🂩 Classic Rikken & Extra Bids (Rik, Betere rik, 8 alleen, etc.)
  if (normalizedBid === "Rik" || normalizedBid === "Betere rik") {
    const partnerIndices = duoIndices.map((id) => (idToIndex[id] !== undefined ? idToIndex[id] : id));
    const duo = Array.from(new Set([bidderIndex, ...partnerIndices])).filter((i) => i >= 0 && activeIndices.includes(i));
    const others = activeIndices.filter((i) => !duo.includes(i));

    const tricks = typeof tricksMade === "number" ? tricksMade : parseInt(String(tricksMade), 10) || 8;
    const won = tricks >= 8;
    let pts = won ? 10 + Math.max(0, tricks - 8) * 5 : -(10 + Math.max(0, 8 - tricks) * 5);
    if (won && tricks === 13) pts += 35; // Kapot bonus

    duo.forEach((i) => (changes[i] += pts));
    const othersChange = others.length > 0 ? (pts * duo.length) / others.length : pts;
    others.forEach((i) => (changes[i] -= othersChange));

    return ensureZeroSum(changes, activeIndices);
  }

  // 6. 🂡 Regular solo & misère bids
  const baseValues: Record<string, number> = {
    "9 alleen": 10,
    "8 alleen": 10,
    "10 alleen": 30,
    "11 alleen": 40,
    "12 alleen": 50,
    "13 alleen": 25,
    "Kaartje vragen": 15,
    "Misère": 15,
    "Open Misère": 20,
    "Open misère": 20,
    "Piek": 15,
    "Open piek": 40,
    "Open piek met een praatje": 55,
    "Open misère met een praatje": 60,
  };

  const base = baseValues[normalizedBid] !== undefined ? baseValues[normalizedBid] : 15;
  const partnerIndices = duoIndices.map((id) => (idToIndex[id] !== undefined ? idToIndex[id] : id));
  const participants = Array.from(new Set([bidderIndex, ...partnerIndices])).filter((i) => i >= 0 && activeIndices.includes(i));

  const winners = success ? participants : activeIndices.filter((i) => !participants.includes(i));
  const losers = success ? activeIndices.filter((i) => !participants.includes(i)) : participants;

  const perOpponent = base + (bonus || 0);

  // Each loser pays (perOpponent * winners.length) / losers.length or standard multiplier
  for (const l of losers) {
    changes[l] -= perOpponent * winners.length;
  }
  for (const w of winners) {
    changes[w] += perOpponent * losers.length;
  }

  return ensureZeroSum(changes, activeIndices);
}

/**
 * Guarantees mathematical zero-sum integrity across all active players.
 */
function ensureZeroSum(changes: number[], activeIndices: number[]): number[] {
  const sum = changes.reduce((a, b) => a + b, 0);
  if (Math.abs(sum) > 0.001 && activeIndices.length > 0) {
    // If not integer or small remainder, adjust on first active player
    const remainder = Math.round(sum);
    changes[activeIndices[0]] -= remainder;
  }
  return changes.map((c) => Math.round(c));
}

/**
 * Preview calculations without committing to the game state.
 */
export function getRoundScorePreview(
  bid: string,
  players: Player[],
  bidderId: number,
  partnerIds: number[],
  tricks: number | string,
  success: boolean
): { changes: number[]; summary: string; isWin: boolean } {
  const idToIndex = Object.fromEntries(players.map((p, i) => [p.id, i]));
  const bidderIndex = idToIndex[bidderId] !== undefined ? idToIndex[bidderId] : -1;
  const partnerIndices = partnerIds.map((id) => idToIndex[id]).filter((i) => i !== undefined);

  if (bidderIndex < 0 && bid !== "Schoppen dame + laatste slag") {
    return {
      changes: new Array(players.length).fill(0),
      summary: "Kies een speler",
      isWin: false,
    };
  }

  // Calculate success automatically for trick-based bids
  let effectiveSuccess = success;
  let isWin = success;

  if (bid === "Troela" || bid === "Troelalier") {
    const t = String(tricks);
    effectiveSuccess = t === "10+" || t === "kapot gespeeld" || Number(tricks) >= 10;
    isWin = effectiveSuccess;
  } else if (bid === "Trek /met") {
    const t = Number(tricks) || 0;
    effectiveSuccess = t >= 8;
    isWin = effectiveSuccess;
  } else if (bid === "Trek (alleen 5)") {
    const t = Number(tricks) || 0;
    effectiveSuccess = t >= 5;
    isWin = effectiveSuccess;
  } else if (bid === "9 alleen") {
    const t = Number(tricks) || 0;
    effectiveSuccess = t >= 9 || success;
    isWin = effectiveSuccess;
  } else if (bid === "13 alleen") {
    const t = Number(tricks) || 0;
    effectiveSuccess = t === 13 || success;
    isWin = effectiveSuccess;
  }

  const changes = calculateRoundScores(
    bid,
    effectiveSuccess,
    0,
    players,
    bidderIndex,
    partnerIndices,
    players.map((p) => p.id),
    tricks,
    false,
    partnerIds
  );

  const bidderName = players[bidderIndex]?.name || "Bieder";
  const partnerNames = partnerIndices.map((i) => players[i]?.name).filter(Boolean).join(" & ");
  const teamName = partnerNames ? `${bidderName} & ${partnerNames}` : bidderName;

  let summary = "";
  if (bid === "Schoppen dame + laatste slag") {
    summary = "Boete verrekend";
  } else {
    summary = isWin ? `${teamName} wint` : `${teamName} verliest`;
  }

  return { changes, summary, isWin };
}
