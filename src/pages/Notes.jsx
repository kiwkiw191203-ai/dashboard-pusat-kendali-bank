import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Pin, Star, Trash2, Edit3, Globe, Lock, X, Tag, Image as ImageIcon, Paperclip, Loader2, Eye } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import PageHead from "@/components/dashboard/PageHead";
import NoteViewer from "@/components/dashboard/NoteViewer";
import { getSession } from "@/lib/dashboardAuth";
import { getRole, canEditNotes } from "@/lib/permissions";
import { useAuth } from "@/lib/AuthContext";

const COLORS = ["var(--acc)", "var(--blue)", "var(--green)", "var(--violet)", "var(--coral)", "var(--teal)"];
const FILTERS = [
  { id: "all", label: "Semua" },
  { id: "pinned", label: "Disemat" },
  { id: "favorite", label: "Favorit" },
  { id: "public", label: "Publik" },
  { id: "private", label: "Privat" },
];

const fade = (i = 0) => ({ initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.35, delay: i * 0.04 } });

const EMPTY_FORM = { title: "", content: "", tags: "", folder: "", visibility: "private", color: COLORS[0], pinned: false, favorite: false, image_urls: [], file_urls: [] };

function fileName(url) {
  try { return decodeURIComponent(url.split("/").pop().split("?")[0]); } catch { return "file"; }
}

