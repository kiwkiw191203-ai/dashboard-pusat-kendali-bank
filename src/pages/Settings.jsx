import React, { useState } from "react";
import { ShieldCheck, PawPrint, Hash } from "lucide-react";
import PageHead from "@/components/dashboard/PageHead";
import { useRole } from "@/lib/permissions";
import { useMyPermissions } from "@/lib/featurePermissionStore";
import Security from "@/pages/Security";
import ShioEditor from "@/components/togel/ShioEditor";
import TogelConfigEditor from "@/components/togel/TogelConfigEditor";

const TABS = [
  { key: "shio", label: "Tabel Shio", icon: PawPrint, color: "var(--acc)", superOnly: true },
  { key: "togel_config", label: "Hadiah & Diskon Togel", icon: Hash, color: "var(--rose)", superOnly: true },
  { key: "security", label: "Security", icon: ShieldCheck, color: "var(--coral)", superOnly: true },
];

export default function Settings() {
  const role = useRole();
  const isSuper = role.key === "super_master";
  const { perms: myPerms } = useMyPermissions();
  const [active, setActive] = useState("shio");

  const visibleTabs = TABS.filter((t) => {
    if (t.superOnly && !isSuper) return false;
    if (!isSuper && myPerms[t.key] === false) return false;
    return true;
  });

  const safeActive = visibleTabs.some((t) => t.key === active) ? active : (visibleTabs[0]?.key || "shio");

  return (
    <div className="w-full p-4 md:p-6">
      <PageHead icon="fa-gear" color="var(--blue)" title="PENGATURAN" subtitle="Konfigurasi togel & keamanan" />

      {/* Tab Bar */}
      <div className="mb-5 flex flex-wrap gap-2">
        {visibleTabs.map((t) => {
          const isActive = safeActive === t.key;
          const TIcon = t.icon;
          return (
            <button key={t.key} onClick={() => setActive(t.key)}
              className="flex items-center gap-2 rounded-xl border px-4 py-2.5 text-[0.74rem] font-bold transition-colors"
              style={isActive
                ? { background: `${t.color}18`, color: t.color, borderColor: `${t.color}55` }
                : { background: "var(--card)", borderColor: "var(--border)", color: "var(--text-3)" }}>
              <TIcon size={14} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content — direct render, no exit animation gap */}
      <div key={safeActive} className="ds-in">
        {safeActive === "shio" && isSuper && <ShioEditor />}
        {safeActive === "togel_config" && isSuper && <TogelConfigEditor />}
        {safeActive === "security" && isSuper && <Security />}
      </div>
    </div>
  );
}