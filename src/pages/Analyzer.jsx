import React, { useMemo, useState } from "react";
import { Copy, RotateCcw, Inbox, Sparkles, Crown, XCircle } from "lucide-react";
import PageHead from "@/components/dashboard/PageHead";
import { copyText } from "@/components/dashboard/utils";

function parseIDR(s) {
  const m = s.match(/IDR\s*([\d.,]+)/i);
  if (!m) return 0;
  return parseFloat(m[1].replace(/\./g, "").replace(",", ".")) || 0;
}
function formatNum(n) {
  if (!n) return "0,000";
  const p = n.toFixed(3).split(".");
  return p[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "," + p[1];
}

export default function Analyzer() {
  const [text, setText] = useState("");

  const result = useMemo(() => {
    const lines = text.split("\n");
    const spins = [];
    let cur = null, total = 0, wins = 0, max = 0;
    for (const line of lines) {
      const sm = line.match(/Free Spin:\s*(\d+)\/(\d+)/i);
      if (sm) cur = { num: +sm[1], tot: +sm[2], amt: 0 };
      const im = line.match(/IDR\s*([\d.,]+)/i);
      if (im && cur) {
        cur.amt = parseIDR(line);
        spins.push(cur);
        total += cur.amt;
        if (cur.amt > 0) wins++;
        if (cur.amt > max) max = cur.amt;
        cur = null;
      }
    }
    spins.sort((a, b) => a.num - b.num);
    return { spins, total, wins, max };
  }, [text]);

  const isWin = result.total > 0;

  return (
    <div className="w-full p-4 md:p-7">
      <PageHead
        icon="fa-bolt" color="var(--violet)"
        title="FREE SPIN ANALYZER" subtitle="Tempel teks hasil spin, analisis otomatis"
        badges={[{ icon: "fa-bolt", text: "Analyzer", color: "var(--violet)" }, { icon: "fa-paste", text: "Real-time", color: "var(--teal)" }]}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.4fr]">
        {/* Input */}
        <div className="ds-in rounded-2xl border p-5" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <div className="mb-4 flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg text-xs" style={{ background: "rgba(139,92,246,0.14)", color: "var(--violet)", border: "1px solid rgba(139,92,246,0.3)" }}>
              <i className="fa-solid fa-paste" />
            </div>
            <h3 className="text-[0.82rem] font-semibold" style={{ color: "var(--text-2)" }}>Tempel Teks</h3>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Tempel teks hasil spin di sini..."
            className="ds-scroll h-48 w-full resize-y rounded-xl border p-4 font-jb text-[0.74rem] leading-relaxed outline-none transition-colors focus:border-[var(--violet)]"
            style={{ background: "var(--glass)", borderColor: "var(--border)", color: "var(--text)" }}
          />
          <div className="my-4 grid grid-cols-3 gap-2.5">
            <Metric n={result.spins.length} label="Total Spin" color="var(--violet)" />
            <Metric n={result.wins} label="Menang" color="var(--acc)" />
            <Metric n={result.max} label="Max Win" color="var(--teal)" />
          </div>
          <div className="flex justify-end">
            <button onClick={() => setText("")} className="flex items-center gap-2 rounded-xl border px-4 py-2.5 text-[0.76rem] font-semibold transition-colors hover:bg-[var(--hover)]" style={{ borderColor: "rgba(248,113,113,0.2)", color: "var(--coral)", background: "var(--glass)" }}>
              <RotateCcw size={14} /> Reset
            </button>
          </div>
        </div>

        {/* Result */}
        <div className="ds-in rounded-2xl border p-5" style={{ background: "var(--card)", borderColor: "var(--border)", animationDelay: ".1s" }}>
          <div className="mb-4 flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg text-xs" style={{ background: "rgba(32,201,151,0.14)", color: "var(--teal)", border: "1px solid rgba(32,201,151,0.3)" }}>
              <i className="fa-solid fa-table" />
            </div>
            <h3 className="text-[0.82rem] font-semibold" style={{ color: "var(--text-2)" }}>Hasil Analisis</h3>
          </div>
          <button
            onClick={() => copyText(formatNum(result.total), "Total Win disalin!")}
            className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-[0.78rem] font-bold text-black transition-transform hover:scale-[1.02]"
            style={{ background: "var(--acc-grad)" }}
          >
            <Copy size={15} /> Copy Total Win
          </button>

          <div className="ds-scroll mb-4 max-h-[280px] overflow-y-auto rounded-xl border" style={{ borderColor: "var(--border)" }}>
            {result.spins.length === 0 ? (
              <div className="py-10 text-center" style={{ color: "var(--text-3)" }}>
                <Inbox size={28} className="mx-auto mb-2 opacity-40" />
                <p className="text-[0.74rem]">Tempel teks untuk menganalisis</p>
              </div>
            ) : (
              <table className="w-full border-collapse">
                <thead className="sticky top-0">
                  <tr>
                    {["Free Spin", "Nominal", "Status"].map((h) => (
                      <th key={h} className="border-b px-4 py-3 text-left text-[0.56rem] font-bold uppercase tracking-wider" style={{ background: "var(--card-solid)", color: "var(--text-3)", borderColor: "var(--border)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.spins.map((s, j) => (
                    <tr key={j} className="transition-colors hover:bg-[var(--hover)]">
                      <td className="border-b px-4 py-2.5 font-jb text-[0.71rem]" style={{ color: "var(--violet)", borderColor: "var(--border)" }}>Free Spin #{s.num}/{s.tot}</td>
                      <td className="border-b px-4 py-2.5 font-jb text-[0.71rem]" style={{ color: s.amt > 0 ? "var(--acc)" : "var(--text-3)", borderColor: "var(--border)" }}>{formatNum(s.amt)}</td>
                      <td className="border-b px-4 py-2.5" style={{ borderColor: "var(--border)" }}>
                        <span className="rounded-full px-2.5 py-1 text-[0.54rem] font-bold uppercase tracking-wide" style={s.amt > 0 ? { background: "rgba(var(--acc-rgb),0.1)", color: "var(--acc)" } : { background: "rgba(248,113,113,0.08)", color: "var(--coral)" }}>{s.amt > 0 ? "WIN" : "LOSE"}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="flex items-center justify-between rounded-xl border p-4" style={{ background: "var(--glass)", borderColor: isWin ? "rgba(var(--acc-rgb),0.25)" : "var(--border)" }}>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: isWin ? "rgba(var(--acc-rgb),0.12)" : "rgba(248,113,113,0.08)", color: isWin ? "var(--acc)" : "var(--coral)" }}>
                {isWin ? <Crown size={18} /> : <XCircle size={18} />}
              </div>
              <div>
                <div className="text-[0.66rem] uppercase tracking-wide" style={{ color: "var(--text-3)" }}>Total Win</div>
                <div className="flex items-center gap-1.5 text-[0.66rem] font-semibold" style={{ color: isWin ? "var(--acc)" : "var(--coral)" }}>
                  <Sparkles size={11} /> {isWin ? "Kemenangan tercatat" : "Belum ada kemenangan"}
                </div>
              </div>
            </div>
            <div className="font-jb text-2xl font-bold" style={{ color: isWin ? "var(--acc)" : "var(--coral)" }}>{formatNum(result.total)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Metric({ n, label, color }) {
  return (
    <div className="rounded-xl border p-3 text-center" style={{ background: "var(--glass)", borderColor: "var(--border)" }}>
      <div className="font-jb text-xl font-bold" style={{ color }}>{n}</div>
      <div className="mt-0.5 text-[0.55rem] font-bold uppercase tracking-wider" style={{ color: "var(--text-3)" }}>{label}</div>
    </div>
  );
}