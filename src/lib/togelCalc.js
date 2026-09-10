// Kalkulator Taruhan Togel — perhitungan & utilitas
import { TOGEL_MARKETS } from "@/lib/togelMarkets";

export const TOGEL_MARKETS_DEFAULT = TOGEL_MARKETS;

const STORE_KEY = "togel-markets-v2";

export function loadMarkets() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return JSON.parse(JSON.stringify(TOGEL_MARKETS));
}

export function saveMarkets(markets) {
  localStorage.setItem(STORE_KEY, JSON.stringify(markets));
}

export function resetMarkets() {
  const fresh = JSON.parse(JSON.stringify(TOGEL_MARKETS));
  saveMarkets(fresh);
  return fresh;
}

// Resolve bet + opsi terpilih menjadi config siap hitung
export function resolveBet(bet, option) {
  if (!bet) return { model: "diskon", prize: 0, discount: 0 };
  switch (bet.model) {
    case "multi":
      return { model: "diskon", prize: Number(option?.value) || 0, discount: Number(bet.discount) || 0 };
    case "dasar":
      return { model: "even", discount: Number(bet.discount) || 0, kei: Number(option?.kei) || 0 };
    case "bb":
      return { model: "bb", prize: bet.prize, terbalikPrize: bet.terbalikPrize, discount: Number(bet.discount) || 0 };
    case "full":
      return { model: "full", prize: bet.prize };
    case "even":
      return { model: "even", discount: Number(bet.discount) || 0, kei: Number(bet.kei) || 0 };
    default:
      return { model: "diskon", prize: bet.prize, discount: Number(bet.discount) || 0 };
  }
}

// cfg: { model, prize, discount, terbalikPrize, kei }
export function calcTogel(jumlah, cfg) {
  const nominal = Number(jumlah) || 0;
  const model = cfg?.model || "diskon";
  const discount = Number(cfg?.discount) || 0;
  const modalBayar = model === "full" ? nominal : Math.round(nominal * (1 - discount));

  let potensiMenang = 0;
  let potensiMenangTerbalik = null;
  if (model === "bb") {
    potensiMenang = Math.round(nominal * (Number(cfg.prize) || 0));
    potensiMenangTerbalik = Math.round(nominal * (Number(cfg.terbalikPrize) || 0));
  } else if (model === "even") {
    const kei = Number(cfg.kei) || 0;
    potensiMenang = Math.round(nominal * (2 - kei));
  } else {
    potensiMenang = Math.round(nominal * (Number(cfg.prize) || 0));
  }
  const profit = potensiMenang - modalBayar;
  return { nominal, model, prize: cfg?.prize, discount, kei: cfg?.kei, terbalikPrize: cfg?.terbalikPrize, modalBayar, potensiMenang, potensiMenangTerbalik, profit };
}

export function formatRp(n) {
  const v = Math.round(Number(n) || 0);
  return "Rp " + new Intl.NumberFormat("id-ID").format(v);
}

export function fmtPct(n) {
  const v = (Number(n) || 0) * 100;
  return (Math.round(v * 100) / 100).toString().replace(".", ",") + "%";
}

// Label hadiah untuk display
export function hadiahLabel(bet) {
  if (!bet) return "-";
  if (bet.model === "multi") return bet.options.map((o) => o.value + "x").join(" / ");
  if (bet.model === "bb") return `Tepat ${bet.prize}x • Terbalik ${bet.terbalikPrize}x`;
  if (bet.model === "even") return keiLabel(bet.kei);
  if (bet.model === "dasar") return bet.options.map((o) => `${o.label} (${keiLabel(o.kei)})`).join(" / ");
  return bet.prize + "x";
}

export function keiLabel(kei) {
  const v = Number(kei) || 0;
  if (v > 0) return `2x − ${fmtPct(v)}`;
  if (v < 0) return `2x + ${fmtPct(-v)}`;
  return "2x";
}