import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Sun, Moon, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { isAuthed, getSession, loginVerified, login, getProfileFor } from "@/lib/dashboardAuth";
import { startSession } from "@/lib/dashboardSession";
import { useTheme } from "@/components/dashboard/ThemeContext";
import GoogleIcon from "@/components/GoogleIcon";

const LOGO = "https://i.ibb.co/2YsD3Vv5/image.png";

export default function Login() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [checking, setChecking] = useState(true);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", localStorage.getItem("cs-theme") || "dark");
    (async () => {
      if (isAuthed()) { navigate("/", { replace: true }); return; }
      setChecking(false);
    })();
  }, [navigate]);

  const [email, setEmail] = useState("");

  const submit = (e) => {
    e.preventDefault();
    const ok = login(email);
    if (!ok) { setErr("Format email tidak valid. Contoh: nama@cspro.com"); return; }
    setErr("");
    setBusy(true);
    const s = getSession();
    const prof = getProfileFor(s.email) || {};
    startSession({ email: s.email, name: s.name, avatar_url: s.avatar_url, cover_url: prof.cover_url }).catch(() => {});
    setDone(true);
    setTimeout(() => navigate("/", { replace: true }), 900);
  };

  if (checking) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden" style={{ background: "linear-gradient(160deg, #0A0D12 0%, #0F1420 100%)" }}>
        <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(900px 500px at 50% 30%, rgba(37,99,235,0.18), transparent 60%)" }} />
        <div className="relative flex flex-col items-center">
          <div className="relative mb-8 flex h-20 w-20 items-center justify-center">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 6, repeat: Infinity, ease: "linear" }} className="absolute inset-0 rounded-full" style={{ border: "1.5px solid rgba(37,99,235,0.35)" }} />
            <div className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl" style={{ background: "rgba(37,99,235,0.12)", border: "1px solid rgba(37,99,235,0.35)" }}>
              <img src={LOGO} alt="CS PRO" className="h-9 w-9 object-contain" />
            </div>
          </div>
          <motion.h1 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-[1rem] font-bold tracking-tight" style={{ color: "#FFFFFF" }}>CS PRO</motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="mt-1.5 text-[0.72rem]" style={{ color: "#93B4F5" }}>Menyiapkan Dashboard…</motion.p>
          <div className="relative mt-6 h-1 w-48 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
            <motion.div animate={{ x: ["-100%", "100%"] }} transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }} className="absolute inset-y-0 w-1/2 rounded-full" style={{ background: "linear-gradient(90deg, transparent, #2563EB, #60A5FA, transparent)" }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden" style={{ background: "linear-gradient(160deg, #0A0D12 0%, #0F1420 100%)" }}>

      {/* Ambient professional glow */}
      <div className="pointer-events-none fixed inset-0" style={{ background: "radial-gradient(1100px 600px at 15% 0%, rgba(37,99,235,0.16), transparent 55%), radial-gradient(900px 500px at 90% 100%, rgba(96,165,250,0.1), transparent 55%)" }} />
      {/* Subtle grid */}
      <div className="pointer-events-none fixed inset-0 opacity-[0.04]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)", backgroundSize: "64px 64px" }} />
      {/* Floating orbs */}
      <motion.div animate={{ y: [0, -20, 0], opacity: [0.5, 0.8, 0.5] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none fixed left-[10%] top-[18%] h-72 w-72 rounded-full blur-[90px]" style={{ background: "rgba(37,99,235,0.22)" }} />
      <motion.div animate={{ y: [0, 24, 0], opacity: [0.4, 0.7, 0.4] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="pointer-events-none fixed bottom-[10%] right-[12%] h-64 w-64 rounded-full blur-[90px]" style={{ background: "rgba(96,165,250,0.18)" }} />

      {/* Theme toggle */}
      <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-xl border backdrop-blur-xl transition-all hover:scale-110"
        style={{ background: "rgba(16,20,28,0.7)", borderColor: "rgba(37,99,235,0.3)", color: "#93B4F5" }}>
        {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
      </button>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-[420px] overflow-hidden rounded-3xl border p-8 mx-5 backdrop-blur-2xl"
        style={{ background: "linear-gradient(160deg, rgba(18,22,31,0.9) 0%, rgba(12,15,22,0.94) 100%)", borderColor: "rgba(37,99,235,0.28)", boxShadow: "0 0 0 1px rgba(37,99,235,0.12), 0 0 80px rgba(37,99,235,0.12), 0 40px 100px rgba(0,0,0,0.7)" }}>

        {/* Animated top glow line */}
        <motion.div animate={{ backgroundPositionX: ["0%", "200%"] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="absolute inset-x-0 top-0 h-[2px]"
          style={{ background: "linear-gradient(90deg, transparent, #2563EB, #60A5FA, #fff, #60A5FA, #2563EB, transparent)", backgroundSize: "200% 100%" }} />
        {/* Corner accents */}
        <div className="pointer-events-none absolute -left-16 -top-16 h-40 w-40 rounded-full blur-[70px]" style={{ background: "rgba(37,99,235,0.25)" }} />
        <div className="pointer-events-none absolute -bottom-16 -right-16 h-40 w-40 rounded-full blur-[70px]" style={{ background: "rgba(96,165,250,0.18)" }} />

        <AnimatePresence mode="wait">
          {done ? (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center py-10">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 10, stiffness: 200 }}
                className="flex h-20 w-20 items-center justify-center rounded-full"
                style={{ background: "rgba(52,211,153,0.12)", border: "2px solid var(--green)", boxShadow: "0 0 40px rgba(52,211,153,0.3)" }}>
                <CheckCircle2 size={36} style={{ color: "var(--green)" }} />
              </motion.div>
              <p className="mt-5 text-[0.95rem] font-bold" style={{ color: "var(--text)" }}>Login berhasil!</p>
              <p className="text-[0.74rem]" style={{ color: "var(--text-3)" }}>Mengarahkan ke dashboard…</p>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

              {/* Logo + Title */}
              <div className="mb-9 flex flex-col items-center text-center">
                <div className="relative mb-5 flex h-20 w-20 items-center justify-center">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="absolute -inset-2.5 rounded-full opacity-60" style={{ border: "1px dashed rgba(96,165,250,0.5)" }} />
                  <motion.div animate={{ scale: [1, 1.25, 1], opacity: [0.45, 0.15, 0.45] }} transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 rounded-full blur-xl" style={{ background: "#2563EB", zIndex: -1 }} />
                  <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl"
                    style={{ background: "linear-gradient(135deg, rgba(37,99,235,0.2), rgba(96,165,250,0.08))", border: "1px solid rgba(96,165,250,0.4)", boxShadow: "0 0 40px rgba(37,99,235,0.3), inset 0 0 20px rgba(37,99,235,0.1)" }}>
                    <img src={LOGO} alt="CS PRO" className="h-13 w-13 object-contain" />
                  </div>
                </div>

                <motion.h1 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                  className="text-[1.45rem] font-black tracking-tight" style={{ background: "linear-gradient(90deg, #FFFFFF 0%, #93B4F5 100%)", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  Dashboard CS
                </motion.h1>
                <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                  className="mt-1 text-[0.76rem]" style={{ color: "#93B4F5" }}>
                  Alat Kerja untuk CS Chat
                </motion.p>

                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
                  className="mt-3 flex items-center gap-1.5 rounded-full border px-3 py-1 text-[0.62rem] font-semibold"
                  style={{ borderColor: "rgba(37,99,235,0.35)", color: "#93B4F5", background: "rgba(37,99,235,0.08)" }}>
                  <Sparkles size={10} /> Hanya untuk tim terdaftar
                </motion.div>
              </div>

              {/* Error */}
              {err && (
                <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                  className="mb-4 rounded-xl border px-3.5 py-2.5 text-center text-[0.76rem]"
                  style={{ borderColor: "rgba(239,68,68,0.3)", color: "#f87171", background: "rgba(239,68,68,0.08)" }}>
                  {err}
                </motion.p>
              )}

              {/* Email Login Form */}
              <motion.form
                onSubmit={submit}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Masukkan email kamu (contoh: admin@cspro.com)"
                  autoComplete="email"
                  className="w-full rounded-2xl border px-4 py-3.5 text-[0.88rem] font-medium outline-none transition-all focus:border-[rgba(96,165,250,0.7)]"
                  style={{ background: "rgba(10,14,22,0.6)", borderColor: "rgba(37,99,235,0.3)", color: "#FFFFFF" }}
                />
                <motion.button
                  type="submit"
                  disabled={busy}
                  whileHover={{ scale: 1.02, boxShadow: "0 8px 30px rgba(37,99,235,0.3)" }}
                  whileTap={{ scale: 0.98 }}
                  className="relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl py-4 text-[0.92rem] font-bold transition-all disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg, #1D4ED8 0%, #2563EB 50%, #3B82F6 100%)", color: "#FFFFFF", boxShadow: "0 8px 30px rgba(37,99,235,0.45), inset 0 1px 0 rgba(255,255,255,0.15)" }}>
                  <motion.div animate={{ x: ["-120%", "220%"] }} transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 1.4, ease: "easeInOut" }}
                    className="absolute inset-y-0 w-1/3 skew-x-12 opacity-25" style={{ background: "linear-gradient(90deg, transparent, #fff, transparent)" }} />
                  {busy ? <Loader2 size={20} className="animate-spin" /> : (
                    <>
                      <ShieldCheck size={18} />
                      <span className="relative">Masuk dengan Email</span>
                    </>
                  )}
                </motion.button>
              </motion.form>

              {/* Features hint */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                className="mt-6 grid grid-cols-3 gap-2">
                {[
                  { icon: "🔒", label: "Aman & Terenkripsi" },
                  { icon: "⚡", label: "Akses Cepat" },
                  { icon: "🤖", label: "AI Powered" },
                ].map((f) => (
                  <motion.div key={f.label} whileHover={{ y: -3, borderColor: "rgba(96,165,250,0.4)" }}
                    className="flex flex-col items-center gap-1 rounded-xl border px-2 py-2.5 transition-colors"
                    style={{ background: "rgba(37,99,235,0.07)", borderColor: "rgba(37,99,235,0.18)" }}>
                    <span className="text-base">{f.icon}</span>
                    <span className="text-center text-[0.56rem] font-semibold leading-tight" style={{ color: "#93B4F5" }}>{f.label}</span>
                  </motion.div>
                ))}
              </motion.div>

              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
                className="mt-5 flex items-center justify-center gap-1.5 text-center text-[0.67rem]"
                style={{ color: "#93B4F5" }}>
                <ShieldCheck size={12} style={{ color: "#2563EB" }} /> Masuk dengan email tim CS yang terdaftar
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}