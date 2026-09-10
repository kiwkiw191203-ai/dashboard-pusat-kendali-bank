import React from "react";
import { ROLES } from "@/lib/permissions";

// Role toggle — click to set; active segment fills with the role's color.
const ORDER = ["cs", "kasir", "kapten", "super_master"];

export default function RoleToggle({ value, onChange, disabled }) {
  return (
    <div className="flex gap-1 rounded-xl border p-1" style={{ borderColor: "var(--border)", background: "var(--glass)" }}>
      {ORDER.map((k) => {
        const active = value === k;
        const r = ROLES[k];
        return (
          <button key={k} type="button" onClick={() => onChange(k)} disabled={disabled}
            className="flex-1 rounded-lg px-2 py-1.5 text-[0.58rem] font-bold uppercase tracking-wide transition-all disabled:opacity-50"
            style={active ? { background: r.color, color: "#000" } : { color: "var(--text-3)" }}>
            {r.label.split(" ")[0]}
          </button>
        );
      })}
    </div>
  );
}