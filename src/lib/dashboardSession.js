// Realtime session + activity tracking backed by Base44 entities.
import { base44 } from "@/api/base44Client";
import { getRole } from "@/lib/roleStore";

const SID = "cs-session-id";
const ONLINE_TTL = 60_000; // a session is "online" while its last heartbeat is younger than this

export function getCurrentSessionId() {
  return localStorage.getItem(SID);
}

export async function fetchGeo() {
  try {
    const r = await fetch("https://ipapi.co/json/");
    if (!r.ok) throw new Error("geo");
    const d = await r.json();
    return {
      ip: d.ip || "—",
      city: d.city || "",
      region: d.region || "",
      country: d.country_name || "",
    };
  } catch {
    return { ip: "—", city: "", region: "", country: "" };
  }
}

export async function startSession({ email, name, avatar_url, cover_url, role }) {
  const geo = await fetchGeo();
  const now = new Date().toISOString();
  let rec = null;
  try {
    rec = await base44.entities.OnlineSession.create({
      email,
      name: name || "",
      avatar_url: avatar_url || "",
      cover_url: cover_url || "",
      role: role || getRole().key,
      ip: geo.ip,
      city: geo.city,
      region: geo.region,
      country: geo.country,
      user_agent: navigator.userAgent,
      login_at: now,
      last_seen: now,
    });
    localStorage.setItem(SID, rec.id);
    const loc = [geo.city, geo.country].filter(Boolean).join(", ");
    await base44.entities.ActivityLog.create({ email, name: name || "", action: "login", detail: loc, ip: geo.ip, user_agent: navigator.userAgent });
  } catch {
    /* tracking is best-effort; never block login */
  }
  return rec;
}

export async function heartbeat() {
  const id = getCurrentSessionId();
  if (!id) return;
  try {
    const role = getRole();
    await base44.entities.OnlineSession.update(id, { last_seen: new Date().toISOString(), role: role.key });
  } catch {
    /* ignore */
  }
}

export async function endSession() {
  const id = getCurrentSessionId();
  localStorage.removeItem(SID);
  if (!id) return;
  try {
    const rec = await base44.entities.OnlineSession.get(id).catch(() => null);
    await base44.entities.OnlineSession.delete(id).catch(() => {});
    if (rec) {
      await base44.entities.ActivityLog.create({ email: rec.email, name: rec.name || "", action: "logout", ip: rec.ip || "", user_agent: rec.user_agent || navigator.userAgent });
      await base44.entities.LiveEvent.create({
        actor_name: rec.name || rec.email,
        actor_email: rec.email,
        actor_role: rec.role || "member",
        event_type: "logout",
        message: `${(rec.name || rec.email).toUpperCase()} TELAH LOGOUT`,
        accent_color: "var(--coral)",
      }).catch(() => {});
    }
  } catch {
    /* ignore */
  }
}

export async function getMySession() {
  const id = getCurrentSessionId();
  if (!id) return null;
  return base44.entities.OnlineSession.get(id).catch(() => null);
}

export async function updateMyProfile({ name, avatar_url, cover_url }, email) {
  const id = getCurrentSessionId();
  if (id) {
    try {
      await base44.entities.OnlineSession.update(id, { name, avatar_url, cover_url });
    } catch {
      /* ignore */
    }
  }
  try {
    const rec = await getMySession();
    await base44.entities.ActivityLog.create({ email, name, action: "update_profile", ip: rec?.ip || "", user_agent: navigator.userAgent });
    await base44.entities.LiveEvent.create({
      actor_name: name || email,
      actor_email: email,
      actor_role: rec?.role || getRole().key,
      event_type: "profile_update",
      message: `${(name || email).toUpperCase()} MENGUBAH PROFIL`,
      accent_color: "var(--blue)",
    }).catch(() => {});
  } catch {
    /* ignore */
  }
}

export async function listOnline() {
  try {
    const all = await base44.entities.OnlineSession.list("-last_seen", 200);
    const now = Date.now();
    return all.filter((s) => s.last_seen && now - new Date(s.last_seen).getTime() < ONLINE_TTL);
  } catch {
    return [];
  }
}

export async function getOnlineCount() {
  return (await listOnline()).length;
}

export function subscribeOnline(cb) {
  try {
    return base44.entities.OnlineSession.subscribe(() => cb());
  } catch {
    return () => {};
  }
}

export async function listActivity(limit = 60) {
  try {
    return await base44.entities.ActivityLog.list("-created_date", limit);
  } catch {
    return [];
  }
}

export async function listMyActivity(email, limit = 60) {
  try {
    return await base44.entities.ActivityLog.filter({ email }, "-created_date", limit);
  } catch {
    return [];
  }
}

export function subscribeActivity(cb) {
  try {
    return base44.entities.ActivityLog.subscribe(() => cb());
  } catch {
    return () => {};
  }
}