import React from "react";
import { motion } from "framer-motion";
import { Monitor, Globe, Clock, ChevronRight } from "lucide-react";
import HourTimeline from "./HourTimeline";

export default function UserActivityCard({ row, onClick }) {
  const online = row.online;
  return (
    <motion.button
      layout
      whileHover={{ y: -2 }}
      onClick={onClick}
      className="w-full rounded-2xl border p-4 text-left transition-colors"
      style={{
        background: "var(--card)",
        borderColor: online ? "rgba(56,189,248,0.28)" : "var(--border)",
        boxShadow: online ? "0 2px 14px rgba(46,143,212,0.12)" : "var(--shadow-sm)",
      }}>
      <div className="flex items-start gap-3">
        <div className="relative flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl text-[0.8rem] font-semibold text-white"
          style={{ background: "linear-gradient(135deg,#1E6FB0,#38BDF8)" }}>
          {row.avatar_url ? <img src={row.avatar_url} alt="" className="h-full w-full object-cover" /> : (row.name || row.email || "?")[0]?.toUpperCase()}
          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2"
            style={{ background: online ? "var(--teal)" : "var(--text-3)", borderColor: "var(--card-solid)" }} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-[0.85rem] font-semibold" style={{ color: "var(--text)" }}>{row.name || row.email}</span>
            <span className="label-caps flex-shrink-0 rounded-md px-1.5 py-0.5 text-[0.48rem]"
              style={{ color: "var(--acc-2)", background: "rgba(56,189,248,0.12)", border: "1px solid rgba(56,189,248,0.25)" }}>
              {row.roleLabel}
            </span>
            <span className="label-caps flex-shrink-0 rounded-md px-1.5 py-0.5 text-[0.48rem]"
              style={online
                ? { color: "var(--teal)", background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.28)" }
                : { color: "var(--text-3)", background: "var(--glass)", border: "1px solid var(--border)" }}>
              {online ? "Online" : "Offline"}
            </span>
          </div>
          <div className="truncate text-[0.66rem]" style={{ color: "var(--text-3)" }}>{row.email}</div>

          <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-4">
            <Meta icon={Clock} label="Login terakhir" value={row.lastLoginText} />
            <Meta icon={Clock} label="Durasi aktif" value={row.durationText} />
            <Meta icon={Monitor} label="Device" value={`${row.device} · ${row.os}`} />
            <Meta icon={Globe} label="Browser" value={row.browser} />
          </div>
        </div>

        <ChevronRight size={16} className="mt-1 flex-shrink-0" style={{ color: "var(--text-3)" }} />
      </div>

      <div className="mt-3">
        <div className="mb-1 flex items-center justify-between">
          <span className="label-caps text-[0.5rem]" style={{ color: "var(--text-3)" }}>Timeline 24 Jam</span>
          <span className="truncate pl-2 text-[0.6rem]" style={{ color: "var(--text-2)" }}>{row.lastActivityText}</span>
        </div>
        <HourTimeline buckets={row.buckets} compact />
      </div>
    </motion.button>
  );
}

function Meta({ icon: Icon, label, value }) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-1 text-[0.5rem]" style={{ color: "var(--text-3)" }}>
        <Icon size={9} /> <span className="label-caps">{label}</span>
      </div>
      <div className="truncate text-[0.68rem] font-medium" style={{ color: "var(--text-2)" }}>{value || "—"}</div>
    </div>
  );
}