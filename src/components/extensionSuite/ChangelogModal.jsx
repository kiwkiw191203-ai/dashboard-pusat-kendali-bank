import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles } from "lucide-react";

const LOGS = [
  {
    date: "21 APRIL 2026",
    header: "V3.1 - Apology Duration Tracker & Pengecekan",
    latest: true,
    items: [
      { b: "Apology Duration Tracker 🙏:", t: "Melacak waktu target 2 menit untuk SLA minta maaf (salah respon/kurang sesuai). Menyediakan visual target interaktif dengan notifikasi Aman/Melanggar secara realtime." },
      { b: "Dynamic Trigger Keywords 🎛️:", t: "Kalimat pemicu untuk Timer Pengecekan (4 kalimat) dan Apology (2 kalimat) kini terintegrasi penuh ke dalam orba KY MANURUNG 1! Atur sesuka hati langsung dari Settings Dashboard." },
      { b: "Optimasi UI Pop-up 🔍:", t: "Pop-up notifikasi kini diposisikan erat di pojok kanan-bawah. Posisi ini memastikan notifikasi tidak menutupi ruang pengetikan obrolan." },
    ],
  },
  {
    date: "20 APRIL 2026",
    header: "V3.0 - Pengecekan Timer & Setup",
    items: [
      { b: "LiveChat Pengecekan Timer ⏱️:", t: "Melacak durasi pengecekan ke pusat. Memunculkan lencana interaktif (2M/3M/5M)." },
      { b: "Auto-Sync Tech 🔄:", t: "Setelan disimpan aman dan sinkron antar script." },
    ],
  },
  {
    date: "03 FEBRUARI 2026",
    header: "V2.4 - Pink Royale & Master Logic",
    items: [
      { b: "Rainbow Master Logic 🌈:", t: "Deteksi member mengetik 100% akurat. Status pelangi otomatis kalah jika chat masuk tahap SLA 2 menit agar Agent tetap fokus." },
      { b: "Gentle Yellow Pulse ⏳:", t: "Indikator kuning (2 menit) kini berdetak tenang (Pulse) untuk peringatan yang elegan." },
      { b: "Signature Branding:", t: "Redesain total website dengan tema Pink Neon Pink eksklusif oleh KY MANURUNG." },
    ],
  },
  {
    date: "31 JANUARI 2026",
    header: "V2.2 - Security & Utility",
    items: [
      { b: "Smart Auto-Scroll ✨:", t: "Tambahan tombol roket mini 🚀 untuk kembali ke atas dashboard." },
      { b: "Data Vault:", t: "Fitur Export/Import settingan (.json) untuk backup permanen." },
    ],
  },
];

export default function ChangelogModal({ open, onClose }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
          onClick={onClose}>
          <motion.div
            initial={{ scale: 0.94, y: 18 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.94, y: 18 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="ds-in relative max-h-[86vh] w-full max-w-[640px] overflow-hidden rounded-3xl border"
            style={{ background: "var(--card-solid)", borderColor: "rgba(var(--acc-rgb),0.25)", boxShadow: "0 30px 80px -20px rgba(0,0,0,0.7)" }}>

            <div className="sticky top-0 z-10 flex items-center justify-between border-b px-6 py-4"
              style={{ borderColor: "var(--border)", background: "linear-gradient(135deg, var(--bg-2), var(--card-solid))" }}>
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: "rgba(var(--acc-rgb),0.14)", border: "1px solid rgba(var(--acc-rgb),0.3)" }}>
                  <Sparkles size={15} style={{ color: "var(--acc)" }} />
                </span>
                <div>
                  <h2 className="font-heading text-[0.95rem] font-bold" style={{ color: "var(--text)" }}>System Update Hub</h2>
                  <p className="text-[0.6rem]" style={{ color: "var(--text-3)" }}>Riwayat pembaruan Highlighter Pro Suite</p>
                </div>
              </div>
              <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg border transition-colors hover:bg-[var(--hover)]"
                style={{ borderColor: "var(--border)", color: "var(--text-2)" }}>
                <X size={15} />
              </button>
            </div>

            <div className="ds-scroll max-h-[68vh] space-y-4 overflow-y-auto px-6 py-5">
              {LOGS.map((log) => (
                <div key={log.date} className="rounded-2xl border p-4" style={{ borderColor: log.latest ? "rgba(var(--acc-rgb),0.35)" : "var(--border)", background: log.latest ? "rgba(var(--acc-rgb),0.05)" : "var(--glass)" }}>
                  <div className="mb-1 font-jb text-[0.6rem] font-bold tracking-widest" style={{ color: log.latest ? "var(--acc)" : "var(--text-3)" }}>{log.date}</div>
                  <div className="mb-2.5 flex items-center gap-2 text-[0.82rem] font-bold" style={{ color: "var(--text)" }}>
                    {log.header}
                    {log.latest && <span className="rounded-full px-2 py-0.5 text-[0.5rem] font-black text-black" style={{ background: "var(--acc-grad)" }}>Latest</span>}
                  </div>
                  <ul className="space-y-1.5">
                    {log.items.map((it, i) => (
                      <li key={i} className="flex gap-2 text-[0.72rem] leading-relaxed" style={{ color: "var(--text-2)" }}>
                        <span style={{ color: "var(--acc)" }}>•</span>
                        <span><b style={{ color: "var(--text)" }}>{it.b}</b> {it.t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              <div className="rounded-2xl border p-4 text-[0.68rem] leading-relaxed" style={{ borderColor: "var(--border)", background: "var(--glass)", color: "var(--text-2)" }}>
                <p className="mb-2">💡 <b style={{ color: "var(--text)" }}>Cara Pakai Backup:</b> Menuju <b style={{ color: "var(--text)" }}>Settings (icon ⚙️)</b> di Dashboard &gt; Klik <b style={{ color: "var(--text)" }}>EXPORT</b> untuk simpan data ke PC. Klik <b style={{ color: "var(--text)" }}>IMPORT</b> untuk mengembalikan data.</p>
                <p>🛡️ <b style={{ color: "var(--text)" }}>Aman:</b> Sekalipun Anda restart PC atau hapus history, data tetap ada! Selalu lakukan Export setelah menambah banyak kata kunci baru sebagai tindakan jaga-jaga.</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}