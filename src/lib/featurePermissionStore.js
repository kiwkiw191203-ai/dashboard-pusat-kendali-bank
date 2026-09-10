import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { getSession } from "@/lib/dashboardAuth";
import { getRole, subscribeRole } from "@/lib/permissions";
import { ROLE_DEFAULTS } from "@/lib/roleDefaults";

// Shared store — loaded once, shared across all components (Sidebar + FeatureGuard).
let permMap = {};
let loaded = false;
let builtForRole = null;
const listeners = new Set();

// Role diambil dari database secara async setelah app mount. Kalau peta izin
// dibangun sebelum role sinkron, halaman bisa terlihat kosong / "dinonaktifkan".
// Jadi setiap kali role berubah, peta izin dibangun ulang.
subscribeRole(() => { if (getRole()?.key !== builtForRole) loadMyPermissions(); });

function notify() { listeners.forEach((fn) => fn()); }

// Build the effective permission map:
// 1. Start with role defaults (MEMBER gets few, MASTER gets more, SUPER_MASTER gets all)
// 2. Override with explicit FeaturePermission records from DB
function buildEffectiveMap(explicitPerms) {
  const role = getRole();
  const roleKey = role?.key || "member";
  const effective = {};
  const allFeatures = ROLE_DEFAULTS.super_master;
  allFeatures.forEach((f) => { effective[f] = false; });

  // SUPER MASTER: full access to EVERYTHING — explicit overrides are ignored.
  if (roleKey === "super_master") {
    allFeatures.forEach((f) => { effective[f] = true; });
    return effective;
  }

  // Other roles: start from role defaults, then apply explicit overrides.
  const defaults = ROLE_DEFAULTS[roleKey] || [];
  defaults.forEach((f) => { effective[f] = true; });
  explicitPerms.forEach((p) => { if (effective[p.feature] !== undefined) effective[p.feature] = p.enabled; });

  return effective;
}

export async function loadMyPermissions() {
  const session = getSession();
  const email = session?.email;
  if (!email) { permMap = {}; loaded = true; notify(); return; }
  try {
    const all = await base44.entities.FeaturePermission.filter({ email }, "-created_date", 200);
    permMap = buildEffectiveMap(all);
  } catch { permMap = buildEffectiveMap([]); }
  builtForRole = getRole()?.key || null;
  loaded = true;
  notify();
}

export function isPermsLoaded() { return loaded; }

// Returns true if the feature is accessible for the current user.
// Uses role defaults as baseline, overridden by explicit FeaturePermission records.
export function hasFeatureAccess(feature) {
  if (getRole()?.key === "super_master") return true;
  return permMap[feature] !== false;
}

export function useMyPermissions() {
  const [, force] = useState(0);
  useEffect(() => {
    const fn = () => force((x) => x + 1);
    listeners.add(fn);
    if (!loaded) loadMyPermissions();
    let unsub;
    try { unsub = base44.entities.FeaturePermission.subscribe(loadMyPermissions); } catch { unsub = () => {}; }
    return () => { listeners.delete(fn); unsub?.(); };
  }, []);
  return { perms: permMap, loaded };
}