import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Pencil, Crown, UserCog, Zap, Anchor, Calculator } from "lucide-react";
import { ROLES } from "@/lib/permissions";
import { FEATURE_LABELS } from "@/lib/featureLabels";
import { ROLE_DEFAULTS } from "@/lib/roleDefaults";

const ROLE_ICONS = { super_master: Crown, kapten: Anchor, kasir: Calculator, cs: UserCog };

export default function UserCard({ user, session, perms, isMe, canEdit, onEdit }) {
  const [showAll, setShowAll] = useState(false);
  const roleKey = ROLES[user.role] ? user.role : "cs";
  const role = ROLES[roleKey];
  const RIcon = ROLE_ICONS[roleKey] || UserCog;

  const features = useMemo(() => {
    const defaults = ROLE_DEFAULTS[roleKey] || [];
    const explicit = (perms || []).filter((p) => p.email === user.email);
    const map = {};
    defaults.forEach((f) => { map[f] = true; });
    explicit.forEach((p) => { map[p.feature] = p.enabled; });
    const entries = Object.entries(map);
    const enabled = entries.filter(([, v]) => v).map(([f]) => f);
    const disabled = entries.filter(([, v]) => !v).map(([f]) => f);
    return { enabled, disabled, total: entries.length };
  }, [perms, roleKey, user.email]);

  const online = !!session;
  const avatar = session?.avatar_url;
  const cover = session?.cover_url;
  const name = session?.name || user.full_name || user.email?.split("@")[0];
  const lastSeen = session?.last_seen ? new Date(session.last_seen) : null;

  const shown = showAll ? features.enabled : features.enabled.slice(0, 6);

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
      className="group overflow-hidden rounded-2xl border transition-all hover:-translate-y-1"
      style={{
        background: "var(--card)",
        borderColor: isMe ? "rgba(var(--acc-rgb),0.5)" : role.color + "30",
        boxShadow: `0 4px 24px ${role.color}18`,
      }}>

      <div className="relative h-28 overflow-hidden">
        {cover
          ? <img src={cover} alt="" className="h-full w-full object-cover" style={{ imageRendering: "auto" }} />
          : <div className="h-full w-full" style={{ background: `linear-gradient(135deg, ${role.color}45 0%, ${role.color}15 100%)` }} />}
        <div className="absolute inset-x-0 bottom-0 h-12" style={{ background: "linear-gradient(180deg, transparent 0%, var(--card) 96%)" }} />
        <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[0.55rem] font-bold backdrop-blur-md"
          style={{ background: "rgba(0,0,0,0.5)", color: online ? "var(--green)" : "var(--text-3)" }}>
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: online ? "var(--green)" : "var(--text-3)", boxShadow: online ? "0 0 6px var(--green)" : "none", animation: online ? "ds-pulse 2s infinite" : "none" }} />
          {online ? "ONLINE" : "OFFLINE"}
        </div>
        {isMe && (
          <div className="absolute right-3 top-3 rounded-full px-2 py-0.5 text-[0.5rem] font-black"
            style={{ color: "var(--acc)", background: "rgba(var(--acc-rgb),0.2)", border: "1px solid rgba(var(--acc-rgb),0.4)" }}>SAYA</div>
        )}
      </div>

      <div className="px-4 pb-4">
        <div className="-mt-12 flex items-end gap-3">
          <div className="flex h-18 w-18 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl text-xl font-bold"
            style={{
              width: "4.5rem", height: "4.5rem",
              background: `${role.color}20`,
              border: `3px solid ${role.color}`,
              color: role.color,
              boxShadow: `0 0 16px ${role.color}30, 0 0 0 3px var(--card)`,
            }}>
            {avatar ? <img src={avatar} alt="" className="h-full w-full object-cover" /> : (name || "?")[0]?.toUpperCase()}
          </div>
          <div className="min-w-0 flex-1 pb-1.5 pt-5">
            <div className="truncate text-[0.92rem] font-bold leading-tight" style={{ color: "var(--text)" }}>{name}</div>
            <div className="truncate text-[0.64rem]" style={{ color: "var(--text-3)" }}>{user.email}</div>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[0.52rem] font-black tracking-widest"
            style={{ background: `${role.color}18`, color: role.color, border: `1px solid ${role.color}40` }}>
            <RIcon size={11} /> {role.label}
          </div>
          {lastSeen && !online && (
            <span className="text-[0.58rem]" style={{ color: "var(--text-3)" }}>
              Last: {lastSeen.toLocaleDateString("id-ID", { day: "2-digit", month: "short" })} {lastSeen.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
        </div>

        <div className="mt-3">
          <div className="mb-1.5 flex items-center gap-1.5 text-[0.62rem] font-bold uppercase tracking-wide" style={{ color: "var(--text-3)" }}>
            <Zap size={10} /> Fitur Aktif ({features.enabled.length}/{features.total})
          </div>
          <div className="flex flex-wrap gap-1">
            {shown.length === 0 && <span className="text-[0.62rem]" style={{ color: "var(--text-3)" }}>Tidak ada fitur aktif</span>}
            {shown.map((f) => (
              <span key={f} className="rounded-md px-1.5 py-0.5 text-[0.55rem] font-semibold"
                style={{ background: "rgba(16,185,129,0.12)", color: "var(--green)", border: "1px solid rgba(16,185,129,0.25)" }}>
                {FEATURE_LABELS[f] || f}
              </span>
            ))}
            {features.enabled.length > 6 && (
              <button onClick={() => setShowAll((v) => !v)}
                className="rounded-md px-1.5 py-0.5 text-[0.55rem] font-bold transition-colors hover:bg-[var(--hover)]"
                style={{ background: "var(--glass)", color: "var(--acc)", border: "1px solid var(--border)" }}>
                {showAll ? "Sembunyikan" : `+${features.enabled.length - 6}`}
              </button>
            )}
          </div>
        </div>

        {canEdit && (
          <button onClick={onEdit}
            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border py-2 text-[0.72rem] font-bold transition-colors hover:bg-[var(--hover)]"
            style={{ borderColor: "rgba(var(--acc-rgb),0.35)", color: "var(--acc)" }}>
            <Pencil size={12} /> Ubah Role
          </button>
        )}
      </div>
    </motion.div>
  );
}