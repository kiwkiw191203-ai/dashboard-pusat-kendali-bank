import React from "react";
import { SectionTitle } from "@/components/bankCenter/Ui";
import { SOP_CARDS } from "@/components/bankCenter/bankCenterData";

export default function SopPanel() {
  return (
    <div>
      <SectionTitle icon="fa-university">SOP · Set All Bank BK</SectionTitle>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 2xl:grid-cols-3">
        {SOP_CARDS.map((c) => {
          const accent = c.accent || "var(--acc)";
          return (
            <div key={c.name} className="lux-card rounded-2xl border p-5"
              style={{ background: "var(--card)", borderColor: "var(--border)", backdropFilter: "blur(6px)" }}>
              <div className="mb-4 flex items-center gap-3.5 border-b pb-3.5" style={{ borderColor: "var(--border)" }}>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl"
                  style={{ color: accent, background: `linear-gradient(150deg, ${accent}20, ${accent}0a)`, border: `1px solid ${accent}33` }}>
                  <i className={`fa-solid ${c.icon}`} style={{ fontSize: "1.05rem" }} />
                </div>
                <span className="text-[1.05rem] font-bold" style={{ color: "var(--text)" }}>{c.name}</span>
                <span className="mono-num ml-auto rounded-full px-3 py-1 text-[0.72rem] font-semibold"
                  style={{ background: "var(--glass-2)", color: "var(--gold)", border: "1px solid var(--border)" }}>{c.time}</span>
              </div>
              <ul>
                {c.steps.map(([n, text]) => (
                  <li key={n} className="flex items-start gap-3 border-b py-2 text-[0.8rem] leading-relaxed transition-colors last:border-b-0 hover:bg-[var(--hover)]"
                    style={{ borderColor: "var(--border)", color: "var(--text-2)", borderRadius: "var(--r-xs)" }}>
                    <span className="mono-num flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md text-[0.66rem] font-bold"
                      style={{ color: accent, background: `${accent}18`, border: `1px solid ${accent}26` }}>{n}</span>
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex items-center gap-2.5 rounded-xl border px-4 py-3 text-[0.75rem]"
                style={{ background: "var(--glass)", borderColor: "var(--border)", color: "var(--text-2)" }}>
                <i className={`fa-solid ${c.footerIcon}`} style={{ color: accent }} /> {c.footer}
              </div>
            </div>
          );
        })}
      </div>

      <div className="lux-topline mt-7 flex flex-wrap items-center gap-3 rounded-2xl border px-5 py-4 text-[0.8rem]"
        style={{ background: "linear-gradient(120deg, rgba(233,199,102,0.08), rgba(233,199,102,0.02))", borderColor: "rgba(233,199,102,0.30)", color: "var(--text-2)" }}>
        <i className="fa-solid fa-lightbulb" style={{ color: "var(--gold)" }} />
        <span><strong>Tips :</strong> Selalu lakukan CROSSCHECK di setiap langkah. Pastikan BK dalam kondisi <strong>MATI</strong> sebelum pull mutasi manual. Gunakan [Ctrl+F] untuk memverifikasi saldo.</span>
      </div>
    </div>
  );
}
