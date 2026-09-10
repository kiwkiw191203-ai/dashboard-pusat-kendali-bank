import React from "react";

export function SectionTitle({ icon, color = "var(--acc)", children }) {
  return (
    <div className="mb-4 mt-7 flex items-center gap-3">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg"
        style={{ color, background: `${color}1a`, border: `1px solid ${color}33` }}>
        <i className={`fa-solid ${icon}`} style={{ color, fontSize: "0.85rem" }} />
      </span>
      <span className="text-[1rem] font-bold" style={{ color: "var(--text)" }}>{children}</span>
      <div className="lux-divider" />
      <span className="hidden h-1.5 w-1.5 rounded-full sm:block" style={{ background: "var(--gold)" }} />
    </div>
  );
}

export function Panel({ children, className = "", accent }) {
  return (
    <div className={`lux-card rounded-2xl border p-5 ${className}`}
      style={{ background: "var(--card)", borderColor: "var(--border)", borderLeft: accent ? `3px solid ${accent}` : undefined, backdropFilter: "blur(6px)" }}>
      {children}
    </div>
  );
}

export function PanelTitle({ icon, color = "var(--acc)", children }) {
  return (
    <div className="mb-3.5 flex items-center gap-2.5 border-b pb-3"
      style={{ borderColor: "var(--border)" }}>
      <span className="flex h-7 w-7 items-center justify-center rounded-lg"
        style={{ color, background: `${color}18`, border: `1px solid ${color}30` }}>
        <i className={`fa-solid ${icon}`} style={{ color, fontSize: "0.78rem" }} />
      </span>
      <span className="text-[0.9rem] font-bold" style={{ color: "var(--text)" }}>{children}</span>
    </div>
  );
}

export function Banner({ emoji = "📢", title, children }) {
  return (
    <div className="lux-topline lux-card relative flex flex-wrap items-start gap-4 overflow-hidden rounded-2xl border p-5"
      style={{
        background: "linear-gradient(120deg, rgba(30,58,138,0.30), rgba(76,125,255,0.12) 55%, rgba(233,199,102,0.05))",
        borderColor: "rgba(122,162,255,0.30)",
        backdropFilter: "blur(6px)",
      }}>
      <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl text-2xl"
        style={{ background: "rgba(233,199,102,0.10)", border: "1px solid rgba(233,199,102,0.28)" }}>{emoji}</span>
      <div className="min-w-[220px] flex-1">
        <div className="flex items-center gap-2.5 text-[1.05rem] font-bold">
          <i className="fa-solid fa-gem text-[0.8rem]" style={{ color: "var(--gold)" }} />
          <span style={{ color: "var(--acc-2)" }}>{title}</span>
        </div>
        <div className="mt-1 text-[0.86rem] leading-relaxed" style={{ color: "var(--text-2)" }}>{children}</div>
      </div>
    </div>
  );
}

export function Bullet({ color = "var(--acc)", children }) {
  return (
    <div className="flex items-start gap-3 border-b py-2 text-[0.82rem] leading-relaxed transition-colors last:border-b-0 hover:bg-[var(--hover)]"
      style={{ borderColor: "var(--border)", color: "var(--text-2)", borderRadius: "var(--r-xs)" }}>
      <i className="fa-solid fa-chevron-right mt-1 flex-shrink-0 text-[0.62rem]" style={{ color }} />
      <span>{children}</span>
    </div>
  );
}

export function KeyValue({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b py-2 text-[0.8rem] last:border-b-0" style={{ borderColor: "var(--border)" }}>
      <span style={{ color: "var(--text-2)" }}>{label}</span>
      <span className="mono-num rounded-full px-3 py-0.5 text-right text-[0.72rem] font-semibold"
        style={{ background: "var(--glass-2)", color: "var(--acc-2)", border: "1px solid var(--border)" }}>{value}</span>
    </div>
  );
}
