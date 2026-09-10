import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import {
  Palette, ShieldCheck, Clock, Search, Sparkles, Heart, Zap, Ban, Flag,
  Rocket, Gem, Bell, RotateCw, Target, Download, ExternalLink, Github,
  Lightbulb, RefreshCw, Lock, CheckCircle2, AlertTriangle, Cpu, Wand2,
} from "lucide-react";
import { GIST_SCRIPTS, fetchGist, gistOwner, gistRawUrl } from "@/lib/githubGists";
import SystemUpdatesModal from "@/components/extensionSuite/SystemUpdatesModal";
import PageHead from "@/components/dashboard/PageHead";

const LOGO = "https://i.ibb.co/2YsD3Vv5/image.png";

const ICONS = { palette: Palette, shield: ShieldCheck, clock: Clock, search: Search };
const FEAT_ICONS = {
  star: Sparkles, heart: Heart, bolt: Zap, ban: Ban, flag: Flag, rocket: Rocket,
  gem: Gem, bell: Bell, rotate: RotateCw, clock: Clock, target: Target, search: Search,
};

/* Aksen per-script pakai palette dashboard */
const COLORS = {
  highlighter: "var(--acc)",    // merah
  duplicate: "var(--coral)",    // coral
  minimal: "var(--gold)",       // emas
  apology: "var(--blue)",       // biru
};

const CONFIG_STEPS = [
  { title: "Izinkan Skrip Pengguna", desc: "Supaya script bisa membaca halaman dengan leluasa." },
  { title: "Izinkan dalam Mode Samaran", desc: "Penting kalau kamu pakai Incognito." },
  { title: "Izin Akses URL File", desc: "Biar script bisa update otomatis versi terbaru." },
];

const fmtSize = (b) => (b ? (b / 1024).toFixed(1) + " KB" : "—");
const fmtDate = (iso) => (iso ? new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "—");

