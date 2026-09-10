import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Search, RotateCcw, ClipboardCheck, Lock, Smartphone, CheckCircle2, AlertTriangle, History, ShieldCheck, BookOpen, Gauge } from "lucide-react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import PageHead from "@/components/dashboard/PageHead";
import { useRole } from "@/lib/permissions";
import { getSession } from "@/lib/dashboardAuth";
import { PHONE_CATEGORIES, CATEGORY_MAP } from "@/lib/phoneCategories";
import { PHONE_SHIFTS, SHIFT_MAP, todayKey, currentShift, isChecked, fmtDateID } from "@/lib/phoneShifts";
import PhoneDeviceFormModal from "@/components/phoneCheck/PhoneDeviceFormModal";
import PhoneDeviceList from "@/components/phoneCheck/PhoneDeviceList";
import PhoneCheckHistory from "@/components/phoneCheck/PhoneCheckHistory";
import ShiftDateBar from "@/components/phoneCheck/ShiftDateBar";
import SaveSessionModal from "@/components/phoneCheck/SaveSessionModal";
import ShiftIssuePanel from "@/components/phoneCheck/ShiftIssuePanel";
import PhoneCheckGuide from "@/components/phoneCheck/PhoneCheckGuide";
import TurnoverCheckPanel from "@/components/phoneCheck/TurnoverCheckPanel";

const ALLOWED_ROLES = ["super_master", "kapten", "kasir"];
const MANAGER_ROLES = ["super_master", "kapten"];

