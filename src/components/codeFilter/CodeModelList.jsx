import React, { useState } from "react";
import { Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";

export default function CodeModelList({ models, onChange }) {
  const [q, setQ] = useState("");
  const filtered = models.filter((m) => `${m.code} ${m.model_name}`.toLowerCase().includes(q.toLowerCase()));

  const remove = async (id) => {
    try { await base44.entities.GameCodeModel.delete(id); toast.success("Dihapus"); onChange?.(); }
    catch { toast.error("Gagal menghapus"); }
  };

  return (
    <div>
      <div className="relative mb-2.5">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-3)" }} />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari kode/model..."
          className="w-full rounded-lg border bg-transparent py-2 pl-8 pr-3 text-[0.74rem] outline-none"
          style={{ borderColor: "var(--border)", color: "var(--text)", background: "var(--glass)" }} />
      </div>
      <div className="ds-scroll max-h-[300px] space-y-1.5 overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="py-6 text-center text-[0.72rem]" style={{ color: "var(--text-3)" }}>Belum ada data</p>
        ) : filtered.map((m) => (
          <div key={m.id} className="flex items-center gap-2.5 rounded-lg border p-2.5" style={{ borderColor: "var(--border)", background: "var(--card-solid)" }}>
            <div className="min-w-0 flex-1">
              <div className="truncate font-jb text-[0.68rem]" style={{ color: "var(--text-3)" }}>{m.code}</div>
              <div className="truncate text-[0.78rem] font-semibold" style={{ color: "var(--text)" }}>{m.model_name} <span className="text-[0.6rem] uppercase" style={{ color: "var(--purple)" }}>· {m.provider}</span></div>
            </div>
            <button onClick={() => remove(m.id)} className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg transition-colors hover:bg-[var(--hover)]" style={{ color: "var(--coral)" }}>
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}