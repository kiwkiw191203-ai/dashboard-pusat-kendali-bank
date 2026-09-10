import React from "react";
import { motion } from "framer-motion";
import { RESULT_META } from "@/lib/betCalc";
import moment from "moment";

const SIDE_LABEL = { over: "Over", under: "Under", favored: "Handicap" };

export default function CalcHistory({ records, onDelete, myEmail }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
      <div className="flex items-center justify-between border-b px-5 py-3.5" style={{ borderColor: "var(--border)", background: "linear-gradient(135deg, var(--bg-2), var(--card-solid))" }}>
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-8 w-8 items-center justify-center rounded-xl" style={{ background: "rgba(var(--green-rgb),0.12)", border: "1px solid rgba(var(--green-rgb),0.3)" }}>
            <i className="fa-solid fa-tower-broadcast" style={{ color: "var(--green)", fontSize: "0.78rem" }} />
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full" style={{ background: "var(--green)", boxShadow: "0 0 6px var(--green)" }} />
          </span>
          <div>
            <h3 className="font-heading text-[0.86rem] font-bold leading-tight" style={{ color: "var(--text)" }}>Calculation History</h3>
            <p className="text-[0.6rem]" style={{ color: "var(--text-3)" }}>Realtime feed · {records.length} entry</p>
          </div>
        </div>
      </div>

      {records.length === 0 ? (
        <div className="py-12 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: "var(--glass)", border: "1px solid var(--border)" }}>
            <i className="fa-regular fa-clipboard text-xl" style={{ color: "var(--text-3)" }} />
          </div>
          <p className="text-[0.78rem] font-semibold" style={{ color: "var(--text-2)" }}>No calculations yet</p>
          <p className="mt-0.5 text-[0.64rem]" style={{ color: "var(--text-3)" }}>Your calculation history will appear here</p>
        </div>
      ) : (
        <div className="ds-scroll max-h-[560px] flex-1 space-y-2 overflow-y-auto p-3">
          {records.map((r, i) => {
            const meta = RESULT_META[r.result];
            const mine = (r.creator_email || "").toLowerCase() === (myEmail || "").toLowerCase();
            const initials = (r.creator_name || r.creator_email || "?")[0]?.toUpperCase();
            return (
              <motion.div
                key={r.id || i}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="group flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5"
                style={{ background: mine ? "rgba(var(--acc-rgb),0.05)" : "var(--glass)", borderColor: mine ? "rgba(var(--acc-rgb),0.25)" : "var(--border)" }}>
                <div className="flex min-w-0 items-center gap-2.5">
                  <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-[0.62rem] font-bold text-black"
                    style={{ background: "var(--acc-grad)" }}>{initials}</div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 text-[0.72rem]">
                      <span className="font-semibold" style={{ color: "var(--text)" }}>{SIDE_LABEL[r.side] || r.side}</span>
                      <span style={{ color: "var(--text-3)" }}>·</span>
                      <span className="font-jb" style={{ color: "var(--text-2)" }}>H {r.handicap}</span>
                      <span style={{ color: "var(--text-3)" }}>·</span>
                      <span className="font-jb" style={{ color: "var(--text-2)" }}>G {r.total_goal}</span>
                    </div>
                    <div className="mt-0.5 truncate text-[0.58rem]" style={{ color: "var(--text-3)" }}>
                      {r.creator_name || r.creator_email || "Unknown"} · {moment(r.created_date).fromNow()}
                    </div>
                  </div>
                </div>
                <div className="flex flex-shrink-0 items-center gap-1.5">
                  <span className="rounded-md px-2 py-0.5 text-[0.62rem] font-bold" style={{ color: meta.color, background: `${meta.color}15`, border: `1px solid ${meta.color}30` }}>{meta.label}</span>
                  {mine && (
                    <button onClick={() => onDelete(r.id)} className="opacity-0 transition-opacity group-hover:opacity-100" style={{ color: "var(--coral)" }}>
                      <i className="fa-solid fa-trash text-[0.62rem]" />
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}