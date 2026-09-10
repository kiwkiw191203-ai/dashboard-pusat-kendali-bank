import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Calculator, Gauge, ShieldAlert, Clock, MessagesSquare, Coins } from "lucide-react";

const PENALTY = {
  danger: { color: "var(--coral)", bg: "rgba(239,68,68,0.10)", border: "rgba(239,68,68,0.35)" },
  warning: { color: "var(--gold)", bg: "rgba(247,200,67,0.10)", border: "rgba(247,200,67,0.35)" },
  success: { color: "var(--green)", bg: "rgba(16,185,129,0.10)", border: "rgba(16,185,129,0.35)" },
  info: { color: "var(--blue)", bg: "rgba(59,130,246,0.10)", border: "rgba(59,130,246,0.35)" },
};

function Chip({ tone = "info", children }) {
  const t = PENALTY[tone];
  return (
    <span className="inline-flex items-center rounded-full px-2.5 py-1 text-[0.66rem] font-bold"
      style={{ color: t.color, background: t.bg, border: `1px solid ${t.border}` }}>{children}</span>
  );
}

function Row({ label, tone, value }) {
  return (
    <li className="flex items-center justify-between gap-2 border-b px-1 py-2.5 last:border-0"
      style={{ borderColor: "var(--border)" }}>
      <span className="text-[0.76rem]" style={{ color: "var(--text-2)" }}>{label}</span>
      <Chip tone={tone}>{value}</Chip>
    </li>
  );
}

const RULE_CARDS = [
  {
    icon: Coins, color: "var(--blue)", tag: "DEPO / WD", title: "Kesalahan Biasa",
    rows: [
      { label: "1x Kesalahan", tone: "warning", value: "Potong 20%" },
      { label: "2x Kesalahan", tone: "warning", value: "Potong 45%" },
      { label: "3x Kesalahan", tone: "danger", value: "Potong 75%" },
      { label: "4x Kesalahan", tone: "danger", value: "RIP / Hangus" },
    ],
    note: <>4x DEPO = 1 Kesalahan (Sistem Lama). 2x DEPO = 1 Kesalahan (Efektif 1 Agustus). Kesalahan WD dihitung 1:1.</>,
  },
  {
    icon: Clock, color: "var(--gold)", tag: "WAKTU", title: "Keterlambatan",
    rows: [
      { label: "Dibawah 5 Menit (1-4 mnt)", tone: "warning", value: "Potong 25%" },
      { label: "5 s/d 15 Menit", tone: "danger", value: "Potong 50%" },
      { label: "Di atas 15 Menit", tone: "danger", value: "Hangus 100%" },
    ],
    note: <>INVISIBLE: 3-5 Menit (15%) · 6-10 Menit (50%) · 11-20 Menit (100%)</>,
  },
  {
    icon: MessagesSquare, color: "var(--acc)", tag: "CS", title: "Total Kesalahan Livechat",
    rows: [
      { label: "26 - 40 Kesalahan", tone: "warning", value: "Potong 15%" },
      { label: "41 - 55 Kesalahan", tone: "warning", value: "Potong 30%" },
      { label: "56 - 70 Kesalahan", tone: "danger", value: "Potong 50%" },
      { label: "71 - 85 Kesalahan", tone: "danger", value: "Potong 75%" },
      { label: "Di atas 85", tone: "danger", value: "Bonus Hangus" },
    ],
  },
];

const FATAL_ITEMS = [
  { t: "Spam", d: "Merespon menggunakan kalimat yang sama secara berulang." },
  { t: "Salah Jawab", d: "Memberikan jawaban tanpa membaca keluhan member." },
  { t: "Result > 5 Menit", d: "Terlambat result di atas 5 menit." },
  { t: "Telat Masuk Kerja", d: "Langsung diinput ke Sheet Kasus Fatal." },
];

const MAX_BONUS = 10000000;
const fmtRp = (n) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

