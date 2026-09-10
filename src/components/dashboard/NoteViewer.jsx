import React, { useState } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import {
  X, Copy, Edit3, Download, Globe, Lock, Tag, Pin, Star,
  Image as ImageIcon, Paperclip, Check,
} from "lucide-react";
import { toast } from "sonner";

function fileName(url) {
  try { return decodeURIComponent(url.split("/").pop().split("?")[0]); } catch { return "file"; }
}

export default function NoteViewer({ note, onClose, onEdit, canEdit }) {
  const [copied, setCopied] = useState(false);
  const [lightbox, setLightbox] = useState(null);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(note.content || "");
      setCopied(true);
      toast.success("Catatan disalin ke clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch { toast.error("Gagal menyalin"); }
  };

  const images = note.image_urls || [];
  const files = note.file_urls || [];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="ds-scroll w-full max-w-[720px] max-h-[85vh] overflow-y-auto rounded-2xl border"
        style={{ background: "var(--card-solid)", borderColor: "var(--border)", boxShadow: "0 24px 60px rgba(0,0,0,0.7)" }}>

        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between gap-2 border-b px-5 py-3.5"
          style={{ background: "var(--card-solid)", borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2 min-w-0">
            <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ background: note.color || "var(--acc)" }} />
            <h2 className="text-[0.92rem] font-bold truncate" style={{ color: "var(--text)" }}>{note.title}</h2>
            {note.visibility === "public"
              ? <Globe size={12} className="flex-shrink-0" style={{ color: "var(--green)" }} />
              : <Lock size={12} className="flex-shrink-0" style={{ color: "var(--text-3)" }} />}
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button onClick={copy}
              className="flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[0.7rem] font-medium transition-colors hover:bg-[var(--hover)]"
              style={{ borderColor: "var(--border)", color: copied ? "var(--green)" : "var(--text-2)" }}>
              {copied ? <Check size={12} /> : <Copy size={12} />} {copied ? "Disalin" : "Salin"}
            </button>
            {canEdit && (
              <button onClick={onEdit}
                className="flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[0.7rem] font-medium transition-colors hover:bg-[var(--hover)]"
                style={{ borderColor: "var(--border)", color: "var(--blue)" }}>
                <Edit3 size={12} /> Edit
              </button>
            )}
            <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-[var(--hover)]" style={{ color: "var(--text-2)" }}>
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-5">
          {/* Badges & tags */}
          <div className="mb-3 flex flex-wrap items-center gap-1.5">
            {note.pinned && <span className="flex items-center gap-1 rounded-md px-2 py-0.5 text-[0.6rem] font-semibold" style={{ background: "rgba(245,197,66,0.1)", color: "var(--acc)" }}><Pin size={9} /> Disematkan</span>}
            {note.favorite && <span className="flex items-center gap-1 rounded-md px-2 py-0.5 text-[0.6rem] font-semibold" style={{ background: "rgba(255,93,115,0.1)", color: "var(--coral)" }}><Star size={9} /> Favorit</span>}
            {note.folder && <span className="rounded-md px-2 py-0.5 text-[0.6rem]" style={{ background: "var(--glass)", color: "var(--text-3)" }}>{note.folder}</span>}
            {(note.tags || []).map((t) => (
              <span key={t} className="flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[0.6rem]" style={{ borderColor: "var(--border)", color: "var(--text-3)" }}><Tag size={8} /> {t}</span>
            ))}
          </div>

          {/* Content — selectable */}
          <div className="select-text text-[0.82rem] leading-relaxed" style={{ color: "var(--text)" }}>
            {note.content ? (
              <ReactMarkdown components={{
                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                h1: ({ children }) => <h1 className="text-[1.05rem] font-bold mb-2 mt-3">{children}</h1>,
                h2: ({ children }) => <h2 className="text-[0.95rem] font-bold mb-2 mt-3">{children}</h2>,
                h3: ({ children }) => <h3 className="text-[0.88rem] font-bold mb-1.5 mt-2">{children}</h3>,
                ul: ({ children }) => <ul className="list-disc ml-5 mb-2 space-y-0.5">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal ml-5 mb-2 space-y-0.5">{children}</ol>,
                a: ({ href, children }) => <a href={href} target="_blank" rel="noreferrer" className="underline" style={{ color: "var(--blue)" }}>{children}</a>,
                code: ({ children }) => <code className="rounded px-1 py-0.5 font-mono text-[0.78rem]" style={{ background: "rgba(255,255,255,0.06)" }}>{children}</code>,
                blockquote: ({ children }) => <blockquote className="border-l-2 pl-3 italic opacity-80 my-2" style={{ borderColor: "var(--border)" }}>{children}</blockquote>,
                strong: ({ children }) => <strong className="font-bold">{children}</strong>,
              }}>{note.content}</ReactMarkdown>
            ) : (
              <span style={{ color: "var(--text-3)" }}>Tidak ada isi</span>
            )}
          </div>

          {/* Images */}
          {images.length > 0 && (
            <div className="mt-4">
              <div className="mb-2 flex items-center gap-1.5 text-[0.6rem] font-bold uppercase tracking-widest" style={{ color: "var(--text-3)" }}>
                <ImageIcon size={11} /> Gambar ({images.length})
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {images.map((url, i) => (
                  <button key={i} onClick={() => setLightbox(url)}
                    className="block overflow-hidden rounded-xl border transition-opacity hover:opacity-80"
                    style={{ borderColor: "var(--border)" }}>
                    <img src={url} alt={`gambar ${i + 1}`} className="h-32 w-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Files */}
          {files.length > 0 && (
            <div className="mt-4">
              <div className="mb-2 flex items-center gap-1.5 text-[0.6rem] font-bold uppercase tracking-widest" style={{ color: "var(--text-3)" }}>
                <Paperclip size={11} /> File ({files.length})
              </div>
              <div className="space-y-1.5">
                {files.map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noreferrer" download={fileName(url)}
                    className="flex items-center gap-2.5 rounded-xl border px-3 py-2.5 transition-colors hover:bg-[var(--hover)]"
                    style={{ borderColor: "var(--border)" }}>
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg flex-shrink-0" style={{ background: "rgba(79,139,255,0.1)", color: "var(--blue)" }}>
                      <Paperclip size={14} />
                    </div>
                    <span className="flex-1 truncate text-[0.74rem] font-medium" style={{ color: "var(--text-2)" }}>{fileName(url)}</span>
                    <Download size={14} style={{ color: "var(--text-3)" }} />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Meta */}
          <div className="mt-4 pt-3 border-t flex items-center justify-between text-[0.62rem]" style={{ borderColor: "var(--border)", color: "var(--text-3)" }}>
            <span>Dibuat {note.created_date ? `${new Date(note.created_date).toLocaleDateString("id-ID", { dateStyle: "medium" })} ${new Date(note.created_date).toLocaleTimeString("id-ID", { timeStyle: "short" })}` : "—"}</span>
            <span>Diperbarui {note.updated_date ? `${new Date(note.updated_date).toLocaleDateString("id-ID", { dateStyle: "medium" })} ${new Date(note.updated_date).toLocaleTimeString("id-ID", { timeStyle: "short" })}` : "—"}</span>
          </div>
        </div>
      </motion.div>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4" onClick={() => setLightbox(null)}>
          <button className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-xl border text-white" style={{ borderColor: "rgba(255,255,255,0.2)", background: "rgba(0,0,0,0.5)" }}>
            <X size={20} />
          </button>
          <img src={lightbox} alt="lightbox" className="max-h-[90vh] max-w-[90vw] rounded-xl object-contain" />
        </div>
      )}
    </motion.div>
  );
}