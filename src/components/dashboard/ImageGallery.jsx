import React, { useMemo, useState } from "react";
import { LayoutGrid, List, Search, X, ExternalLink, Copy, ImageOff } from "lucide-react";
import { copyImage } from "./utils";

/**
 * Generic image gallery with search, category filter, grid/list view & preview modal.
 * props: data [{c,u,b}], cats [{f,label,icon}], accent (css color), tagMap {key:{label,color}}
 */
export default function ImageGallery({ data, cats = [], accent = "var(--cyan)", tagMap = {} }) {
  const [filter, setFilter] = useState("all");
  const [q, setQ] = useState("");
  const [list, setList] = useState(true); // true=grid
  const [active, setActive] = useState(null);

  const filtered = useMemo(
    () => data.filter((d) => (filter === "all" || d.b === filter) && d.c.toLowerCase().includes(q.toLowerCase())),
    [data, filter, q]
  );

  const tag = (b) => tagMap[b] || { label: b?.toUpperCase(), color: accent };

  return (
    <div>
      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center gap-2.5 rounded-2xl border p-3" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        <div className="relative min-w-[200px] flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--text-3)" }} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari..."
            className="w-full rounded-xl border bg-transparent py-2.5 pl-10 pr-4 text-sm outline-none transition-colors focus:border-[var(--acc)]"
            style={{ background: "var(--glass)", borderColor: "var(--border)", color: "var(--text)" }} />
        </div>
        {cats.length > 0 && (
          <div className="flex gap-1.5 overflow-x-auto">
            {[{ f: "all", label: "Semua" }, ...cats].map((c) => (
              <button key={c.f} onClick={() => setFilter(c.f)}
                className="flex items-center gap-1.5 whitespace-nowrap rounded-xl border px-3.5 py-2 text-[0.7rem] font-semibold transition-all"
                style={filter === c.f
                  ? { color: accent, background: `${accent}1a`, borderColor: `${accent}40` }
                  : { color: "var(--text-3)", borderColor: "var(--border)", background: "transparent" }}>
                {c.icon && <i className={`fa-solid ${c.icon}`} style={{ fontSize: "0.6rem" }} />}
                {c.label}
              </button>
            ))}
          </div>
        )}
        <div className="flex rounded-xl border p-0.5" style={{ background: "var(--glass)", borderColor: "var(--border)" }}>
          {[{ v: true, Icon: LayoutGrid }, { v: false, Icon: List }].map(({ v, Icon }) => (
            <button key={String(v)} onClick={() => setList(v)}
              className="flex h-8 w-9 items-center justify-center rounded-lg transition-all"
              style={list === v ? { background: "var(--hover)", color: "var(--text)" } : { color: "var(--text-3)" }}>
              <Icon size={15} />
            </button>
          ))}
        </div>
      </div>

      <div className="mb-3 text-[0.7rem]" style={{ color: "var(--text-3)" }}>
        Menampilkan <b style={{ color: "var(--text-2)" }}>{filtered.length}</b> dari {data.length} item
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border py-16 text-center" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <ImageOff size={32} className="mx-auto mb-3 opacity-40" style={{ color: "var(--text-3)" }} />
          <p className="text-sm" style={{ color: "var(--text-3)" }}>Tidak ditemukan. Coba ubah kata kunci.</p>
        </div>
      ) : (
        <div className={list ? "grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(210px,1fr))]" : "flex flex-col gap-2.5"}>
          {filtered.map((d, i) => {
            const t = tag(d.b);
            return (
              <div key={d.c + i} onClick={() => setActive(d)}
                className={`group ds-in cursor-pointer overflow-hidden rounded-2xl border transition-all hover:-translate-y-1 hover:border-[var(--border-active)] ${list ? "" : "flex"}`}
                style={{ background: "var(--card)", borderColor: "var(--border)", animationDelay: `${Math.min(i * 0.04, 0.6)}s` }}>
                <div className={`relative overflow-hidden ${list ? "" : "w-[140px] min-w-[140px]"}`} style={{ background: "rgba(0,0,0,0.25)" }}>
                  <img src={d.u} alt={d.c} loading="lazy"
                    className={`w-full object-cover transition-transform duration-500 group-hover:scale-110 ${list ? "h-36" : "h-full min-h-[96px]"}`}
                    style={{ filter: "brightness(0.92)" }} />
                  <div className="absolute inset-0" style={{ background: "linear-gradient(180deg,transparent 45%,rgba(0,0,0,0.6))" }} />
                  <span className="absolute right-2 top-2 rounded-md px-2 py-0.5 text-[0.55rem] font-bold uppercase tracking-wide backdrop-blur" style={{ background: `${t.color}26`, color: t.color, border: `1px solid ${t.color}40` }}>{t.label}</span>
                  {list && (
                    <button onClick={(e) => { e.stopPropagation(); copyImage(d.u); }}
                      className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full opacity-0 backdrop-blur transition-all group-hover:opacity-100"
                      style={{ background: "rgba(0,0,0,0.55)", color: "#fff", border: "1px solid rgba(255,255,255,0.12)" }}>
                      <Copy size={13} />
                    </button>
                  )}
                </div>
                <div className={`p-3.5 ${list ? "" : "flex flex-1 flex-col justify-center"}`}>
                  <div className="mb-2 line-clamp-2 text-[0.74rem] font-semibold leading-snug" style={{ color: "var(--text)" }}>{d.c}</div>
                  <div className="flex items-center justify-between">
                    <span className="font-jb text-[0.6rem]" style={{ color: "var(--text-3)" }}>#{String(i + 1).padStart(2, "0")}</span>
                    <span className="flex items-center gap-1 text-[0.62rem] font-medium" style={{ color: t.color }}>
                      Lihat <i className="fa-solid fa-arrow-right text-[0.55rem]" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {active && (
        <div onClick={(e) => e.target === e.currentTarget && setActive(null)}
          className="fixed inset-0 z-[100] flex items-center justify-center p-5"
          style={{ background: "rgba(2,4,10,0.92)", backdropFilter: "blur(20px)" }}>
          <div className="ds-in w-full max-w-[580px] overflow-hidden rounded-2xl border" style={{ background: "var(--card-solid)", borderColor: "var(--border)", boxShadow: "0 30px 80px rgba(0,0,0,0.6)" }}>
            <div className="flex items-center justify-between border-b px-5 py-4" style={{ borderColor: "var(--border)" }}>
              <div className="min-w-0">
                <div className="text-[0.6rem] uppercase tracking-wide" style={{ color: "var(--text-3)" }}>Pratinjau</div>
                <h3 className="truncate pr-3 font-heading text-[0.95rem] font-bold" style={{ color: "var(--text)" }}>{active.c}</h3>
              </div>
              <button onClick={() => setActive(null)} className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border transition-colors hover:bg-[var(--hover)]" style={{ borderColor: "var(--border)", color: "var(--text-3)" }}>
                <X size={17} />
              </button>
            </div>
            <div className="ds-scroll max-h-[calc(88vh-72px)] overflow-y-auto p-5">
              <div className="mb-4 rounded-xl p-2" style={{ background: "rgba(0,0,0,0.3)" }}>
                <img src={active.u} alt={active.c} className="max-h-[46vh] w-full rounded-lg object-contain" />
              </div>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <button onClick={() => window.open(active.u, "_blank")} className="flex items-center justify-center gap-2 rounded-xl border py-3 text-[0.8rem] font-semibold transition-colors hover:bg-[var(--hover)]" style={{ background: "var(--glass)", borderColor: "var(--border)", color: "var(--text-2)" }}>
                  <ExternalLink size={15} /> Buka Tab
                </button>
                <button onClick={() => copyImage(active.u)} className="flex items-center justify-center gap-2 rounded-xl py-3 text-[0.8rem] font-bold text-black transition-transform hover:scale-[1.02]" style={{ background: "var(--acc-grad)" }}>
                  <Copy size={15} /> Salin Gambar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}