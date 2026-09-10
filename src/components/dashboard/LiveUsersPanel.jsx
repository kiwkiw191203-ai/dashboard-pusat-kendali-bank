import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, ArrowRight } from "lucide-react";
import { NavLink } from "react-router-dom";
import { listOnline, subscribeOnline } from "@/lib/dashboardSession";
import { ROLES } from "@/lib/permissions";

function lastActive(iso) {
  if (!iso) return "—";
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 30) return "aktif sekarang";
  if (s < 60) return `${s} detik lalu`;
  return `${Math.floor(s / 60)} menit lalu`;
}

export default function LiveUsersPanel() {
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const wrapRef = useRef(null);

  useEffect(() => {
    let alive = true;
    const refresh = async () => { const l = await listOnline(); if (alive) setUsers(l); };
    refresh();
    const unsub = subscribeOnline(refresh);
    const t = setInterval(refresh, 20000);
    return () => { alive = false; unsub?.(); clearInterval(t); };
  }, []);

  useEffect(() => {
    const onDoc = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div className="relative" ref={wrapRef}>
      <button onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-[0.72rem] font-semibold transition-colors hover:bg-[var(--hover)]"
        style={{
          borderColor: open ? "rgba(56,189,248,0.35)" : "var(--border)",
          background: open ? "rgba(56,189,248,0.1)" : "transparent",
          color: "var(--teal)",
        }}>
        <span className="status-dot" style={{ background: "var(--teal)" }} />
        {users.length}
        <Users size={12} style={{ color: "var(--nav-text-3)" }} className="hidden sm:block" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 z-50 mt-2 w-[300px] max-w-[calc(100vw-24px)] overflow-hidden rounded-2xl border"
            style={{ background: "var(--nav-bg)", borderColor: "rgba(255,255,255,0.1)", boxShadow: "0 18px 40px rgba(0,0,0,0.45)" }}>
            <div className="flex items-center justify-between border-b px-3.5 py-3" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
              <div className="flex items-center gap-2">
                <span className="status-dot" style={{ background: "var(--teal)" }} />
                <span className="text-[0.8rem] font-semibold" style={{ color: "var(--nav-text)" }}>Pengguna Online</span>
              </div>
              <span className="rounded-md px-1.5 py-0.5 text-[0.55rem] font-semibold"
                style={{ color: "var(--teal)", background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.25)" }}>
                {users.length} aktif
              </span>
            </div>

            <div className="ds-scroll max-h-[300px] overflow-y-auto">
              {users.length === 0 ? (
                <div className="px-4 py-10 text-center text-[0.72rem]" style={{ color: "var(--nav-text-3)" }}>Tidak ada pengguna aktif</div>
              ) : users.map((u) => {
                const r = ROLES[u.role] || ROLES.cs;
                return (
                  <div key={u.id} className="flex items-center gap-2.5 border-b px-3.5 py-2.5" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                    <div className="relative flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg text-[0.66rem] font-semibold text-white"
                      style={{ background: "linear-gradient(135deg, #1E6FB0 0%, #38BDF8 100%)" }}>
                      {u.avatar_url ? <img src={u.avatar_url} alt="" className="h-full w-full object-cover" /> : (u.name || u.email)[0]?.toUpperCase()}
                      <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2" style={{ background: "var(--teal)", borderColor: "var(--nav-bg)" }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[0.74rem] font-medium" style={{ color: "var(--nav-text)" }}>{u.name || u.email}</div>
                      <div className="truncate text-[0.58rem]" style={{ color: "var(--nav-text-3)" }}>{lastActive(u.last_seen)}</div>
                    </div>
                    <span className="label-caps flex-shrink-0 rounded-md px-1.5 py-0.5 text-[0.48rem]"
                      style={{ color: "var(--acc-2)", background: "rgba(56,189,248,0.1)", border: "1px solid rgba(56,189,248,0.22)" }}>
                      {r.label}
                    </span>
                  </div>
                );
              })}
            </div>

            <NavLink to="/online" onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-1.5 py-2.5 text-[0.68rem] font-medium transition-colors hover:bg-[rgba(255,255,255,0.04)]"
              style={{ color: "var(--acc-2)" }}>
              Lihat semua sesi <ArrowRight size={12} />
            </NavLink>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}