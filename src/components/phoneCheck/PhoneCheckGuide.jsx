import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, AlertTriangle, History, RotateCcw, Plus, Search, ClipboardCheck, Crown, Anchor, Calculator, Lock } from "lucide-react";

const STEPS = [
  { n: 1, title: "Pilih tanggal & shift", desc: "Bar atas: tentukan tanggal dan shift (Pagi / Malam). Shift terisi otomatis sesuai jam saat ini. Centang tiap shift terpisah, dan otomatis reset saat tanggal berganti." },
  { n: 2, title: "Pilih kategori HP", desc: "Tab kategori: WD, Depo, Off, Kas, Token, Dikembalikan. Tiap tab menampilkan progres dicek/total." },
  { n: 3, title: "Centang HP", desc: "Klik kartu HP untuk centang / batal centang. Perubahan langsung tersimpan ke server dan tampil realtime ke petugas lain." },
  { n: 4, title: "Cari HP", desc: "Gunakan kolom pencarian untuk mencari berdasarkan nama HP atau bank." },
  { n: 5, title: "Simpan riwayat", desc: "Setelah selesai, klik Simpan Riwayat → isi nama petugas + catatan. Sesi tersimpan lengkap dengan daftar HP yang belum tercentang." },
];

const TABS_INFO = [
  { icon: ShieldCheck, color: "var(--green)", title: "Crosscheck HP", desc: "Daftar HP kantor + centang kehadiran per shift, ringkasan Total / Dicek / Belum Dicek." },
  { icon: AlertTriangle, color: "var(--coral)", title: "Serah Terima Kendala", desc: "Catat kendala shift, diserahkan kepada siapa, dan status open / selesai." },
  { icon: History, color: "var(--gold)", title: "Riwayat Crosscheck", desc: "Semua sesi tersimpan: petugas, jumlah OK, HP yang hilang, dan catatan." },
];

const ACCESS = [
  {
    icon: Crown, color: "var(--acc)", role: "SUPER MASTER",
    can: ["Buka halaman & centang HP", "Tambah / edit / hapus HP", "Reset centang shift", "Simpan riwayat", "Hapus kendala siapa pun"],
  },
  {
    icon: Anchor, color: "var(--gold)", role: "KAPTEN",
    can: ["Buka halaman & centang HP", "Tambah / edit / hapus HP", "Reset centang shift", "Simpan riwayat", "Hapus kendala siapa pun"],
  },
  {
    icon: Calculator, color: "var(--green)", role: "KASIR",
    can: ["Buka halaman & centang HP", "Simpan riwayat", "Catat kendala serah terima"],
    cannot: ["Tambah / edit / hapus HP", "Reset centang shift"],
  },
  {
    icon: Lock, color: "var(--coral)", role: "CS & role lain",
    cannot: ["Tidak bisa membuka halaman Cek HP Office"],
  },
];

function Card({ children, className = "" }) {
  return (
    <div className={`rounded-2xl border p-4 ${className}`} style={{ background: "var(--card)", borderColor: "var(--border)" }}>
      {children}
    </div>
  );
}

function Title({ children }) {
  return <h3 className="label-caps mb-3 text-[0.68rem]" style={{ color: "var(--text-3)" }}>{children}</h3>;
}

