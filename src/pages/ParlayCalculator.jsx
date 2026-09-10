import React, { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Layers, Copy, FileDown, Printer, RotateCcw, Check, Save, Trash2, Send, BookOpen, Calculator, AlertTriangle } from "lucide-react";
import { jsPDF } from "jspdf";
import { toast } from "sonner";
import PageHead from "@/components/dashboard/PageHead";
import {
  PARLAY_STATUSES, STATUS_META, calcParlay, buildSteps, formatRp, PARLAY_EXAMPLES,
} from "@/lib/parlayCalc";

const TEAM_OPTIONS = Array.from({ length: 19 }, (_, i) => i + 2);
const HIST_KEY = "parlay-history-v2";

const defaultTeam = (i) => ({ name: `Tim ${i + 1}`, odds: 1.9, status: "win" });

export default function ParlayCalculator() {
  const [stake, setStake] = useState(100000);
  const [teamCount, setTeamCount] = useState(3);
  const [teams, setTeams] = useState(() => Array.from({ length: 3 }, (_, i) => defaultTeam(i)));
  const [history, setHistory] = useState([]);
  const [copied, setCopied] = useState(false);
  const [copiedMsg, setCopiedMsg] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    try { setHistory(JSON.parse(localStorage.getItem(HIST_KEY) || "[]")); } catch {}
  }, []);

  const fmtNum = (n) => new Intl.NumberFormat("en-US").format(Number(n) || 0);

  const setTeamCountSafe = (n) => {
    setTeamCount(n);
    setTeams((prev) => {
      const next = [...prev];
      while (next.length < n) next.push(defaultTeam(next.length));
      next.length = n;
      return next;
    });
  };

  const patchTeam = (idx, field, value) =>
    setTeams((prev) => prev.map((t, i) => (i === idx ? { ...t, [field]: value } : t)));

  const activeTeams = teams.slice(0, teamCount);
  const result = useMemo(() => calcParlay(stake, activeTeams), [stake, teams, teamCount]);
  const steps = useMemo(() => buildSteps(stake, result), [stake, result]);

  const validate = () => {
    if (!stake || Number(stake) <= 0) { toast.error("Nominal betting harus berupa angka lebih dari 0"); return false; }
    for (let i = 0; i < activeTeams.length; i++) {
      const t = activeTeams[i];
      if (t.odds === "" || t.odds === null || Number(t.odds) <= 0) {
        if (t.status === "win" || t.status === "win_half") {
          toast.error(`Odds ${t.name || "Tim " + (i + 1)} tidak boleh kosong`);
          return false;
        }
      }
    }
    return true;
  };

  const applyExample = (ex) => {
    setStake(ex.stake);
    setTeamCount(ex.teams.length);
    setTeams(ex.teams.map((t, i) => ({ ...t, name: t.name || `Tim ${i + 1}` })));
    toast.success(ex.name + " dimuat");
  };

  const reset = () => {
    setStake(100000); setTeamCount(3);
    setTeams(Array.from({ length: 3 }, (_, i) => defaultTeam(i)));
    toast.info("Form direset");
  };

  const summary = useMemo(() => {
    const lines = activeTeams.map((t, i) => {
      const m = PARLAY_STATUSES.find((x) => x.key === t.status);
      const c = result.converted[i];
      return `${t.name || "Tim " + (i + 1)} | Odds: ${t.odds} | ${m.label} | Setelah: ${fmt4(c.converted)}`;
    });
    return [
      `PARLAY CALCULATOR — ${teamCount} Tim`,
      `Nominal: ${formatRp(stake)}`,
      ...lines,
      `Total Odds: ${fmt4(result.totalOdds)}`,
      `Profit: ${formatRp(result.profit)}`,
      `Total Pembayaran: ${formatRp(result.totalPayout)}`,
      `Status: ${result.finalStatus}`,
    ].join("\n");
  }, [activeTeams, stake, result, teamCount]);

  const handleCopy = async () => {
    if (!validate()) return;
    try { await navigator.clipboard.writeText(summary); setCopied(true); toast.success("Hasil disalin"); setTimeout(() => setCopied(false), 1500); }
    catch { toast.error("Gagal menyalin"); }
  };

  const memberMessage = useMemo(() => {
    const hr = new Date().getHours();
    const salam = hr < 11 ? "Selamat pagi" : hr < 15 ? "Selamat siang" : hr < 18 ? "Selamat sore" : "Selamat malam";

    if (result.isLose) {
      return [
        `${salam}, Bosku.`,
        "",
        `Mohon maaf ya bosku, taruhan Parlay Anda dinyatakan kalah total karena terdapat tim yang berstatus Kalah. Sesuai ketentuan, bila satu tim kalah penuh maka seluruh paket dinyatakan kalah.`,
        "",
        `Nominal Betting  : ${formatRp(stake)}`,
        `Total Kemenangan : Rp 0`,
        `Kerugian         : ${formatRp(stake)}`,
        "",
        `Nominal betting Anda hangus dan tidak ada pembayaran kemenangan ya bosku. Mohon dimaklumi.`,
        "",
        `Terima kasih, Bosku.`,
      ].join("\n");
    }

    const detail = result.converted.map((t, i) => {
      const m = PARLAY_STATUSES.find((x) => x.key === t.status);
      return `${i + 1}. ${t.name || "Tim " + (i + 1)} — ${m.label} (Odds ${fmt4(t.converted)})`;
    }).join("\n");

    const winLine = result.profit > 0
      ? `Jadi, kemenangan yang Anda terima sebesar ${formatRp(result.totalPayout)}, dengan keuntungan bersih ${formatRp(result.profit)} ya bosku. Selamat ya Bosku.`
      : `Jadi, total uang yang dikembalikan sebesar ${formatRp(result.totalPayout)}, sama dengan nominal betting Anda, sehingga tidak ada keuntungan maupun kerugian ya bosku.`;

    return [
      `${salam}, Bosku.`,
      "",
      `Berikut rincian taruhan Parlay Anda ya bosku.`,
      "",
      `Nominal Betting : ${formatRp(stake)}`,
      `Jumlah Tim      : ${teamCount} tim`,
      "",
      `Status Tiap Tim:`,
      detail,
      "",
      `Total Odds : ${result.converted.map((t) => fmt4(t.converted)).join(" × ")} = ${fmt4(result.totalOdds)}`,
      `Total Pembayaran = Nominal × Total Odds = ${formatRp(stake)} × ${fmt4(result.totalOdds)} = ${formatRp(result.totalPayout)}`,
      `Keuntungan Bersih = ${formatRp(result.totalPayout)} − ${formatRp(stake)} = ${formatRp(result.profit)}`,
      "",
      winLine,
      "",
      `Terima kasih, Bosku.`,
    ].join("\n");
  }, [stake, result, teamCount]);

  const handleCopyMsg = async () => {
    if (!validate()) return;
    try { await navigator.clipboard.writeText(memberMessage); setCopiedMsg(true); toast.success("Penjelasan disalin, siap kirim ke member"); setTimeout(() => setCopiedMsg(false), 1500); }
    catch { toast.error("Gagal menyalin"); }
  };

  const handleExcel = () => {
    if (!validate()) return;
    const rows = [["Tim", "Odds Awal", "Status", "Odds Setelah Konversi"]];
    result.converted.forEach((t, i) => {
      const m = PARLAY_STATUSES.find((x) => x.key === t.status);
      rows.push([t.name || `Tim ${i + 1}`, t.odds, m.label, fmt4(t.converted)]);
    });
    rows.push([]);
    rows.push(["Nominal", formatRp(stake)]);
    rows.push(["Total Odds", fmt4(result.totalOdds)]);
    rows.push(["Profit", formatRp(result.profit)]);
    rows.push(["Total Pembayaran", formatRp(result.totalPayout)]);
    rows.push(["Status", result.finalStatus]);
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "parlay-calc.csv"; a.click();
    URL.revokeObjectURL(url);
    toast.success("Excel (CSV) diunduh");
  };

  const handlePDF = () => {
    if (!validate()) return;
    const doc = new jsPDF();
    let y = 16;
    doc.setFont("helvetica", "bold"); doc.setFontSize(16);
    doc.text("PARLAY CALCULATOR", 14, y); y += 7;
    doc.setFont("helvetica", "normal"); doc.setFontSize(10);
    doc.text(`Nominal Betting: ${formatRp(stake)}   |   Jumlah Tim: ${teamCount}`, 14, y); y += 9;

    doc.setFont("helvetica", "bold"); doc.setFontSize(11);
    doc.text("Detail Perhitungan", 14, y); y += 6;
    doc.setFontSize(9);
    doc.text("Tim", 16, y); doc.text("Odds Awal", 70, y); doc.text("Status", 110, y); doc.text("Odds Setelah", 150, y); y += 5;
    doc.setDrawColor(200); doc.line(14, y - 1, 196, y - 1);
    doc.setFont("helvetica", "normal");
    result.converted.forEach((t, i) => {
      const m = PARLAY_STATUSES.find((x) => x.key === t.status);
      doc.text(String(t.name || `Tim ${i + 1}`), 16, y);
      doc.text(String(t.odds), 70, y);
      doc.text(m.label, 110, y);
      doc.text(fmt4(t.converted), 150, y);
      y += 6;
    });
    y += 4;
    doc.setFont("helvetica", "bold"); doc.setFontSize(11);
    doc.text("Hasil", 14, y); y += 6;
    doc.setFont("helvetica", "normal"); doc.setFontSize(10);
    doc.text(`Total Odds       : ${fmt4(result.totalOdds)}`, 14, y); y += 6;
    doc.text(`Profit Bersih    : ${formatRp(result.profit)}`, 14, y); y += 6;
    doc.text(`Total Pembayaran : ${formatRp(result.totalPayout)}`, 14, y); y += 6;
    doc.text(`Status Betting   : ${result.finalStatus}`, 14, y); y += 9;

    doc.setFont("helvetica", "bold"); doc.setFontSize(11);
    doc.text("Langkah Perhitungan", 14, y); y += 6;
    doc.setFont("helvetica", "normal"); doc.setFontSize(9);
    steps.forEach((s) => { doc.text(s, 16, y); y += 6; });

    doc.save("parlay-calc.pdf");
    toast.success("PDF diunduh");
  };

  const handlePrint = () => {
    if (!validate()) return;
    const w = window.open("", "_blank");
    if (!w) { toast.error("Popup diblokir"); return; }
    const rows = result.converted.map((t, i) => {
      const m = PARLAY_STATUSES.find((x) => x.key === t.status);
      return `<tr><td>${t.name || "Tim " + (i + 1)}</td><td>${t.odds}</td><td>${m.label}</td><td>${fmt4(t.converted)}</td></tr>`;
    }).join("");
    const stepHtml = steps.map((s) => `<div>${s}</div>`).join("");
    w.document.write(`<html><head><title>Parlay Calc</title><style>body{font-family:Poppins,Inter,sans-serif;padding:28px;color:#111;background:#fff}h1{font-size:20px;margin:0}.sub{color:#555;font-size:12px;margin:4px 0 16px}table{border-collapse:collapse;width:100%;margin:10px 0}td,th{border:1px solid #ddd;padding:8px;text-align:left;font-size:12px}th{background:#f5f5f5}.r{margin-top:14px;font-size:13px}.r b{display:inline-block;width:170px}.steps{margin-top:14px;font-size:12px;color:#444}.steps div{margin:2px 0}</style></head><body><h1>PARLAY CALCULATOR</h1><div class="sub">Nominal: ${formatRp(stake)} • ${teamCount} Tim • Status: ${result.finalStatus}</div><table><tr><th>Tim</th><th>Odds Awal</th><th>Status</th><th>Odds Setelah Konversi</th></tr>${rows}</table><div class="r"><b>Total Odds</b>${fmt4(result.totalOdds)}<br><b>Profit Bersih</b>${formatRp(result.profit)}<br><b>Total Pembayaran</b>${formatRp(result.totalPayout)}<br><b>Status</b>${result.finalStatus}</div><div class="steps"><b>Langkah Perhitungan:</b>${stepHtml}</div></body></html>`);
    w.document.close(); w.focus(); w.print();
  };

  const saveHistory = () => {
    if (!validate()) return;
    setSaving(true);
    const entry = {
      id: Date.now().toString(),
      stake, teamCount,
      totalOdds: fmt4(result.totalOdds),
      profit: Math.round(result.profit),
      totalPayout: Math.round(result.totalPayout),
      finalStatus: result.finalStatus,
      createdAt: new Date().toISOString(),
    };
    const next = [entry, ...history].slice(0, 30);
    setHistory(next);
    localStorage.setItem(HIST_KEY, JSON.stringify(next));
    setTimeout(() => { setSaving(false); toast.success("Disimpan ke riwayat"); }, 300);
  };
  const removeHistory = (id) => {
    const next = history.filter((h) => h.id !== id);
    setHistory(next); localStorage.setItem(HIST_KEY, JSON.stringify(next));
  };
  const clearHistory = () => { setHistory([]); localStorage.removeItem(HIST_KEY); toast.info("Riwayat dikosongkan"); };

  const sMeta = STATUS_META[result.finalStatus] || STATUS_META.LOSE;

  return (
    <div className="w-full p-4 md:p-7">
      <PageHead
        icon="fa-layer-group" color="var(--violet)"
        title="PARLAY CALCULATOR"
        subtitle="Hitung kemenangan dan kekalahan Parlay secara otomatis berdasarkan status setiap pertandingan."
        badges={[{ text: `${teamCount} Tim`, color: "var(--violet)" }, { text: result.finalStatus, color: sMeta.color }]}
      />

      {/* Toolbar */}
      <div className="mb-5 flex flex-wrap items-center justify-end gap-2">
        <button onClick={reset}
          className="flex items-center gap-2 rounded-xl border px-3 py-2 text-[0.72rem] font-semibold transition-colors hover:bg-[var(--hover)]"
          style={{ borderColor: "var(--border)", color: "var(--text)", background: "var(--card)" }}>
          <RotateCcw size={14} /> Reset
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[360px_1fr]">
        {/* LEFT — Input + Examples */}
        <div className="space-y-5">
          <div className="overflow-hidden rounded-2xl border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            <CardHeader icon={<Calculator size={15} style={{ color: "var(--violet)" }} />} bg="rgba(var(--purple-rgb),0.12)" bc="rgba(var(--purple-rgb),0.3)" title="Input Betting" />
            <div className="space-y-4 p-4">
              <div>
                <Label text="Nominal Betting" />
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-jb text-[0.82rem] font-bold" style={{ color: "rgba(0,0,0,0.5)" }}>Rp</span>
                  <input inputMode="numeric" value={fmtNum(stake)}
                    onChange={(e) => setStake(Number(e.target.value.replace(/[^\d]/g, "")) || 0)}
                    className="w-full rounded-xl border py-3 pl-10 pr-3 text-[0.82rem] font-jb font-bold outline-none focus:border-[var(--violet)]"
                    style={{ background: "rgba(255,255,255,0.95)", borderColor: "rgba(0,0,0,0.12)", color: "#000" }} />
                </div>
              </div>
              <div>
                <Label text="Jumlah Tim" />
                <div className="relative">
                  <select value={teamCount} onChange={(e) => setTeamCountSafe(Number(e.target.value))}
                    className="w-full appearance-none rounded-xl border py-3 px-3 pr-9 text-[0.82rem] font-bold outline-none focus:border-[var(--violet)]"
                    style={{ background: "rgba(255,255,255,0.95)", borderColor: "rgba(0,0,0,0.12)", color: "#000" }}>
                    {TEAM_OPTIONS.map((n) => <option key={n} value={n} style={{ color: "#000" }}>{n} Tim</option>)}
                  </select>
                  <i className="fa-solid fa-chevron-down pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[0.6rem]" style={{ color: "rgba(0,0,0,0.5)" }} />
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            <CardHeader icon={<BookOpen size={15} style={{ color: "var(--gold)" }} />} bg="rgba(247,200,67,0.12)" bc="rgba(247,200,67,0.3)" title="Contoh Otomatis" />
            <div className="space-y-2 p-3">
              {PARLAY_EXAMPLES.map((ex, i) => (
                <button key={i} onClick={() => applyExample(ex)}
                  className="w-full rounded-xl border px-3 py-2.5 text-left text-[0.74rem] font-semibold transition-all hover:border-[var(--acc)]"
                  style={{ borderColor: "var(--border)", background: "var(--glass)", color: "var(--text)" }}>
                  <span className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg font-jb text-[0.62rem] font-bold" style={{ background: "var(--acc-grad)", color: "#000" }}>{i + 1}</span>
                    {ex.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT — Form + Result + Detail + Steps */}
        <div className="space-y-5">
          {/* Teams form */}
          <div className="overflow-hidden rounded-2xl border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            <CardHeader icon={<Layers size={15} style={{ color: "var(--violet)" }} />} bg="rgba(var(--purple-rgb),0.12)" bc="rgba(var(--purple-rgb),0.3)" title={`Form ${teamCount} Tim`} right={<span className="text-[0.62rem] font-semibold" style={{ color: "var(--text-3)" }}>Nama • Odds • Status</span>} />
            <div className="ds-scroll max-h-[440px] space-y-2 overflow-y-auto p-3">
              {activeTeams.map((t, i) => {
                const meta = PARLAY_STATUSES.find((x) => x.key === t.status);
                return (
                  <div key={i} className="flex flex-wrap items-center gap-2 rounded-xl border-2 px-3 py-2.5" style={{ background: "var(--glass)", borderColor: meta.color }}>
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg font-jb text-[0.78rem] font-bold" style={{ background: `${meta.color}18`, color: meta.color, border: `1px solid ${meta.color}30` }}>{i + 1}</div>
                    <input value={t.name} onChange={(e) => patchTeam(i, "name", e.target.value)}
                      placeholder="Nama Tim"
                      className="min-w-[110px] flex-1 rounded-lg border px-2.5 py-2 text-[0.76rem] font-bold outline-none"
                      style={{ background: "rgba(255,255,255,0.95)", borderColor: "rgba(0,0,0,0.12)", color: "#000" }} />
                    <div className="flex items-center gap-1 rounded-lg border px-2 py-1.5" style={{ background: "rgba(255,255,255,0.95)", borderColor: "rgba(0,0,0,0.12)" }}>
                      <span className="font-jb text-[0.6rem] font-bold" style={{ color: "rgba(0,0,0,0.5)" }}>x</span>
                      <input inputMode="decimal" value={t.odds} step="0.01" min={0}
                        onChange={(e) => patchTeam(i, "odds", e.target.value)}
                        className="w-14 bg-transparent text-center font-jb text-[0.78rem] font-bold outline-none" style={{ color: "#000" }} />
                    </div>
                    <div className="relative">
                      <select value={t.status} onChange={(e) => patchTeam(i, "status", e.target.value)}
                        className="appearance-none rounded-lg border py-2 pl-3 pr-7 text-[0.72rem] font-bold outline-none focus:border-[var(--violet)]"
                        style={{ background: `${meta.color}22`, borderColor: `${meta.color}66`, color: meta.color }}>
                        {PARLAY_STATUSES.map((s) => <option key={s.key} value={s.key} style={{ color: "#000", background: "#fff", fontWeight: 700 }}>{s.label}</option>)}
                      </select>
                      <i className="fa-solid fa-chevron-down pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[0.5rem]" style={{ color: meta.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Result card */}
          <motion.div key={result.finalStatus + result.totalOdds} initial={{ opacity: 0.6, y: 6 }} animate={{ opacity: 1, y: 0 }}
            className="overflow-hidden rounded-2xl border" style={{ background: result.isLose ? "rgba(var(--coral-rgb),0.06)" : "var(--card)", borderColor: result.isLose ? "rgba(var(--coral-rgb),0.4)" : "var(--border)" }}>
            <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: "var(--border)", background: "linear-gradient(135deg, var(--bg-2), var(--card-solid))" }}>
              <div className="flex items-center gap-2">
                <span className="text-[0.78rem] font-bold" style={{ color: "var(--text)" }}>Hasil Perhitungan</span>
              </div>
              <span className="rounded-full px-3 py-1.5 text-[0.62rem] font-black tracking-wider" style={{ color: sMeta.color, background: sMeta.bg, border: `1px solid ${sMeta.color}40` }}>
                {result.isLose && <AlertTriangle size={10} className="mr-1 inline" />}{sMeta.label}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-px md:grid-cols-4" style={{ background: "var(--border)" }}>
              <Stat label="Total Odds" value={fmt4(result.totalOdds) + "x"} color="var(--violet)" />
              <Stat label="Nominal Betting" value={formatRp(stake)} color="var(--text)" />
              <Stat label="Profit Bersih" value={formatRp(result.profit)} color={result.profit >= 0 ? "var(--green)" : "var(--coral)"} />
              <Stat label="Total Pembayaran" value={formatRp(result.totalPayout)} color={result.isLose ? "var(--coral)" : "var(--green)"} />
            </div>
            <div className="flex flex-wrap items-center gap-2 p-3">
              <button onClick={handleCopy} className="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-[0.7rem] font-semibold transition-colors hover:bg-[var(--hover)]" style={{ borderColor: "var(--border)", color: "var(--text)" }}>
                {copied ? <Check size={13} style={{ color: "var(--green)" }} /> : <Copy size={13} />} Copy
              </button>
              <button onClick={handlePDF} className="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-[0.7rem] font-semibold transition-colors hover:bg-[var(--hover)]" style={{ borderColor: "var(--border)", color: "var(--text)" }}>
                <FileDown size={13} /> PDF
              </button>
              <button onClick={handleExcel} className="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-[0.7rem] font-semibold transition-colors hover:bg-[var(--hover)]" style={{ borderColor: "var(--border)", color: "var(--text)" }}>
                <FileDown size={13} /> Excel
              </button>
              <button onClick={handlePrint} className="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-[0.7rem] font-semibold transition-colors hover:bg-[var(--hover)]" style={{ borderColor: "var(--border)", color: "var(--text)" }}>
                <Printer size={13} /> Print
              </button>
              <button onClick={saveHistory} disabled={saving}
                className="ml-auto flex items-center gap-1.5 rounded-lg px-3 py-2 text-[0.7rem] font-bold transition-all hover:scale-[1.02] disabled:opacity-60"
                style={{ background: "var(--acc-grad)", color: "#000" }}>
                <Save size={13} /> {saving ? "Menyimpan…" : "Simpan Riwayat"}
              </button>
            </div>
          </motion.div>

          {/* Detail table */}
          <div className="overflow-hidden rounded-2xl border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            <CardHeader icon={<Calculator size={15} style={{ color: "var(--cyan)" }} />} bg="rgba(6,182,212,0.12)" bc="rgba(6,182,212,0.3)" title="Detail Perhitungan" />
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[0.74rem]">
                <thead>
                  <tr style={{ background: "var(--bg-2)" }}>
                    {["Tim", "Odds Awal", "Status", "Odds Setelah Konversi"].map((h) => (
                      <th key={h} className="px-4 py-2.5 font-bold" style={{ color: "var(--text-3)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.converted.map((t, i) => {
                    const m = PARLAY_STATUSES.find((x) => x.key === t.status);
                    return (
                      <tr key={i} className="border-t" style={{ borderColor: "var(--border)" }}>
                        <td className="px-4 py-2.5 font-semibold" style={{ color: "var(--text)" }}>{t.name || `Tim ${i + 1}`}</td>
                        <td className="px-4 py-2.5 font-jb" style={{ color: "var(--text-2)" }}>{t.odds}</td>
                        <td className="px-4 py-2.5"><span className="rounded-full px-2 py-0.5 text-[0.62rem] font-bold" style={{ color: m.color, background: `${m.color}18` }}>{m.label}</span></td>
                        <td className="px-4 py-2.5 font-jb font-bold" style={{ color: t.converted === 0 ? "var(--coral)" : "var(--green)" }}>{fmt4(t.converted)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Calculation steps */}
          <div className="overflow-hidden rounded-2xl border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            <CardHeader icon={<Calculator size={15} style={{ color: "var(--gold)" }} />} bg="rgba(247,200,67,0.12)" bc="rgba(247,200,67,0.3)" title="Langkah Perhitungan" />
            <div className="space-y-2 p-4">
              {steps.map((s, i) => (
                <div key={i} className="flex items-start gap-2.5 rounded-lg border px-3 py-2 font-jb text-[0.78rem]" style={{ borderColor: "var(--border)", background: "var(--glass)", color: "var(--text)" }}>
                  <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md text-[0.6rem] font-bold" style={{ background: "var(--acc-grad)", color: "#000" }}>{i + 1}</span>
                  <span className="break-all">{s}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Penjelasan untuk Member */}
          <div className="overflow-hidden rounded-2xl border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: "var(--border)", background: "linear-gradient(135deg, var(--bg-2), var(--card-solid))" }}>
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl" style={{ background: "rgba(var(--green-rgb),0.12)", border: "1px solid rgba(var(--green-rgb),0.3)" }}>
                  <Send size={14} style={{ color: "var(--green)" }} />
                </span>
                <div>
                  <h3 className="font-heading text-[0.86rem] font-bold leading-tight" style={{ color: "var(--text)" }}>Penjelasan untuk Member</h3>
                  <p className="text-[0.58rem]" style={{ color: "var(--text-3)" }}>Pesan formal siap salin &amp; kirim</p>
                </div>
              </div>
              <button onClick={handleCopyMsg}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-[0.7rem] font-bold transition-all hover:scale-[1.02]"
                style={{ background: copiedMsg ? "rgba(var(--green-rgb),0.15)" : "var(--acc-grad)", color: copiedMsg ? "var(--green)" : "#000", border: copiedMsg ? "1px solid rgba(var(--green-rgb),0.4)" : "1px solid transparent" }}>
                {copiedMsg ? <Check size={13} /> : <Copy size={13} />} {copiedMsg ? "Tersalin" : "Copy ke Member"}
              </button>
            </div>
            <div className="p-4">
              <pre className="ds-scroll max-h-[340px] whitespace-pre-wrap break-words overflow-y-auto font-body text-[0.74rem] leading-relaxed" style={{ color: "var(--text-2)" }}>{memberMessage}</pre>
            </div>
          </div>

          {/* History */}
          <div className="overflow-hidden rounded-2xl border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            <CardHeader icon={<Save size={15} style={{ color: "var(--blue)" }} />} bg="rgba(59,130,246,0.12)" bc="rgba(59,130,246,0.3)" title="Riwayat Perhitungan"
              right={history.length ? <button onClick={clearHistory} className="flex items-center gap-1 text-[0.62rem] font-bold" style={{ color: "var(--coral)" }}><Trash2 size={11} /> Bersihkan</button> : null} />
            <div className="ds-scroll max-h-[280px] overflow-y-auto">
              {history.length === 0 ? (
                <div className="p-6 text-center text-[0.74rem]" style={{ color: "var(--text-3)" }}>Belum ada riwayat. Klik "Simpan Riwayat" setelah menghitung.</div>
              ) : history.map((h) => {
                const hm = STATUS_META[h.finalStatus] || STATUS_META.LOSE;
                return (
                  <div key={h.id} className="flex items-center gap-3 border-t px-4 py-2.5" style={{ borderColor: "var(--border)" }}>
                    <span className="rounded-full px-2 py-0.5 text-[0.56rem] font-bold" style={{ color: hm.color, background: hm.bg }}>{hm.label}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[0.74rem] font-semibold truncate" style={{ color: "var(--text)" }}>{h.teamCount} Tim • {formatRp(h.stake)}</div>
                      <div className="font-jb text-[0.62rem]" style={{ color: "var(--text-3)" }}>Odds {h.totalOdds}x • Profit {formatRp(h.profit)}</div>
                    </div>
                    <span className="text-[0.56rem]" style={{ color: "var(--text-3)" }}>{new Date(h.createdAt).toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short" })}</span>
                    <button onClick={() => removeHistory(h.id)} className="flex h-7 w-7 items-center justify-center rounded-lg border transition-colors hover:bg-[var(--hover)]" style={{ borderColor: "var(--border)", color: "var(--coral)" }}><Trash2 size={12} /></button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function fmt4(n) {
  const v = Math.round((Number(n) || 0) * 10000) / 10000;
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 4 }).format(v);
}

function CardHeader({ icon, title, bg, bc, right }) {
  return (
    <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: "var(--border)", background: "linear-gradient(135deg, var(--bg-2), var(--card-solid))" }}>
      <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl" style={{ background: bg, border: `1px solid ${bc}` }}>{icon}</span>
        <h3 className="font-heading text-[0.86rem] font-bold" style={{ color: "var(--text)" }}>{title}</h3>
      </div>
      {right}
    </div>
  );
}

function Label({ text }) {
  return <label className="mb-1.5 block text-[0.64rem] font-bold uppercase tracking-wider" style={{ color: "var(--text-3)" }}>{text}</label>;
}

function Stat({ label, value, color }) {
  return (
    <div className="p-3.5" style={{ background: "var(--card-solid)" }}>
      <div className="text-[0.54rem] font-bold uppercase tracking-wider" style={{ color: "var(--text-3)" }}>{label}</div>
      <div className="mt-1 font-heading text-[1rem] font-black leading-tight break-words" style={{ color }}>{value}</div>
    </div>
  );
}