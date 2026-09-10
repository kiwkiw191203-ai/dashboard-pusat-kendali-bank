// GitHub Gist configs for the Cyber Elite Suite scripts.
// Data live (filename, size, updated_at, owner) di-fetch dari GitHub Gist API.

export const gistOwner = "rizkysmb888-pixel";

export const GIST_SCRIPTS = [
  {
    key: "highlighter",
    id: "079134ed2f368f261c272e9df025c7af",
    icon: "palette",
    title: "Highlighter Pro",
    desc: "Dashboard premium dengan deteksi keyword otomatis & template auto-response yang super cerdas. Warna menyala untuk deteksi cepat.",
    features: [
      { icon: "star", label: "Auto Keyword" },
      { icon: "heart", label: "Smart Response" },
      { icon: "bolt", label: "Real-time" },
    ],
    file: "ChatHighlighter.user.js",
  },
  {
    key: "duplicate",
    id: "75de11185dc9cfc4417903e0fb1488a5",
    icon: "shield",
    title: "Duplicate Checker",
    desc: "Proteksi spam tingkat elit! Deteksi pesan duplikat secara otomatis dengan penanda merah yang tajam dan tidak terhindarkan.",
    features: [
      { icon: "ban", label: "Anti-Spam" },
      { icon: "flag", label: "Color Marker" },
      { icon: "rocket", label: "Cepat" },
    ],
    file: "LiveChatDuplicate.user.js",
  },
  {
    key: "minimal",
    id: "34205027946c4634e81e72394fa18250",
    icon: "clock",
    title: "UI & SLA Tracker",
    desc: "Monitoring performa tim visual: indikator neon, notifikasi SLA, dan tracker aktivitas yang tajam dan berwibawa.",
    features: [
      { icon: "gem", label: "Neon Metrics" },
      { icon: "bell", label: "SLA Notif" },
      { icon: "rotate", label: "Auto Tracker" },
    ],
    file: "LiveChatMinimal.user.js",
  },
];

export async function fetchGist(id) {
  if (!id) return null;
  const res = await fetch(`https://api.github.com/gists/${id}`, {
    headers: { Accept: "application/vnd.github+json" },
  });
  if (!res.ok) throw new Error(`Gist ${id} fetch failed (${res.status})`);
  return res.json();
}

// Fallback raw URL bila API terkena rate-limit — selalu mengarah ke revisi terbaru.
export function gistRawUrl(scriptKey) {
  const s = GIST_SCRIPTS.find((x) => x.key === scriptKey);
  if (!s) return "";
  return `https://gist.github.com/${gistOwner}/${s.id}/raw/${s.file}`;
}

export function gistPageUrl(scriptKey) {
  const s = GIST_SCRIPTS.find((x) => x.key === scriptKey);
  if (!s) return "";
  return `https://gist.github.com/${gistOwner}/${s.id}`;
}