import React from "react";
import { Expand, Check } from "lucide-react";

export default function ScreenshotCard({ shot, onOpen, showOwner, selectMode, selected, onToggleSelect }) {
  const time = new Date(shot.captured_at || shot.created_date).toLocaleString("id-ID", {
    day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
  const handleClick = () => (selectMode ? onToggleSelect(shot.id) : onOpen(shot));

  return (
    <button onClick={handleClick} className="group relative overflow-hidden rounded-xl border text-left transition-transform hover:-translate-y-0.5" style={{ background: "var(--card-solid)", borderColor: selected ? "var(--acc)" : "var(--border)" }}>
      <div className="relative aspect-video overflow-hidden" style={{ background: "#000" }}>
        <img src={shot.image_url} alt="" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
        {!selectMode && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100" style={{ background: "rgba(0,0,0,0.45)" }}>
            <Expand size={18} className="text-white" />
          </div>
        )}
        {selectMode && (
          <div className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-md border-2" style={{ borderColor: selected ? "var(--acc)" : "rgba(255,255,255,0.5)", background: selected ? "var(--acc)" : "rgba(0,0,0,0.4)" }}>
            {selected && <Check size={13} className="text-black" />}
          </div>
        )}
        {showOwner && (
          <span className="absolute left-1.5 top-1.5 truncate rounded-md px-1.5 py-0.5 text-[0.55rem] font-bold" style={{ background: "rgba(0,0,0,0.6)", color: "var(--acc)", maxWidth: "70%" }}>
            {shot.creator_name || shot.creator_email}
          </span>
        )}
      </div>
      <div className="p-2">
        <div className="truncate text-[0.62rem] font-medium" style={{ color: "var(--text-2)" }}>{time}</div>
      </div>
    </button>
  );
}