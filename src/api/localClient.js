// ---------------------------------------------------------------------------
// Local mode: backend Base44 asli sudah tidak ada (app dihapus), jadi semua
// panggilan SDK dialihkan ke penyimpanan lokal browser (localStorage).
// Entity CRUD tetap berfungsi (data tersimpan di perangkat pengguna), auth
// memakai sesi login email lokal, dan fitur yang butuh server (LLM, upload
// eksternal) gagal dengan ramah tanpa error JSON mentah.
// ---------------------------------------------------------------------------
const LS_PREFIX = "b44local_";
const AUTH_KEY = "cs-auth";

function readColl(name) {
  try { return JSON.parse(localStorage.getItem(LS_PREFIX + name) || "[]"); } catch { return []; }
}
function writeColl(name, rows) {
  try { localStorage.setItem(LS_PREFIX + name, JSON.stringify(rows)); } catch { /* storage penuh */ }
}

function uid() {
  return "loc_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

function nowIso() { return new Date().toISOString(); }

function matches(row, query) {
  if (!query || typeof query !== "object") return true;
  return Object.entries(query).every(([k, v]) => {
    if (v && typeof v === "object" && !Array.isArray(v)) {
      if ("$in" in v) return v["$in"].includes(row[k]);
      if ("$ne" in v) return row[k] !== v["$ne"];
      return true;
    }
    return row[k] === v;
  });
}

function sortRows(rows, sort) {
  if (!sort) return rows;
  const desc = sort.startsWith("-");
  const key = desc ? sort.slice(1) : sort;
  const val = (r) => {
    const v = r[key];
    if (v == null) return "";
    return isNaN(Number(v)) ? String(v) : Number(v);
  };
  return [...rows].sort((a, b) => {
    const va = val(a), vb = val(b);
    const cmp = va < vb ? -1 : va > vb ? 1 : 0;
    return desc ? -cmp : cmp;
  });
}

function getSessionEmail() {
  try {
    const s = JSON.parse(localStorage.getItem(AUTH_KEY) || "null");
    return (s && s.email) || null;
  } catch { return null; }
}

function readLocalFile(file) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result);
    fr.onerror = () => reject(new Error("Gagal membaca file"));
    fr.readAsDataURL(file);
  });
}

function makeEntity(name) {
  return {
    async list(sort, limit) {
      let rows = sortRows(readColl(name), sort);
      if (limit) rows = rows.slice(0, limit);
      return rows;
    },
    async filter(query, sort, limit) {
      let rows = sortRows(readColl(name).filter((r) => matches(r, query)), sort);
      if (limit) rows = rows.slice(0, limit);
      return rows;
    },
    async get(id) {
      const row = readColl(name).find((r) => r.id === id);
      if (!row) throw new Error("Data tidak ditemukan");
      return row;
    },
    async create(data) {
      const rows = readColl(name);
      const row = {
        id: uid(),
        created_date: nowIso(),
        updated_date: nowIso(),
        created_by: getSessionEmail(),
        ...data,
      };
      rows.unshift(row);
      writeColl(name, rows);
      return row;
    },
    async update(id, data) {
      const rows = readColl(name);
      const i = rows.findIndex((r) => r.id === id);
      if (i === -1) throw new Error("Data tidak ditemukan");
      rows[i] = { ...rows[i], ...data, updated_date: nowIso() };
      writeColl(name, rows);
      return rows[i];
    },
    async delete(id) {
      writeColl(name, readColl(name).filter((r) => r.id !== id));
      return { success: true };
    },
    async deleteMany(where) {
      const rows = readColl(name);
      const keep = rows.filter((r) => !matches(r, where));
      writeColl(name, keep);
      return { deleted: rows.length - keep.length };
    },
    subscribe() { return () => {}; },
  };
}

// ---------------------------------------------------------------------------
// Pengganti createClient(@base44/sdk) — API kompatibel, sepenuhnya lokal.
// ---------------------------------------------------------------------------
export function createClient() {
  const entitiesProxy = new Proxy(
    {},
    { get: (_t, name) => makeEntity(String(name)) }
  );

  return {
    appId: "local",
    entities: entitiesProxy,
    functions: {
      async invoke() {
        // Fitur server-side tidak tersedia di mode lokal; gagal senyap.
        return null;
      },
    },
    integrations: {
      Core: {
        async UploadFile({ file }) {
          const dataUrl = await readLocalFile(file);
          return { file_url: dataUrl };
        },
        async InvokeLLM() {
          throw new Error("Fitur AI tidak tersedia di mode lokal (tanpa server).");
        },
        async GenerateSpeech() {
          throw new Error("Fitur suara tidak tersedia di mode lokal (tanpa server).");
        },
      },
    },
    auth: {
      async isAuthenticated() {
        return !!getSessionEmail();
      },
      async me() {
        const email = getSessionEmail();
        if (!email) throw new Error("Belum login");
        return { email, full_name: email.split("@")[0], role: "cs" };
      },
      async updateMe() { return null; },
      async setToken() { return null; },
      async verifyOtp() { throw new Error("OTP tidak tersedia di mode lokal."); },
      async resendOtp() { throw new Error("OTP tidak tersedia di mode lokal."); },
      async register() { throw new Error("Registrasi tidak tersedia di mode lokal."); },
      async resetPasswordRequest() { throw new Error("Reset password tidak tersedia di mode lokal."); },
      async resetPassword() { throw new Error("Reset password tidak tersedia di mode lokal."); },
      async loginWithProvider() {
        throw new Error("Login Google tidak tersedia — gunakan login email.");
      },
      redirectToLogin() { window.location.href = import.meta.env.BASE_URL + "login"; },
      logout() { localStorage.removeItem(AUTH_KEY); window.location.href = import.meta.env.BASE_URL + "login"; },
    },
  };
}
