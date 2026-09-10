import React, { useEffect, useState } from "react";
import { Copy, Check, PawPrint, Lock } from "lucide-react";
import { toast } from "sonner";
import { getShio } from "@/lib/togelShio";

export default function TogelResultCard({ config, record, color, dateStr, editable, onSaveField }) {
  const [p1, setP1] = useState(record?.p1 || "");
  const [p2, setP2] = useState(record?.p2 || "");
  const [p3, setP3] = useState(record?.p3 || "");
  const [copied, setCopied] = useState(false);

  useEffect(() => { setP1(record?.p1 || ""); setP2(record?.p2 || ""); setP3(record?.p3 || ""); }, [record?.p1, record?.p2, record?.p3]);

  const hasResult = p1.length >= 2;
  const shio = hasResult ? getShio(p1) : "-";
  const maxLen = config.pasaran_name.includes("5D") ? 5 : 4;

  const saveField = (field, value) => {
    const current = record?.[field] || "";
    if (value === current) return;
    Promise.resolve(onSaveField(field, value)).catch(() => toast.error("Gagal menyimpan result"));
  };

  const onNum = (setter) => (e) => setter(e.target.value.replace(/\D/g, ""));

  const handleCopy = async () => {
    if (!hasResult) { toast.warning(`Belum ada result untuk ${config.pasaran_name}`); return; }
    const lines = [`Hasil Pengeluaran ${config.pasaran_name}`, dateStr];
    if (config.result_type === "single") {
      lines.push(`Result : ${p1}, SHIO : ${shio}`);
    } else {
      lines.push(`Result 1 : ${p1 || "-"}, SHIO : ${shio}`);
      lines.push(`Result 2 : ${p2 || "-"}`);
      lines.push(`Result 3 : ${p3 || "-"}`);
    }
    lines.push("Selamat Kepada Pemenang, Salam JP");
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopied(true);
      toast.success(`Berhasil disalin: ${config.pasaran_name}`);
      setTimeout(() => setCopied(false), 1800);
    } catch { toast.error("Gagal menyalin"); }
  };

  const inputStyle = { background: "var(--glass)", borderColor: "var(--border)", color };

  return (
    <div className="rounded-2xl border p-4 transition-all"
      style={{ background: "var(--card)", borderColor: hasResult ? `${color}40` : "var(--border)", borderLeft: `3px solid ${hasResult ? color : "var(--border)"}` }}>
      <div className="mb-1 flex items-start justify-between gap-2">
        <div className="text-[0.8rem] font-bold leading-tight" style={{ color: "var(--text)" }}>Hasil Pengeluaran {config.pasaran_name}</div>
        <div className="flex flex-shrink-0 items-center gap-1.5">
          <span className="rounded-full px-2 py-0.5 text-[0.55rem] font-bold uppercase"
            style={hasResult ? { background: "rgba(16,185,129,0.12)", color: "var(--green)" } : { background: "rgba(247,200,67,0.12)", color: "var(--acc)" }}>
            {hasResult ? "Done" : "Belum"}
          </span>
          {!editable && <Lock size={11} style={{ color: "var(--text-3)" }} />}
          <button onClick={handleCopy}
            className="flex items-center gap-1 rounded-lg border px-2 py-1 text-[0.6rem] font-semibold transition-colors"
            style={{ borderColor: "var(--border)", color: copied ? "var(--green)" : "var(--text-3)" }}>
            {copied ? <Check size={10} /> : <Copy size={10} />} {copied ? "Disalin" : "Salin"}
          </button>
        </div>
      </div>
      <div className="mb-2.5 text-[0.62rem]" style={{ color: "var(--text-3)" }}>
        {dateStr}{record?.creator_name ? ` · diisi oleh ${record.creator_name}` : ""}
      </div>

      {config.result_type === "single" ? (
        <>
          <div className="mb-1.5 flex items-center gap-2">
            <span className="text-[0.66rem]" style={{ color: "var(--text-3)" }}>Result :</span>
            <input value={p1} onChange={onNum(setP1)} onBlur={() => saveField("p1", p1)} maxLength={maxLen}
              placeholder={"-".repeat(maxLen)} inputMode="numeric" disabled={!editable}
              className="w-28 rounded-lg border px-2 py-1 text-center font-jb text-lg font-bold tracking-widest outline-none disabled:opacity-60" style={inputStyle} />
          </div>
          <div className="flex items-center gap-1.5 text-[0.66rem]" style={{ color: hasResult ? color : "var(--text-3)" }}>
            <PawPrint size={11} /> SHIO : {shio}
          </div>
        </>
      ) : (
        [1, 2, 3].map((n) => {
          const val = n === 1 ? p1 : n === 2 ? p2 : p3;
          const setter = n === 1 ? setP1 : n === 2 ? setP2 : setP3;
          return (
            <div key={n} className="mb-1.5 flex items-center gap-2">
              <span className="rounded px-1.5 py-0.5 text-[0.5rem] font-bold uppercase" style={{ background: `${color}20`, color }}>P{n}</span>
              <span className="text-[0.62rem]" style={{ color: "var(--text-3)" }}>Result {n} :</span>
              <input value={val} onChange={onNum(setter)} onBlur={() => saveField(`p${n}`, val)} maxLength={4}
                placeholder="----" inputMode="numeric" disabled={!editable}
                className="w-20 rounded-lg border px-2 py-1 text-center font-jb text-sm font-bold tracking-wider outline-none disabled:opacity-60" style={inputStyle} />
              {n === 1 && <span className="flex items-center gap-1 text-[0.6rem]" style={{ color: hasResult ? color : "var(--text-3)" }}><PawPrint size={10} /> {shio}</span>}
            </div>
          );
        })
      )}
    </div>
  );
}