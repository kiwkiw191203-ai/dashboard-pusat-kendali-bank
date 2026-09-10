import React from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { useMyPermissions } from "@/lib/featurePermissionStore";
import { useRole } from "@/lib/permissions";

// Maps each route → its feature key in FeaturePermission.
const ROUTE_FEATURE = {
  "/": "overview",
  "/dashboard": "dashboard",
  "/hlxpro": "ai",
  "/notes": "notes",
  "/files": "files",
  "/predict": "predict",
  "/analyzer": "analyzer",
  "/shortcut": "shortcut",
  "/ticket": "ticket",
  "/win": "win",
  "/bank": "bank",
  "/rrn": "rrn",
  "/result-togel": "result_togel",
  "/code-filter": "code_filter",
  "/auto-screenshot": "auto_screenshot",
  "/chat": "chat",
  "/online": "online",
  "/activity": "activity",
  "/roles": "roles",
  "/permissions": "permissions",
  "/feature-builder": "feature_builder",
  "/security": "security",
  "/settings": "settings",
};

export default function FeatureGuard({ children }) {
  const location = useLocation();
  const { perms, loaded } = useMyPermissions();
  const role = useRole();
  const isSuperMaster = role.key === "super_master";

  const feature = ROUTE_FEATURE[location.pathname];

  // No feature mapping for this route → allow.
  if (!feature) return children;
  // Super Master always has full access.
  if (isSuperMaster) return children;
  // Still loading permissions → show nothing (prevents content flash).
  if (!loaded) return null;
  // Feature is enabled (or no record exists) → allow.
  if (perms[feature] !== false) return children;

  // Feature is disabled → show access denied.
  return (
    <div className="mx-auto flex max-w-[600px] flex-col items-center justify-center px-6 py-20 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center">
        <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl"
          style={{ background: "rgba(255,93,115,0.1)", border: "1px solid rgba(255,93,115,0.3)" }}>
          <Lock size={34} style={{ color: "var(--coral)" }} />
        </div>
        <h1 className="font-heading text-[1.2rem] font-bold" style={{ color: "var(--text)" }}>Fitur Dinonaktifkan</h1>
        <p className="mt-2 max-w-[320px] text-[0.82rem] leading-relaxed" style={{ color: "var(--text-3)" }}>
          Akses ke fitur ini telah dimatikan oleh administrator untuk akun Anda. Hubungi Super Master untuk mengaktifkan kembali.
        </p>
      </motion.div>
    </div>
  );
}