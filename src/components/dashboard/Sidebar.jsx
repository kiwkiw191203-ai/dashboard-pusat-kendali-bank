import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import {
  LayoutDashboard, Home, Bot, StickyNote, FileText, Dices, Calculator,
  Zap, Ticket, Trophy, Landmark, Receipt, MessageCircle, Radio, Activity,
  Settings, PanelLeftClose, PanelLeftOpen, X, Crown, Folder, ListOrdered, ShieldCheck, AlertTriangle, ScanLine, CameraIcon, Users as UsersIcon, Puzzle, Target, Layers, Hash, Globe, ChevronRight, Database, Smartphone,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { getSession } from "@/lib/dashboardAuth";
import { useRole } from "@/lib/permissions";
import { getIcon } from "@/lib/featureIcons";
import { useMyPermissions } from "@/lib/featurePermissionStore";
import BrandLogo from "@/components/dashboard/BrandLogo";
import ProfilePopup from "@/components/dashboard/ProfilePopup";
import { logout as dashLogout } from "@/lib/dashboardAuth";
import { endSession } from "@/lib/dashboardSession";

const ROUTE_FEATURE = {
  "/": "overview", "/dashboard": "dashboard", "/hlxpro": "ai", "/notes": "notes",
  "/files": "files", "/predict": "predict", "/analyzer": "analyzer", "/shortcut": "shortcut",
  "/ticket": "ticket", "/win": "win", "/bank": "bank", "/rrn": "rrn", "/result-togel": "result_togel",
  "/code-filter": "code_filter", "/auto-screenshot": "auto_screenshot",   "/bet-calc": "bet_calc", "/parlay-calc": "parlay_calc", "/togel-calc": "togel_calc", "/kpbi-live": "kpbi_live", "/kpbi-cek": "kpbi_cek",
  "/validasi": "validasi", "/arsip-chat": "chat_archive", "/transaction-log": "transaction_log", "/cek-hp": "cek_hp",
  "/chat": "chat", "/online": "online", "/activity": "activity",
  "/roles": "roles", "/permissions": "permissions", "/feature-builder": "feature_builder",
  "/security": "security", "/settings": "settings", "/extension-suite": "extension_suite",
};

// Nested expandable navigation structure
const NAV_GROUPS = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    color: "var(--acc)",
    items: [
      { to: "/", icon: LayoutDashboard, label: "Overview", color: "var(--acc)" },
      { to: "/dashboard", icon: Home, label: "Dashboard", color: "var(--blue)" },
    ],
  },
  {
    label: "Catatan",
    icon: StickyNote,
    color: "var(--blue)",
    items: [
      { to: "/notes", icon: StickyNote, label: "Notes", color: "var(--blue)" },
    ],
  },
  {
    label: "AI Assistant",
    icon: Bot,
    color: "var(--green)",
    items: [
      { to: "/hlxpro", icon: Bot, label: "AI Chat", color: "var(--green)", badge: "AI" },
    ],
  },
  {
    label: "Togel",
    icon: Dices,
    color: "var(--rose)",
    items: [
      { to: "/predict", icon: Dices, label: "Prediksi Togel", color: "var(--rose)", badge: "AI" },
      { to: "/result-togel", icon: ListOrdered, label: "Hasil Result Togel", color: "var(--rose)" },
      { to: "/togel-calc", icon: Hash, label: "Kalkulator Togel", color: "var(--rose)" },
      { to: "/kpbi-live", icon: Globe, label: "KPBI Live", color: "var(--green)", badge: "LIVE" },
      { to: "/kpbi-cek", icon: ShieldCheck, label: "KPBI Cek Member", color: "var(--coral)" },
    ],
  },
  {
    label: "Kalkulator",
    icon: Calculator,
    color: "var(--cyan)",
    items: [
      { to: "/bet-calc", icon: Target, label: "Kalkulator Betting", color: "var(--cyan)" },
      { to: "/parlay-calc", icon: Layers, label: "Kalkulator Parlay", color: "var(--violet)" },
    ],
  },
  {
    label: "Tiket & Freespin",
    icon: Ticket,
    color: "var(--gold)",
    items: [
      { to: "/ticket", icon: Ticket, label: "Kode Tiket", color: "var(--cyan)" },
      { to: "/analyzer", icon: Calculator, label: "Hitung Freespin", color: "var(--violet)" },
      { to: "/win", icon: Trophy, label: "Tangkapan Menang", color: "var(--gold)" },
    ],
  },
  {
    label: "Bank & QRIS",
    icon: Landmark,
    color: "var(--blue)",
    items: [
      { to: "/bank", icon: Landmark, label: "Profil Bank", color: "var(--blue)" },
      { to: "/rrn", icon: Receipt, label: "RRN Qris", color: "var(--teal)" },
      { to: "/shortcut", icon: Zap, label: "Pintasan B.Qris", color: "var(--purple)" },
      { to: "/validasi", icon: ShieldCheck, label: "Validasi Rekening", color: "var(--acc)" },
    ],
  },
  {
    label: "Data Depo / WD Qiris",
    icon: Database,
    color: "var(--blue)",
    items: [
      { to: "/transaction-log", icon: Database, label: "Data Depo / WD Qiris", color: "var(--blue)" },
    ],
  },
  {
    label: "Alat Kerja",
    icon: Smartphone,
    color: "var(--green)",
    items: [
      { to: "/cek-hp", icon: Smartphone, label: "Alat Kerja", color: "var(--green)" },
    ],
  },
  {
    label: "Kode Game",
    icon: ScanLine,
    color: "var(--purple)",
    items: [
      { to: "/code-filter", icon: ScanLine, label: "Filter Kode Game", color: "var(--purple)" },
    ],
  },
  {
    label: "Tim",
    icon: MessageCircle,
    color: "var(--green)",
    items: [
      { to: "/chat", icon: MessageCircle, label: "Chat Koordinasi", color: "var(--green)", badge: "LIVE" },
      { to: "/arsip-chat", icon: AlertTriangle, label: "Arsip Kesalahan Chat", color: "var(--coral)" },
      { to: "/online", icon: Radio, label: "Pengguna Online", color: "var(--green)", badge: "LIVE" },
      { to: "/users", icon: UsersIcon, label: "Pengguna & Akses", color: "var(--blue)" },
      { to: "/activity", icon: Activity, label: "Activity Log", color: "var(--violet)" },
    ],
  },
  {
    label: "Sistem",
    icon: Settings,
    color: "var(--blue)",
    items: [
      { to: "/settings", icon: Settings, label: "Pengaturan", color: "var(--blue)" },
      { to: "/auto-screenshot", icon: CameraIcon, label: "Auto Screenshot", color: "var(--blue)" },
      { to: "/extension-suite", icon: Puzzle, label: "Extension Suite", color: "var(--purple)" },
    ],
  },
];

