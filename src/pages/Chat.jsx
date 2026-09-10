import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Loader2, Smile, Image as ImageIcon,
  Reply, Copy, Trash2, Edit3, Pin, Search, X, CheckCheck,
  MoreVertical, Users, Radio, Hash, Wifi, Bell, Settings as SettingsIcon,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { getSession } from "@/lib/dashboardAuth";
import { listOnline, subscribeOnline } from "@/lib/dashboardSession";
import { useRole } from "@/lib/permissions";
import RoleBadge from "@/components/dashboard/RoleBadge";
import { toast } from "sonner";
import {
  getDiscordWebhook, setDiscordWebhook, isDiscordWebhookValid, sendDiscordNotification,
} from "@/lib/discordWebhook";

const CHAT_LOGO = "https://i.ibb.co/qYjshGng/image.png";

const EMOJIS = ["😀","😂","❤️","👍","🔥","💯","😎","🎉","👀","✅","🚀","💪","🤝","⚡","🎯","🙏","😅","👏"];

function timeFmt(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" }) + " " + d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

function Avatar({ src, name, size = 36, role }) {
  const initials = (name || "?")[0]?.toUpperCase();
  const ringColor = role === "super_master" ? "var(--acc)" : role === "master" ? "var(--blue)" : "var(--text-3)";
  return (
    <div className="relative flex-shrink-0">
      <div className="flex items-center justify-center overflow-hidden rounded-full text-xs font-bold text-black"
        style={{ width: size, height: size, background: "var(--acc-grad)", border: `2px solid ${ringColor}`, boxShadow: `0 2px 8px rgba(0,0,0,0.3)` }}>
        {src ? <img src={src} alt="" className="h-full w-full object-cover" /> : initials}
      </div>
    </div>
  );
}

function MessageBubble({ m, mine, roleKey, onReply, onCopy, onDelete, onEdit, onPin }) {
  const [showActions, setShowActions] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`group flex items-end gap-2.5 ${mine ? "flex-row-reverse" : ""}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}>

      {!mine && <Avatar src={m.avatar_url} name={m.name} size={34} role={roleKey} />}

      <div className={`flex max-w-[70%] flex-col ${mine ? "items-end" : "items-start"}`}>
        {!mine && (
          <div className="mb-1 ml-1 flex items-center gap-1.5 flex-wrap">
            <span className="text-[0.65rem] font-bold" style={{ color: "var(--text)" }}>
              {m.name || m.email?.split("@")[0]}
            </span>
            <RoleBadge roleKey={roleKey} size="xs" />
          </div>
        )}

        {/* Reply context */}
        {m.reply_to && (
          <div className="mb-1 rounded-lg border-l-2 px-2.5 py-1.5 text-[0.65rem]"
            style={{ borderColor: "var(--acc)", background: "rgba(var(--acc-rgb),0.08)", color: "var(--text-3)" }}>
            ↩ {m.reply_to}
          </div>
        )}

        <div className="relative">
          {/* Bubble */}
          <div className="relative rounded-2xl px-4 py-2.5 text-[0.82rem] leading-relaxed break-words whitespace-pre-wrap"
            style={mine
              ? { background: "linear-gradient(135deg, var(--acc), #D9A921)", color: "#000", borderBottomRightRadius: 4, boxShadow: "0 4px 16px rgba(var(--acc-rgb),0.25)" }
              : { background: "var(--card-solid)", color: "var(--text)", border: "1px solid var(--border)", borderBottomLeftRadius: 4 }}>

            {/* Image attachment */}
            {m.image_url && (
              <img src={m.image_url} alt="" className="mb-2 max-w-[240px] rounded-lg cursor-pointer object-cover"
                style={{ maxHeight: 180 }} />
            )}

            <span>{m.message}</span>

            {/* Timestamp inside bubble */}
            <div className={`mt-1 flex items-center gap-1 text-[0.58rem] ${mine ? "justify-end" : "justify-start"}`}
              style={{ color: mine ? "rgba(0,0,0,0.5)" : "var(--text-3)" }}>
              {timeFmt(m.created_date)}
              {mine && <CheckCheck size={11} />}
            </div>
          </div>

          {/* Action buttons */}
          <AnimatePresence>
            {showActions && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`absolute top-0 flex items-center gap-0.5 rounded-xl border p-1 shadow-lg z-10 ${mine ? "right-full mr-2" : "left-full ml-2"}`}
                style={{ background: "var(--card-solid)", borderColor: "var(--border)" }}>
                {[
                  { icon: Reply, label: "Balas", action: () => onReply(m) },
                  { icon: Copy, label: "Salin", action: () => onCopy(m.message) },
                  { icon: Pin, label: "Sematkan", action: () => onPin(m) },
                  ...(mine ? [
                    { icon: Edit3, label: "Edit", action: () => onEdit(m) },
                    { icon: Trash2, label: "Hapus", action: () => onDelete(m), color: "var(--coral)" },
                  ] : []),
                ].map(({ icon: Icon, label, action, color }) => (
                  <button key={label} onClick={action} title={label}
                    className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors hover:bg-[var(--hover)]"
                    style={{ color: color || "var(--text-2)" }}>
                    <Icon size={13} />
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {mine && <Avatar src={m.avatar_url} name={m.name} size={34} role={roleKey} />}
    </motion.div>
  );
}

function OnlineUser({ u, roleMap }) {
  const roleKey = roleMap[u.email?.toLowerCase()] || u.role || "member";
  return (
    <div className="flex items-center gap-2.5 rounded-xl border px-2.5 py-2 transition-colors hover:bg-[var(--hover)]"
      style={{ borderColor: "var(--border)", background: "var(--glass)" }}>
      <div className="relative">
        <Avatar src={u.avatar_url} name={u.name} size={32} role={roleKey} />
        <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2"
          style={{ background: "var(--green)", borderColor: "var(--card-solid)" }} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[0.72rem] font-semibold" style={{ color: "var(--text)" }}>{u.name || u.email?.split("@")[0]}</div>
        <div className="mt-0.5">
          <RoleBadge roleKey={roleKey} size="xs" showLabel />
        </div>
      </div>
    </div>
  );
}

export default function Chat() {
  const session = getSession();
  const myRole = useRole();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [online, setOnline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyTo, setReplyTo] = useState(null);
  const [editMsg, setEditMsg] = useState(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [showDiscordSettings, setShowDiscordSettings] = useState(false);
  const [discordUrl, setDiscordUrl] = useState(() => getDiscordWebhook());
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const fileRef = useRef(null);

  const load = useCallback(async () => {
    try {
      const list = await base44.entities.ChatMessage.list("-created_date", 80);
      setMessages(list.slice().reverse());
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const unsub = base44.entities.ChatMessage.subscribe(load);
    let alive = true;
    const refreshOnline = async () => { const l = await listOnline(); if (alive) setOnline(l); };
    refreshOnline();
    const u2 = subscribeOnline(refreshOnline);
    return () => { alive = false; unsub?.(); u2?.(); };
  }, [load]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  // Build email → role map from online sessions (which have role field).
  const roleMap = useMemo(() => {
    const m = {};
    online.forEach((u) => { if (u.email) m[u.email.toLowerCase()] = u.role || "member"; });
    if (session?.email) m[session.email.toLowerCase()] = myRole.key;
    return m;
  }, [online, session?.email, myRole.key]);

  const send = async () => {
    const msg = editMsg ? text.trim() : text.trim();
    if (!msg || sending) return;
    setSending(true);

    if (editMsg) {
      try {
        await base44.entities.ChatMessage.update(editMsg.id, { message: msg });
        setEditMsg(null);
        setText("");
      } catch { toast.error("Gagal mengedit pesan"); }
      setSending(false);
      return;
    }

    setText("");
    setReplyTo(null);
    try {
      await base44.entities.ChatMessage.create({
        name: session?.name || session?.email || "Pengguna",
        email: session?.email || "",
        avatar_url: session?.avatar_url || "",
        message: msg,
        reply_to: replyTo ? `${replyTo.name}: ${replyTo.message.substring(0, 60)}` : null,
      });
      // Discord notification (fire-and-forget, don't block chat)
      sendDiscordNotification({ name: session?.name, email: session?.email, message: msg });
    } catch { setText(msg); toast.error("Gagal mengirim pesan"); }
    setSending(false);
    inputRef.current?.focus();
  };

  const handleDelete = async (m) => {
    try {
      await base44.entities.ChatMessage.delete(m.id);
      toast.success("Pesan dihapus");
    } catch { toast.error("Gagal menghapus"); }
  };

  const handleCopy = async (txt) => {
    await navigator.clipboard.writeText(txt);
    toast.success("Disalin ke clipboard");
  };

  const handleEdit = (m) => {
    setEditMsg(m);
    setText(m.message);
    inputRef.current?.focus();
  };

  const handleImageUpload = async (file) => {
    if (!file) return;
    setUploadingImg(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.entities.ChatMessage.create({
        name: session?.name || session?.email || "Pengguna",
        email: session?.email || "",
        avatar_url: session?.avatar_url || "",
        message: "📷 Foto",
        image_url: file_url,
      });
      sendDiscordNotification({ name: session?.name, email: session?.email, message: "📷 Foto terkirim" });
    } catch { toast.error("Gagal upload foto"); }
    setUploadingImg(false);
  };

  const onKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const filteredMessages = searchQuery
    ? messages.filter((m) => m.message?.toLowerCase().includes(searchQuery.toLowerCase()) || m.name?.toLowerCase().includes(searchQuery.toLowerCase()))
    : messages;

  const onlineSorted = [...online].sort((a, b) => {
    const ra = roleMap[a.email?.toLowerCase()] || "member";
    const rb = roleMap[b.email?.toLowerCase()] || "member";
    const order = { super_master: 0, master: 1, member: 2 };
    return (order[ra] ?? 3) - (order[rb] ?? 3);
  });

  return (
    <div className="flex h-[calc(100vh-56px)] flex-col" style={{ background: "var(--bg)" }}>
      <div className="flex flex-1 overflow-hidden">
        {/* Chat Panel */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Header */}
          <div className="relative flex flex-shrink-0 items-center gap-3 overflow-hidden border-b px-4 py-3.5"
            style={{ background: "var(--card-solid)", borderColor: "var(--border)" }}>
            <div className="pointer-events-none absolute inset-0 opacity-30" style={{ background: "linear-gradient(90deg, rgba(var(--acc-rgb),0.08) 0%, transparent 50%)" }} />
            <div className="relative flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)" }}>
              <img src={CHAT_LOGO} alt="Chat" className="h-9 w-9 object-contain" />
            </div>
            <div className="relative flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Hash size={13} style={{ color: "var(--text-3)" }} />
                <div className="text-[0.95rem] font-bold" style={{ color: "var(--text)" }}>Ruang Koordinasi Tim</div>
              </div>
              <div className="mt-0.5 flex items-center gap-1.5 text-[0.65rem]" style={{ color: "var(--text-3)" }}>
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--green)", animation: "ds-pulse 2s infinite" }} />
                {online.length} anggota online · {messages.length} pesan
              </div>
            </div>
            <div className="relative flex items-center gap-1">
              <button onClick={() => setShowDiscordSettings(true)} title="Notifikasi Discord"
                className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-[var(--hover)]"
                style={{ color: getDiscordWebhook() ? "var(--green)" : "var(--text-2)" }}>
                <Bell size={15} />
                {getDiscordWebhook() && <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full" style={{ background: "var(--green)" }} />}
              </button>
              <button onClick={() => setShowSearch(!showSearch)}
                className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-[var(--hover)]"
                style={{ color: showSearch ? "var(--acc)" : "var(--text-2)" }}>
                <Search size={15} />
              </button>
              <button onClick={() => setShowSidebar(!showSidebar)}
                className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-[var(--hover)]"
                style={{ color: showSidebar ? "var(--acc)" : "var(--text-2)" }}>
                <Users size={15} />
              </button>
            </div>
          </div>

          {/* Search bar */}
          <AnimatePresence>
            {showSearch && (
              <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} style={{ overflow: "hidden" }}>
                <div className="flex items-center gap-2 border-b px-4 py-2.5" style={{ borderColor: "var(--border)", background: "var(--bg-2)" }}>
                  <Search size={13} style={{ color: "var(--text-3)" }} />
                  <input autoFocus value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari pesan atau pengirim…"
                    className="flex-1 bg-transparent text-[0.8rem] outline-none" style={{ color: "var(--text)" }} />
                  {searchQuery && <button onClick={() => setSearchQuery("")}><X size={13} style={{ color: "var(--text-3)" }} /></button>}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Messages */}
          <div ref={scrollRef} className="ds-scroll flex-1 overflow-y-auto px-4 py-4"
            style={{ backgroundImage: "radial-gradient(circle at 50% 50%, rgba(var(--acc-rgb),0.02) 0%, transparent 70%)" }}>
            {loading ? (
              <div className="flex h-full items-center justify-center">
                <Loader2 size={28} className="animate-spin" style={{ color: "var(--text-3)" }} />
              </div>
            ) : filteredMessages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl"
                  style={{ background: "rgba(var(--acc-rgb),0.08)", border: "1px solid rgba(var(--acc-rgb),0.15)" }}>
                  <Radio size={36} style={{ color: "var(--acc)" }} />
                </div>
                <p className="text-[0.92rem] font-bold" style={{ color: "var(--text)" }}>Belum ada pesan</p>
                <p className="mt-1 text-[0.74rem]" style={{ color: "var(--text-3)" }}>Mulai koordinasi tim sekarang!</p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {filteredMessages.map((m) => {
                  const mine = m.email === session?.email;
                  const roleKey = roleMap[m.email?.toLowerCase()] || "member";
                  return (
                    <MessageBubble key={m.id} m={m} mine={mine} roleKey={mine ? myRole.key : roleKey}
                      onReply={(msg) => { setReplyTo(msg); inputRef.current?.focus(); }}
                      onCopy={handleCopy}
                      onDelete={handleDelete}
                      onEdit={handleEdit}
                      onPin={() => toast.info("Fitur pin segera hadir")}
                    />
                  );
                })}
              </div>
            )}
          </div>

          {/* Reply banner */}
          <AnimatePresence>
            {(replyTo || editMsg) && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                className="flex items-center gap-2 border-t px-4 py-2.5"
                style={{ borderColor: "var(--border)", background: "rgba(var(--acc-rgb),0.06)" }}>
                <div className="flex-1 min-w-0">
                  <div className="text-[0.62rem] font-bold" style={{ color: "var(--acc)" }}>
                    {editMsg ? "✏️ Edit pesan" : `↩ Balas ${replyTo?.name || replyTo?.email?.split("@")[0]}`}
                  </div>
                  <div className="truncate text-[0.7rem]" style={{ color: "var(--text-3)" }}>
                    {editMsg?.message || replyTo?.message}
                  </div>
                </div>
                <button onClick={() => { setReplyTo(null); setEditMsg(null); setText(""); }}
                  className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-[var(--hover)]"
                  style={{ color: "var(--text-3)" }}>
                  <X size={13} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Emoji picker */}
          <AnimatePresence>
            {showEmoji && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                className="flex flex-wrap gap-1.5 border-t px-4 py-3"
                style={{ borderColor: "var(--border)", background: "var(--card-solid)" }}>
                {EMOJIS.map((e) => (
                  <button key={e} onClick={() => { setText((t) => t + e); setShowEmoji(false); inputRef.current?.focus(); }}
                    className="flex h-9 w-9 items-center justify-center rounded-xl text-lg transition-all hover:scale-125 hover:bg-[var(--hover)]">
                    {e}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input */}
          <div className="flex-shrink-0 border-t p-3" style={{ borderColor: "var(--border)", background: "var(--card-solid)" }}>
            <div className="flex items-end gap-2 rounded-2xl border px-3 py-2"
              style={{ background: "var(--bg-2)", borderColor: "var(--border)" }}>
              <button onClick={() => setShowEmoji(!showEmoji)}
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg transition-colors hover:bg-[var(--hover)]"
                style={{ color: showEmoji ? "var(--acc)" : "var(--text-3)" }}>
                <Smile size={17} />
              </button>

              <button onClick={() => fileRef.current?.click()} disabled={uploadingImg}
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg transition-colors hover:bg-[var(--hover)]"
                style={{ color: uploadingImg ? "var(--acc)" : "var(--text-3)" }}>
                {uploadingImg ? <Loader2 size={17} className="animate-spin" /> : <ImageIcon size={17} />}
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e.target.files?.[0])} />

              <textarea ref={inputRef} value={text} onChange={(e) => setText(e.target.value)} onKeyDown={onKey}
                rows={1} placeholder={editMsg ? "Edit pesan…" : "Tulis pesan koordinasi… (Enter kirim, Shift+Enter baris baru)"}
                className="ds-scroll max-h-28 flex-1 resize-none bg-transparent px-1 py-1.5 text-[0.82rem] outline-none"
                style={{ color: "var(--text)" }} />

              <button onClick={send} disabled={sending || !text.trim()}
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-black transition-all hover:scale-105 disabled:opacity-40"
                style={{ background: "var(--acc-grad)", boxShadow: "0 4px 12px rgba(var(--acc-rgb),0.4)" }}>
                {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar - Online Users */}
        <AnimatePresence>
          {showSidebar && (
            <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 240, opacity: 1 }} exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="flex flex-shrink-0 flex-col overflow-hidden border-l"
              style={{ borderColor: "var(--border)", background: "var(--card-solid)" }}>
              <div className="flex items-center justify-between border-b px-3 py-3" style={{ borderColor: "var(--border)" }}>
                <div className="flex items-center gap-2">
                  <Wifi size={12} style={{ color: "var(--green)" }} />
                  <span className="text-[0.68rem] font-bold uppercase tracking-widest" style={{ color: "var(--text-3)" }}>
                    Online ({online.length})
                  </span>
                </div>
              </div>
              <div className="ds-scroll flex-1 overflow-y-auto p-2 space-y-1.5">
                {onlineSorted.map((u) => <OnlineUser key={u.id} u={u} roleMap={roleMap} />)}
                {online.length === 0 && (
                  <p className="p-3 text-center text-[0.7rem]" style={{ color: "var(--text-3)" }}>Tidak ada yang online</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Discord Webhook Settings Modal */}
      <AnimatePresence>
        {showDiscordSettings && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowDiscordSettings(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[460px] overflow-hidden rounded-2xl border"
              style={{ background: "var(--card-solid)", borderColor: "var(--border)" }}>
              {/* Header */}
              <div className="flex items-center justify-between border-b px-5 py-4" style={{ borderColor: "var(--border)" }}>
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: "rgba(88,101,242,0.15)", border: "1px solid rgba(88,101,242,0.3)" }}>
                    <Bell size={16} style={{ color: "#5865F2" }} />
                  </div>
                  <div>
                    <div className="text-[0.88rem] font-bold" style={{ color: "var(--text)" }}>Notifikasi Discord</div>
                    <div className="text-[0.65rem]" style={{ color: "var(--text-3)" }}>Kirim notifikasi pesan baru ke server Discord</div>
                  </div>
                </div>
                <button onClick={() => setShowDiscordSettings(false)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-[var(--hover)]" style={{ color: "var(--text-3)" }}>
                  <X size={16} />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 space-y-4">
                <div>
                  <label className="mb-1.5 block text-[0.72rem] font-bold" style={{ color: "var(--text-2)" }}>Discord Webhook URL</label>
                  <input
                    value={discordUrl}
                    onChange={(e) => setDiscordUrl(e.target.value)}
                    placeholder="https://discord.com/api/webhooks/..."
                    className="w-full rounded-xl border px-3 py-2.5 text-[0.78rem] outline-none"
                    style={{ background: "var(--bg-2)", borderColor: "var(--border)", color: "var(--text)" }} />
                  {discordUrl && !isDiscordWebhookValid(discordUrl) && (
                    <p className="mt-1.5 text-[0.65rem] font-medium" style={{ color: "var(--coral)" }}>
                      ⚠ URL webhook tidak valid. Format: https://discord.com/api/webhooks/...
                    </p>
                  )}
                </div>

                <div className="rounded-xl border p-3 text-[0.68rem] leading-relaxed" style={{ borderColor: "var(--border)", background: "var(--glass)", color: "var(--text-3)" }}>
                  <strong style={{ color: "var(--text-2)" }}>Cara setup:</strong>
                  <ol className="mt-1.5 ml-4 list-decimal space-y-1">
                    <li>Buka server Discord → pilih channel</li>
                    <li>Klik ⚙️ Edit Channel → Integrations → Webhooks</li>
                    <li>Klik "New Webhook" → salin URL</li>
                    <li>Tempel URL di atas → klik Simpan</li>
                  </ol>
                </div>

                <div className="flex items-center justify-between rounded-xl border p-3" style={{ borderColor: "var(--border)", background: "var(--glass)" }}>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ background: getDiscordWebhook() ? "var(--green)" : "var(--text-3)" }} />
                    <span className="text-[0.72rem] font-medium" style={{ color: "var(--text-2)" }}>
                      {getDiscordWebhook() ? "Notifikasi aktif" : "Notifikasi nonaktif"}
                    </span>
                  </div>
                  {getDiscordWebhook() && (
                    <button onClick={() => { setDiscordWebhook(""); setDiscordUrl(""); toast.success("Webhook Discord dihapus"); }}
                      className="text-[0.68rem] font-bold" style={{ color: "var(--coral)" }}>
                      Putuskan
                    </button>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="flex gap-2 border-t p-4" style={{ borderColor: "var(--border)" }}>
                <button onClick={() => setShowDiscordSettings(false)}
                  className="flex-1 rounded-xl border py-2.5 text-[0.78rem] font-bold transition-colors hover:bg-[var(--hover)]"
                  style={{ borderColor: "var(--border)", color: "var(--text-2)" }}>
                  Batal
                </button>
                <button
                  onClick={() => {
                    const url = discordUrl.trim();
                    if (url && !isDiscordWebhookValid(url)) { toast.error("URL webhook tidak valid"); return; }
                    setDiscordWebhook(url);
                    toast.success(url ? "Notifikasi Discord diaktifkan!" : "Notifikasi Discord dinonaktifkan");
                    setShowDiscordSettings(false);
                  }}
                  className="flex-1 rounded-xl py-2.5 text-[0.78rem] font-bold text-black transition-transform hover:scale-[1.02]"
                  style={{ background: "var(--acc-grad)" }}>
                  Simpan
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}