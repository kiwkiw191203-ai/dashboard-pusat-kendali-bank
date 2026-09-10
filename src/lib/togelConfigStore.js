// Store config togel live (entity-backed, fallback ke default)
import { base44 } from "@/api/base44Client";
import { TOGEL_MARKETS } from "@/lib/togelMarkets";

// Ambil markets merged: default + override dari entity TogelMarketConfig
export async function loadLiveMarkets() {
  try {
    const recs = await base44.entities.TogelMarketConfig.list("-updated_date", 50);
    const map = new Map(recs.map((r) => [r.market_key, r]));
    return TOGEL_MARKETS.map((m) => {
      const rec = map.get(m.key);
      if (!rec) return m;
      try {
        const bets = JSON.parse(rec.config_json || "[]");
        if (Array.isArray(bets) && bets.length) return { ...m, bets };
        return m;
      } catch {
        return m;
      }
    });
  } catch {
    return JSON.parse(JSON.stringify(TOGEL_MARKETS));
  }
}

// Riwayat perubahan config togel (ActivityLog action: togel_config)
export async function fetchConfigHistory(limit = 30) {
  try {
    return await base44.entities.ActivityLog.filter({ action: "togel_config" }, "-created_date", limit);
  } catch {
    return [];
  }
}

export function diffBets(saved, draft) {
  const lines = [];
  const pct = (v) => Math.round((Number(v) || 0) * 10000) / 100 + "%";
  for (let i = 0; i < draft.length; i++) {
    const s = saved[i] || {};
    const d = draft[i];
    if (!d) continue;
    const changes = [];
    if (d.prize !== undefined && s.prize !== d.prize) changes.push(`Hadiah ${s.prize}→${d.prize}`);
    if (d.terbalikPrize !== undefined && s.terbalikPrize !== d.terbalikPrize) changes.push(`Terbalik ${s.terbalikPrize}→${d.terbalikPrize}`);
    if (d.model !== "full" && (Number(s.discount) || 0) !== (Number(d.discount) || 0)) changes.push(`Diskon ${pct(s.discount)}→${pct(d.discount)}`);
    if (d.kei !== undefined && (Number(s.kei) || 0) !== (Number(d.kei) || 0)) changes.push(`Kei ${pct(s.kei)}→${pct(d.kei)}`);
    if (Array.isArray(d.options) && Array.isArray(s.options)) {
      for (let oi = 0; oi < d.options.length; oi++) {
        const so = s.options[oi] || {};
        const dop = d.options[oi] || {};
        if (dop.value !== undefined && so.value !== dop.value) changes.push(`${dop.label || so.label}: ${so.value}→${dop.value}`);
        if (dop.kei !== undefined && (Number(so.kei) || 0) !== (Number(dop.kei) || 0)) changes.push(`${dop.label || so.label} kei: ${pct(so.kei)}→${pct(dop.kei)}`);
      }
    }
    if (changes.length) lines.push(`${d.label}: ${changes.join(", ")}`);
  }
  return lines;
}