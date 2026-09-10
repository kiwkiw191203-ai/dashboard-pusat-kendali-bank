import React from "react";
import { SectionTitle, Panel, PanelTitle, Bullet } from "@/components/bankCenter/Ui";
import { MINUS_UMUM, MINUS_KHUSUS, MINUS_SECTIONS, PLUS_UMUM, PLUS_KHUSUS, PLUS_KAS1, RINGKASAN } from "@/components/bankCenter/bankCenterData";

const RED = "var(--coral)";
const GREEN = "var(--green)";

export default function MinusPlusPanel() {
  return (
    <div>
      <SectionTitle icon="fa-circle-minus" color={RED}>Kasus Minus (−)</SectionTitle>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel>
          <PanelTitle icon="fa-magnifying-glass" color={RED}>Penyebab Umum</PanelTitle>
          {MINUS_UMUM.map((t) => <Bullet key={t} color={RED}>{t}</Bullet>)}
        </Panel>
        <Panel>
          <PanelTitle icon="fa-triangle-exclamation" color={RED}>Kasus Khusus</PanelTitle>
          {MINUS_KHUSUS.map((t) => <Bullet key={t} color={RED}>{t}</Bullet>)}
        </Panel>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        {MINUS_SECTIONS.map((s) => (
          <Panel key={s.title} accent={RED}>
            <PanelTitle icon={s.icon} color={RED}>{s.title}</PanelTitle>
            {s.items.map((t) => <Bullet key={t} color={RED}>{t}</Bullet>)}
          </Panel>
        ))}
      </div>

      <SectionTitle icon="fa-circle-plus" color={GREEN}>Kasus Plus (+)</SectionTitle>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel>
          <PanelTitle icon="fa-magnifying-glass" color={GREEN}>Penyebab Umum</PanelTitle>
          {PLUS_UMUM.map((t) => <Bullet key={t} color={GREEN}>{t}</Bullet>)}
        </Panel>
        <Panel>
          <PanelTitle icon="fa-triangle-exclamation" color={GREEN}>Kasus Khusus</PanelTitle>
          {PLUS_KHUSUS.map((t) => <Bullet key={t} color={GREEN}>{t}</Bullet>)}
        </Panel>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel accent={GREEN}>
          <PanelTitle icon="fa-clock" color={GREEN}>Plus pada Pendingan Kanan</PanelTitle>
          <p className="text-[0.82rem] leading-relaxed" style={{ color: "var(--text-2)" }}>
            Artinya ada mutasi yang terset <strong>Approve</strong>, tapi dana belum di-accept di admin (sudah dikasih jam / approve di BK).
          </p>
        </Panel>
        <Panel accent={GREEN}>
          <PanelTitle icon="fa-calculator" color={GREEN}>Plus pada KAS1 (Pendingan Kanan KLOP)</PanelTitle>
          {PLUS_KAS1.map((t) => <Bullet key={t} color={GREEN}>{t}</Bullet>)}
        </Panel>
      </div>

      <SectionTitle icon="fa-list-check">Ringkasan Cepat Penyebab</SectionTitle>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {RINGKASAN.map((r) => (
          <Panel key={r.title} accent={r.color}>
            <div className="mb-2 flex items-center gap-2.5 text-[0.95rem] font-bold" style={{ color: r.color }}>
              <i className={`fa-solid ${r.icon}`} /> {r.title}
            </div>
            <ul className="space-y-1.5 text-[0.8rem]" style={{ color: "var(--text-2)" }}>
              {r.items.map((t) => <li key={t}>• {t}</li>)}
            </ul>
          </Panel>
        ))}
      </div>
    </div>
  );
}
