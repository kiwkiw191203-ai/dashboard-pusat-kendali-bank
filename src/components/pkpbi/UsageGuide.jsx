import React from "react";
import { Clipboard, Search, ShieldAlert, Copy, Trophy, UserX, Database } from "lucide-react";

const STEPS = [
  { no: 1, icon: Clipboard, title: "Salin / Tempel ID", desc: "Salin UserID dari situs mitra, lalu tempel ke kolom pencarian. Bisa juga pakai tombol Paste.", color: "var(--blue)", bg: "rgba(59,130,246,0.12)" },
  { no: 2, icon: Search, title: "Pencarian Otomatis", desc: "Hasil muncul otomatis tanpa perlu Enter. Cari berdasarkan username, situs, IP, fingerprint, atau device ID.", color: "var(--violet)", bg: "rgba(139,92,246,0.12)" },
  { no: 3, icon: ShieldAlert, title: "Cek Status Flag", desc: "Lihat apakah ID terindikasi pelanggaran Fair Play (multiple UserID, IP / device sama).", color: "var(--gold)", bg: "rgba(247,200,67,0.12)" },
  { no: 4, icon: Copy, title: "Salin Template PK", desc: "Gunakan template balasan PK yang sesuai untuk dikirim ke member. Baca peringatan dulu sebelum kirim.", color: "var(--green)", bg: "rgba(16,185,129,0.12)" },
];

const DATA_SOURCES = [
  { icon: Database, label: "Prediction Flag", desc: "Flag sistem multi-ID", color: "var(--blue)" },
  { icon: UserX, label: "Diskualifikasi", desc: "Sheet + 3 file detail", color: "var(--coral)" },
  { icon: Trophy, label: "Leaderboard", desc: "Top 50 nasional KPBI", color: "var(--gold)" },
];

export default function UsageGuide() {
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border p-6 text-center" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-3" style={{ background: "rgba(220,38,38,0.1)" }}>
          <span className="text-[0.62rem] font-bold tracking-wide uppercase" style={{ color: "var(--acc)" }}>#SIMANIS</span>
        </div>
        <h2 className="text-lg font-bold" style={{ color: "var(--text)" }}>Dashboard Pengecekan Member KPBI</h2>
        <p className="mx-auto mt-1.5 max-w-lg text-[0.8rem] leading-relaxed" style={{ color: "var(--text-3)" }}>
          Cek status diskualifikasi & prediction flag member dari berbagai sumber data dalam satu pencarian.
          Ikuti langkah di bawah untuk mulai menggunakan dashboard.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {STEPS.map((s) => (
          <div key={s.no} className="rounded-2xl border p-5 transition-all"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            <div className="flex items-start gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" style={{ background: s.bg }}>
                <s.icon size={20} style={{ color: s.color }} />
              </div>
              <div className="min-w-0">
                <span className="text-[0.6rem] font-bold uppercase" style={{ color: "var(--text-3)" }}>Langkah {s.no}</span>
                <h3 className="mt-0.5 text-sm font-semibold" style={{ color: "var(--text)" }}>{s.title}</h3>
                <p className="mt-1 text-[0.76rem] leading-relaxed" style={{ color: "var(--text-3)" }}>{s.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border p-5" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        <p className="mb-3 text-[0.62rem] font-semibold uppercase tracking-wide" style={{ color: "var(--text-3)" }}>Sumber Data Pencarian</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {DATA_SOURCES.map((d) => (
            <div key={d.label} className="flex items-center gap-3 rounded-xl border p-3" style={{ background: "var(--glass)", borderColor: "var(--border)" }}>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: "var(--bg-2)" }}>
                <d.icon size={16} style={{ color: d.color }} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold" style={{ color: "var(--text)" }}>{d.label}</p>
                <p className="truncate text-[0.66rem]" style={{ color: "var(--text-3)" }}>{d.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}