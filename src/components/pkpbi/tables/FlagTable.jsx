import React from "react";
import SitusCell from "@/components/pkpbi/SitusCell";

export default function FlagTable({ records }) {
  const HEADS = ["Situs", "Existing Username", "New Username", "IP Address", "Fingerprint", "Device ID"];
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
                <td className="whitespace-nowrap px-4 py-2.5 font-jb text-xs" style={{ color: "var(--text)" }}>{r.existingUsername || "—"}</td>
                <td className="whitespace-nowrap px-4 py-2.5 font-jb text-xs" style={{ color: "var(--text)" }}>{r.newUsername || "—"}</td>
                <td className="whitespace-nowrap px-4 py-2.5 font-jb text-xs" style={{ color: "var(--text-2)" }}>{r.ipAddress || "—"}</td>
                <td className="whitespace-nowrap px-4 py-2.5 font-jb text-xs" style={{ color: "var(--text-2)" }}>{r.fingerprint || "—"}</td>
                <td className="whitespace-nowrap px-4 py-2.5 font-jb text-xs" style={{ color: "var(--text-2)" }}>{r.deviceId || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}