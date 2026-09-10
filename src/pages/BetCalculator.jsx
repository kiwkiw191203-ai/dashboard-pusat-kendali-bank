import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PageHead from "@/components/dashboard/PageHead";
import CalcHistory from "@/components/betCalc/CalcHistory";
import ReferenceTable from "@/components/betCalc/ReferenceTable";
import { base44 } from "@/api/base44Client";
import { getSession } from "@/lib/dashboardAuth";
import { HANDICAPS, RESULT_META, calculate } from "@/lib/betCalc";

const BET_TYPES = [
  { key: "overunder", label: "Over / Under", icon: "fa-arrow-up-arrow-down", desc: "Tebal total gol" },
  { key: "handicap", label: "Asian Handicap", icon: "fa-scale-balanced", desc: "Voor tim unggulan" },
];
const SIDES = [
  { key: "over", label: "Over", color: "var(--green)", icon: "fa-arrow-trend-up" },
  { key: "under", label: "Under", color: "var(--coral)", icon: "fa-arrow-trend-down" },
];
const STAT_CARDS = [
  { key: "WIN", icon: "fa-trophy" },
  { key: "LOSE", icon: "fa-circle-xmark" },
  { key: "DRAW", icon: "fa-equals" },
  { key: "WIN_HALF", icon: "fa-trophy" },
  { key: "LOSE_HALF", icon: "fa-circle-xmark" },
];

