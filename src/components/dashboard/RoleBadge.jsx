import React from "react";
import { ROLES } from "@/lib/permissions";

/**
 * Reusable role badge — shows the rank logo image + role label.
 * Works for ANY user (pass roleKey) or the current user (omit roleKey).
 *
 * props:
 *  - roleKey: "super_master" | "master" | "member" (falls back to current user)
 *  - size: "xs" | "sm" | "md" | "lg"
 *  - showLogo: boolean (default true)
 *  - showLabel: boolean (default true)
 *  - variant: "solid" | "outline" (default "outline")
 */
export default function RoleBadge({ roleKey, size = "sm", showLogo = true, showLabel = true, variant = "outline", className, style }) {
  const role = ROLES[roleKey];
  if (!role) return null;

  const sizes = {
    xs: { logo: 10, pad: "px-1.5 py-0.5", font: "0.46rem", gap: 0.75 },
    sm: { logo: 12, pad: "px-2 py-0.5", font: "0.5rem", gap: 1 },
    md: { logo: 14, pad: "px-2.5 py-1", font: "0.55rem", gap: 1.25 },
    lg: { logo: 18, pad: "px-3 py-1.5", font: "0.62rem", gap: 1.5 },
  };
  const s = sizes[size] || sizes.sm;

  const isSolid = variant === "solid";

  return (
    <span
      className={`inline-flex items-center rounded-full ${s.pad} font-bold ${className || ""}`}
      style={{
        color: isSolid ? "#000" : role.color,
        background: isSolid ? role.logo ? `${role.color}25` : role.color : `${role.color}1a`,
        border: `1px solid ${role.color}40`,
        gap: s.gap,
        letterSpacing: "0.04em",
        ...style,
      }}
    >
      {showLogo && (
        <img
          src={role.logo}
          alt={role.label}
          className="object-contain"
          style={{ width: s.logo, height: s.logo, filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.35))" }}
        />
      )}
      {showLabel && <span style={{ fontSize: s.font }}>{role.label}</span>}
    </span>
  );
}