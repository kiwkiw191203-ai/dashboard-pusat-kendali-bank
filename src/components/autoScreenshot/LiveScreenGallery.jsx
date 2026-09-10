import React, { useEffect, useState } from "react";
import { Radio, X } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function LiveScreenGallery() {
  const [sessions, setSessions] = useState([]);
  const [active, setActive] = useState(null);

  const load = async () => {
    try {
      const data = await base44.entities.LiveScreenSession.filter({ is_live: true }, "-updated_date", 50);
      setSessions(data);
    } catch { setSessions([]); }
  };

  useEffect(() => {
    load();
    let u;
    try { u = base44.entities.LiveScreenSession.subscribe(load); } catch { u = () => {}; }
    return () => u();
  }, []);

  if (!sessions.length) return null;

  return (
    <div className="ds-in mb-4 rounded-2xl border p-5" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
      <div className="mb-3 flex items-center gap-2">
        <Radio size={15} className="animate-pulse" style={{ color: "var(--coral)" }} />
        <h3 className="text-[0.9rem] font-bold" style={{ color: "var(--text)" }}>Live View ({sessions.length})</h3>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {sessions.map((s) => (
          <button key={s.id} onClick={() => setActive(s)}
            className="group relative overflow-hidden rounded-xl border text-left transition-transform hover:-translate-y-0.5"
            style={{ background: "var(--card-solid)", borderColor: "var(--border)" }}>
            <div className="relative aspect-video overflow-hidden" style={{ background: "#000" }}>
              {s.frame_url && <img src={s.frame_url} alt="" className="h-full w-full object-cover" />}
              <span className="absolute left-1.5 top-1.5 flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[0.55rem] font-bold" style={{ background: "rgba(0,0,0,0.6)", color: "var(--coral)" }}>
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--coral)" }} /> LIVE
              </span>
            </div>
            <div className="truncate p-2 text-[0.62rem] font-medium" style={{ color: "var(--text-2)" }}>{s.creator_name || s.creator_email}</div>
          </button>
        ))}
      </div>

      {active && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.8)" }} onClick={() => setActive(null)}>
          <div className="w-full max-w-3xl overflow-hidden rounded-2xl border" style={{ background: "var(--card-solid)", borderColor: "var(--border)" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b p-3" style={{ borderColor: "var(--border)" }}>
              <span className="text-[0.8rem] font-bold" style={{ color: "var(--text)" }}>{active.creator_name || active.creator_email}</span>
              <button onClick={() => setActive(null)} className="rounded-lg p-1.5 hover:bg-[var(--hover)]"><X size={16} style={{ color: "var(--text-2)" }} /></button>
            </div>
            <div className="aspect-video" style={{ background: "#000" }}>
              {active.frame_url && <img src={active.frame_url} alt="" className="h-full w-full object-contain" />}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}