import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Gamepad2 } from "lucide-react";

export default function CodeMatchResult({ code, matches }) {
  const found = matches.length > 0;
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="mt-4 rounded-xl border p-4"
      style={{ background: found ? "rgba(16,185,129,0.06)" : "rgba(239,68,68,0.06)", borderColor: found ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)" }}>
      <div className="mb-3 flex items-center gap-2">
        {found ? <CheckCircle2 size={16} style={{ color: "var(--green)" }} /> : <XCircle size={16} style={{ color: "var(--coral)" }} />}
        <span className="text-[0.78rem] font-bold" style={{ color: found ? "var(--green)" : "var(--coral)" }}>
          {found ? `${matches.length} Model Cocok Ditemukan` : "Tidak Ada Model Cocok"}
        </span>
      </div>
      <div className="mb-3 rounded-lg border p-2.5 font-jb text-[0.72rem]" style={{ borderColor: "var(--border)", background: "var(--glass)", color: "var(--text-2)" }}>
        Kode Terbaca: <span className="font-bold" style={{ color: "var(--text)" }}>{code || "-"}</span>
      </div>
      {found && (
        <div className="space-y-2">
          {matches.map((m) => (
            <div key={m.id} className="flex items-center gap-3 rounded-lg border p-3" style={{ borderColor: "var(--border)", background: "var(--card-solid)" }}>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: "rgba(139,92,246,0.14)", color: "var(--purple)" }}>
                <Gamepad2 size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[0.8rem] font-bold" style={{ color: "var(--text)" }}>{m.model_name}</div>
                <div className="text-[0.62rem] uppercase" style={{ color: "var(--text-3)" }}>{m.provider}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}