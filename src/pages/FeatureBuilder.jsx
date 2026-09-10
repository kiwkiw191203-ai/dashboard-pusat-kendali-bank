import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Edit3, X, Upload, Eye, EyeOff, ChevronUp, ChevronDown, Lock } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import PageHead from "@/components/dashboard/PageHead";
import { getRole, canManageFeatures, ROLES } from "@/lib/permissions";
import { ICON_NAMES, getIcon } from "@/lib/featureIcons";

const COLORS = ["var(--acc)", "var(--blue)", "var(--green)", "var(--violet)", "var(--coral)", "var(--teal)", "var(--purple)", "var(--cyan)"];

function FeatureCard({ f, i, Icon, onEdit, onRemove, onMove, onToggleHidden }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <motion.div {...{ initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3, delay: i * 0.03 } }}
      className="overflow-hidden rounded-2xl border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
      {/* Header always visible */}
      <div className="flex items-center gap-2.5 p-3 cursor-pointer hover:bg-[var(--hover)] transition-colors"
        onClick={() => setCollapsed((v) => !v)}>
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl"
          style={{ color: f.icon_color || "var(--acc)", background: `${f.icon_color || "var(--acc)"}14` }}>
          <Icon size={17} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[0.84rem] font-bold" style={{ color: "var(--text)" }}>{f.name}</div>
          <div className="truncate font-mono text-[0.6rem]" style={{ color: "var(--text-3)" }}>/feature/{f.slug}</div>
        </div>
        <div className="flex flex-shrink-0 items-center gap-1.5">
          {f.hidden && <span className="rounded-full px-2 py-0.5 text-[0.52rem] font-bold" style={{ background: "rgba(90,97,114,0.18)", color: "var(--text-3)" }}>HIDDEN</span>}
          <span style={{ color: "var(--text-3)" }}>{collapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}</span>
        </div>
      </div>

      {/* Collapsible body */}
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }} style={{ overflow: "hidden" }}>
            <div className="border-t" style={{ borderColor: "var(--border)" }}>
              {/* Banner */}
              <div className="relative h-20">
                {f.banner_url ? <img src={f.banner_url} alt="" className="h-full w-full object-cover" /> : <div className="h-full w-full" style={{ background: "linear-gradient(120deg, var(--bg-2), rgba(var(--acc-rgb),0.18))" }} />}
                <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 30%, var(--card) 100%)" }} />
              </div>
              <div className="px-4 pb-4 pt-2">
                <p className="line-clamp-2 text-[0.74rem]" style={{ color: "var(--text-2)" }}>{f.description || "—"}</p>
                <div className="mt-3 flex items-center justify-between border-t pt-2.5" style={{ borderColor: "var(--border)" }}>
                  <div className="flex items-center gap-1">
                    <button onClick={(e) => { e.stopPropagation(); onMove(f, -1); }} className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-[var(--hover)]" style={{ color: "var(--text-3)" }}><ChevronUp size={14} /></button>
                    <button onClick={(e) => { e.stopPropagation(); onMove(f, 1); }} className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-[var(--hover)]" style={{ color: "var(--text-3)" }}><ChevronDown size={14} /></button>
                    <button onClick={(e) => { e.stopPropagation(); onToggleHidden(f); }} className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-[var(--hover)]" style={{ color: f.hidden ? "var(--text-3)" : "var(--green)" }}>{f.hidden ? <EyeOff size={14} /> : <Eye size={14} />}</button>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={(e) => { e.stopPropagation(); onEdit(f); }} className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-[var(--hover)]" style={{ color: "var(--text-2)" }}><Edit3 size={13} /></button>
                    <button onClick={(e) => { e.stopPropagation(); onRemove(f); }} className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-[var(--hover)]" style={{ color: "var(--coral)" }}><Trash2 size={13} /></button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
const ROLE_KEYS = Object.keys(ROLES);

const slugify = (s) => String(s).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const fade = (i = 0) => ({ initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3, delay: i * 0.03 } });

