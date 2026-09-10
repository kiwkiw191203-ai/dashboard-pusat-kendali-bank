import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Radio, MapPin, Monitor, Globe, Clock, Smartphone, Wifi, Search, Crown, UserCog, User } from "lucide-react";
import PageHead from "@/components/dashboard/PageHead";
import { listOnline, subscribeOnline, getCurrentSessionId } from "@/lib/dashboardSession";
import { formatDuration, useTick } from "@/components/dashboard/utils";
import { deviceOf } from "@/lib/userAgent";
import { useRole, ROLES } from "@/lib/permissions";
import RoleBadge from "@/components/dashboard/RoleBadge";

const ROLE_CONFIG = {
  super_master: {
    label: "SUPER MASTER",
    icon: Crown,
    bg: "linear-gradient(135deg, #7f0000 0%, #c80000 40%, #D9A921 100%)",
    border: "#D9A921",
    glow: "rgba(200,0,0,0.5)",
    textColor: "#FFD700",
    badgeBg: "rgba(200,0,0,0.25)",
  },
  master: {
    label: "MASTER",
    icon: UserCog,
    bg: "linear-gradient(135deg, #1a2f5a 0%, #1e40af 50%, #64748b 100%)",
    border: "#4F8BFF",
    glow: "rgba(79,139,255,0.4)",
    textColor: "#93C5FD",
    badgeBg: "rgba(79,139,255,0.2)",
  },
};

const STATUS_OPTIONS = [
  { key: "online", label: "Online", color: "#20C997" },
  { key: "away", label: "Away", color: "#FFC857" },
  { key: "busy", label: "Busy", color: "#FF5D73" },
  { key: "offline", label: "Offline", color: "#5A6172" },
];

