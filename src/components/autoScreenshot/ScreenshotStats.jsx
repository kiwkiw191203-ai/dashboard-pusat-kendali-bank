import React from "react";
import { Image as ImageIcon, Radio, Zap, Camera } from "lucide-react";

export default function ScreenshotStats({ total, sharing, autoMode, interval }) {
  const items = [
    { icon: ImageIcon, label: "Total Screenshot", value: total, color: "var(--blue)" },
    { icon: Radio, label: "Status Berbagi", value: sharing ? "Aktif" : "Nonaktif", color: sharing ? "var(--green)" : "var(--text-3)" },
    { icon: Zap, label: "Auto Mode", value: autoMode ? "Hidup" : "Mati", color: autoMode ? "var(--acc)" : "var(--text-3)" },
    { icon: Camera, label: "Interval", value: `${interval}s`, color: "var(--purple)" },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {items.map((it) => (
        <div key={it.label} className="flex items-center gap-3 rounded-2xl border p-4" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl" style={{ background: `${it.color}18`, color: it.color, border: `1px solid ${it.color}33` }}>
            <it.icon size={16} />
          </div>
          <div className="min-w-0">
            <div className="truncate text-[0.66rem]" style={{ color: "var(--text-3)" }}>{it.label}</div>
            <div className="truncate text-[0.95rem] font-bold" style={{ color: "var(--text)" }}>{it.value}</div>
          </div>
        </div>
      ))}
    </div>
  );
}