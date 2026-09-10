import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Check, X, ShieldCheck, Clock, XCircle, Users } from "lucide-react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import PageHead from "@/components/dashboard/PageHead";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const STATUS_META = {
  pending: { label: "Menunggu", color: "var(--gold)", icon: Clock },
  approved: { label: "Disetujui", color: "var(--green)", icon: ShieldCheck },
  rejected: { label: "Ditolak", color: "var(--acc)", icon: XCircle },
};

const TABS = [
  { key: "all", label: "Semua" },
  { key: "pending", label: "Menunggu" },
  { key: "approved", label: "Disetujui" },
  { key: "rejected", label: "Ditolak" },
];

function fmt(d) {
  if (!d) return "—";
  return new Date(d).toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function UserApprovals() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");
  const [q, setQ] = useState("");
  const [confirm, setConfirm] = useState(null); // { row, action }
  const [busyId, setBusyId] = useState(null);

  const [profiles, setProfiles] = useState({});

  const load = async () => {
    try {
      const [data, users, sessions] = await Promise.all([
        base44.entities.UserApproval.list("-created_date", 200),
        base44.entities.User.list().catch(() => []),
        base44.entities.OnlineSession.list("-last_seen", 300).catch(() => []),
      ]);
      // Profil disinkronkan dari akun Google (User + sesi login terakhir)
      const map = {};
      (users || []).forEach((u) => {
        if (u.email) map[u.email.toLowerCase()] = { name: u.full_name || "", avatar_url: "" };
      });
      (sessions || []).forEach((s) => {
        if (!s.email) return;
        const k = s.email.toLowerCase();
        map[k] = { name: map[k]?.name || s.name || "", avatar_url: map[k]?.avatar_url || s.avatar_url || "" };
      });
      setProfiles(map);
      setRows(data || []);
    } catch {
      setRows([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    let u;
    try { u = base44.entities.UserApproval.subscribe(load); } catch { u = () => {}; }
    return () => u();
  }, []);

  const counts = useMemo(() => ({
    all: rows.length,
    pending: rows.filter((r) => r.status === "pending").length,
    approved: rows.filter((r) => r.status === "approved").length,
    rejected: rows.filter((r) => r.status === "rejected").length,
  }), [rows]);

  const filtered = useMemo(() => {
    let list = rows;
    if (tab !== "all") list = list.filter((r) => r.status === tab);
    if (q.trim()) {
      const s = q.trim().toLowerCase();
      list = list.filter((r) => (r.email || "").toLowerCase().includes(s) || (r.name || "").toLowerCase().includes(s));
    }
    return list;
  }, [rows, tab, q]);

  const runAction = async () => {
    if (!confirm) return;
    const { row, action } = confirm;
    setBusyId(row.id);
    try {
      const res = await base44.functions.invoke("manageUserApproval", { approvalId: row.id, action });
      if (res?.data?.error) throw new Error(res.data.error);
      toast.success(action === "approve" ? "Pengguna disetujui" : "Pengguna ditolak");
      await load();
    } catch (e) {
      toast.error("Gagal memproses", { description: e.message });
    }
    setBusyId(null);
    setConfirm(null);
  };

  const changeRole = async (row, role) => {
    if (role === row.role) return;
    setBusyId(row.id);
    try {
      const res = await base44.functions.invoke("manageUserApproval", { approvalId: row.id, action: "set_role", role });
      if (res?.data?.error) throw new Error(res.data.error);
      toast.success(`Role diubah ke ${role.replace("_", " ").toUpperCase()}`);
      await load();
    } catch (e) {
      toast.error("Gagal mengubah role", { description: e.message });
    }
    setBusyId(null);
  };

  return (
    <div className="w-full p-4 md:p-7">
      <PageHead
        icon="fa-user-shield"
        color="var(--gold)"
        title="Persetujuan Pengguna"
        subtitle="Kelola akses pengguna baru — hanya Super Admin"
        badges={[{ text: `${counts.pending} menunggu`, color: "var(--gold)" }]}
      />

      {/* Toolbar */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className="rounded-lg px-3.5 py-2 text-[0.76rem] font-semibold transition-colors"
              style={{
                background: tab === t.key ? "var(--acc-grad)" : "var(--glass)",
                color: tab === t.key ? "#000" : "var(--text-2)",
                border: "1px solid var(--border)",
              }}>
              {t.label} <span className="opacity-70">({counts[t.key]})</span>
            </button>
          ))}
        </div>
        <div className="relative w-full max-w-[280px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-3)" }} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama / email..."
            className="w-full rounded-lg border py-2 pl-9 pr-3 text-[0.8rem] outline-none"
            style={{ background: "var(--bg-2)", borderColor: "var(--border)", color: "var(--text)" }} />
        </div>
      </div>

      {/* List */}
      <div className="overflow-hidden rounded-2xl border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        {loading ? (
          <div className="space-y-2 p-4">
            {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-16 w-full rounded-xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-16" style={{ color: "var(--text-3)" }}>
            <Users size={28} />
            <p className="text-[0.82rem]">Tidak ada pengguna ditemukan</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: "var(--border)" }}>
            <AnimatePresence initial={false}>
              {filtered.map((row) => {
                const meta = STATUS_META[row.status] || STATUS_META.pending;
                const Icon = meta.icon;
                const prof = profiles[(row.email || "").toLowerCase()] || {};
                const displayName = prof.name || row.name || row.email?.split("@")[0] || "—";
                return (
                  <motion.div key={row.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="flex flex-wrap items-center gap-4 p-4 transition-colors hover:bg-[var(--hover)]">
                    <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-hidden rounded-full text-[0.85rem] font-semibold uppercase"
                      style={{ background: `${meta.color}18`, color: meta.color, border: `1px solid ${meta.color}33` }}>
                      {prof.avatar_url
                        ? <img src={prof.avatar_url} alt="" className="h-full w-full object-cover" />
                        : displayName[0]}
                    </div>
                    <div className="min-w-[180px] flex-1">
                      <div className="text-[0.85rem] font-semibold" style={{ color: "var(--text)" }}>{displayName}</div>
                      <div className="text-[0.7rem]" style={{ color: "var(--text-3)" }}>{row.email}</div>
                    </div>
                    <div className="text-[0.7rem]" style={{ color: "var(--text-3)", minWidth: 130 }}>
                      <span className="stat-caps text-[0.6rem]">Role</span>
                      <select
                        value={["super_master", "kapten", "kasir", "cs"].includes(row.role) ? row.role : "cs"}
                        disabled={busyId === row.id}
                        onChange={(e) => changeRole(row, e.target.value)}
                        className="mt-1 block w-full rounded-md border px-2 py-1 text-[0.72rem] font-semibold outline-none disabled:opacity-50"
                        style={{ background: "var(--bg-2)", borderColor: "var(--border)", color: "var(--text)" }}>
                        <option value="cs">CS</option>
                        <option value="kasir">Kasir</option>
                        <option value="kapten">Kapten</option>
                        <option value="super_master">Super Master</option>
                      </select>
                    </div>
                    <div className="text-[0.7rem]" style={{ color: "var(--text-3)", minWidth: 150 }}>
                      Login terakhir<br /><span style={{ color: "var(--text-2)" }}>{fmt(row.last_login_at)}</span>
                    </div>
                    <div className="text-[0.7rem]" style={{ color: "var(--text-3)", minWidth: 160 }}>
                      Diproses oleh<br />
                      <span style={{ color: "var(--text-2)" }}>{row.approved_by_name ? `${row.approved_by_name} · ${fmt(row.approved_at)}` : "—"}</span>
                    </div>
                    <span className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[0.7rem] font-bold"
                      style={{ background: `${meta.color}14`, color: meta.color, border: `1px solid ${meta.color}33` }}>
                      <Icon size={12} /> {meta.label}
                    </span>
                    {row.status !== "approved" && (
                      <button disabled={busyId === row.id} onClick={() => setConfirm({ row, action: "approve" })}
                        className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-[0.72rem] font-bold disabled:opacity-50"
                        style={{ background: "rgba(16,185,129,0.12)", color: "var(--green)", border: "1px solid rgba(16,185,129,0.3)" }}>
                        <Check size={13} /> Approve
                      </button>
                    )}
                    {row.status !== "rejected" && (
                      <button disabled={busyId === row.id} onClick={() => setConfirm({ row, action: "reject" })}
                        className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-[0.72rem] font-bold disabled:opacity-50"
                        style={{ background: "rgba(220,38,38,0.1)", color: "var(--acc)", border: "1px solid rgba(220,38,38,0.3)" }}>
                        <X size={13} /> Reject
                      </button>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      <AlertDialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirm?.action === "approve" ? "Setujui pengguna ini?" : "Tolak pengguna ini?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirm?.row?.name || confirm?.row?.email} akan {confirm?.action === "approve" ? "diberikan akses ke dashboard" : "ditolak dan tidak dapat mengakses dashboard"}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={runAction}>Ya, lanjutkan</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}