function RoleBadgeCustom({ roleKey }) {
  const cfg = ROLE_CONFIG[roleKey] || ROLE_CONFIG.master;
  const role = ROLES[roleKey];
  return (
    <div className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[0.52rem] font-black tracking-widest"
      style={{
        background: cfg.bg,
        color: cfg.textColor,
        border: `1px solid ${cfg.border}`,
        boxShadow: `0 0 12px ${cfg.glow}`,
        letterSpacing: "0.08em",
      }}>
      {role && <img src={role.logo} alt={role.label} className="object-contain" style={{ width: 11, height: 11, filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.4))" }} />}
      {cfg.label}
    </div>
  );
}

function StatusDot({ status }) {
  const s = STATUS_OPTIONS.find((x) => x.key === status) || STATUS_OPTIONS[0];
  return (
    <span className="flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[0.58rem] font-bold backdrop-blur-md"
      style={{ background: "rgba(0,0,0,0.4)", color: s.color }}>
      <span className="h-1.5 w-1.5 rounded-full flex-shrink-0"
        style={{ background: s.color, boxShadow: `0 0 6px ${s.color}`, animation: status === "online" ? "ds-pulse 2s infinite" : "none" }} />
      {s.label}
    </span>
  );
}

export default function OnlineUsers() {
  useTick(1000);
  const [online, setOnline] = useState([]);
  const [query, setQuery] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const myId = getCurrentSessionId();

  useEffect(() => {
    let alive = true;
    const refresh = async () => { const o = await listOnline(); if (alive) setOnline(o); };
    refresh();
    const u = subscribeOnline(refresh);
    const poll = setInterval(refresh, 5000);
    return () => { alive = false; u?.(); clearInterval(poll); };
  }, []);

  const filtered = online.filter((s) => {
    const q = query.trim().toLowerCase();
    const matchQ = !q || `${s.name} ${s.email} ${s.ip} ${s.city} ${s.country}`.toLowerCase().includes(q);
    const matchRole = filterRole === "all" || (s.role || "master") === filterRole;
    return matchQ && matchRole;
  });

  const counts = { all: online.length };
  online.forEach((s) => { const r = s.role || "master"; counts[r] = (counts[r] || 0) + 1; });

  return (
    <div className="w-full p-4 md:p-6">
      <PageHead icon="fa-tower-broadcast" color="var(--green)" title="PENGGUNA ONLINE"
        subtitle="Monitor sesi aktif realtime dengan identifikasi role"
        badges={[{ icon: "fa-wifi", text: `${online.length} Aktif`, color: "var(--green)" }]} />

      {/* Stats strip */}
      <div className="mb-5 grid grid-cols-2 gap-3">
        {Object.entries(ROLE_CONFIG).map(([key, cfg], i) => {
          const RIcon = cfg.icon;
          return (
            <motion.div key={key}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className="relative overflow-hidden rounded-2xl border p-4"
              style={{ background: "var(--card)", borderColor: cfg.border + "40" }}>
              <div className="pointer-events-none absolute -right-4 -top-4 h-20 w-20 rounded-full opacity-20" style={{ background: cfg.bg, filter: "blur(20px)" }} />
              <div className="relative flex items-center gap-3.5">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl"
                  style={{ background: cfg.bg, boxShadow: `0 0 16px ${cfg.glow}` }}>
                  {ROLES[key] ? <img src={ROLES[key].logo} alt="" className="object-contain" style={{ width: 18, height: 18, filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.3))" }} /> : <RIcon size={18} color={cfg.textColor} />}
                </div>
                <div>
                  <div className="font-jb text-2xl font-black leading-none" style={{ color: cfg.textColor }}>{counts[key] || 0}</div>
                  <div className="mt-1 text-[0.6rem] font-bold uppercase tracking-widest" style={{ color: "var(--text-3)" }}>{cfg.label}</div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="mb-5 flex flex-wrap items-center gap-3 rounded-2xl border p-3" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        <div className="flex flex-1 min-w-[180px] items-center gap-2 rounded-xl border px-3 py-2"
          style={{ background: "var(--glass)", borderColor: "var(--border)" }}>
          <Search size={15} style={{ color: "var(--text-3)" }} />
          <input value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari nama, email, IP, lokasi…"
            className="flex-1 bg-transparent text-[0.82rem] outline-none" style={{ color: "var(--text)" }} />
        </div>
        <div className="flex items-center gap-1.5">
          {[
            { key: "all", label: "Semua" },
            { key: "super_master", label: "Super Master" },
            { key: "master", label: "Master" },
          ].map((f) => (
            <button key={f.key} onClick={() => setFilterRole(f.key)}
              className="rounded-xl border px-3 py-2 text-[0.68rem] font-semibold transition-all hover:scale-[1.03]"
              style={filterRole === f.key
                ? { background: "var(--acc-grad)", color: "#000", borderColor: "transparent", boxShadow: "0 0 12px rgba(var(--acc-rgb),0.3)" }
                : { background: "var(--glass)", borderColor: "var(--border)", color: "var(--text-2)" }}>
              {f.label} {counts[f.key] ? `(${counts[f.key]})` : ""}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border p-16 text-center" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl" style={{ background: "var(--glass)", border: "1px solid var(--border)" }}>
            <Wifi size={28} style={{ color: "var(--text-3)" }} />
          </div>
          <p className="text-[0.86rem] font-medium" style={{ color: "var(--text-2)" }}>Belum ada pengguna online saat ini.</p>
          <p className="mt-1 text-[0.72rem]" style={{ color: "var(--text-3)" }}>Pengguna yang login akan muncul di sini secara realtime.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((s, i) => {
            const roleKey = s.role || "master";
            const roleCfg = ROLE_CONFIG[roleKey] || ROLE_CONFIG.master;
            const loc = [s.city, s.country].filter(Boolean).join(", ") || "Lokasi tidak diketahui";
            const dur = formatDuration(Date.now() - new Date(s.login_at).getTime());
            const isMe = s.id === myId;
            const mobile = /mobile|iphone|android/i.test(s.user_agent || "");
            const DeviceIcon = mobile ? Smartphone : Monitor;

            return (
              <motion.div key={s.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.04 }}
                className="group overflow-hidden rounded-2xl border transition-all hover:-translate-y-1"
                style={{
                  background: "var(--card)",
                  borderColor: isMe ? "rgba(var(--acc-rgb),0.5)" : roleCfg.border + "30",
                  boxShadow: `0 4px 24px ${roleCfg.glow}`,
                }}>

                {/* Cover / Banner */}
                <div className="relative h-28">
                  {s.cover_url
                    ? <img src={s.cover_url} alt="" className="h-full w-full object-cover" />
                    : <div className="h-full w-full" style={{ background: roleCfg.bg }} />
                  }
                  <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.2) 0%, transparent 40%, var(--card) 100%)" }} />

                  {/* Top badges */}
                  <div className="absolute left-3 top-3">
                    <StatusDot status="online" />
                  </div>
                  <div className="absolute right-3 top-3 flex items-center gap-1 rounded-lg bg-black/50 px-2 py-1 backdrop-blur-md">
                    <Clock size={10} style={{ color: "rgba(255,255,255,0.8)" }} />
                    <span className="font-jb text-[0.6rem] font-bold text-white">{dur}</span>
                  </div>
                </div>

                <div className="px-4 pb-4">
                  <div className="-mt-12 flex items-end gap-3">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl text-xl font-bold"
                        style={{
                          background: roleCfg.bg,
                          border: `3px solid ${roleCfg.border}`,
                          boxShadow: `0 0 20px ${roleCfg.glow}, 0 0 0 3px var(--card)`,
                          color: roleCfg.textColor,
                        }}>
                        {s.avatar_url ? <img src={s.avatar_url} alt="" className="h-full w-full object-cover" /> : (s.name || s.email)[0]?.toUpperCase()}
                      </div>
                      <span className="absolute bottom-0.5 right-0.5 h-4 w-4 rounded-full border-2"
                        style={{ background: "var(--green)", borderColor: "var(--card)", boxShadow: "0 0 8px var(--green)" }} />
                    </div>

                    <div className="min-w-0 flex-1 pb-1 pt-5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-[0.9rem] truncate" style={{ color: "var(--text)" }}>{s.name || s.email}</span>
                        {isMe && (
                          <span className="rounded-full px-2 py-0.5 text-[0.5rem] font-black"
                            style={{ color: "var(--acc)", background: "rgba(var(--acc-rgb),0.18)", border: "1px solid rgba(var(--acc-rgb),0.35)" }}>
                            SAYA
                          </span>
                        )}
                      </div>
                      <div className="truncate text-[0.66rem]" style={{ color: "var(--text-3)" }}>{s.email}</div>
                    </div>
                  </div>

                  {/* Role badge */}
                  <div className="mt-3">
                    <RoleBadgeCustom roleKey={roleKey} />
                  </div>

                  {/* Info grid */}
                  <div className="mt-3 grid grid-cols-2 gap-1.5">
                    <div className="flex items-center gap-1.5 rounded-lg border px-2.5 py-2"
                      style={{ background: "var(--glass)", borderColor: "var(--border)" }}>
                      <MapPin size={11} style={{ color: "var(--rose)" }} className="flex-shrink-0" />
                      <span className="truncate text-[0.65rem]" style={{ color: "var(--text-2)" }}>{loc}</span>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-lg border px-2.5 py-2"
                      style={{ background: "var(--glass)", borderColor: "var(--border)" }}>
                      <DeviceIcon size={11} style={{ color: "var(--blue)" }} className="flex-shrink-0" />
                      <span className="truncate text-[0.65rem]" style={{ color: "var(--text-2)" }}>{deviceOf(s.user_agent)}</span>
                    </div>
                    <div className="col-span-2 flex items-center gap-1.5 rounded-lg border px-2.5 py-2"
                      style={{ background: "var(--glass)", borderColor: "var(--border)" }}>
                      <Globe size={11} style={{ color: "var(--cyan)" }} className="flex-shrink-0" />
                      <span className="font-jb text-[0.65rem] truncate" style={{ color: "var(--text-2)" }}>IP: {s.ip || "—"}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}