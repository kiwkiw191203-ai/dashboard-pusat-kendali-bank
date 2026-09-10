import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock, Search, Crown, UserCog, Anchor, Smartphone,
  LayoutDashboard, Users, DollarSign, MessageCircle, Settings,
  ShieldCheck, UserCheck, CheckCircle, XCircle, RotateCcw,
  ChevronDown, ChevronUp, Megaphone, Send,
  Dices, Calculator, Ticket, Landmark, ScanLine,
} from "lucide-react";
import SendNotificationModal from "@/components/dashboard/SendNotificationModal";
import RoleTemplateTree from "@/components/dashboard/RoleTemplateTree";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { getRole, canManagePermissions, ROLES, setLocalRole } from "@/lib/permissions";
import { getSession } from "@/lib/dashboardAuth";
import { ALL_FEATURES, ROLE_DEFAULTS } from "@/lib/roleDefaults";

const PERMISSION_GROUPS = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    color: "var(--acc)",
    items: [
      { key: "overview", label: "Overview", desc: "Halaman ringkasan utama" },
      { key: "dashboard", label: "Dashboard", desc: "Panel dashboard kerja" },
      { key: "ai", label: "AI Chat", desc: "Asisten AI" },
      { key: "notes", label: "Notes", desc: "Catatan kerja" },
    ],
  },
  {
    key: "togel",
    label: "Togel",
    icon: Dices,
    color: "var(--rose)",
    items: [
      { key: "predict", label: "Prediksi Togel", desc: "Prediksi berbasis AI" },
      { key: "result_togel", label: "Hasil Result Togel", desc: "Hasil & input result semua pasaran" },
      { key: "togel_calc", label: "Kalkulator Togel", desc: "Hitung modal & kemenangan togel" },
      { key: "kpbi_live", label: "KPBI Live", desc: "Live iframe KPBI" },
      { key: "kpbi_cek", label: "KPBI Cek Member", desc: "Cek diskualifikasi & leaderboard KPBI" },
    ],
  },
  {
    key: "kalkulator",
    label: "Kalkulator",
    icon: Calculator,
    color: "var(--cyan)",
    items: [
      { key: "bet_calc", label: "Kalkulator Betting", desc: "Over/Under & Handicap" },
      { key: "parlay_calc", label: "Kalkulator Parlay", desc: "Parlay multi-leg" },
    ],
  },
  {
    key: "tiket",
    label: "Tiket & Freespin",
    icon: Ticket,
    color: "var(--gold)",
    items: [
      { key: "ticket", label: "Kode Tiket", desc: "Kode tiket member" },
      { key: "analyzer", label: "Hitung Freespin", desc: "Kalkulator freespin" },
      { key: "win", label: "Tangkapan Menang", desc: "Upload & kelola hasil menang" },
    ],
  },
  {
    key: "bank",
    label: "Bank & QRIS",
    icon: Landmark,
    color: "var(--blue)",
    items: [
      { key: "bank", label: "Profil Bank", desc: "Data rekening bank" },
      { key: "rrn", label: "RRN Qris", desc: "Cek & validasi RRN QRIS" },
      { key: "shortcut", label: "Pintasan B.Qris", desc: "Template pesan QRIS" },
      { key: "validasi", label: "Validasi Rekening", desc: "Validasi rekening/ewallet member" },
    ],
  },
  {
    key: "kasir",
    label: "Kasir & HP Office",
    icon: Smartphone,
    color: "var(--green)",
    items: [
      { key: "cek_hp", label: "Cek HP Office", desc: "Crosscheck HP office + riwayat petugas" },
      { key: "transaction_log", label: "Data Depo / WD Qiris", desc: "Log transaksi dari Google Sheet" },
    ],
  },
  {
    key: "kode",
    label: "Kode Game",
    icon: ScanLine,
    color: "var(--purple)",
    items: [
      { key: "code_filter", label: "Filter Kode Game", desc: "Cocokkan kode spin dengan model game" },
    ],
  },
  {
    key: "tim",
    label: "Tim & File",
    icon: MessageCircle,
    color: "var(--green)",
    items: [
      { key: "chat", label: "Chat Koordinasi", desc: "Ruang obrolan tim" },
      { key: "chat_archive", label: "Arsip Kesalahan Chat", desc: "Dokumentasi evaluasi chat" },
      { key: "files", label: "File Kerja CS", desc: "Kelola file kerja CS" },
      { key: "online", label: "Pengguna Online", desc: "Pantau sesi aktif" },
      { key: "activity", label: "Activity Log", desc: "Log aktivitas sistem" },
    ],
  },
  {
    key: "sistem",
    label: "Sistem",
    icon: Settings,
    color: "var(--acc)",
    items: [
      { key: "settings", label: "Pengaturan", desc: "Konfigurasi akun & app" },
      { key: "profile", label: "Profil", desc: "Profil pribadi" },
      { key: "extension_suite", label: "Extension Suite", desc: "Info & changelog extension" },
      { key: "auto_screenshot", label: "Auto Screenshot", desc: "Tangkap screenshot otomatis" },
      { key: "feature_builder", label: "Feature Builder", desc: "Buat fitur kustom" },
    ],
  },
  {
    key: "admin",
    label: "Admin",
    icon: ShieldCheck,
    color: "var(--coral)",
    items: [
      { key: "permissions", label: "Permissions", desc: "Kelola hak akses" },
      { key: "roles", label: "Atur Role", desc: "Ubah role pengguna" },
      { key: "security", label: "Security Center", desc: "Audit keamanan" },
    ],
  },
];

