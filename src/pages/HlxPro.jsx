import React from "react";
import { motion } from "framer-motion";
import { Bot, Wrench, Clock, ShieldCheck } from "lucide-react";

const LOGO = "https://i.ibb.co/2YsD3Vv5/image.png";

export default function HlxPro() {
  return (
    <div className="flex h-full w-full items-center justify-center p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="ds-in relative w-full max-w-lg overflow-hidden rounded-3xl border p-8 text-center md:p-10"
        style={{ background: "var(--card)", borderColor: "var(--border)", boxShadow: "0 24px 60px -20px rgba(0,0,0,0.6)" }}>
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-20 blur-[60px]" style={{ background: "radial-gradient(circle, var(--acc), transparent)" }} />

        <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl"
          style={{ background: "rgba(var(--acc-rgb),0.12)", border: "1px solid rgba(var(--acc-rgb),0.25)" }}>
          <img src={LOGO} alt="AI" className="h-11 w-11 object-contain opacity-70" />
          <span className="absolute -bottom-1.5 -right-1.5 flex h-8 w-8 items-center justify-center rounded-full border-2"
            style={{ background: "var(--gold)", borderColor: "var(--card-solid)" }}>
            <Wrench size={14} className="text-black" />
          </span>
        </div>

        <div className="mb-2 flex items-center justify-center gap-2">
          <h1 className="font-heading text-[1.15rem] font-bold tracking-tight" style={{ color: "var(--text)" }}>AI Assistant</h1>
          <span className="rounded-full px-2 py-0.5 text-[0.55rem] font-black text-black" style={{ background: "var(--gold)" }}>MAINTENANCE</span>
        </div>

        <p className="mx-auto max-w-sm text-[0.85rem] leading-relaxed" style={{ color: "var(--text-2)" }}>
          Fitur AI Chat sedang dalam perbaikan &amp; peningkatan sistem. Kami sedang bekerja untuk membuatnya lebih baik.
        </p>

        <div className="mx-auto mt-6 flex w-fit items-center gap-2 rounded-xl border px-4 py-2.5"
          style={{ borderColor: "var(--border)", background: "var(--glass)" }}>
          <Clock size={14} style={{ color: "var(--gold)" }} />
          <span className="text-[0.75rem] font-semibold" style={{ color: "var(--text-2)" }}>Akan segera aktif kembali</span>
        </div>

        <div className="mt-7 flex items-center justify-center gap-1.5 text-[0.65rem]" style={{ color: "var(--text-3)" }}>
          <ShieldCheck size={12} style={{ color: "var(--green)" }} /> Data dan riwayat Anda tetap aman
        </div>
      </motion.div>
    </div>
  );
}