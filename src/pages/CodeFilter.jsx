import React, { useEffect, useState } from "react";
import PageHead from "@/components/dashboard/PageHead";
import { base44 } from "@/api/base44Client";
import CodeScanPanel from "@/components/codeFilter/CodeScanPanel";
import CodeModelManager from "@/components/codeFilter/CodeModelManager";

export default function CodeFilter() {
  const [models, setModels] = useState([]);

  const load = async () => {
    try { setModels(await base44.entities.GameCodeModel.list("-created_date", 500)); } catch { setModels([]); }
  };

  useEffect(() => {
    load();
    let u;
    try { u = base44.entities.GameCodeModel.subscribe(load); } catch { u = () => {}; }
    return () => u();
  }, []);

  return (
    <div className="w-full p-4 md:p-7">
      <PageHead
        icon="fa-satellite-dish" color="var(--purple)"
        title="FILTER KODE GAME" subtitle="Tempel screenshot kode hasil spin, model game otomatis terdeteksi"
        badges={[{ icon: "fa-database", text: `${models.length} Model`, color: "var(--purple)" }, { icon: "fa-bolt", text: "AI Scan", color: "var(--acc)" }]}
      />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.1fr_1fr]">
        <CodeScanPanel models={models} />
        <CodeModelManager models={models} onChange={load} />
      </div>
    </div>
  );
}