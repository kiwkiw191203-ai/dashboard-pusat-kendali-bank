import React, { useEffect, useState } from "react";
import { PawPrint } from "lucide-react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import { shioData } from "@/lib/togelShio";

export default function ShioEditor() {
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

  const saveNums = (item, value) => {
    if (value === (item.nums || "")) return;
    base44.entities.ShioConfig.update(item.id, { nums: value })
      .then(() => toast.success(`Shio ${item.shio_name} diperbarui`))
      .catch(() => toast.error("Gagal menyimpan shio"));
  };

  return (
    <div className="overflow-hidden rounded-2xl border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
      <div className="flex items-center gap-2 border-b px-4 py-3" style={{ borderColor: "var(--border)", background: "var(--bg-2)" }}>
        <PawPrint size={14} style={{ color: "var(--acc)" }} />
        <span className="text-[0.7rem] font-bold uppercase tracking-wider" style={{ color: "var(--acc)" }}>Edit Tabel Shio</span>
      </div>
      <div>
        {loading ? (
          <div className="p-4 text-center text-[0.72rem]" style={{ color: "var(--text-3)" }}>Memuat…</div>
        ) : (
          items.map((s, i) => (
            <ShioRow key={s.id} item={s} isLast={i === items.length - 1} onSave={saveNums} />
          ))
        )}
      </div>
    </div>
  );
}

function ShioRow({ item, isLast, onSave }) {
  const [val, setVal] = useState(item.nums || "");
  useEffect(() => { setVal(item.nums || ""); }, [item.nums]);

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 text-[0.76rem]"
      style={{ borderBottom: isLast ? "none" : "1px solid var(--border)" }}>
      <span className="w-16 flex-shrink-0 font-semibold" style={{ color: "var(--acc)" }}>{item.shio_name}</span>
      <input
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onBlur={() => onSave(item, val)}
        className="flex-1 rounded-lg border bg-transparent px-2.5 py-1.5 text-[0.76rem] outline-none"
        style={{ borderColor: "var(--border)", color: "var(--text)" }}
      />
    </div>
  );
}