export default function FeatureBuilder() {
  const role = getRole();
  const can = canManageFeatures(role);
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm());

  function emptyForm() {
    return { name: "", slug: "", icon: "Rocket", icon_color: COLORS[0], banner_url: "", background_url: "", description: "", shortcuts: "", visible_roles: ["super_master", "master"], order: 0, hidden: false };
  }

  const load = async () => {
    setLoading(true);
    try { setFeatures(await base44.entities.CustomFeature.list("order", 200)); } catch { setFeatures([]); }
    setLoading(false);
  };
  useEffect(() => {
    load();
    let u; try { u = base44.entities.CustomFeature.subscribe(load); } catch { u = () => {}; }
    return () => u();
  }, []);

  const openNew = () => { setEditing({ new: true }); setForm(emptyForm()); };
  const openEdit = (f) => {
    setEditing(f);
    setForm({ name: f.name || "", slug: f.slug || "", icon: f.icon || "Rocket", icon_color: f.icon_color || COLORS[0], banner_url: f.banner_url || "", background_url: f.background_url || "", description: f.description || "", shortcuts: (f.shortcuts || []).join("\n"), visible_roles: f.visible_roles?.length ? f.visible_roles : ROLE_KEYS, order: f.order || 0, hidden: !!f.hidden });
  };

  const upload = async (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setForm((f) => ({ ...f, [field]: file_url }));
      toast.success("Gambar diunggah");
    } catch { toast.error("Gagal mengunggah"); }
  };

  const save = async () => {
    if (!form.name.trim()) { toast.error("Nama fitur wajib diisi"); return; }
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      slug: form.slug?.trim() || slugify(form.name),
      icon: form.icon,
      icon_color: form.icon_color,
      banner_url: form.banner_url,
      background_url: form.background_url,
      description: form.description.trim(),
      shortcuts: form.shortcuts.split("\n").map((s) => s.trim()).filter(Boolean),
      visible_roles: form.visible_roles,
      order: Number(form.order) || 0,
      hidden: form.hidden,
    };
    try {
      if (editing?.new) await base44.entities.CustomFeature.create(payload);
      else await base44.entities.CustomFeature.update(editing.id, payload);
      toast.success(editing?.new ? "Fitur dibuat" : "Fitur diperbarui");
      setEditing(null);
      load();
    } catch { toast.error("Gagal menyimpan fitur"); }
    setSaving(false);
  };

  const remove = async (f) => {
    try { await base44.entities.CustomFeature.delete(f.id); toast.success("Fitur dihapus"); load(); } catch { toast.error("Gagal menghapus"); }
  };
  const move = async (f, dir) => {
    const next = Math.max(0, (f.order || 0) + dir);
    try { await base44.entities.CustomFeature.update(f.id, { order: next }); load(); } catch {}
  };
  const toggleHidden = async (f) => {
    try { await base44.entities.CustomFeature.update(f.id, { hidden: !f.hidden }); load(); } catch {}
  };

  if (!can) {
    return (
      <div className="w-full p-6">
        <div className="rounded-2xl border p-12 text-center" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <Lock size={32} className="mx-auto mb-3" style={{ color: "var(--coral)" }} />
          <p className="text-[0.9rem] font-semibold" style={{ color: "var(--text)" }}>Akses Ditolak</p>
          <p className="text-[0.78rem]" style={{ color: "var(--text-3)" }}>Hanya SUPER MASTER yang dapat mengelola Feature Builder.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-4 md:p-6">
      <PageHead icon="fa-cubes" color="var(--purple)" title="FEATURE BUILDER" subtitle="Buat menu dinamis tanpa kode"
        badges={[{ icon: "fa-cube", text: `${features.length} Fitur`, color: "var(--purple)" }]} />

      <div className="mb-4 flex justify-end">
        <button onClick={openNew} className="flex items-center gap-2 rounded-xl px-4 py-2 text-[0.82rem] font-semibold text-black transition-transform hover:scale-[1.03]" style={{ background: "var(--acc-grad)" }}>
          <Plus size={16} /> Buat Fitur
        </button>
      </div>

      {loading ? (
        <div className="py-16 text-center text-[0.82rem]" style={{ color: "var(--text-3)" }}>Memuat…</div>
      ) : features.length === 0 ? (
        <div className="rounded-2xl border p-12 text-center" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <p className="text-[0.86rem]" style={{ color: "var(--text-3)" }}>Belum ada fitur kustom. Buat fitur pertama Anda — sidebar & halaman akan otomatis dibuat.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => {
            const Icon = getIcon(f.icon);
            return (
              <FeatureCard key={f.id} f={f} i={i} Icon={Icon} onEdit={openEdit} onRemove={remove} onMove={move} onToggleHidden={toggleHidden} />
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {editing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={() => setEditing(null)}>
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0 }} onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[600px] overflow-hidden rounded-2xl border" style={{ background: "var(--card-solid)", borderColor: "var(--border)" }}>
              <div className="flex items-center justify-between border-b px-5 py-3.5" style={{ borderColor: "var(--border)" }}>
                <h3 className="text-[0.92rem] font-bold" style={{ color: "var(--text)" }}>{editing.new ? "Fitur Baru" : "Edit Fitur"}</h3>
                <button onClick={() => setEditing(null)} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-[var(--hover)]" style={{ color: "var(--text-2)" }}><X size={16} /></button>
              </div>
              <div className="ds-scroll max-h-[72vh] space-y-3.5 overflow-y-auto p-5">
                <div className="grid grid-cols-2 gap-3">
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: form.slug || slugify(e.target.value) })} placeholder="Nama fitur (cth: MAIN TANC)" className="rounded-xl border bg-transparent px-3.5 py-2.5 text-[0.82rem] outline-none focus:border-[var(--acc)]" style={{ background: "var(--card)", borderColor: "var(--border)", color: "var(--text)" }} />
                  <input value={form.slug} onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })} placeholder="slug-url" className="rounded-xl border bg-transparent px-3.5 py-2.5 font-mono text-[0.82rem] outline-none focus:border-[var(--acc)]" style={{ background: "var(--card)", borderColor: "var(--border)", color: "var(--text)" }} />
                </div>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Deskripsi fitur" rows={2} className="w-full rounded-xl border bg-transparent px-3.5 py-2.5 text-[0.82rem] outline-none focus:border-[var(--acc)]" style={{ background: "var(--card)", borderColor: "var(--border)", color: "var(--text)" }} />
                <textarea value={form.shortcuts} onChange={(e) => setForm({ ...form, shortcuts: e.target.value })} placeholder="Pintasan (satu per baris, URL atau teks)" rows={3} className="w-full rounded-xl border bg-transparent px-3.5 py-2.5 text-[0.82rem] outline-none focus:border-[var(--acc)]" style={{ background: "var(--card)", borderColor: "var(--border)", color: "var(--text)" }} />

                <div>
                  <div className="mb-1.5 text-[0.7rem] font-semibold" style={{ color: "var(--text-2)" }}>Icon</div>
                  <div className="ds-scroll grid max-h-[120px] grid-cols-8 gap-1.5 overflow-y-auto rounded-xl border p-2" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
                    {ICON_NAMES.map((n) => {
                      const Ic = getIcon(n);
                      return (
                        <button key={n} onClick={() => setForm({ ...form, icon: n })} title={n} className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors" style={form.icon === n ? { background: "var(--acc-grad)", color: "#000" } : { color: "var(--text-2)" }}>
                          <Ic size={16} />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <div className="mb-1.5 text-[0.7rem] font-semibold" style={{ color: "var(--text-2)" }}>Warna Icon</div>
                  <div className="flex flex-wrap gap-2">
                    {COLORS.map((c) => <button key={c} onClick={() => setForm({ ...form, icon_color: c })} className="h-7 w-7 rounded-full transition-transform hover:scale-110" style={{ background: c, border: form.icon_color === c ? "2px solid var(--text)" : "2px solid transparent" }} />)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="mb-1.5 text-[0.7rem] font-semibold" style={{ color: "var(--text-2)" }}>Banner</div>
                    <label className="flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2.5 text-[0.74rem]" style={{ background: "var(--card)", borderColor: "var(--border)", color: "var(--text-2)" }}>
                      <Upload size={14} /> {form.banner_url ? "Ganti" : "Unggah"}
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => upload(e, "banner_url")} />
                    </label>
                    {form.banner_url && <img src={form.banner_url} alt="" className="mt-2 h-16 w-full rounded-lg object-cover" />}
                  </div>
                  <div>
                    <div className="mb-1.5 text-[0.7rem] font-semibold" style={{ color: "var(--text-2)" }}>Background</div>
                    <label className="flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2.5 text-[0.74rem]" style={{ background: "var(--card)", borderColor: "var(--border)", color: "var(--text-2)" }}>
                      <Upload size={14} /> {form.background_url ? "Ganti" : "Unggah"}
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => upload(e, "background_url")} />
                    </label>
                    {form.background_url && <img src={form.background_url} alt="" className="mt-2 h-16 w-full rounded-lg object-cover" />}
                  </div>
                </div>

                <div>
                  <div className="mb-1.5 text-[0.7rem] font-semibold" style={{ color: "var(--text-2)" }}>Visible untuk Role</div>
                  <div className="flex flex-wrap gap-2">
                    {ROLE_KEYS.map((r) => (
                      <button key={r} onClick={() => setForm((f) => ({ ...f, visible_roles: f.visible_roles.includes(r) ? f.visible_roles.filter((x) => x !== r) : [...f.visible_roles, r] }))}
                        className="rounded-lg border px-3 py-1.5 text-[0.72rem] font-medium" style={form.visible_roles.includes(r) ? { background: "var(--acc-grad)", color: "#000", borderColor: "transparent" } : { background: "var(--card)", borderColor: "var(--border)", color: "var(--text-2)" }}>
                        {ROLES[r].label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-[0.78rem]" style={{ color: "var(--text-2)" }}>
                    <input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} className="w-20 rounded-lg border bg-transparent px-2 py-1.5 outline-none" style={{ background: "var(--card)", borderColor: "var(--border)", color: "var(--text)" }} /> Urutan
                  </label>
                  <label className="flex cursor-pointer items-center gap-2 text-[0.78rem]" style={{ color: "var(--text-2)" }}>
                    <input type="checkbox" checked={form.hidden} onChange={(e) => setForm({ ...form, hidden: e.target.checked })} className="accent-[var(--acc)]" /> Sembunyikan
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-2.5 border-t p-4" style={{ borderColor: "var(--border)" }}>
                <button onClick={() => setEditing(null)} className="rounded-xl border px-4 py-2 text-[0.82rem] font-medium" style={{ borderColor: "var(--border)", color: "var(--text-2)" }}>Batal</button>
                <button onClick={save} disabled={saving} className="rounded-xl px-5 py-2 text-[0.82rem] font-semibold text-black disabled:opacity-60" style={{ background: "var(--acc-grad)" }}>{saving ? "Menyimpan…" : "Simpan"}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}