import React from "react";
import { useClock } from "./utils";

export default function PageHead({ icon, color = "var(--acc)", title, subtitle, badges = [] }) {
  const clock = useClock();
  return (
    <div className="ds-in mb-5 flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-4" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
      <div className="flex items-center gap-3.5">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl text-lg" style={{ color, background: `${color}14`, border: `1px solid ${color}33` }}>
          <i className={`fa-solid ${icon}`} />
        </div>
        <div>
          <h1 className="font-heading text-[1.15rem] font-bold leading-tight tracking-tight" style={{ color: "var(--text)" }}>{title}</h1>
          <p className="mt-0.5 text-[0.72rem]" style={{ color: "var(--text-3)" }}>{subtitle}</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {badges.map((b, i) => (
          <span key={i} className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[0.68rem] font-semibold" style={{ background: "var(--glass)", borderColor: "var(--border)", color: "var(--text-2)" }}>
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: b.color || color }} />
            {b.text}
          </span>
        ))}
        <span className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-jb text-[0.68rem]" style={{ background: "var(--glass)", borderColor: "var(--border)", color: "var(--text-2)" }}>
          <i className="fa-regular fa-clock" style={{ color, fontSize: "0.65rem" }} />
          {clock.slice(0, 5)}
        </span>
      </div>
    </div>
  );
}