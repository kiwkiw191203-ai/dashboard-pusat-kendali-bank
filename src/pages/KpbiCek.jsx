import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Search, ShieldAlert, Database, Users, Building2, UserX, Clipboard, Loader2, Info, X, AlertTriangle, Trophy } from "lucide-react";
import { fetchPredictionData, searchById } from "@/lib/pkpbi/predictionData";
import FlagTable from "@/components/pkpbi/tables/FlagTable";
import DisqualifiedTable from "@/components/pkpbi/tables/DisqualifiedTable";
import DQDetailTable from "@/components/pkpbi/tables/DQDetailTable";
import LeaderboardTable from "@/components/pkpbi/tables/LeaderboardTable";
import PKTemplates from "@/components/pkpbi/PKTemplates";
import UsageGuide from "@/components/pkpbi/UsageGuide";
import PageHead from "@/components/dashboard/PageHead";
import { motion } from "framer-motion";

export default function KpbiCek() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [searchedQuery, setSearchedQuery] = useState("");
  const [showInfo, setShowInfo] = useState(false);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    fetchPredictionData()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!query.trim()) { setSearchedQuery(""); setSearching(false); return; }
    setSearching(true);
    const timer = setTimeout(() => { setSearchedQuery(query.trim()); setSearching(false); }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSearch = useCallback((e) => { e?.preventDefault(); setSearchedQuery(query.trim()); setSearching(false); }, [query]);

  const results = useMemo(() => {
    if (!data || !searchedQuery) return null;
    return searchById(data, searchedQuery);
  }, [data, searchedQuery]);

  const clearSearch = () => { setQuery(""); setSearchedQuery(""); };
  const pasteFromClipboard = async () => {
    try { const text = await navigator.clipboard.readText(); setQuery(text.trim()); } catch {}
  };

  if (loading) {
    return (
      <div className="w-full p-6">
        <PageHead icon="fa-shield-halved" color="var(--coral)" title="KPBI CEK MEMBER" subtitle="Memuat data pengecekan…" />
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="mb-3 animate-spin" size={32} style={{ color: "var(--acc)" }} />
          <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>#SIMANIS</p>
          <p className="mt-1 text-[0.72rem]" style={{ color: "var(--text-3)" }}>Memuat data dari spreadsheet, file diskualifikasi & leaderboard KPBI…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-6">
        <PageHead icon="fa-shield-halved" color="var(--coral)" title="KPBI CEK MEMBER" subtitle="Gagal memuat data" />
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <AlertTriangle className="mb-3" size={36} style={{ color: "var(--coral)" }} />
          <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>Gagal memuat data</p>
          <p className="mt-1 text-xs" style={{ color: "var(--text-3)" }}>{error}</p>
        </div>
      </div>
    );
  }

  const stats = [
    { label: "Prediction Flag", value: data.totalRecords, icon: Database, color: "var(--blue)" },
    { label: "Jumlah Situs", value: data.sites.length, icon: Building2, color: "var(--green)" },
    { label: "Username Terflag", value: new Set(data.flagRecords.flatMap((r) => [r.existingUsername, r.newUsername].filter(Boolean))).size, icon: Users, color: "var(--gold)" },
    { label: "Detail Diskualifikasi", value: data.totalDqDetail || 0, icon: UserX, color: "var(--coral)" },
    { label: "Leaderboard KPBI", value: data.totalLeaderboard || 0, icon: Trophy, color: "var(--gold)" },
  ];

  return (
    <div className="w-full p-4 md:p-6">
      <PageHead
        icon="fa-shield-halved" color="var(--coral)"
        title="KPBI CEK MEMBER"
        subtitle="Cek status diskualifikasi, prediction flag & leaderboard member KPBI dalam satu pencarian."
        badges={[{ text: "#SIMANIS", color: "var(--acc)" }, { text: `${data.totalRecords} flag`, color: "var(--coral)" }]}
      />

      {/* Info banner toggle */}
      <div className="mb-4 flex flex-wrap items-center justify-end gap-2">
        <button onClick={() => setShowInfo(!showInfo)}
          className="flex items-center gap-1.5 rounded-xl border px-3 py-2 text-[0.72rem] font-semibold transition-colors hover:bg-[var(--hover)]"
          style={{ borderColor: "var(--border)", color: "var(--text-2)", background: "var(--card)" }}>
          <Info size={13} /> Info Prediction Flag
        </button>
      </div>

      {showInfo && (
        <div className="mb-4 rounded-2xl border p-4" style={{ background: "rgba(247,200,67,0.06)", borderColor: "rgba(247,200,67,0.3)" }}>
          <div className="flex items-start gap-2">
            <Info className="mt-0.5 shrink-0" size={16} style={{ color: "var(--gold)" }} />
            <p className="text-[0.74rem] leading-relaxed" style={{ color: "var(--text-2)" }}>
              <span className="font-semibold" style={{ color: "var(--text)" }}>PREDICTION FLAG</span> merupakan indikasi bahwa seorang member memiliki
              lebih dari satu UserID pada situs yang sama. Identifikasi ini berdasarkan deteksi sistem yang menemukan
              penggunaan <span className="font-medium" style={{ color: "var(--text)" }}>Fingerprint</span>,{" "}
              <span className="font-medium" style={{ color: "var(--text)" }}>Device ID</span> dan{" "}
              <span className="font-medium" style={{ color: "var(--text)" }}>IP Address</span> yang sama. UserID yang terindikasi
              melanggar akan dianggap melakukan pelanggaran <span className="font-medium" style={{ color: "var(--text)" }}>Fair Play Policy</span>{" "}
              dan seluruh UserID yang berkaitan akan didiskualifikasi dari event.
            </p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-5">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border p-4" style={{ background: "var(--card-solid)", borderColor: "var(--border)" }}>
            <s.icon size={18} style={{ color: s.color }} />
            <p className="mt-2 text-2xl font-black tabular-nums" style={{ color: s.color }}>{s.value.toLocaleString()}</p>
            <p className="mt-0.5 text-[0.66rem]" style={{ color: "var(--text-3)" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="mb-6">
        <form onSubmit={handleSearch}>
          <div className="relative flex items-center">
            <Search className="pointer-events-none absolute left-4" size={16} style={{ color: "var(--text-3)" }} />
            <input
              type="text" value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="Tempel ID / username di sini…"
              className="w-full rounded-2xl border py-4 pl-12 pr-28 text-sm outline-none transition-all focus:border-[var(--acc)]"
              style={{ background: "var(--card)", borderColor: "var(--border)", color: "var(--text)" }}
              autoFocus
            />
            <div className="absolute right-2 flex items-center gap-1">
              {query && (
                <button type="button" onClick={clearSearch}
                  className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-[var(--hover)]"
                  style={{ color: "var(--text-3)" }}>
                  <X size={16} />
                </button>
              )}
              <button type="button" onClick={pasteFromClipboard}
                className="flex h-8 items-center gap-1 rounded-lg px-2.5 text-xs font-medium transition-colors hover:bg-[var(--hover)]"
                style={{ color: "var(--text-3)" }} title="Tempel dari clipboard">
                <Clipboard size={14} /><span className="hidden sm:inline">Paste</span>
              </button>
            </div>
          </div>
        </form>
        <p className="mt-2 px-1 text-[0.66rem]" style={{ color: "var(--text-3)" }}>
          Cari berdasarkan username, situs, IP address, fingerprint, atau device ID.
        </p>
      </div>

      {/* Results */}
      {searching && (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="mb-3 animate-spin" size={32} style={{ color: "var(--acc)" }} />
          <p className="text-sm" style={{ color: "var(--text-3)" }}>Mencari "{query}"…</p>
        </div>
      )}

      {!searching && !results && <UsageGuide />}

      {!searching && results && (
        <div className="select-none">
          {results.flagMatches.length === 0 && results.disqualifiedMatches.length === 0 && (results.dqDetailMatches?.length || 0) === 0 && (results.leaderboardMatches?.length || 0) === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl" style={{ background: "var(--glass)" }}>
                <Search size={28} style={{ color: "var(--text-3)" }} />
              </div>
              <p className="mb-1 text-sm font-medium" style={{ color: "var(--text)" }}>Tidak ada hasil</p>
              <p className="text-xs" style={{ color: "var(--text-3)" }}>
                Tidak ditemukan data untuk "<span className="font-jb" style={{ color: "var(--text)" }}>{searchedQuery}</span>"
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-sm" style={{ color: "var(--text-3)" }}>
                  Menampilkan{" "}
                  <span className="font-semibold" style={{ color: "var(--text)" }}>
                    {results.flagMatches.length + results.disqualifiedMatches.length + (results.dqDetailMatches?.length || 0) + (results.leaderboardMatches?.length || 0)}
                  </span>{" "}
                  hasil untuk "<span className="font-jb" style={{ color: "var(--text)" }}>{searchedQuery}</span>"
                </p>
              </div>

              {results.flagMatches.length > 0 && (
                <section>
                  <SectionTitle icon={<ShieldAlert size={16} style={{ color: "var(--gold)" }} />} color="var(--gold)" title="Prediction Flag Records" count={results.flagMatches.length} />
                  <FlagTable records={results.flagMatches} />
                </section>
              )}

              {results.disqualifiedMatches.length > 0 && (
                <section>
                  <SectionTitle icon={<UserX size={16} style={{ color: "var(--coral)" }} />} color="var(--coral)" title="ID Didiskualifikasi (Sheet)" count={results.disqualifiedMatches.length} />
                  <DisqualifiedTable records={results.disqualifiedMatches} />
                </section>
              )}

              {(results.dqDetailMatches?.length || 0) > 0 && (
                <section>
                  <SectionTitle icon={<UserX size={16} style={{ color: "var(--coral)" }} />} color="var(--coral)" title="Detail Diskualifikasi" count={results.dqDetailMatches.length} />
                  <DQDetailTable records={results.dqDetailMatches} />
                </section>
              )}

              {(results.leaderboardMatches?.length || 0) > 0 && (
                <section>
                  <SectionTitle icon={<Trophy size={16} style={{ color: "var(--gold)" }} />} color="var(--gold)" title="Leaderboard Nasional KPBI" count={results.leaderboardMatches.length} />
                  <LeaderboardTable records={results.leaderboardMatches} />
                </section>
              )}

              <PKTemplates searchedQuery={searchedQuery} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SectionTitle({ icon, title, count, color }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      {icon}
      <h2 className="text-sm font-semibold" style={{ color: "var(--text)" }}>{title}</h2>
      <span className="rounded-full px-2 py-0.5 text-[0.66rem] font-medium" style={{ background: `${color}18`, color }}>{count}</span>
    </div>
  );
}