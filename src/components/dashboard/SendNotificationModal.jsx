import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Megaphone, ImagePlus, Loader2, Volume2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { getSession } from "@/lib/dashboardAuth";
import { getRole } from "@/lib/permissions";

const TYPES = [
  { k: "info", c: "var(--blue)", l: "Info" },
  { k: "success", c: "var(--green)", l: "Sukses" },
  { k: "warning", c: "var(--gold)", l: "Peringatan" },
  { k: "error", c: "var(--coral)", l: "Error" },
];

export default function SendNotificationModal({ open, onClose, targetUser }) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("info");
  const [imageUrl, setImageUrl] = useState("");
  const [withVoice, setWithVoice] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);
  const me = getSession();
  const role = getRole();

  const reset = () => { setTitle(""); setMessage(""); setType("info"); setImageUrl(""); setWithVoice(true); };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Hanya gambar atau GIF"); return; }
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setImageUrl(file_url);
    } catch {
      toast.error("Gagal mengunggah gambar");
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const send = async () => {
    if (!message.trim()) { toast.error("Pesan tidak boleh kosong"); return; }
    setBusy(true);
    try {
      const isBroadcast = !targetUser;
      let audioUrl = "";
      if (withVoice) {
        try {
          const res = await base44.integrations.Core.GenerateSpeech({ text: message.trim(), voice: "honey" });
          audioUrl = res.url;
        } catch {}
      }
      await base44.entities.PushNotification.create({
        target_email: isBroadcast ? "*" : targetUser.email,
        target_name: isBroadcast ? "" : (targetUser.name || ""),
        from_email: me?.email || "",
        from_name: me?.name || "Super Master",
        from_role: role.key,
        title: title.trim() || (isBroadcast ? "Pengumuman dari Super Master" : "Notifikasi"),
        message: message.trim(),
        image_url: imageUrl || "",
        audio_url: audioUrl,
        type: isBroadcast ? "broadcast" : type,
        read: false,
      });
      toast.success(isBroadcast ? "Broadcast terkirim ke semua user" : `Notifikasi terkirim ke ${targetUser.name || targetUser.email}`);
      reset();
      onClose();
    } catch {
      toast.error("Gagal mengirim notifikasi");
    }
    setBusy(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 20 }}
            transition={{ type: "spring", damping: 26, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md overflow-hidden rounded-2xl border"
            style={{ background: "var(--card-solid)", borderColor: "var(--border)" }}
          >
            <div className="flex items-center gap-3 border-b p-4" style={{ borderColor: "var(--border)", background: "var(--bg-2)" }}>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "rgba(var(--acc-rgb),0.14)", color: "var(--acc)", border: "1px solid rgba(var(--acc-rgb),0.3)" }}>
                {targetUser ? <Send size={18} /> : <Megaphone size={18} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[0.9rem] font-bold" style={{ color: "var(--text)" }}>{targetUser ? "Kirim Notifikasi" : "Broadcast ke Semua"}</div>
                <div className="text-[0.66rem] truncate" style={{ color: "var(--text-3)" }}>
                  {targetUser ? `Tujuan: ${targetUser.name || targetUser.email}` : "Semua user online akan menerima notifikasi"}
                </div>
              </div>
              <button onClick={onClose} className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg transition-colors hover:bg-[var(--hover)]" style={{ color: "var(--text-3)" }}>
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 p-4">
              <div>
                <label className="mb-1.5 block text-[0.64rem] font-bold uppercase tracking-wider" style={{ color: "var(--text-3)" }}>Judul (opsional)</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={targetUser ? "Notifikasi" : "Pengumuman dari Super Master"}
                  className="w-full rounded-xl border bg-transparent px-3 py-2.5 text-[0.8rem] outline-none focus:border-[var(--acc)]" style={{ borderColor: "var(--border)", color: "var(--text)" }} />
              </div>
              <div>
                <label className="mb-1.5 block text-[0.64rem] font-bold uppercase tracking-wider" style={{ color: "var(--text-3)" }}>Pesan</label>
                <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} placeholder="Tulis pesan notifikasi…"
                  className="w-full resize-none rounded-xl border bg-transparent px-3 py-2.5 text-[0.8rem] outline-none focus:border-[var(--acc)]" style={{ borderColor: "var(--border)", color: "var(--text)" }} />
              </div>
              <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2.5" style={{ borderColor: "var(--border)" }}>
                <input type="checkbox" checked={withVoice} onChange={(e) => setWithVoice(e.target.checked)} className="h-4 w-4 accent-[var(--acc)]" />
                <Volume2 size={15} style={{ color: "var(--acc)" }} />
                <span className="text-[0.76rem] font-medium" style={{ color: "var(--text)" }}>Sertakan Suara (pesan akan dibacakan ke penerima)</span>
              </label>
              <div>
                <label className="mb-1.5 block text-[0.64rem] font-bold uppercase tracking-wider" style={{ color: "var(--text-3)" }}>Gambar / GIF (opsional)</label>
                <input ref={fileRef} type="file" accept="image/*,image/gif" onChange={handleFile} className="hidden" />
                {imageUrl ? (
                  <div className="relative overflow-hidden rounded-xl border" style={{ borderColor: "var(--border)" }}>
                    <img src={imageUrl} alt="preview" className="max-h-44 w-full object-contain bg-black/30" />
                    <button onClick={() => setImageUrl("")} className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-lg text-white" style={{ background: "rgba(0,0,0,0.6)" }}>
                      <X size={15} />
                    </button>
                  </div>
                ) : (
                  <button onClick={() => fileRef.current?.click()} disabled={uploading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed py-4 text-[0.74rem] font-bold transition-colors hover:bg-[var(--hover)] disabled:opacity-50"
                    style={{ borderColor: "var(--border)", color: "var(--text-3)" }}>
                    {uploading ? <Loader2 size={15} className="animate-spin" /> : <ImagePlus size={15} />}
                    {uploading ? "Mengunggah…" : "Tambah gambar atau GIF"}
                  </button>
                )}
              </div>
              {targetUser && (
                <div>
                  <label className="mb-1.5 block text-[0.64rem] font-bold uppercase tracking-wider" style={{ color: "var(--text-3)" }}>Tipe</label>
                  <div className="flex gap-1.5">
                    {TYPES.map((t) => (
                      <button key={t.k} onClick={() => setType(t.k)} className="flex-1 rounded-lg border px-2 py-1.5 text-[0.62rem] font-bold transition-all"
                        style={type === t.k ? { background: `${t.c}22`, color: t.c, borderColor: `${t.c}55` } : { background: "var(--glass)", color: "var(--text-3)", borderColor: "var(--border)" }}>{t.l}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 border-t p-4" style={{ borderColor: "var(--border)" }}>
              <button onClick={onClose} className="rounded-xl border px-4 py-2 text-[0.74rem] font-bold transition-colors hover:bg-[var(--hover)]" style={{ borderColor: "var(--border)", color: "var(--text-2)" }}>Batal</button>
              <button onClick={send} disabled={busy} className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-[0.74rem] font-bold text-black transition-all hover:scale-105 disabled:opacity-50" style={{ background: "var(--acc-grad)" }}>
                {busy ? <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-black/40 border-t-transparent" /> : <Send size={13} />} Kirim
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}