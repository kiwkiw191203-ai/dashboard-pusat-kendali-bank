import React from "react";
import { motion } from "framer-motion";
import { Clock, ShieldCheck, Activity, Server, CalendarClock, Cpu } from "lucide-react";
import CountdownBlocks, { useMaintenanceTimer } from "@/components/dashboard/MaintenanceCountdown";
import MaintenanceRobot from "@/components/dashboard/MaintenanceRobot";

const STAGES = [
  { label: "Diagnostik sistem", icon: Activity },
  { label: "Optimasi server", icon: Server },
  { label: "Kalibrasi modul AI", icon: Cpu },
  { label: "Uji kualitas", icon: ShieldCheck },
];

export default function MaintenancePage({ title, subtitle = "Sedang dalam perbaikan & peningkatan sistem", color = "var(--acc-2)" }) {
  const t = useMaintenanceTimer();

  return (
    <div className="relative w-full overflow-hidden rounded-none" style={{ minHeight: "calc(100vh - 90px)" }}>
      {/* Top scan line */}
      <motion.div animate={{ backgroundPositionX: ["0%", "200%"] }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        className="absolute inset-x-0 top-0 z-10 h-[2px]"
        style={{ background: `linear-gradient(90deg, transparent, ${color}, #60A5FA, ${color}, transparent)`, backgroundSize: "200% 100%" }} />

      <div className="grid h-full w-full grid-cols-1 lg:grid-cols-[1.05fr_1fr]" style={{ minHeight: "calc(100vh - 90px)" }}>
        {/* ── Kiri: panggung robot (navy) ── */}
        <div className="nav-surface relative flex flex-col items-center justify-center overflow-hidden px-5 py-10 text-center sm:px-10"
          style={{ background: "linear-gradient(160deg, var(--nav-bg) 0%, var(--nav-bg-2) 100%)" }}>
          <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full blur-[110px]" style={{ background: color, opacity: 0.26 }} />
          <div className="pointer-events-none absolute -bottom-28 -right-20 h-80 w-80 rounded-full blur-[110px]" style={{ background: "#60A5FA", opacity: 0.18 }} />
          {/* grid futuristik */}
          <div className="pointer-events-none absolute inset-0 opacity-[0.15]"
            style={{ backgroundImage: `linear-gradient(${color}22 1px, transparent 1px), linear-gradient(90deg, ${color}22 1px, transparent 1px)`, backgroundSize: "44px 44px" }} />

          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
            <MaintenanceRobot color={color} size={230} />
          </motion.div>

          <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="mt-8 flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[0.58rem] font-semibold uppercase tracking-[0.16em]"
            style={{ background: `${color}22`, color, border: `1px solid ${color}55` }}>
            <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.4, repeat: Infinity }}
              className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
            Under Maintenance
          </motion.span>

          <h1 className="mt-4 font-heading text-[1.5rem] font-semibold tracking-tight sm:text-[2rem]" style={{ color: "var(--nav-text)" }}>{title}</h1>
          <p className="mx-auto mt-2.5 max-w-md text-[0.85rem] leading-relaxed" style={{ color: "var(--nav-text-2)" }}>
            {subtitle}. Robot teknisi kami sedang bekerja agar fitur ini kembali lebih cepat dan lebih stabil.
          </p>

          {/* log terminal */}
          <div className="mt-7 w-full max-w-sm rounded-xl border p-3 text-left font-jb text-[0.62rem]"
            style={{ borderColor: "var(--border)", background: "rgba(0,0,0,0.25)", color: "var(--nav-text-3)" }}>
            {["> init diagnostic.core", "> patch modules ... ok", "> running integrity check"].map((l, i) => (
              <motion.div key={l} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.25 }}>
                {l}
              </motion.div>
            ))}
            <motion.span animate={{ opacity: [1, 0, 1] }} transition={{ duration: 1, repeat: Infinity }} style={{ color }}>{"> _"}</motion.span>
          </div>
        </div>

        {/* ── Kanan: status panel (light) ── */}
        <div className="flex flex-col justify-center gap-6 px-5 py-10 sm:px-10" style={{ background: "var(--bg-2)" }}>
          <div>
            <div className="label-caps mb-3 text-[0.6rem]" style={{ color: "var(--text-3)" }}>Countdown Realtime</div>
            <CountdownBlocks hours={t.hours} minutes={t.minutes} seconds={t.seconds} accent={color} />
          </div>

          {/* Progress */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="label-caps text-[0.6rem]" style={{ color: "var(--text-3)" }}>Progress Perbaikan</span>
              <span className="font-jb text-[0.85rem] font-semibold" style={{ color }}>{t.percent}%</span>
            </div>
            <div className="relative h-2.5 overflow-hidden rounded-full" style={{ background: "var(--glass-2)" }}>
              <motion.div animate={{ width: `${t.percent}%` }} transition={{ duration: 0.6, ease: "easeOut" }}
                className="absolute inset-y-0 left-0 rounded-full"
                style={{ background: `linear-gradient(90deg, #1E6FB0, ${color})`, boxShadow: `0 0 14px ${color}66` }} />
              <motion.div animate={{ x: ["-120%", "320%"] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-y-0 w-1/4 rounded-full" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)" }} />
            </div>
          </div>

          {/* Stages */}
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {STAGES.map((s, i) => {
              const SIcon = s.icon;
              return (
                <div key={s.label} className="flex items-center gap-2.5 rounded-xl border px-3 py-3"
                  style={{ background: "var(--card)", borderColor: "var(--border)" }}>
                  <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.35 }}
                    className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
                    style={{ background: `${color}18`, color }}>
                    <SIcon size={14} />
                  </motion.span>
                  <span className="text-[0.74rem] font-medium" style={{ color: "var(--text-2)" }}>{s.label}</span>
                </div>
              );
            })}
          </div>

          {/* ETA + info */}
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div className="flex items-center gap-2 rounded-xl border px-3.5 py-3" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
              <CalendarClock size={15} style={{ color }} />
              <span className="text-[0.73rem]" style={{ color: "var(--text-2)" }}>
                Estimasi selesai · <b style={{ color: "var(--text)" }}>{t.eta}</b>
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-xl border px-3.5 py-3" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
              <ShieldCheck size={15} style={{ color: "var(--green)" }} />
              <span className="text-[0.73rem]" style={{ color: "var(--text-2)" }}>Data & riwayat Anda tetap aman</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[0.65rem]" style={{ color: "var(--text-3)" }}>
            <Clock size={11} /> Countdown diperbarui otomatis setiap detik
          </div>
        </div>
      </div>
    </div>
  );
}