// Shift kerja untuk crosscheck HP office.
export const PHONE_SHIFTS = [
  { key: "pagi", label: "Shift Pagi", short: "PAGI", color: "var(--gold)" },
  { key: "malam", label: "Shift Malam", short: "MALAM", color: "var(--purple)" },
];

export const SHIFT_MAP = PHONE_SHIFTS.reduce((a, s) => { a[s.key] = s; return a; }, {});

export function todayKey(d = new Date()) {
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

// Shift default berdasarkan jam: 06:00–17:59 = pagi, sisanya malam.
export function currentShift(d = new Date()) {
  const h = d.getHours();
  return h >= 6 && h < 18 ? "pagi" : "malam";
}

// Apakah device sudah dicentang untuk tanggal + shift tertentu.
export function isChecked(device, date, shift) {
  if (!device) return false;
  if (device.check_date !== date) return false;
  return (device.check_shifts || []).includes(shift);
}

export function fmtDateID(date) {
  if (!date) return "—";
  return new Date(`${date}T00:00:00`).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}