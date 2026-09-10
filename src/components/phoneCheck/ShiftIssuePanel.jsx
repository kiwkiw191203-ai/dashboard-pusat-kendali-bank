import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Check, Trash2, AlertTriangle, CheckCircle2, ArrowRightLeft } from "lucide-react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import { getSession } from "@/lib/dashboardAuth";
import { PHONE_SHIFTS, SHIFT_MAP, fmtDateID } from "@/lib/phoneShifts";

const field = { background: "#FFFFFF", borderColor: "var(--border)", color: "#14213A" };

export default function ShiftIssuePanel({ date, setDate, shift }) {
  const me = getSession();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterShift, setFilterShift] = useState("all");
  const [form, setForm] = useState({ title: "", detail: "", handover_to: "", shift });
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try { setIssues(await base44.entities.ShiftIssue.list("-created_date", 300)); }
    catch { setIssues([]); }
    setLoading(false);
  };

  useEffect(() => {
    load();
    let u;
    try { u = base44.entities.ShiftIssue.subscribe(load); } catch { u = () => {}; }
    return () => u();
  }, []);

  const list = useMemo(() => issues
    .filter((i) => i.issue_date === date)
    .filter((i) => filterShift === "all" || i.shift === filterShift), [issues, date, filterShift]);

  const openCount = list.filter((i) => i.status !== "done").length;

  const add = async () => {
    if (!form.title.trim()) { toast.error("Judul kendala wajib diisi"); return; }
    setBusy(true);
    try {
      await base44.entities.ShiftIssue.create({
        issue_date: date, shift: form.shift, title: form.title.trim(),
        detail: form.detail.trim(), handover_to: form.handover_to.trim(), status: "open",
        creator_name: me?.name || me?.email || "", creator_email: me?.email || "",
      });
      setForm({ title: "", detail: "", handover_to: "", shift: form.shift });
      toast.success("Kendala dicatat");
      load();
    } catch (e) { toast.error("Gagal menyimpan kendala", { description: e.message }); }
    setBusy(false);
  };

  const resolve = async (i) => {
    const done = i.status === "done";
    setIssues((prev) => prev.map((x) => (x.id === i.id ? { ...x, status: done ? "open" : "done" } : x)));
    try {
      await base44.entities.ShiftIssue.update(i.id, done
        ? { status: "open", resolved_at: null, resolved_by: "" }
        : { status: "done", resolved_at: new Date().toISOString(), resolved_by: me?.name || me?.email || "" });
    } catch { setIssues((prev) => prev.map((x) => (x.id === i.id ? i : x))); toast.error("Gagal memperbarui status"); }
  };

  const remove = async (i) => {
    if (!window.confirm(`Hapus kendala "${i.title}"?`)) return;
    try { await base44.entities.ShiftIssue.delete(i.id); load(); }
    catch { toast.error("Gagal menghapus"); }
  };

  return (
    <div className="space-y-4">
      {/* Filter tanggal & shift */}
      <div className="flex flex-wrap items-center gap-2.5 rounded-2xl border p-3.5" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        <span className="stat-caps text-[0.62rem]" style={{ color: "var(--text-3)" }}>Tanggal</span>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
          className="rounded-xl border px-3 py-2 text-[0.8rem] outline-none" style={field} />
        {[{ key: "all", label: "Semua Shift", color: "var(--acc)" }, ...PHONE_SHIFTS].map((s) => (
          <button key={s.key} onClick={() => setFilterShift(s.key)}
            className="rounded-xl border px-3.5 py-2 text-[0.74rem] font-medium"
            style={filterShift === s.key
              ? { background: `${s.color}1f`, color: s.color, borderColor: `${s.color}59` }
              : { background: "var(--glass)", borderColor: "var(--border)", color: "var(--text-3)" }}>
            {s.label}
          </button>
        ))}
        <span className="ml-auto text-[0.72rem]" style={{ color: openCount ? "var(--coral)" : "var(--green)" }}>
          {openCount ? `${openCount} kendala belum selesai` : "Semua kendala selesai"}
        </span>
      </div>

      {/* Form catat kendala */}
      <div className="rounded-2xl border p-4" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        <div className="label-caps mb-3 text-[0.64rem]" style={{ color: "var(--text-3)" }}>Catat Kendala · {fmtDateID(date)}</div>
        <div className="grid gap-2.5 md:grid-cols-4">
          <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Judul kendala…"
            className="rounded-xl border px-3 py-2.5 text-[0.82rem] outline-none md:col-span-2" style={field} />
          <select value={form.shift} onChange={(e) => setForm((f) => ({ ...f, shift: e.target.value }))}
            className="rounded-xl border px-3 py-2.5 text-[0.82rem] outline-none" style={field}>
            {PHONE_SHIFTS.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
          <input value={form.handover_to} onChange={(e) => setForm((f) => ({ ...f, handover_to: e.target.value }))} placeholder="Diserahkan ke…"
            className="rounded-xl border px-3 py-2.5 text-[0.82rem] outline-none" style={field} />
          <textarea value={form.detail} onChange={(e) => setForm((f) => ({ ...f, detail: e.target.value }))} rows={2} placeholder="Detail kendala / serah terima…"
            className="resize-none rounded-xl border px-3 py-2.5 text-[0.82rem] outline-none md:col-span-3" style={field} />
          <button onClick={add} disabled={busy}
            className="flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[0.78rem] font-semibold text-white disabled:opacity-60"
            style={{ background: "var(--acc-grad)" }}>
            <Plus size={15} /> Tambah Kendala
          </button>
        </div>
      </div>

      {/* Daftar kendala */}
      {loading ? (
        <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-16 rounded-2xl" />)}</div>
      ) : list.length === 0 ? (
        <div className="rounded-2xl border p-12 text-center" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <CheckCircle2 size={26} className="mx-auto mb-2" style={{ color: "var(--green)" }} />
          <p className="text-[0.8rem]" style={{ color: "var(--text-3)" }}>Tidak ada kendala pada {fmtDateID(date)}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {list.map((i) => {
            const sh = SHIFT_MAP[i.shift];
            const done = i.status === "done";
            return (
              <motion.div key={i.id} layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                className="flex flex-wrap items-start gap-3 rounded-2xl border p-4"
                style={{ background: "var(--card)", borderColor: done ? "rgba(16,185,129,0.3)" : "var(--border)" }}>
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl"
                  style={{ color: done ? "var(--green)" : "var(--coral)", background: done ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.1)" }}>
                  {done ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                </div>
                <div className="min-w-[200px] flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[0.85rem] font-semibold" style={{ color: "var(--text)", textDecoration: done ? "line-through" : "none" }}>{i.title}</span>
                    <span className="rounded-full px-2 py-0.5 text-[0.6rem] font-medium" style={{ color: sh?.color, background: `${sh?.color || "#888"}1f` }}>{sh?.label || i.shift}</span>
                  </div>
                  {i.detail && <p className="mt-1 text-[0.76rem] leading-relaxed" style={{ color: "var(--text-2)" }}>{i.detail}</p>}
                  <div className="mt-1.5 flex flex-wrap items-center gap-3 text-[0.66rem]" style={{ color: "var(--text-3)" }}>
                    <span>Dilaporkan: {i.creator_name || "—"}</span>
                    {i.handover_to && <span className="flex items-center gap-1"><ArrowRightLeft size={10} /> {i.handover_to}</span>}
                    {done && i.resolved_by && <span style={{ color: "var(--green)" }}>Selesai oleh {i.resolved_by}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => resolve(i)}
                    className="flex items-center gap-1.5 rounded-xl border px-3 py-2 text-[0.72rem] font-semibold transition-colors"
                    style={done
                      ? { borderColor: "var(--border)", color: "var(--text-3)", background: "var(--glass)" }
                      : { borderColor: "rgba(16,185,129,0.45)", color: "var(--green)", background: "rgba(16,185,129,0.1)" }}>
                    <Check size={13} /> {done ? "Buka Lagi" : "Kendala Selesai"}
                  </button>
                  <button onClick={() => remove(i)} className="rounded-xl border p-2" style={{ borderColor: "var(--border)", color: "var(--coral)" }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}