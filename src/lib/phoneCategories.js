// Kategori HP di office — dipakai halaman Cek HP.
export const PHONE_CATEGORIES = [
  { key: "wd", label: "HP WD Bersih & Kotor", short: "WD", color: "var(--blue)" },
  { key: "depo", label: "HP Depo", short: "DEPO", color: "var(--green)" },
  { key: "off", label: "HP Office Di-Offkan", short: "OFFKAN", color: "var(--gold)" },
  { key: "kas", label: "HP Bank Kas", short: "BANK KAS", color: "var(--purple)" },
  { key: "token", label: "Token & IM-Token", short: "TOKEN", color: "var(--cyan)" },
  { key: "returned", label: "Dikembalikan ke ADM / Cabut Kas", short: "DIKEMBALIKAN", color: "var(--coral)" },
];

export const CATEGORY_MAP = PHONE_CATEGORIES.reduce((a, c) => { a[c.key] = c; return a; }, {});