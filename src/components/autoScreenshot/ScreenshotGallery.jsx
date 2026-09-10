import React, { useMemo, useState } from "react";
import { ImageOff, ListChecks, Trash2, X } from "lucide-react";
import ScreenshotCard from "./ScreenshotCard";
import ScreenshotViewer from "./ScreenshotViewer";

function dayLabel(iso) {
  if (!iso) return "Tidak diketahui";
  return new Date(iso).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

export default function ScreenshotGallery({ shots, onChange, onDelete, onDeleteMany, showOwner, canDelete }) {
  const [date, setDate] = useState("");
  const [folder, setFolder] = useState("");
  const [active, setActive] = useState(null);
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState([]);

  const folders = useMemo(() => {
    if (!showOwner) return [];
    const m = {};
    shots.forEach((s) => {
      const key = s.creator_email || "Tidak diketahui";
      m[key] = m[key] || { email: key, name: s.creator_name || s.creator_email, count: 0 };
      m[key].count += 1;
    });
    return Object.values(m).sort((a, b) => a.name.localeCompare(b.name));
  }, [shots, showOwner]);

  const filtered = useMemo(() => {
    let list = shots;
    if (folder) list = list.filter((s) => (s.creator_email || "Tidak diketahui") === folder);
    if (date) list = list.filter((s) => (s.captured_at || s.created_date || "").startsWith(date));
    return list;
  }, [shots, date, folder]);

  const groups = useMemo(() => {
    const m = {};
    filtered.forEach((s) => {
      const key = dayLabel(s.captured_at || s.created_date);
      (m[key] = m[key] || []).push(s);
    });
    return m;
  }, [filtered]);

  const toggleSelect = (id) => setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const exitSelectMode = () => { setSelectMode(false); setSelected([]); };

  const handleDelete = async (id) => { await onDelete(id); onChange?.(); };

  const handleDeleteSelected = async () => {
    if (!selected.length) return;
    await onDeleteMany(selected);
    exitSelectMode();
    onChange?.();
  };

  const handleDeleteAll = async () => {
    if (!filtered.length) return;
    await onDeleteMany(filtered.map((s) => s.id));
    exitSelectMode();
    onChange?.();
  };

  return (
    <div className="ds-in rounded-2xl border p-5" style={{ background: "var(--card)", borderColor: "var(--border)", animationDelay: ".1s" }}>
      {showOwner && folders.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <button onClick={() => setFolder("")}
            className="rounded-lg border px-2.5 py-1.5 text-[0.68rem] font-bold transition-colors"
            style={folder === "" ? { background: "rgba(var(--acc-rgb),0.16)", color: "var(--acc)", borderColor: "rgba(var(--acc-rgb),0.4)" } : { background: "var(--glass)", color: "var(--text-2)", borderColor: "var(--border)" }}>
            Semua Email ({shots.length})
          </button>
          {folders.map((f) => (
            <button key={f.email} onClick={() => setFolder(f.email)}
              className="rounded-lg border px-2.5 py-1.5 text-[0.68rem] font-bold transition-colors"
              style={folder === f.email ? { background: "rgba(var(--acc-rgb),0.16)", color: "var(--acc)", borderColor: "rgba(var(--acc-rgb),0.4)" } : { background: "var(--glass)", color: "var(--text-2)", borderColor: "var(--border)" }}>
              {f.name} ({f.count})
            </button>
          ))}
        </div>
      )}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2.5">
        <h3 className="text-[0.9rem] font-bold" style={{ color: "var(--text)" }}>Galeri Screenshot</h3>
        <div className="flex flex-wrap items-center gap-2">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
            className="rounded-lg border bg-transparent px-2.5 py-1.5 text-[0.72rem] outline-none"
            style={{ borderColor: "var(--border)", color: "var(--text)", background: "var(--glass)" }} />
          <span className="rounded-lg px-2.5 py-1.5 text-[0.7rem] font-bold" style={{ background: "var(--glass)", color: "var(--text-2)" }}>{filtered.length}</span>

          {canDelete && (!selectMode ? (
            <button onClick={() => setSelectMode(true)} disabled={!filtered.length}
              className="flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[0.68rem] font-bold transition-colors hover:bg-[var(--hover)] disabled:opacity-40"
              style={{ borderColor: "var(--border)", color: "var(--text-2)" }}>
              <ListChecks size={13} /> Pilih
            </button>
          ) : (
            <>
              <button onClick={handleDeleteSelected} disabled={!selected.length}
                className="flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[0.68rem] font-bold transition-colors hover:bg-[var(--hover)] disabled:opacity-40"
                style={{ borderColor: "rgba(239,68,68,0.3)", color: "var(--coral)" }}>
                <Trash2 size={13} /> Hapus Terpilih ({selected.length})
              </button>
              <button onClick={handleDeleteAll}
                className="flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[0.68rem] font-bold transition-colors hover:bg-[var(--hover)]"
                style={{ borderColor: "rgba(239,68,68,0.3)", color: "var(--coral)" }}>
                <Trash2 size={13} /> Hapus Semua
              </button>
              <button onClick={exitSelectMode}
                className="flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[0.68rem] font-bold transition-colors hover:bg-[var(--hover)]"
                style={{ borderColor: "var(--border)", color: "var(--text-2)" }}>
                <X size={13} /> Batal
              </button>
            </>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border py-16 text-center" style={{ background: "var(--glass)", borderColor: "var(--border)" }}>
          <ImageOff size={28} className="mx-auto mb-2 opacity-40" style={{ color: "var(--text-3)" }} />
          <p className="text-[0.78rem]" style={{ color: "var(--text-3)" }}>Belum ada screenshot</p>
        </div>
      ) : (
        <div className="ds-scroll max-h-[640px] space-y-5 overflow-y-auto pr-1">
          {Object.entries(groups).map(([label, items]) => (
            <div key={label}>
              <div className="mb-2 flex items-center gap-2 text-[0.72rem] font-bold uppercase tracking-wide" style={{ color: "var(--text-3)" }}>
                {label} <span className="rounded-md px-1.5 py-0.5 text-[0.6rem] normal-case" style={{ background: "var(--glass)", color: "var(--text-2)" }}>{items.length} file</span>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {items.map((s) => (
                  <ScreenshotCard key={s.id} shot={s} onOpen={setActive} showOwner={showOwner}
                    selectMode={selectMode && canDelete} selected={selected.includes(s.id)} onToggleSelect={toggleSelect} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <ScreenshotViewer shot={active} onClose={() => setActive(null)} onDelete={handleDelete} canDelete={canDelete} />
    </div>
  );
}