export default function PhoneCheckGuide() {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      {/* Fitur / Tab */}
      <div>
        <Title>Fitur Utama</Title>
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          {TABS_INFO.map((t) => (
            <Card key={t.title}>
              <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl"
                style={{ color: t.color, background: `${t.color}16`, border: `1px solid ${t.color}2e` }}>
                <t.icon size={16} />
              </div>
              <div className="text-[0.82rem] font-semibold" style={{ color: "var(--text)" }}>{t.title}</div>
              <p className="mt-1 text-[0.72rem] leading-relaxed" style={{ color: "var(--text-3)" }}>{t.desc}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Cara pakai */}
      <div>
        <Title>Cara Pakai</Title>
        <Card className="space-y-3">
          {STEPS.map((s) => (
            <div key={s.n} className="flex gap-3">
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg font-jb text-[0.68rem] font-bold"
                style={{ color: "var(--acc-2)", background: "rgba(56,189,248,0.12)", border: "1px solid rgba(56,189,248,0.28)" }}>{s.n}</span>
              <div>
                <div className="text-[0.78rem] font-semibold" style={{ color: "var(--text)" }}>{s.title}</div>
                <p className="mt-0.5 text-[0.72rem] leading-relaxed" style={{ color: "var(--text-3)" }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </Card>
      </div>

      {/* Hak akses */}
      <div>
        <Title>Hak Akses — Siapa Bisa Apa</Title>
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {ACCESS.map((a) => (
            <Card key={a.role}>
              <div className="mb-2.5 flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl"
                  style={{ color: a.color, background: `${a.color}16`, border: `1px solid ${a.color}2e` }}>
                  <a.icon size={15} />
                </span>
                <span className="text-[0.8rem] font-semibold" style={{ color: a.color }}>{a.role}</span>
              </div>
              <ul className="space-y-1">
                {(a.can || []).map((c) => (
                  <li key={c} className="flex items-start gap-2 text-[0.73rem]" style={{ color: "var(--text-2)" }}>
                    <span style={{ color: "var(--green)" }}>✓</span> {c}
                  </li>
                ))}
                {(a.cannot || []).map((c) => (
                  <li key={c} className="flex items-start gap-2 text-[0.73rem]" style={{ color: "var(--text-3)" }}>
                    <span style={{ color: "var(--coral)" }}>✕</span> {c}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </div>

      {/* Aturan reset */}
      <div>
        <Title>Aturan Reset Centang</Title>
        <Card className="space-y-3">
          <div className="flex gap-3">
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl"
              style={{ color: "var(--coral)", background: "rgba(220,38,38,0.12)", border: "1px solid rgba(220,38,38,0.28)" }}>
              <RotateCcw size={15} />
            </span>
            <div>
              <div className="text-[0.78rem] font-semibold" style={{ color: "var(--text)" }}>Reset manual — hanya KAPTEN & SUPER MASTER</div>
              <p className="mt-0.5 text-[0.72rem] leading-relaxed" style={{ color: "var(--text-3)" }}>
                Tombol <b>Reset Centang Shift Ini</b> hanya muncul untuk KAPTEN dan SUPER MASTER. Reset hanya menghapus centang pada
                <b> tanggal & shift yang sedang dipilih</b> — shift lain dan riwayat yang sudah tersimpan tidak ikut terhapus. KASIR tidak bisa reset.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl"
              style={{ color: "var(--green)", background: "rgba(5,150,105,0.12)", border: "1px solid rgba(5,150,105,0.28)" }}>
              <ClipboardCheck size={15} />
            </span>
            <div>
              <div className="text-[0.78rem] font-semibold" style={{ color: "var(--text)" }}>Reset otomatis harian</div>
              <p className="mt-0.5 text-[0.72rem] leading-relaxed" style={{ color: "var(--text-3)" }}>
                Saat tanggal berganti, semua centang otomatis kosong kembali — jadi tiap hari mulai bersih tanpa perlu reset manual.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl"
              style={{ color: "var(--acc)", background: "rgba(46,143,212,0.12)", border: "1px solid rgba(46,143,212,0.28)" }}>
              <Plus size={15} />
            </span>
            <div>
              <div className="text-[0.78rem] font-semibold" style={{ color: "var(--text)" }}>Kelola data HP</div>
              <p className="mt-0.5 text-[0.72rem] leading-relaxed" style={{ color: "var(--text-3)" }}>
                Tambah, edit, dan hapus HP juga khusus KAPTEN & SUPER MASTER. KASIR hanya mencentang, mencari
                (<Search size={11} className="inline" /> pencarian), dan menyimpan riwayat.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </motion.div>
  );
}