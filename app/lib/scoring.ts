export function calculateRoundScores(
  bid: string,
  success: boolean,
  bonus: number,
  players: any[],
  bidderIndex: number,
  duoIndices: number[] = [],
  activePlayerIds: number[],
  tricksMade: any = 0,
  allCards: boolean = false,
  penaltyPlayers: number[] = []
) {
  const changes = new Array(players.length).fill(0);
  const idToIndex = Object.fromEntries(players.map((p, i) => [p.id, i]));
  const activeIndices = players
    .map((p, i) => (activePlayerIds.includes(p.id) ? i : -1))
    .filter((i) => i !== -1);

  // 🂡 --- Schoppen dame + laatste slag ---
if (bid === "Schoppen dame + laatste slag") {
  const allActive = players
    .map((p, i) => (activePlayerIds.includes(p.id) ? i : -1))
    .filter((i) => i !== -1);

  const duo = [bidderIndex, ...duoIndices.map((id) => idToIndex[id])];

  if (duo.length === 1) {
    // Only bidder plays
    allActive.forEach((i) => {
      if (i === duo[0]) changes[i] -= 15;
      else changes[i] += 5;
    });
  } else if (duo.length === 2) {
    // Bidder and one partner play together
    allActive.forEach((i) => {
      if (duo.includes(i)) changes[i] -= 5;
      else changes[i] += 5;
    });
  }

  return changes;
}


// 🂮 --- Troela / Troelalier ---
if (["Troela", "Troelalier"].includes(bid)) {
  let base = 0;

  // Normalize tricksMade to string (important!)
  const tricks = String(tricksMade);

  if (tricks === "10+") base = 15;
  else if (tricks === "kapot gespeeld") base = 20;
  else if (tricks === "10-") base = -15;

  const duo = [bidderIndex, ...duoIndices.map((id) => idToIndex[id])];
  const others = activeIndices.filter((i) => !duo.includes(i));

  console.log("Troela debug =>", { bid, tricksMade, tricks, base, duo, others });

  duo.forEach((i) => (changes[i] += base));
  others.forEach((i) => (changes[i] -= base));

  return changes;
}




 // 🂫 --- Trek /met ---
if (bid === "Trek /met") {
  const duo = [bidderIndex, ...duoIndices.map((id) => idToIndex[id])];
  const others = activeIndices.filter((i) => !duo.includes(i));

  // ✅ auto-evaluate success
  const isSuccess = tricksMade >= 8;
  let points = 0;

  if (isSuccess) {
    // ✅ Won the round
    if (tricksMade === 8) points = 5;
    else if (tricksMade < 13) points = 5 + (tricksMade - 8);
    else if (tricksMade === 13) points = 15;
  } else {
    // ❌ Lost the round (fewer than 8 tricks)
    // 7 tricks = -5, 6 = -6, 5 = -7, ...
    points = -(5 + (7 - tricksMade));
  }

  // Apply scoring — duo earns/loses, others opposite
  duo.forEach((i) => (changes[i] += points));
  others.forEach((i) => (changes[i] -= (points * duo.length) / others.length));

  console.log("Trek/met debug =>", {
    tricksMade,
    isSuccess,
    points,
    duo,
    others,
    changes,
  });

  return changes;
}


 // 🂪 --- Trek (alleen 5) ---
if (bid === "Trek (alleen 5)") {
  const others = activeIndices.filter((i) => i !== bidderIndex);
  const tricks = tricksMade ?? 0;

  let points = 0;

  if (tricks >= 5) {
    // ✅ Success case
    if (tricks === 5) points = 15;
    else if (tricks < 13) points = 15 + (tricks - 5) * 3;
    else if (tricks === 13) points = 45;
  } else {
    // ❌ Failed case
    // 4 tricks = -15, 3 = -18, 2 = -21, etc.
    points = -15 - (4 - tricks) * 3;
  }

  // Apply the score
  changes[bidderIndex] += points;
  others.forEach((i) => (changes[i] -= points / others.length));

  console.log("Trek (alleen 5) debug =>", {
    tricksMade,
    points,
    bidderIndex,
    others,
    changes,
  });

  return changes;
}


  // 🂩 --- Regular solo bids ---
  const baseValues: Record<string, number> = {
    "9 alleen": 10,
    "Kaartje vragen": 15,
    "Misère": 15,
    "Open Misère": 20,
    "13 alleen": 25,
  };

  const base = baseValues[bid] || 0;
  const participants = [bidderIndex, ...duoIndices.map((id) => idToIndex[id])];
  const winners = success
    ? participants
    : activeIndices.filter((i) => !participants.includes(i));
  const losers = success
    ? activeIndices.filter((i) => !participants.includes(i))
    : participants;

  const perOpponent = base + bonus;

  for (const l of losers) changes[l] -= perOpponent * winners.length;
  for (const w of winners) changes[w] += perOpponent * losers.length;

  // ✅ Ensure total = 0
  const total = changes.reduce((a, b) => a + b, 0);
  if (total !== 0) changes[bidderIndex] -= total;

  return changes;
}