// Ripple effect — appended into a clipped host so it never overflows the item.
function addRipple(e) {
  const host = e.currentTarget.querySelector?.(".ripple-host");
  if (!host) return;
  const rect = e.currentTarget.getBoundingClientRect();
  const d = Math.max(e.currentTarget.offsetWidth, e.currentTarget.offsetHeight);
  const circle = document.createElement("span");
  circle.className = "ripple";
  circle.style.width = circle.style.height = `${d}px`;
  circle.style.left = `${e.clientX - rect.left - d / 2}px`;
  circle.style.top = `${e.clientY - rect.top - d / 2}px`;
  host.appendChild(circle);
  setTimeout(() => circle.remove(), 600);
}

function NavChild({ item, collapsed, isActive }) {
  const [hovered, setHovered] = useState(false);
  const badgeColor = item.badge === "LIVE" ? "var(--teal)" : "var(--acc-2)";
  return (
    <NavLink
      to={item.to}
      title={collapsed ? item.label : undefined}
      onMouseDown={addRipple}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="nav-item group relative flex items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-[0.8rem] font-medium"
      style={{
        background: isActive
          ? "linear-gradient(90deg, rgba(46,143,212,0.22) 0%, rgba(56,189,248,0.10) 100%)"
          : hovered ? "rgba(255,255,255,0.05)" : "transparent",
        color: isActive ? "#F4F9FF" : hovered ? "var(--text)" : "var(--text-2)",
        border: `1px solid ${isActive ? "rgba(56,189,248,0.28)" : "transparent"}`,
        boxShadow: isActive ? "0 2px 10px rgba(46,143,212,0.16)" : "none",
        transition: "background 220ms ease, color 220ms ease, box-shadow 220ms ease, border-color 220ms ease",
      }}>
      <span className="ripple-host" />
      {/* Active / hover indicator — subtle cyan bar */}
      <span
        className="absolute left-0 top-1/2 -translate-y-1/2"
        style={{
          width: 2.5,
          height: isActive ? 18 : 12,
          background: isActive ? "var(--acc-2)" : "rgba(255,255,255,0.25)",
          opacity: isActive || hovered ? 1 : 0,
          transition: "opacity 220ms ease, height 220ms ease",
          borderRadius: "0 3px 3px 0",
        }}
      />
      <div
        className="nav-icon relative z-10 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md"
        style={{
          color: isActive ? "var(--acc-2)" : hovered ? "var(--text)" : "var(--text-3)",
          background: isActive ? "rgba(56,189,248,0.12)" : "transparent",
          transition: "color 220ms ease, background 220ms ease, transform 220ms ease",
        }}>
        <item.icon size={15} strokeWidth={1.9} />
      </div>
      {!collapsed && <span className="relative z-10 flex-1 truncate">{item.label}</span>}
      {!collapsed && item.badge && (
        <span className="relative z-10 rounded-md px-1.5 py-0.5 text-[0.48rem] font-semibold uppercase"
          style={{ color: badgeColor, background: `${badgeColor}1a`, border: `1px solid ${badgeColor}33`, letterSpacing: "0.08em" }}>{item.badge}</span>
      )}
    </NavLink>
  );
}

