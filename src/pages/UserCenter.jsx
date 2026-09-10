import React, { useState } from "react";
import { Users as UsersIcon, UserCheck, UserCog, Activity } from "lucide-react";
import PageHead from "@/components/dashboard/PageHead";
import { useRole } from "@/lib/permissions";
import Roles from "@/pages/Roles";
import UserApprovals from "@/pages/UserApprovals";
import Permissions from "@/pages/Permissions";
import UserActivity from "@/pages/UserActivity";

const TABS = [
  { key: "list", label: "Daftar User & Role", icon: UsersIcon, color: "var(--acc-2)" },
  { key: "activity", label: "User Activity", icon: Activity, color: "var(--blue)" },
  { key: "approval", label: "Persetujuan Pengguna", icon: UserCheck, color: "var(--gold)" },
  { key: "access", label: "Hak Akses Fitur", icon: UserCog, color: "var(--teal)" },
];

export default function UserCenter() {
  const role = useRole();
  const isSuper = role.key === "super_master";
  const [active, setActive] = useState("list");

  const visible = isSuper ? TABS : TABS.filter((t) => t.key === "list" || t.key === "activity");
  const safe = visible.some((t) => t.key === active) ? active : visible[0].key;

  return (
    <div className="w-full p-4 md:p-6">
      <PageHead icon="fa-users-gear" color="var(--acc-2)" title="PENGGUNA & AKSES"
        subtitle="Satu pusat untuk daftar user, role, persetujuan, dan hak akses fitur" />

      <div className="mb-5 flex flex-wrap gap-2">
        {visible.map((t) => {
          const isActive = safe === t.key;
          const TIcon = t.icon;
          return (
            <button key={t.key} onClick={() => setActive(t.key)}
              className="flex items-center gap-2 rounded-xl border px-4 py-2.5 text-[0.74rem] font-semibold transition-colors"
              style={isActive
                ? { background: `${t.color}18`, color: t.color, borderColor: `${t.color}55` }
                : { background: "var(--card)", borderColor: "var(--border)", color: "var(--text-3)" }}>
              <TIcon size={14} />
              {t.label}
            </button>
          );
        })}
      </div>

      <div key={safe} className="ds-in">
        {safe === "list" && <Roles />}
        {safe === "activity" && <UserActivity />}
        {safe === "approval" && isSuper && <UserApprovals />}
        {safe === "access" && isSuper && <Permissions />}
      </div>
    </div>
  );
}