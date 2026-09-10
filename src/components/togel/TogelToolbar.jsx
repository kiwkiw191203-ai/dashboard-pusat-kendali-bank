import React from "react";
import { Search, PawPrint, Calendar, RotateCcw } from "lucide-react";

const FILTERS = [
  { key: "all", label: "Semua" },
  { key: "done", label: "Sudah Result" },
  { key: "belum", label: "Belum Result" },
];

export default function TogelToolbar({ query, setQuery, filter, setFilter, counts, onToggleShio, selectedDate, setSelectedDate, isToday, todayStr }) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2.5">
      <div className="flex flex-1 min-w-[220px] items-center gap-2 rounded-2xl border px-4 py-2.5" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        <Search size={14} style={{ color: "var(--text-3)" }} />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari pasaran…"
          className="flex-1 bg-transparent text-[0.78rem] outline-none" style={{ color: "var(--text)" }} />
      </div>
      {FILTERS.map((f) => (
        <button key={f.key} onClick={() => setFilter(f.key)}
          className="rounded-xl border px-3.5 py-2.5 text-[0.7rem] font-bold transition-colors"
          style={filter === f.key
            ? { background: "rgba(var(--acc-rgb),0.14)", borderColor: "rgba(var(--acc-rgb),0.4)", color: "var(--acc)" }
            : { background: "var(--card)", borderColor: "var(--border)", color: "var(--text-3)" }}>
          {f.label}
        </button>
      ))}
      {setSelectedDate && (
        <div className="flex items-center gap-1.5 rounded-xl border px-3 py-2.5" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <Calendar size={13} style={{ color: "var(--acc)" }} />
          <input type="date" value={selectedDate} max={todayStr} onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-transparent text-[0.7rem] font-semibold outline-none" style={{ color: "var(--text)" }} />
          {!isToday && (
            <button onClick={() => setSelectedDate(todayStr)} className="flex items-center gap-1 text-[0.62rem] font-bold" style={{ color: "var(--acc)" }}>
              <RotateCcw size={11} /> Hari Ini
            </button>
          )}
        </div>
      )}
      <button onClick={onToggleShio}
        className="flex items-center gap-1.5 rounded-xl border px-3.5 py-2.5 text-[0.7rem] font-bold xl:hidden"
        style={{ background: "var(--card)", borderColor: "var(--border)", color: "var(--acc)" }}>
        <PawPrint size={13} /> Shio
      </button>
      <span className="text-[0.68rem]" style={{ color: "var(--text-3)" }}>
        Menampilkan <b style={{ color: "var(--acc)" }}>{counts.visible}</b> dari <b style={{ color: "var(--acc)" }}>{counts.all}</b> pasaran ·{" "}
        <b style={{ color: "var(--green)" }}>{counts.done}</b> sudah result
      </span>
    </div>
  );
}