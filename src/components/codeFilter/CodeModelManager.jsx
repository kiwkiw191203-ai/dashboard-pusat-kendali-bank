import React from "react";
import { Database } from "lucide-react";
import CodeModelForm from "./CodeModelForm";
import CodeModelList from "./CodeModelList";

export default function CodeModelManager({ models, onChange }) {
  return (
    <div className="ds-in rounded-2xl border p-5" style={{ background: "var(--card)", borderColor: "var(--border)", animationDelay: ".1s" }}>
      <div className="mb-4 flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg text-xs" style={{ background: "rgba(139,92,246,0.14)", color: "var(--purple)", border: "1px solid rgba(139,92,246,0.3)" }}>
          <Database size={15} />
        </div>
        <h3 className="text-[0.82rem] font-semibold" style={{ color: "var(--text-2)" }}>Database Kode Model</h3>
      </div>
      <CodeModelForm onAdded={onChange} />
      <CodeModelList models={models} onChange={onChange} />
    </div>
  );
}