// Default feature templates per role.
// SUPER MASTER = semua fitur. KAPTEN & KASIR = Dashboard + Cek HP Office. CS = kerja chat.

export const ALL_FEATURES = [
  "overview", "dashboard", "ai", "notes",
  "permissions", "roles", "profile", "online", "activity",
  "predict", "analyzer", "shortcut", "rrn",
  "ticket", "win", "bank",
  "chat", "files", "chat_archive",
  "result_togel", "validasi", "code_filter",
  "bet_calc", "parlay_calc", "togel_calc",
  "kpbi_live", "kpbi_cek",
  "transaction_log", "cek_hp",
  "settings", "feature_builder", "auto_screenshot",
  "extension_suite", "security",
];

// CS (level 1) — fitur kerja chat / member
export const CS_DEFAULTS = [
  "overview", "dashboard", "ai", "notes", "profile",
  "predict", "analyzer", "shortcut", "rrn",
  "ticket", "win", "bank",
  "chat", "files", "chat_archive", "result_togel", "validasi", "code_filter",
  "bet_calc", "parlay_calc", "togel_calc", "kpbi_live", "kpbi_cek",
  "online", "extension_suite",
];

// KASIR (level 2) — hanya Dashboard & Cek HP Office
export const KASIR_DEFAULTS = ["overview", "dashboard", "profile", "cek_hp"];

// KAPTEN (level 3) — hanya Dashboard & Cek HP Office
export const KAPTEN_DEFAULTS = ["overview", "dashboard", "profile", "cek_hp"];

// SUPER_MASTER (level 4) — everything
export const SUPER_MASTER_DEFAULTS = [...ALL_FEATURES];

export const ROLE_DEFAULTS = {
  cs: CS_DEFAULTS,
  kasir: KASIR_DEFAULTS,
  kapten: KAPTEN_DEFAULTS,
  super_master: SUPER_MASTER_DEFAULTS,
};

// Helper: returns true if a feature is enabled by default for a given role.
export function isFeatureInDefault(role, feature) {
  return ROLE_DEFAULTS[role]?.includes(feature) ?? false;
}