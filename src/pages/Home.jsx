import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import {
  Users, LogIn, Activity, HeartPulse, Cpu, MemoryStick, HardDrive, ArrowUpRight,
  FileText, Dices, Calculator, Bot, Zap, Ticket, Trophy, Landmark, Receipt, Sparkles, Clock, TrendingUp,
} from "lucide-react";
import { getSession } from "@/lib/dashboardAuth";
import { listOnline, listActivity, subscribeOnline, subscribeActivity } from "@/lib/dashboardSession";
import { useTick } from "@/components/dashboard/utils";

const ACTION_META = {
  login: { color: "var(--green)", label: "Login" },
  logout: { color: "var(--coral)", label: "Logout" },
  update_profile: { color: "var(--blue)", label: "Ubah Profil" },
};

const QUICK = [
  { to: "/files", icon: FileText, label: "File Kerja", color: "var(--acc)" },
  { to: "/predict", icon: Dices, label: "Prediksi", color: "var(--rose)" },
  { to: "/analyzer", icon: Calculator, label: "Freespin", color: "var(--violet)" },
  { to: "/hlxpro", icon: Bot, label: "AI Chat", color: "var(--green)" },
  { to: "/ticket", icon: Ticket, label: "Kode Tiket", color: "var(--cyan)" },
  { to: "/bank", icon: Landmark, label: "Profil Bank", color: "var(--blue)" },
  { to: "/rrn", icon: Receipt, label: "RRN Qris", color: "var(--teal)" },
  { to: "/shortcut", icon: Zap, label: "Pintasan", color: "var(--purple)" },
];

function timeAgo(iso) {
  if (!iso) return "—";
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${s}d lalu`;
  if (s < 3600) return `${Math.floor(s / 60)}m lalu`;
  if (s < 86400) return `${Math.floor(s / 3600)}j lalu`;
  return new Date(iso).toLocaleDateString("id-ID");
}

const fade = (i = 0) => ({ initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] } });

function Sparkline({ data, color }) {
  const id = `sp-${color.replace(/[^a-z0-9]/gi, "")}`;
  return (
    <ResponsiveContainer width="100%" height={42}>
      <AreaChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.4} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="v" stroke={color} strokeWidth={2} fill={`url(#${id})`} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function HealthBar({ icon: Icon, label, value, color }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-[0.74rem]">
        <span className="flex items-center gap-1.5" style={{ color: "var(--text-2)" }}><Icon size={13} style={{ color }} /> {label}</span>
        <span className="font-mono font-semibold" style={{ color: "var(--text)" }}>{value}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full" style={{ background: "var(--hover)" }}>
        <motion.div initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 0.9, ease: "easeOut" }} className="h-full rounded-full" style={{ background: color }} />
      </div>
    </div>
  );
}

function makeSpark(base, wave) {
  return Array.from({ length: 8 }, (idx, i) => ({ v: Math.max(0, base + Math.sin(i * wave) * base * 0.4 + idx) }));
}

