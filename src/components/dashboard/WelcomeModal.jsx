import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Sun, Moon, Coffee, Target } from "lucide-react";
import { getSession } from "@/lib/dashboardAuth";
import { useRole } from "@/lib/permissions";
import { quoteOfDay } from "@/lib/dailyQuotes";

const todayKey = () => new Date().toISOString().slice(0, 10);

function greeting(h) {
  if (h < 11) return { text: "Selamat Pagi", icon: Sun, color: "var(--gold)" };
  if (h < 15) return { text: "Selamat Siang", icon: Coffee, color: "var(--acc)" };
  if (h < 19) return { text: "Selamat Sore", icon: Sun, color: "var(--coral)" };
  return { text: "Selamat Malam", icon: Moon, color: "var(--purple)" };
}

export default function WelcomeModal() {
  const me = getSession();
  const role = useRole();
  const [open, setOpen] = useState(false);
  const day = todayKey();
  const quote = quoteOfDay(day);
  const g = greeting(new Date().getHours());

  useEffect(() => {
    if (!me?.email) return;
    const key = `cs-welcome-${me.email}`;
    if (localStorage.getItem(key) === day) return;
    const t = setTimeout(() => setOpen(true), 900);
    return () => clearTimeout(t);
  }, [me?.email, day]);

  const close = () => {
    if (me?.email) localStorage.setItem(`cs-welcome-${me.email}`, day);
    setOpen(false);
  };

  const dateLabel = new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={close}
          className="fixed inset-0 z-[70] flex items-center justify-center p-4"
          style={{ background: "rgba(8,16,28,0.66)", backdropFilter: "blur(8px)" }}>
          <motion.div initial={{ scale: 0.92, y: 22, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", damping: 22, stiffness: 260 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md overflow-hidden rounded-3xl border"
            style={{ background: "var(--card-solid)", borderColor: "var(--border)", boxShadow: "var(--shadow-lg)" }}>

            <div className="pointer-events-none absolute inset-x-0 top-0 h-[3px]" style={{ background: "linear-gradient(90deg,#1D4ED8,#FFFFFF,#60A5FA)" }} />
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-30 blur-3xl" style={{ background: `radial-gradient(circle, ${g.color}, transparent 70%)` }} />

            <button onClick={close} className="absolute right-3 top-3 z-10 rounded-lg p-1.5 hover:bg-[var(--hover)]"><X size={16} style={{ color: "var(--text-3)" }} /></button>

            <div className="relative p-6 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl text-xl font-semibold text-white"
                style={{ background: "var(--acc-grad)", boxShadow: `0 8px 24px ${g.color}33` }}>
                {me?.avatar_url ? <img src={me.avatar_url} alt="" className="h-full w-full object-cover" /> : (me?.name || me?.email || "D")[0]?.toUpperCase()}
              </div>

              <div className="stat-caps mb-1 flex items-center justify-center gap-1.5 text-[0.62rem]" style={{ color: g.color }}>
                <g.icon size={12} /> {g.text}
              </div>
              <h2 className="text-[1.25rem] font-semibold leading-tight" style={{ color: "var(--text)" }}>{me?.name || me?.email || "Pengguna"}</h2>
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[0.68rem] font-medium"
                style={{ borderColor: "var(--border-light)", background: "var(--glass)", color: "var(--text-2)" }}>
                <Target size={11} style={{ color: "var(--acc)" }} /> {role.label}
              </div>

              <p className="mt-3 text-[0.68rem]" style={{ color: "var(--text-3)" }}>{dateLabel}</p>

              <div className="mt-5 rounded-2xl border p-4 text-left" style={{ background: "var(--glass)", borderColor: "var(--border)" }}>
                <div className="label-caps mb-2 flex items-center gap-1.5 text-[0.6rem]" style={{ color: "var(--gold)" }}>
                  <Sparkles size={11} /> Semangat Hari Ini · {quote.tag}
                </div>
                <p className="text-[0.86rem] leading-relaxed" style={{ color: "var(--text)" }}>“{quote.text}”</p>
              </div>

              <button onClick={close}
                className="mt-5 w-full rounded-xl py-3 text-[0.82rem] font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: "var(--acc-grad)" }}>
                Mulai Kerja
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}