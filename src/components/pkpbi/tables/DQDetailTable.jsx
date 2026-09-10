import React from "react";
import SitusCell from "@/components/pkpbi/SitusCell";

const CATEGORY_COLORS = {
  "Prediction Flag": "var(--coral)",
  "Kesamaan IP": "var(--gold)",
  "Beda Nama Rekening": "var(--violet)",
};

export default function DQDetailTable({ records }) {
  const HEADS = ["Situs", "Kategori", "UserID", "Bank", "Nama Rekening", "No. Rekening", "Rank"];
  return (
    <div className="overflow-hidden rounded-2xl border" style={{ background: "var(--card-solid)", borderColor: "var(--border)" }}>
      <div className="ds-scroll overflow-x-auto">
        <table className="w-full text-left text-[0.74rem]">
          <thead>
            <tr style={{ background: "var(--bg-2)" }}>
              {HEADS.map((h) => (
                <th key={h} className="whitespace-nowrap px-4 py-2.5 font-bold" style={{ color: "var(--text-3)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {records.map((r, i) => (
              <tr key={i} className="border-t" style={{ borderColor: "var(--border)" }}>
                <td className="px-4 py-2.5"><SitusCell situs={r.situs} /></td>
                <td className="whitespace-nowrap px-4 py-2.5 text-xs font-medium" style={{ color: CATEGORY_COLORS[r.category] || "var(--text)" }}>{r.category || "—"}</td>
                <td className="whitespace-nowrap px-4 py-2.5 font-jb text-xs" style={{ color: "var(--text)" }}>{r.userId || "—"}</td>
                <td className="whitespace-nowrap px-4 py-2.5 text-xs" style={{ color: "var(--text-2)" }}>{r.bank || "—"}</td>
                <td className="whitespace-nowrap px-4 py-2.5 text-xs" style={{ color: "var(--text-2)" }}>{r.namaRekening || "—"}</td>
                <td className="whitespace-nowrap px-4 py-2.5 font-jb text-xs" style={{ color: "var(--text-2)" }}>{r.noRekening || "—"}</td>
                <td className="whitespace-nowrap px-4 py-2.5 text-xs tabular-nums" style={{ color: "var(--text-2)" }}>{r.rank || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}