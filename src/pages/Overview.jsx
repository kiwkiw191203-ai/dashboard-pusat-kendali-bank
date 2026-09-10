import React, { useState } from "react";
import { motion } from "framer-motion";
import { getSession } from "@/lib/dashboardAuth";
import { useClock } from "@/components/dashboard/utils";
import BerandaPanel from "@/components/bankCenter/BerandaPanel";
import SopPanel from "@/components/bankCenter/SopPanel";
import MutasiPanel from "@/components/bankCenter/MutasiPanel";
import MinusPlusPanel from "@/components/bankCenter/MinusPlusPanel";
import DepositPanel from "@/components/bankCenter/DepositPanel";
import { BANKS } from "@/components/bankCenter/bankCenterData";

const TABS = [
  { key: "beranda", emoji: "🏠", label: "Beranda" },
  { key: "sop", emoji: "🏦", label: "SOP Set All Bank", count: 6 },
  { key: "mutasi", emoji: "📘", label: "Menu Mutasi Bank", count: 15 },
  { key: "minusplus", emoji: "⚖️", label: "Kasus Minus & Plus", count: "!" },
  { key: "deposit", emoji: "💳", label: "Deposit & Status Bank", count: BANKS.length },
];

function greeting() {
  const h = new Date().getHours();
  if (h < 11) return "Selamat pagi";
  if (h < 15) return "Selamat siang";
  if (h < 19) return "Selamat sore";
  return "Selamat malam";
}

export default function Overview() {
  const [tab, setTab] = useState("beranda");
  const clock = useClock();
  const me = getSession();
  const today = new Date().toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="w-full">
      {/* Header — Royal Sapphire banner */}
      <div className="lux-topline relative flex flex-wrap items-center justify-between gap-3 overflow-hidden px-4 py-5 md:px-6"
        style={{
          background: "linear-gradient(115deg, #0A1631 0%, #0E1F42 48%, #13295A 100%)",
          borderBottom: "1px solid var(--border)",
          boxShadow: "inset 0 -30px 60px -40px rgba(233,199,102,0.10)",
        }}>
        <div className="flex items-center gap-3.5">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl text-2xl"
            style={{ background: "rgba(233,199,102,0.12)", border: "1px solid rgba(233,199,102,0.30)" }}>🏦</span>
          <div>
            <div className="blue-text-grad text-[1.15rem] font-bold tracking-tight">Pusat Kendali Bank</div>
            <div className="micro-label mt-0.5" style={{ color: "var(--gold)" }}>Dashboard Operasional</div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[0.74rem] font-semibold"
            style={{ background: "rgba(16,185,129,0.12)", color: "var(--green)", border: "1px solid rgba(16,185,129,0.35)" }}>
            <span className="status-dot ds-pulse-dot" style={{ background: "var(--green)" }} /> LIVE
          </span>
          <span className="mono-num flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[0.72rem]"
            style={{ background: "var(--glass-2)", color: "var(--text-2)", border: "1px solid var(--border)" }}>
            <i className="fa-regular fa-calendar" style={{ color: "var(--gold)" }} /> {today}
          </span>
          <span className="mono-num flex items-center gap-2 rounded-full px-3.5 py-1.5 font-semibold text-[0.74rem]"
            style={{ background: "rgba(233,199,102,0.08)", color: "var(--gold)", border: "1px solid rgba(233,199,102,0.30)" }}>
            <i className="fa-regular fa-clock" /> {clock}
          </span>
        </div>
      </div>

      {/* Nav tabs — segmented royal control */}
      <div className="ds-scroll flex gap-1.5 overflow-x-auto px-3 py-2.5 md:px-5"
        style={{ background: "var(--bg-2)", borderBottom: "1px solid var(--border)" }}>
        {TABS.map((t) => {
          const on = tab === t.key;
          return (
            <button key={t.key} onClick={() => setTab(t.key)}
              className="flex flex-shrink-0 items-center gap-2.5 rounded-xl px-4 py-2.5 text-[0.82rem] font-semibold transition-all"
              style={{
                background: on ? "var(--acc-grad)" : "transparent",
                color: on ? "#fff" : "var(--text-3)",
                border: `1px solid ${on ? "transparent" : "var(--border)"}`,
                boxShadow: on ? "0 6px 20px rgba(76,125,255,0.35)" : "none",
              }}>
              <span className="flex h-7 w-7 items-center justify-center rounded-lg text-[0.85rem]"
                style={{ background: on ? "rgba(255,255,255,0.18)" : "var(--glass)" }}>{t.emoji}</span>
              {t.label}
              {t.count !== undefined && (
                <span className="mono-num rounded-full px-2 py-0.5 text-[0.62rem] font-bold"
                  style={on
                    ? { background: "rgba(255,255,255,0.22)", color: "#fff" }
                    : { background: "var(--glass-2)", color: "var(--gold)", border: "1px solid var(--border)" }}>{t.count}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main */}
      <div className="p-4 pb-12 md:p-6">
        <div className="mb-5">
          <div className="flex items-center gap-2.5 text-[1.25rem] font-bold" style={{ color: "var(--text)" }}>
            👋 {greeting()}{me?.name ? `, ${me.name}` : ""}
          </div>
          <div className="mt-1 text-[0.82rem]" style={{ color: "var(--text-3)" }}>
            Ringkasan SOP &amp; status operasional bank — semua dalam satu tempat
          </div>
        </div>

        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }}>
          {tab === "beranda" && <BerandaPanel onGo={setTab} />}
          {tab === "sop" && <SopPanel />}
          {tab === "mutasi" && <MutasiPanel />}
          {tab === "minusplus" && <MinusPlusPanel />}
          {tab === "deposit" && <DepositPanel clock={clock} />}
        </motion.div>
      </div>
    </div>
  );
}
