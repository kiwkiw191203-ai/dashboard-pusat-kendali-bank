import { useEffect, useState } from "react";
import { toast } from "sonner";

export function useClock() {
  const [time, setTime] = useState(fmt());
  useEffect(() => {
    const id = setInterval(() => setTime(fmt()), 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}
function fmt() {
  const n = new Date();
  return [n.getHours(), n.getMinutes(), n.getSeconds()]
    .map((x) => String(x).padStart(2, "0"))
    .join(":");
}

export async function copyImage(url) {
  try {
    const r = await fetch(url, { mode: "cors", cache: "no-cache" });
    const bl = await r.blob();
    await navigator.clipboard.write([new window.ClipboardItem({ [bl.type]: bl })]);
    toast.success("Berhasil disalin!", { description: "Gambar ada di clipboard" });
  } catch {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link disalin", { description: "URL ada di clipboard" });
    } catch {
      toast.error("Gagal menyalin", { description: "Coba buka di tab baru" });
    }
  }
}

export async function copyText(text, label = "Berhasil disalin!") {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(label);
  } catch {
    toast.error("Gagal menyalin", { description: "Coba salin manual" });
  }
}

export function formatDuration(ms) {
  if (!ms || ms < 0) ms = 0;
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}j ${m}m`;
  if (m > 0) return `${m}m ${sec}d`;
  return `${sec}d`;
}

// Forces a re-render on an interval (for live clocks / durations).
export function useTick(interval = 1000) {
  const [, set] = useState(0);
  useEffect(() => {
    const id = setInterval(() => set((x) => x + 1), interval);
    return () => clearInterval(id);
  }, [interval]);
}