import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, ShieldCheck } from "lucide-react";
import { CHANGELOG, BACKUP_NOTES } from "@/lib/suiteChangelog";

export default function SystemUpdatesModal({ open, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto p-4 md:p-8"
          style={{ background: "rgba(0,0,0,0.72)", backdropFilter: "blur(8px)" }}>
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ type: "spring", damping: 26, stiffness: 280 }}
            onClick={(e) => e.stopPropagation()}
            className="relative my-auto w-full max-w-[640px] overflow-hidden rounded-2xl border"
            style={{ background: "var(--card-solid)", borderColor: "rgba(247,200,67,0.3)", boxShadow: "0 40px 100px rgba(0,0,0,0.7)" }}>

            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b px-5 py-4"
              style={{ borderColor: "var(--border)", background: "linear-gradient(135deg, var(--bg-2), var(--card-solid))" }}>
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: "rgba(247,200,67,0.12)", border: "1px solid rgba(247,200,67,0.3)" }}>
                  <Sparkles size={16} style={{ color: "var(--gold)" }} />
                </span>
                <div>
                  <h2 className="font-heading text-[0.95rem] font-bold" style={{ color: "var(--text)" }}>System Update Hub</h2>
                  <p className="text-[0.62rem]" style={{ color: "var(--text-3)" }}>Riwayat pembaruan script suite</p>
                </div>
              </div>
              <button onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-[var(--hover)]"
                style={{ color: "var(--text-2)", border: "1px solid var(--border)" }}>
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="ds-scroll max-h-[72vh] space-y-4 overflow-y-auto p-5">
              {CHANGELOG.map((log, i) => (
                <div key={i}
                  className="overflow-hidden rounded-xl border"
                  style={{ borderColor: log.latest ? "rgba(16,185,129,0.35)" : "var(--border)", background: log.latest ? "rgba(16,185,129,0.04)" : "var(--bg-2)" }}>
                  <div className="flex items-center justify-between border-b px-4 py-2.5"
                    style={{ borderColor: "var(--border)" }}>
                    <span className="font-jb text-[0.6rem] font-bold tracking-wider" style={{ color: "var(--text-3)" }}>{log.date}</span>
                    {log.latest && (
                      <span className="rounded-full px-2 py-0.5 text-[0.56rem] font-bold uppercase tracking-wider"
                        style={{ background: "rgba(16,185,129,0.14)", color: "var(--green)", border: "1px solid rgba(16,185,129,0.4)" }}>
                        Latest
                      </span>
                    )}
                  </div>
                  <div className="px-4 py-3">
                    <h3 className="text-[0.82rem] font-bold" style={{ color: "var(--text)" }}>
                      {log.version} — {log.title}
                    </h3>
                    <ul className="mt-2.5 space-y-2">
                      {log.items.map((it, j) => (
                        <li key={j} className="flex gap-2.5 text-[0.74rem] leading-relaxed" style={{ color: "var(--text-2)" }}>
                          <span className="flex-shrink-0 text-[0.8rem]">{it.icon}</span>
                          <span><b style={{ color: "var(--text)" }}>{it.label}:</b> {it.text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}

              {/* Backup notes */}
              <div className="space-y-2 rounded-xl border p-4" style={{ borderColor: "rgba(247,200,67,0.25)", background: "rgba(247,200,67,0.04)" }}>
                {BACKUP_NOTES.map((n, i) => (
                  <div key={i} className="flex gap-2.5 text-[0.72rem] leading-relaxed" style={{ color: "var(--text-2)" }}>
                    <span className="flex-shrink-0">{n.icon}</span>
                    <span><b style={{ color: "var(--text)" }}>{n.label}:</b> {n.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-center gap-1.5 border-t px-5 py-3 text-[0.66rem]"
              style={{ borderColor: "var(--border)", background: "var(--bg-2)", color: "var(--text-3)" }}>
              <ShieldCheck size={12} style={{ color: "var(--acc)" }} /> Internal Suite · Update otomatis aktif
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}