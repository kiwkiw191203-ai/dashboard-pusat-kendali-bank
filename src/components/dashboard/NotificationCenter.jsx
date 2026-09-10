import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, CheckCheck, Inbox } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { getSession } from "@/lib/dashboardAuth";

const TYPE_COLOR = {
  info: "var(--acc-2)",
  success: "var(--teal)",
  warning: "var(--gold)",
  error: "var(--coral)",
  broadcast: "var(--acc-2)",
};

function timeAgo(iso) {
  if (!iso) return "";
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "baru saja";
  if (s < 3600) return `${Math.floor(s / 60)} menit lalu`;
  if (s < 86400) return `${Math.floor(s / 3600)} jam lalu`;
  return `${Math.floor(s / 86400)} hari lalu`;
}

export default function NotificationCenter() {
  const me = getSession();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const wrapRef = useRef(null);

  const load = async () => {
    try {
      const all = await base44.entities.PushNotification.list("-created_date", 100);
      setItems(all.filter((n) => n.target_email === "*" || n.target_email === me?.email));
    } catch { setItems([]); }
  };

  useEffect(() => {
    load();
    let u;
    try { u = base44.entities.PushNotification.subscribe(load); } catch { u = () => {}; }
    return () => u?.();
  }, []);

  useEffect(() => {
    const onDoc = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const unread = items.filter((n) => !n.read);

  const markAll = async () => {
    await Promise.all(unread.map((n) => base44.entities.PushNotification.update(n.id, { read: true }).catch(() => {})));
    load();
  };

  const markOne = async (n) => {
    if (n.read) return;
    await base44.entities.PushNotification.update(n.id, { read: true }).catch(() => {});
    load();
  };

  return (
    <div className="relative" ref={wrapRef}>
      <button onClick={() => setOpen((o) => !o)}
        className="relative flex h-8 w-8 items-center justify-center rounded-xl border transition-colors hover:bg-[var(--hover)]"
        style={{
          borderColor: open ? "rgba(56,189,248,0.35)" : "var(--border)",
          color: open ? "var(--acc-2)" : "var(--text-2)",
          background: open ? "rgba(56,189,248,0.1)" : "transparent",
        }}>
        <Bell size={15} strokeWidth={1.9} />
        {unread.length > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[0.55rem] font-semibold text-white"
            style={{ background: "var(--coral)", border: "1.5px solid var(--nav-bg)" }}>
            {unread.length > 9 ? "9+" : unread.length}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 z-50 mt-2 w-[320px] max-w-[calc(100vw-24px)] overflow-hidden rounded-2xl border"
            style={{ background: "var(--nav-bg)", borderColor: "rgba(255,255,255,0.1)", boxShadow: "0 18px 40px rgba(0,0,0,0.45)" }}>
            <div className="flex items-center justify-between border-b px-3.5 py-3" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
              <div className="flex items-center gap-2">
                <span className="text-[0.8rem] font-semibold" style={{ color: "var(--nav-text)" }}>Notifikasi</span>
                {unread.length > 0 && (
                  <span className="rounded-md px-1.5 py-0.5 text-[0.55rem] font-semibold"
                    style={{ color: "var(--acc-2)", background: "rgba(56,189,248,0.12)", border: "1px solid rgba(56,189,248,0.25)" }}>
                    {unread.length} baru
                  </span>
                )}
              </div>
              {unread.length > 0 && (
                <button onClick={markAll} className="flex items-center gap-1 text-[0.62rem] font-medium" style={{ color: "var(--acc-2)" }}>
                  <CheckCheck size={12} /> Tandai dibaca
                </button>
              )}
            </div>

            <div className="ds-scroll max-h-[340px] overflow-y-auto">
              {items.length === 0 ? (
                <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
                  <Inbox size={22} style={{ color: "var(--nav-text-3)" }} />
                  <span className="text-[0.72rem]" style={{ color: "var(--nav-text-3)" }}>Belum ada notifikasi</span>
                </div>
              ) : items.map((n) => {
                const c = TYPE_COLOR[n.type] || "var(--acc-2)";
                return (
                  <button key={n.id} onClick={() => markOne(n)}
                    className="flex w-full items-start gap-2.5 border-b px-3.5 py-3 text-left transition-colors hover:bg-[rgba(255,255,255,0.04)]"
                    style={{ borderColor: "rgba(255,255,255,0.05)", background: n.read ? "transparent" : "rgba(56,189,248,0.05)" }}>
                    <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full" style={{ background: n.read ? "rgba(255,255,255,0.2)" : c }} />
                    <div className="min-w-0 flex-1">
                      {n.title && <div className="truncate text-[0.72rem] font-semibold" style={{ color: "var(--nav-text)" }}>{n.title}</div>}
                      <div className="text-[0.68rem] leading-snug" style={{ color: "var(--nav-text-2)" }}>{n.message}</div>
                      <div className="mt-1 flex items-center gap-2 text-[0.58rem]" style={{ color: "var(--nav-text-3)" }}>
                        <span>{n.from_name || "Sistem"}</span>
                        <span>·</span>
                        <span>{timeAgo(n.created_date)}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}