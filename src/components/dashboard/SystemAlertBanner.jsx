import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { LogIn, Crown, ToggleRight, ToggleLeft, Power } from "lucide-react";

const EVENT_META = {
  login:        { Icon: LogIn,       color: "var(--green)",  label: "USER LOGIN" },
  logout:       { Icon: LogIn,       color: "var(--text-2)", label: "USER LOGOUT" },
  role_change:  { Icon: Crown,       color: "var(--gold)",   label: "ROLE DIUBAH" },
  feature_on:   { Icon: Power,       color: "var(--green)",  label: "FITUR DIAKTIFKAN" },
  feature_off:  { Icon: Power,       color: "var(--coral)",  label: "FITUR DINONAKTIFKAN" },
  custom:       { Icon: ToggleRight, color: "var(--acc)",    label: "EVENT" },
};

export default function SystemAlertBanner() {
  const [current, setCurrent] = useState(null);
  const [queue, setQueue] = useState([]);
  const seenRef = useRef(new Set());
  const timerRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      try {
        const all = await base44.entities.LiveEvent.list("-created_date", 30);
        all.forEach((e) => seenRef.current.add(e.id));
      } catch {}
    };
    load();

    let unsub;
    try {
      unsub = base44.entities.LiveEvent.subscribe(async () => {
        try {
          const all = await base44.entities.LiveEvent.list("-created_date", 30);
          const fresh = all.filter((e) => !seenRef.current.has(e.id));
          fresh.forEach((e) => seenRef.current.add(e.id));
          if (fresh.length) {
            const ordered = [...fresh].reverse();
            setQueue((q) => [...q, ...ordered]);
          }
        } catch {}
      });
    } catch { unsub = () => {}; }
    return () => { unsub(); if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  useEffect(() => {
    if (current || queue.length === 0) return;
    setCurrent(queue[0]);
    setQueue((q) => q.slice(1));

    timerRef.current = setTimeout(() => {
      setCurrent(null);
    }, 5000);

    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [current, queue]);

  if (!current) return null;

  const meta = EVENT_META[current.event_type] || EVENT_META.custom;
  const Icon = meta.Icon;
  const color = current.accent_color || meta.color;
  const isOff = current.event_type === "feature_off";

  return (
    <AnimatePresence mode="wait">
      {current && (
        <motion.div
          key={current.id}
          initial={{ y: -60, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -60, opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="fixed left-1/2 top-14 z-[90] -translate-x-1/2 px-4"
          style={{ width: "min(640px, 92vw)" }}
        >
          <div
            className="relative overflow-hidden rounded-2xl border backdrop-blur-xl"
            style={{
              background: `${color}11`,
              borderColor: `${color}55`,
              boxShadow: `0 8px 40px -8px ${color}44, 0 0 0 1px ${color}22`,
            }}
          >
            {/* Animated top glow line */}
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-x-0 top-0 h-px"
              style={{ background: color, boxShadow: `0 0 12px ${color}` }}
            />

            {/* Scanning shine */}
            <motion.div
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
              className="pointer-events-none absolute inset-0"
              style={{ background: `linear-gradient(90deg, transparent, ${color}22, transparent)`, width: "50%" }}
            />

            <div className="relative flex items-center gap-3 px-4 py-3">
              {/* Icon with pulse */}
              <div className="relative flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl" style={{ background: `${color}1a`, border: `1px solid ${color}44` }}>
                <motion.div
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="absolute inset-0 rounded-xl"
                  style={{ border: `1.5px solid ${color}` }}
                />
                <Icon size={16} style={{ color }} />
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[0.5rem] font-black tracking-[0.18em]" style={{ color }}>{meta.label}</span>
                  {isOff && (
                    <motion.span
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="rounded-full px-1.5 py-0.5 text-[0.42rem] font-bold"
                      style={{ background: `${color}22`, color, border: `1px solid ${color}44` }}
                    >
                      OFFLINE
                    </motion.span>
                  )}
                </div>
                <motion.div
                  animate={isOff ? { x: [0, -2, 2, -2, 0] } : {}}
                  transition={{ duration: 0.3, repeat: isOff ? 3 : 0 }}
                  className="truncate text-[0.74rem] font-bold"
                  style={{ color: "var(--text)" }}
                >
                  {current.message}
                </motion.div>
              </div>

              {/* LIVE dot */}
              <div className="flex flex-shrink-0 items-center gap-1">
                <motion.span
                  animate={{ opacity: [1, 0.2, 1], scale: [1, 1.3, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="h-2 w-2 rounded-full"
                  style={{ background: color, boxShadow: `0 0 8px ${color}` }}
                />
                <span className="text-[0.46rem] font-black tracking-widest" style={{ color }}>LIVE</span>
              </div>
            </div>

            {/* Progress bar countdown */}
            <motion.div
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: 5, ease: "linear" }}
              className="absolute bottom-0 left-0 h-0.5"
              style={{ background: color, boxShadow: `0 0 6px ${color}` }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}