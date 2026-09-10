import React from "react";
import { REF_HANDICAPS, REF_GOALS, overResult, flip, RESULT_META } from "@/lib/betCalc";

export default function ReferenceTable() {
  return (
    <div className="overflow-hidden rounded-2xl border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
      {/* Header */}
      <div className="flex items-center justify-between border-b px-5 py-3.5" style={{ borderColor: "var(--border)", background: "linear-gradient(135deg, var(--bg-2), var(--card-solid))" }}>
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl" style={{ background: "rgba(var(--acc-rgb),0.12)", border: "1px solid rgba(var(--acc-rgb),0.3)" }}>
            <i className="fa-solid fa-table-cells" style={{ color: "var(--acc)", fontSize: "0.78rem" }} />
          </span>
          <div>
            <h3 className="font-heading text-[0.86rem] font-bold leading-tight" style={{ color: "var(--text)" }}>Reference Table</h3>
            <p className="text-[0.6rem]" style={{ color: "var(--text-3)" }}>Hasil Over/Under untuk handicap umum</p>
          </div>
        </div>
        <div className="hidden items-center gap-3 sm:flex">
          <Legend color="var(--green)" label="WIN" />
          <Legend color="var(--coral)" label="LOSE" />
          <Legend color="var(--text-2)" label="DRAW" />
          <Legend color="var(--teal)" label="WIN ½" />
          <Legend color="var(--rose)" label="LOSE ½" />
        </div>
      </div>

      {/* Table */}
      <div className="ds-scroll max-h-[440px] overflow-auto">
        <table className="w-full border-collapse text-[0.7rem]">
          <thead className="sticky top-0 z-10" style={{ background: "var(--surface-2)", boxShadow: "0 1px 0 var(--border)" }}>
            <tr>
              <th className="px-3 py-2.5 text-left font-heading text-[0.62rem] font-bold uppercase tracking-wider" style={{ color: "var(--text-2)" }}>Handicap</th>
              <th className="px-3 py-2.5 text-center font-heading text-[0.62rem] font-bold uppercase tracking-wider" style={{ color: "var(--text-2)" }}>Goal</th>
              <th className="px-3 py-2.5 text-center font-heading text-[0.62rem] font-bold uppercase tracking-wider" style={{ color: "var(--green)" }}>Over</th>
              <th className="px-3 py-2.5 text-center font-heading text-[0.62rem] font-bold uppercase tracking-wider" style={{ color: "var(--coral)" }}>Under</th>
            </tr>
          </thead>
          <tbody>
            {REF_HANDICAPS.map((h, hi) => (
              <React.Fragment key={h}>
                {REF_GOALS.map((g, gi) => {
                  const ov = overResult(h, g);
                  const un = flip(ov);
                  const first = gi === 0;
                  return (
                    <tr key={`${h}-${g}`} className="transition-colors hover:bg-[var(--hover)]" style={{ background: first ? "var(--glass)" : "transparent" }}>
                      {first ? (
                        <td rowSpan={REF_GOALS.length} className="border-r px-3 py-2 align-top font-jb text-[0.78rem] font-bold" style={{ borderColor: "var(--border)", color: "var(--acc)", position: "sticky", left: 0, background: "var(--surface-2)" }}>
                          {h}
                        </td>
                      ) : null}
                      <td className="px-3 py-2 text-center font-jb" style={{ color: "var(--text-2)" }}>{g}</td>
                      <td className="px-3 py-2 text-center"><Chip r={ov} /></td>
                      <td className="px-3 py-2 text-center"><Chip r={un} /></td>
                    </tr>
                  );
                })}
                {hi < REF_HANDICAPS.length - 1 && (
                  <tr><td colSpan={4} className="p-0" style={{ background: "var(--border)", height: 1 }} /></tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Chip({ r }) {
  const meta = RESULT_META[r];
  return (
    <span className="inline-flex items-center rounded-md px-2 py-0.5 text-[0.62rem] font-bold" style={{ color: meta.color, background: `${meta.color}15`, border: `1px solid ${meta.color}30` }}>
      {meta.label}
    </span>
  );
}

function Legend({ color, label }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="h-2 w-2 rounded-full" style={{ background: color }} />
      <span className="text-[0.58rem] font-semibold" style={{ color: "var(--text-3)" }}>{label}</span>
    </span>
  );
}