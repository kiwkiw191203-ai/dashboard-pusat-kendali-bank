import React, { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import PageHead from "@/components/dashboard/PageHead";
import ArchiveCard from "@/components/chatArchive/ArchiveCard";
import ArchiveFormModal from "@/components/chatArchive/ArchiveFormModal";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";

export default function ChatMistakeArchive() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);

  const load = async () => {
    try { setItems(await base44.entities.ChatMistakeArchive.list("-created_date", 200)); } catch { setItems([]); }
    setLoading(false);
  };

  useEffect(() => {
    load();
    let unsub;
    try { unsub = base44.entities.ChatMistakeArchive.subscribe(load); } catch { unsub = () => {}; }
    return () => unsub();
  }, []);

  const remove = async (item) => {
    try { await base44.entities.ChatMistakeArchive.delete(item.id); toast.success("Arsip dihapus"); load(); } catch { toast.error("Gagal menghapus arsip"); }
  };

  return (
    <div className="w-full p-4 md:p-6">
      <PageHead icon="fa-clock-rotate-left" color="var(--coral)" title="ARSIP KESALAHAN CHAT" subtitle="Dokumentasi evaluasi kesalahan saat melayani customer"
        badges={[{ icon: "fa-folder-open", text: `${items.length} Arsip`, color: "var(--coral)" }]} />

      <div className="mb-4">
        <button onClick={() => setEditing({ new: true })}
          className="flex items-center gap-2 rounded-xl px-4 py-2 text-[0.82rem] font-semibold text-black transition-transform hover:scale-[1.03]"
          style={{ background: "var(--acc-grad)" }}>
          <Plus size={16} /> Tambah Arsip
        </button>
      </div>

      {loading ? (
        <div className="py-16 text-center text-[0.82rem]" style={{ color: "var(--text-3)" }}>Memuat arsip…</div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border p-12 text-center" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <p className="text-[0.86rem]" style={{ color: "var(--text-3)" }}>Belum ada arsip kesalahan tercatat.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => {
            const isOwner = !it.creator_email || it.creator_email === user?.email;
            return <ArchiveCard key={it.id} item={it} isOwner={isOwner} onEdit={() => setEditing(it)} onDelete={() => remove(it)} />;
          })}
        </div>
      )}

      <AnimatePresence>
        {editing && (
          <ArchiveFormModal editing={editing} creator={user} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />
        )}
      </AnimatePresence>
    </div>
  );
}