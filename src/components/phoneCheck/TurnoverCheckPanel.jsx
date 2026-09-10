import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Copy, RotateCcw, Gauge, Layers, TrendingUp, ListOrdered } from "lucide-react";
import { toast } from "sonner";

function formatKoma(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function extractNominals(raw) {
  const list = [];
  let total = 0;
  const pattern = /Pertaruhan\s*([\d,]+(?:\.\d{2})?)/gi;
  let match;
  while ((match = pattern.exec(raw)) !== null) {
    let nominalStr = match[1];
    nominalStr = nominalStr.replace(/[.,]00$/, "");
    nominalStr = nominalStr.replace(/[.,]/g, "");
    const num = parseInt(nominalStr, 10);
    if (!isNaN(num)) {
      list.push(formatKoma(num));
      total += num;
    }
  }
  return { list, total };
}

export default function TurnoverCheckPanel() {
  const [raw, setRaw] = useState("");

  const { list, total } = useMemo(() => extractNominals(raw), [raw]);
  const output = list.join("\n");

  const copyRincian = () => {
    if (!output) return;
    navigator.clipboard.writeText(output).then(() => toast.success("Daftar nominal berhasil disalin!"));
  };

  const reset = () => setRaw("");

  const cards = [
    { key: "total", label: "Total Nominal", val: formatKoma(total), color: "var(--acc)", icon: Gauge },
    { key: "x1", label: "Turnover X 1", val: formatKoma(total * 1), color: "var(--acc-2)", icon: TrendingUp },
    { key: "x2", label: "Turnover X 2", val: formatKoma(total * 2), color: "var(--purple)", icon: Layers },
    { key: "x3", label: "Turnover X 3", val: formatKoma(total * 3), color: "var(--gold)", icon: ListOrdered },
  ];

  return (
    <div>
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.key} className="rounded-2xl border p-4" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl" style={{ color: c.color, background: `${c.color}16`, border: `1px solid ${c.color}2e` }}>
              <c.icon size={16} />
            </div>
            <div className="font-jb text-xl font-black" style={{ color: c.color }}>{c.val}</div>
            <div className="text-[0.64rem]" style={{ color: "var(--text-3)" }}>{c.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-[0.76rem] font-bold" style={{ color: "var(--text-2)" }}>Data Mentah</label>
            <span className="text-[0.66rem] font-jb" style={{ color: "var(--acc-2)" }}>Auto-Detect Instant</span>
          </div>
          <textarea value={raw} onChange={(e) => setRaw(e.target.value)} placeholder="Tempel (Paste) data transaksi mentah di sini..."
            className="h-64 w-full resize-y rounded-xl border p-3.5 font-jb text-[0.82rem] outline-none focus:ring-2"
            style={{ background: "#0F172A", borderColor: "var(--border)", color: "#E2E8F0", "--tw-ring-color": "rgba(var(--acc-rgb),0.28)" }} />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-[0.76rem] font-bold" style={{ color: "var(--text-2)" }}>Daftar Nominal (Keluar)</label>
            <span className="text-[0.66rem]" style={{ color: "var(--text-3)" }}>{list.length} Item</span>
          </div>
          <textarea value={output} readOnly placeholder="Hasil nominal berformat (,) akan langsung muncul di sini..."
            className="h-64 w-full resize-y rounded-xl border p-3.5 font-jb text-[0.82rem] outline-none"
            style={{ background: "#0F172A", borderColor: "var(--border)", color: "#E2E8F0" }} />
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-[3fr_1fr]">
        <button onClick={copyRincian} disabled={!output}
          className="flex items-center justify-center gap-2 rounded-xl border py-3 text-[0.8rem] font-bold disabled:opacity-50"
          style={{ borderColor: "var(--border)", color: "var(--text-2)", background: "var(--glass)" }}>
          <Copy size={15} /> Salin Rincian
        </button>
        <button onClick={reset}
          className="flex items-center justify-center gap-2 rounded-xl border py-3 text-[0.8rem] font-bold"
          style={{ borderColor: "rgba(220,38,38,0.3)", color: "var(--coral)", background: "rgba(220,38,38,0.1)" }}>
          <RotateCcw size={14} /> Reset
        </button>
      </motion.div>
    </div>
  );
}