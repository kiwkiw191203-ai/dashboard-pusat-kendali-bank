import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { getIcon } from "@/lib/featureIcons";
import { copyText } from "@/components/dashboard/utils";

const fade = (i = 0) => ({ initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4, delay: i * 0.05 } });

export default function CustomFeaturePage() {
  const { slug } = useParams();
  const [feature, setFeature] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const all = await base44.entities.CustomFeature.list("order", 200);
        setFeature(all.find((f) => f.slug === slug));
      } catch { setFeature(null); }
      setLoading(false);
    })();
  }, [slug]);

  if (loading) return <div className="p-10 text-center text-[0.82rem]" style={{ color: "var(--text-3)" }}>Memuat fitur…</div>;
  if (!feature) return (
    <div className="mx-auto max-w-[800px] p-10 text-center">
      <p className="text-[0.9rem] font-semibold" style={{ color: "var(--text)" }}>Fitur tidak ditemukan</p>
      <Link to="/" className="mt-2 inline-block text-[0.78rem]" style={{ color: "var(--acc)" }}>← Kembali ke Overview</Link>
    </div>
  );

  const Icon = getIcon(feature.icon);

  return (
    <div className="w-full p-4 md:p-6">
      <Link to="/dashboard" className="mb-4 inline-flex items-center gap-1.5 text-[0.78rem]" style={{ color: "var(--text-3)" }}>
        <ArrowLeft size={14} /> Kembali
      </Link>

      {/* Banner */}
      <motion.div {...fade(0)} className="relative mb-5 overflow-hidden rounded-2xl border" style={{ borderColor: "var(--border)" }}>
        {feature.banner_url ? <img src={feature.banner_url} alt="" className="h-48 w-full object-cover md:h-64" /> : <div className="h-48 w-full md:h-64" style={{ background: "linear-gradient(120deg, var(--bg-2), rgba(var(--acc-rgb),0.25))" }} />}
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 30%, var(--bg) 100%)" }} />
        <div className="absolute bottom-4 left-5 flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl" style={{ color: feature.icon_color || "var(--acc)", background: "var(--card-solid)", border: "1px solid var(--border)", boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }}><Icon size={26} /></div>
          <div>
            <h1 className="font-heading text-2xl font-bold tracking-tight" style={{ color: "var(--text)" }}>{feature.name}</h1>
            {feature.description && <p className="mt-0.5 text-[0.82rem]" style={{ color: "var(--text-2)" }}>{feature.description}</p>}
          </div>
        </div>
      </motion.div>

      {/* Shortcuts */}
      {feature.shortcuts?.length > 0 && (
        <motion.div {...fade(1)} className="rounded-2xl border p-5" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <h2 className="mb-3 text-[0.92rem] font-bold" style={{ color: "var(--text)" }}>Pintasan</h2>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {feature.shortcuts.map((s, i) => {
              const isUrl = /^https?:\/\//i.test(s);
              return (
                <div key={i} className="flex items-center justify-between gap-2 rounded-xl border p-3" style={{ background: "var(--glass)", borderColor: "var(--border)" }}>
                  <span className="truncate font-mono text-[0.76rem]" style={{ color: "var(--text-2)" }}>{s}</span>
                  {isUrl
                    ? <a href={s} target="_blank" rel="noreferrer" className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg hover:bg-[var(--hover)]" style={{ color: "var(--acc)" }}><ExternalLink size={14} /></a>
                    : <button onClick={() => copyText(s, "Disalin!")} className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg hover:bg-[var(--hover)]" style={{ color: "var(--text-3)" }}><ExternalLink size={14} /></button>}
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}