const FEATURE_LABELS = PERMISSION_GROUPS.flatMap((g) => g.items).reduce((acc, f) => { acc[f.key] = f.label; return acc; }, {});

const ROLE_ICON = { super_master: Crown, kapten: Anchor, kasir: Calculator, cs: UserCog };

function Toggle({ on, onChange }) {
  return (
    <button
      onClick={onChange}
      className="relative flex-shrink-0 rounded-full transition-all duration-300 focus:outline-none"
      style={{
        width: 46,
        height: 26,
        background: on ? "linear-gradient(135deg, #0F766E 0%, #14B8A6 100%)" : "rgba(120,132,150,0.3)",
        boxShadow: on ? "0 0 12px rgba(20,184,166,0.35), inset 0 1px 2px rgba(0,0,0,0.2)" : "inset 0 1px 2px rgba(0,0,0,0.18)",
        border: `1px solid ${on ? "rgba(20,184,166,0.55)" : "var(--border)"}`,
      }}>
      <motion.span
        animate={{ x: on ? 24 : 3 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="absolute top-0.5 flex h-[18px] w-[18px] items-center justify-center rounded-full"
        style={{ background: on ? "#FFFFFF" : "#E5E7EB", boxShadow: "0 2px 5px rgba(0,0,0,0.35)" }}
      />
    </button>
  );
}

export default function Permissions() {
  const role = getRole();
  const can = canManagePermissions(role);
  const me = getSession();
  const [users, setUsers] = useState([]);
  const [perms, setPerms] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [activeRoleTab, setActiveRoleTab] = useState("cs");
  const [roleTemplates, setRoleTemplates] = useState([]);
  const [templateBusy, setTemplateBusy] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifTarget, setNotifTarget] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [u, p, rt] = await Promise.all([
        base44.entities.User.list(),
        base44.entities.FeaturePermission.list("-created_date", 500),
        base44.entities.RoleTemplate.list("-created_date", 500),
      ]);
      setUsers(u);
      setPerms(p);
      setRoleTemplates(rt);
    } catch {
      setUsers([]);
      setPerms([]);
      setRoleTemplates([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!can) { setLoading(false); return; }
    load();
    let u1, u2, u3;
    try { u1 = base44.entities.User.subscribe(load); } catch { u1 = () => {}; }
    try { u2 = base44.entities.FeaturePermission.subscribe(load); } catch { u2 = () => {}; }
    try { u3 = base44.entities.RoleTemplate.subscribe(load); } catch { u3 = () => {}; }
    return () => { u1(); u2(); u3(); };
  }, [can]);

  const permMap = useMemo(() => {
    const m = {};
    perms.forEach((p) => { (m[p.email] = m[p.email] || {})[p.feature] = p; });
    return m;
  }, [perms]);

  const filteredUsers = users.filter((u) => {
    const q = query.trim().toLowerCase();
    return !q || `${u.email} ${u.full_name || ""}`.toLowerCase().includes(q);
  });

  const setRole = async (u, newRole) => {
    try {
      await base44.entities.User.update(u.id, { role: newRole });
      setLocalRole(u.email, newRole);
      try {
        await base44.entities.ActivityLog.create({ email: me?.email, name: me?.name || "", action: "role_change", detail: `${u.email} → ${ROLES[newRole].label}`, user_agent: navigator.userAgent });
      } catch {}
      try {
        await base44.entities.LiveEvent.create({
          actor_name: me?.name || me?.email || "Super Master",
          actor_email: me?.email || "",
          actor_role: role.key,
          event_type: "role_change",
          message: `${(me?.name || "SUPER MASTER").toUpperCase()} MENGUBAH ROLE ${u.email.toUpperCase()} → ${ROLES[newRole].label.toUpperCase()}`,
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
      // Auto-apply the role's feature template to the user
      await applyTemplateToUser(u.email, newRole);
      toast.success(`Role ${u.email} → ${ROLES[newRole].label} (template diterapkan)`);
      load();
    } catch { toast.error("Gagal mengubah role"); }
  };

  const toggleFeature = async (email, feature) => {
    const existing = permMap[email]?.[feature];
    try {
      if (existing) await base44.entities.FeaturePermission.update(existing.id, { enabled: !existing.enabled });
      else await base44.entities.FeaturePermission.create({ email, feature, enabled: false });
      const isEnabling = existing ? !existing.enabled : false;
      try {
        await base44.entities.LiveEvent.create({
          actor_name: me?.name || me?.email || "Super Master",
          actor_email: me?.email || "",
          actor_role: role.key,
          event_type: isEnabling ? "feature_on" : "feature_off",
          message: `${(me?.name || "SUPER MASTER").toUpperCase()} ${isEnabling ? "MENGAKTIFKAN" : "MENONAKTIFKAN"} FITUR ${(FEATURE_LABELS[feature] || feature).toUpperCase()} UNTUK ${email.toUpperCase()}`,
          accent_color: isEnabling ? "var(--green)" : "var(--coral)",
        });
      } catch {}
      try {
        await base44.entities.PushNotification.create({
          target_email: email,
          target_name: email,
          from_email: me?.email || "",
          from_name: me?.name || "Super Master",
          from_role: role.key,
          title: isEnabling ? "FITUR DIAKTIFKAN" : "FITUR DINONAKTIFKAN",
          message: `${(me?.name || "SUPER MASTER").toUpperCase()} ${isEnabling ? "MENGAKTIFKAN" : "MENONAKTIFKAN"} FITUR ${(FEATURE_LABELS[feature] || feature).toUpperCase()} UNTUK AKUN ANDA`,
          type: isEnabling ? "success" : "error",
          read: false,
        });
      } catch {}
      load();
    } catch { toast.error("Gagal memperbarui permission"); }
  };

  // Efektif: record eksplisit menang, kalau tidak ada → ikuti template role (sinkron dengan sidebar).
  const isOn = (email, feature) => {
    const p = permMap[email]?.[feature];
    if (p) return p.enabled;
    const u = users.find((x) => x.email === email);
    const rk = ROLES[u?.role] ? u.role : "cs";
    if (rk === "super_master") return true;
    return isRoleFeatureOn(rk, feature);
  };

  // ── Role Template helpers ──────────────────────────────────────
  // Build a map: { role: { feature: enabled } }
  const templateMap = useMemo(() => {
    const m = {};
    roleTemplates.forEach((t) => { (m[t.role] = m[t.role] || {})[t.feature] = t.enabled; });
    return m;
  }, [roleTemplates]);

  // Returns true if a feature is ON for a given role template.
  // Falls back to ROLE_DEFAULTS when no RoleTemplate record exists.
  const isRoleFeatureOn = (role, feature) => {
    const t = templateMap[role]?.[feature];
    if (t !== undefined) return t;
    return ROLE_DEFAULTS[role]?.includes(feature) ?? false;
  };

  // Toggle a feature in a role template — then auto-apply to ALL users with that role.
  const toggleRoleFeature = async (targetRole, feature) => {
    setTemplateBusy(true);
    try {
      const existing = roleTemplates.find((t) => t.role === targetRole && t.feature === feature);
      const newEnabled = existing ? !existing.enabled : !isRoleFeatureOn(targetRole, feature);
      if (existing) {
        await base44.entities.RoleTemplate.update(existing.id, { enabled: newEnabled });
      } else {
        await base44.entities.RoleTemplate.create({ role: targetRole, feature, enabled: newEnabled });
      }

      // Auto-apply: update FeaturePermission for all users with this role
      const affectedUsers = users.filter((u) => u.role === targetRole);
      await Promise.all(affectedUsers.map(async (u) => {
        const existing = permMap[u.email]?.[feature];
        if (existing) {
          await base44.entities.FeaturePermission.update(existing.id, { enabled: newEnabled });
        } else {
          await base44.entities.FeaturePermission.create({ email: u.email, feature, enabled: newEnabled });
        }
      }));

      toast.success(`Fitur "${FEATURE_LABELS[feature] || feature}" ${newEnabled ? "diaktifkan" : "dinonaktifkan"} untuk semua ${ROLES[targetRole]?.label}`);
      load();
    } catch { toast.error("Gagal memperbarui template"); }
    setTemplateBusy(false);
  };

  // Apply a role's template to a specific user — overwrites all their FeaturePermissions.
  const applyTemplateToUser = async (email, role) => {
    setTemplateBusy(true);
    try {
      // Delete all existing permissions for this user
      const userPerms = perms.filter((p) => p.email === email);
      await Promise.all(userPerms.map((p) => base44.entities.FeaturePermission.delete(p.id)));
      // Create new permissions based on the role template
      const featuresToEnable = ALL_FEATURES.filter((f) => isRoleFeatureOn(role, f));
      const featuresToDisable = ALL_FEATURES.filter((f) => !isRoleFeatureOn(role, f));
      await Promise.all([
        ...featuresToEnable.map((f) => base44.entities.FeaturePermission.create({ email, feature: f, enabled: true })),
        ...featuresToDisable.map((f) => base44.entities.FeaturePermission.create({ email, feature: f, enabled: false })),
      ]);
      toast.success(`Template ${ROLES[role].label} diterapkan ke ${email}`);
      load();
    } catch { toast.error("Gagal menerapkan template"); }
    setTemplateBusy(false);
  };

  const enableAll = async (email) => {
    try {
      await Promise.all(ALL_FEATURES.map(async (f) => {
        const existing = permMap[email]?.[f];
        if (existing) await base44.entities.FeaturePermission.update(existing.id, { enabled: true });
        else await base44.entities.FeaturePermission.create({ email, feature: f, enabled: true });
      }));
      toast.success("Semua permission diaktifkan");
      load();
    } catch { toast.error("Gagal mengaktifkan semua"); }
  };

  const disableAll = async (email) => {
    try {
      await Promise.all(ALL_FEATURES.map(async (f) => {
        const existing = permMap[email]?.[f];
        if (existing) await base44.entities.FeaturePermission.update(existing.id, { enabled: false });
        else await base44.entities.FeaturePermission.create({ email, feature: f, enabled: false });
      }));
      toast.success("Semua permission dinonaktifkan");
      load();
    } catch { toast.error("Gagal menonaktifkan semua"); }
  };

  const resetAll = async (email) => {
    try {
      const userPerms = perms.filter((p) => p.email === email);
      await Promise.all(userPerms.map((p) => base44.entities.FeaturePermission.delete(p.id)));
      toast.success("Permission direset ke default");
      load();
    } catch { toast.error("Gagal mereset permission"); }
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
          <p className="mt-1 text-[0.78rem]" style={{ color: "var(--text-3)" }}>Hanya SUPER MASTER yang dapat mengelola permission.</p>
        </motion.div>
      </div>
    );
  }

  const featureQuery = query.trim().toLowerCase();
  const userQuery = query.trim().toLowerCase();

  return (
    <div className="w-full p-4 md:p-6">
      {/* Section header — ringkas, tanpa duplikasi judul halaman */}
      <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl border p-4"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ background: "rgba(var(--acc-rgb),0.12)", border: "1px solid rgba(var(--acc-rgb),0.28)", color: "var(--acc)" }}>
          <UserCheck size={17} />
        </div>
        <div className="min-w-[180px] flex-1">
          <div className="label-caps text-[0.62rem]" style={{ color: "var(--text-3)" }}>Pengaturan Akses</div>
          <div className="text-[0.9rem] font-semibold" style={{ color: "var(--text)" }}>{users.length} pengguna terdaftar</div>
        </div>
        <div className="relative min-w-[220px] flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-3)" }} />
          <input value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari user, fitur, atau kategori…"
            className="w-full rounded-xl border py-2.5 pl-9 pr-3 text-[0.82rem] outline-none"
            style={{ background: "var(--glass)", borderColor: "var(--border)", color: "var(--text)" }} />
        </div>
        <button onClick={() => { setNotifTarget(null); setNotifOpen(true); }}
          className="flex items-center gap-2 rounded-xl border px-4 py-2.5 text-[0.74rem] font-medium"
          style={{ background: "rgba(var(--acc-rgb),0.1)", borderColor: "rgba(var(--acc-rgb),0.3)", color: "var(--acc)" }}>
          <Megaphone size={15} /> Broadcast
        </button>
      </div>

      {/* ── Role Template Section ─────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="mb-4 overflow-hidden rounded-2xl border"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        <div className="flex items-center gap-3 border-b px-4 py-3.5" style={{ borderColor: "var(--border)", background: "var(--glass)" }}>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: "rgba(var(--acc-rgb),0.12)", border: "1px solid rgba(var(--acc-rgb),0.28)" }}>
            <Crown size={16} style={{ color: "var(--acc)" }} />
          </div>
          <div className="flex-1">
            <div className="text-[0.88rem] font-semibold" style={{ color: "var(--text)" }}>Template Fitur per Role</div>
            <div className="text-[0.66rem]" style={{ color: "var(--text-3)" }}>Atur fitur default tiap role · tombol “Terapkan” untuk apply ke pengguna</div>
          </div>
        </div>

        {/* Role tab buttons */}
        <div className="flex gap-2 p-3 border-b" style={{ borderColor: "var(--border)" }}>
          {Object.keys(ROLES).map((r) => {
            const RI = ROLE_ICON[r];
            const active = activeRoleTab === r;
            const count = ALL_FEATURES.filter((f) => isRoleFeatureOn(r, f)).length;
            return (
              <button key={r} onClick={() => setActiveRoleTab(r)} disabled={templateBusy}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-[0.72rem] font-bold transition-all hover:scale-[1.02] disabled:opacity-50"
                style={active
                  ? { background: ROLES[r].color + "22", color: ROLES[r].color, borderColor: ROLES[r].color + "55" }
                  : { background: "var(--glass)", borderColor: "var(--border)", color: "var(--text-3)" }}>
                <RI size={13} />
                <span>{ROLES[r].label}</span>
                <span className="rounded-full px-1.5 py-0.5 text-[0.5rem]" style={{ background: active ? ROLES[r].color + "30" : "var(--hover)", color: active ? ROLES[r].color : "var(--text-3)" }}>{count}/{ALL_FEATURES.length}</span>
              </button>
            );
          })}
        </div>

        {/* Features for the selected role — Expandable Tree Menu */}
        <div className="p-4">
          <div className="label-caps mb-3 flex items-center gap-2 text-[0.6rem]" style={{ color: "var(--text-3)" }}>
            <span>Fitur untuk {ROLES[activeRoleTab].label}</span>
            <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
            <span className="normal-case" style={{ letterSpacing: 0, color: "var(--text-3)" }}>Klik grup untuk expand/collapse</span>
          </div>
          <RoleTemplateTree
            groups={PERMISSION_GROUPS}
            roleKey={activeRoleTab}
            isFeatureOn={isRoleFeatureOn}
            onToggle={toggleRoleFeature}
            disabled={templateBusy}
          />
        </div>
      </motion.div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: "var(--coral)" }} />
          <p className="mt-3 text-[0.82rem]" style={{ color: "var(--text-3)" }}>Memuat data…</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="rounded-2xl border p-12 text-center" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl" style={{ background: "var(--glass)", border: "1px solid var(--border)" }}>
            <Users size={28} style={{ color: "var(--text-3)" }} />
          </div>
          <p className="text-[0.86rem] font-medium" style={{ color: "var(--text-2)" }}>Belum ada user terdaftar.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredUsers.map((u, ui) => {
            const isMe = u.email === me?.email;
            const r = ROLES[u.role] || ROLES.cs;
            const expanded = expandedId === u.id;
            const enabledCount = ALL_FEATURES.filter((f) => isOn(u.email, f)).length;
            const totalCount = ALL_FEATURES.length;
            return (
              <motion.div key={u.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: ui * 0.03 }}
                className="overflow-hidden rounded-2xl border"
                style={{ background: "var(--card)", borderColor: expanded ? r.color + "66" : isMe ? "rgba(var(--acc-rgb),0.35)" : "var(--border)" }}>

                {/* Compact User Row — click to toggle */}
                <button onClick={() => setExpandedId(expanded ? null : u.id)}
                  className="flex w-full items-center gap-3 p-3.5 text-left transition-colors hover:bg-[var(--hover)]">
                  <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl text-sm font-bold text-black flex-shrink-0"
                    style={{ background: "var(--acc-grad)", boxShadow: "0 0 12px rgba(var(--acc-rgb),0.25)" }}>
                    {u.avatar_url ? <img src={u.avatar_url} alt="" className="h-full w-full object-cover" /> : (u.full_name || u.email)[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-[0.86rem] font-bold" style={{ color: "var(--text)" }}>{u.full_name || u.email.split("@")[0]}</span>
                      {isMe && <span className="rounded-full px-1.5 py-0.5 text-[0.5rem] font-bold" style={{ color: "var(--acc)", background: "rgba(var(--acc-rgb),0.16)", border: "1px solid rgba(var(--acc-rgb),0.3)" }}>SAYA</span>}
                    </div>
                    <div className="truncate text-[0.68rem]" style={{ color: "var(--text-3)" }}>{u.email}</div>
                  </div>

                  {/* Permission summary badge */}
                  <div className="hidden sm:flex items-center gap-2 rounded-lg px-2.5 py-1 text-[0.6rem] font-bold" style={{ background: "var(--glass)", border: "1px solid var(--border)", color: "var(--text-2)" }}>
                    <span style={{ color: "var(--green)" }}>{enabledCount}</span>
                    <span style={{ color: "var(--text-3)" }}>/ {totalCount}</span>
                    <span style={{ color: "var(--text-3)" }}>fitur</span>
                  </div>

                  {/* Role badge */}
                  <span className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[0.58rem] font-bold flex-shrink-0"
                    style={{ color: r.color, background: r.color + "1a", border: `1px solid ${r.color}30` }}>
                    {r.label}
                  </span>

                  {/* Expand chevron */}
                  <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }} className="flex-shrink-0" style={{ color: "var(--text-3)" }}>
                    <ChevronDown size={18} />
                  </motion.div>
                </button>

                {/* Expanded Permission Panel */}
                <AnimatePresence>
                  {expanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      {/* Action toolbar */}
                      <div className="flex flex-wrap items-center gap-1.5 border-t px-4 py-3" style={{ borderColor: "var(--border)", background: "var(--bg-2)" }}>
                        {Object.keys(ROLES).map((rr) => {
                          const RI = ROLE_ICON[rr] || Crown;
                          const isActive = u.role === rr;
                          return (
                            <button key={rr} onClick={() => setRole(u, rr)}
                              className="flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[0.6rem] font-bold transition-all hover:scale-105"
                              style={isActive
                                ? { background: ROLES[rr].color + "22", color: ROLES[rr].color, borderColor: ROLES[rr].color + "55" }
                                : { background: "var(--glass)", borderColor: "var(--border)", color: "var(--text-3)" }}>
                              <RI size={10} /> {ROLES[rr].label}
                            </button>
                          );
                        })}
                        <div className="mx-1 h-5 w-px" style={{ background: "var(--border)" }} />
                        <button onClick={() => { setNotifTarget({ email: u.email, name: u.full_name || u.email }); setNotifOpen(true); }}
                          className="flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-[0.6rem] font-bold transition-all hover:scale-105"
                          style={{ color: "var(--blue)", borderColor: "rgba(79,139,255,0.3)", background: "rgba(79,139,255,0.08)" }}>
                          <Send size={10} /> Notif
                        </button>
                        <button onClick={() => applyTemplateToUser(u.email, u.role)}
                          className="flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-[0.6rem] font-bold transition-all hover:scale-105"
                          style={{ color: "var(--acc)", borderColor: "rgba(var(--acc-rgb),0.3)", background: "rgba(var(--acc-rgb),0.08)" }}>
                          <Crown size={10} /> Terapkan
                        </button>
                        <button onClick={() => enableAll(u.email)}
                          className="flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-[0.6rem] font-bold transition-all hover:scale-105"
                          style={{ color: "var(--green)", borderColor: "rgba(32,201,151,0.3)", background: "rgba(32,201,151,0.08)" }}>
                          <CheckCircle size={10} /> Aktifkan Semua
                        </button>
                        <button onClick={() => disableAll(u.email)}
                          className="flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-[0.6rem] font-bold transition-all hover:scale-105"
                          style={{ color: "var(--coral)", borderColor: "rgba(255,93,115,0.3)", background: "rgba(255,93,115,0.08)" }}>
                          <XCircle size={10} /> Nonaktifkan
                        </button>
                        <button onClick={() => resetAll(u.email)}
                          className="flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-[0.6rem] font-bold transition-all hover:scale-105"
                          style={{ color: "var(--text-2)", borderColor: "var(--border)", background: "var(--glass)" }}>
                          <RotateCcw size={10} /> Reset
                        </button>
                      </div>

                      {/* Permission Groups */}
                      <div className="p-4">
                        {PERMISSION_GROUPS.map((group) => {
                          const filteredItems = featureQuery
                            ? group.items.filter((f) => f.label.toLowerCase().includes(featureQuery) || f.desc.toLowerCase().includes(featureQuery) || group.label.toLowerCase().includes(featureQuery))
                            : group.items;
                          if (filteredItems.length === 0) return null;
                          const GIcon = group.icon;
                          return (
                            <div key={group.key} className="mb-4 last:mb-0">
                              <div className="mb-2.5 flex items-center gap-2">
                                <div className="flex h-5 w-5 items-center justify-center rounded-md flex-shrink-0"
                                  style={{ background: `${group.color}18`, color: group.color }}>
                                  <GIcon size={11} />
                                </div>
                                <span className="label-caps text-[0.62rem]" style={{ color: "var(--text-3)" }}>{group.label}</span>
                                <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
                              </div>
                              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                {filteredItems.map((f) => {
                                  const on = isOn(u.email, f.key);
                                  return (
                                    <div key={f.key}
                                      className="flex items-center gap-3 rounded-xl border p-3 transition-all"
                                      style={{
                                        background: on ? `${group.color}08` : "var(--glass)",
                                        borderColor: on ? `${group.color}30` : "var(--border)",
                                      }}>
                                      <div className="flex-1 min-w-0">
                                        <div className="text-[0.78rem] font-semibold truncate" style={{ color: on ? "var(--text)" : "var(--text-2)" }}>{f.label}</div>
                                        <div className="text-[0.62rem] truncate" style={{ color: "var(--text-3)" }}>{f.desc}</div>
                                      </div>
                                      <Toggle on={on} onChange={() => toggleFeature(u.email, f.key)} />
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
      <SendNotificationModal open={notifOpen} onClose={() => setNotifOpen(false)} targetUser={notifTarget} />
    </div>
  );
}