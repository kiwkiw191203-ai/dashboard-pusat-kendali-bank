import React from "react";
import SitusCell from "@/components/pkpbi/SitusCell";

export default function LeaderboardTable({ records }) {
  return (
    <div className="overflow-hidden rounded-2xl border" style={{ background: "var(--card-solid)", borderColor: "var(--border)" }}>
      <div className="ds-scroll overflow-x-auto">
        <table className="w-full text-left text-[0.74rem]">
          <thead>
            <tr style={{ background: "var(--bg-2)" }}>
              <th className="w-16 px-4 py-2.5 font-bold" style={{ color: "var(--text-3)" }}>Rank</th>
              <th className="whitespace-nowrap px-4 py-2.5 font-bold" style={{ color: "var(--text-3)" }}>Situs</th>
              <th className="px-4 py-2.5 font-bold" style={{ color: "var(--text-3)" }}>Username</th>
              <th className="px-4 py-2.5 text-right font-bold" style={{ color: "var(--text-3)" }}>Points</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r, i) => (
              <tr key={i} className="border-t" style={{ borderColor: "var(--border)" }}>
                <td className="px-4 py-2.5">
                  <span className="inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[0.66rem] font-bold"
                    style={{ background: "rgba(247,200,67,0.15)", color: "var(--gold)" }}>{r.rank}</span>
                </td>
                <td className="px-4 py-2.5"><SitusCell situs={r.situs} /></td>
                <td className="whitespace-nowrap px-4 py-2.5 font-jb text-xs font-semibold" style={{ color: "var(--text)" }}>{r.username}</td>
                <td className="px-4 py-2.5 text-right font-bold text-sm tabular-nums" style={{ color: "var(--text)" }}>{r.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}