/* 3D tilt hook */
function useTilt() {
  const ref = useRef(null);
  const onMove = (e) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const rx = ((e.clientY - r.top - r.height / 2) / (r.height / 2)) * -4;
    const ry = ((e.clientX - r.left - r.width / 2) / (r.width / 2)) * 4;
    el.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.015)`;
  };
  const onLeave = () => {
    const el = ref.current; if (!el) return;
    el.style.transform = "perspective(1000px) rotateX(0) rotateY(0) scale(1)";
  };
  return { ref, onMouseMove: onMove, onMouseLeave: onLeave };
}

function ScriptCard({ s, i, gist }) {
  const tilt = useTilt();
  const [installed, setInstalled] = useState(false);
  const color = COLORS[s.key];
  const d = gist;
  const fileData = d?.files?.[s.file];
  const fileName = fileData?.filename || s.file;
  const Icon = ICONS[s.icon] || Sparkles;

  const install = () => {
    const url = s.installUrl || gistRawUrl(s.key);
    window.open(url, "_blank");
    setInstalled(true);
    confetti({
      particleCount: 130, spread: 72, startVelocity: 38, origin: { y: 0.78 },
      colors: ["#DC2626", "#F7C843", "#FFFFFF", "#B91C1C", "#EF4444"],
    });
  };

  return (
    <motion.div
      {...tilt}
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
      className="group relative overflow-hidden rounded-2xl border p-6"
      style={{
        background: "var(--card)",
        backdropFilter: "blur(20px) saturate(160%)",
        WebkitBackdropFilter: "blur(20px) saturate(160%)",
        borderColor: "var(--border)",
        boxShadow: "var(--shadow-sm)",
        transition: "transform .2s ease, box-shadow .35s ease, border-color .35s ease",
        transformStyle: "preserve-3d",
      }}>
      {/* hover border glow */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ padding: 1, background: `linear-gradient(135deg, transparent 30%, ${color}77 50%, transparent 70%)`, WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)", WebkitMaskComposite: "xor", maskComposite: "exclude" }} />
      {/* corner glow */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-30" style={{ background: `radial-gradient(circle, ${color}, transparent)` }} />

      <div className="relative" style={{ zIndex: 2 }}>
        {/* header */}
        <div className="mb-5 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105"
            style={{ background: `${color}16`, border: `1px solid ${color}33`, color }}>
            <Icon size={24} />
          </div>
          <h3 className="font-heading text-[1.05rem] font-bold tracking-tight" style={{ color: "var(--text)" }}>{s.title}</h3>
        </div>

        <p className="mb-5 text-[0.82rem] leading-relaxed" style={{ color: "var(--text-2)" }}>{s.desc}</p>

        {/* feature badges */}
        <div className="mb-5 flex flex-wrap gap-2">
          {s.features.map((f, fi) => {
            const FI = FEAT_ICONS[f.icon] || Sparkles;
            return (
              <span key={fi} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[0.72rem] font-semibold"
                style={{ background: "var(--glass)", border: "1px solid var(--border)", color: "var(--text-2)" }}>
                <FI size={11} style={{ color }} /> {f.label}
              </span>
            );
          })}
        </div>

        {/* install area */}
        <div className="flex items-center justify-between gap-3 rounded-xl px-4 py-3.5" style={{ background: "var(--bg-2)", border: "1px solid var(--border)" }}>
          <div className="flex min-w-0 items-center gap-2 font-jb text-[0.7rem] font-semibold" style={{ color: "var(--text-2)" }}>
            <Github size={13} style={{ color, flexShrink: 0 }} />
            <span className="truncate">{fileName}</span>
          </div>
          <button onClick={install}
            className="relative flex flex-shrink-0 items-center gap-2 overflow-hidden rounded-lg px-4 py-2.5 text-[0.74rem] font-bold uppercase tracking-wider transition-transform hover:-translate-y-0.5"
            style={installed
              ? { background: "linear-gradient(90deg, #10B981, #34D399)", color: "#04211D", boxShadow: `0 0 16px ${color}55` }
              : { background: "var(--acc-grad)", color: "#000", boxShadow: `0 4px 14px rgba(var(--acc-rgb),0.35)` }}>
            <span className="pointer-events-none absolute inset-y-0 left-[-100%] w-full" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)" }} />
            {installed ? <CheckCircle2 size={14} /> : <Wand2 size={14} />}
            {installed ? "Terpasang" : "Install"}
          </button>
        </div>

        {/* meta line */}
        <div className="mt-3 flex items-center justify-between text-[0.66rem]" style={{ color: "var(--text-3)" }}>
          {s.external ? (
            <span className="flex items-center gap-1.5"><ExternalLink size={11} style={{ color }} /> Sumber eksternal</span>
          ) : d ? (
            <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} /> {fmtSize(fileData?.size)} · {fmtDate(d.updated_at)}</span>
          ) : (
            <span className="flex items-center gap-1.5"><AlertTriangle size={11} style={{ color: "var(--gold)" }} /> Data GitHub tidak tersedia</span>
          )}
          {!s.external && (
            <a className="font-jb font-semibold hover:underline" href={`https://gist.github.com/${gistOwner}/${s.id}`} target="_blank" rel="noreferrer" style={{ color }}>view ↗</a>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function ExtensionSuite() {
  const [gists, setGists] = useState({});
  const [showUpdates, setShowUpdates] = useState(false);

  useEffect(() => {
    let alive = true;
    Promise.all(GIST_SCRIPTS.map((s) => fetchGist(s.id).then((d) => [s.key, d]).catch(() => [s.key, null])))
      .then((arr) => { if (!alive) return; const m = {}; arr.forEach(([k, d]) => (m[k] = d)); setGists(m); });
    return () => { alive = false; };
  }, []);

  return (
    <div className="relative w-full p-4 md:p-7">
      <PageHead
        icon="fa-puzzle-piece"
        color="var(--acc)"
        title="Highlighter Chat Suite"
        subtitle="Cyber Elite Suite · script LiveChat, deteksi keyword & SLA tracker"
        badges={[{ text: "Auto-Update Aktif", color: "var(--green)" }, { text: "Internal Team Only", color: "var(--gold)" }]}
      />

      {/* Hero brand bar */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="relative mb-6 flex flex-wrap items-center justify-between gap-5 overflow-hidden rounded-2xl border px-6 py-5"
        style={{ background: "var(--card)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderColor: "var(--border)", boxShadow: "var(--shadow-sm)" }}>
        {/* Merah-Putih-Emas top strip */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px]" style={{ background: "linear-gradient(90deg, #DC2626 0%, #FFFFFF 50%, #F7C843 100%)" }} />
        <div className="flex items-center gap-5">
          {/* holographic logo frame */}
          <div className="relative flex h-14 w-14 items-center justify-center">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-xl" style={{ padding: 1.5, background: "linear-gradient(135deg, #DC2626, #F7C843)", WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)", WebkitMaskComposite: "xor", maskComposite: "exclude" }} />
            <motion.div animate={{ opacity: [0.4, 0.12, 0.4] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 rounded-xl blur-lg" style={{ background: "var(--acc)" }} />
            <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg" style={{ zIndex: 2 }}>
              <img src={LOGO} alt="Highlighter Chat" className="h-full w-full object-cover" />
            </div>
          </div>
          <div>
            <h1 className="font-heading text-[1.15rem] font-black tracking-tight" style={{ color: "var(--text)" }}>Highlighter Chat</h1>
            <span className="mt-0.5 block font-jb text-[0.62rem] tracking-[0.28em]" style={{ color: "var(--gold)" }}>CYBER ELITE SUITE</span>
          </div>
        </div>
        <div className="flex items-center gap-2.5 rounded-xl px-4 py-2.5" style={{ background: "var(--glass)", border: "1px solid var(--border)" }}>
          <Zap size={15} style={{ color: "var(--gold)" }} />
          <span className="font-heading text-[0.78rem] font-semibold" style={{ color: "var(--text-2)" }}>System Update · 23 Jul 2026</span>
        </div>
      </motion.div>

      {/* SCRIPTS GRID */}
      <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3" style={{ perspective: 1000 }}>
        {GIST_SCRIPTS.map((s, i) => (
          <ScriptCard key={s.key} s={s} i={i} gist={gists[s.key]} />
        ))}
      </section>

      {/* CONFIG PANEL */}
      <motion.section
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
        className="relative mt-6 overflow-hidden rounded-2xl border p-6 md:p-8"
        style={{ background: "var(--card)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderColor: "var(--border)", boxShadow: "var(--shadow-sm)" }}>
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px]" style={{ background: "linear-gradient(90deg, transparent, var(--gold), transparent)" }} />

        {/* header */}
        <div className="mb-7 flex flex-wrap items-center justify-between gap-4 border-b pb-5" style={{ borderColor: "var(--border)" }}>
          <h2 className="flex items-center gap-3 font-heading text-[1.05rem] font-bold" style={{ color: "var(--text)" }}>
            <Cpu size={20} style={{ color: "var(--gold)" }} /> Konfigurasi Sistem
          </h2>
          <span className="flex items-center gap-2 rounded-lg px-3.5 py-1.5 font-heading text-[0.68rem] font-bold uppercase tracking-wider"
            style={{ background: "rgba(247,200,67,0.1)", border: "1px solid var(--gold)", color: "var(--gold)", boxShadow: "0 0 12px rgba(247,200,67,0.1)" }}>
            <AlertTriangle size={13} /> Wajib Aktifkan!
          </span>
        </div>

        {/* steps */}
        <div className="flex flex-col gap-3.5">
          {CONFIG_STEPS.map((c, i) => (
            <div key={i} className="flex items-center gap-4 rounded-xl px-4 py-3.5 transition-all hover:translate-x-1.5"
              style={{ background: "var(--bg-2)", border: "1px solid var(--border)", borderLeft: `3px solid var(--acc)` }}>
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg font-heading text-[0.95rem] font-bold"
                style={{ background: "var(--acc-grad)", color: "#000", boxShadow: "0 3px 10px rgba(var(--acc-rgb),0.3)" }}>
                {i + 1}
              </div>
              <p className="flex-1 text-[0.82rem]" style={{ color: "var(--text-2)" }}><b style={{ color: "var(--text)" }}>{c.title}</b> — {c.desc}</p>
              <span className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-heading text-[0.7rem] font-bold uppercase tracking-wider"
                style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", color: "var(--green)" }}>
                <CheckCircle2 size={12} /> ON
              </span>
            </div>
          ))}
        </div>

        {/* info note */}
        <div className="mt-6 flex items-start gap-4 rounded-xl p-5" style={{ background: "rgba(247,200,67,0.05)", border: "1px solid rgba(247,200,67,0.2)" }}>
          <Lightbulb size={20} style={{ color: "var(--gold)", flexShrink: 0, marginTop: 2 }} />
          <p className="text-[0.8rem] leading-relaxed" style={{ color: "var(--text-2)" }}>
            <b style={{ color: "var(--text)" }}>Tips Masuk Pengaturan:</b> Klik kanan icon Tampermonkey di pojok browser &gt; <b style={{ color: "var(--text)" }}>Kelola Ekstensi</b> &gt; Scroll ke bawah &gt; Pastikan semua izin aktif dan menyala.
          </p>
        </div>

        {/* refresh box */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl px-5 py-4"
          style={{ background: "linear-gradient(90deg, rgba(220,38,38,0.05), transparent)", borderLeft: "4px solid var(--acc)" }}>
          <span className="text-[0.8rem]" style={{ color: "var(--text-2)" }}>
            <RefreshCw size={13} style={{ color: "var(--acc)", display: "inline", marginRight: 6 }} />
            <b style={{ color: "var(--text)" }}>Ingat ya!</b> Setelah klik <b style={{ color: "var(--text)" }}>INSTALL</b>, lakukan <b style={{ color: "var(--text)" }}>Refresh halaman LiveChat</b> kamu biar fiturnya langsung menyala.
          </span>
          <span className="font-jb text-[0.66rem] font-bold" style={{ color: "var(--acc)" }}>✨ AUTO-UPDATE AKTIF</span>
        </div>

        {/* footer grace */}
        <div className="mt-7 text-center">
          <p className="text-[0.78rem] font-medium tracking-wide" style={{ color: "var(--text-3)" }}>
            Dibuat dengan <Heart size={11} style={{ color: "var(--coral)", display: "inline", animation: "beat 1.5s infinite" }} /> oleh <b style={{ color: "var(--text)" }}>Highlighter Chat</b> — Cyber Elite Suite
          </p>
          <p className="mt-1.5 font-jb text-[0.62rem]" style={{ color: "var(--text-3)", opacity: 0.6 }}>3D TILT ACTIVE · ALL RIGHTS RESERVED 2026</p>
        </div>
      </motion.section>

      {/* floating system updates */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}
        whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
        onClick={() => setShowUpdates(true)}
        className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full px-4 py-3 text-[0.74rem] font-bold shadow-lg"
        style={{ background: "var(--acc-grad)", color: "#000", boxShadow: "0 8px 28px rgba(var(--acc-rgb),0.4)" }}>
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" style={{ background: "#000" }} />
          <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: "#000" }} />
        </span>
        System Updates
      </motion.button>

      <style>{`@keyframes beat { 0%,100% { transform: scale(1); } 50% { transform: scale(1.3); } }`}</style>
      <SystemUpdatesModal open={showUpdates} onClose={() => setShowUpdates(false)} />
    </div>
  );
}