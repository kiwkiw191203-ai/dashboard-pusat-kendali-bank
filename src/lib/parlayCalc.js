export const PARLAY_STATUSES = [
  { key: "win", label: "Menang", short: "W", color: "var(--green)" },
  { key: "win_half", label: "Menang Setengah", short: "W½", color: "var(--blue)" },
  { key: "draw", label: "Seri", short: "D", color: "var(--gold)" },
  { key: "lose_half", label: "Kalah Setengah", short: "L½", color: "#F59E0B" },
  { key: "lose", label: "Kalah", short: "L", color: "var(--coral)" },
];

export const STATUS_META = {
  WIN: { label: "WIN", color: "var(--green)", bg: "rgba(16,185,129,0.14)" },
  "HALF WIN": { label: "HALF WIN", color: "var(--blue)", bg: "rgba(59,130,246,0.14)" },
  DRAW: { label: "DRAW", color: "var(--gold)", bg: "rgba(247,200,67,0.14)" },
  "HALF LOSE": { label: "HALF LOSE", color: "#F59E0B", bg: "rgba(245,158,11,0.14)" },
  LOSE: { label: "LOSE", color: "var(--coral)", bg: "rgba(239,68,68,0.14)" },
};

// Konversi odds satu tim sesuai status
export function convertOdds(odds, status) {
  const o = Number(odds) || 0;
  switch (status) {
    case "win": return o;
    case "win_half": return ((o - 1) / 2) + 1; // rumus menang setengah
    case "draw": return 1;
    case "lose_half": return 0.5;
    case "lose": return 0;
    default: return o;
  }
}

// teams: [{ name, odds, status }]
export function calcParlay(stake, teams) {
  const nominal = Number(stake) || 0;
  const isLose = teams.some((t) => t.status === "lose");
  const converted = teams.map((t) => ({ ...t, odds: Number(t.odds) || 0, converted: convertOdds(t.odds, t.status) }));

  if (isLose) {
    return { isLose, totalOdds: 0, profit: -nominal, totalPayout: 0, finalStatus: "LOSE", converted };
  }

  let totalOdds = 1;
  converted.forEach((t) => { totalOdds *= t.converted; });
  totalOdds = Math.round(totalOdds * 10000) / 10000;
  const profit = (totalOdds - 1) * nominal;
  const totalPayout = totalOdds * nominal;
  const hasHalf = converted.some((t) => t.status === "win_half" || t.status === "lose_half");

  let finalStatus;
  if (totalOdds > 1) finalStatus = hasHalf ? "HALF WIN" : "WIN";
  else if (Math.abs(totalOdds - 1) < 1e-9) finalStatus = "DRAW";
  else finalStatus = totalOdds < 0.5 ? "LOSE" : "HALF LOSE";

  return { isLose, totalOdds, profit, totalPayout, finalStatus, converted };
}

// Langkah perhitungan teks
export function buildSteps(stake, result) {
  const { converted, totalOdds, profit, totalPayout, isLose } = result;
  if (isLose) {
    return [
      "Status: Kalah terdeteksi pada salah satu tim.",
      "Seluruh Parlay dinyatakan LOST.",
      "Total Odds = 0",
      "Profit = -Nominal Betting",
      `Profit = ${formatRp(-Math.abs(Number(stake) || 0))}`,
    ];
  }
  const oddsLine = converted.map((t) => fmt(t.converted)).join(" × ");
  const beforeSub = fmt(totalOdds);
  const afterSub = fmt(totalOdds - 1);
  return [
    `${oddsLine} = ${beforeSub}`,
    `${beforeSub} - 1 = ${afterSub}`,
    `${afterSub} × ${formatRp(stake)} = ${formatRp(profit)}`,
    `Total Pembayaran = ${fmt(totalOdds)} × ${formatRp(stake)} = ${formatRp(totalPayout)}`,
  ];
}

function fmt(n) {
  const v = Math.round((Number(n) || 0) * 10000) / 10000;
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 4 }).format(v);
}

export function formatRp(n) {
  const v = Math.round(Number(n) || 0);
  return "Rp " + new Intl.NumberFormat("id-ID").format(v);
}

export const PARLAY_EXAMPLES = [
  { name: "Contoh 1 — Semua Menang", stake: 100000, teams: [
    { name: "A", odds: 1.8, status: "win" },
    { name: "B", odds: 2.0, status: "win" },
    { name: "C", odds: 1.9, status: "win" },
  ]},
  { name: "Contoh 2 — Menang Setengah", stake: 100000, teams: [
    { name: "A", odds: 1.8, status: "win" },
    { name: "B", odds: 2.0, status: "win_half" },
    { name: "C", odds: 1.9, status: "win" },
  ]},
  { name: "Contoh 3 — Seri", stake: 100000, teams: [
    { name: "A", odds: 1.8, status: "win" },
    { name: "B", odds: 2.0, status: "win" },
    { name: "C", odds: 1.9, status: "draw" },
  ]},
  { name: "Contoh 4 — Kalah Setengah", stake: 100000, teams: [
    { name: "A", odds: 1.8, status: "win" },
    { name: "B", odds: 2.0, status: "lose_half" },
    { name: "C", odds: 1.9, status: "win" },
  ]},
  { name: "Contoh 5 — 2 Kalah Setengah", stake: 100000, teams: [
    { name: "A", odds: 1.8, status: "win" },
    { name: "B", odds: 2.0, status: "lose_half" },
    { name: "C", odds: 1.9, status: "lose_half" },
  ]},
];