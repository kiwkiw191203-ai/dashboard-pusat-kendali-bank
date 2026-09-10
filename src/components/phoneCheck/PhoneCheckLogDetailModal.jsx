import React from "react";
import { motion } from "framer-motion";
import { X, UserCheck, CalendarDays, CheckCircle2, AlertTriangle, StickyNote } from "lucide-react";
import { SHIFT_MAP, fmtDateID } from "@/lib/phoneShifts";

function fmt(d) {
  if (!d) return "—";
  return new Date(d).toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function PhoneCheckLogDetailModal({ log, onClose }) {
  if (!log) return null;
  const sh = SHIFT_MAP[log.shift];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(10,20,32,0.62)", backdropFilter: "blur(6px)" }} onClick={onClose}>
      <motion.div initial={{ scale: 0.95, y: 14, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="ds-scroll flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border"
        style={{ background: "var(--card-solid)", borderColor: "var(--border)", boxShadow: "var(--shadow-lg)" }}>

        <div className="flex items-center gap-3 border-b px-5 py-4" style={{ borderColor: "var(--border)" }}>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ color: sh?.color || "var(--acc)", background: `${sh?.color || "var(--acc)"}18`, border: `1px solid ${sh?.color || "var(--acc)"}33` }}>
            <UserCheck size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-[0.92rem] font-bold" style={{ color: "var(--text)" }}>{log.staff_name}</h3>
            <p className="truncate text-[0.7rem]" style={{ color: "var(--text-3)" }}>{log.staff_email} · {log.staff_role || "—"}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-[var(--hover)]"><X size={18} style={{ color: "var(--text-2)" }} /></button>
        </div>

        <div className="ds-scroll flex-1 space-y-4 overflow-y-auto p-5">
          <div className="grid grid-cols-3 gap-2.5">
            <div className="rounded-xl border p-3" style={{ background: "var(--glass)", borderColor: "var(--border)" }}>
              <div className="mb-1 flex items-center gap-1.5 text-[0.58rem] font-bold uppercase tracking-wide" style={{ color: "var(--text-3)" }}>
                <CalendarDays size={11} /> Tanggal
              </div>
              <div className="text-[0.76rem] font-bold" style={{ color: "var(--acc)" }}>{fmtDateID(log.check_date)}</div>
            </div>
            <div className="rounded-xl border p-3" style={{ background: "var(--glass)", borderColor: "var(--border)" }}>
              <div className="mb-1 text-[0.58rem] font-bold uppercase tracking-wide" style={{ color: "var(--text-3)" }}>Shift</div>
              <div className="text-[0.76rem] font-bold" style={{ color: sh?.color || "var(--gold)" }}>{sh?.label || "—"}</div>
            </div>
            <div className="rounded-xl border p-3" style={{ background: "var(--glass)", borderColor: "var(--border)" }}>
              <div className="mb-1 text-[0.58rem] font-bold uppercase tracking-wide" style={{ color: "var(--text-3)" }}>Waktu Simpan</div>
              <div className="text-[0.72rem] font-bold" style={{ color: "var(--text-2)" }}>{fmt(log.checked_at)}</div>
            </div>
          </div>

          <div className="flex gap-2">
            <span className="flex-1 rounded-lg px-2.5 py-1.5 text-center text-[0.7rem] font-bold" style={{ background: "var(--glass)", color: "var(--text-2)", border: "1px solid var(--border)" }}>Total {log.total || 0}</span>
            <span className="flex-1 rounded-lg px-2.5 py-1.5 text-center text-[0.7rem] font-bold" style={{ background: "rgba(16,185,129,0.12)", color: "var(--green)" }}>Ada {log.ok_count || 0}</span>
            <span className="flex-1 rounded-lg px-2.5 py-1.5 text-center text-[0.7rem] font-bold" style={{ background: "rgba(220,38,38,0.1)", color: "var(--coral)" }}>Kurang {log.missing_count || 0}</span>
          </div>

          {log.notes && (
            <div className="rounded-xl border p-3" style={{ background: "var(--glass)", borderColor: "var(--border)" }}>
              <div className="mb-1 flex items-center gap-1.5 text-[0.6rem] font-bold uppercase tracking-wide" style={{ color: "var(--text-3)" }}>
                <StickyNote size={11} /> Catatan
              </div>
              <div className="text-[0.78rem]" style={{ color: "var(--text-2)" }}>{log.notes}</div>
            </div>
          )}

          <div>
            <div className="mb-1.5 flex items-center gap-1.5 text-[0.72rem] font-bold" style={{ color: "var(--green)" }}>
              <CheckCircle2 size={13} /> Sudah Dicentang ({log.checked_labels?.length || 0})
            </div>
            {log.checked_labels?.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {log.checked_labels.map((item, i) => (
                  <span key={i} className="rounded-lg px-2.5 py-1 text-[0.68rem] font-medium" style={{ background: "rgba(16,185,129,0.1)", color: "var(--green)", border: "1px solid rgba(16,185,129,0.25)" }}>{item}</span>
                ))}
              </div>
            ) : (
              <p className="text-[0.72rem]" style={{ color: "var(--text-3)" }}>Tidak ada data tersimpan.</p>
            )}
          </div>

          <div>
            <div className="mb-1.5 flex items-center gap-1.5 text-[0.72rem] font-bold" style={{ color: "var(--coral)" }}>
              <AlertTriangle size={13} /> Belum Dicentang ({log.missing_labels?.length || 0})
            </div>
            {log.missing_labels?.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {log.missing_labels.map((item, i) => (
                  <span key={i} className="rounded-lg px-2.5 py-1 text-[0.68rem] font-medium" style={{ background: "rgba(220,38,38,0.08)", color: "var(--coral)", border: "1px solid rgba(220,38,38,0.25)" }}>{item}</span>
                ))}
              </div>
            ) : (
              <p className="text-[0.72rem]" style={{ color: "var(--text-3)" }}>Semua HP tercentang — tidak ada yang kurang.</p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}