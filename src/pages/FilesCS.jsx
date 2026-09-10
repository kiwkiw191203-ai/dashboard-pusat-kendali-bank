import React from "react";
import { Link } from "react-router-dom";
import { ExternalLink, ArrowRight, FolderOpen, Link2 } from "lucide-react";
import PageHead from "@/components/dashboard/PageHead";
import { SHORTCUTS } from "@/lib/dashboardData";

const GUIDES = [
  { icon: "fa-calculator", color: "var(--violet)", title: "Hitung Freespin", desc: "Tempel teks hasil spin untuk hitung total kemenangan otomatis.", to: "/analyzer" },
  { icon: "fa-dice", color: "var(--rose)", title: "Prediksi Togel", desc: "Generate angka prediksi untuk 24 pasaran berbeda.", to: "/predict" },
  { icon: "fa-ticket", color: "var(--cyan)", title: "Kode Tiket", desc: "Koleksi kode tiket promo PG Soft & Pragmatic siap salin.", to: "/ticket" },
  { icon: "fa-trophy", color: "var(--gold)", title: "Tangkapan Menang", desc: "Screenshot bukti kemenangan akhir per game.", to: "/win" },
  { icon: "fa-building-columns", color: "var(--blue)", title: "Profil Bank", desc: "Profil bank & e-wallet untuk verifikasi pembayaran.", to: "/bank" },
  { icon: "fa-receipt", color: "var(--teal)", title: "RRN Qris", desc: "Bukti transfer RRN dari berbagai bank & e-wallet.", to: "/rrn" },
];

export default function FilesCS() {
  return (
    <div className="w-full p-4 md:p-7">
      <PageHead icon="fa-bullhorn" title="FILE KERJA CS" subtitle="Dokumen, panduan & referensi kerja"
        badges={[{ icon: "fa-folder-open", text: `${GUIDES.length} Modul`, color: "var(--acc)" }]} />

      <div className="mb-4 flex items-center gap-2">
        <FolderOpen size={16} style={{ color: "var(--acc)" }} />
        <h2 className="font-heading text-[1.05rem] font-bold tracking-tight" style={{ color: "var(--text)" }}>Panduan Modul</h2>
      </div>
      <div className="mb-7 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
        {GUIDES.map((g, i) => (
          <Link key={g.to} to={g.to} className="group ds-in relative overflow-hidden rounded-2xl border p-5 transition-all hover:-translate-y-1 hover:border-[var(--border-active)]"
            style={{ background: "var(--card)", borderColor: "var(--border)", animationDelay: `${i * 0.05}s` }}>
            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-10 blur-2xl transition-opacity group-hover:opacity-25" style={{ background: g.color }} />
            <div className="relative">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl text-lg" style={{ color: g.color, background: `${g.color}14`, border: `1px solid ${g.color}33` }}>
                <i className={`fa-solid ${g.icon}`} />
              </div>
              <div className="mb-1.5 text-[0.95rem] font-bold" style={{ color: "var(--text)" }}>{g.title}</div>
              <p className="mb-3.5 text-[0.78rem] leading-relaxed" style={{ color: "var(--text-3)" }}>{g.desc}</p>
              <div className="flex items-center gap-1.5 text-[0.72rem] font-semibold" style={{ color: g.color }}>
                Buka modul <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mb-4 flex items-center gap-2">
        <Link2 size={16} style={{ color: "var(--purple)" }} />
        <h2 className="font-heading text-[1.05rem] font-bold tracking-tight" style={{ color: "var(--text)" }}>Link Referensi Cepat</h2>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {SHORTCUTS.map((s, i) => (
          <a key={s.u} href={s.u} target="_blank" rel="noopener noreferrer"
            className="group ds-in flex items-center gap-3.5 rounded-2xl border p-4 transition-all hover:-translate-y-1 hover:border-[var(--border-active)]"
            style={{ background: "var(--card)", borderColor: "var(--border)", animationDelay: `${i * 0.06}s` }}>
            <img src={s.img} alt={s.t} className="h-12 w-12 rounded-xl border object-cover" style={{ borderColor: "var(--border)" }} />
            <div className="min-w-0 flex-1">
              <div className="truncate text-[0.82rem] font-semibold" style={{ color: "var(--text)" }}>{s.t}</div>
              <div className="truncate text-[0.66rem]" style={{ color: "var(--text-3)" }}>Buka di tab baru</div>
            </div>
            <ExternalLink size={15} style={{ color: "var(--acc)" }} />
          </a>
        ))}
      </div>
    </div>
  );
}