export default function PhoneCheck() {
  const role = useRole();
  const me = getSession();
  const allowed = ALLOWED_ROLES.includes(role.key);
  const canManage = MANAGER_ROLES.includes(role.key);

  const [view, setView] = useState("check"); // check | history
  const [devices, setDevices] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("wd");
  const [q, setQ] = useState("");
  const [modal, setModal] = useState(null);
  const [saveOpen, setSaveOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const [date, setDate] = useState(todayKey());
  const [shift, setShift] = useState(currentShift());

  // Menyimpan perubahan centang yang baru saja dikirim ke server (per device id).
  // Event realtime dari update kita sendiri kadang membawa data lama sesaat —
  // pending ini menjaga tampilan tetap sesuai klik terakhir agar tidak "hilang sendiri".
  const pendingRef = useRef({});

  const load = async () => {
    try {
      const [d, l] = await Promise.all([
        base44.entities.PhoneDevice.list("category", 1000),
        base44.entities.PhoneCheckLog.list("-created_date", 200),
      ]);
      const now = Date.now();
      const merged = (d || []).map((dev) => {
        const p = pendingRef.current[dev.id];
        if (p && p.expires > now) return { ...dev, check_date: p.check_date, check_shifts: p.check_shifts, crosscheck: p.crosscheck };
        return dev;
      });
      setDevices(merged);
      setLogs(l || []);
    } catch { setDevices([]); setLogs([]); }
    setLoading(false);
  };

  useEffect(() => {
    if (!allowed) { setLoading(false); return; }
    load();
    let u1, u2;
    try { u1 = base44.entities.PhoneDevice.subscribe(load); } catch { u1 = () => {}; }
    try { u2 = base44.entities.PhoneCheckLog.subscribe(load); } catch { u2 = () => {}; }
    return () => { u1(); u2(); };
  }, [allowed]);

  const active = useMemo(() => devices.filter((d) => d.category !== "returned"), [devices]);
  const on = (d) => isChecked(d, date, shift);
  const okAll = active.filter(on).length;
  const missingAll = active.length - okAll;

  const shiftStats = useMemo(() => {
    const s = {};
    PHONE_SHIFTS.forEach((sh) => {
      s[sh.key] = { total: active.length, ok: active.filter((d) => isChecked(d, date, sh.key)).length };
    });
    return s;
  }, [active, date]);

  const counts = useMemo(() => {
    const c = {};
    PHONE_CATEGORIES.forEach((cat) => {
      const list = devices.filter((d) => d.category === cat.key);
      c[cat.key] = { total: list.length, ok: list.filter(on).length };
    });
    return c;
  }, [devices, date, shift]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return devices
      .filter((d) => d.category === tab)
      .filter((d) => !s || `${d.label} ${d.bank || ""}`.toLowerCase().includes(s));
  }, [devices, tab, q]);

  const toggle = async (d) => {
    const same = d.check_date === date;
    const list = same ? d.check_shifts || [] : [];
    const next = list.includes(shift) ? list.filter((x) => x !== shift) : [...list, shift];
    const optimistic = { check_date: date, check_shifts: next, crosscheck: next.length > 0 };
    // Optimistic — UI berubah instan, sync ke server di belakang
    pendingRef.current[d.id] = { ...optimistic, expires: Date.now() + 4000 };
    setDevices((prev) => prev.map((x) => (x.id === d.id ? { ...x, ...optimistic } : x)));
    try {
      await base44.entities.PhoneDevice.update(d.id, optimistic);
      setTimeout(() => { delete pendingRef.current[d.id]; }, 1200);
    } catch {
      delete pendingRef.current[d.id];
      setDevices((prev) => prev.map((x) => (x.id === d.id ? d : x)));
      toast.error("Gagal memperbarui centang");
    }
  };

  const remove = async (d) => {
    if (!window.confirm(`Hapus "${d.label}" dari daftar HP?`)) return;
    try { await base44.entities.PhoneDevice.delete(d.id); toast.success("HP dihapus"); load(); }
    catch { toast.error("Gagal menghapus"); }
  };

  const resetChecks = async () => {
    if (!window.confirm(`Reset centang ${SHIFT_MAP[shift]?.label} tanggal ${fmtDateID(date)}?`)) return;
    setBusy(true);
    try {
      const targets = devices.filter((d) => isChecked(d, date, shift));
      if (targets.length) {
        await base44.entities.PhoneDevice.bulkUpdate(targets.map((d) => {
          const next = (d.check_shifts || []).filter((x) => x !== shift);
          return { id: d.id, check_shifts: next, crosscheck: next.length > 0 };
        }));
      }
      toast.success("Centang shift ini direset");
      load();
    } catch { toast.error("Gagal mereset centang"); }
    setBusy(false);
  };

  const fmtItem = (d) => (d.bank ? `${d.label} (${d.bank})` : d.label);

  const saveSession = async ({ staffName, note }) => {
    setBusy(true);
    try {
      await base44.entities.PhoneCheckLog.create({
        checked_at: new Date().toISOString(),
        check_date: date,
        shift,
        staff_name: staffName,
        staff_email: me?.email || "",
        staff_role: role.label,
        total: active.length,
        ok_count: okAll,
        missing_count: missingAll,
        checked_labels: active.filter(on).map(fmtItem),
        missing_labels: active.filter((d) => !on(d)).map(fmtItem),
        notes: note,
      });
      setSaveOpen(false);
      toast.success(`Riwayat ${sh?.label} tersimpan — petugas: ${staffName}`);
      setView("history");
      load();
    } catch (e) { toast.error("Gagal menyimpan riwayat", { description: e.message }); }
    setBusy(false);
  };

  if (!allowed) {
    return (
      <div className="w-full p-6">
        <div className="flex flex-col items-center justify-center rounded-2xl border p-16 text-center" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl" style={{ background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.3)" }}>
            <Lock size={28} style={{ color: "var(--coral)" }} />
          </div>
          <p className="text-[0.95rem] font-bold" style={{ color: "var(--text)" }}>Akses Ditolak</p>
          <p className="mt-1 text-[0.78rem]" style={{ color: "var(--text-3)" }}>Fitur Alat Kerja hanya untuk KASIR, KAPTEN, dan SUPER MASTER.</p>
        </div>
      </div>
    );
  }

  const cat = CATEGORY_MAP[tab];
  const sh = SHIFT_MAP[shift];

  return (
    <div className="w-full p-4 md:p-6">
      <PageHead icon="fa-mobile-screen-button" color="var(--green)" title="ALAT KERJA"
        subtitle="Cek HP Office & Cek Turnover · centang otomatis reset tiap ganti tanggal"
        badges={[
          { text: fmtDateID(date), color: "var(--acc)" },
          { text: sh?.label || "—", color: sh?.color || "var(--gold)" },
          { text: `${okAll}/${active.length} dicek`, color: missingAll ? "var(--coral)" : "var(--green)" },
        ]} />

      {/* View switcher — satu navigasi, dua halaman */}
      <div className="mb-4 flex gap-2">
        {[
          { key: "check", label: "Crosscheck HP", icon: ShieldCheck, color: "var(--green)" },
          { key: "turnover", label: "Cek Turnover", icon: Gauge, color: "var(--blue)" },
          { key: "issues", label: "Serah Terima Kendala", icon: AlertTriangle, color: "var(--coral)" },
          { key: "history", label: "Riwayat Crosscheck", icon: History, color: "var(--gold)" },
          { key: "guide", label: "Panduan & Hak Akses", icon: BookOpen, color: "var(--acc)" },
        ].map((v) => (
          <button key={v.key} onClick={() => setView(v.key)}
            className="flex items-center gap-2 rounded-xl border px-4 py-2.5 text-[0.78rem] font-bold transition-colors"
            style={view === v.key
              ? { background: `${v.color}1f`, color: v.color, borderColor: `${v.color}59` }
              : { background: "var(--card)", borderColor: "var(--border)", color: "var(--text-3)" }}>
            <v.icon size={15} /> {v.label}
            {v.key === "history" && <span className="rounded-full px-1.5 py-0.5 text-[0.58rem]" style={{ background: "var(--hover)" }}>{logs.length}</span>}
          </button>
        ))}
      </div>

      {view === "guide" ? (
        <PhoneCheckGuide />
      ) : view === "turnover" ? (
        <TurnoverCheckPanel />
      ) : view === "history" ? (
        <PhoneCheckHistory logs={logs} loading={loading} />
      ) : view === "issues" ? (
        <ShiftIssuePanel date={date} setDate={setDate} shift={shift} />
      ) : (
        <>
          <ShiftDateBar date={date} setDate={setDate} shift={shift} setShift={setShift} shiftStats={shiftStats} />

          {/* Summary */}
          <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              { icon: Smartphone, label: "Total HP Aktif", val: active.length, color: "var(--blue)" },
              { icon: CheckCircle2, label: `Dicek ${sh?.short || ""}`, val: okAll, color: "var(--green)" },
              { icon: AlertTriangle, label: "Belum Dicek", val: missingAll, color: "var(--coral)" },
              { icon: ClipboardCheck, label: "Sesi Tercatat", val: logs.length, color: "var(--gold)" },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl border p-4" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
                <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl" style={{ color: s.color, background: `${s.color}16`, border: `1px solid ${s.color}2e` }}>
                  <s.icon size={16} />
                </div>
                <div className="font-jb text-xl font-black" style={{ color: s.color }}>{s.val}</div>
                <div className="text-[0.64rem]" style={{ color: "var(--text-3)" }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Session bar */}
          <div className="mb-4 flex flex-wrap items-center gap-2.5 rounded-2xl border p-3.5" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            <div className="min-w-[200px] flex-1 text-[0.76rem]" style={{ color: "var(--text-3)" }}>
              Selesai mencentang? Simpan riwayat lalu isi <span style={{ color: "var(--text-2)", fontWeight: 600 }}>nama petugas {sh?.label}</span>.
            </div>
            <button onClick={() => setSaveOpen(true)} disabled={busy}
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-[0.76rem] font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #0F766E 0%, #14B8A6 100%)" }}>
              <ClipboardCheck size={15} /> Simpan Riwayat {sh?.short}
            </button>
            {canManage && (
              <button onClick={resetChecks} disabled={busy}
                className="flex items-center gap-2 rounded-xl border px-4 py-2.5 text-[0.76rem] font-bold disabled:opacity-60"
                style={{ borderColor: "var(--border)", color: "var(--text-2)", background: "var(--glass)" }}>
                <RotateCcw size={14} /> Reset Centang Shift Ini
              </button>
            )}
          </div>

          {/* Category tabs */}
          <div className="mb-4 flex flex-wrap gap-2">
            {PHONE_CATEGORIES.map((c) => {
              const act = tab === c.key;
              const st = counts[c.key] || { total: 0, ok: 0 };
              return (
                <button key={c.key} onClick={() => setTab(c.key)}
                  className="flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-[0.74rem] font-bold transition-colors"
                  style={act
                    ? { background: `${c.color}1f`, color: c.color, borderColor: `${c.color}59` }
                    : { background: "var(--card)", borderColor: "var(--border)", color: "var(--text-3)" }}>
                  {c.label}
                  <span className="rounded-full px-1.5 py-0.5 text-[0.56rem]" style={{ background: act ? `${c.color}30` : "var(--hover)" }}>{st.ok}/{st.total}</span>
                </button>
              );
            })}
          </div>

          {/* Toolbar */}
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2.5">
            <div className="relative w-full max-w-[300px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-3)" }} />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama HP / bank…"
                className="w-full rounded-xl border py-2.5 pl-9 pr-3 text-[0.8rem] outline-none focus:ring-2"
                style={{ background: "#FFFFFF", borderColor: "var(--border)", color: "#14213A", "--tw-ring-color": "rgba(var(--acc-rgb),0.25)" }} />
            </div>
            {canManage && (
              <button onClick={() => setModal({ new: true })}
                className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-[0.76rem] font-bold text-white"
                style={{ background: "var(--acc-grad)" }}>
                <Plus size={15} /> Tambah HP
              </button>
            )}
          </div>

          {/* List */}
          <motion.div key={`${tab}-${shift}-${date}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="overflow-hidden rounded-2xl border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            <div className="flex items-center gap-2 border-b px-4 py-3" style={{ borderColor: "var(--border)" }}>
              <span className="h-2 w-2 rounded-full" style={{ background: cat.color }} />
              <span className="text-[0.82rem] font-bold" style={{ color: "var(--text)" }}>{cat.label}</span>
              <span className="text-[0.68rem]" style={{ color: "var(--text-3)" }}>({filtered.length} data · {sh?.label})</span>
            </div>
            {loading ? (
              <div className="grid grid-cols-1 gap-2 p-3 md:grid-cols-3">{[...Array(6)].map((_, i) => <div key={i} className="skeleton h-14 rounded-xl" />)}</div>
            ) : (
              <PhoneDeviceList devices={filtered} color={cat.color} canManage={canManage} isOn={on}
                onToggle={toggle} onEdit={(d) => setModal({ device: d })} onDelete={remove} />
            )}
          </motion.div>
        </>
      )}

      <SaveSessionModal open={saveOpen} date={date} shift={shift} total={active.length} ok={okAll}
        missingLabels={active.filter((d) => !on(d)).map((d) => d.label)}
        defaultName={me?.name || me?.email || ""} busy={busy}
        onClose={() => setSaveOpen(false)} onSave={saveSession} />

      <PhoneDeviceFormModal open={!!modal} device={modal?.device} defaultCategory={tab}
        onClose={() => setModal(null)} onSaved={load} />
    </div>
  );
}