import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import PageHead from "@/components/dashboard/PageHead";
import TogelToolbar from "@/components/togel/TogelToolbar";
import TogelResultCard from "@/components/togel/TogelResultCard";
import ShioTable from "@/components/togel/ShioTable";
import { getPasaranColor } from "@/lib/togelShio";

const HARI = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const BULAN = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

function todayStr() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}
function formatTanggal(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return `Hari ${HARI[d.getDay()]}, ${String(d.getDate()).padStart(2, "0")} ${BULAN[d.getMonth()]} ${d.getFullYear()}`;
}

export default function ResultTogel() {
  const { user } = useAuth();
  const [allItems, setAllItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [showShioMobile, setShowShioMobile] = useState(false);
  const [selectedDate, setSelectedDate] = useState(todayStr());

  const load = async () => {
    try { setAllItems(await base44.entities.TogelResult.list("order", 2000)); } catch { setAllItems([]); }
    setLoading(false);
  };

  useEffect(() => {
    load();
    let unsub;
    try { unsub = base44.entities.TogelResult.subscribe(load); } catch { unsub = () => {}; }
    return () => unsub();
  }, []);

  const TODAY = todayStr();
  const isToday = selectedDate === TODAY;
  const dateStr = formatTanggal(selectedDate);

  // Roster: distinct pasaran configuration (name/column/order/type) — stable, derived from all-time records.
  const roster = useMemo(() => {
    const map = new Map();
    allItems.forEach((it) => {
      if (!map.has(it.pasaran_name)) {
        map.set(it.pasaran_name, { pasaran_name: it.pasaran_name, column: it.column, order: it.order, result_type: it.result_type });
      }
    });
    return [...map.values()].sort((a, b) => (a.order - b.order) || a.pasaran_name.localeCompare(b.pasaran_name));
  }, [allItems]);

  // Actual result record for the selected date, keyed by pasaran name.
  const recordFor = useMemo(() => {
    const map = new Map();
    allItems.filter((it) => it.result_date === selectedDate).forEach((it) => map.set(it.pasaran_name, it));
    return map;
  }, [allItems, selectedDate]);

  const filteredRoster = useMemo(() => {
    const q = query.trim().toLowerCase();
    return roster.filter((r) => {
      if (q && !r.pasaran_name.toLowerCase().includes(q)) return false;
      const done = (recordFor.get(r.pasaran_name)?.p1 || "").length >= 2;
      if (filter === "done" && !done) return false;
      if (filter === "belum" && done) return false;
      return true;
    });
  }, [roster, recordFor, query, filter]);

  const counts = useMemo(() => ({
    all: roster.length,
    visible: filteredRoster.length,
    done: filteredRoster.filter((r) => (recordFor.get(r.pasaran_name)?.p1 || "").length >= 2).length,
  }), [roster, filteredRoster, recordFor]);

  const byColumn = (col) => filteredRoster.filter((r) => r.column === col);

  const handleSave = async (config, field, value) => {
    const rec = recordFor.get(config.pasaran_name);
    if (rec) {
      if (rec.creator_email && rec.creator_email !== user?.email) return; // not the owner of today's entry
      await base44.entities.TogelResult.update(rec.id, { [field]: value });
    } else {
      await base44.entities.TogelResult.create({
        pasaran_name: config.pasaran_name, column: config.column, order: config.order, result_type: config.result_type,
        result_date: selectedDate, [field]: value,
        creator_name: user?.full_name || "", creator_email: user?.email || "",
      });
    }
    load();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: "var(--acc)" }} />
        <p className="mt-3 text-[0.82rem]" style={{ color: "var(--text-3)" }}>Memuat data pasaran…</p>
      </div>
    );
  }

  return (
    <div className="w-full p-4 md:p-6">
      <PageHead icon="fa-dice" color="var(--acc)" title="HASIL RESULT TOGEL" subtitle={dateStr} />
      <TogelToolbar query={query} setQuery={setQuery} filter={filter} setFilter={setFilter} counts={counts}
        onToggleShio={() => setShowShioMobile((v) => !v)}
        selectedDate={selectedDate} setSelectedDate={setSelectedDate} isToday={isToday} todayStr={TODAY} />

      {showShioMobile && <div className="mb-4 xl:hidden"><ShioTable /></div>}

      <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_240px]">
        {["kiri", "tengah", "kanan"].map((col) => (
          <div key={col} className="space-y-3">
            {byColumn(col).map((config) => {
              const rec = recordFor.get(config.pasaran_name);
              const isOwner = !rec || !rec.creator_email || rec.creator_email === user?.email;
              return (
                <TogelResultCard key={config.pasaran_name} config={config} record={rec} color={getPasaranColor(config.pasaran_name)}
                  dateStr={dateStr} editable={isToday && isOwner} onSaveField={(field, value) => handleSave(config, field, value)} />
              );
            })}
          </div>
        ))}
        <div className="hidden self-start xl:block xl:sticky xl:top-4">
          <ShioTable />
        </div>
      </div>
    </div>
  );
}