export default function Notes() {
  const session = getSession();
  const role = getRole(session);
  const canEdit = canEditNotes(role);
  const { user } = useAuth();
  const isOwner = (n) => !n.creator_email || n.creator_email === user?.email;

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const imgInputRef = useRef(null);
  const fileInputRef = useRef(null);

  const load = async () => {
    setLoading(true);
    try { setNotes(await base44.entities.Note.list("-updated_date", 200)); } catch { setNotes([]); }
    setLoading(false);
  };

  useEffect(() => {
    load();
    let u;
    try { u = base44.entities.Note.subscribe(() => load()); } catch { u = () => {}; }
    return () => u();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return notes.filter((n) => {
      if (filter === "pinned" && !n.pinned) return false;
      if (filter === "favorite" && !n.favorite) return false;
      if (filter === "public" && n.visibility !== "public") return false;
      if (filter === "private" && n.visibility !== "private") return false;
      if (q && !(`${n.title} ${n.content} ${(n.tags || []).join(" ")}`.toLowerCase().includes(q))) return false;
      return true;
    }).sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
  }, [notes, query, filter]);

  const openNew = () => {
    setEditing({ new: true });
    setForm(EMPTY_FORM);
  };
  const openEdit = (n) => {
    setViewing(null);
    setEditing(n);
    setForm({
      title: n.title || "", content: n.content || "", tags: (n.tags || []).join(", "), folder: n.folder || "",
      visibility: n.visibility || "private", color: n.color || COLORS[0], pinned: !!n.pinned, favorite: !!n.favorite,
      image_urls: n.image_urls || [], file_urls: n.file_urls || [],
    });
  };

  const save = async () => {
    if (!form.title.trim()) { toast.error("Judul wajib diisi"); return; }
    setSaving(true);
    const payload = {
      title: form.title.trim(),
      content: form.content,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      folder: form.folder.trim(),
      visibility: form.visibility,
      color: form.color,
      pinned: form.pinned,
      favorite: form.favorite,
      image_urls: form.image_urls,
      file_urls: form.file_urls,
    };
    try {
      if (editing?.new) await base44.entities.Note.create({ ...payload, creator_name: user?.full_name || "", creator_email: user?.email || "" });
      else await base44.entities.Note.update(editing.id, payload);
      toast.success(editing?.new ? "Catatan dibuat" : "Catatan diperbarui");
      setEditing(null);
      load();
    } catch { toast.error("Gagal menyimpan catatan"); }
    setSaving(false);
  };

  const toggle = async (n, field) => {
    try { await base44.entities.Note.update(n.id, { [field]: !n[field] }); load(); } catch { toast.error("Gagal memperbarui"); }
  };
  const remove = async (n) => {
    try { await base44.entities.Note.delete(n.id); toast.success("Catatan dihapus"); load(); } catch { toast.error("Gagal menghapus"); }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("File harus berupa gambar"); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Ukuran maksimal 5MB"); return; }
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setForm({ ...form, image_urls: [...form.image_urls, file_url] });
      toast.success("Gambar ditambahkan");
    } catch { toast.error("Gagal mengupload gambar"); }
    setUploading(false);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error("Ukuran maksimal 10MB"); return; }
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setForm({ ...form, file_urls: [...form.file_urls, file_url] });
      toast.success("File ditambahkan");
    } catch { toast.error("Gagal mengupload file"); }
    setUploading(false);
  };

  const removeImage = (idx) => setForm({ ...form, image_urls: form.image_urls.filter((_, i) => i !== idx) });
  const removeFile = (idx) => setForm({ ...form, file_urls: form.file_urls.filter((_, i) => i !== idx) });

  return (
    <div className="w-full p-4 md:p-6">
      <PageHead icon="fa-note-sticky" color="var(--blue)" title="NOTES" subtitle="Catatan kolaboratif real-time"
        badges={[{ text: `${notes.length} Catatan`, color: "var(--blue)" }]} />

      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center gap-2.5">
        <div className="flex flex-1 items-center gap-2 rounded-xl border px-3 py-2" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <Search size={15} style={{ color: "var(--text-3)" }} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari catatan, tag, isi…" className="flex-1 bg-transparent text-[0.82rem] outline-none" style={{ color: "var(--text)" }} />
        </div>
        {canEdit && (
          <button onClick={openNew} className="flex items-center gap-2 rounded-xl px-4 py-2 text-[0.82rem] font-semibold text-black transition-transform hover:scale-[1.03]" style={{ background: "var(--acc-grad)" }}>
            <Plus size={16} /> Catatan Baru
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button key={f.id} onClick={() => setFilter(f.id)} className="rounded-lg border px-3 py-1.5 text-[0.74rem] font-medium transition-colors"
            style={filter === f.id ? { background: "var(--acc-grad)", color: "#000", borderColor: "transparent" } : { background: "var(--card)", borderColor: "var(--border)", color: "var(--text-2)" }}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="py-16 text-center text-[0.82rem]" style={{ color: "var(--text-3)" }}>Memuat catatan…</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border p-12 text-center" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <p className="text-[0.86rem]" style={{ color: "var(--text-3)" }}>Belum ada catatan. {canEdit && "Buat catatan pertama Anda."}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((n, i) => {
            const imgCount = (n.image_urls || []).length;
            const fileCount = (n.file_urls || []).length;
            return (
              <motion.div key={n.id} {...fade(i)} onClick={() => setViewing(n)}
                className="group flex cursor-pointer flex-col rounded-2xl border p-4 transition-all hover:border-[var(--border-active)] hover:-translate-y-0.5"
                style={{ background: "var(--card)", borderColor: "var(--border)" }}>
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: n.color || "var(--acc)" }} />
                    {n.visibility === "public"
                      ? <Globe size={12} style={{ color: "var(--green)" }} />
                      : <Lock size={12} style={{ color: "var(--text-3)" }} />}
                  </div>
                  <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => setViewing(n)} className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-[var(--hover)]" style={{ color: "var(--text-2)" }}><Eye size={13} /></button>
                    {canEdit && isOwner(n) && <button onClick={() => openEdit(n)} className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-[var(--hover)]" style={{ color: "var(--blue)" }}><Edit3 size={13} /></button>}
                    {canEdit && isOwner(n) && <button onClick={() => remove(n)} className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-[var(--hover)]" style={{ color: "var(--coral)" }}><Trash2 size={13} /></button>}
                  </div>
                </div>
                <h3 className="text-[0.88rem] font-bold leading-snug" style={{ color: "var(--text)" }}>{n.title}</h3>
                <p className="mt-1.5 line-clamp-4 flex-1 text-[0.74rem] leading-relaxed" style={{ color: "var(--text-2)" }}>{n.content || "—"}</p>

                {/* Image thumbnail preview */}
                {imgCount > 0 && (
                  <div className="mt-2 flex gap-1.5">
                    {(n.image_urls || []).slice(0, 3).map((url, idx) => (
                      <img key={idx} src={url} alt="" className="h-12 w-12 rounded-lg object-cover border" style={{ borderColor: "var(--border)" }} />
                    ))}
                    {imgCount > 3 && (
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg border text-[0.6rem] font-bold" style={{ background: "var(--glass)", borderColor: "var(--border)", color: "var(--text-3)" }}>+{imgCount - 3}</div>
                    )}
                  </div>
                )}

                {(n.tags?.length > 0) && (
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {n.tags.slice(0, 3).map((t) => (
                      <span key={t} className="flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[0.6rem]" style={{ background: "var(--glass)", borderColor: "var(--border)", color: "var(--text-3)" }}><Tag size={8} /> {t}</span>
                    ))}
                  </div>
                )}
                <div className="mt-3 flex items-center justify-between border-t pt-2.5" style={{ borderColor: "var(--border)" }}>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[0.62rem]" style={{ color: "var(--text-3)" }}>{n.folder || "Tanpa folder"}</span>
                    {n.creator_name && <span className="text-[0.6rem]" style={{ color: "var(--text-3)" }}>· {n.creator_name}</span>}
                    {imgCount > 0 && <span className="flex items-center gap-0.5 text-[0.6rem]" style={{ color: "var(--violet)" }}><ImageIcon size={9} /> {imgCount}</span>}
                    {fileCount > 0 && <span className="flex items-center gap-0.5 text-[0.6rem]" style={{ color: "var(--blue)" }}><Paperclip size={9} /> {fileCount}</span>}
                  </div>
                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => toggle(n, "pinned")} className="transition-transform hover:scale-110" style={{ color: n.pinned ? "var(--acc)" : "var(--text-3)" }}><Pin size={14} fill={n.pinned ? "var(--acc)" : "none"} /></button>
                    <button onClick={() => toggle(n, "favorite")} className="transition-transform hover:scale-110" style={{ color: n.favorite ? "var(--coral)" : "var(--text-3)" }}><Star size={14} fill={n.favorite ? "var(--coral)" : "none"} /></button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Viewer modal */}
      <AnimatePresence>
        {viewing && (
          <NoteViewer note={viewing} onClose={() => setViewing(null)} onEdit={() => openEdit(viewing)} canEdit={canEdit && isOwner(viewing)} />
        )}
      </AnimatePresence>

      {/* Editor modal */}
      <AnimatePresence>
        {editing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={() => setEditing(null)}>
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[560px] overflow-hidden rounded-2xl border" style={{ background: "var(--card-solid)", borderColor: "var(--border)" }}>
              <div className="flex items-center justify-between border-b px-5 py-3.5" style={{ borderColor: "var(--border)" }}>
                <h3 className="text-[0.92rem] font-bold" style={{ color: "var(--text)" }}>{editing.new ? "Catatan Baru" : "Edit Catatan"}</h3>
                <button onClick={() => setEditing(null)} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-[var(--hover)]" style={{ color: "var(--text-2)" }}><X size={16} /></button>
              </div>

              <input ref={imgInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileUpload} />

              <div className="ds-scroll max-h-[70vh] space-y-3.5 overflow-y-auto p-5">
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Judul catatan" className="w-full rounded-xl border bg-transparent px-3.5 py-2.5 text-[0.9rem] font-semibold outline-none focus:border-[var(--acc)]" style={{ background: "var(--card)", borderColor: "var(--border)", color: "var(--text)" }} />
                <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Tulis isi catatan… (mendukung markdown)" rows={6} className="w-full rounded-xl border bg-transparent px-3.5 py-2.5 text-[0.82rem] outline-none focus:border-[var(--acc)] ds-scroll" style={{ background: "var(--card)", borderColor: "var(--border)", color: "var(--text)" }} />

                {/* Attachments toolbar */}
                <div className="flex flex-wrap items-center gap-2">
                  <button onClick={() => imgInputRef.current?.click()} disabled={uploading}
                    className="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-[0.74rem] font-medium transition-colors hover:bg-[var(--hover)] disabled:opacity-50"
                    style={{ borderColor: "var(--border)", color: "var(--violet)" }}>
                    {uploading ? <Loader2 size={13} className="animate-spin" /> : <ImageIcon size={13} />} Gambar
                  </button>
                  <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
                    className="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-[0.74rem] font-medium transition-colors hover:bg-[var(--hover)] disabled:opacity-50"
                    style={{ borderColor: "var(--border)", color: "var(--blue)" }}>
                    {uploading ? <Loader2 size={13} className="animate-spin" /> : <Paperclip size={13} />} File
                  </button>
                  {form.image_urls.length + form.file_urls.length > 0 && (
                    <span className="text-[0.62rem]" style={{ color: "var(--text-3)" }}>{form.image_urls.length + form.file_urls.length} lampiran</span>
                  )}
                </div>

                {/* Uploaded images */}
                {form.image_urls.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {form.image_urls.map((url, i) => (
                      <div key={i} className="group relative overflow-hidden rounded-lg border" style={{ borderColor: "var(--border)" }}>
                        <img src={url} alt="" className="h-20 w-full object-cover" />
                        <button onClick={() => removeImage(i)} className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-md bg-black/70 text-white opacity-0 transition-opacity group-hover:opacity-100">
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Uploaded files */}
                {form.file_urls.length > 0 && (
                  <div className="space-y-1.5">
                    {form.file_urls.map((url, i) => (
                      <div key={i} className="flex items-center gap-2.5 rounded-xl border px-3 py-2" style={{ borderColor: "var(--border)", background: "var(--glass)" }}>
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg flex-shrink-0" style={{ background: "rgba(79,139,255,0.1)", color: "var(--blue)" }}><Paperclip size={12} /></div>
                        <span className="flex-1 truncate text-[0.72rem]" style={{ color: "var(--text-2)" }}>{fileName(url)}</span>
                        <button onClick={() => removeFile(i)} className="flex h-6 w-6 items-center justify-center rounded-md hover:bg-[var(--hover)]" style={{ color: "var(--coral)" }}><X size={11} /></button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="Tag (pisah koma)" className="rounded-xl border bg-transparent px-3.5 py-2.5 text-[0.82rem] outline-none focus:border-[var(--acc)]" style={{ background: "var(--card)", borderColor: "var(--border)", color: "var(--text)" }} />
                  <input value={form.folder} onChange={(e) => setForm({ ...form, folder: e.target.value })} placeholder="Folder" className="rounded-xl border bg-transparent px-3.5 py-2.5 text-[0.82rem] outline-none focus:border-[var(--acc)]" style={{ background: "var(--card)", borderColor: "var(--border)", color: "var(--text)" }} />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {COLORS.map((c) => (
                    <button key={c} onClick={() => setForm({ ...form, color: c })} className="h-7 w-7 rounded-full transition-transform hover:scale-110" style={{ background: c, border: form.color === c ? "2px solid var(--text)" : "2px solid transparent" }} />
                  ))}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button onClick={() => setForm({ ...form, visibility: form.visibility === "public" ? "private" : "public" })} className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[0.74rem]" style={{ background: "var(--glass)", borderColor: "var(--border)", color: "var(--text-2)" }}>
                    {form.visibility === "public" ? <Globe size={13} style={{ color: "var(--green)" }} /> : <Lock size={13} />} {form.visibility === "public" ? "Publik" : "Privat"}
                  </button>
                  <button onClick={() => setForm({ ...form, pinned: !form.pinned })} className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[0.74rem]" style={{ background: "var(--glass)", borderColor: "var(--border)", color: form.pinned ? "var(--acc)" : "var(--text-2)" }}><Pin size={13} /> Semat</button>
                  <button onClick={() => setForm({ ...form, favorite: !form.favorite })} className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[0.74rem]" style={{ background: "var(--glass)", borderColor: "var(--border)", color: form.favorite ? "var(--coral)" : "var(--text-2)" }}><Star size={13} /> Favorit</button>
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