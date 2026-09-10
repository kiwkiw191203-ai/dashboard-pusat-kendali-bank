import React, { useState } from "react";
import { Search, ExternalLink, Copy } from "lucide-react";
import PageHead from "@/components/dashboard/PageHead";
import { copyText } from "@/components/dashboard/utils";
import { SHORTCUTS } from "@/lib/dashboardData";

export default function Shortcut() {
  const [q, setQ] = useState("");
  const list = SHORTCUTS.filter((d) => d.t.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="w-full p-4 md:p-7">
      <PageHead
        icon="fa-bolt" color="var(--purple)"
        title="SHORTCUT LINKS" subtitle="Akses cepat ke link penting"
        badges={[{ icon: "fa-link", text: `${SHORTCUTS.length} Link`, color: "var(--purple)" }]}
      />

      <div className="mb-5 flex items-center gap-3 rounded-2xl border p-3" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        <Search size={16} style={{ color: "var(--text-3)" }} />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari link..."
          className="flex-1 bg-transparent text-sm outline-none"
          style={{ color: "var(--text)" }} />
        <span className="font-jb text-[0.66rem]" style={{ color: "var(--text-3)" }}>{list.length} hasil</span>
      </div>

      <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(280px,1fr))]">
        {list.map((d, i) => (
          <a key={d.u} href={d.u} target="_blank" rel="noopener noreferrer"
            className="group ds-in relative flex flex-col items-center overflow-hidden rounded-2xl border p-7 text-center transition-all hover:-translate-y-1.5 hover:border-[var(--border-active)]"
            style={{ background: "var(--card)", borderColor: "var(--border)", animationDelay: `${i * 0.08}s` }}>
            <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-10 blur-2xl transition-opacity group-hover:opacity-25" style={{ background: "var(--purple)" }} />
            <span className="absolute left-3.5 top-3 font-jb text-[0.6rem] opacity-50" style={{ color: "var(--text-3)" }}>{String(i + 1).padStart(2, "0")}</span>
            <button onClick={(e) => { e.preventDefault(); copyText(d.u, "Link disalin!"); }}
              className="absolute right-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-full opacity-0 transition-all group-hover:opacity-100"
              style={{ background: "rgba(0,0,0,0.35)", color: "var(--text-3)", border: "1px solid var(--border)" }}>
              <Copy size={12} />
            </button>
            <img src={d.img} alt={d.t} loading="lazy" className="mb-4 h-[72px] w-[72px] rounded-2xl border-2 object-cover transition-all group-hover:scale-105" style={{ borderColor: "rgba(167,139,250,0.18)", background: "var(--glass)" }} />
            <div className="mb-3.5 text-[0.85rem] font-bold" style={{ color: "var(--text)" }}>{d.t}</div>
            <div className="flex items-center gap-2 rounded-full border px-5 py-2 text-[0.7rem] font-semibold transition-colors group-hover:bg-[rgba(167,139,250,0.14)]" style={{ background: "rgba(167,139,250,0.08)", borderColor: "rgba(167,139,250,0.18)", color: "var(--purple)" }}>
              <ExternalLink size={12} /> Buka Link
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}