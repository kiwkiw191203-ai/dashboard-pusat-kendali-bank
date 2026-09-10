import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Menu, Search, LogOut, Sun, Moon, Command } from "lucide-react";
import { useClock } from "@/components/dashboard/utils";
import { useTheme } from "@/components/dashboard/ThemeContext";
import { base44 } from "@/api/base44Client";
import { getSession, logout } from "@/lib/dashboardAuth";
import { endSession } from "@/lib/dashboardSession";
import { useRole } from "@/lib/permissions";
import NotificationCenter from "@/components/dashboard/NotificationCenter";
import LiveUsersPanel from "@/components/dashboard/LiveUsersPanel";

const THEMES = [
  { id: "dark", icon: Moon, label: "Gelap" },
  { id: "light", icon: Sun, label: "Terang" },
];

const ROUTE_NAMES = {
  "/": "Overview", "/dashboard": "Dashboard", "/notes": "Notes", "/activity": "Activity Log",
  "/permissions": "Permissions", "/roles": "Atur Role", "/online": "Pengguna Online",
  "/feature-builder": "Feature Builder", "/security": "Security", "/files": "File Kerja CS",
  "/predict": "Prediksi Togel", "/analyzer": "Hitung Freespin", "/shortcut": "Pintasan B.Qris",
  "/ticket": "Kode Tiket", "/win": "Tangkapan Menang", "/bank": "Profil Bank", "/rrn": "RRN Qris",
  "/hlxpro": "AI Assistant", "/chat": "Chat Koordinasi", "/settings": "Pengaturan",
};

export default function Topbar({ onMenu, onOpenSearch }) {
  const clock = useClock();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const session = getSession();
  const role = useRole();
  const handleLogout = async () => {
    await endSession();
    logout();
    try { base44.auth.logout("/login"); } catch { navigate("/login"); }
  };

  const currentName = ROUTE_NAMES[location.pathname] || "Halaman";

  return (
    <header className="nav-surface flex flex-shrink-0 items-center justify-between gap-3 rounded-2xl border px-4 py-2.5"
      style={{ borderColor: "var(--nav-border)", boxShadow: "var(--shadow-sm)" }}>
      {/* Left: menu + breadcrumb */}
      <div className="flex items-center gap-3">
        <button onClick={onMenu} className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-[var(--hover)] lg:hidden" style={{ color: "var(--text-2)" }}>
          <Menu size={18} />
        </button>
        <div className="flex items-center gap-2">
          <motion.div layoutId="topbar-breadcrumb" className="flex items-center gap-2">
            <span className="text-[0.78rem] font-medium" style={{ color: "var(--text-3)" }}>Suite</span>
            <span style={{ color: "var(--text-3)" }}>·</span>
            <span className="font-display text-[0.82rem] font-semibold" style={{ color: "var(--text)" }}>{currentName}</span>
          </motion.div>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1.5">
        {/* Search */}
        <button
          onClick={onOpenSearch}
          className="hidden items-center gap-2 rounded-xl border px-3 py-1.5 text-[0.72rem] transition-colors hover:bg-[var(--hover)] sm:flex"
          style={{ borderColor: "var(--border)", color: "var(--text-3)" }}>
          <Search size={14} />
          <span>Cari…</span>
          <kbd className="ml-1.5 flex items-center gap-0.5 rounded border px-1.5 py-0.5 text-[0.55rem] font-semibold" style={{ borderColor: "var(--border)" }}>
            <Command size={9} />K
          </kbd>
        </button>
        <button onClick={onOpenSearch} className="flex h-8 w-8 items-center justify-center rounded-lg border transition-colors hover:bg-[var(--hover)] sm:hidden" style={{ borderColor: "var(--border)", color: "var(--text-2)" }}>
          <Search size={15} />
        </button>

        {/* Live users */}
        <LiveUsersPanel />

        {/* Notifications */}
        <NotificationCenter />

        {/* Theme */}
        <div className="hidden items-center gap-0.5 rounded-xl border p-0.5 sm:flex" style={{ borderColor: "var(--border)" }}>
          {THEMES.map((t) => (
            <button key={t.id} onClick={() => setTheme(t.id)} title={t.label}
              className="flex h-7 w-7 items-center justify-center rounded-lg transition-all"
              style={theme === t.id ? { background: "var(--acc-grad)", color: "#000" } : { color: "var(--text-3)" }}>
              <t.icon size={13} />
            </button>
          ))}
        </div>

        {/* Clock */}
        <div className="hidden items-center rounded-xl border px-2.5 py-1.5 font-jb text-[0.72rem] md:flex" style={{ borderColor: "var(--border)", color: "var(--acc)" }}>
          {clock}
        </div>

        {/* Logout */}
        <button onClick={handleLogout} title="Logout" className="flex h-8 w-8 items-center justify-center rounded-xl border transition-colors hover:bg-red-950" style={{ borderColor: "rgba(239,68,68,0.3)", color: "var(--coral)", background: "rgba(239,68,68,0.06)" }}>
          <LogOut size={15} />
        </button>
      </div>
    </header>
  );
}