import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MapPin, Globe, Clock, Mail, Crown, UserCog, User as UserIcon, Monitor, Smartphone, Fingerprint } from "lucide-react";
import { ROLES } from "@/lib/permissions";
import { parseUA } from "@/lib/userAgent";
import { formatDuration } from "@/components/dashboard/utils";

const ROLE_ICON = { super_master: Crown, master: UserCog, member: UserIcon };

function Row({ icon: Icon, label, value, color }) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl border px-3 py-2" style={{ background: "var(--glass)", borderColor: "var(--border)" }}>
      <Icon size={14} style={{ color: color || "var(--text-3)" }} className="flex-shrink-0" />
      <div className="min-w-0">
        <div className="text-[0.58rem] uppercase tracking-wide" style={{ color: "var(--text-3)" }}>{label}</div>
        <div className="truncate text-[0.76rem] font-medium" style={{ color: "var(--text)" }}>{value || "—"}</div>
      </div>
    </div>
  );
}

export default function UserProfileModal({ user, open, onOpenChange }) {
  if (!user) return null;
  const role = ROLES[user.role] || ROLES.member;
  const RIcon = ROLE_ICON[user.role] || UserIcon;
  const ua = parseUA(user.user_agent);
  const loc = [user.city, user.country].filter(Boolean).join(", ") || "—";
  const dur = user.login_at ? formatDuration(Date.now() - new Date(user.login_at).getTime()) : "—";
  const isMobile = /mobile|iphone|android/i.test(user.user_agent || "");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-2xl border p-0" style={{ background: "var(--card-solid)", borderColor: "var(--border)" }}>
        <DialogHeader className="p-0">
          <DialogTitle className="sr-only">Profil Pengguna</DialogTitle>
        </DialogHeader>

        {/* Header */}
        <div className="relative h-20" style={{ background: "linear-gradient(120deg, var(--bg-2), rgba(var(--acc-rgb),0.22))" }}>
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 40%, var(--card-solid) 100%)" }} />
        </div>
        <div className="-mt-10 flex items-end gap-3 px-5">
          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl text-xl font-bold text-black" style={{ background: "var(--acc-grad)", boxShadow: "0 0 0 3px var(--card-solid)" }}>
            {user.avatar_url ? <img src={user.avatar_url} alt="" className="h-full w-full object-cover" /> : (user.name || user.email)[0]?.toUpperCase()}
          </div>
          <div className="min-w-0 flex-1 pb-1">
            <div className="flex items-center gap-1.5">
              <span className="truncate text-[0.92rem] font-bold" style={{ color: "var(--text)" }}>{user.name || user.email}</span>
            </div>
            <div className="mt-0.5 flex items-center gap-1.5">
              <span className="flex items-center gap-1 rounded-md px-2 py-0.5 text-[0.58rem] font-bold" style={{ color: role.color, background: `${role.color}1a` }}>
                <RIcon size={10} /> {role.label}
              </span>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="space-y-2 p-5">
          <Row icon={Mail} label="Email" value={user.email} color="var(--blue)" />
          <div className="grid grid-cols-2 gap-2">
            <Row icon={Globe} label="IP Address" value={user.ip} color="var(--cyan)" />
            <Row icon={MapPin} label="Lokasi" value={loc} color="var(--rose)" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Row icon={isMobile ? Smartphone : Monitor} label="Perangkat" value={`${ua.device} · ${ua.os}`} color="var(--violet)" />
            <Row icon={Fingerprint} label="Browser" value={ua.browser} color="var(--teal)" />
          </div>
          <Row icon={Clock} label="Sesi Aktif" value={dur} color="var(--green)" />
        </div>
      </DialogContent>
    </Dialog>
  );
}