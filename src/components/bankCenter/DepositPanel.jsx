import React from "react";
import { Banner, SectionTitle } from "@/components/bankCenter/Ui";
import { BANKS, STATUS_MAP } from "@/components/bankCenter/bankCenterData";

const LEGEND = [
  { color: "var(--green)", text: "Lampu Hijau", desc: "Online & dapat digunakan" },
  { color: "var(--gold)", text: "Lampu Kuning", desc: "Gangguan, tunda transaksi" },
  { color: "var(--coral)", text: "Lampu Merah", desc: "Offline, tunda transaksi" },
];

export default function DepositPanel({ clock }) {
  const online = BANKS.filter((b) => b.status === "Online").length;
  const warn = BANKS.filter((b) => b.status === "Gangguan").length;
  const off = BANKS.filter((b) => b.status === "Offline").length;

  return (
    <div>
      <Banner title="Pemberitahuan Penting">
        Silakan lihat pada menu akun utama Anda. Pada bagian bawah terdapat <strong>indikator status</strong> untuk setiap bank kami.
        <br /><br />
        <strong>BCA ONLINE 24 JAM</strong> pada hari Sabtu &amp; Minggu! Tanggal Merah Online juga! 🔥
        <br />Deposit via <strong>QRIS</strong> hanya <strong>1 menit</strong>!
      </Banner>

      <SectionTitle icon="fa-traffic-light">Keterangan Indikator Status</SectionTitle>
      <div className="grid grid-cols-1 gap-3.5 md:grid-cols-3">
        {LEGEND.map((l) => (
          <div key={l.text} className="lux-card flex items-center gap-3.5 rounded-xl border px-4 py-3.5"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            <span className="h-4 w-4 flex-shrink-0 rounded-full" style={{ background: l.color, boxShadow: `0 0 12px ${l.color}` }} />
            <span className="text-[0.85rem] font-bold" style={{ color: l.color }}>{l.text}</span>
            <span className="ml-auto text-right text-[0.74rem]" style={{ color: "var(--text-3)" }}>{l.desc}</span>
          </div>
        ))}
      </div>

      <SectionTitle icon="fa-chart-simple">Ringkasan Status Bank</SectionTitle>
      <div className="lux-card lux-topline flex flex-wrap items-center gap-x-8 gap-y-4 overflow-hidden rounded-2xl border px-6 py-4"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        {[
          { label: "Total Bank", val: BANKS.length, color: "var(--acc-2)" },
          { label: "Online", val: online, color: "var(--green)" },
          { label: "Gangguan", val: warn, color: "var(--gold)" },
          { label: "Offline", val: off, color: "var(--coral)" },
        ].map((s) => (
          <div key={s.label} className="flex items-center gap-2.5 text-[0.82rem]" style={{ color: "var(--text-2)" }}>
            <i className="fa-solid fa-circle text-[0.6rem]" style={{ color: s.color }} /> {s.label}:
            <span className="mono-num text-lg font-bold" style={{ color: s.color }}>{s.val}</span>
          </div>
        ))}
        <div className="ml-auto flex items-center gap-2 text-[0.78rem]" style={{ color: "var(--text-3)" }}>
          <i className="fa-regular fa-clock" /> Update: <span className="mono-num font-semibold" style={{ color: "var(--text-2)" }}>{clock}</span>
        </div>
      </div>

      <SectionTitle icon="fa-list">Daftar Bank &amp; Jam Operasional</SectionTitle>
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
        {BANKS.map((b) => {
          const st = STATUS_MAP[b.status] || STATUS_MAP.Online;
          const is24 = b.hours.includes("24 Jam");
          return (
            <div key={b.name} className="lux-card rounded-xl border p-4"
              style={{ background: "var(--card)", borderColor: "var(--border)", borderTop: `2px solid ${st.color}66` }}>
              <div className="flex items-center gap-2.5 text-[0.9rem] font-bold" style={{ color: "var(--text)" }}>
                <i className={`fa-solid ${b.icon}`} style={{ color: "var(--acc-2)" }} /> {b.name}
              </div>
              <div className="mt-2 flex items-center gap-2.5 text-[0.8rem] font-semibold" style={{ color: st.color }}>
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: st.color, boxShadow: `0 0 10px ${st.color}` }} /> {st.label}
              </div>
              <div className="mono-num mt-2.5 flex flex-wrap items-center gap-2 border-t pt-2.5 text-[0.72rem]"
                style={{ borderColor: "var(--border)", color: "var(--text-3)" }}>
                <i className="fa-regular fa-clock" /> {b.hours}
                {is24 && <span className="rounded-full px-2 py-0.5 text-[0.62rem] font-bold"
                  style={{ background: "rgba(233,199,102,0.12)", color: "var(--gold)", border: "1px solid rgba(233,199,102,0.35)" }}>24 JAM</span>}
              </div>
            </div>
          );
        })}
      </div>

      <div className="lux-topline mt-5 flex items-center gap-4 overflow-hidden rounded-xl border px-5 py-4"
        style={{ background: "rgba(16,185,129,0.08)", borderColor: "rgba(16,185,129,0.40)" }}>
        <i className="fa-solid fa-qrcode" style={{ color: "var(--green)", fontSize: "1.6rem" }} />
        <div>
          <div className="flex items-center gap-2 text-[0.95rem] font-bold" style={{ color: "var(--green)" }}>
            QRIS <span className="rounded-full px-3 py-0.5 text-[0.72rem] font-bold text-white" style={{ background: "var(--green)", boxShadow: "0 0 14px rgba(16,185,129,0.45)" }}>🔥 1 MENIT</span>
          </div>
          <div className="mt-0.5 text-[0.78rem]" style={{ color: "var(--text-2)" }}>Online 24 Jam — Deposit instan via QRIS</div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3.5 rounded-xl border px-5 py-4 text-[0.8rem]"
        style={{ background: "var(--glass)", borderColor: "var(--border)", color: "var(--text-2)" }}>
        <i className="fa-solid fa-circle-info" style={{ color: "var(--acc-2)" }} />
        <span><strong>Catatan:</strong> Status <span style={{ color: "var(--green)", fontWeight: 600 }}>Online</span> berarti bank dapat digunakan untuk transaksi. Untuk indikator status terkini, selalu cek pada <strong>menu akun utama</strong> Anda.</span>
      </div>
    </div>
  );
}
