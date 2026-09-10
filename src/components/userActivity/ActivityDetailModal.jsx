import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Activity } from "lucide-react";
import HourTimeline from "./HourTimeline";

const fmt = (iso) => iso ? new Date(iso).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" }) : "—";

function Cell({ label, value, mono }) {
  return (
    <div className="rounded-xl border px-3 py-2" style={{ background: "var(--bg-2)", borderColor: "var(--border)" }}>
      <div className="label-caps mb-0.5 text-[0.5rem]" style={{ color: "var(--text-3)" }}>{label}</div>
      <div className={`truncate text-[0.72rem] font-medium ${mono ? "font-jb" : ""}`} style={{ color: "var(--text)" }}>{value || "—"}</div>
    </div>
  );
}

export default function ActivityDetailModal({ row, dateLabel, onClose }) {
  return (
    <AnimatePresence>
      {row && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
            className="fixed inset-0 z-40 bg-black/55 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, x: "-50%", y: "-50%" }}
            animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
            exit={{ opacity: 0, scale: 0.95, x: "-50%", y: "-50%" }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="ds-scroll fixed left-1/2 top-1/2 z-50 max-h-[88vh] w-[720px] max-w-[94vw] overflow-y-auto rounded-2xl border p-5"
            style={{ background: "var(--card-solid)", borderColor: "var(--border)", boxShadow: "0 30px 70px rgba(0,0,0,0.6)" }}>

            <div className="mb-4 flex items-start gap-3">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl text-[0.8rem] font-semibold text-white"
                style={{ background: "linear-gradient(135deg,#1E6FB0,#38BDF8)" }}>
                {row.avatar_url ? <img src={row.avatar_url} alt="" className="h-full w-full object-cover" /> : (row.name || row.email || "?")[0]?.toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[0.95rem] font-semibold" style={{ color: "var(--text)" }}>{row.name || row.email}</div>
                <div className="truncate text-[0.68rem]" style={{ color: "var(--text-3)" }}>{row.email} · {row.roleLabel}</div>
              </div>
              <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-xl border"
                style={{ borderColor: "var(--border)", color: "var(--text-3)", background: "var(--bg-2)" }}>
                <X size={14} />
              </button>
            </div>

            <div className="mb-4 rounded-xl border p-3" style={{ background: "var(--bg-2)", borderColor: "var(--border)" }}>
              <div className="mb-2 flex items-center justify-between">
                <span className="label-caps text-[0.52rem]" style={{ color: "var(--text-3)" }}>Timeline 24 Jam</span>
                <span className="font-jb text-[0.6rem]" style={{ color: "var(--acc-2)" }}>{dateLabel}</span>
              </div>
              <HourTimeline buckets={row.buckets} />
            </div>

            <div className="mb-4 grid grid-cols-2 gap-2 md:grid-cols-3">
              <Cell label="Status" value={row.online ? "Online" : "Offline"} />
              <Cell label="Login Terakhir" value={fmt(row.lastLoginAt)} />
              <Cell label="Durasi Aktif" value={row.durationText} />
              <Cell label="Aktivitas Hari Ini" value={row.todayCount} />
              <Cell label="Total Login" value={row.loginCount} />
              <Cell label="Terakhir Terlihat" value={fmt(row.lastSeen)} />
              <Cell label="Device" value={row.device} />
              <Cell label="OS" value={row.os} />
              <Cell label="Browser" value={row.browser} />
              <Cell label="IP Address" value={row.ip} mono />
              <Cell label="Lokasi" value={row.location} />
              <Cell label="Aktivitas Terakhir" value={row.lastActivityText} />
            </div>

            <div className="label-caps mb-2 flex items-center gap-2 text-[0.52rem]" style={{ color: "var(--text-3)" }}>
              <Activity size={11} style={{ color: "var(--acc-2)" }} /> Riwayat Aktivitas
            </div>
            <div className="space-y-1.5">
              {row.logs.length === 0 && (
                <div className="rounded-xl border px-3 py-6 text-center text-[0.7rem]"
                  style={{ background: "var(--bg-2)", borderColor: "var(--border)", color: "var(--text-3)" }}>
                  Tidak ada aktivitas pada tanggal ini
                </div>
              )}
              {row.logs.map((l) => (
                <div key={l.id} className="flex items-start gap-3 rounded-xl border px-3 py-2"
                  style={{ background: "var(--bg-2)", borderColor: "var(--border)" }}>
                  <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full" style={{ background: "var(--acc-2)" }} />
                  <div className="min-w-0 flex-1">
                    <div className="text-[0.7rem] font-medium" style={{ color: "var(--text)" }}>{l.action}</div>
                    {l.detail && <div className="truncate text-[0.64rem]" style={{ color: "var(--text-3)" }}>{l.detail}</div>}
                  </div>
                  <span className="flex-shrink-0 font-jb text-[0.6rem]" style={{ color: "var(--text-3)" }}>
                    {l.created_date ? new Date(l.created_date).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) : "—"}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}