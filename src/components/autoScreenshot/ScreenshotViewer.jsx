import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Trash2 } from "lucide-react";

export default function ScreenshotViewer({ shot, onClose, onDelete, canDelete }) {
  return (
    <AnimatePresence>
      {shot && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose} className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ background: "rgba(2,4,10,0.92)", backdropFilter: "blur(16px)" }}>
          <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[900px] overflow-hidden rounded-2xl border" style={{ background: "var(--card-solid)", borderColor: "var(--border)" }}>
            <div className="flex items-center justify-between border-b px-5 py-3.5" style={{ borderColor: "var(--border)" }}>
              <div>
                <div className="text-[0.8rem] font-bold" style={{ color: "var(--text)" }}>
                  {new Date(shot.captured_at || shot.created_date).toLocaleString("id-ID")}
                </div>
                {shot.creator_email && <div className="text-[0.66rem]" style={{ color: "var(--text-3)" }}>{shot.creator_name || shot.creator_email}</div>}
              </div>
              <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-[var(--hover)]" style={{ color: "var(--text-3)" }}>
                <X size={16} />
              </button>
            </div>
            <div className="p-4">
              <img src={shot.image_url} alt="" className="max-h-[75vh] w-full rounded-lg bg-black/30 object-contain" />
              {shot.drive_link && (
                <a href={shot.drive_link} target="_blank" rel="noreferrer" className="mt-3 flex items-center justify-center gap-2 rounded-xl border py-2 text-[0.72rem] font-semibold transition-colors hover:bg-[var(--hover)]" style={{ borderColor: "var(--border)", color: "var(--acc)" }}>
                  Buka di Google Drive
                </a>
              )}
              <div className={`mt-3 grid gap-2.5 ${canDelete ? "grid-cols-2" : "grid-cols-1"}`}>
                <a href={shot.image_url} download target="_blank" rel="noreferrer"
                  className="flex items-center justify-center gap-2 rounded-xl border py-2.5 text-[0.78rem] font-semibold transition-colors hover:bg-[var(--hover)]"
                  style={{ borderColor: "var(--border)", color: "var(--text-2)" }}>
                  <Download size={14} /> Unduh
                </a>
                {canDelete && (
                  <button onClick={() => { onDelete(shot.id); onClose(); }}
                    className="flex items-center justify-center gap-2 rounded-xl border py-2.5 text-[0.78rem] font-semibold transition-colors hover:bg-[var(--hover)]"
                    style={{ borderColor: "rgba(239,68,68,0.3)", color: "var(--coral)" }}>
                    <Trash2 size={14} /> Hapus
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}