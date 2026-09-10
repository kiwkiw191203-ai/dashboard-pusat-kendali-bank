import React from "react";
import { motion } from "framer-motion";
import { Banner, SectionTitle } from "@/components/bankCenter/Ui";
import { BANKS } from "@/components/bankCenter/bankCenterData";

const KPIS = [
  { icon: "fa-university", label: "Prosedur SOP Bank", val: 6, color: "var(--acc)" },
  { icon: "fa-circle-check", label: "Bank & E-wallet Online", val: BANKS.filter((b) => b.status === "Online").length, color: "var(--green)" },
  { icon: "fa-scale-balanced", label: "Pola Kasus Minus & Plus", val: 12, color: "var(--gold)" },
  { icon: "fa-list-check", label: "Item Jadwal Mutasi", val: 15, color: "var(--coral)" },
];

const QUICK = [
  { key: "sop", emoji: "🏦", title: "SOP Set All Bank BK", desc: "Langkah harian set mutasi BCA, BNI, BRI (via BK & langsung), mata merah, dana gabungan, hingga administrasi." },
  { key: "mutasi", emoji: "📘", title: "Menu Mutasi Bank", desc: "Panduan fungsi tombol, status data, aksi deposit, serta jadwal aktif & auto pull tiap bank." },
  { key: "minusplus", emoji: "⚖️", title: "Kasus Minus & Plus", desc: "Referensi troubleshooting penyebab umum & kasus khusus selisih minus maupun plus." },
  { key: "deposit", emoji: "💳", title: "Deposit & Status Bank", desc: "Indikator status online/gangguan/offline serta jam operasional tiap bank & e-wallet." },
];

export default function BerandaPanel({ onGo }) {
  return (
    <div>
      <Banner title="Pemberitahuan Penting">
        Cek indikator status bank di menu <strong>Deposit &amp; Status Bank</strong> sebelum memproses transaksi.
        <strong> BCA ONLINE 24 JAM</strong> pada Sabtu, Minggu &amp; tanggal merah 🔥. Deposit via <strong>QRIS</strong> hanya <strong>1 menit</strong>!
      </Banner>

      <SectionTitle icon="fa-chart-simple">Ringkasan Cepat</SectionTitle>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {KPIS.map((k) => (
          <div key={k.label} className="lux-card lux-topline relative flex items-center gap-4 overflow-hidden rounded-2xl border p-4"
            style={{ background: "var(--card)", borderColor: "var(--border)", backdropFilter: "blur(6px)" }}>
            <div className="flex flex-shrink-0 items-center justify-center rounded-2xl"
              style={{ width: 52, height: 52, color: k.color, background: `linear-gradient(150deg, ${k.color}22, ${k.color}0a)`, border: `1px solid ${k.color}33` }}>
              <i className={`fa-solid ${k.icon}`} style={{ fontSize: "1.15rem" }} />
            </div>
            <div className="min-w-0">
              <div className="mono-num text-[1.7rem] font-bold leading-none" style={{ color: k.color }}>{k.val}</div>
              <div className="micro-label mt-1.5" style={{ color: "var(--text-3)" }}>{k.label}</div>
            </div>
          </div>
        ))}
      </div>

      <SectionTitle icon="fa-grip">Menu Utama</SectionTitle>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {QUICK.map((q) => (
          <motion.button key={q.key} onClick={() => onGo(q.key)} whileHover={{ y: -5 }}
            className="lux-card group flex flex-col gap-2.5 rounded-2xl border p-5 text-left"
            style={{ background: "var(--card)", borderColor: "var(--border)", backdropFilter: "blur(6px)" }}>
            <div className="flex items-center justify-between">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl text-2xl"
                style={{ background: "var(--glass-2)", border: "1px solid var(--border)" }}>{q.emoji}</span>
              <i className="fa-solid fa-arrow-right transition-transform group-hover:translate-x-1" style={{ color: "var(--gold)" }} />
            </div>
            <div className="text-[0.95rem] font-bold" style={{ color: "var(--text)" }}>{q.title}</div>
            <div className="text-[0.78rem] leading-relaxed" style={{ color: "var(--text-3)" }}>{q.desc}</div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
