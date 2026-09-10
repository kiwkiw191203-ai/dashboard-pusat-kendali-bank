import React, { useEffect, useState } from "react";
import { PawPrint } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { shioData } from "@/lib/togelShio";

export default function ShioTable() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      let data = await base44.entities.ShioConfig.list("order", 20);
      if (data.length === 0) {
        await base44.entities.ShioConfig.bulkCreate(
          shioData.map((s, i) => ({ shio_name: s.name, nums: s.nums, order: i }))
        );
        data = await base44.entities.ShioConfig.list("order", 20);
      }
      setItems(data);
    } catch { setItems([]); }
    setLoading(false);
  };

  useEffect(() => {
    load();
    let unsub;
    try { unsub = base44.entities.ShioConfig.subscribe(load); } catch { unsub = () => {}; }
    return () => unsub();
  }, []);

  return (
    <div className="overflow-hidden rounded-2xl border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
      <div className="flex items-center gap-2 border-b px-4 py-3" style={{ borderColor: "var(--border)", background: "var(--bg-2)" }}>
        <PawPrint size={14} style={{ color: "var(--acc)" }} />
        <span className="text-[0.7rem] font-bold uppercase tracking-wider" style={{ color: "var(--acc)" }}>Tabel Shio</span>
      </div>
      <div>
        {loading ? (
          <div className="p-4 text-center text-[0.68rem]" style={{ color: "var(--text-3)" }}>Memuat…</div>
        ) : (
          items.map((s, i) => (
            <div key={s.id} className="flex items-center gap-3 px-4 py-2 text-[0.7rem]"
              style={{ borderBottom: i < items.length - 1 ? "1px solid var(--border)" : "none", background: i % 2 === 0 ? "transparent" : "var(--glass)" }}>
              <span className="w-14 flex-shrink-0 font-semibold" style={{ color: "var(--acc)" }}>{s.shio_name}</span>
              <span style={{ color: "var(--text-3)" }}>{s.nums}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}