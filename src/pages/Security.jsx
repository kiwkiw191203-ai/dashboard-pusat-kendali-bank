import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Lock, KeyRound, Gauge, DatabaseBackup, FileCheck2, Fingerprint, ServerCog, Download, Upload, Wifi } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import PageHead from "@/components/dashboard/PageHead";
import { listOnline, subscribeOnline } from "@/lib/dashboardSession";
import { listActivity } from "@/lib/dashboardSession";

const fade = (i = 0) => ({ initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.35, delay: i * 0.04 } });

export default function Security() {
  const [online, setOnline] = useState([]);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    let alive = true;
    const refresh = async () => {
      const [o, l] = await Promise.all([listOnline(), listActivity(100)]);
      if (!alive) return;
      setOnline(o); setLogs(l);
    };
    refresh();
    const u = subscribeOnline(refresh);
    return () => { alive = false; u?.(); };
  }, []);

  const killSession = async (s) => {
    try { await base44.entities.OnlineSession.delete(s.id); toast.success("Sesi dihentikan"); } catch { toast.error("Gagal menghentikan sesi"); }
  };

  const exportBackup = async () => {
    try {
      const [perms, features] = await Promise.all([
        base44.entities.FeaturePermission.list("-created_date", 500).catch(() => []),
        base44.entities.CustomFeature.list("order", 200).catch(() => []),
      ]);
      const data = { exported_at: new Date().toISOString(), permissions: perms, features };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `backup-${Date.now()}.json`; a.click();
      URL.revokeObjectURL(url);
      toast.success("Backup diunduh");
    } catch { toast.error("Gagal backup"); }
  };

  const importBackup = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const data = JSON.parse(reader.result);
        if (data.permissions?.length) await base44.entities.FeaturePermission.bulkCreate(data.permissions.map((p) => ({ email: p.email, feature: p.feature, enabled: p.enabled })));
        if (data.features?.length) await base44.entities.CustomFeature.bulkCreate(data.features.map((f) => ({ name: f.name, slug: f.slug, icon: f.icon, icon_color: f.icon_color, description: f.description, hidden: f.hidden, order: f.order })));
        toast.success("Backup dipulihkan");
      } catch { toast.error("Gagal restore"); }
    };
    reader.readAsText(file);
  };

  const errorCount = logs.filter((l) => l.action === "system_error").length;
  const loginCount = logs.filter((l) => l.action === "login").length;

  const PILLARS = [
    { icon: KeyRound, color: "var(--acc)", title: "JWT Auth", desc: "Token sesi ditandatangani & terverifikasi setiap permintaan.", status: "Aktif" },
    { icon: Fingerprint, color: "var(--blue)", title: "2FA Ready", desc: "Dua faktor siap diaktifkan per-akun untuk login lebih aman.", status: "Siap" },
    { icon: Gauge, color: "var(--coral)", title: "Rate Limit", desc: "Pembatasan request per pengguna mencegah penyalahgunaan API.", status: "Aktif" },
    { icon: Lock, color: "var(--green)", title: "Encryption", desc: "Data sensitif terenkripsi saat transit & penyimpanan.", status: "Aktif" },
    { icon: FileCheck2, color: "var(--violet)", title: "Permission Check", desc: "Setiap modul memvalidasi role & izin email secara realtime.", status: "Aktif" },
    { icon: ServerCog, color: "var(--teal)", title: "Session Management", desc: "Sesi & heartbeat dipantau; sesi dapat dihentikan paksa.", status: `${online.length} aktif` },
  ];

  return (
    <div className="w-full p-4 md:p-6">
      <PageHead icon="fa-shield-halved" color="var(--coral)" title="SECURITY" subtitle="Audit, permission, session & backup"
        badges={[{ icon: "fa-circle-exclamation", text: `${errorCount} Error`, color: errorCount ? "var(--coral)" : "var(--green)" }]} />

      {/* Pillars */}
      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {PILLARS.map((p, i) => (
          <motion.div key={p.title} {...fade(i)} className="rounded-2xl border p-4" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            <div className="mb-3 flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ color: p.color, background: `${p.color}14` }}><p.icon size={20} /></div>
              <span className="rounded-md px-2 py-0.5 text-[0.6rem] font-bold" style={{ color: p.color, background: `${p.color}14` }}>{p.status}</span>
            </div>
            <h3 className="text-[0.88rem] font-bold" style={{ color: "var(--text)" }}>{p.title}</h3>
            <p className="mt-1 text-[0.74rem] leading-relaxed" style={{ color: "var(--text-2)" }}>{p.desc}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Active sessions */}
        <motion.div {...fade(0)} className="lg:col-span-2 rounded-2xl border p-4" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wifi size={16} style={{ color: "var(--green)" }} />
              <h2 className="text-[0.92rem] font-bold" style={{ color: "var(--text)" }}>Sesi Aktif</h2>
            </div>
            <span className="text-[0.66rem]" style={{ color: "var(--text-3)" }}>{online.length} online</span>
          </div>
          <div className="ds-scroll max-h-[360px] space-y-2 overflow-y-auto">
            {online.length === 0 ? (
              <div className="py-8 text-center text-[0.8rem]" style={{ color: "var(--text-3)" }}>Tidak ada sesi aktif.</div>
            ) : online.map((s) => (
              <div key={s.id} className="flex items-center gap-3 rounded-xl border p-3" style={{ background: "var(--glass)", borderColor: "var(--border)" }}>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold text-black" style={{ background: "var(--acc-grad)" }}>{(s.name || s.email)[0]?.toUpperCase()}</div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[0.8rem] font-semibold" style={{ color: "var(--text)" }}>{s.name || s.email}</div>
                  <div className="truncate font-mono text-[0.62rem]" style={{ color: "var(--text-3)" }}>{s.ip} · {[s.city, s.country].filter(Boolean).join(", ") || "—"}</div>
                </div>
                <button onClick={() => killSession(s)} className="flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[0.66rem] font-semibold transition-colors hover:bg-[var(--hover)]" style={{ borderColor: "var(--border)", color: "var(--coral)" }}>
                  <ShieldCheck size={12} /> Hentikan
                </button>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Backup */}
        <motion.div {...fade(1)} className="space-y-4">
          <div className="rounded-2xl border p-4" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            <div className="mb-3 flex items-center gap-2">
              <DatabaseBackup size={16} style={{ color: "var(--blue)" }} />
              <h2 className="text-[0.92rem] font-bold" style={{ color: "var(--text)" }}>Backup & Restore</h2>
            </div>
            <button onClick={exportBackup} className="mb-2.5 flex w-full items-center justify-center gap-2 rounded-xl border py-2.5 text-[0.78rem] font-semibold transition-colors hover:bg-[var(--hover)]" style={{ borderColor: "var(--border)", color: "var(--text)" }}>
              <Download size={15} style={{ color: "var(--green)" }} /> Export Backup (JSON)
            </button>
            <label className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border py-2.5 text-[0.78rem] font-semibold transition-colors hover:bg-[var(--hover)]" style={{ borderColor: "var(--border)", color: "var(--text)" }}>
              <Upload size={15} style={{ color: "var(--acc)" }} /> Restore Backup
              <input type="file" accept="application/json" className="hidden" onChange={importBackup} />
            </label>
            <p className="mt-2.5 text-[0.66rem] leading-relaxed" style={{ color: "var(--text-3)" }}>Backup mencakup permission & fitur kustom. Restore menambahkan data (tidak menimpa).</p>
          </div>

          <div className="rounded-2xl border p-4" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            <div className="mb-2 flex items-center gap-2">
              <FileCheck2 size={16} style={{ color: "var(--violet)" }} />
              <h2 className="text-[0.92rem] font-bold" style={{ color: "var(--text)" }}>Audit Ringkas</h2>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="rounded-xl border p-3" style={{ background: "var(--glass)", borderColor: "var(--border)" }}>
                <div className="font-mono text-xl font-bold" style={{ color: "var(--green)" }}>{loginCount}</div>
                <div className="text-[0.62rem]" style={{ color: "var(--text-3)" }}>Login tercatat</div>
              </div>
              <div className="rounded-xl border p-3" style={{ background: "var(--glass)", borderColor: "var(--border)" }}>
                <div className="font-mono text-xl font-bold" style={{ color: errorCount ? "var(--coral)" : "var(--green)" }}>{errorCount}</div>
                <div className="text-[0.62rem]" style={{ color: "var(--text-3)" }}>System error</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}