import React, { useEffect, useRef, useState } from "react";
import { ShieldCheck, MapPin, Globe, Monitor, Clock, Calendar, Activity, Mail, Camera, Edit3, Check, X } from "lucide-react";
import { getSession, saveProfile, updateProfile } from "@/lib/dashboardAuth";
import { getMySession, getCurrentSessionId, updateMyProfile } from "@/lib/dashboardSession";
import { formatDuration, useTick } from "@/components/dashboard/utils";
import { useRole, ROLES } from "@/lib/permissions";
import { base44 } from "@/api/base44Client";

function deviceOf(ua = "") {
  if (/mobile|iphone|android/i.test(ua)) return "Mobile";
  if (/ipad|tablet/i.test(ua)) return "Tablet";
  return "Desktop";
}
const fmt = (iso) => (iso ? new Date(iso).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" }) : "—");

async function uploadFile(file) {
  const { file_url } = await base44.integrations.Core.UploadFile({ file });
  return file_url;
}

export default function MyProfileCard() {
  const session = getSession();
  const role = useRole();
  const [rec, setRec] = useState(null);
  const [editName, setEditName] = useState(false);
  const [name, setName] = useState(session?.name || "");
  const [savingName, setSavingName] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const avatarRef = useRef();
  const coverRef = useRef();
  useTick(1000);

  useEffect(() => { getMySession().then(setRec); }, []);

  const loc = rec ? [rec.city, rec.region, rec.country].filter(Boolean).join(", ") : "Memuat…";
  const dur = rec ? formatDuration(Date.now() - new Date(rec.login_at).getTime()) : "—";
  const initials = (session?.name || session?.email || "C")[0]?.toUpperCase();

  const CHIPS = [
    { icon: Mail, label: "Email", value: session?.email || "—" },
    { icon: Globe, label: "IP", value: rec?.ip || "—" },
    { icon: MapPin, label: "Lokasi", value: loc },
    { icon: Monitor, label: "Perangkat", value: rec ? deviceOf(rec.user_agent) : "—" },
    { icon: Calendar, label: "Login", value: rec ? fmt(rec.login_at) : "—" },
    { icon: Activity, label: "Terakhir Aktif", value: rec ? fmt(rec.last_seen) : "—" },
  ];

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const url = await uploadFile(file);
      const next = updateProfile({ avatar_url: url });
      const sid = getCurrentSessionId();
      if (sid) await base44.entities.OnlineSession.update(sid, { avatar_url: url });
      window.dispatchEvent(new Event("storage"));
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleCoverChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    try {
      const url = await uploadFile(file);
      saveProfile(session.email, { cover_url: url });
      const sid = getCurrentSessionId();
      if (sid) await base44.entities.OnlineSession.update(sid, { cover_url: url });
      setRec((r) => r ? { ...r, cover_url: url } : r);
    } finally {
      setUploadingCover(false);
    }
  };

  const handleSaveName = async () => {
    if (!name.trim()) return;
    setSavingName(true);
    try {
      updateProfile({ name: name.trim() });
      const sid = getCurrentSessionId();
      if (sid) await base44.entities.OnlineSession.update(sid, { name: name.trim() });
      setEditName(false);
    } finally {
      setSavingName(false);
    }
  };

  const coverUrl = rec?.cover_url || session?.cover_url;
  const avatarUrl = session?.avatar_url || rec?.avatar_url;

  return (
    <div className="ds-in relative overflow-hidden rounded-3xl border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
      {/* Cover */}
      <div className="relative h-52 group">
        {coverUrl
          ? <img src={coverUrl} alt="" className="h-full w-full object-cover" />
          : <div className="h-full w-full" style={{ background: "linear-gradient(135deg, #0f1724 0%, rgba(245,197,66,0.35) 50%, #1a0f2e 100%)" }}>
              <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(ellipse at 30% 50%, rgba(245,197,66,0.6) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(139,123,255,0.5) 0%, transparent 50%)" }} />
            </div>
        }
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 50%, var(--card-solid) 100%)" }} />
        {/* Shimmer overlay */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.15) 50%, transparent 70%)", backgroundSize: "200% 200%" }} />

        {/* Edit cover button */}
        <button
          onClick={() => coverRef.current?.click()}
          disabled={uploadingCover}
          className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[0.65rem] font-bold text-white transition-all opacity-0 group-hover:opacity-100 backdrop-blur"
          style={{ background: "rgba(0,0,0,0.45)", border: "1px solid rgba(255,255,255,0.2)" }}>
          <Camera size={11} />
          {uploadingCover ? "Mengunggah…" : "Ubah Sampul"}
        </button>
        <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />

        {/* Verified badge */}
        <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-black/25 px-3 py-1 text-[0.62rem] font-bold text-white backdrop-blur">
          <ShieldCheck size={11} /> Terverifikasi
        </div>
      </div>

      <div className="px-5 pb-6">
        <div className="-mt-16 flex flex-wrap items-end gap-4">
          {/* Avatar */}
          <div className="relative group flex-shrink-0">
            <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-3xl text-3xl font-bold"
              style={{ background: "var(--acc-grad)", border: "4px solid var(--card-solid)", boxShadow: "0 8px 32px rgba(0,0,0,0.5), 0 0 0 4px var(--card-solid)" }}>
              {avatarUrl ? <img src={avatarUrl} alt="" className="h-full w-full object-cover" /> : <span style={{ color: "#000" }}>{initials}</span>}
            </div>
            <span className="absolute bottom-2 right-2 h-4.5 w-4.5 h-[18px] w-[18px] rounded-full border-2" style={{ background: "var(--green)", borderColor: "var(--card-solid)", boxShadow: "0 0 8px var(--green)" }} />
            <button
              onClick={() => avatarRef.current?.click()}
              disabled={uploadingAvatar}
              className="absolute inset-0 flex items-center justify-center rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ background: "rgba(0,0,0,0.55)" }}>
              {uploadingAvatar
                ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                : <Camera size={20} className="text-white" />}
            </button>
            <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>

          {/* Name + email */}
          <div className="min-w-0 flex-1 pb-1">
            <div className="flex items-center gap-2 flex-wrap">
              {editName ? (
                <div className="flex items-center gap-1.5">
                  <input
                    className="rounded-lg border px-2 py-1 text-[0.88rem] font-bold outline-none"
                    style={{ background: "var(--glass)", borderColor: "var(--border)", color: "var(--text)", width: 160 }}
                    value={name} onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                    autoFocus />
                  <button onClick={handleSaveName} disabled={savingName} className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors" style={{ background: "var(--green)", color: "#fff" }}>
                    <Check size={13} />
                  </button>
                  <button onClick={() => { setEditName(false); setName(session?.name || ""); }} className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors" style={{ background: "var(--hover)", color: "var(--text-2)" }}>
                    <X size={13} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h2 className="truncate text-lg font-bold" style={{ color: "var(--text)" }}>{session?.name || "Pengguna"}</h2>
                  <button onClick={() => setEditName(true)} className="flex h-6 w-6 items-center justify-center rounded-md transition-colors hover:bg-[var(--hover)]" style={{ color: "var(--text-3)" }}>
                    <Edit3 size={12} />
                  </button>
                </div>
              )}

              {/* Role badge — read-only display */}
              <span
                className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.55rem] font-bold"
                style={{ color: role.color, background: `${role.color}20`, border: `1px solid ${role.color}40` }}>
                <img src={role.logo} alt={role.label} className="object-contain" style={{ width: 14, height: 14, filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.3))" }} />
                {role.label}
              </span>
            </div>
            <div className="truncate text-[0.75rem] mt-0.5" style={{ color: "var(--text-3)" }}>{session?.email}</div>
          </div>

          {/* Duration */}
          <div className="flex items-center gap-1.5 rounded-xl border px-3 py-2" style={{ background: "var(--glass)", borderColor: "var(--border)" }}>
            <Clock size={13} style={{ color: "var(--green)" }} />
            <div>
              <div className="font-jb text-sm font-bold leading-none" style={{ color: "var(--green)" }}>{dur}</div>
              <div className="text-[0.58rem]" style={{ color: "var(--text-3)" }}>durasi</div>
            </div>
          </div>
        </div>

        {/* Info chips */}
        <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {CHIPS.map((c) => (
            <div key={c.label} className="flex items-center gap-2 rounded-xl border px-3 py-2.5" style={{ background: "var(--glass)", borderColor: "var(--border)" }}>
              <c.icon size={13} style={{ color: "var(--acc)" }} className="flex-shrink-0" />
              <div className="min-w-0">
                <div className="text-[0.56rem] uppercase tracking-wide" style={{ color: "var(--text-3)" }}>{c.label}</div>
                <div className="truncate text-[0.74rem] font-semibold" style={{ color: "var(--text)" }}>{c.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>


    </div>
  );
}