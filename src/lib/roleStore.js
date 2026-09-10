// Reactive role store — database (User entity) is source of truth, cached client-side.
import { useEffect, useState } from "react";
import { getSession } from "@/lib/dashboardAuth";
import { base44 } from "@/api/base44Client";

const LOGO_SUPER = "https://i.ibb.co/Y4zrZ6k0/rank-56.png";
const LOGO_STD = "https://i.ibb.co/YGdSQtk/rank-55.png";

export const ROLES = {
  super_master: { key: "super_master", label: "SUPER MASTER", level: 4, color: "var(--acc)", icon: "fa-crown", logo: LOGO_SUPER },
  kapten: { key: "kapten", label: "KAPTEN", level: 3, color: "var(--gold)", icon: "fa-anchor", logo: LOGO_STD },
  kasir: { key: "kasir", label: "KASIR", level: 2, color: "var(--green)", icon: "fa-cash-register", logo: LOGO_STD },
  cs: { key: "cs", label: "CS", level: 1, color: "var(--blue)", icon: "fa-headset", logo: LOGO_STD },
};

export const DEFAULT_ROLE = "cs";

// Role lama (master / member) dipetakan ke role baru.
const LEGACY_ROLES = { master: "cs", member: "cs" };
export function normalizeRole(key) {
  if (!key) return DEFAULT_ROLE;
  if (ROLES[key]) return key;
  return LEGACY_ROLES[key] || DEFAULT_ROLE;
}

const SUPER_EMAILS = ["admin@cspro.com", "rpm@cspro.com", "rizkykucuk19@gmail.com"];
const PKEY = "cs-profiles";

function readProfiles() { try { return JSON.parse(localStorage.getItem(PKEY) || "{}"); } catch { return {}; } }
function writeProfiles(p) { localStorage.setItem(PKEY, JSON.stringify(p)); }

function computeRole(session = getSession()) {
  if (!session?.email) return ROLES[DEFAULT_ROLE];
  const e = session.email.toLowerCase();
  const prof = readProfiles()[e] || {};
  if (prof.role) return ROLES[normalizeRole(prof.role)];
  if (SUPER_EMAILS.includes(e)) return ROLES.super_master;
  return ROLES[DEFAULT_ROLE];
}

let current = computeRole();
const subs = new Set();
const notify = () => subs.forEach((cb) => cb(current));

// Sync getter — returns the current cached role (DB-synced on app load).
export function getRole() { return current; }

// Persist a role for an email into the local cache + notify subscribers if it's the current user.
export function setLocalRole(email, roleKey) {
  const key = normalizeRole(roleKey);
  const e = String(email).toLowerCase();
  const p = readProfiles();
  p[e] = { ...(p[e] || {}), role: key };
  writeProfiles(p);
  const s = getSession();
  if (s && s.email.toLowerCase() === e) { current = ROLES[key]; notify(); }
}

// Pull the current user's role from the database (works for any logged-in user via auth.me).
// If the user has no role set yet (first time login), default to "cs".
export async function refreshRole() {
  const s = getSession();
  if (!s?.email) return current;
  try {
    const me = await base44.auth.me();
    if (me?.role && ROLES[me.role]) {
      setLocalRole(s.email, me.role);
    } else {
      const mapped = normalizeRole(me?.role);
      await base44.auth.updateMe({ role: mapped });
      setLocalRole(s.email, mapped);
    }
  } catch { /* keep cached role */ }
  return current;
}

export function subscribeRole(cb) { subs.add(cb); return () => subs.delete(cb); }

// React hook — re-renders the component when the current user's role changes.
export function useRole() {
  const [r, setR] = useState(current);
  useEffect(() => subscribeRole(setR), []);
  return r;
}