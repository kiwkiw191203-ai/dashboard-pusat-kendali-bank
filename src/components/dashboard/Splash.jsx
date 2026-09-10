import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import BrandLogo from "@/components/dashboard/BrandLogo";

export default function Splash({ onDone }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const dur = 1100;
    const id = setInterval(() => {
      const p = Math.min(100, Math.round(((Date.now() - start) / dur) * 100));
      setProgress(p);
      if (p >= 100) { clearInterval(id); setTimeout(onDone, 250); }
    }, 40);
    return () => clearInterval(id);
  }, [onDone]);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center" style={{ background: "var(--bg)" }}>
      <div className="pointer-events-none absolute -right-40 -top-40 h-[600px] w-[600px] rounded-full opacity-10 blur-[120px]" style={{ background: "radial-gradient(circle,var(--acc),transparent)" }} />
      <div className="pointer-events-none absolute -bottom-40 -left-40 h-[600px] w-[600px] rounded-full opacity-10 blur-[120px]" style={{ background: "radial-gradient(circle,var(--violet),transparent)" }} />

      <motion.div
        initial={{ scale: 0.7, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <BrandLogo size={72} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        className="mt-5 font-heading text-[1.05rem] font-bold tracking-tight" style={{ color: "var(--text)" }}
      >
        AI Betting Management
      </motion.div>
      <div className="mt-1 text-[0.7rem]" style={{ color: "var(--text-3)" }}>Memuat dashboard…</div>

      <div className="mt-6 h-1 w-56 overflow-hidden rounded-full" style={{ background: "var(--hover)" }}>
        <div className="h-full rounded-full transition-all duration-100" style={{ width: `${progress}%`, background: "var(--acc-grad)" }} />
      </div>
      <div className="mt-2 font-mono text-[0.62rem]" style={{ color: "var(--text-3)" }}>{progress}%</div>
    </div>
  );
}