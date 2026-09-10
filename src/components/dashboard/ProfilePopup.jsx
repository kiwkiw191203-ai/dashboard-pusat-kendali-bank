import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, ShieldCheck, BadgeCheck, KeyRound, Database, Bell, UserPen,
  Lock, Settings as SettingsIcon, LogOut, Wifi, Crown, UserCog,
  User, Plus, Check, ChevronDown, Camera, ImagePlus, Loader2,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { useRole, setLocalRole, ROLES } from "@/lib/permissions";
import { getSession, updateProfile, getProfileFor } from "@/lib/dashboardAuth";
import { parseUA } from "@/lib/userAgent";
import { formatDuration, useTick } from "@/components/dashboard/utils";

const SUPER_ADMIN_EMAIL = "rizkykucuk19@gmail.com";

const ROLE_OPTIONS = [
  { key: "super_master", label: "SUPER MASTER", icon: Crown, color: "#F5C542", grad: "linear-gradient(135deg,#D9A921,#F5C542)" },
  { key: "kapten", label: "KAPTEN", icon: Crown, color: "#F7C843", grad: "linear-gradient(135deg,#B45309,#F7C843)" },
  { key: "kasir", label: "KASIR", icon: UserCog, color: "#34D399", grad: "linear-gradient(135deg,#059669,#34D399)" },
  { key: "cs", label: "CS", icon: UserCog, color: "#4F8BFF", grad: "linear-gradient(135deg,#2563eb,#4F8BFF)" },
];

