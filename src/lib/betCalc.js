export const HANDICAPS = [
  0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 2.75, 3, 3.25, 3.5, 3.75,
  4, 4.25, 4.5, 4.75, 5, 5.25, 5.5, 5.75, 6, 6.25, 6.5, 6.75, 7, 7.25, 7.5, 7.75,
  8, 8.25, 8.5, 8.75, 9, 9.25, 9.5, 9.75, 10,
];

export const RESULT_META = {
  WIN: { label: "WIN", color: "var(--green)" },
  LOSE: { label: "LOSE", color: "var(--coral)" },
  DRAW: { label: "DRAW", color: "var(--text-2)" },
  WIN_HALF: { label: "WIN ½", color: "var(--teal)" },
  LOSE_HALF: { label: "LOSE ½", color: "var(--rose)" },
};

function halfResult(line, goals) {
  if (goals > line) return "WIN";
  if (goals < line) return "LOSE";
  return "DRAW";
}

function combine(a, b) {
  if (a === b) return a;
  if (a === "DRAW" || b === "DRAW") {
    const other = a === "DRAW" ? b : a;
    return other === "WIN" ? "WIN_HALF" : "LOSE_HALF";
  }
  return "DRAW";
}

export function flip(r) {
  return { WIN: "LOSE", LOSE: "WIN", WIN_HALF: "LOSE_HALF", LOSE_HALF: "WIN_HALF", DRAW: "DRAW" }[r];
}

export function overResult(handicap, goals) {
  const frac = handicap - Math.floor(handicap);
  let lo, hi;
  if (frac === 0.25) { lo = Math.floor(handicap); hi = lo + 0.5; }
  else if (frac === 0.75) { lo = Math.floor(handicap) + 0.5; hi = lo + 0.5; }
  else { lo = hi = handicap; }
  return combine(halfResult(lo, goals), halfResult(hi, goals));
}

export function calculate({ betType, side, handicap, totalGoal }) {
  const ov = overResult(handicap, totalGoal);
  if (betType === "handicap") return flip(ov);
  return side === "under" ? flip(ov) : ov;
}

export const REF_HANDICAPS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 2.75, 3, 3.25, 3.5];
export const REF_GOALS = [0, 1, 2, 3, 4, 5];