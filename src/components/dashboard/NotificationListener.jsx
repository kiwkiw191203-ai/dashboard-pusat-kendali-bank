import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { getSession } from "@/lib/dashboardAuth";
import { playNotifSound } from "@/lib/notifSound";
import { Megaphone, Bell, CheckCircle, AlertTriangle, AlertOctagon, Crown, X } from "lucide-react";

const TYPE_META = {
  success:  { Icon: CheckCircle,   color: "var(--green)", label: "SUKSES",     sound: "success" },
  warning:  { Icon: AlertTriangle, color: "var(--gold)",  label: "PERINGATAN", sound: "warning" },
  error:    { Icon: AlertOctagon, color: "var(--coral)", label: "PENTING",    sound: "error" },
  info:     { Icon: Bell,          color: "var(--blue)",  label: "INFO",       sound: "info" },
  broadcast:{ Icon: Megaphone,     color: "var(--acc)",   label: "PENGUMUMAN", sound: "broadcast" },
};

export default function NotificationListener() {
  const [queue, setQueue] = useState([]);
  const [flashColor, setFlashColor] = useState(null);
  const seenRef = useRef(new Set());
  const me = getSession();
  const current = queue[0];

  useEffect(() => {
    if (!me?.email) return;
    const myEmail = me.email.toLowerCase();

    const handleNotifs = async (notify = true) => {
      try {
        const all = await base44.entities.PushNotification.list("-created_date", 100);
        const mine = all.filter(
          (n) =>
            !n.read &&
            (n.target_email === "*" || String(n.target_email).toLowerCase() === myEmail) &&
            String(n.from_email).toLowerCase() !== myEmail
        );
        const newOnes = [];
        mine.forEach((n) => {
          if (!seenRef.current.has(n.id)) {
            seenRef.current.add(n.id);
            if (notify) newOnes.push(n);
          }
        });
        if (newOnes.length) {
          setQueue((q) => [...q, ...newOnes]);
          // Play sound for the first new one
          const n = newOnes[0];
          const isBroadcast = n.type === "broadcast" || n.target_email === "*";
          const soundType = isBroadcast ? "broadcast" : (TYPE_META[n.type]?.sound || "info");
          playNotifSound(soundType);
          const color = isBroadcast ? TYPE_META.broadcast.color : (TYPE_META[n.type]?.color || "var(--blue)");
          setFlashColor(color);
          setTimeout(() => setFlashColor(null), 600);
        }
      } catch {}
    };

    handleNotifs(false);
    let unsub;
    try {
      unsub = base44.entities.PushNotification.subscribe(() => handleNotifs(true));
    } catch { unsub = () => {}; }
    return () => unsub();
  }, [me?.email]);

  const dismiss = () => {
    setQueue((q) => {
      const [first, ...rest] = q;
      if (first) base44.entities.PushNotification.update(first.id, { read: true }).catch(() => {});
      return rest;
    });
  };

  useEffect(() => {
    if (!current) return;
    const t = setTimeout(dismiss, 3000);
    return () => clearTimeout(t);
  }, [current?.id]);

  const isBroadcast = current?.type === "broadcast" || current?.target_email === "*";
  const meta = current ? (TYPE_META[current.type] || TYPE_META.info) : TYPE_META.info;
  const Icon = isBroadcast ? TYPE_META.broadcast.Icon : meta.Icon;
  const color = isBroadcast ? TYPE_META.broadcast.color : meta.color;
  const isSerious = current?.type === "error" || current?.type === "warning";
  const isError = current?.type === "error" || isBroadcast;

  return (
    <>
      {/* Immersive color wash — pulses while notification is visible */}
      {current && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isSerious ? [0.6, 0.3, 0.55, 0.3] : [0.4, 0.2, 0.35, 0.2] }}
          transition={{ duration: isSerious ? 1.5 : 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none fixed inset-0 z-[99]"
          style={{ background: `radial-gradient(circle at 50% 45%, ${color}55, ${color}11 35%, transparent 78%)` }}
        />
      )}

      {/* Screen shake for serious types */}
      {current && (
        <motion.div
          animate={isError ? { x: [0, -6, 6, -4, 4, -2, 2, 0], y: [0, 2, -2, 1, -1, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }} />

          {/* Animated radial glow */}
          <motion.div
            animate={{ opacity: [0.15, 0.35, 0.15], scale: [1, 1.1, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="pointer-events-none absolute inset-0"
            style={{ background: `radial-gradient(circle at 50% 50%, ${color}22, transparent 60%)` }}
          />

          {/* Card */}
          <motion.div
            initial={{ scale: 0.5, y: 50, opacity: 0, rotateX: -20 }}
            animate={{ scale: [0.5, 1.08, 1], y: 0, opacity: 1, rotateX: 0 }}
            transition={{ scale: { type: "spring", damping: 14, stiffness: 200 }, opacity: { duration: 0.18 } }}
            className="relative w-[440px] max-w-[92vw] overflow-hidden rounded-3xl border"
            style={{
              background: `linear-gradient(160deg, ${color}10 0%, var(--card-solid) 22%, var(--card-solid) 78%, ${color}10 100%)`,
              borderColor: `${color}88`,
              boxShadow: `0 0 120px -8px ${color}, 0 0 50px ${color}55, 0 30px 70px -20px rgba(0,0,0,0.95)`,
            }}
          >
            {/* Top accent bar with glow + shimmer sweep */}
            <div className="relative h-1.5 overflow-hidden" style={{ background: color, boxShadow: `0 0 24px ${color}, 0 0 8px ${color}` }}>
              <motion.div
                animate={{ x: ["-100%", "400%"] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-y-0 w-1/4"
                style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.9), transparent)" }}
              />
            </div>

            {/* Animated glow background */}
            <motion.div
              animate={{ opacity: [0.08, 0.25, 0.08] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="pointer-events-none absolute inset-0"
              style={{ background: `radial-gradient(circle at 50% 0%, ${color}, transparent 70%)` }}
            />

            {/* Pulsing border — always on, faster & stronger for serious */}
            <motion.div
              animate={{ opacity: isSerious ? [0.45, 0.95, 0.45] : [0.2, 0.55, 0.2], boxShadow: [`inset 0 0 24px ${color}22`, `inset 0 0 56px ${color}55`, `inset 0 0 24px ${color}22`] }}
              transition={{ duration: isSerious ? 1 : 2.5, repeat: Infinity, ease: "easeInOut" }}
              className="pointer-events-none absolute inset-0 rounded-3xl"
              style={{ border: `2px solid ${color}` }}
            />

            {/* Corner accents */}
            {["top-2 left-2", "top-2 right-2", "bottom-2 left-2", "bottom-2 right-2"].map((pos) => (
              <div key={pos} className={`absolute ${pos} h-3 w-3 rounded-full`} style={{ background: color, boxShadow: `0 0 8px ${color}`, opacity: 0.4 }} />
            ))}

            {/* Content */}
            <div className="relative p-6 pt-7">
              {/* Close X */}
              <button onClick={dismiss} className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-lg transition-colors hover:bg-[var(--hover)]" style={{ color: "var(--text-3)" }}>
                <X size={15} />
              </button>

              {/* Icon with multi-ring pulse */}
              <div className="relative mx-auto mb-4 flex h-20 w-20 items-center justify-center">
                {isSerious && (
                  <motion.div
                    animate={{ scale: [1, 1.8, 1], opacity: [0.4, 0, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                    className="absolute inset-0 rounded-2xl"
                    style={{ border: `2px solid ${color}` }}
                  />
                )}
                <motion.div
                  animate={{ scale: [1, 1.35, 1], opacity: [0.6, 0, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.3 }}
                  className="absolute inset-0 rounded-2xl"
                  style={{ border: `1.5px solid ${color}` }}
                />
                <motion.div
                  animate={isError ? { rotate: [0, -5, 5, -5, 0] } : {}}
                  transition={{ duration: 0.4, repeat: isError ? 3 : 0 }}
                  className="flex h-20 w-20 items-center justify-center rounded-2xl"
                  style={{ background: `${color}1a`, color, border: `1px solid ${color}44` }}
                >
                  <Icon size={34} />
                </motion.div>
              </div>

              {/* Badge label */}
              <div className="mb-2 flex justify-center">
                <motion.span
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.15 }}
                  className="flex items-center gap-1.5 rounded-full px-3.5 py-0.5 text-[0.55rem] font-black tracking-[0.15em]"
                  style={{ color, background: `${color}14`, border: `1px solid ${color}33` }}
                >
                  {isBroadcast && <Crown size={9} />}
                  {isBroadcast ? "BROADCAST" : meta.label}
                </motion.span>
              </div>

              {/* Title */}
              <motion.h2
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-center text-[1.1rem] font-black"
                style={{ color: "var(--text)" }}
              >
                {current.title || (isBroadcast ? "Pengumuman" : "Notifikasi")}
              </motion.h2>

              {/* Message */}
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18 }}
                className="mt-2 text-center text-[0.84rem] leading-relaxed"
                style={{ color: "var(--text-2)" }}
              >
                {current.message}
              </motion.p>

              {/* Image / GIF */}
              {current.image_url && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.22 }}
                  className="mt-4 overflow-hidden rounded-2xl border"
                  style={{ borderColor: `${color}33` }}
                >
                  <img src={current.image_url} alt="" className="max-h-60 w-full object-contain bg-black/30" />
                </motion.div>
              )}

              {/* Voice message */}
              {current.audio_url && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.24 }}
                  className="mt-4 flex items-center gap-2 rounded-2xl border p-2"
                  style={{ borderColor: `${color}33`, background: `${color}0a` }}
                >
                  <audio key={current.id} src={current.audio_url} controls autoPlay className="h-9 w-full" />
                </motion.div>
              )}

              {/* From */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 }}
                className="mt-4 flex items-center justify-center gap-2"
              >
                <div className="flex items-center gap-1.5 rounded-full px-3 py-1" style={{ background: "var(--glass)", border: "1px solid var(--border)" }}>
                  <div className="h-4 w-4 rounded-full" style={{ background: "var(--acc-grad)" }} />
                  <span className="text-[0.66rem]" style={{ color: "var(--text-3)" }}>dari <strong style={{ color: "var(--text-2)" }}>{current.from_name || "Super Master"}</strong></span>
                </div>
              </motion.div>

              {/* Queue indicator */}
              {queue.length > 1 && (
                <div className="mt-3 flex justify-center gap-1">
                  {queue.slice(0, 5).map((_, i) => (
                    <div key={i} className="h-1 w-4 rounded-full" style={{ background: i === 0 ? color : "var(--border)", opacity: i === 0 ? 1 : 0.5 }} />
                  ))}
                  {queue.length > 5 && <span className="text-[0.5rem]" style={{ color: "var(--text-3)" }}>+{queue.length - 5}</span>}
                </div>
              )}

              {/* OK button */}
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={dismiss}
                className="mt-5 w-full rounded-xl py-3 text-[0.9rem] font-black text-black transition-all"
                style={{ background: color, boxShadow: `0 4px 24px ${color}66` }}
              >
                OK, MENGERTI
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}