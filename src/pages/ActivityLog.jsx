import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Search, Download, FileText, Filter, Globe, Monitor, Smartphone,
  LogIn, LogOut, UserPen, Plus, Edit3, Trash2, Shield, Crown,
  Cpu, AlertTriangle, ToggleLeft, BookOpen, ChevronDown, ChevronUp, Hash,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import PageHead from "@/components/dashboard/PageHead";
import { listActivity, listMyActivity, subscribeActivity } from "@/lib/dashboardSession";
import { useRole, isSuperMaster } from "@/lib/permissions";
import { getSession } from "@/lib/dashboardAuth";

const ACTIONS = ["login","logout","update_profile","create","edit","delete","permission","role_change","ai_request","system_error","feature_toggle","notes_activity","togel_config"];

const ACTION_META = {
  login:          { color: "var(--green)",  label: "Login",          icon: LogIn },
  logout:         { color: "var(--coral)",  label: "Logout",         icon: LogOut },
  update_profile: { color: "var(--blue)",   label: "Update Profil",  icon: UserPen },
  create:         { color: "var(--green)",  label: "Create",         icon: Plus },
  edit:           { color: "var(--acc)",    label: "Edit",           icon: Edit3 },
  delete:         { color: "var(--coral)",  label: "Delete",         icon: Trash2 },
  permission:     { color: "var(--violet)", label: "Permission",     icon: Shield },
  role_change:    { color: "var(--purple)", label: "Role Change",    icon: Crown },
  ai_request:     { color: "var(--teal)",   label: "AI Request",     icon: Cpu },
  system_error:   { color: "var(--coral)",  label: "System Error",   icon: AlertTriangle },
  feature_toggle: { color: "var(--cyan)",   label: "Feature Toggle", icon: ToggleLeft },
  notes_activity: { color: "var(--blue)",   label: "Notes Activity", icon: BookOpen },
  togel_config:   { color: "var(--rose)",   label: "Togel Config",   icon: Hash },
};

