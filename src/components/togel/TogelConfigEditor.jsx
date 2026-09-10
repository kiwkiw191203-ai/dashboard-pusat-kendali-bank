import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Save, X, History, AlertTriangle, Crown, RotateCcw, Check } from "lucide-react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import { TOGEL_MARKETS } from "@/lib/togelMarkets";
import { loadLiveMarkets, fetchConfigHistory, diffBets } from "@/lib/togelConfigStore";

const pctVal = (v) => Math.round((Number(v) || 0) * 1000) / 10;

export default function TogelConfigEditor() {
  const [markets, setMarkets] = useState(() => JSON.parse(JSON.stringify(TOGEL_MARKETS)));
  const [marketKey, setMarketKey] = useState("umum");
  const [draft, setDraft] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [diff, setDiff] = useState([]);

  const market = markets.find((m) => m.key === marketKey) || markets[0];
  const savedBets = market?.bets || [];

  useEffect(() => {
    loadLiveMarkets().then((m) => { setMarkets(m); setLoading(false); });
    fetchConfigHistory(30).then(setHistory);
  }, []);

  useEffect(() => {
    const m = markets.find((mm) => mm.key === marketKey);
    setDraft(JSON.parse(JSON.stringify(m?.bets || [])));
  }, [marketKey, markets]);

  const patchBet = (idx, field, value) =>
    setDraft((prev) => prev.map((b, i) => (i === idx ? { ...b, [field]: value } : b)));
  const patchOption = (idx, oi, field, value) =>
    setDraft((prev) => prev.map((b, i) => (i === idx ? { ...b, options: b.options?.map((o, j) => (j === oi ? { ...o, [field]: value } : o)) } : b)));

  const resetDraft = () => {
    setDraft(JSON.parse(JSON.stringify(savedBets)));
    toast.info("Draft dikembalikan ke nilai tersimpan");
  };

  const handleApply = () => {
    const d = diffBets(savedBets, draft);
    if (!d.length) { toast.info("Tidak ada perubahan untuk diterapkan"); return; }
    setDiff(d);
    setShowConfirm(true);
  };

  const confirmApply = async () => {
    setSaving(true);
    try {
      const res = await base44.functions.invoke("saveTogelConfig", {
        market_key: market.key,
        market_name: market.name,
        config: draft,
        summary: diff.join(" | "),
        user_agent: navigator.userAgent,
      });
      if (res?.data?.error) throw new Error(res.data.error);
      toast.success("Perubahan diterapkan & dicatat di Activity Log");
      setShowConfirm(false);
      const m = await loadLiveMarkets();
      setMarkets(m);
      setHistory(await fetchConfigHistory(30));
    } catch (e) {
      toast.error("Gagal menerapkan: " + (e?.message || ""));
    } finally {
      setSaving(false);
    }
  };

  const groups = (() => {
    const map = new Map();
    for (const b of draft) {
      if (!map.has(b.group)) map.set(b.group, []);
      map.get(b.group).push(b);
    }
    return Array.from(map.entries());
  })();

  return (
    <div className="space-y-4">
      {/* Header + market selector */}
      <div className="overflow-hidden rounded-2xl border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3" style={{ borderColor: "var(--border)", background: "linear-gradient(135deg, var(--bg-2), var(--card-solid))" }}>
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl" style={{ background: "rgba(244,63,94,0.12)", border: "1px solid rgba(244,63,94,0.3)" }}>
              <Crown size={14} style={{ color: "var(--rose)" }} />
            </span>
            <div>
              <h3 className="font-heading text-[0.86rem] font-bold" style={{ color: "var(--text)" }}>Hadiah &amp; Diskon Togel</h3>
              <p className="text-[0.58rem]" style={{ color: "var(--text-3)" }}>Edit hadiah &amp; diskon pasaran — perubahan berlaku global &amp; butuh persetujuan</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <select value={marketKey} onChange={(e) => setMarketKey(e.target.value)} disabled={loading}
                className="appearance-none rounded-xl border py-2.5 px-3 pr-9 text-[0.78rem] font-bold outline-none focus:border-[var(--rose)]"
                style={{ background: "rgba(255,255,255,0.95)", borderColor: "rgba(0,0,0,0.12)", color: "#000" }}>
                {markets.map((m) => <option key={m.key} value={m.key} style={{ color: "#000" }}>{m.name}</option>)}
              </select>
              <i className="fa-solid fa-chevron-down pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[0.6rem]" style={{ color: "rgba(0,0,0,0.5)" }} />
            </div>
            <button onClick={resetDraft}
              className="flex items-center gap-1.5 rounded-xl border px-3 py-2.5 text-[0.72rem] font-semibold transition-colors hover:bg-[var(--hover)]"
              style={{ borderColor: "var(--border)", color: "var(--text-2)", background: "var(--card)" }}>
              <RotateCcw size={13} /> Reset Draft
            </button>
            <button onClick={handleApply}
              className="flex items-center gap-1.5 rounded-xl px-3 py-2.5 text-[0.72rem] font-bold transition-all hover:scale-[1.02]"
              style={{ background: "var(--acc-grad)", color: "#000" }}>
              <Save size={13} /> Terapkan
            </button>
          </div>
        </div>
        {market?.note && <div className="px-4 py-2 text-[0.62rem]" style={{ color: "var(--text-3)" }}>{market.note}</div>}
      </div>

      {/* Editable bets */}
      {loading ? (
        <div className="rounded-2xl border p-10 text-center text-[0.8rem]" style={{ background: "var(--card)", borderColor: "var(--border)", color: "var(--text-3)" }}>Memuat config…</div>
      ) : (
        <div className="space-y-3">
          {groups.map(([groupName, bets]) => (
            <div key={groupName} className="overflow-hidden rounded-2xl border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
              <div className="border-b px-4 py-2 text-[0.7rem] font-bold uppercase tracking-wider" style={{ borderColor: "var(--border)", background: "var(--bg-2)", color: "var(--text-3)" }}>{groupName}</div>
              <div className="space-y-2 p-3">
                {bets.map((b) => {
                  const idx = draft.findIndex((x) => x.key === b.key);
                  return <BetEditRow key={b.key} bet={b} idx={idx} onPatch={patchBet} onPatchOption={patchOption} />;
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* History */}
      <div className="overflow-hidden rounded-2xl border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: "var(--border)", background: "linear-gradient(135deg, var(--bg-2), var(--card-solid))" }}>
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl" style={{ background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.3)" }}>
              <History size={14} style={{ color: "var(--violet)" }} />
            </span>
            <h3 className="font-heading text-[0.86rem] font-bold" style={{ color: "var(--text)" }}>Histori Perubahan</h3>
          </div>
          <span className="text-[0.62rem] font-semibold" style={{ color: "var(--text-3)" }}>{history.length} catatan</span>
        </div>
        <div className="ds-scroll max-h-[280px] overflow-y-auto">
          {history.length === 0 ? (
            <div className="p-6 text-center text-[0.74rem]" style={{ color: "var(--text-3)" }}>Belum ada perubahan tercatat.</div>
          ) : history.map((h) => {
            const d = h.created_date ? new Date(h.created_date) : null;
            return (
              <div key={h.id} className="flex items-start gap-3 border-t px-4 py-2.5" style={{ borderColor: "var(--border)" }}>
                <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full" style={{ background: "var(--violet)" }} />
                <div className="min-w-0 flex-1">
                  <div className="text-[0.74rem] font-semibold" style={{ color: "var(--text)" }}>{h.name || h.email}</div>
                  <div className="text-[0.68rem] break-words" style={{ color: "var(--text-2)" }}>{h.detail}</div>
                </div>
                <span className="flex-shrink-0 text-[0.56rem]" style={{ color: "var(--text-3)" }}>{d ? d.toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short" }) : "—"}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Konfirmasi (Persetujuan) */}
      {createPortal(
        <AnimatePresence>
          {showConfirm && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => !saving && setShowConfirm(false)}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
              <motion.div initial={{ opacity: 0, scale: 0.94, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.94, y: 10 }}
                onClick={(e) => e.stopPropagation()}
                className="flex max-h-[85vh] w-[560px] max-w-[94vw] flex-col overflow-hidden rounded-3xl border"
                style={{ background: "var(--card-solid)", borderColor: "var(--border)", boxShadow: "0 32px 80px rgba(0,0,0,0.8)" }}>
                <div className="flex items-center justify-between border-b px-5 py-3.5" style={{ borderColor: "var(--border)", background: "linear-gradient(135deg, var(--bg-2), var(--card-solid))" }}>
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl" style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)" }}>
                      <AlertTriangle size={14} style={{ color: "var(--coral)" }} />
                    </span>
                    <div>
                      <h3 className="font-heading text-[0.9rem] font-bold" style={{ color: "var(--text)" }}>Persetujuan Perubahan</h3>
                      <p className="text-[0.58rem]" style={{ color: "var(--text-3)" }}>Perubahan berlaku global &amp; dicatat di Activity Log</p>
                    </div>
                  </div>
                  <button onClick={() => !saving && setShowConfirm(false)} className="flex h-8 w-8 items-center justify-center rounded-xl border" style={{ borderColor: "var(--border)", color: "var(--text-3)", background: "var(--bg-2)" }}>
                    <X size={14} />
                  </button>
                </div>
                <div className="ds-scroll flex-1 overflow-y-auto px-5 py-4">
                  <div className="mb-2 text-[0.7rem] font-bold" style={{ color: "var(--text)" }}>Pasaran: <span style={{ color: "var(--rose)" }}>{market.name}</span></div>
                  <div className="space-y-1.5">
                    {diff.map((d, i) => (
                      <div key={i} className="rounded-lg border px-3 py-2 text-[0.72rem] font-jb" style={{ borderColor: "var(--border)", background: "var(--glass)", color: "var(--text-2)" }}>{d}</div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2 border-t px-5 py-3.5" style={{ borderColor: "var(--border)", background: "var(--card-solid)" }}>
                  <button onClick={() => setShowConfirm(false)} disabled={saving}
                    className="rounded-xl border px-4 py-2.5 text-[0.74rem] font-bold transition-colors hover:bg-[var(--hover)]"
                    style={{ borderColor: "var(--border)", color: "var(--text-2)" }}>Batal</button>
                  <button onClick={confirmApply} disabled={saving}
                    className="flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-[0.74rem] font-bold transition-all hover:scale-[1.02] disabled:opacity-60"
                    style={{ background: "var(--acc-grad)", color: "#000" }}>
                    {saving ? <RotateCcw size={13} className="animate-spin" /> : <Check size={13} />} {saving ? "Menyimpan…" : "Setujui & Terapkan"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}

function BetEditRow({ bet, idx, onPatch, onPatchOption }) {
  const hasOptions = Array.isArray(bet.options);
  return (
    <div className="rounded-xl border p-3" style={{ borderColor: "var(--border)", background: "var(--glass)" }}>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[0.78rem] font-bold" style={{ color: "var(--text)" }}>{bet.label}</span>
        <span className="rounded-full px-2 py-0.5 text-[0.54rem] font-bold uppercase tracking-wider" style={{ color: "var(--rose)", background: "rgba(244,63,94,0.12)" }}>{bet.model}</span>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {(bet.model === "diskon" || bet.model === "full") && (
          <NumField label="Hadiah (x)" value={bet.prize} onChange={(v) => onPatch(idx, "prize", v)} />
        )}
        {bet.model === "bb" && (
          <>
            <NumField label="Hadiah Tepat (x)" value={bet.prize} onChange={(v) => onPatch(idx, "prize", v)} />
            <NumField label="Hadiah Terbalik (x)" value={bet.terbalikPrize} onChange={(v) => onPatch(idx, "terbalikPrize", v)} />
          </>
        )}
        {bet.model !== "full" && (
          <NumField label="Diskon (%)" value={pctVal(bet.discount)} onChange={(v) => onPatch(idx, "discount", (Number(v) || 0) / 100)} />
        )}
        {bet.model === "even" && (
          <NumField label="Kei (%)" value={pctVal(bet.kei)} onChange={(v) => onPatch(idx, "kei", (Number(v) || 0) / 100)} />
        )}
      </div>
      {hasOptions && bet.model === "multi" && (
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {bet.options.map((o, oi) => (
            <NumField key={oi} label={`${o.label} (x)`} value={o.value} onChange={(v) => onPatchOption(idx, oi, "value", v)} />
          ))}
        </div>
      )}
      {hasOptions && bet.model === "dasar" && (
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {bet.options.map((o, oi) => (
            <NumField key={oi} label={`${o.label} Kei (%)`} value={pctVal(o.kei)} onChange={(v) => onPatchOption(idx, oi, "kei", (Number(v) || 0) / 100)} />
          ))}
        </div>
      )}
    </div>
  );
}

function NumField({ label, value, onChange }) {
  return (
    <div>
      <label className="mb-1 block text-[0.56rem] font-bold uppercase tracking-wider" style={{ color: "var(--text-3)" }}>{label}</label>
      <input type="number" inputMode="decimal" value={value} step="any"
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full rounded-lg border px-2.5 py-2 text-[0.78rem] font-jb font-bold outline-none focus:border-[var(--rose)]"
        style={{ background: "rgba(255,255,255,0.95)", borderColor: "rgba(0,0,0,0.12)", color: "#000" }} />
    </div>
  );
}