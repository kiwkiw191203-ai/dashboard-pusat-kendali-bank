import React from "react";
import { motion } from "framer-motion";
import { ShieldAlert, Clock, XCircle, LogOut } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { getSession, logout as dashLogout } from "@/lib/dashboardAuth";
import { endSession } from "@/lib/dashboardSession";

export default function ApprovalPending({ status = "pending" }) {
  const session = getSession();
  const rejected = status === "rejected";

  const handleLogout = async () => {
    try { await endSession(); } catch {}
    dashLogout();
    try { base44.auth.logout("/login"); } catch { window.location.href = "/login"; }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-5" style={{ background: "var(--bg)" }}>
      <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(900px 500px at 50% 20%, var(--acc-glow), transparent 60%)" }} />
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-[440px] rounded-3xl border p-8 text-center"
        style={{ background: "var(--card)", backdropFilter: "blur(20px)", borderColor: "var(--border)", boxShadow: "var(--shadow-lg)" }}>
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full"
          style={{ background: rejected ? "rgba(239,68,68,0.1)" : "rgba(247,200,67,0.1)", border: `2px solid ${rejected ? "var(--acc)" : "var(--gold)"}` }}>
          {rejected ? <XCircle size={34} style={{ color: "var(--acc)" }} /> : <Clock size={34} style={{ color: "var(--gold)" }} />}
        </div>

        <h1 className="font-heading text-[1.15rem] font-bold" style={{ color: "var(--text)" }}>
          {rejected ? "Akses Ditolak" : "Menunggu Persetujuan Super Admin"}
        </h1>
        <p className="mt-2 text-[0.82rem] leading-relaxed" style={{ color: "var(--text-2)" }}>
          {rejected
            ? "Permintaan akses akun ini telah ditolak oleh Super Admin. Hubungi Super Admin jika ini keliru."
            : "Akun kamu sudah terdaftar, namun perlu disetujui oleh Super Admin sebelum dapat mengakses dashboard."}
        </p>

        <div className="mt-5 flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-[0.76rem]" style={{ background: "var(--glass)", borderColor: "var(--border)", color: "var(--text-3)" }}>
          <ShieldAlert size={14} style={{ color: rejected ? "var(--acc)" : "var(--gold)" }} />
          Login sebagai <b style={{ color: "var(--text)" }}>{session?.email || "-"}</b>
        </div>

        <button onClick={handleLogout}
          className="btn-premium mt-6 w-full justify-center"
          style={{ background: "var(--surface-2)", color: "var(--text)", border: "1px solid var(--border)", boxShadow: "none" }}>
          <LogOut size={14} /> Keluar
        </button>
      </motion.div>
    </div>
  );
}