import React from "react";
import { SectionTitle, Panel, PanelTitle, KeyValue } from "@/components/bankCenter/Ui";
import { MUTASI_GROUPS, JADWAL_MUTASI } from "@/components/bankCenter/bankCenterData";

export default function MutasiPanel() {
  return (
    <div>
      <SectionTitle icon="fa-circle-info">Pengertian Mutasi Bank</SectionTitle>
      <Panel>
        <p className="text-[0.86rem] leading-relaxed" style={{ color: "var(--text-2)" }}>
          <strong style={{ color: "var(--text)" }}>Mutasi Bank</strong> adalah halaman utama untuk mengelola, memantau, dan memproses data transaksi
          dari rekening bank maupun sumber pembayaran lainnya. Menu ini menjadi pusat pengelolaan mutasi, mulai dari melihat data,
          pengecekan saldo, pengurutan, hapus mutasi, hingga proses approval.
        </p>
      </Panel>

      <SectionTitle icon="fa-bolt">Fungsi Tombol &amp; Aksi</SectionTitle>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {MUTASI_GROUPS.map((g) => (
          <Panel key={g.title}>
            <PanelTitle icon={g.icon}>{g.title}</PanelTitle>
            {g.items.map(([k, v]) => <KeyValue key={k} label={k} value={v} />)}
          </Panel>
        ))}
      </div>

      <SectionTitle icon="fa-calendar-days">Jadwal Mutasi Bank</SectionTitle>
      <div className="lux-card overflow-x-auto rounded-2xl border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        <table className="w-full text-[0.82rem]">
          <thead>
            <tr style={{ background: "var(--glass-2)" }}>
              {["Bank", "Jam Aktif", "Auto Pull"].map((h) => (
                <th key={h} className="micro-label border-b px-5 py-3 text-left" style={{ borderColor: "var(--border)", color: "var(--gold)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {JADWAL_MUTASI.map(([bank, jam, pull]) => (
              <tr key={bank} className="transition-colors hover:bg-[var(--hover)]">
                <td className="border-b px-5 py-3 font-semibold" style={{ borderColor: "var(--border)", color: "var(--text)" }}>
                  <i className="fa-solid fa-building-columns mr-2" style={{ color: "var(--acc-2)" }} />{bank}
                </td>
                <td className="mono-num border-b px-5 py-3 text-[0.78rem]" style={{ borderColor: "var(--border)", color: "var(--acc-2)" }}>{jam}</td>
                <td className="border-b px-5 py-3" style={{ borderColor: "var(--border)" }}>
                  <span className="mono-num rounded-full px-3 py-1 text-[0.7rem] font-semibold"
                    style={{ background: "var(--glass-2)", color: "var(--text-2)", border: "1px solid var(--border)" }}>{pull}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="lux-topline mt-5 flex flex-wrap items-center gap-3.5 rounded-xl border px-5 py-4 text-[0.82rem]"
        style={{ background: "rgba(233,199,102,0.07)", borderColor: "rgba(233,199,102,0.32)", color: "var(--text-2)" }}>
        <i className="fa-solid fa-clock" style={{ color: "var(--gold)", fontSize: "1.1rem" }} />
        <span><strong>Catatan Cut-off Weekend :</strong> Pada hari <strong>Sabtu, Minggu, dan tanggal merah</strong>, jam cut-off bank adalah <strong className="mono-num">23:00 - 03:00 WIB</strong>, sedangkan jam online adalah <strong className="mono-num">03:00 - 23:00 WIB</strong>.</span>
      </div>
    </div>
  );
}
