import React, { useState } from "react";
import { X, Loader2, Upload } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";

export default function ArchiveFormModal({ editing, onClose, onSaved, creator }) {
  const isNew = editing?.new;
  const [form, setForm] = useState({
    title: editing?.title || "",
    description: editing?.description || "",
    solution: editing?.solution || "",
    screenshot_link: editing?.screenshot_link || "",
    screenshot_url: editing?.screenshot_url || "",
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setForm((f) => ({ ...f, screenshot_url: file_url }));
    } catch { toast.error("Gagal mengupload screenshot"); }
    setUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error("Judul kesalahan wajib diisi"); return; }
    setSaving(true);
    try {
      if (isNew) {
        await base44.entities.ChatMistakeArchive.create({ ...form, creator_name: creator?.full_name || "", creator_email: creator?.email || "" });
        toast.success("Arsip kesalahan disimpan");
      } else {
        await base44.entities.ChatMistakeArchive.update(editing.id, form);
        toast.success("Arsip diperbarui");
      }
      onSaved();
    } catch { toast.error("Gagal menyimpan arsip"); }
    setSaving(false);
  };

  const inputCls = "w-full rounded-xl border bg-transparent px-3.5 py-2.5 text-[0.82rem] outline-none focus:border-[var(--acc)]";
  const inputStyle = { background: "var(--card)", borderColor: "var(--border)", color: "var(--text)" };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[560px] overflow-hidden rounded-2xl border" style={{ background: "var(--card-solid)", borderColor: "var(--border)" }}>
        <div className="flex items-center justify-between border-b px-5 py-3.5" style={{ borderColor: "var(--border)" }}>
          <h3 className="text-[0.92rem] font-bold" style={{ color: "var(--text)" }}>{isNew ? "Arsip Kesalahan Baru" : "Edit Arsip"}</h3>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-[var(--hover)]" style={{ color: "var(--text-2)" }}><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit} className="ds-scroll max-h-[70vh] space-y-3 overflow-y-auto p-5">
          <input value={form.title} onChange={set("title")} placeholder="Judul kesalahan" className={inputCls} style={inputStyle} />
          <textarea value={form.description} onChange={set("description")} placeholder="Keterangan kesalahan" rows={3} className={`${inputCls} ds-scroll`} style={inputStyle} />
          <textarea value={form.solution} onChange={set("solution")} placeholder="Solusi / tindak lanjut" rows={3} className={`${inputCls} ds-scroll`} style={inputStyle} />
          <input value={form.screenshot_link} onChange={set("screenshot_link")} placeholder="Link screenshot (opsional)" className={inputCls} style={inputStyle} />
          <label className="flex cursor-pointer items-center gap-2 rounded-xl border px-3.5 py-2.5 text-[0.78rem]" style={inputStyle}>
            {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
            <span className="truncate">{form.screenshot_url ? "Screenshot terlampir ✓" : "Upload screenshot…"}</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
          </label>
          <div className="flex justify-end gap-2.5 pt-2">
            <button type="button" onClick={onClose} className="rounded-xl border px-4 py-2 text-[0.82rem] font-medium" style={{ borderColor: "var(--border)", color: "var(--text-2)" }}>Batal</button>
            <button type="submit" disabled={saving || uploading} className="rounded-xl px-5 py-2 text-[0.82rem] font-semibold text-black disabled:opacity-60" style={{ background: "var(--acc-grad)" }}>
              {saving ? "Menyimpan…" : "Simpan"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}