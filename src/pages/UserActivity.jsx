import React, { useEffect, useMemo, useState } from "react";
import { Search, Radio, Users as UsersIcon, Activity as ActivityIcon } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { ROLES } from "@/lib/permissions";
import { parseUA } from "@/lib/userAgent";
import { formatDuration, useTick } from "@/components/dashboard/utils";
import UserActivityCard from "@/components/userActivity/UserActivityCard";
import ActivityDetailModal from "@/components/userActivity/ActivityDetailModal";

const ONLINE_TTL = 90 * 1000;
const todayStr = () => new Date().toLocaleDateString("sv-SE");
const timeAgo = (iso) => {
  if (!iso) return "—";
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${s} detik lalu`;
  if (s < 3600) return `${Math.floor(s / 60)} menit lalu`;
  if (s < 86400) return `${Math.floor(s / 3600)} jam lalu`;
  return new Date(iso).toLocaleDateString("id-ID");
};

const FILTERS = [
  { key: "all", label: "Semua" },
  { key: "online", label: "Online" },
  { key: "offline", label: "Offline" },
];

export default function UserActivity() {
  useTick(15000);
  const [users, setUsers] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [logs, setLogs] = useState([]);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");
  const [date, setDate] = useState(todayStr());
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try { setUsers(await base44.entities.User.list("-created_date", 300)); } catch { setUsers([]); }
      try { setSessions(await base44.entities.OnlineSession.list("-last_seen", 300)); } catch { setSessions([]); }
      try { setLogs(await base44.entities.ActivityLog.list("-created_date", 500)); } catch { setLogs([]); }
      setLoading(false);
    };
    load();
    let u1 = () => {}, u2 = () => {};
    try { u1 = base44.entities.OnlineSession.subscribe(load); } catch {}
    try { u2 = base44.entities.ActivityLog.subscribe(load); } catch {}
    return () => { u1(); u2(); };
  }, []);

  const rows = useMemo(() => {
    const sessByEmail = {};
    sessions.forEach((s) => {
      const k = s.email?.toLowerCase();
      if (k && !sessByEmail[k]) sessByEmail[k] = s;
    });

    const base = users.map((u) => ({ email: u.email, name: u.full_name, role: u.role }));
    // include session-only accounts
    sessions.forEach((s) => {
      if (!base.some((b) => b.email?.toLowerCase() === s.email?.toLowerCase())) {
        base.push({ email: s.email, name: s.name, role: s.role });
      }
    });

    return base.map((b) => {
      const email = (b.email || "").toLowerCase();
      const sess = sessByEmail[email];
      const myLogs = logs.filter((l) => l.email?.toLowerCase() === email);
      const dayLogs = myLogs.filter((l) => l.created_date && new Date(l.created_date).toLocaleDateString("sv-SE") === date);
      const buckets = Array(24).fill(0);
      dayLogs.forEach((l) => { buckets[new Date(l.created_date).getHours()] += 1; });

      const ua = parseUA(sess?.user_agent || "");
      const online = !!sess?.last_seen && Date.now() - new Date(sess.last_seen).getTime() < ONLINE_TTL;
      const lastLogin = myLogs.find((l) => l.action === "login");
      const lastLoginAt = sess?.login_at || lastLogin?.created_date;
      const lastAct = dayLogs[0] || myLogs[0];
      const roleKey = sess?.role || b.role || "cs";

      return {
        email: b.email,
        name: sess?.name || b.name,
        avatar_url: sess?.avatar_url,
        roleLabel: ROLES[roleKey]?.label || roleKey,
        online,
        lastLoginAt,
        lastLoginText: timeAgo(lastLoginAt),
        lastSeen: sess?.last_seen,
        durationText: online && sess?.login_at ? formatDuration(Date.now() - new Date(sess.login_at).getTime()) : "—",
        device: ua.device, os: ua.os, browser: ua.browser,
        ip: sess?.ip,
        location: [sess?.city, sess?.region, sess?.country].filter(Boolean).join(", "),
        buckets,
        todayCount: dayLogs.length,
        loginCount: myLogs.filter((l) => l.action === "login").length,
        lastActivityText: lastAct ? `${lastAct.action}${lastAct.detail ? " · " + lastAct.detail : ""}` : "Belum ada aktivitas",
        logs: dayLogs.slice(0, 60),
      };
    }).sort((a, b) => (b.online ? 1 : 0) - (a.online ? 1 : 0) || (b.todayCount - a.todayCount));
  }, [users, sessions, logs, date]);

  const filtered = rows.filter((r) => {
    if (filter === "online" && !r.online) return false;
    if (filter === "offline" && r.online) return false;
    const s = q.trim().toLowerCase();
    if (!s) return true;
    return `${r.name || ""} ${r.email || ""} ${r.roleLabel}`.toLowerCase().includes(s);
  });

  const onlineCount = rows.filter((r) => r.online).length;
  const totalActs = rows.reduce((a, r) => a + r.todayCount, 0);
  const dateLabel = new Date(`${date}T00:00:00`).toLocaleDateString("id-ID", { dateStyle: "medium" });

  return (
    <div>
      {/* Stats */}
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Stat icon={UsersIcon} label="Total Pengguna" value={rows.length} color="var(--acc-2)" />
        <Stat icon={Radio} label="Sedang Online" value={onlineCount} color="var(--teal)" />
        <Stat icon={ActivityIcon} label={`Aktivitas ${dateLabel}`} value={totalActs} color="var(--blue)" />
      </div>

      {/* Controls */}
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-3)" }} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama, email, atau role..."
            className="w-full rounded-xl border py-2.5 pl-9 pr-3 text-[0.76rem] outline-none"
            style={{ background: "var(--card)", borderColor: "var(--border)", color: "var(--text)" }} />
        </div>
        <div className="flex gap-1.5">
          {FILTERS.map((f) => {
            const isActive = filter === f.key;
            return (
              <button key={f.key} onClick={() => setFilter(f.key)}
                className="rounded-xl border px-3.5 py-2.5 text-[0.72rem] font-semibold transition-colors"
                style={isActive
                  ? { background: "rgba(56,189,248,0.14)", color: "var(--acc-2)", borderColor: "rgba(56,189,248,0.4)" }
                  : { background: "var(--card)", borderColor: "var(--border)", color: "var(--text-3)" }}>
                {f.label}
              </button>
            );
          })}
        </div>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value || todayStr())}
          className="rounded-xl border px-3 py-2.5 font-jb text-[0.72rem] outline-none"
          style={{ background: "var(--card)", borderColor: "var(--border)", color: "var(--text)" }} />
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-2">{[0, 1, 2].map((i) => <div key={i} className="skeleton h-28 w-full" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border px-4 py-12 text-center text-[0.76rem]"
          style={{ background: "var(--card)", borderColor: "var(--border)", color: "var(--text-3)" }}>
          Tidak ada pengguna yang cocok dengan filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
          {filtered.map((r) => <UserActivityCard key={r.email} row={r} onClick={() => setSelected(r)} />)}
        </div>
      )}

      <ActivityDetailModal row={selected} dateLabel={dateLabel} onClose={() => setSelected(null)} />
    </div>
  );
}

function Stat({ icon: Icon, label, value, color }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border p-3.5" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
      <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${color}18`, color }}>
        <Icon size={16} />
      </div>
      <div className="min-w-0">
        <div className="stat-caps text-[0.52rem]" style={{ color: "var(--text-3)" }}>{label}</div>
        <div className="text-[1.1rem] font-semibold" style={{ color: "var(--text)" }}>{value}</div>
      </div>
    </div>
  );
}