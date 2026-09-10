import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { LogIn, LogOut, Crown, Power, Zap, UserPen } from "lucide-react";

const EVENT_ICON = {
  login: LogIn,
  logout: LogOut,
  role_change: Crown,
  feature_on: Power,
  feature_off: Power,
  profile_update: UserPen,
  custom: Zap,
};

export default function LiveTicker() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const all = await base44.entities.LiveEvent.list("-created_date", 20);
        setEvents(all);
      } catch { setEvents([]); }
    };
    load();
    let unsub;
    try { unsub = base44.entities.LiveEvent.subscribe(load); } catch { unsub = () => {}; }
    return () => unsub();
  }, []);

  if (!events.length) return null;

  const ordered = [...events].reverse();

  const renderEvent = (e, idx) => {
    const Icon = EVENT_ICON[e.event_type] || Zap;
    const color = e.accent_color || "var(--acc)";
    const isOff = e.event_type === "feature_off";
    return (
      <span key={`${e.id || idx}`} className="inline-flex items-center gap-2 mx-8">
        <Icon size={11} style={{ color }} className="flex-shrink-0" />
        <span
          className="h-1.5 w-1.5 rounded-full flex-shrink-0"
          style={{ background: color, boxShadow: `0 0 6px ${color}` }}
        />
        <span
          className="text-[0.7rem] font-bold tracking-wide"
          style={{ color, textShadow: isOff ? `0 0 8px ${color}66` : "none" }}
        >
          {e.message}
        </span>
        <span className="mx-2 text-[0.5rem]" style={{ color: "var(--text-3)" }}>◆</span>
      </span>
    );
  };

  return (
    <div
      className="relative flex flex-shrink-0 items-center overflow-hidden border-y"
      style={{ background: "var(--bg-2)", borderColor: "var(--border)", height: 34 }}
    >
      {/* LIVE badge */}
      <div
        className="z-10 flex h-full flex-shrink-0 items-center gap-1.5 px-3"
        style={{ background: "var(--card-solid)", borderRight: "1px solid var(--border)" }}
      >
        <motion.span
          animate={{ opacity: [1, 0.3, 1], scale: [1, 1.4, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="h-2 w-2 flex-shrink-0 rounded-full"
          style={{ background: "var(--coral)", boxShadow: "0 0 8px var(--coral)" }}
        />
        <span className="text-[0.52rem] font-black tracking-[0.2em]" style={{ color: "var(--coral)" }}>LIVE</span>
      </div>

      {/* Scrolling content */}
      <div className="flex-1 overflow-hidden">
        <div className="inline-block whitespace-nowrap" style={{ animation: "ticker-scroll 45s linear infinite" }}>
          {ordered.map(renderEvent)}
          {ordered.map((e, i) => renderEvent(e, `dup-${i}`))}
        </div>
      </div>

      {/* Fade edges */}
      <div className="pointer-events-none absolute left-12 top-0 h-full w-8" style={{ background: "linear-gradient(to right, var(--bg-2), transparent)" }} />
      <div className="pointer-events-none absolute right-0 top-0 h-full w-8" style={{ background: "linear-gradient(to left, var(--bg-2), transparent)" }} />
    </div>
  );
}