function NavGroup({ group, collapsed, location, isSuperMaster, myPerms, openGroups, toggleGroup }) {
  const visibleItems = group.items.filter((item) => {
    const fkey = ROUTE_FEATURE[item.to];
    if (fkey && !isSuperMaster && myPerms[fkey] === false) return false;
    return true;
  });

  if (!visibleItems.length) return null;

  const hasActive = visibleItems.some((item) => location.pathname === item.to);
  const GIcon = group.icon;
  const isOpen = !!openGroups[group.label];

  if (collapsed) {
    return (
      <div className="space-y-0.5">
        {visibleItems.map((item) => {
          const active = location.pathname === item.to;
          return <NavChild key={item.to} item={item} collapsed={collapsed} isActive={active} />;
        })}
      </div>
    );
  }

  return (
    <div className="mb-1">
      {/* Dropdown trigger */}
      <button
        type="button"
        onMouseDown={addRipple}
        onClick={() => toggleGroup(group.label)}
        className="nav-item group relative flex w-full items-center gap-2.5 rounded-[10px] px-3 py-2.5"
        style={{
          color: hasActive || isOpen ? "var(--text)" : "var(--text-2)",
          background: hasActive ? "rgba(56,189,248,0.07)" : "transparent",
          border: `1px solid ${hasActive ? "rgba(56,189,248,0.18)" : "transparent"}`,
          transition: "background 220ms ease, color 220ms ease, border-color 220ms ease",
        }}>
        <span className="ripple-host" />
        <div
          className="nav-icon relative z-10 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md"
          style={{ color: hasActive || isOpen ? "var(--acc-2)" : "var(--text-3)", background: hasActive ? "rgba(56,189,248,0.1)" : "transparent", transition: "color 220ms ease, background 220ms ease, transform 220ms ease" }}>
          <GIcon size={15} strokeWidth={1.9} />
        </div>
        <span className="label-caps relative z-10 flex-1 text-left text-[0.66rem]">{group.label}</span>
        <ChevronRight
          size={13}
          className="relative z-10"
          style={{ color: hasActive || isOpen ? "var(--acc-2)" : "var(--text-3)", transform: isOpen ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 220ms ease, color 220ms ease" }}
        />
      </button>

      {/* Submenu — slide down */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="sub"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden">
            <div className="ml-5 mt-0.5 space-y-0.5 py-1 pl-1.5" style={{ borderLeft: "1px solid rgba(255,255,255,0.07)" }}>
              {visibleItems.map((item) => {
                const active = location.pathname === item.to;
                return <NavChild key={item.to} item={item} collapsed={collapsed} isActive={active} />;
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Sidebar({ collapsed, setCollapsed, open, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const session = getSession();
  const role = useRole();
  const initials = (session?.name || session?.email || "C")[0]?.toUpperCase();
  const [custom, setCustom] = useState([]);
  const [profileOpen, setProfileOpen] = useState(false);
  const footerRef = useRef(null);
  const { perms: myPerms } = useMyPermissions();

  const [openGroups, setOpenGroups] = useState(() => {
    const init = {};
    NAV_GROUPS.forEach((g) => { if (g.items.some((it) => location.pathname === it.to)) init[g.label] = true; });
    return init;
  });

  // Auto-expand the group containing the active route on navigation.
  useEffect(() => {
    setOpenGroups((prev) => {
      const next = { ...prev };
      NAV_GROUPS.forEach((g) => { if (g.items.some((it) => location.pathname === it.to)) next[g.label] = true; });
      return next;
    });
  }, [location.pathname]);

  const toggleGroup = (label) => setOpenGroups((p) => ({ ...p, [label]: !p[label] }));

  const handleLogout = async () => {
    await endSession();
    dashLogout();
    try { base44.auth.logout("/login"); } catch { navigate("/login"); }
  };

  useEffect(() => {
    let u;
    const load = async () => {
      try { setCustom(await base44.entities.CustomFeature.list("order", 100)); } catch { setCustom([]); }
    };
    load();
    try { u = base44.entities.CustomFeature.subscribe(load); } catch { u = () => {}; }
    return () => u();
  }, []);

  const isSuperMaster = role.key === "super_master";
  const filteredNavGroups = NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => {
      if ((item.to === "/settings" || item.to === "/user-approvals") && !isSuperMaster) return false;
      return true;
    }),
  }));
  const customItems = custom
    .filter((f) => isSuperMaster || (!f.hidden && (!f.visible_roles?.length || f.visible_roles.includes(role.key))))
    .map((f) => ({ to: `/feature/${f.slug}`, icon: getIcon(f.icon), label: f.name, color: f.icon_color || "var(--acc)" }));

  const content = (
    <div className="nav-surface relative flex h-full flex-col" style={{ background: "linear-gradient(180deg, var(--nav-bg) 0%, var(--nav-bg-2) 100%)" }}>
      {/* Accent strip — blue → cyan */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-30 h-[2px]" style={{ background: "linear-gradient(90deg, #1E6FB0 0%, #38BDF8 55%, rgba(56,189,248,0) 100%)" }} />
      {/* Logo Header */}
      <div className="flex items-center justify-between px-3.5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className={`flex items-center gap-2.5 overflow-hidden ${collapsed ? "justify-center flex-1" : "flex-1"}`}>
          <BrandLogo size={32} />
          {!collapsed && (
            <div>
              <div className="font-display text-[0.85rem] font-semibold tracking-tight" style={{ color: "var(--nav-text)" }}>D.KERJA</div>
              <div className="label-caps text-[0.5rem]" style={{ color: "var(--acc-2)" }}>Enterprise Suite</div>
            </div>
          )}
        </div>
        <button onClick={() => setCollapsed(!collapsed)} className="hidden h-7 w-7 items-center justify-center rounded-lg transition-colors hover:bg-[var(--hover)] lg:flex flex-shrink-0" style={{ color: "var(--text-3)" }}>
          {collapsed ? <PanelLeftOpen size={14} /> : <PanelLeftClose size={14} />}
        </button>
        <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-lg lg:hidden" style={{ color: "var(--text-2)" }}>
          <X size={16} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="ds-scroll flex-1 overflow-y-auto px-2 py-3">
        {filteredNavGroups.map((group) => (
          <NavGroup key={group.label} group={group} collapsed={collapsed} location={location} isSuperMaster={isSuperMaster} myPerms={myPerms} openGroups={openGroups} toggleGroup={toggleGroup} />
        ))}

        {/* Custom Features */}
        {customItems.length > 0 && !collapsed && (
          <div className="mb-1 mt-2">
            <div className="mb-1 flex items-center gap-2 px-3">
              <div className="h-px flex-1 opacity-30" style={{ background: "var(--border)" }} />
              <span className="label-caps text-[0.55rem]" style={{ color: "var(--text-3)" }}>Kustom</span>
              <div className="h-px flex-1 opacity-30" style={{ background: "var(--border)" }} />
            </div>
            <div className="space-y-0.5">
              {customItems.map((item) => {
                const active = location.pathname === item.to;
                return <NavChild key={item.to} item={item} collapsed={collapsed} isActive={active} />;
              })}
            </div>
          </div>
        )}
      </nav>

      {/* User Footer */}
      <div className="p-2.5" style={{ borderTop: "1px solid var(--border)" }}>
        <motion.button
          ref={footerRef}
          onClick={() => setProfileOpen(true)}
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.985 }}
          transition={{ type: "spring", stiffness: 400, damping: 24 }}
          className={`group relative flex w-full items-center gap-3 rounded-xl p-2.5 ${collapsed ? "justify-center" : ""}`}
          style={{
            border: "1px solid rgba(255,255,255,0.09)",
            background: "rgba(255,255,255,0.04)",
            boxShadow: "0 2px 10px rgba(0,0,0,0.22)",
            transition: "background 220ms ease, border-color 220ms ease, box-shadow 220ms ease",
          }}>
          <div className="relative flex h-9 w-9 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg text-[0.72rem] font-semibold text-white"
            style={{ background: "linear-gradient(135deg, #1E6FB0 0%, #38BDF8 100%)" }}>
            {session?.avatar_url ? <img src={session.avatar_url} alt="" className="h-full w-full object-cover" /> : initials}
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2" style={{ background: "var(--teal)", borderColor: "var(--nav-bg)" }} />
          </div>
          {!collapsed && (
            <div className="relative min-w-0 flex-1 text-left">
              <div className="truncate text-[0.77rem] font-medium" style={{ color: "var(--nav-text)" }}>{session?.name || "Pengguna"}</div>
              <div className="truncate text-[0.58rem]" style={{ color: "var(--nav-text-3)" }}>{session?.email}</div>
            </div>
          )}
          {!collapsed && (
            <span className="label-caps flex-shrink-0 rounded-md px-1.5 py-0.5 text-[0.48rem]"
              style={{ color: "var(--acc-2)", background: "rgba(56,189,248,0.12)", border: "1px solid rgba(56,189,248,0.25)" }}>
              {role.label}
            </span>
          )}
        </motion.button>
      </div>
    </div>
  );

  return (
    <>
      <AnimatePresence>
        {open && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" />}
      </AnimatePresence>

      {/* Desktop floating sidebar */}
      <div className="hidden flex-shrink-0 lg:block" style={{ width: collapsed ? 80 : 260, transition: "width 0.3s cubic-bezier(0.22, 1, 0.36, 1)" }}>
        <div className="sidebar-float m-2.5 h-[calc(100vh-20px)] overflow-hidden">{content}</div>
      </div>

      {/* Mobile sidebar — offcanvas */}
      <AnimatePresence>
        {open && (
          <motion.aside initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }} transition={{ type: "spring", damping: 28, stiffness: 260 }}
            className="sidebar-float fixed left-2 top-2 bottom-2 z-50 w-[260px] overflow-hidden lg:hidden">
            {content}
          </motion.aside>
        )}
      </AnimatePresence>

      {createPortal(
        <ProfilePopup open={profileOpen} onClose={() => setProfileOpen(false)} onLogout={handleLogout} anchorRef={footerRef} />,
        document.body
      )}
    </>
  );
}