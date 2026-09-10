import React, { useState } from "react";
import { MessageSquare, Copy, Check, AlertTriangle } from "lucide-react";

const PK_TEMPLATES = [
  {
    id: "PK1",
    label: "Diskualifikasi — Ringkas",
    text: "Mohon maaf bosku, setelah kami lakukan pengecekan, akun Anda terindikasi melakukan pelanggaran terhadap syarat dan ketentuan Event KPBI World Cup Prediction Championship 2026. Oleh karena itu, keikutsertaan Anda dalam event telah didiskualifikasi sehingga hadiah tidak dapat diberikan ya bosku",
  },
  {
    id: "PK2",
    label: "Diskualifikasi — Final & Formal",
    text: "Hasil pemeriksaan menunjukkan akun Anda telah didiskualifikasi karena terindikasi melanggar ketentuan Event KPBI World Cup Prediction Championship 2026. Sesuai peraturan event, peserta yang didiskualifikasi tidak berhak menerima hadiah. Keputusan ini merupakan hasil verifikasi Management dan bersifat final ya bosku, terimakasih",
  },
  {
    id: "PK3",
    label: "Tidak Memenuhi Syarat — 2+ UserID",
    text: "Mohon maaf bosku, untuk user id anda kami cek disini tidak memenuhi syarat untuk mendapatkan hadiah dari event tersebut ya bosku, dikarenakan akun anda terindikasi telah mengikuti event tersebut dengan 2 atau lebih user id ya bosku",
  },
  {
    id: "PK4",
    label: "Terdeteksi Sistem — Diskualifikasi",
    text: "Mohon maaf bos, namun disini kami cek akun anda terdeteksi oleh system melakukan pelanggaran tersebut ya bos, sehingga user id anda sudah didiskualifikasi dari event tersebut ya bosku",
  },
  {
    id: "PK5",
    label: "Penjelasan Ketentuan — 1 UserID",
    text: "Diatas sudah kami informasikan ya bosku, untuk user id akun anda terdeteksi mengikuti event dengan beberapa user id ya bosku, dimana sesuai ketentuan yang sudah berlaku untuk event tersebut anda hanya boleh mengikutinya dengan 1 user id saja ya bosku, jika anda mengikuti event tersebut dengan beberapa user id maka anda akan didiskualifikasi ya bosku",
  },
  {
    id: "PK6",
    label: "Prediksi Tidak Valid — Isi Kendala",
    text: "Kami ingin menginformasikan bahwa User ID Anda tidak termasuk dalam kategori prediksi yang valid. Hal ini dikarenakan sistem KPBI mendeteksi adanya indikasi ( sebutkan kendalanya )\nKami mohon maaf atas ketidaknyamanan yang terjadi. Namun, keputusan dari pihak KPBI bersifat final dan mengacu pada ketentuan yang telah ditetapkan sejak awal hingga berakhirnya event.\nTerima kasih atas pengertian dan kerja samanya.",
  },
];

export default function PKTemplates({ searchedQuery }) {
  const [copiedId, setCopiedId] = useState(null);

  const handleCopy = async (pk) => {
    try {
      await navigator.clipboard.writeText(pk.text);
      setCopiedId(pk.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // clipboard not available
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
      <div className="flex items-center gap-2.5 border-b px-5 py-4" style={{ borderColor: "var(--border)", background: "var(--bg-2)" }}>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: "rgba(220,38,38,0.12)" }}>
          <MessageSquare size={16} style={{ color: "var(--acc)" }} />
        </div>
        <h2 className="text-sm font-semibold" style={{ color: "var(--text)" }}>Template Balasan Member (PK)</h2>
      </div>

      <div className="flex items-center gap-2.5 border-b px-5 py-3" style={{ background: "rgba(239,68,68,0.1)", borderColor: "rgba(239,68,68,0.2)" }}>
        <AlertTriangle className="shrink-0 animate-pulse" size={16} style={{ color: "var(--coral)" }} />
        <p className="text-[0.72rem] font-bold uppercase tracking-wide" style={{ color: "var(--coral)" }}>
          BACA DULU SEBELUM DI KIRIM KE MEMBER YA BOS !
        </p>
      </div>

      <div className="space-y-3 p-5">
        {PK_TEMPLATES.map((pk) => (
          <div key={pk.id} className="rounded-xl border p-4 transition-all" style={{ background: "var(--glass)", borderColor: "var(--border)" }}>
            <div className="mb-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center rounded-md px-2 py-0.5 text-[0.66rem] font-bold"
                  style={{ background: "rgba(220,38,38,0.12)", color: "var(--acc)" }}>{pk.id}</span>
                <span className="text-xs font-medium" style={{ color: "var(--text-3)" }}>{pk.label}</span>
              </div>
              <button onClick={() => handleCopy(pk)}
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all"
                style={copiedId === pk.id
                  ? { background: "rgba(16,185,129,0.15)", color: "var(--green)" }
                  : { color: "var(--text-3)" }}>
                {copiedId === pk.id ? <><Check size={14} /> Tersalin</> : <><Copy size={14} /> Salin</>}
              </button>
            </div>
            <p className="whitespace-pre-wrap select-none text-[0.8rem] leading-relaxed" style={{ color: "var(--text-2)" }}>{pk.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}