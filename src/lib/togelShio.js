// Shio table + shio detection + per-pasaran color helpers for the Result Togel page.

export const shioOrder = [
  "Kuda", "Ular", "Naga", "Kelinci", "Harimau", "Kerbau",
  "Tikus", "Babi", "Anjing", "Ayam", "Monyet", "Kambing",
];

export const shioData = [
  { name: "Kuda", nums: "01, 13, 25, 37, 49, 61, 73, 85, 97" },
  { name: "Ular", nums: "02, 14, 26, 38, 50, 62, 74, 86, 98" },
  { name: "Naga", nums: "03, 15, 27, 39, 51, 63, 75, 87, 99" },
  { name: "Kelinci", nums: "04, 16, 28, 40, 52, 64, 76, 88, 00" },
  { name: "Harimau", nums: "05, 17, 29, 41, 53, 65, 77, 89" },
  { name: "Kerbau", nums: "06, 18, 30, 42, 54, 66, 78, 90" },
  { name: "Tikus", nums: "07, 19, 31, 43, 55, 67, 79, 91" },
  { name: "Babi", nums: "08, 20, 32, 44, 56, 68, 80, 92" },
  { name: "Anjing", nums: "09, 21, 33, 45, 57, 69, 81, 93" },
  { name: "Ayam", nums: "10, 22, 34, 46, 58, 70, 82, 94" },
  { name: "Monyet", nums: "11, 23, 35, 47, 59, 71, 83, 95" },
  { name: "Kambing", nums: "12, 24, 36, 48, 60, 72, 84, 96" },
];

export function getShio(number) {
  if (!number || number.length < 2) return "-";
  let last2 = parseInt(number.slice(-2), 10);
  if (Number.isNaN(last2)) return "-";
  if (last2 === 0) last2 = 100;
  const idx = (last2 - 1) % 12;
  return shioOrder[idx];
}

// Distinct color palette — each pasaran name is hashed to a stable color.
const PALETTE = [
  "#F7C843", "#3B82F6", "#10B981", "#F43F5E", "#8B5CF6", "#06B6D4",
  "#EF4444", "#EC4899", "#14B8A6", "#F59E0B", "#6366F1", "#84CC16",
];

export function getPasaranColor(name) {
  if (!name) return PALETTE[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) % 997;
  return PALETTE[hash % PALETTE.length];
}