import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Globe, RotateCcw, ExternalLink, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import PageHead from "@/components/dashboard/PageHead";
import { base44 } from "@/api/base44Client";

const KPBI_URL = "https://kpbi.org/";

export default function KpbiLive() {
  const [html, setHtml] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const reqId = useRef(0);

  const load = async () => {
    const id = ++reqId.current;
    setLoading(true);
    setError(null);
    try {
      const res = await base44.functions.invoke("fetchKpbi", {});
      if (id !== reqId.current) return;
      if (res?.data?.error) throw new Error(res.data.error);
      setHtml(res?.data?.html || "");
      toast.success("Halaman KPBI dimuat");
    } catch (e) {
      if (id !== reqId.current) return;
      setError(e?.message || "Gagal memuat halaman");
      toast.error("Gagal memuat KPBI");
    } finally {
      if (id === reqId.current) setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="w-full flex h-full flex-col p-4 md:p-6">
      <PageHead
        icon="fa-globe" color="var(--green)"
        title="KPBI LIVE"
        subtitle="Akses realtime Komite Prediksi Bola Indonesia langsung di dashboard."
        badges={[{ text: "Realtime", color: "var(--green)" }, { text: "kpbi.org", color: "var(--blue)" }]}
      />

      <div className="mb-3 flex flex-wrap items-center justify-end gap-2">
        <button onClick={load} disabled={loading}
          className="flex items-center gap-2 rounded-xl border px-3 py-2 text-[0.72rem] font-semibold transition-colors hover:bg-[var(--hover)] disabled:opacity-60"
          style={{ borderColor: "var(--border)", color: "var(--text)", background: "var(--card)" }}>
          <RotateCcw size={14} className={loading ? "animate-spin" : ""} /> Muat Ulang
        </button>
        <a href={KPBI_URL} target="_blank" rel="noreferrer"
          className="flex items-center gap-2 rounded-xl border px-3 py-2 text-[0.72rem] font-semibold transition-colors hover:bg-[var(--hover)]"
          style={{ borderColor: "var(--border)", color: "var(--text-2)", background: "var(--card)" }}>
          <ExternalLink size={14} /> Buka Tab Baru
        </a>
      </div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        className="relative flex-1 overflow-hidden rounded-2xl border"
        style={{ background: "#050D18", borderColor: "var(--border)", boxShadow: "var(--shadow-md)", minHeight: "62vh" }}>

        {loading && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3" style={{ background: "var(--bg-2)" }}>
            <div className="h-9 w-9 animate-spin rounded-full border-2 border-transparent" style={{ borderTopColor: "var(--acc)", borderRightColor: "var(--acc)" }} />
            <span className="text-[0.78rem] font-semibold" style={{ color: "var(--text-2)" }}>Memuat kpbi.org...</span>
          </div>
        )}

        {error && !loading && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 p-6 text-center" style={{ background: "var(--bg-2)" }}>
            <AlertTriangle size={32} style={{ color: "var(--coral)" }} />
            <div className="text-[0.86rem] font-bold" style={{ color: "var(--text)" }}>Gagal memuat halaman</div>
            <p className="max-w-md text-[0.72rem] leading-relaxed" style={{ color: "var(--text-3)" }}>{error}</p>
            <button onClick={load}
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-[0.74rem] font-bold transition-all hover:scale-[1.02]"
              style={{ background: "var(--acc-grad)", color: "#000" }}>
              <RotateCcw size={14} /> Coba Lagi
            </button>
          </div>
        )}

        {!error && html && (
          <iframe
            srcDoc={html}
            title="KPBI Live"
            className="h-full w-full border-0"
            style={{ minHeight: "62vh", background: "#050D18" }}
            sandbox="allow-scripts allow-popups allow-forms"
          />
        )}
      </motion.div>
    </div>
  );
}