export default function BetCalculator() {
  const me = getSession();
  const [betType, setBetType] = useState("overunder");
  const [side, setSide] = useState("over");
  const [handicap, setHandicap] = useState(0.5);
  const [totalGoal, setTotalGoal] = useState(0);
  const [result, setResult] = useState(null);
  const [records, setRecords] = useState([]);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try { setRecords(await base44.entities.BetCalcRecord.list("-created_date", 80)); } catch { setRecords([]); }
  };
  useEffect(() => {
    load();
    let u; try { u = base44.entities.BetCalcRecord.subscribe(load); } catch { u = () => {}; }
    return () => u();
  }, []);

  const stats = useMemo(() => {
    const c = { WIN: 0, LOSE: 0, DRAW: 0, WIN_HALF: 0, LOSE_HALF: 0 };
    records.forEach((r) => { if (c[r.result] !== undefined) c[r.result]++; });
    return c;
  }, [records]);

  const runCalc = async () => {
    const r = calculate({ betType, side, handicap, totalGoal: Number(totalGoal) });
    setResult(r);
    setBusy(true);
    try {
      await base44.entities.BetCalcRecord.create({
        bet_type: betType,
        side: betType === "overunder" ? side : "favored",
        handicap,
        total_goal: Number(totalGoal),
        result: r,
        creator_name: me?.name || me?.email || "Unknown",
        creator_email: me?.email || "",
      });
    } catch {}
    setBusy(false);
  };
  const reset = () => { setResult(null); setHandicap(0.5); setTotalGoal(0); setSide("over"); setBetType("overunder"); };
  const onDelete = async (id) => { try { await base44.entities.BetCalcRecord.delete(id); } catch {} };
  const onKeyDown = (e) => { if (e.key === "Enter") runCalc(); };
  const meta = result ? RESULT_META[result] : null;

  return (
    <div className="w-full p-4 md:p-7">
      <PageHead
        icon="fa-calculator" color="var(--cyan)"
        title="KALKULATOR BETTING" subtitle="Hitung hasil Over/Under & Asian Handicap dengan akurasi quarter-split — realtime"
        badges={[{ text: `${records.length} Calc`, color: "var(--cyan)" }, { text: "Live Feed", color: "var(--green)" }]}
      />

      {/* Stat Board */}
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Total" value={records.length} color="var(--text)" icon="fa-layer-group" accent />
        {STAT_CARDS.map((s) => (
          <StatCard key={s.key} label={RESULT_META[s.key].label} value={stats[s.key]} color={RESULT_META[s.key].color} icon={s.icon} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_400px]">
        {/* Left column */}
        <div className="space-y-5">
          {/* Calculator */}
          <div className="overflow-hidden rounded-2xl border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            <div className="flex items-center gap-2.5 border-b px-5 py-3.5" style={{ borderColor: "var(--border)", background: "linear-gradient(135deg, var(--bg-2), var(--card-solid))" }}>
              <span className="flex h-8 w-8 items-center justify-center rounded-xl" style={{ background: "rgba(var(--cyan-rgb),0.12)", border: "1px solid rgba(var(--cyan-rgb),0.3)" }}>
                <i className="fa-solid fa-keyboard" style={{ color: "var(--cyan)", fontSize: "0.8rem" }} />
              </span>
              <h3 className="font-heading text-[0.9rem] font-bold" style={{ color: "var(--text)" }}>Calculator Input</h3>
            </div>

            <div className="p-5">
              {/* Bet Type */}
              <FieldLabel icon="fa-dice" text="Bet Type" />
              <div className="mb-4 grid grid-cols-2 gap-2.5">
                {BET_TYPES.map((t) => {
                  const active = betType === t.key;
                  return (
                    <button key={t.key} onClick={() => setBetType(t.key)}
                      className="group relative overflow-hidden rounded-xl border px-3 py-3 text-left transition-all"
                      style={active
                        ? { borderColor: "transparent", background: "var(--acc-grad)", boxShadow: "0 6px 18px rgba(var(--acc-rgb),0.3)" }
                        : { borderColor: "var(--border)", background: "var(--glass)" }}>
                      <div className="flex items-center gap-2">
                        <i className={`fa-solid ${t.icon} text-[0.8rem]`} style={{ color: active ? "#000" : "var(--text-2)" }} />
                        <span className="text-[0.8rem] font-bold" style={{ color: active ? "#000" : "var(--text)" }}>{t.label}</span>
                      </div>
                      <p className="mt-0.5 text-[0.58rem]" style={{ color: active ? "rgba(0,0,0,0.7)" : "var(--text-3)" }}>{t.desc}</p>
                    </button>
                  );
                })}
              </div>

              {/* Side */}
              <AnimatePresence mode="wait">
                {betType === "overunder" && (
                  <motion.div key="side" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <FieldLabel icon="fa-arrows-left-right" text="Pilih Sisi" />
                    <div className="mb-4 grid grid-cols-2 gap-2.5">
                      {SIDES.map((s) => {
                        const active = side === s.key;
                        return (
                          <button key={s.key} onClick={() => setSide(s.key)}
                            className="flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-[0.82rem] font-bold transition-all"
                            style={active
                              ? { borderColor: s.color, background: `${s.color}18`, color: s.color, boxShadow: `0 0 14px ${s.color}33` }
                              : { borderColor: "var(--border)", background: "var(--glass)", color: "var(--text-2)" }}>
                            <i className={`fa-solid ${s.icon} text-[0.72rem]`} /> {s.label}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Handicap + Total Goal */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <FieldLabel icon="fa-bullseye" text="Handicap" />
                  <div className="relative">
                    <select value={handicap} onChange={(e) => setHandicap(Number(e.target.value))}
                      className="w-full appearance-none rounded-xl border px-3 py-3 pr-8 text-[0.82rem] font-jb font-bold outline-none transition-colors focus:border-[var(--acc)]"
                      style={{ background: "rgba(255,255,255,0.95)", borderColor: "rgba(0,0,0,0.12)", color: "#000" }}>
                      {HANDICAPS.map((h) => <option key={h} value={h} style={{ color: "#000", background: "#fff" }}>{h}</option>)}
                    </select>
                    <i className="fa-solid fa-chevron-down pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[0.6rem]" style={{ color: "rgba(0,0,0,0.55)" }} />
                  </div>
                </div>
                <div>
                  <FieldLabel icon="fa-futbol" text="Total Goal" />
                  <input type="number" min={0} value={totalGoal} onChange={(e) => setTotalGoal(e.target.value)} onKeyDown={onKeyDown}
                    className="w-full rounded-xl border px-3 py-3 text-[0.82rem] font-jb font-bold outline-none transition-colors focus:border-[var(--acc)]"
                    style={{ background: "rgba(255,255,255,0.95)", borderColor: "rgba(0,0,0,0.12)", color: "#000" }} />
                </div>
              </div>

              {/* Buttons */}
              <div className="mt-4 flex gap-2.5">
                <button onClick={runCalc} disabled={busy}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-[0.84rem] font-bold transition-all hover:scale-[1.01] disabled:opacity-60"
                  style={{ background: "var(--acc-grad)", color: "#000", boxShadow: "0 6px 18px rgba(var(--acc-rgb),0.3)" }}>
                  <i className={`fa-solid ${busy ? "fa-spinner fa-spin" : "fa-calculator"}`} /> {busy ? "Calculating…" : "Calculate"}
                </button>
                <button onClick={reset}
                  className="flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-[0.84rem] font-semibold transition-colors hover:bg-[var(--hover)]"
                  style={{ borderColor: "var(--border)", color: "var(--text-2)" }}>
                  <i className="fa-solid fa-rotate-left" /> Reset
                </button>
              </div>
              <p className="mt-2 text-center text-[0.6rem]" style={{ color: "var(--text-3)" }}>
                <kbd className="rounded px-1.5 py-0.5 font-jb" style={{ background: "var(--glass-2)", border: "1px solid var(--border)" }}>Enter</kbd> to calculate
              </p>

              {/* Result Display */}
              <AnimatePresence mode="wait">
                <motion.div key={result || "empty"}
                  initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4 overflow-hidden rounded-2xl border p-5 text-center"
                  style={{ background: meta ? `${meta.color}10` : "var(--glass)", borderColor: meta ? `${meta.color}55` : "var(--border)" }}>
                  {meta ? (
                    <div className="relative">
                      <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full" style={{ background: `${meta.color}18`, border: `2px solid ${meta.color}`, boxShadow: `0 0 24px ${meta.color}44` }}>
                        <i className="fa-solid fa-trophy text-xl" style={{ color: meta.color }} />
                      </div>
                      <p className="text-[0.6rem] font-bold uppercase tracking-[0.2em]" style={{ color: "var(--text-3)" }}>Result</p>
                      <p className="mt-1 font-heading text-[2rem] font-black leading-none" style={{ color: meta.color }}>{meta.label}</p>
                      <p className="mt-2 text-[0.62rem]" style={{ color: "var(--text-3)" }}>
                        {betType === "handicap" ? "Asian Handicap" : side === "over" ? "Over" : "Under"} · H {handicap} · G {totalGoal}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full" style={{ background: "var(--glass)", border: "1px solid var(--border)" }}>
                        <i className="fa-solid fa-wand-magic-sparkles text-lg" style={{ color: "var(--text-3)" }} />
                      </div>
                      <p className="text-[0.82rem] font-bold" style={{ color: "var(--text-2)" }}>Ready to calculate</p>
                      <p className="mt-1 text-[0.64rem]" style={{ color: "var(--text-3)" }}>Select your bet type, handicap, and total goal — then press Calculate</p>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <ReferenceTable />
        </div>

        {/* Right: History */}
        <CalcHistory records={records} onDelete={onDelete} myEmail={me?.email} />
      </div>
    </div>
  );
}

function FieldLabel({ icon, text }) {
  return (
    <div className="mb-1.5 flex items-center gap-1.5">
      <i className={`fa-solid ${icon} text-[0.6rem]`} style={{ color: "var(--text-3)" }} />
      <label className="text-[0.64rem] font-bold uppercase tracking-wider" style={{ color: "var(--text-3)" }}>{text}</label>
    </div>
  );
}

function StatCard({ label, value, color, icon, accent }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl border p-3.5" style={{ background: accent ? "linear-gradient(135deg, var(--bg-2), var(--card-solid))" : "var(--card)", borderColor: accent ? "rgba(var(--acc-rgb),0.3)" : "var(--border)" }}>
      <div className="absolute -right-3 -top-3 opacity-10">
        <i className={`fa-solid ${icon} text-3xl`} style={{ color }} />
      </div>
      <div className="relative">
        <div className="flex items-center gap-1.5">
          <i className={`fa-solid ${icon} text-[0.62rem]`} style={{ color }} />
          <span className="text-[0.56rem] font-bold uppercase tracking-wider" style={{ color: "var(--text-3)" }}>{label}</span>
        </div>
        <div className="mt-1 font-heading text-[1.7rem] font-black leading-none" style={{ color }}>{value}</div>
      </div>
    </motion.div>
  );
}