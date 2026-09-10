import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, Save } from "lucide-react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import { getSession } from "@/lib/dashboardAuth";
import { PHONE_CATEGORIES } from "@/lib/phoneCategories";

const inputStyle = {
  background: "#FFFFFF",
  borderColor: "var(--border)",
  color: "#14213A",
  "--tw-ring-color": "rgba(var(--acc-rgb),0.25)",
};

export default function PhoneDeviceFormModal({ open, device, defaultCategory = "wd", onClose, onSaved }) {
  const me = getSession();
  const [form, setForm] = useState({
    label: device?.label || "",
    bank: device?.bank || "",
    category: device?.category || defaultCategory,
    notes: device?.notes || "",
  });
  const [busy, setBusy] = useState(false);

  if (!open) return null;

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.label.trim()) { toast.error("Nama HP wajib diisi"); return; }
    setBusy(true);
    try {
      const payload = {
        label: form.label.trim(),
        bank: form.bank.trim(),
        category: form.category,
        notes: form.notes.trim(),
      };
      if (device?.id) await base44.entities.PhoneDevice.update(device.id, payload);
      else await base44.entities.PhoneDevice.create({ ...payload, crosscheck: false, creator_name: me?.name || "", creator_email: me?.email || "" });
      toast.success(device?.id ? "Data HP diperbarui" : "HP baru ditambahkan");
      onSaved?.();
      onClose();
    } catch (e) {
      toast.error("Gagal menyimpan", { description: e.message });
    }
    setBusy(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)" }} onClick={onClose}>
      <motion.div initial={{ scale: 0.94, y: 16, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md overflow-hidden rounded-2xl border"
        style={{ background: "var(--card-solid)", borderColor: "var(--border)" }}>
        <div className="flex items-center justify-between border-b p-4" style={{ borderColor: "var(--border)" }}>
          <h3 className="text-[0.92rem] font-bold" style={{ color: "var(--text)" }}>{device?.id ? "Edit Data HP" : "Tambah HP Baru"}</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-[var(--hover)]"><X size={18} style={{ color: "var(--text-2)" }} /></button>
        </div>

        <div className="space-y-3 p-4">
          <div>
            <label className="mb-1 block text-[0.68rem] font-semibold uppercase tracking-wide" style={{ color: "var(--text-3)" }}>Nama / Identitas HP</label>
            <input value={form.label} onChange={(e) => set("label", e.target.value)} placeholder="WD BCA / RATNASARI"
              className="w-full rounded-xl border px-3 py-3 text-[0.84rem] outline-none focus:ring-2" style={inputStyle} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-[0.68rem] font-semibold uppercase tracking-wide" style={{ color: "var(--text-3)" }}>Bank</label>
              <input value={form.bank} onChange={(e) => set("bank", e.target.value)} placeholder="BCA"
                className="w-full rounded-xl border px-3 py-3 text-[0.84rem] outline-none focus:ring-2" style={inputStyle} />
            </div>
            <div>
              <label className="mb-1 block text-[0.68rem] font-semibold uppercase tracking-wide" style={{ color: "var(--text-3)" }}>Kategori</label>
              <select value={form.category} onChange={(e) => set("category", e.target.value)}
                className="w-full rounded-xl border px-3 py-3 text-[0.84rem] outline-none focus:ring-2" style={inputStyle}>
                {PHONE_CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-[0.68rem] font-semibold uppercase tracking-wide" style={{ color: "var(--text-3)" }}>Catatan</label>
            <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={2} placeholder="Opsional"
              className="w-full resize-none rounded-xl border px-3 py-3 text-[0.84rem] outline-none focus:ring-2" style={inputStyle} />
          </div>
        </div>

        <div className="flex gap-2 border-t p-4" style={{ borderColor: "var(--border)" }}>
          <button onClick={onClose} className="flex-1 rounded-xl border py-2.5 text-[0.78rem] font-bold" style={{ borderColor: "var(--border)", color: "var(--text-2)" }}>Batal</button>
          <button onClick={save} disabled={busy}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-[0.78rem] font-bold text-white disabled:opacity-60"
            style={{ background: "var(--acc-grad)" }}>
            <Save size={14} /> {busy ? "Menyimpan…" : "Simpan"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}