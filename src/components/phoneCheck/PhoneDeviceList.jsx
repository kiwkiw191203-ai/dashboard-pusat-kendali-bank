import React from "react";
import { motion } from "framer-motion";
import { Check, Pencil, Trash2, Smartphone } from "lucide-react";

export default function PhoneDeviceList({ devices, color, onToggle, onEdit, onDelete, canManage, isOn = (d) => !!d.crosscheck }) {
  if (devices.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-14" style={{ color: "var(--text-3)" }}>
        <Smartphone size={26} />
        <p className="text-[0.8rem]">Belum ada data HP di kategori ini</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-2 p-3 md:grid-cols-2 xl:grid-cols-3">
      {devices.map((d, i) => {
        const on = isOn(d);
        return (
          <motion.div key={d.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i, 20) * 0.015 }}
            className="flex items-center gap-2.5 rounded-xl border p-2.5"
            style={{ background: on ? `${color}0f` : "var(--glass)", borderColor: on ? `${color}44` : "var(--border)" }}>
            <button onClick={() => onToggle(d)}
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg transition-transform hover:scale-105"
              style={{ background: on ? color : "var(--hover)", border: `1px solid ${on ? color : "var(--border)"}`, color: on ? "#fff" : "var(--text-3)" }}
              title={on ? "Sudah dicek" : "Tandai sudah dicek"}>
              <Check size={15} />
            </button>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[0.78rem] font-semibold" style={{ color: "var(--text)" }}>{d.label}</div>
              <div className="truncate text-[0.62rem]" style={{ color: "var(--text-3)" }}>{d.bank || "—"}{d.notes ? ` · ${d.notes}` : ""}</div>
            </div>
            {canManage && (
              <div className="flex flex-shrink-0 gap-1">
                <button onClick={() => onEdit(d)} className="rounded-lg p-1.5 hover:bg-[var(--hover)]" title="Edit"><Pencil size={13} style={{ color: "var(--blue)" }} /></button>
                <button onClick={() => onDelete(d)} className="rounded-lg p-1.5 hover:bg-[var(--hover)]" title="Hapus"><Trash2 size={13} style={{ color: "var(--coral)" }} /></button>
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}