export default function Home() {
  const session = getSession();
  const [online, setOnline] = useState([]);
  const [logs, setLogs] = useState([]);
  useTick(1000);

  useEffect(() => {
    let alive = true;
    const refresh = async () => {
      const [o, l] = await Promise.all([listOnline(), listActivity(40)]);
      if (!alive) return;
      setOnline(o);
      setLogs(l);
    };
    refresh();
    const u1 = subscribeOnline(refresh);
    const u2 = subscribeActivity(refresh);
    return () => { alive = false; u1?.(); u2?.(); };
  }, []);

  const isToday = (iso) => iso && new Date(iso).toDateString() === new Date().toDateString();
  const loginsToday = logs.filter((l) => l.action === "login" && isToday(l.created_date)).length;

  const series = useMemo(() => {
    const buckets = Array.from({ length: 12 }, (_, i) => {
      const d = new Date();
      d.setHours(d.getHours() - (11 - i), 0, 0, 0);
      return { h: `${d.getHours()}j`, v: 0, t: d.getTime() };
    });
    logs.forEach((l) => {
      const t = new Date(l.created_date).getTime();
      for (let i = 0; i < buckets.length - 1; i++) {
        if (t >= buckets[i].t && t < buckets[i + 1].t) { buckets[i].v++; break; }
      }
    });
    return buckets;
  }, [logs]);

  const STATS = [
    { icon: Users, label: "Pengguna Online", value: online.length, color: "var(--green)", data: makeSpark(online.length || 1, 0.8) },
    { icon: LogIn, label: "Login Hari Ini", value: loginsToday, color: "var(--blue)", data: makeSpark(loginsToday || 1, 1.1) },
    { icon: Activity, label: "Total Aktivitas", value: logs.length, color: "var(--acc)", data: makeSpark(Math.max(logs.length, 2), 0.6) },
    { icon: HeartPulse, label: "Sistem Sehat", value: "100%", color: "var(--teal)", data: makeSpark(6, 0.9) },
  ];

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 11) return "Selamat pagi";
    if (h < 15) return "Selamat siang";
    if (h < 19) return "Selamat sore";
    return "Selamat malam";
  })();

  const dateStr = new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="w-full p-4 md:p-5">
      {/* Welcome banner — flagship */}
      <motion.div {...fade(0)} className="relative mb-5 overflow-hidden rounded-3xl border" style={{ background: "linear-gradient(120deg, var(--card) 0%, var(--bg-2) 100%)", borderColor: "var(--border)" }}>
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1" style={{ background: "linear-gradient(90deg, #DC2626 0%, #FFFFFF 50%, #F7C843 100%)" }} />
        <div className="absolute -right-24 -top-28 h-72 w-72 rounded-full opacity-22 blur-[110px]" style={{ background: "radial-gradient(circle,var(--acc),transparent)" }} />
        <div className="absolute -bottom-28 -left-12 h-64 w-64 rounded-full opacity-12 blur-[100px]" style={{ background: "radial-gradient(circle,var(--gold),transparent)" }} />
        <div className="relative flex flex-wrap items-center justify-between gap-5 p-6 md:p-8">
          <div className="max-w-[680px]">
            <div className="mb-2 flex items-center gap-2 text-[0.7rem] font-semibold" style={{ color: "var(--acc)" }}>
              <Sparkles size={13} /> {dateStr}
            </div>
            <h1 className="font-heading text-2xl font-bold tracking-tight md:text-[1.7rem]" style={{ color: "var(--text)" }}>
              {greeting}, {session?.name?.split(" ")[0] || "CS"} 👋
            </h1>
            <p className="mt-2.5 text-[0.84rem] leading-relaxed" style={{ color: "var(--text-2)" }}>
              Pusat kendali kerja CS Anda. Pantau pengguna online, aktivitas tim, dan kesehatan sistem secara real-time.
              Akses cepat prediksi togel, filter kode game, kalkulator betting & parlay, validasi rekening, RRN QRIS,
              dan chat koordinasi — semua dari satu dasbor.
            </p>
            <div className="mt-4 flex flex-wrap gap-2.5">
              <Link to="/" className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-[0.8rem] font-semibold text-black transition-transform hover:scale-[1.03]" style={{ background: "var(--acc-grad)", boxShadow: "0 5px 18px rgba(var(--acc-rgb),0.3)" }}>
                <TrendingUp size={15} /> Overview
              </Link>
              <Link to="/hlxpro" className="flex items-center gap-2 rounded-xl border px-4 py-2.5 text-[0.8rem] font-semibold transition-colors hover:bg-[var(--hover)]" style={{ borderColor: "var(--border)", color: "var(--text)" }}>
                <Bot size={15} style={{ color: "var(--green)" }} /> AI Assistant
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border px-5 py-4" style={{ background: "var(--glass)", borderColor: "var(--border)" }}>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: "rgba(var(--acc-rgb),0.14)", color: "var(--acc)" }}>
              <Clock size={20} />
            </div>
            <div>
              <div className="font-mono text-2xl font-bold leading-none" style={{ color: "var(--text)" }}>{online.length}</div>
              <div className="mt-1 text-[0.62rem]" style={{ color: "var(--text-3)" }}>pengguna aktif sekarang</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Analytics cards */}
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {STATS.map((s, i) => (
          <motion.div key={s.label} {...fade(i + 1)} className="relative overflow-hidden rounded-2xl border p-4" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            <div className="absolute -right-6 -top-6 h-16 w-16 rounded-full opacity-15 blur-2xl" style={{ background: `radial-gradient(circle, ${s.color}, transparent)` }} />
            <div className="relative flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ color: s.color, background: `${s.color}1a`, border: `1px solid ${s.color}26` }}>
                <s.icon size={18} />
              </div>
              <ArrowUpRight size={15} style={{ color: "var(--text-3)" }} />
            </div>
            <div className="relative mt-3 font-mono text-2xl font-bold" style={{ color: "var(--text)" }}>{s.value}</div>
            <div className="relative text-[0.66rem] uppercase tracking-wide" style={{ color: "var(--text-3)" }}>{s.label}</div>
            <div className="relative mt-2 -mb-1">
              <Sparkline data={s.data} color={s.color} />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Realtime chart + timeline */}
        <motion.div {...fade(5)} className="lg:col-span-2 rounded-2xl border p-5" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-[0.92rem] font-semibold" style={{ color: "var(--text)" }}>Statistik Realtime</h2>
              <p className="text-[0.68rem]" style={{ color: "var(--text-3)" }}>Aktivitas pengguna 12 jam terakhir</p>
            </div>
            <span className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.62rem] font-semibold" style={{ background: "rgba(var(--acc-rgb),0.12)", color: "var(--acc)" }}>
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--acc)", animation: "ds-pulse 2s infinite" }} /> Live
            </span>
          </div>
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series} margin={{ top: 6, right: 6, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="chart-acc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--acc)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--acc)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="h" tick={{ fill: "var(--text-3)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "var(--text-3)", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "var(--card-solid)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12, color: "var(--text)" }} labelStyle={{ color: "var(--text-3)" }} />
                <Area type="monotone" dataKey="v" stroke="var(--acc)" strokeWidth={2.5} fill="url(#chart-acc)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Activity timeline */}
          <div className="mt-5">
            <h3 className="mb-3 text-[0.82rem] font-semibold" style={{ color: "var(--text)" }}>Timeline Aktivitas</h3>
            <div className="ds-scroll max-h-[260px] space-y-2.5 overflow-y-auto pr-1">
              {logs.length === 0 ? (
                <div className="py-6 text-center text-[0.78rem]" style={{ color: "var(--text-3)" }}>Belum ada aktivitas.</div>
              ) : logs.slice(0, 12).map((l) => {
                const m = ACTION_META[l.action] || ACTION_META.login;
                return (
                  <div key={l.id} className="flex items-center gap-3">
                    <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ background: m.color }} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[0.76rem]" style={{ color: "var(--text)" }}>
                        <b>{l.name || l.email}</b> <span style={{ color: m.color }}>{m.label}</span>
                      </div>
                      <div className="truncate text-[0.64rem]" style={{ color: "var(--text-3)" }}>{l.email}</div>
                    </div>
                    <span className="flex-shrink-0 font-mono text-[0.62rem]" style={{ color: "var(--text-3)" }}>{timeAgo(l.created_date)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Quick actions */}
          <motion.div {...fade(6)} className="rounded-2xl border p-5" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            <h2 className="mb-3.5 text-[0.92rem] font-semibold" style={{ color: "var(--text)" }}>Aksi Cepat</h2>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
              {QUICK.map((q) => (
                <Link key={q.to} to={q.to}
                  className="group flex flex-col items-start gap-2 rounded-xl border p-3 transition-all hover:scale-[1.03] hover:border-[var(--border-active)]"
                  style={{ background: "var(--glass)", borderColor: "var(--border)" }}>
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg transition-transform group-hover:scale-110" style={{ color: q.color, background: `${q.color}1a` }}>
                    <q.icon size={17} />
                  </div>
                  <span className="text-[0.74rem] font-medium" style={{ color: "var(--text)" }}>{q.label}</span>
                </Link>
              ))}
            </div>
          </motion.div>

          {/* System health */}
          <motion.div {...fade(7)} className="rounded-2xl border p-5" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-[0.92rem] font-semibold" style={{ color: "var(--text)" }}>Kesehatan Sistem</h2>
              <span className="flex items-center gap-1.5 text-[0.62rem] font-semibold" style={{ color: "var(--green)" }}>
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--green)" }} /> Stabil
              </span>
            </div>
            <div className="space-y-3.5">
              <HealthBar icon={Cpu} label="CPU" value={34} color="var(--blue)" />
              <HealthBar icon={MemoryStick} label="RAM" value={58} color="var(--acc)" />
              <HealthBar icon={HardDrive} label="Storage" value={42} color="var(--teal)" />
              <HealthBar icon={Users} label="Online Users" value={Math.min(online.length * 10, 100)} color="var(--green)" />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}