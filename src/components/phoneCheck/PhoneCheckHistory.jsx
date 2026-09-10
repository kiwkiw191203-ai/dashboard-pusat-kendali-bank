import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { History, UserCheck, AlertTriangle, CheckCircle2, CalendarDays, ChevronRight } from "lucide-react";
import { PHONE_SHIFTS, SHIFT_MAP, fmtDateID } from "@/lib/phoneShifts";
import PhoneCheckLogDetailModal from "@/components/phoneCheck/PhoneCheckLogDetailModal";

function fmt(d) {
  if (!d) return "—";
  return new Date(d).toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function PhoneCheckHistory({ logs = [], loading }) {
  const [date, setDate] = useState("");
  const [shift, setShift] = useState("all");
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(() => logs.filter((l) => {
    if (date && l.check_date !== date) return false;
    if (shift !== "all" && (l.shift || "") !== shift) return false;
    return true;
  }), [logs, date, shift]);

  // Kelompokkan per tanggal
  const groups = useMemo(() => {
    const map = {};
    filtered.forEach((l) => {
      const k = l.check_date || (l.checked_at || "").slice(0, 10) || "tanpa-tanggal";
      (map[k] = map[k] || []).push(l);
    });
    return Object.entries(map).sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [filtered]);

  return (
    <div className="overflow-hidden rounded-2xl border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
      <div className="flex flex-wrap items-center gap-2.5 border-b px-4 py-3" style={{ borderColor: "var(--border)" }}>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: "rgba(var(--acc-rgb),0.14)", color: "var(--acc)" }}>
          <History size={15} />
        </div>
        <div className="flex-1">
          <div className="text-[0.84rem] font-bold" style={{ color: "var(--text)" }}>Riwayat Crosscheck</div>
          <div className="text-[0.66rem]" style={{ color: "var(--text-3)" }}>Klik satu baris untuk lihat detail HP & bank yang dicentang</div>
        </div>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
          className="rounded-lg border px-3 py-2 text-[0.76rem] font-semibold outline-none"
          style={{ background: "#FFFFFF", borderColor: "var(--border)", color: "#0F172A" }} />
        {date && (
          <button onClick={() => setDate("")} className="rounded-lg border px-2.5 py-2 text-[0.66rem] font-bold"
            style={{ borderColor: "var(--border)", color: "var(--text-2)", background: "var(--glass)" }}>Semua tanggal</button>
        )}
        <div className="flex gap-1.5">
          {[{ key: "all", label: "Semua Shift", color: "var(--acc)" }, ...PHONE_SHIFTS].map((s) => (
            <button key={s.key} onClick={() => setShift(s.key)}
              className="rounded-lg border px-2.5 py-2 text-[0.66rem] font-bold"
              style={shift === s.key
                ? { background: `${s.color}1f`, color: s.color, borderColor: `${s.color}59` }
                : { background: "var(--glass)", borderColor: "var(--border)", color: "var(--text-3)" }}>
              {s.label}
            </button>
          ))}
        </div>
        <span className="rounded-lg px-2.5 py-1 text-[0.62rem] font-bold" style={{ background: "var(--glass)", color: "var(--text-2)", border: "1px solid var(--border)" }}>{filtered.length} sesi</span>
      </div>

      {loading ? (
        <div className="space-y-2 p-4">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-14 w-full rounded-xl" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-12" style={{ color: "var(--text-3)" }}>
          <History size={26} />
          <p className="text-[0.8rem]">Belum ada riwayat crosscheck</p>
        </div>
      ) : (
        <div>
          {groups.map(([day, items]) => (
            <div key={day}>
              <div className="flex items-center gap-2 px-4 py-2.5" style={{ background: "var(--glass)", borderBottom: "1px solid var(--border)" }}>
                <CalendarDays size={13} style={{ color: "var(--acc)" }} />
                <span className="text-[0.72rem] font-bold" style={{ color: "var(--text)" }}>{day === "tanpa-tanggal" ? "Tanpa Tanggal" : fmtDateID(day)}</span>
                <span className="text-[0.64rem]" style={{ color: "var(--text-3)" }}>({items.length} sesi)</span>
              </div>
              <div className="divide-y" style={{ borderColor: "var(--border)" }}>
                {items.map((l, i) => {
                  const clean = (l.missing_count || 0) === 0;
                  const sh = SHIFT_MAP[l.shift];
                  return (
                    <motion.button key={l.id} onClick={() => setSelected(l)}
                      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i, 12) * 0.03 }}
                      className="flex w-full flex-wrap items-center gap-3 p-3.5 text-left transition-colors hover:bg-[var(--hover)]">
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl"
                        style={{ background: clean ? "rgba(16,185,129,0.14)" : "rgba(220,38,38,0.12)", color: clean ? "var(--green)" : "var(--coral)" }}>
                        {clean ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                      </div>
                      <div className="min-w-[160px] flex-1">
                        <div className="flex items-center gap-1.5 text-[0.82rem] font-bold" style={{ color: "var(--text)" }}>
                          <UserCheck size={12} style={{ color: "var(--acc)" }} /> {l.staff_name}
                        </div>
                        <div className="text-[0.66rem]" style={{ color: "var(--text-3)" }}>{l.staff_email} · {fmt(l.checked_at)}</div>
                      </div>
                      {sh && (
                        <span className="rounded-lg px-2.5 py-1.5 text-[0.66rem] font-bold"
                          style={{ background: `${sh.color}1f`, color: sh.color, border: `1px solid ${sh.color}44` }}>{sh.label}</span>
                      )}
                      <div className="flex gap-2">
                        <span className="rounded-lg px-2.5 py-1.5 text-[0.66rem] font-bold" style={{ background: "rgba(16,185,129,0.12)", color: "var(--green)" }}>Ada {l.ok_count || 0}</span>
                        <span className="rounded-lg px-2.5 py-1.5 text-[0.66rem] font-bold" style={{ background: "rgba(220,38,38,0.1)", color: "var(--coral)" }}>Kurang {l.missing_count || 0}</span>
                      </div>
                      <ChevronRight size={16} className="flex-shrink-0" style={{ color: "var(--text-3)" }} />
                    </motion.button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <PhoneCheckLogDetailModal log={selected} onClose={() => setSelected(null)} />
    </div>
  );
}