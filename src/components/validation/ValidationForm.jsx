import React, { useState } from "react";
import { Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "valid", label: "Valid" },
  { value: "invalid", label: "Tidak Valid" },
];

const EMPTY = { bank_name: "", account_number: "", account_holder: "", status: "pending", notes: "" };

export default function ValidationForm({ onSaved }) {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.bank_name || !form.account_number) {
      toast.error("Nama Bank dan Nomor Rekening wajib diisi");
      return;
    }
    setSaving(true);
    try {
      await base44.entities.AccountValidation.create(form);
      toast.success("Validasi rekening tersimpan");
      setForm(EMPTY);
      onSaved?.();
    } catch {
      toast.error("Gagal menyimpan validasi");
    }
    setSaving(false);
  };

  const inputCls = "w-full rounded-lg border px-3 py-2 text-[0.8rem] outline-none";
  const inputStyle = { background: "var(--glass)", borderColor: "var(--border)", color: "var(--text)" };

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border p-4" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
      <div className="mb-3 text-[0.86rem] font-bold" style={{ color: "var(--text)" }}>Tambah Validasi Rekening</div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-[0.68rem] font-semibold" style={{ color: "var(--text-3)" }}>Nama Bank</label>
          <input value={form.bank_name} onChange={set("bank_name")} placeholder="contoh: BCA / DANA" className={inputCls} style={inputStyle} />
        </div>
        <div>
          <label className="mb-1 block text-[0.68rem] font-semibold" style={{ color: "var(--text-3)" }}>Nomor Rekening</label>
          <input value={form.account_number} onChange={set("account_number")} className={inputCls} style={inputStyle} />
        </div>
        <div>
          <label className="mb-1 block text-[0.68rem] font-semibold" style={{ color: "var(--text-3)" }}>Nama Pemilik (Opsional)</label>
          <input value={form.account_holder} onChange={set("account_holder")} className={inputCls} style={inputStyle} />
        </div>
        <div>
          <label className="mb-1 block text-[0.68rem] font-semibold" style={{ color: "var(--text-3)" }}>Status</label>
          <select value={form.status} onChange={set("status")} className={inputCls} style={inputStyle}>
            {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-[0.68rem] font-semibold" style={{ color: "var(--text-3)" }}>Catatan</label>
          <textarea value={form.notes} onChange={set("notes")} rows={2} className={inputCls} style={inputStyle} />
        </div>
      </div>
      <button type="submit" disabled={saving}
        className="mt-4 flex items-center gap-2 rounded-xl px-4 py-2.5 text-[0.78rem] font-bold text-black transition-transform hover:scale-[1.02] disabled:opacity-60"
        style={{ background: "var(--acc-grad)" }}>
        {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
        {saving ? "Menyimpan…" : "Simpan"}
      </button>
    </form>
  );
}