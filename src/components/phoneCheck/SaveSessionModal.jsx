import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { X, ClipboardCheck, User, CalendarDays, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { SHIFT_MAP, fmtDateID } from "@/lib/phoneShifts";

const field = {
  background: "#FFFFFF",
  borderColor: "var(--border)",
  color: "#14213A",
};

export default function SaveSessionModal({ open, date, shift, total, ok, missingLabels, defaultName, busy, onClose, onSave }) {
  const sh = SHIFT_MAP[shift];
  const [name, setName] = useState(defaultName || "");
  const [note, setNote] = useState("");

  useEffect(() => { if (open) { setName(defaultName || ""); setNote(""); } }, [open, defaultName]);

  if (!open) return null;

  const submit = () => {
    if (!name.trim()) { toast.error("Nama petugas wajib diisi"); return; }
    onSave({ staffName: name.trim(), note: note.trim() });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(10,20,32,0.62)", backdropFilter: "blur(6px)" }} onClick={onClose}>
      <motion.div initial={{ scale: 0.95, y: 14, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg overflow-hidden rounded-2xl border"
        style={{ background: "var(--card-solid)", borderColor: "var(--border)", boxShadow: "var(--shadow-lg)" }}>

        <div className="flex items-center gap-3 border-b px-5 py-4" style={{ borderColor: "var(--border)" }}>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ color: sh?.color || "var(--acc)", background: `${sh?.color || "var(--acc)"}18`, border: `1px solid ${sh?.color || "var(--acc)"}33` }}>
            <ClipboardCheck size={18} />
          </div>
          <div className="flex-1">
            <h3 className="text-[0.95rem] font-bold" style={{ color: "var(--text)" }}>Simpan Riwayat Crosscheck</h3>
            <p className="text-[0.7rem]" style={{ color: "var(--text-3)" }}>Catat siapa yang bertugas pada shift ini</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-[var(--hover)]"><X size={18} style={{ color: "var(--text-2)" }} /></button>
        </div>

        <div className="space-y-4 p-5">
          {/* Ringkasan sesi */}
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { label: "Tanggal", value: fmtDateID(date), color: "var(--acc)", icon: CalendarDays },
              { label: "Shift", value: sh?.label || "—", color: sh?.color || "var(--gold)", icon: ClipboardCheck },
              { label: "Tercek", value: `${ok}/${total}`, color: total - ok ? "var(--coral)" : "var(--green)", icon: AlertTriangle },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border p-3" style={{ background: "var(--glass)", borderColor: "var(--border)" }}>
                <div className="mb-1 flex items-center gap-1.5 text-[0.6rem] font-bold uppercase tracking-wide" style={{ color: "var(--text-3)" }}>
                  <s.icon size={11} /> {s.label}
                </div>
                <div className="text-[0.82rem] font-bold" style={{ color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>

          <div>
            <label className="mb-1.5 block text-[0.68rem] font-bold uppercase tracking-wide" style={{ color: "var(--text-3)" }}>
              Petugas {sh?.label}
            </label>
            <div className="relative">
              <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-3)" }} />
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama petugas yang crosscheck…"
                className="w-full rounded-xl border py-3 pl-9 pr-3 text-[0.84rem] outline-none focus:ring-2"
                style={{ ...field, "--tw-ring-color": "rgba(var(--acc-rgb),0.28)" }} />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[0.68rem] font-bold uppercase tracking-wide" style={{ color: "var(--text-3)" }}>Catatan (opsional)</label>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="Contoh: 2 HP dibawa kapten…"
              className="w-full resize-none rounded-xl border px-3 py-2.5 text-[0.84rem] outline-none focus:ring-2"
              style={{ ...field, "--tw-ring-color": "rgba(var(--acc-rgb),0.28)" }} />
          </div>

          {missingLabels.length > 0 && (
            <div className="rounded-xl border p-3" style={{ background: "rgba(239,68,68,0.07)", borderColor: "rgba(239,68,68,0.3)" }}>
              <div className="mb-1.5 flex items-center gap-1.5 text-[0.7rem] font-bold" style={{ color: "var(--coral)" }}>
                <AlertTriangle size={12} /> {missingLabels.length} HP belum dicentang
              </div>
              <div className="ds-scroll max-h-24 overflow-y-auto text-[0.72rem] leading-relaxed" style={{ color: "var(--text-2)" }}>
                {missingLabels.join(" · ")}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2 border-t px-5 py-4" style={{ borderColor: "var(--border)" }}>
          <button onClick={onClose} className="flex-1 rounded-xl border py-2.5 text-[0.78rem] font-bold"
            style={{ borderColor: "var(--border)", color: "var(--text-2)", background: "var(--glass)" }}>Batal</button>
          <button onClick={submit} disabled={busy}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-[0.78rem] font-bold text-white disabled:opacity-60"
            style={{ background: "linear-gradient(135deg, #0F766E 0%, #14B8A6 100%)" }}>
            <ClipboardCheck size={15} /> {busy ? "Menyimpan…" : `Simpan ${sh?.short || ""}`}
          </button>
        </div>
      </motion.div>
    </div>
  );
}