function deviceOf(ua = "") {
  if (/mobile|iphone|android/i.test(ua)) return "Mobile";
  if (/ipad|tablet/i.test(ua)) return "Tablet";
  return "Desktop";
}
function browserOf(ua = "") {
  if (/edg/i.test(ua)) return "Edge";
  if (/chrome/i.test(ua)) return "Chrome";
  if (/firefox/i.test(ua)) return "Firefox";
  if (/safari/i.test(ua)) return "Safari";
  return "—";
}
function timeAgo(iso) {
  if (!iso) return "—";
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${s}d lalu`;
  if (s < 3600) return `${Math.floor(s / 60)}m lalu`;
  if (s < 86400) return `${Math.floor(s / 3600)}j lalu`;
  return new Date(iso).toLocaleDateString("id-ID");
}

function LogCard({ log, index, canDelete, onDelete, deletingId }) {
  const [expanded, setExpanded] = useState(false);
  const d = log.created_date ? new Date(log.created_date) : null;
  const m = ACTION_META[log.action] || ACTION_META.login;
  const ActionIcon = m.icon;
  const isMobile = /mobile|iphone|android/i.test(log.user_agent);
  const isDeleting = deletingId === log.id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: index * 0.015 }}
      className="overflow-hidden rounded-2xl border"
      style={{ background: "var(--card-solid)", borderColor: "var(--border)" }}
    >
      <div className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[var(--hover)] transition-colors" onClick={() => setExpanded((v) => !v)}>
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl" style={{ background: `${m.color}14`, color: m.color }}>
          <ActionIcon size={16} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[0.82rem] font-semibold truncate" style={{ color: "var(--text)" }}>{log.name || "—"}</span>
            <span className="rounded-full px-2 py-0.5 text-[0.58rem] font-bold" style={{ background: `${m.color}14`, color: m.color }}>{m.label}</span>
          </div>
          <div className="text-[0.65rem] truncate" style={{ color: "var(--text-3)" }}>{log.email || "—"}</div>
        </div>
        <div className="flex flex-shrink-0 items-center gap-3">
          {canDelete && (
            <button onClick={(e) => { e.stopPropagation(); onDelete(log.id); }} disabled={isDeleting}
              className="flex h-8 w-8 items-center justify-center rounded-lg border transition-colors hover:bg-[var(--hover)] disabled:opacity-50"
              style={{ borderColor: "var(--border)", color: "var(--coral)", background: "var(--bg-2)" }} title="Hapus log ini">
              {isDeleting ? <RotateCwIcon /> : <Trash2 size={13} />}
            </button>
          )}
          <div className="hidden text-right sm:block">
            <div className="text-[0.7rem] font-semibold" style={{ color: "var(--text-2)" }}>{d ? d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) : "—"}</div>
            <div className="text-[0.6rem]" style={{ color: "var(--text-3)" }}>{timeAgo(log.created_date)}</div>
          </div>
          <div style={{ color: "var(--text-3)" }}>{expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}</div>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22, ease: "easeInOut" }} style={{ overflow: "hidden" }}>
            <div className="border-t px-4 pb-4 pt-3" style={{ borderColor: "var(--border)" }}>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                <DetailField label="Tanggal" value={d?.toLocaleDateString("id-ID") || "—"} />
                <DetailField label="Jam" value={d?.toLocaleTimeString("id-ID") || "—"} mono />
                <DetailField label="IP Address" value={log.ip || "—"} mono />
                <DetailField label="Browser" value={browserOf(log.user_agent)} />
                <DetailField label="Perangkat" value={deviceOf(log.user_agent)} icon={isMobile ? <Smartphone size={11} style={{ color: "var(--blue)" }} /> : <Monitor size={11} style={{ color: "var(--blue)" }} />} />
                <DetailField label="Status" value="Success" accent="var(--green)" />
                {log.detail && (
                  <div className="col-span-2 rounded-xl border px-3 py-2 sm:col-span-3 md:col-span-2" style={{ background: "var(--bg-2)", borderColor: "var(--border)" }}>
                    <div className="text-[0.52rem] font-bold uppercase tracking-widest mb-0.5" style={{ color: "var(--text-3)" }}>Detail</div>
                    <div className="text-[0.72rem]" style={{ color: "var(--text-2)" }}>{log.detail}</div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// tiny inline spinner to avoid extra import
function RotateCwIcon() { return <span className="block h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />; }

function DetailField({ label, value, mono, accent, icon }) {
  return (
    <div className="rounded-xl border px-3 py-2" style={{ background: "var(--bg-2)", borderColor: "var(--border)" }}>
      <div className="text-[0.52rem] font-bold uppercase tracking-widest mb-0.5" style={{ color: "var(--text-3)" }}>{label}</div>
      <div className={`flex items-center gap-1 truncate text-[0.72rem] font-semibold ${mono ? "font-mono" : ""}`} style={{ color: accent || "var(--text)" }}>{icon}{value}</div>
    </div>
  );
}

const exportCSV = (filtered) => {
  const head = ["Tanggal", "Jam", "User", "Email", "IP", "Browser", "Device", "Action", "Detail", "Status"];
  const rows = filtered.map((l) => {
    const d = l.created_date ? new Date(l.created_date) : null;
    return [d?.toLocaleDateString("id-ID") || "", d?.toLocaleTimeString("id-ID") || "", l.name || "", l.email || "", l.ip || "", browserOf(l.user_agent), deviceOf(l.user_agent), ACTION_META[l.action]?.label || l.action, (l.detail || "").replace(/,/g, ";"), "Success"];
  });
  const csv = [head, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `activity-log-${Date.now()}.csv`; a.click();
  URL.revokeObjectURL(url);
};

export default function ActivityLog() {
  const role = useRole();
  const me = getSession();
  const superMaster = isSuperMaster(role);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [action, setAction] = useState("all");
  const [deletingId, setDeletingId] = useState(null);
  const [showClearAll, setShowClearAll] = useState(false);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    let alive = true;
    const refresh = async () => {
      const l = superMaster ? await listActivity(300) : await listMyActivity(me?.email, 300);
      if (alive) { setLogs(l); setLoading(false); }
    };
    refresh();
    const u = subscribeActivity(refresh);
    return () => { alive = false; u?.(); };
  }, [superMaster, me?.email]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return logs.filter((l) => {
      if (action !== "all" && l.action !== action) return false;
      if (q && !`${l.name} ${l.email} ${l.detail} ${l.ip}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [logs, query, action]);

  const todayLogs = logs.filter((l) => l.created_date && new Date(l.created_date).toDateString() === new Date().toDateString());
  const loginCount = logs.filter((l) => l.action === "login").length;
  const errorCount = logs.filter((l) => l.action === "system_error").length;

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      const res = await base44.functions.invoke("deleteActivityLog", { ids: [id], user_agent: navigator.userAgent });
      if (res?.data?.error) throw new Error(res.data.error);
      toast.success("Log dihapus");
    } catch (e) {
      toast.error("Gagal hapus: " + (e?.message || ""));
    } finally {
      setDeletingId(null);
    }
  };

  const handleClearAll = async () => {
    setClearing(true);
    try {
      const res = await base44.functions.invoke("deleteActivityLog", { clearAll: true, user_agent: navigator.userAgent });
      if (res?.data?.error) throw new Error(res.data.error);
      toast.success("Semua log aktivitas dihapus");
      setShowClearAll(false);
    } catch (e) {
      toast.error("Gagal hapus semua: " + (e?.message || ""));
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="w-full p-4 md:p-6">
      <PageHead icon="fa-list-check" color="var(--violet)" title="ACTIVITY LOG"
        subtitle={superMaster ? "Riwayat aktivitas sistem realtime — semua pengguna" : "Riwayat aktivitas kamu sendiri"}
        badges={[
          { icon: superMaster ? "fa-crown" : "fa-user", text: superMaster ? "Semua User" : "Log Saya", color: superMaster ? "var(--acc)" : "var(--blue)" },
          { icon: "fa-database", text: `${logs.length} Log`, color: "var(--violet)" },
        ]} />

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total Log", value: logs.length, color: "var(--violet)" },
          { label: "Hari Ini", value: todayLogs.length, color: "var(--blue)" },
          { label: "Total Login", value: loginCount, color: "var(--green)" },
          { label: "Error", value: errorCount, color: "var(--coral)" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border px-4 py-3" style={{ background: "var(--card-solid)", borderColor: "var(--border)" }}>
            <div className="text-[0.6rem] font-bold uppercase tracking-widest mb-0.5" style={{ color: "var(--text-3)" }}>{s.label}</div>
            <div className="text-[1.5rem] font-black" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2.5">
        <div className="flex flex-1 items-center gap-2 rounded-xl border px-3 py-2.5" style={{ background: "var(--card-solid)", borderColor: "var(--border)" }}>
          <Search size={15} style={{ color: "var(--text-3)" }} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari user, email, IP, detail…" className="flex-1 bg-transparent text-[0.82rem] outline-none" style={{ color: "var(--text)" }} />
        </div>
        <div className="flex items-center gap-2 rounded-xl border px-3 py-2.5" style={{ background: "var(--card-solid)", borderColor: "var(--border)" }}>
          <Filter size={14} style={{ color: "var(--text-3)" }} />
          <select value={action} onChange={(e) => setAction(e.target.value)} className="bg-transparent text-[0.78rem] outline-none" style={{ color: "var(--text)" }}>
            <option value="all">Semua Aksi</option>
            {ACTIONS.map((a) => <option key={a} value={a}>{ACTION_META[a].label}</option>)}
          </select>
        </div>
        <button onClick={() => exportCSV(filtered)} className="flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-[0.78rem] font-medium transition-colors hover:bg-[var(--hover)]" style={{ background: "var(--card-solid)", borderColor: "var(--border)", color: "var(--text-2)" }}>
          <Download size={14} style={{ color: "var(--green)" }} /> Export CSV
        </button>
        {superMaster && (
          <button onClick={() => setShowClearAll(true)}
            className="flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-[0.78rem] font-bold transition-colors hover:bg-[var(--hover)]"
            style={{ background: "var(--card-solid)", borderColor: "rgba(239,68,68,0.4)", color: "var(--coral)" }}>
            <Trash2 size={14} /> Hapus Semua
          </button>
        )}
      </div>

      {!loading && (
        <div className="mb-3 text-[0.72rem]" style={{ color: "var(--text-3)" }}>
          Menampilkan <span style={{ color: "var(--acc)" }} className="font-semibold">{filtered.length}</span> dari {logs.length} log
        </div>
      )}

      {loading ? (
        <div className="py-16 text-center text-[0.82rem]" style={{ color: "var(--text-3)" }}>Memuat log…</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border p-12 text-center" style={{ background: "var(--card-solid)", borderColor: "var(--border)" }}>
          <div className="text-[0.86rem]" style={{ color: "var(--text-3)" }}>Tidak ada aktivitas yang cocok.</div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((l, i) => <LogCard key={l.id} log={l} index={i} canDelete={superMaster} onDelete={handleDelete} deletingId={deletingId} />)}
        </div>
      )}

      {/* Confirm Clear All */}
      {createPortal(
        <AnimatePresence>
          {showClearAll && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => !clearing && setShowClearAll(false)}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
              <motion.div initial={{ opacity: 0, scale: 0.94, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.94, y: 10 }}
                onClick={(e) => e.stopPropagation()}
                className="w-[440px] max-w-[94vw] overflow-hidden rounded-3xl border" style={{ background: "var(--card-solid)", borderColor: "var(--border)", boxShadow: "0 32px 80px rgba(0,0,0,0.8)" }}>
              <div className="flex items-center gap-2.5 border-b px-5 py-3.5" style={{ borderColor: "var(--border)", background: "linear-gradient(135deg, var(--bg-2), var(--card-solid))" }}>
                <span className="flex h-8 w-8 items-center justify-center rounded-xl" style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)" }}>
                  <AlertTriangle size={14} style={{ color: "var(--coral)" }} />
                </span>
                <h3 className="font-heading text-[0.9rem] font-bold" style={{ color: "var(--text)" }}>Hapus Semua Log?</h3>
              </div>
              <div className="px-5 py-4 text-[0.78rem]" style={{ color: "var(--text-2)" }}>
                Semua {logs.length} log aktivitas akan dihapus permanen. Tindakan ini juga dicatat di Activity Log.
              </div>
              <div className="flex items-center justify-end gap-2 border-t px-5 py-3.5" style={{ borderColor: "var(--border)" }}>
                <button onClick={() => setShowClearAll(false)} disabled={clearing}
                  className="rounded-xl border px-4 py-2.5 text-[0.74rem] font-bold" style={{ borderColor: "var(--border)", color: "var(--text-2)" }}>Batal</button>
                <button onClick={handleClearAll} disabled={clearing}
                  className="flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-[0.74rem] font-bold transition-all hover:scale-[1.02] disabled:opacity-60"
                  style={{ background: "var(--coral)", color: "#fff" }}>
                  {clearing ? <span className="block h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <Trash2 size={13} />} Hapus Semua
                </button>
              </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}