function useCountUp(target, dur = 900) {
  const [val, setVal] = useState(0);
  const ref = useRef(0);
  useEffect(() => {
    const start = ref.current;
    const range = target - start;
    if (range === 0) return;
    let raf, t0;
    const step = (ts) => {
      if (!t0) t0 = ts;
      const p = Math.min((ts - t0) / dur, 1);
      const cur = Math.round(start + range * (1 - Math.pow(1 - p, 3)));
      setVal(cur);
      if (p < 1) raf = requestAnimationFrame(step);
      else { setVal(target); ref.current = target; }
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, dur]);
  return val;
}

export default function CsAudit() {
  const [fatal, setFatal] = useState("");
  const [biasa, setBiasa] = useState("");
  const [livechat, setLivechat] = useState("");
  const [result, setResult] = useState(null);

  const f = parseFloat(fatal) || 0;
  const b = parseFloat(biasa) || 0;
  const lc = parseFloat(livechat) || 0;

  let livechatCut = 0;
  if (lc > 85) livechatCut = 100;
  else if (lc >= 71) livechatCut = 75;
  else if (lc >= 56) livechatCut = 50;
  else if (lc >= 41) livechatCut = 30;
  else if (lc >= 26) livechatCut = 15;

  const totalCut = Math.min(f + b + livechatCut, 100);
  const sisaPct = Math.max(100 - totalCut, 0);
  let sisaRp = 0, statusText = "AMAN", statusTone = "success";
  if (f + b + livechatCut >= 100) {
    sisaRp = 5000000;
    statusText = "BONUS HANGUS (MINIM PAYOUT)";
    statusTone = "danger";
  } else {
    sisaRp = (sisaPct / 100) * MAX_BONUS;
    if (totalCut > 75) { statusText = "BAHAYA"; statusTone = "danger"; }
    else if (totalCut > 40) { statusText = "PERLU HATI-HATI"; statusTone = "warning"; }
  }

  const animateCut = useCountUp(result ? totalCut : 0);

  const compute = () => setResult({ totalCut, sisaPct, sisaRp, statusText, statusTone, livechatCut });

  const Field = ({ label, value, onChange, ph }) => (
    <div>
      <label className="mb-1.5 block text-[0.66rem] font-semibold uppercase tracking-wider" style={{ color: "var(--text-3)" }}>{label}</label>
      <input type="number" min="0" value={value} onChange={(e) => onChange(e.target.value)} placeholder={ph}
        className="w-full rounded-xl border px-3.5 py-2.5 text-[0.86rem] font-semibold outline-none transition-all focus:border-[var(--acc)]"
        style={{ background: "var(--bg-2)", borderColor: "var(--border)", color: "var(--text)" }} />
    </div>
  );

  return (
    <div className="mb-8">
      {/* Section title */}
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: "rgba(var(--acc-rgb),0.15)", color: "var(--acc)" }}>
          <ShieldAlert size={16} />
        </div>
        <div>
          <h2 className="font-heading text-[1.05rem] font-bold tracking-tight" style={{ color: "var(--text)" }}>CS Audit — Aturan & Klasifikasi Kesalahan</h2>
          <p className="text-[0.72rem]" style={{ color: "var(--text-3)" }}>Standar penilaian dan kalkulator akumulasi potongan bonus</p>
        </div>
      </div>

      {/* Rule cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {RULE_CARDS.map((c, i) => (
          <motion.div key={c.title} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06, duration: 0.4 }}
            className="relative overflow-hidden rounded-2xl border p-5" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-15 blur-2xl" style={{ background: `radial-gradient(circle, ${c.color}, transparent)` }} />
            <div className="relative">
              <div className="mb-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ color: c.color, background: `${c.color}18`, border: `1px solid ${c.color}30` }}>
                    <c.icon size={17} />
                  </div>
                  <h3 className="text-[0.92rem] font-bold" style={{ color: "var(--text)" }}>{c.title}</h3>
                </div>
                <Chip tone="info">{c.tag}</Chip>
              </div>
              <ul>
                {c.rows.map((r) => <Row key={r.label} {...r} />)}
              </ul>
              {c.note && (
                <div className="mt-3 rounded-xl border-l-2 p-3 text-[0.7rem] leading-relaxed" style={{ background: "var(--bg-2)", borderColor: c.color, color: "var(--text-3)" }}>
                  {c.note}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Fatal + rules */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4 }}
          className="overflow-hidden rounded-2xl border" style={{ background: "var(--card)", borderColor: "rgba(239,68,68,0.3)" }}>
          <div className="flex items-center justify-between border-b px-5 py-3.5" style={{ borderColor: "var(--border)", background: "var(--bg-2)" }}>
            <h3 className="flex items-center gap-2 text-[0.92rem] font-bold" style={{ color: "var(--coral)" }}>
              <AlertTriangle size={15} /> Kasus Fatal & Telat Masuk
            </h3>
            <Chip tone="danger">WARNING</Chip>
          </div>
          <div className="p-5">
            <div className="space-y-2.5 border-l-4 pl-4" style={{ borderColor: "var(--coral)" }}>
              {FATAL_ITEMS.map((it, idx) => (
                <div key={idx} className="text-[0.78rem] leading-relaxed" style={{ color: "var(--text-2)" }}>
                  <b style={{ color: "var(--text)" }}>{idx + 1}. {it.t}:</b> {it.d}
                </div>
              ))}
            </div>
            <p className="mt-3.5 text-[0.72rem] leading-relaxed" style={{ color: "var(--text-3)" }}>
              Potongan berkisar 15% - 100%. Diinput langsung oleh Auditor. Berlaku kelipatan: 1x(10%), 2x(15%), 3x(25%), 4x(50%), 5x(75%).
            </p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.4 }}
          className="overflow-hidden rounded-2xl border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <div className="flex items-center justify-between border-b px-5 py-3.5" style={{ borderColor: "var(--border)", background: "var(--bg-2)" }}>
            <h3 className="flex items-center gap-2 text-[0.92rem] font-bold" style={{ color: "var(--text)" }}>
              <Gauge size={15} style={{ color: "var(--green)" }} /> Sisa Bonus & Minimal Payout
            </h3>
            <Chip tone="success">RULES</Chip>
          </div>
          <div className="p-5">
            <ul>
              <Row label="Potongan > 100% (Khusus CS)" tone="success" value="Min Rp5.000.000" />
              <Row label="Total Akumulasi 100%" tone="danger" value="Bonus Hangus" />
            </ul>
            <div className="mt-3.5 rounded-xl border p-3.5 text-[0.76rem] leading-relaxed" style={{ background: "var(--bg-2)", borderColor: "var(--border)", color: "var(--text-2)" }}>
              <b style={{ color: "var(--acc)" }}>Rumus Akumulasi:</b><br />
              Total Potongan = % Kasus Fatal + % Kesalahan Biasa + % Livechat.<br />
              Sisa Bonus = 100% - Total Potongan.
            </div>
          </div>
        </motion.div>
      </div>

      {/* Calculator */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.4 }}
          className="rounded-2xl border p-5" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <div className="mb-4 flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: "rgba(var(--acc-rgb),0.14)", color: "var(--acc)" }}>
              <Calculator size={17} />
            </div>
            <div>
              <h3 className="text-[0.92rem] font-bold" style={{ color: "var(--text)" }}>Input Data Audit</h3>
              <p className="text-[0.68rem]" style={{ color: "var(--text-3)" }}>Masukkan persentase & jumlah kesalahan</p>
            </div>
          </div>
          <div className="space-y-3.5">
            <Field label="Persentase Kasus Fatal (%)" value={fatal} onChange={setFatal} ph="Contoh: 25" />
            <Field label="Persentase Kesalahan Biasa (%)" value={biasa} onChange={setBiasa} ph="Contoh: 25" />
            <Field label="Total Kesalahan Livechat (Jumlah)" value={livechat} onChange={setLivechat} ph="Contoh: 30" />
            {lc >= 26 && (
              <div className="rounded-xl border px-3.5 py-2.5 text-[0.72rem]" style={{ background: "var(--bg-2)", borderColor: "var(--border)", color: "var(--text-2)" }}>
                Potongan Livechat otomatis: <b style={{ color: "var(--acc)" }}>{livechatCut}%</b>
              </div>
            )}
            <button onClick={compute}
              className="w-full rounded-xl py-3 text-[0.86rem] font-bold uppercase tracking-wider text-black transition-transform hover:scale-[1.02]"
              style={{ background: "var(--acc-grad)", boxShadow: "0 6px 20px rgba(var(--acc-rgb),0.3)" }}>
              Hitung Sisa Bonus
            </button>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.4 }}
          className="flex flex-col justify-center rounded-2xl border p-5" style={{ background: "linear-gradient(160deg, var(--card) 0%, var(--bg-2) 100%)", borderColor: "var(--border)" }}>
          {!result ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: "var(--glass)", border: "1px solid var(--border)" }}>
                <Calculator size={26} style={{ color: "var(--text-3)" }} />
              </div>
              <p className="text-[0.82rem] font-medium" style={{ color: "var(--text-2)" }}>Masukkan data di sisi kiri</p>
              <p className="mt-1 text-[0.72rem]" style={{ color: "var(--text-3)" }}>Klik "Hitung Sisa Bonus" untuk melihat hasil perhitungan otomatis.</p>
            </div>
          ) : (
            <div className="text-center">
              <div className="text-[0.66rem] font-semibold uppercase tracking-[2px]" style={{ color: "var(--text-3)" }}>Total Potongan</div>
              <div className="font-display text-5xl font-black" style={{ color: statusTone === "danger" ? "var(--coral)" : statusTone === "warning" ? "var(--gold)" : "var(--green)" }}>
                {animateCut}%
              </div>
              <div className="mt-2 inline-flex rounded-full px-4 py-1.5 text-[0.78rem] font-bold"
                style={{ color: PENALTY[statusTone].color, background: PENALTY[statusTone].bg, border: `1px solid ${PENALTY[statusTone].border}` }}>
                Status: {statusText}
              </div>
              <div className="mt-5 w-full">
                <div className="mb-1.5 flex items-center justify-between text-[0.74rem]" style={{ color: "var(--text-2)" }}>
                  <span>Sisa Bonus Diterima</span>
                  <span className="font-mono font-bold" style={{ color: "var(--text)" }}>{result.sisaPct}%</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full" style={{ background: "var(--hover)" }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${result.sisaPct}%` }} transition={{ duration: 1.1, ease: "easeOut" }}
                    className="h-full rounded-full" style={{ background: statusTone === "danger" ? "linear-gradient(90deg, var(--coral), var(--acc))" : "linear-gradient(90deg, var(--green), var(--blue))" }} />
                </div>
                <div className="mt-3 font-display text-2xl font-bold" style={{ color: "var(--green)" }}>{fmtRp(result.sisaRp)}</div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}