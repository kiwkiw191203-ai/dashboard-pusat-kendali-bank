import React, { useEffect, useState } from "react";
import { Outlet, useLocation, useOutlet } from "react-router-dom";
import { motion } from "framer-motion";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import CommandPalette from "@/components/dashboard/CommandPalette";
import { heartbeat, startSession, getCurrentSessionId } from "@/lib/dashboardSession";
import { getSession, getProfileFor } from "@/lib/dashboardAuth";
import { refreshRole, getRole } from "@/lib/permissions";
import { loadMyPermissions } from "@/lib/featurePermissionStore";
import Splash from "@/components/dashboard/Splash";
import FeatureGuard from "@/components/dashboard/FeatureGuard";
import NotificationListener from "@/components/dashboard/NotificationListener";
import SystemAlertBanner from "@/components/dashboard/SystemAlertBanner";
import LiveTicker from "@/components/dashboard/LiveTicker";
import WelcomeModal from "@/components/dashboard/WelcomeModal";
import { base44 } from "@/api/base44Client";

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem("cs-nav-collapsed") === "1");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [splash, setSplash] = useState(true);
  const location = useLocation();
  const outlet = useOutlet();

  useEffect(() => {
    (async () => {
      const s = getSession();
      await refreshRole();
      if (s && !getCurrentSessionId()) {
        const prof = getProfileFor(s.email) || {};
        const role = getRole();
        await startSession({ email: s.email, name: s.name, avatar_url: s.avatar_url, cover_url: prof.cover_url, role: role.key });
        try {
          await base44.entities.LiveEvent.create({
            actor_name: s.name || s.email, actor_email: s.email, actor_role: role.key,
            event_type: "login", message: `${(s.name || s.email).toUpperCase()} TELAH LOGIN`, accent_color: "var(--green)",
          });
        } catch {}
        try {
          await base44.entities.PushNotification.create({
            target_email: "*", target_name: "", from_email: s.email, from_name: s.name || s.email,
            from_role: role.key, title: "USER LOGIN",
            message: `${(s.name || s.email).toUpperCase()} TELAH LOGIN KE SISTEM`, type: "info", read: false,
          });
        } catch {}
      }
      heartbeat();
    })();
    // Heartbeat + sinkron role dari database — cadangan kalau event realtime terlewat.
    const id = setInterval(() => { heartbeat(); refreshRole(); }, 20000);
    const onVis = () => { if (!document.hidden) { heartbeat(); refreshRole(); } };
    document.addEventListener("visibilitychange", onVis);

    // Realtime: begitu admin mengubah role akun ini di User entity, langsung
    // sinkronkan role + hak akses fitur — tanpa menunggu interval atau F5.
    let unsubUser;
    try {
      unsubUser = base44.entities.User.subscribe((event) => {
        const s = getSession();
        if (event?.data?.email && s?.email && event.data.email.toLowerCase() === s.email.toLowerCase()) {
          refreshRole().then(loadMyPermissions);
        }
      });
    } catch { unsubUser = () => {}; }

    return () => { clearInterval(id); document.removeEventListener("visibilitychange", onVis); unsubUser?.(); };
  }, []);

  const toggleCollapse = (v) => {
    setCollapsed(v);
    localStorage.setItem("cs-nav-collapsed", v ? "1" : "0");
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--bg)" }}>
      {splash && <Splash onDone={() => setSplash(false)} />}
      <Sidebar collapsed={collapsed} setCollapsed={toggleCollapse} open={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="flex flex-1 flex-col gap-2.5 overflow-hidden p-2.5">
        <Topbar onMenu={() => setMobileOpen(true)} onOpenSearch={() => setSearchOpen(true)} />
        <LiveTicker />

        <main className="ds-scroll flex-1 overflow-y-auto">
          {/* Tanpa AnimatePresence mode="wait" — saat pindah halaman cepat, exit
              animation bisa tertahan dan konten halaman baru tidak muncul. */}
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}>
            <FeatureGuard>{outlet}</FeatureGuard>
          </motion.div>
        </main>
      </div>

      <CommandPalette open={searchOpen} onOpenChange={setSearchOpen} />
      <SystemAlertBanner />
      <NotificationListener />
      {!splash && <WelcomeModal />}
    </div>
  );
}