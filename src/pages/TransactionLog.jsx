import React, { useEffect, useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, RefreshCw, ExternalLink, CheckCircle2, XCircle, AlertTriangle,
  Filter, X, Clock, Database, ArrowDownToLine, ArrowUpFromLine, FileText,
  ChevronLeft, ChevronRight,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import PageHead from "@/components/dashboard/PageHead";

const POLL_INTERVAL = 30000; // 30 detik auto-refresh
const PAGE_SIZE = 50;

const SHEETS = [
  { key: "deposit", label: "Cash IN / Deposit", icon: ArrowDownToLine, color: "var(--green)" },
  { key: "new_withdraw", label: "NEW Cash Out / Withdraw", icon: ArrowUpFromLine, color: "var(--coral)" },
  { key: "withdraw", label: "Cash Out / Withdraw", icon: ArrowUpFromLine, color: "var(--gold)" },
  { key: "sheet3", label: "Sheet3", icon: FileText, color: "var(--blue)" },
];

function statusStyle(status) {
  const s = (status || "").toUpperCase();
  if (s === "SUCCESS") return { color: "var(--green)", bg: "rgba(16,185,129,0.12)", icon: CheckCircle2 };
  if (s.includes("FAIL") || s.includes("GAGAL")) return { color: "var(--coral)", bg: "rgba(239,68,68,0.12)", icon: XCircle };
  if (s.includes("WAIT")) return { color: "var(--gold)", bg: "rgba(247,200,67,0.12)", icon: Clock };
  if (s.includes("BUKAN") || s.includes("TIDAK SESUAI")) return { color: "var(--gold)", bg: "rgba(247,200,67,0.12)", icon: AlertTriangle };
  if (!status) return { color: "var(--text-3)", bg: "var(--glass)", icon: AlertTriangle };
  return { color: "var(--blue)", bg: "rgba(59,130,246,0.12)", icon: AlertTriangle };
}

function extractLinks(val) {
  if (!val) return [];
  return String(val).split(/[\s,]+/).filter((u) => /^https?:\/\//i.test(u));
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border px-4 py-3"
      style={{ background: "var(--card)", borderColor: "var(--border)" }}>
      <div className="flex h-10 w-10 items-center justify-center rounded-lg"
        style={{ background: `${color}14`, color, border: `1px solid ${color}33` }}>
        <Icon size={18} />
      </div>
      <div>
        <p className="font-heading text-[1.05rem] font-bold leading-none" style={{ color: "var(--text)" }}>{value}</p>
        <p className="mt-1 text-[0.66rem] font-medium" style={{ color: "var(--text-3)" }}>{label}</p>
      </div>
    </div>
  );
}

function Cell({ value, isStatus, isLinkCol }) {
  if (isStatus) {
    const st = statusStyle(value);
    const SIcon = st.icon;
    if (!value) return <span style={{ color: "var(--text-3)" }}>—</span>;
    return (
      <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-1 text-[0.66rem] font-bold"
        style={{ background: st.bg, color: st.color }}>
        <SIcon size={11} /> {value}
      </span>
    );
  }
  if (isLinkCol) {
    const links = extractLinks(value);
    if (!links.length) return <span style={{ color: "var(--text-3)" }}>—</span>;
    return (
      <div className="flex flex-wrap gap-1">
        {links.map((u, k) => (
          <a key={k} href={u} target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-1 rounded px-2 py-1 text-[0.66rem] font-medium transition-colors hover:underline"
            style={{ background: "var(--glass)", color: "var(--blue)" }}>
            <ExternalLink size={10} /> {links.length > 1 ? `Link ${k + 1}` : "Lihat"}
          </a>
        ))}
      </div>
    );
  }
  if (!value) return <span style={{ color: "var(--text-3)" }}>—</span>;
  const isLong = value.length > 48;
  return (
    <span className="block" style={{ color: "var(--text-2)", whiteSpace: isLong ? "normal" : "nowrap", textOverflow: "ellipsis", overflow: "hidden" }} title={value}>
      {value}
    </span>
  );
}

export default function TransactionLog() {
  const [activeSheet, setActiveSheet] = useState("deposit");
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [page, setPage] = useState(1);
  const sheetMeta = useMemo(() => SHEETS.find((s) => s.key === activeSheet), [activeSheet]);

  const loadData = useCallback(async (sheet, silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await base44.functions.invoke("fetchTransactionLog", { sheet });
      const data = res.data || res;
      if (data.error) throw new Error(data.error);
      setColumns(data.columns || []);
      setRows(data.rows || []);
      setLastUpdated(new Date());
      setError("");
    } catch (e) {
      setError(e.message || "Gagal memuat data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadData(activeSheet); }, [activeSheet, loadData]);

  useEffect(() => {
    setSearch(""); setStatusFilter("all"); setPage(1);
  }, [activeSheet]);

  // auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(() => loadData(activeSheet, true), POLL_INTERVAL);
    return () => clearInterval(id);
  }, [autoRefresh, activeSheet, loadData]);

  // deteksi indeks kolom status & link
  const statusIdx = useMemo(() => {
    const i = columns.findIndex((c) => /status/i.test(c));
    return i >= 0 ? i : -1;
  }, [columns]);
  const linkIdx = useMemo(() => {
    const i = columns.findIndex((c) => /bukti|trf|link|url|gambar|foto|screenshot/i.test(c));
    return i >= 0 ? i : -1;
  }, [columns]);

  const statusOptions = useMemo(() => {
    if (statusIdx < 0) return ["all"];
    const set = new Set();
    rows.forEach((r) => { if (r[statusIdx]) set.add(r[statusIdx]); });
    return ["all", ...Array.from(set)];
  }, [rows, statusIdx]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (statusFilter !== "all" && r[statusIdx] !== statusFilter) return false;
      if (!q) return true;
      return r.some((c) => String(c || "").toLowerCase().includes(q));
    });
  }, [rows, search, statusFilter, statusIdx]);

  const stats = useMemo(() => {
    let success = 0, failed = 0, waiting = 0;
    rows.forEach((r) => {
      const s = (r[statusIdx] || "").toUpperCase();
      if (s === "SUCCESS") success++;
      else if (s.includes("FAIL") || s.includes("GAGAL")) failed++;
      else if (s.includes("WAIT")) waiting++;
    });
    return { total: rows.length, success, failed, waiting };
  }, [rows, statusIdx]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, safePage]);

  const fmtTime = (d) => d ? d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "—";

  return (
    <div className="w-full p-4 md:p-6">
      <PageHead
        icon="fa-database"
        color={sheetMeta.color}
        title="Data Depo / WD Qiris"
        subtitle="Data transaksi langsung dari Google Sheet · 4 sheet · auto-refresh 30 detik"
        badges={[
          { text: `${stats.total} data`, color: sheetMeta.color },
          { text: autoRefresh ? "Auto ON" : "Auto OFF", color: autoRefresh ? "var(--green)" : "var(--text-3)" },
        ]}
      />

      {/* Tabs */}
      <div className="mb-4 flex flex-wrap gap-2">
        {SHEETS.map((s) => {
          const active = s.key === activeSheet;
          return (
            <button key={s.key} onClick={() => setActiveSheet(s.key)}
              className="flex items-center gap-2 rounded-xl border px-4 py-2.5 text-[0.76rem] font-semibold transition-all"
              style={active
                ? { background: `${s.color}16`, borderColor: s.color, color: s.color, boxShadow: `0 0 14px ${s.color}22` }
                : { background: "var(--card)", borderColor: "var(--border)", color: "var(--text-2)" }}>
              <s.icon size={14} /> {s.label}
            </button>
          );
        })}
      </div>

      {/* Stats */}
      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard icon={Database} label="Total" value={stats.total} color={sheetMeta.color} />
        <StatCard icon={CheckCircle2} label="Sukses" value={stats.success} color="var(--green)" />
        <StatCard icon={XCircle} label="Gagal" value={stats.failed} color="var(--coral)" />
        <StatCard icon={Clock} label="Menunggu" value={stats.waiting} color="var(--gold)" />
      </div>

      {/* Toolbar */}
      <div className="mb-3 flex flex-wrap items-center gap-3 rounded-xl border p-4"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        <div className="relative flex-1 min-w-[220px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-3)" }} />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Cari semua kolom: toko, member ID, order ID, RRN, nominal, status..."
            className="w-full rounded-lg border py-2.5 pl-10 pr-9 text-[0.82rem] outline-none"
            style={{ background: "var(--bg-2)", borderColor: "var(--border)", color: "var(--text)" }}
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 hover:bg-[var(--hover)]" style={{ color: "var(--text-3)" }}>
              <X size={14} />
            </button>
          )}
        </div>

        {statusIdx >= 0 && (
          <div className="flex items-center gap-2">
            <Filter size={15} style={{ color: "var(--text-3)" }} />
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="rounded-lg border px-3 py-2.5 text-[0.78rem] font-medium outline-none"
              style={{ background: "var(--bg-2)", borderColor: "var(--border)", color: "var(--text)" }}
            >
              {statusOptions.map((s) => (
                <option key={s} value={s}>{s === "all" ? "Semua Status" : s}</option>
              ))}
            </select>
          </div>
        )}

        <button onClick={() => loadData(activeSheet)} disabled={refreshing}
          className="flex items-center gap-2 rounded-lg border px-4 py-2.5 text-[0.78rem] font-semibold transition-colors hover:bg-[var(--hover)] disabled:opacity-50"
          style={{ borderColor: "var(--border)", color: "var(--text-2)" }}>
          <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} style={{ color: "var(--acc)" }} />
          Refresh
        </button>

        <button onClick={() => setAutoRefresh((v) => !v)}
          className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-[0.78rem] font-semibold transition-transform hover:scale-105"
          style={{
            background: autoRefresh ? "rgba(16,185,129,0.12)" : "var(--bg-2)",
            border: `1px solid ${autoRefresh ? "var(--green)" : "var(--border)"}`,
            color: autoRefresh ? "var(--green)" : "var(--text-2)",
          }}>
          <span className="relative flex h-2 w-2">
            {autoRefresh && <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" style={{ background: "var(--green)" }} />}
            <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: autoRefresh ? "var(--green)" : "var(--text-3)" }} />
          </span>
          {autoRefresh ? "Auto ON" : "Auto OFF"}
        </button>
      </div>

      {/* meta line */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-[0.72rem]" style={{ color: "var(--text-3)" }}>
        <span className="flex items-center gap-1.5">
          <RefreshCw size={12} /> Update terakhir: <b style={{ color: "var(--text-2)" }}>{fmtTime(lastUpdated)}</b>
          {autoRefresh && <span style={{ color: "var(--green)" }}>· auto-refresh 30s</span>}
        </span>
        <span>Menampilkan <b style={{ color: "var(--text-2)" }}>{filtered.length}</b> dari {stats.total} data · {columns.length} kolom</span>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border px-4 py-3 text-[0.8rem]"
          style={{ borderColor: "rgba(239,68,68,0.3)", color: "var(--coral)", background: "rgba(239,68,68,0.08)" }}>
          {error}
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        <div className="ds-scroll overflow-auto" style={{ maxHeight: "68vh", width: "100%" }}>
          <table className="w-full text-left text-[0.78rem]">
            <thead className="sticky top-0 z-10" style={{ background: "var(--bg-2)", borderBottom: "1px solid var(--border)" }}>
              <tr>
                <th className="whitespace-nowrap px-3 py-3 text-[0.66rem] font-bold uppercase tracking-wider" style={{ color: "var(--text-3)" }}>No</th>
                {columns.map((c, i) => (
                  <th key={i} className="whitespace-nowrap px-3 py-3 text-[0.66rem] font-bold uppercase tracking-wider" style={{ color: "var(--text-3)" }}>
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                    {Array.from({ length: columns.length + 1 || 9 }).map((_, j) => (
                      <td key={j} className="px-3 py-3"><div className="skeleton h-4 w-full" /></td>
                    ))}
                  </tr>
                ))
              ) : pageRows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 1} className="px-3 py-16 text-center" style={{ color: "var(--text-3)" }}>
                    <Search size={32} className="mx-auto mb-3 opacity-40" />
                    <p className="text-[0.85rem] font-medium">Tidak ada data yang cocok</p>
                    <p className="mt-1 text-[0.74rem]">Coba ubah kata kunci atau filter status</p>
                  </td>
                </tr>
              ) : (
                <AnimatePresence>
                  {pageRows.map((row, i) => {
                    const realIdx = (safePage - 1) * PAGE_SIZE + i + 1;
                    return (
                      <motion.tr
                        key={realIdx}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        transition={{ duration: 0.15 }}
                        className="transition-colors hover:bg-[var(--hover)]"
                        style={{ borderBottom: "1px solid var(--border)", background: i % 2 === 0 ? "transparent" : "var(--glass)" }}
                      >
                        <td className="whitespace-nowrap px-3 py-2.5 font-jb text-[0.68rem]" style={{ color: "var(--text-3)" }}>{realIdx}</td>
                        {columns.map((c, j) => (
                          <td key={j} className="px-3 py-2.5 align-top">
                            <Cell value={row[j]} isStatus={j === statusIdx} isLinkCol={j === linkIdx} />
                          </td>
                        ))}
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {!loading && filtered.length > PAGE_SIZE && (
        <div className="mt-4 flex items-center justify-center gap-3">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage === 1}
            className="flex items-center gap-1 rounded-lg border px-3 py-2 text-[0.76rem] font-medium disabled:opacity-40"
            style={{ borderColor: "var(--border)", color: "var(--text-2)" }}>
            <ChevronLeft size={15} /> Prev
          </button>
          <span className="text-[0.76rem] font-medium" style={{ color: "var(--text-2)" }}>
            Hal {safePage} / {totalPages}
          </span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}
            className="flex items-center gap-1 rounded-lg border px-3 py-2 text-[0.76rem] font-medium disabled:opacity-40"
            style={{ borderColor: "var(--border)", color: "var(--text-2)" }}>
            Next <ChevronRight size={15} />
          </button>
        </div>
      )}
    </div>
  );
}