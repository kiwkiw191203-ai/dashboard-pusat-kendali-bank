// Client-side auth gate for the CS dashboard (email-only login) + profile store.
const KEY = "cs-auth";
const PKEY = "cs-profiles";

// Optional whitelist. If empty, any valid email may log in.
const USERS = [
  { email: "admin@cspro.com", name: "Admin CS" },
  { email: "rpm@cspro.com", name: "Rizky P. Manurung" },
];

function readProfiles() {
  try { return JSON.parse(localStorage.getItem(PKEY) || "{}"); } catch { return {}; }
}

export function getProfileFor(email) {
  return readProfiles()[String(email).toLowerCase()] || null;
}

export function saveProfile(email, data) {
  const e = String(email).toLowerCase();
  const p = readProfiles();
  p[e] = { ...(p[e] || {}), ...data };
  localStorage.setItem(PKEY, JSON.stringify(p));
}

function deriveName(email) {
  return email.split("@")[0].replace(/[._-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function login(email) {
  const e = String(email).trim().toLowerCase();
  if (!e || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return false;
  const whitelisted = USERS.find((x) => x.email.toLowerCase() === e);
  const profile = getProfileFor(e);
  const name = profile?.name || whitelisted?.name || deriveName(e);
  const avatar_url = profile?.avatar_url || "";
  const cover_url = profile?.cover_url || "";
  localStorage.setItem(KEY, JSON.stringify({ email: e, name, avatar_url, cover_url, at: Date.now() }));
  return true;
}

// Sets the session from a Google-verified identity (email guaranteed real by OAuth).
export function loginVerified({ email, name, avatar_url }) {
  const e = String(email || "").trim().toLowerCase();
  if (!e) return false;
  const profile = getProfileFor(e);
  localStorage.setItem(
    KEY,
    JSON.stringify({
      email: e,
      name: profile?.name || name || deriveName(e),
      avatar_url: profile?.avatar_url || avatar_url || "",
      cover_url: profile?.cover_url || "",
      at: Date.now(),
    })
  );
  return true;
}

export function logout() {
  localStorage.removeItem(KEY);
}

export function getSession() {
  try { return JSON.parse(localStorage.getItem(KEY) || "null"); } catch { return null; }
}

export function isAuthed() {
  return !!getSession();
}

export function updateProfile({ name, avatar_url, cover_url }) {
  const s = getSession();
  if (!s) return null;
  const next = { ...s, name: name ?? s.name, avatar_url: avatar_url ?? s.avatar_url, cover_url: cover_url ?? s.cover_url };
  localStorage.setItem(KEY, JSON.stringify(next));
  saveProfile(s.email, { name: next.name, avatar_url: next.avatar_url, cover_url: next.cover_url });
  return next;
}