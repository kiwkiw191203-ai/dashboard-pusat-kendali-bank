import React from "react";
import { CalendarDays, Sunrise, Moon, CheckCircle2, AlertTriangle } from "lucide-react";
import { PHONE_SHIFTS, todayKey } from "@/lib/phoneShifts";

const ICONS = { pagi: Sunrise, malam: Moon };

export default function ShiftDateBar({ date, setDate, shift, setShift, shiftStats }) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl border p-3" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
      <div className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: "rgba(var(--acc-rgb),0.14)", color: "var(--acc)" }}>
          <CalendarDays size={16} />
        </div>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value || todayKey())}
          className="rounded-lg border px-3 py-2.5 text-[0.8rem] font-semibold outline-none"
          style={{ background: "#FFFFFF", borderColor: "var(--border)", color: "#0F172A" }} />
        {date !== todayKey() && (
          <button onClick={() => setDate(todayKey())}
            className="rounded-lg border px-2.5 py-2 text-[0.68rem] font-bold"
            style={{ borderColor: "var(--border)", color: "var(--text-2)", background: "var(--glass)" }}>Hari ini</button>
        )}
      </div>

      <div className="h-8 w-px" style={{ background: "var(--border)" }} />

      <div className="flex flex-wrap gap-2">
        {PHONE_SHIFTS.map((s) => {
          const on = shift === s.key;
          const st = shiftStats?.[s.key] || { ok: 0, total: 0 };
          const done = st.total > 0 && st.ok === st.total;
          const Icon = ICONS[s.key] || Sunrise;
          return (
            <button key={s.key} onClick={() => setShift(s.key)}
              className="flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-[0.76rem] font-bold transition-colors"
              style={on
                ? { background: `${s.color}1f`, color: s.color, borderColor: `${s.color}59` }
                : { background: "var(--glass)", borderColor: "var(--border)", color: "var(--text-3)" }}>
              <Icon size={14} /> {s.label}
              <span className="flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[0.58rem]"
                style={{ background: on ? `${s.color}30` : "var(--hover)", color: done ? "var(--green)" : "inherit" }}>
                {done ? <CheckCircle2 size={9} /> : <AlertTriangle size={9} />} {st.ok}/{st.total}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}