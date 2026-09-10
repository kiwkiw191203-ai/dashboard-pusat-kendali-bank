import React, { useRef, useState } from "react";
import { Upload, ScanLine, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import CodeMatchResult from "./CodeMatchResult";

function normalize(s) { return (s || "").replace(/\D/g, ""); }

function findMatches(code, models) {
  if (!code) return [];
  return models.filter((m) => {
    const mc = normalize(m.code);
    return mc && (code.includes(mc) || mc.includes(code));
  });
}

export default function CodeScanPanel({ models }) {
  const [image, setImage] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [extracted, setExtracted] = useState("");
  const [matches, setMatches] = useState(null);
  const inputRef = useRef(null);

  const scan = async (file) => {
    if (!file) return;
    setScanning(true);
    setMatches(null);
    setExtracted("");
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setImage(file_url);
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: "Gambar ini adalah screenshot layar game slot yang menampilkan kode/ID unik hasil spin (biasanya angka panjang, kadang terbagi jadi 2 baris). Baca semua digit angka pada kode/ID tersebut, gabungkan menjadi satu string angka tanpa spasi dan tanpa karakter lain.",
        file_urls: [file_url],
        response_json_schema: { type: "object", properties: { extracted_code: { type: "string" } }, required: ["extracted_code"] },
      });
      const code = normalize(res.extracted_code);
      setExtracted(code);
      setMatches(findMatches(code, models));
    } catch {
      toast.error("Gagal membaca gambar");
    }
    setScanning(false);
  };

  const onFile = (e) => scan(e.target.files?.[0]);
  const onPaste = (e) => {
    const item = [...e.clipboardData.items].find((i) => i.type.startsWith("image/"));
    if (item) scan(item.getAsFile());
  };

  return (
    <div className="ds-in rounded-2xl border p-5" style={{ background: "var(--card)", borderColor: "var(--border)" }} onPaste={onPaste} tabIndex={0}>
      <div className="mb-4 flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg text-xs" style={{ background: "rgba(139,92,246,0.14)", color: "var(--purple)", border: "1px solid rgba(139,92,246,0.3)" }}>
          <ScanLine size={15} />
        </div>
        <h3 className="text-[0.82rem] font-semibold" style={{ color: "var(--text-2)" }}>Tempel / Upload Screenshot</h3>
      </div>

      <button onClick={() => inputRef.current?.click()}
        className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed py-10 text-center transition-colors hover:border-[var(--purple)]"
        style={{ borderColor: "var(--border)", background: "var(--glass)" }}>
        {image ? (
          <img src={image} alt="" className="max-h-40 rounded-lg object-contain" />
        ) : (
          <>
            <Upload size={24} style={{ color: "var(--purple)" }} />
            <span className="text-[0.78rem]" style={{ color: "var(--text-2)" }}>Klik untuk upload, atau tekan Ctrl+V untuk paste</span>
          </>
        )}
      </button>
      <input ref={inputRef} type="file" accept="image/*" onChange={onFile} className="hidden" />

      {scanning && (
        <div className="mt-4 flex items-center justify-center gap-2 text-[0.78rem]" style={{ color: "var(--purple)" }}>
          <Loader2 size={15} className="animate-spin" /> Membaca kode dari gambar...
        </div>
      )}

      {!scanning && matches !== null && <CodeMatchResult code={extracted} matches={matches} />}
    </div>
  );
}