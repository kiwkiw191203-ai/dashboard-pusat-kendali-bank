import React, { useEffect, useState } from "react";
import PageHead from "@/components/dashboard/PageHead";
import ValidationForm from "@/components/validation/ValidationForm";
import ValidationCard from "@/components/validation/ValidationCard";
import { base44 } from "@/api/base44Client";

export default function AccountValidation() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try { setItems(await base44.entities.AccountValidation.list("-created_date", 200)); } catch { setItems([]); }
    setLoading(false);
  };

  useEffect(() => {
    load();
    let unsub;
    try { unsub = base44.entities.AccountValidation.subscribe(load); } catch { unsub = () => {}; }
    return () => unsub();
  }, []);

  return (
    <div className="w-full p-4 md:p-7">
      <PageHead icon="fa-shield-halved" color="var(--acc)" title="VALIDASI REKENING" subtitle="Simpan hasil validasi rekening / ewallet member"
        badges={[{ icon: "fa-list-check", text: `${items.length} Tercatat`, color: "var(--acc)" }]} />

      <div className="mb-5">
        <ValidationForm onSaved={load} />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: "var(--acc)" }} />
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border p-10 text-center" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <p className="text-[0.8rem]" style={{ color: "var(--text-3)" }}>Belum ada hasil validasi tersimpan.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => <ValidationCard key={it.id} item={it} />)}
        </div>
      )}
    </div>
  );
}