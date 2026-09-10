import React, { useEffect, useMemo, useState } from "react";

// Target selesai: hari ini 23:59 lokal (kalau sudah lewat → besok 23:59).
export function useMaintenanceTimer() {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  return useMemo(() => {
    const d = new Date(now);
    const start = new Date(d); start.setHours(0, 0, 0, 0);
    const target = new Date(start); target.setHours(23, 59, 0, 0);
    if (now >= target.getTime()) target.setDate(target.getDate() + 1);
    const total = target.getTime() - start.getTime();
    const remain = Math.max(0, target.getTime() - now);
    const pct = Math.min(99, Math.max(1, Math.round(((total - remain) / total) * 100)));
    const s = Math.floor(remain / 1000);
    return {
      target,
      percent: pct,
      hours: String(Math.floor(s / 3600)).padStart(2, "0"),
      minutes: String(Math.floor((s % 3600) / 60)).padStart(2, "0"),
      seconds: String(s % 60).padStart(2, "0"),
      eta: target.toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }),
    };
  }, [now]);
}

export default function CountdownBlocks({ hours, minutes, seconds, accent }) {
  const items = [
    { v: hours, l: "Jam" },
    { v: minutes, l: "Menit" },
    { v: seconds, l: "Detik" },
  ];
  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-3">
      {items.map((it) => (
        <div key={it.l} className="rounded-2xl border px-2 py-3 text-center sm:py-4"
          style={{ background: "var(--glass)", borderColor: "var(--border)" }}>
          <div className="font-jb text-[1.5rem] font-semibold leading-none sm:text-[2rem]" style={{ color: accent }}>{it.v}</div>
          <div className="stat-caps mt-1.5 text-[0.55rem]" style={{ color: "var(--text-3)" }}>{it.l}</div>
        </div>
      ))}
    </div>
  );
}