function timeAgo(iso) {
  if (!iso) return "—";
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${s}d lalu`;
  if (s < 3600) return `${Math.floor(s / 60)}m lalu`;
  if (s < 86400) return `${Math.floor(s / 3600)}j lalu`;
  return new Date(iso).toLocaleDateString("id-ID");
}
function fmtTime(iso) {
  return iso ? new Date(iso).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" }) : "—";
}

function Field({ label, value, mono, accent }) {
  return (
    <div className="rounded-xl border px-3 py-2" style={{ background: "var(--bg-2)", borderColor: "var(--border)" }}>
      <div className="text-[0.52rem] font-bold uppercase tracking-widest mb-0.5" style={{ color: "var(--text-3)" }}>{label}</div>
      <div className={`truncate text-[0.74rem] font-semibold ${mono ? "font-jb" : ""}`} style={{ color: accent || "var(--text)" }}>{value || "—"}</div>
    </div>
  );
}

function StatusChip({ label, on, icon: Icon }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border px-3 py-2" style={{ background: "var(--bg-2)", borderColor: on ? "rgba(32,201,151,0.25)" : "var(--border)" }}>
      <div className="flex h-6 w-6 items-center justify-center rounded-lg flex-shrink-0" style={{ background: on ? "rgba(32,201,151,0.12)" : "rgba(90,97,114,0.12)" }}>
        <Icon size={12} style={{ color: on ? "var(--green)" : "var(--text-3)" }} />
      </div>
      <span className="flex-1 text-[0.65rem] font-medium" style={{ color: "var(--text-2)" }}>{label}</span>
      <span className="rounded-full px-1.5 py-0.5 text-[0.52rem] font-bold" style={{
        color: on ? "var(--green)" : "var(--coral)",
        background: on ? "rgba(32,201,151,0.12)" : "rgba(255,93,115,0.12)"
      }}>{on ? "AKTIF" : "OFF"}</span>
    </div>
  );
}

function SectionTitle({ children, icon: Icon, color }) {
  return (
    <div className="mb-2 mt-4 flex items-center gap-2">
      {Icon && <div className="flex h-5 w-5 items-center justify-center rounded-md" style={{ background: `${color || "var(--acc)"}18`, color: color || "var(--acc)" }}><Icon size={11} /></div>}
      <span className="text-[0.58rem] font-bold uppercase tracking-[0.18em]" style={{ color: "var(--text-3)" }}>{children}</span>
      <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
    </div>
  );
}

function QuickBtn({ icon: Icon, label, onClick, color, loading }) {
  return (
    <button onClick={onClick} disabled={loading}
      className="group flex flex-col items-center gap-1.5 rounded-xl border px-2 py-2.5 transition-all hover:border-current disabled:opacity-50"
      style={{ borderColor: "var(--border)", background: "var(--bg-2)" }}>
      <span className="flex h-9 w-9 items-center justify-center rounded-xl transition-all" style={{ color: color || "var(--text-2)", background: `${color || "var(--text-3)"}18` }}>
        {loading ? <Loader2 size={16} className="animate-spin" /> : <Icon size={16} />}
      </span>
      <span className="text-[0.58rem] font-semibold text-center leading-tight" style={{ color: "var(--text-2)" }}>{label}</span>
    </button>
  );
}

export default function ProfilePopup({ open, onClose, onLogout, anchorRef }) {
  useTick(1000);
  const navigate = useNavigate();
  const role = useRole();
  const [session, setSession] = useState(() => {
    const s = getSession();
    if (!s) return s;
    const prof = getProfileFor(s.email) || {};
    return { ...s, cover_url: s.cover_url || prof.cover_url || "" };
  });
  const [user, setUser] = useState(null);
  const [online, setOnline] = useState(null);
  const [logs, setLogs] = useState([]);
  const [nav, setNav] = useState({});
  const [roleOpen, setRoleOpen] = useState(false);

  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);

  const isOwner = session?.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
  const currentRoleOpt = ROLE_OPTIONS.find((r) => r.key === role.key) || ROLE_OPTIONS[ROLE_OPTIONS.length - 1];
  const coverUrl = session?.cover_url;

  useEffect(() => {
    if (!open) return;
    const gather = async () => {
      try { setUser(await base44.auth.me()); } catch {}
      try {
        const s = await base44.entities.OnlineSession.list("-last_seen", 100);
        setOnline(s.find((x) => x.email?.toLowerCase() === session?.email?.toLowerCase()) || null);
      } catch {}
      try { setLogs(await base44.entities.ActivityLog.list("-created_date", 200)); } catch {}
      setNav({
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language,
        screen: `${window.screen.width}×${window.screen.height}`,
        cpu: navigator.hardwareConcurrency,
        ram: navigator.deviceMemory,
        ua: navigator.userAgent,
      });
    };
    gather();
    let u1, u2;
    try { u1 = base44.entities.OnlineSession.subscribe(gather); } catch {}
    try { u2 = base44.entities.ActivityLog.subscribe(gather); } catch {}
    return () => { u1?.(); u2?.(); };
  }, [open]);

  const ua = parseUA(online?.user_agent || nav.ua || "");
  const myLogs = useMemo(() => logs.filter((l) => l.email?.toLowerCase() === session?.email?.toLowerCase()), [logs, session]);
  const loginCount = myLogs.filter((l) => l.action === "login").length;
  const loginToday = myLogs.filter((l) => l.action === "login" && l.created_date && new Date(l.created_date).toDateString() === new Date().toDateString()).length;
  const lastLogin = myLogs.find((l) => l.action === "login");
  const dur = online?.login_at ? formatDuration(Date.now() - new Date(online.login_at).getTime()) : "—";
  const loc = [online?.city, online?.region, online?.country].filter(Boolean).join(", ") || "—";
  const username = (session?.email || "").split("@")[0];

  const handleRoleChange = (key) => {
    setLocalRole(session.email, key);
    setRoleOpen(false);
    toast.success(`Role diubah ke ${ROLES[key]?.label}`);
  };

  const handleFileSelect = async (e, type) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("File harus berupa gambar"); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Ukuran file maksimal 5MB"); return; }
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setConfirm({ type, value: file_url });
    } catch { toast.error("Gagal mengupload gambar"); }
    setUploading(false);
  };

  const handleNameSave = () => {
    if (!editName.trim()) { toast.error("Nama tidak boleh kosong"); return; }
    setConfirm({ type: "name", value: editName.trim() });
  };

  const applyConfirm = () => {
    if (!confirm) return;
    if (confirm.type === "avatar") {
      setSession(updateProfile({ avatar_url: confirm.value }));
      toast.success("Foto profil berhasil diperbarui");
    } else if (confirm.type === "cover") {
      setSession(updateProfile({ cover_url: confirm.value }));
      toast.success("Foto sampul berhasil diperbarui");
    } else if (confirm.type === "name") {
      setSession(updateProfile({ name: confirm.value }));
      setEditing(false); setEditName("");
      toast.success("Nama berhasil diperbarui");
    }
    setConfirm(null);
  };

  const confirmConfig = (c) => c.type === "name"
    ? { title: "Konfirmasi Ubah Nama", desc: `Ubah nama menjadi "${c.value}"?`, icon: UserPen, color: "var(--blue)" }
    : c.type === "avatar"
    ? { title: "Konfirmasi Ganti Foto Profil", desc: "Simpan foto profil baru ini?", icon: Camera, color: "var(--violet)" }
    : { title: "Konfirmasi Ganti Foto Sampul", desc: "Simpan foto sampul baru ini?", icon: ImagePlus, color: "var(--acc)" };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, scale: 0.92, x: "-50%", y: "-50%" }}
            animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
            exit={{ opacity: 0, scale: 0.92, x: "-50%", y: "-50%" }}
            transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
            className="ds-scroll fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[960px] max-w-[94vw] overflow-y-auto rounded-3xl border"
            style={{ background: "var(--card-solid)", borderColor: "var(--border)", boxShadow: "0 32px 80px rgba(0,0,0,0.85)" }}>

            <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileSelect(e, "avatar")} />
            <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileSelect(e, "cover")} />

            <button onClick={onClose}
              className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-xl border transition-colors hover:bg-[var(--hover)]"
              style={{ borderColor: "var(--border)", color: "var(--text-3)", background: "var(--bg-2)" }}>
              <X size={14} />
            </button>

            {/* HERO HEADER */}
            <div className="relative overflow-hidden" style={{ borderRadius: "inherit inherit 0 0" }}>
              <div className="h-28 w-full relative overflow-hidden" style={coverUrl
                ? { backgroundImage: `url(${coverUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
                : { background: "linear-gradient(135deg, #0f1724 0%, rgba(245,197,66,0.25) 60%, #0f1724 100%)" }}>
                <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.4) 100%)" }} />
                <button onClick={() => coverInputRef.current?.click()} disabled={uploading}
                  className="absolute right-3 bottom-3 flex h-8 w-8 items-center justify-center rounded-xl border backdrop-blur-md transition-colors hover:bg-black/30 disabled:opacity-50"
                  style={{ borderColor: "rgba(255,255,255,0.2)", background: "rgba(0,0,0,0.3)", color: "#fff" }}>
                  {uploading ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
                </button>
              </div>

              <div className="px-5 pb-5 -mt-10 relative">
                <div className="flex items-end gap-4">
                  <div className="relative flex-shrink-0">
                    <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl text-2xl font-black"
                      style={{ background: "var(--acc-grad)", border: "3px solid var(--card-solid)", boxShadow: "0 0 28px rgba(245,197,66,0.35)", color: "#000" }}>
                      {session?.avatar_url ? <img src={session.avatar_url} alt="" className="h-full w-full object-cover" /> : (session?.name || "C")[0]?.toUpperCase()}
                      <span className="absolute bottom-1 right-1 h-3.5 w-3.5 rounded-full border-2" style={{ background: "var(--green)", borderColor: "var(--card-solid)" }} />
                    </div>
                    <button onClick={() => avatarInputRef.current?.click()} disabled={uploading}
                      className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-xl border-2 transition-colors hover:bg-[var(--hover)] disabled:opacity-50"
                      style={{ background: "var(--card-solid)", borderColor: "var(--border)", color: "var(--acc)" }}>
                      {uploading ? <Loader2 size={12} className="animate-spin" /> : <Camera size={12} />}
                    </button>
                  </div>

                  <div className="flex-1 pb-1 min-w-0">
                    {editing ? (
                      <div className="flex items-center gap-2">
                        <input autoFocus value={editName} onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") handleNameSave(); if (e.key === "Escape") setEditing(false); }}
                          className="w-full rounded-lg border bg-transparent px-2 py-1 text-[0.9rem] font-bold outline-none"
                          style={{ borderColor: "var(--acc)", color: "var(--text)" }} placeholder="Nama baru..." />
                        <button onClick={() => setEditing(false)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg border" style={{ borderColor: "var(--border)", color: "var(--text-3)" }}>
                          <X size={12} />
                        </button>
                        <button onClick={handleNameSave}
                          className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: "var(--acc-grad)", color: "#000" }}>
                          <Check size={12} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[1.05rem] truncate" style={{ color: "var(--text)" }}>{session?.name || "Pengguna"}</span>
                        <button onClick={() => { setEditName(session?.name || ""); setEditing(true); }}
                          className="flex h-6 w-6 items-center justify-center rounded-lg transition-colors hover:bg-[var(--hover)]" style={{ color: "var(--text-3)" }}>
                          <UserPen size={11} />
                        </button>
                      </div>
                    )}
                    <div className="text-[0.7rem] truncate" style={{ color: "var(--text-3)" }}>@{username}</div>

                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      <div className="relative">
                        <button onClick={() => isOwner && setRoleOpen((v) => !v)}
                          className={`flex items-center! gap-1.5 rounded-full px-2.5 py-1 text-[0.52rem] font-bold transition-all ${isOwner ? "hover:opacity-80 cursor-pointer" : "cursor-default"}`}
                          style={{ background: currentRoleOpt.grad, color: "#000", boxShadow: `0 0 14px ${currentRoleOpt.color}40` }}>
                          <img src={role.logo} alt={role.label} className="object-contain" style={{ width: 12, height: 12, filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.3))" }} />
                          {currentRoleOpt.label}
                          {isOwner && <ChevronDown size={9} />}
                        </button>
                        <AnimatePresence>
                          {roleOpen && isOwner && (
                            <motion.div initial={{ opacity: 0, y: -6, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.95 }}
                              className="absolute left-0 top-8 z-50 w-48 overflow-hidden rounded-2xl border shadow-2xl"
                              style={{ background: "var(--card-solid)", borderColor: "var(--border)", boxShadow: "0 20px 50px rgba(0,0,0,0.7)" }}>
                              <div className="px-3 pt-3 pb-1.5 text-[0.55rem] font-bold uppercase tracking-widest" style={{ color: "var(--text-3)" }}>Pilih Role</div>
                              {ROLE_OPTIONS.map((r) => {
                                const isActive = role.key === r.key;
                                return (
                                  <button key={r.key} onClick={() => handleRoleChange(r.key)}
                                    className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-[var(--hover)]"
                                    style={{ borderBottom: "1px solid var(--border)" }}>
                                    <div className="flex h-8 w-8 items-center justify-center rounded-xl overflow-hidden" style={{ background: r.grad, boxShadow: isActive ? `0 0 12px ${r.color}50` : "none" }}>
                                      <img src={ROLES[r.key]?.logo} alt="" className="h-5 w-5 object-contain" style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.3))" }} />
                                    </div>
                                    <div className="flex-1"><div className="text-[0.75rem] font-bold" style={{ color: isActive ? r.color : "var(--text)" }}>{r.label}</div></div>
                                    {isActive && <Check size={13} style={{ color: r.color }} />}
                                  </button>
                                );
                              })}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      <span className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[0.52rem] font-bold border"
                        style={{ color: "var(--green)", background: "rgba(32,201,151,0.1)", borderColor: "rgba(32,201,151,0.25)" }}>
                        <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--green)" }} /> Online
                      </span>
                      <span className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[0.52rem] font-bold border"
                        style={{ color: "var(--blue)", background: "rgba(79,139,255,0.1)", borderColor: "rgba(79,139,255,0.25)" }}>
                        <BadgeCheck size={9} /> Verified
                      </span>
                    </div>
                  </div>
                </div>

                {isOwner && (
                  <div className="mt-3 flex items-center gap-2 flex-wrap">
                    <button onClick={() => { onClose(); navigate("/settings"); }}
                      className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-[0.7rem] font-bold transition-all hover:opacity-90"
                      style={{ background: "var(--acc-grad)", color: "#000", boxShadow: "0 4px 16px rgba(245,197,66,0.35)" }}>
                      <Plus size={13} /> Buat Fitur
                    </button>
                    <div className="text-[0.62rem]" style={{ color: "var(--acc)" }}>✦ Akses Penuh Super Master</div>
                  </div>
                )}
              </div>
            </div>

            {/* CONTENT */}
            <div className="px-5 pb-5">
              <div className="text-[0.65rem] mb-1" style={{ color: "var(--text-3)" }}>{session?.email}</div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6">
                <div>
                  <SectionTitle icon={UserPen} color="var(--blue)">Informasi Akun</SectionTitle>
                  <div className="grid grid-cols-2 gap-2">
                    <Field label="Nama" value={session?.name} accent="var(--acc)" />
                    <Field label="Username" value={`@${username}`} />
                    <Field label="Email" value={session?.email} />
                    <Field label="Role" value={currentRoleOpt.label} accent={currentRoleOpt.color} />
                    <Field label="Status" value="Aktif" accent="var(--green)" />
                    <Field label="ID User" value={user?.id || "—"} mono />
                    <Field label="Tgl Bergabung" value={user?.created_date ? new Date(user.created_date).toLocaleDateString("id-ID") : "—"} />
                    <Field label="Terakhir Login" value={timeAgo(lastLogin?.created_date)} />
                    <Field label="Login Hari Ini" value={loginToday} />
                    <Field label="Jumlah Login" value={loginCount} />
                    <Field label="Durasi Login" value={dur} />
                  </div>

                  <SectionTitle icon={ShieldCheck} color="var(--green)">Status Akun</SectionTitle>
                  <div className="grid grid-cols-2 gap-2">
                    <StatusChip label="Email Verified" on icon={BadgeCheck} />
                    <StatusChip label="Google Connected" on icon={ShieldCheck} />
                    <StatusChip label="2FA" on={false} icon={KeyRound} />
                    <StatusChip label="API Connected" on={false} icon={Wifi} />
                    <StatusChip label="Database" on icon={Database} />
                    <div className="flex items-center gap-2 rounded-xl border px-3 py-2" style={{ background: "var(--bg-2)", borderColor: "var(--border)" }}>
                      <div className="flex h-6 w-6 items-center justify-center rounded-lg" style={{ background: "rgba(245,197,66,0.12)", color: "var(--acc)" }}>
                        <ShieldCheck size={12} />
                      </div>
                      <span className="flex-1 text-[0.65rem] font-medium" style={{ color: "var(--text-2)" }}>Security Score</span>
                      <span className="font-bold text-[0.65rem]" style={{ color: "var(--acc)" }}>67%</span>
                    </div>
                  </div>
                </div>

                <div>
                  <SectionTitle icon={Database} color="var(--cyan)">Informasi Perangkat</SectionTitle>
                  <div className="grid grid-cols-2 gap-2">
                    <Field label="IP Address" value={online?.ip} mono />
                    <Field label="Negara" value={online?.country} />
                    <Field label="Provinsi" value={online?.region} />
                    <Field label="Kota" value={online?.city} />
                    <Field label="Browser" value={ua.browser} />
                    <Field label="OS" value={ua.os} />
                    <Field label="Device" value={ua.device} />
                    <Field label="Resolusi" value={nav.screen} mono />
                    <Field label="Timezone" value={nav.timezone} />
                    <Field label="Bahasa" value={nav.language} />
                    <Field label="CPU" value={nav.cpu ? `${nav.cpu} cores` : "—"} />
                    <Field label="RAM" value={nav.ram ? `${nav.ram} GB` : "—"} />
                  </div>

                  <SectionTitle icon={Lock} color="var(--violet)">Session</SectionTitle>
                  <div className="grid grid-cols-2 gap-2">
                    <Field label="Login Time" value={fmtTime(online?.login_at)} />
                    <Field label="Last Activity" value={timeAgo(online?.last_seen)} />
                    <Field label="Durasi Session" value={dur} />
                    <Field label="Lokasi" value={loc} />
                  </div>

                </div>
              </div>

              <SectionTitle icon={SettingsIcon} color="var(--purple)">Aksi Cepat</SectionTitle>
              <div className="grid grid-cols-4 gap-2">
                <QuickBtn icon={SettingsIcon} label="Pengaturan" color="var(--text-2)" onClick={() => { onClose(); navigate("/settings"); }} />
                <QuickBtn icon={Bell} label="Notifikasi" color="var(--green)" onClick={() => toast.info("Notifikasi segera hadir")} />
              </div>
            </div>
          </motion.div>

          {/* Confirmation Dialog */}
          <AnimatePresence>
            {confirm && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setConfirm(null)}
                className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)" }}>
                {(() => {
                  const cfg = confirmConfig(confirm);
                  const CIcon = cfg.icon;
                  return (
                    <motion.div initial={{ scale: 0.92, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 10 }} transition={{ duration: 0.2 }}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full max-w-sm rounded-2xl border p-5"
                      style={{ background: "var(--card-solid)", borderColor: "var(--border)", boxShadow: "0 20px 50px rgba(0,0,0,0.8)" }}>
                      <div className="mb-3 flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl" style={{ background: `${cfg.color}18`, color: cfg.color }}>
                          <CIcon size={16} />
                        </div>
                        <span className="text-[0.82rem] font-bold" style={{ color: "var(--text)" }}>{cfg.title}</span>
                      </div>

                      {(confirm.type === "avatar" || confirm.type === "cover") && (
                        <div className="mb-3 overflow-hidden rounded-xl border" style={{ borderColor: "var(--border)" }}>
                          {confirm.type === "cover"
                            ? <img src={confirm.value} alt="Preview" className="h-32 w-full object-cover" />
                            : <div className="flex items-center justify-center p-4" style={{ background: "var(--bg-2)" }}>
                                <img src={confirm.value} alt="Preview" className="h-24 w-24 rounded-2xl object-cover" style={{ border: "2px solid var(--border)" }} />
                              </div>}
                        </div>
                      )}

                      <p className="mb-4 text-[0.72rem]" style={{ color: "var(--text-2)" }}>{cfg.desc}</p>

                      <div className="flex gap-2">
                        <button onClick={() => setConfirm(null)}
                          className="flex-1 rounded-xl border py-2.5 text-[0.74rem] font-bold transition-colors hover:bg-[var(--hover)]"
                          style={{ borderColor: "var(--border)", color: "var(--text-2)" }}>Batal</button>
                        <button onClick={applyConfirm}
                          className="flex-1 rounded-xl py-2.5 text-[0.74rem] font-bold transition-all hover:opacity-90"
                          style={{ background: "var(--acc-grad)", color: "#000", boxShadow: "0 4px 16px rgba(245,197,66,0.3)" }}>Ya, Simpan</button>
                      </div>
                    </motion.div>
                  );
                })()}
              </motion.div>
            )}
          </AnimatePresence>

          {roleOpen && <div className="fixed inset-0 z-[49]" onClick={() => setRoleOpen(false)} />}
        </>
      )}
    </AnimatePresence>
  );
}