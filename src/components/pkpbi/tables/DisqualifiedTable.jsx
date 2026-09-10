import React from "react";
import SitusCell from "@/components/pkpbi/SitusCell";

export default function DisqualifiedTable({ records }) {
  return (
    <div className="overflow-hidden rounded-2xl border" style={{ background: "var(--card-solid)", borderColor: "rgba(239,68,68,0.3)" }}>
      <div className="ds-scroll overflow-x-auto">
        <table className="w-full text-left text-[0.74rem]">
          <thead>
            <tr style={{ background: "rgba(239,68,68,0.08)" }}>
              <th className="whitespace-nowrap px-4 py-2.5 font-bold" style={{ color: "var(--coral)" }}>Situs</th>
              <th className="whitespace-nowrap px-4 py-2.5 font-bold" style={{ color: "var(--coral)" }}>Username</th>
              <th className="whitespace-nowrap px-4 py-2.5 font-bold" style={{ color: "var(--coral)" }}>Keterangan</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r, i) => (
              <tr key={i} className="border-t" style={{ borderColor: "rgba(239,68,68,0.15)" }}>
                <td className="px-4 py-2.5"><SitusCell situs={r.situs} /></td>
                <td className="whitespace-nowrap px-4 py-2.5 font-jb text-xs font-semibold" style={{ color: "var(--text)" }}>{r.username}</td>
                <td className="px-4 py-2.5 text-[0.7rem]" style={{ color: "var(--text-3)" }}>{r.keterangan || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}