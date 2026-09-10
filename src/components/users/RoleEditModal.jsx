import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Crown, UserCog, Check, Anchor, Calculator } from "lucide-react";
import { ROLES } from "@/lib/permissions";

const ROLE_ORDER = ["super_master", "kapten", "kasir", "cs"];
const ROLE_ICONS = { super_master: Crown, kapten: Anchor, kasir: Calculator, cs: UserCog };

export default function RoleEditModal({ user, myRole, onClose, onSave }) {
  const [selected, setSelected] = useState(ROLES[user.role] ? user.role : "cs");
  const [saving, setSaving] = useState(false);
  const myLevel = myRole.level;

  const canEdit = (key) => {
    const target = ROLES[key];
    if (!target) return false;
    // Can only assign roles strictly below your own level
    return target.level < myLevel;
  };

  const handleSave = async () => {
    if (selected === user.role) { onClose(); return; }
    setSaving(true);
    try { await onSave(selected); } catch { /* handled by parent */ }
    setSaving(false);
  };

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}
        onClick={onClose}>
        <motion.div initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 20 }}
          transition={{ type: "spring", damping: 24, stiffness: 280 }}
          className="w-full max-w-md overflow-hidden rounded-2xl border"
          style={{ background: "var(--card-solid)", borderColor: "var(--border)" }}
          onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between border-b p-4" style={{ borderColor: "var(--border)" }}>
            <div>
              <h3 className="text-[0.92rem] font-bold" style={{ color: "var(--text)" }}>Ubah Role User</h3>
              <p className="mt-0.5 truncate text-[0.7rem]" style={{ color: "var(--text-3)" }}>{user.email}</p>
            </div>
            <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-[var(--hover)]"><X size={18} style={{ color: "var(--text-2)" }} /></button>
          </div>

          <div className="p-4 space-y-2">
            {ROLE_ORDER.map((key) => {
              const role = ROLES[key];
              const RIcon = ROLE_ICONS[key];
              const editable = canEdit(key);
              const active = selected === key;
              return (
                <button key={key} disabled={!editable} onClick={() => setSelected(key)}
                  className="flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all disabled:cursor-not-allowed disabled:opacity-35"
                  style={{
                    borderColor: active ? role.color : "var(--border)",
                    background: active ? `${role.color}14` : "var(--glass)",
                    boxShadow: active ? `0 0 14px ${role.color}22` : "none",
                  }}>
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg"
                    style={{ background: `${role.color}18`, color: role.color }}>
                    <RIcon size={16} />
                  </div>
                  <div className="flex-1">
                    <div className="text-[0.82rem] font-bold" style={{ color: "var(--text)" }}>{role.label}</div>
                    <div className="text-[0.62rem]" style={{ color: "var(--text-3)" }}>Level {role.level}</div>
                  </div>
                  {active && <Check size={16} style={{ color: role.color }} />}
                  {!editable && !active && <span className="text-[0.55rem] font-semibold" style={{ color: "var(--text-3)" }}>Tidak bisa diatur</span>}
                </button>
              );
            })}
            <p className="pt-1 text-[0.62rem]" style={{ color: "var(--text-3)" }}>
              Anda hanya bisa mengatur role di bawah level Anda ({myRole.label}).
            </p>
          </div>

          <div className="flex gap-2 border-t p-4" style={{ borderColor: "var(--border)" }}>
            <button onClick={onClose}
              className="flex-1 rounded-xl border py-2.5 text-[0.78rem] font-bold transition-colors hover:bg-[var(--hover)]"
              style={{ borderColor: "var(--border)", color: "var(--text-2)" }}>Batal</button>
            <button onClick={handleSave} disabled={saving}
              className="flex-1 rounded-xl py-2.5 text-[0.78rem] font-bold transition-transform hover:scale-[1.02] disabled:opacity-60"
              style={{ background: "var(--acc-grad)", color: "#000" }}>
              {saving ? "Menyimpan…" : "Simpan"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}