import React from "react";

const HOURS = Array.from({ length: 24 }, (_, i) => i);

/**
 * 24-hour activity timeline bar.
 * buckets: array(24) of activity counts for the selected date.
 */
export default function HourTimeline({ buckets = [], compact = false }) {
  const max = Math.max(1, ...buckets);
  const nowHour = new Date().getHours();

  return (
    <div className="w-full">
      <div className="flex items-end gap-[2px]" style={{ height: compact ? 26 : 44 }}>
        {HOURS.map((h) => {
          const v = buckets[h] || 0;
          const ratio = v / max;
          const isNow = h === nowHour;
          return (
            <div key={h} className="group relative flex-1" title={`${String(h).padStart(2, "0")}:00 — ${v} aktivitas`}>
              <div
                className="w-full rounded-[2px] transition-all"
                style={{
                  height: `${Math.max(v > 0 ? 18 : 5, ratio * 100)}%`,
                  background: v > 0
                    ? "linear-gradient(180deg, #38BDF8 0%, #1E6FB0 100%)"
                    : "rgba(120,140,165,0.18)",
                  boxShadow: v > 0 ? "0 0 8px rgba(56,189,248,0.28)" : "none",
                  outline: isNow ? "1px solid rgba(56,189,248,0.55)" : "none",
                }}
              />
            </div>
          );
        })}
      </div>
      {!compact && (
        <div className="mt-1 flex justify-between font-jb text-[0.55rem]" style={{ color: "var(--text-3)" }}>
          {["00", "06", "12", "18", "23"].map((l) => <span key={l}>{l}:00</span>)}
        </div>
      )}
    </div>
  );
}