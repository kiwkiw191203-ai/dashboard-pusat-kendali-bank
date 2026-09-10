import React, { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";

const PROVIDERS = [{ v: "pg", l: "PG Soft" }, { v: "pp", l: "Pragmatic" }, { v: "other", l: "Lainnya" }];

export default function CodeModelForm({ onAdded }) {
  const [code, setCode] = useState("");
  const [modelName, setModelName] = useState("");
  const [provider, setProvider] = useState("pg");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!code.trim() || !modelName.trim()) return;
    setBusy(true);
    try {
      await base44.entities.GameCodeModel.create({ code: code.trim().replace(/\D/g, ""), model_name: modelName.trim(), provider });
      setCode(""); setModelName("");
      toast.success("Kode model ditambahkan");
      onAdded?.();
    } catch { toast.error("Gagal menambahkan"); }
    setBusy(false);
  };

  return (
    <form onSubmit={submit} className="mb-4 flex flex-col gap-2 rounded-xl border p-3" style={{ borderColor: "var(--border)", background: "var(--glass)" }}>
      <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Kode/ID (mis. 2072484355791535616)"
        className="w-full rounded-lg border bg-transparent px-3 py-2 font-jb text-[0.74rem] outline-none focus:border-[var(--purple)]"
        style={{ borderColor: "var(--border)", color: "var(--text)" }} />
      <div className="flex gap-2">
        <input value={modelName} onChange={(e) => setModelName(e.target.value)} placeholder="Nama model game"
          className="flex-1 rounded-lg border bg-transparent px-3 py-2 text-[0.78rem] outline-none focus:border-[var(--purple)]"
          style={{ borderColor: "var(--border)", color: "var(--text)" }} />
        <select value={provider} onChange={(e) => setProvider(e.target.value)}
          className="rounded-lg border bg-transparent px-2 text-[0.74rem] outline-none"
          style={{ borderColor: "var(--border)", color: "var(--text)", background: "var(--card-solid)" }}>
          {PROVIDERS.map((p) => <option key={p.v} value={p.v}>{p.l}</option>)}
        </select>
      </div>
      <button disabled={busy} type="submit"
        className="flex items-center justify-center gap-2 rounded-lg py-2 text-[0.76rem] font-bold text-black transition-transform hover:scale-[1.02] disabled:opacity-50"
        style={{ background: "var(--acc-grad)" }}>
        <Plus size={14} /> Tambah Kode
      </button>
    </form>
  );
}