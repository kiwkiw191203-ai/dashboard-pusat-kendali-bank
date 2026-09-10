import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Lock, Search, Crown, UserCog, Anchor, Calculator, User as UserIcon, MapPin, Globe, Monitor, Smartphone } from "lucide-react";
// Note: UserIcon kept as generic fallback avatar icon
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import PageHead from "@/components/dashboard/PageHead";
import RoleToggle from "@/components/dashboard/RoleToggle";
import UserProfileModal from "@/components/dashboard/UserProfileModal";
import { getRole, canManageUsers, ROLES, setLocalRole } from "@/lib/permissions";
import { getSession } from "@/lib/dashboardAuth";
import { parseUA } from "@/lib/userAgent";

const ROLE_ICON = { super_master: Crown, kapten: Anchor, kasir: Calculator, cs: UserCog };

function RoleLogoBadge({ roleKey, size = 13 }) {
  const r = ROLES[roleKey];
  if (!r) return null;
  return (
    <img src={r.logo} alt={r.label} className="object-contain" style={{ width: size, height: size, filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.4))" }} />
  );
}
const fade = (i = 0) => ({ initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3, delay: i * 0.03 } });

export default function Roles() {
  const role = getRole();
  const can = canManageUsers(role);
  const me = getSession();
  const [users, setUsers] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [u, s] = await Promise.all([
        base44.entities.User.list(),
        base44.entities.OnlineSession.list("-last_seen", 200).catch(() => []),
      ]);
      setUsers(u); setSessions(s);
    } catch { setUsers([]); setSessions([]); }
    setLoading(false);
  };
  useEffect(() => {
    if (!can) { setLoading(false); return; }
    load();
    let u1, u2;
    try { u1 = base44.entities.User.subscribe(load); } catch { u1 = () => {}; }
    try { u2 = base44.entities.OnlineSession.subscribe(load); } catch { u2 = () => {}; }
    return () => { u1(); u2(); };
  }, [can]);

  const sessionMap = useMemo(() => {
    const m = {};
    sessions.forEach((s) => {
      const e = (s.email || "").toLowerCase();
      if (!e) return;
      if (!m[e] || new Date(s.last_seen) > new Date(m[e].last_seen)) m[e] = s;
    });
    return m;
  }, [sessions]);

  const enriched = useMemo(() => {
    return users.map((u) => {
      const s = sessionMap[u.email.toLowerCase()] || {};
      return {
        ...u,
        name: u.full_name || u.email.split("@")[0],
        avatar_url: s.avatar_url || "",
        ip: s.ip || "—",
        city: s.city || "",
        country: s.country || "",
        user_agent: s.user_agent || "",
        login_at: s.login_at || "",
      };
    });
  }, [users, sessionMap]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return enriched.filter((u) => !q || `${u.name} ${u.email} ${u.ip} ${u.city} ${u.country}`.toLowerCase().includes(q));
  }, [enriched, query]);

  const counts = useMemo(() => {
    const c = {};
    Object.keys(ROLES).forEach((k) => { c[k] = 0; });
    users.forEach((u) => { const k = ROLES[u.role] ? u.role : "cs"; c[k]++; });
    return c;
  }, [users]);

  const setRole = async (u, newRole) => {
    if (u.role === newRole) return;
    try {
      await base44.entities.User.update(u.id, { role: newRole });
      setLocalRole(u.email, newRole);
      try { await base44.entities.ActivityLog.create({ email: me?.email, name: me?.name || "", action: "role_change", detail: `${u.email} → ${ROLES[newRole].label}`, user_agent: navigator.userAgent }); } catch {}
      try {
        await base44.entities.LiveEvent.create({
          actor_name: me?.name || me?.email || "Super Master",
          actor_email: me?.email || "",
          actor_role: role.key,
          event_type: "role_change",
          message: `${(me?.name || "SUPER MASTER").toUpperCase()} MENGUBAH ROLE ${(u.full_name || u.email).toUpperCase()} → ${ROLES[newRole].label.toUpperCase()}`,
          accent_color: ROLES[newRole].color,
        });
      } catch {}
      try {
        await base44.entities.PushNotification.create({
          target_email: "*",
          target_name: "",
          from_email: me?.email || "",
          from_name: me?.name || "Super Master",
          from_role: role.key,
          title: "ROLE DIUBAH",
          message: `${(me?.name || "SUPER MASTER").toUpperCase()} MENGUBAH ROLE ${(u.full_name || u.email).toUpperCase()} MENJADI ${ROLES[newRole].label.toUpperCase()}`,
          type: "warning",
          read: false,
        });
      } catch {}
      toast.success(`Role ${u.email} → ${ROLES[newRole].label}`);
      load();
    } catch { toast.error("Gagal mengubah role"); }
  };

  // Super Master dapat mengubah role SIAPA PUN, termasuk Super Master lain.
  // Hanya perubahan role diri sendiri yang diblokir agar tidak terkunci sendiri.
  const canChangeRole = (targetUser) => {
    if (!can) return false;
    if (targetUser.email === me?.email) return false;
    return true;
  };

  if (!can) {
    return (
      <div className="w-full p-6">
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center rounded-2xl border p-16 text-center"
          style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
            style={{ background: "rgba(255,93,115,0.1)", border: "1px solid rgba(255,93,115,0.3)" }}>
            <Lock size={30} style={{ color: "var(--coral)" }} />
          </div>
          <p className="text-[0.95rem] font-bold" style={{ color: "var(--text)" }}>Akses Ditolak</p>
          <p className="mt-1 text-[0.78rem]" style={{ color: "var(--text-3)" }}>Hanya SUPER MASTER yang dapat mengatur role pengguna.</p>
        </motion.div>
      </div>
    );
  }

  const ROLE_STATS = Object.values(ROLES)
    .sort((a, b) => b.level - a.level)
    .map((r) => ({ key: r.key, label: r.label, count: counts[r.key] || 0, color: r.color }));

  return (
    <div className="w-full p-4 md:p-6">
      <PageHead icon="fa-crown" color="var(--acc)" title="ATUR ROLE" subtitle="Kelola role pengguna — khusus SUPER MASTER"
        badges={ROLE_STATS.map((r) => ({ icon: r.key === "super_master" ? "fa-crown" : "fa-chess-knight", text: `${r.count} ${r.label}`, color: r.color }))} />

      {/* Stats */}
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {ROLE_STATS.map((s, i) => {
          const RIcon = ROLE_ICON[s.key] || UserIcon;
          return (
            <motion.div key={s.key}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className="relative overflow-hidden rounded-2xl border p-4"
              style={{ background: "var(--card)", borderColor: s.color + "30" }}>
              <div className="pointer-events-none absolute -right-3 -top-3 h-20 w-20 rounded-full opacity-15" style={{ background: s.color, filter: "blur(18px)" }} />
              <div className="relative flex items-center gap-3.5">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl"
                  style={{ background: `${s.color}14`, color: s.color, border: `1px solid ${s.color}30` }}>
                  <RoleLogoBadge roleKey={s.key} size={18} />
                </div>
                <div>
                  <div className="font-jb text-2xl font-black leading-none" style={{ color: s.color }}>{s.count}</div>
                  <div className="mt-1 text-[0.6rem] font-bold uppercase tracking-widest" style={{ color: "var(--text-3)" }}>{s.label}</div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Search */}
      <div className="mb-4 flex items-center gap-2 rounded-2xl border px-4 py-3" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        <Search size={15} style={{ color: "var(--text-3)" }} />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari user, email, IP, lokasi…" className="flex-1 bg-transparent text-[0.82rem] outline-none" style={{ color: "var(--text)" }} />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: "var(--acc)" }} />
          <p className="mt-3 text-[0.82rem]" style={{ color: "var(--text-3)" }}>Memuat data…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border p-12 text-center" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl" style={{ background: "var(--glass)", border: "1px solid var(--border)" }}>
            <UserIcon size={28} style={{ color: "var(--text-3)" }} />
          </div>
          <p className="text-[0.86rem] font-medium" style={{ color: "var(--text-2)" }}>Belum ada user terdaftar.</p>
          <p className="mt-1 text-[0.72rem]" style={{ color: "var(--text-3)" }}>User yang login otomatis muncul sebagai CS.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {filtered.map((u, i) => {
            const r = ROLES[u.role] || ROLES.cs;
            const RIcon = ROLE_ICON[u.role] || UserIcon;
            const isMe = u.email === me?.email;
            const ua = parseUA(u.user_agent);
            const loc = [u.city, u.country].filter(Boolean).join(", ") || "—";
            const mobile = /mobile|iphone|android/i.test(u.user_agent);
            return (
              <motion.div key={u.id} {...fade(i)} className="overflow-hidden rounded-2xl border transition-all hover:border-[var(--border-active)]"
                style={{ background: "var(--card)", borderColor: isMe ? "rgba(var(--acc-rgb),0.45)" : "var(--border)", borderLeft: `3px solid ${r.color}` }}>
                <div className="flex items-center gap-3 border-b p-4" style={{ borderColor: "var(--border)" }}>
                  <button onClick={() => setSelected(u)} className="flex items-center gap-3 text-left transition-opacity hover:opacity-80">
                    <div className="relative flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl text-sm font-bold text-black"
                      style={{ background: "var(--acc-grad)", boxShadow: `0 0 14px rgba(var(--acc-rgb),0.3)` }}>
                      {u.avatar_url ? <img src={u.avatar_url} alt="" className="h-full w-full object-cover" /> : (u.name || u.email)[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-[0.88rem] font-semibold" style={{ color: "var(--text)" }}>{u.name || u.email}</span>
                        {isMe && <span className="rounded-full px-1.5 py-0.5 text-[0.5rem] font-bold" style={{ color: "var(--acc)", background: "rgba(var(--acc-rgb),0.16)" }}>SAYA</span>}
                      </div>
                      <div className="truncate text-[0.66rem]" style={{ color: "var(--text-3)" }}>{u.email}</div>
                    </div>
                  </button>
                  <span className="ml-auto flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[0.58rem] font-bold"
                    style={{ color: r.color, background: `${r.color}1a`, border: `1px solid ${r.color}30` }}>
                    <RoleLogoBadge roleKey={u.role} size={12} /> {r.label}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 p-4">
                  <div className="flex items-center gap-1.5 rounded-lg border px-2 py-2" style={{ background: "var(--glass)", borderColor: "var(--border)" }}>
                    <Globe size={11} style={{ color: "var(--cyan)" }} className="flex-shrink-0" />
                    <span className="truncate font-jb text-[0.62rem]" style={{ color: "var(--text-2)" }}>{u.ip}</span>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-lg border px-2 py-2" style={{ background: "var(--glass)", borderColor: "var(--border)" }}>
                    {mobile ? <Smartphone size={11} style={{ color: "var(--blue)" }} className="flex-shrink-0" /> : <Monitor size={11} style={{ color: "var(--blue)" }} className="flex-shrink-0" />}
                    <span className="truncate text-[0.62rem]" style={{ color: "var(--text-2)" }}>{ua.device} · {ua.os}</span>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-lg border px-2 py-2" style={{ background: "var(--glass)", borderColor: "var(--border)" }}>
                    <MapPin size={11} style={{ color: "var(--rose)" }} className="flex-shrink-0" />
                    <span className="truncate text-[0.62rem]" style={{ color: "var(--text-2)" }}>{loc}</span>
                  </div>
                </div>

                <div className="border-t p-4" style={{ borderColor: "var(--border)", background: "var(--bg-2)" }}>
                  <div className="mb-2 text-[0.6rem] font-semibold uppercase tracking-wide" style={{ color: "var(--text-3)" }}>Ubah Role</div>
                  <RoleToggle value={u.role} onChange={(k) => setRole(u, k)} disabled={!canChangeRole(u)} />
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <UserProfileModal user={selected} open={!!selected} onOpenChange={(o) => !o && setSelected(null)} />
    </div>
  );
}