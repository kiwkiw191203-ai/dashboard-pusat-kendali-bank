import React, { useEffect, useRef, useState } from "react";
import { Dice5, Copy, ChevronDown, Shuffle, ShieldCheck } from "lucide-react";
import PageHead from "@/components/dashboard/PageHead";
import { copyText } from "@/components/dashboard/utils";
import { MARKETS, SHIO } from "@/lib/dashboardData";

const rd = (len) => Array.from({ length: len }, () => Math.floor(Math.random() * 10)).join("");
const rm = (len, count) => Array.from({ length: count }, () => rd(len)).join("  ");

export default function Predict() {
  const [market, setMarket] = useState(MARKETS.find((m) => m.name === "Hoki Draw") || MARKETS[0]);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [out, setOut] = useState("");
  const [stats, setStats] = useState({ bbfs: "-", ai: "-", cb: "-", shio: "-" });
  const boxRef = useRef(null);

  const generate = (m = market) => {
    const now = new Date();
    const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    const ds = `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
    const bbfs = rd(8);
    const ai = bbfs.substring(0, 4);
    const cb = `${bbfs[0]} / ${bbfs[1]}`;
    const ss = [...SHIO].sort(() => 0.5 - Math.random());
    const topShio = ss.slice(0, 3).map((s) => s.n.toUpperCase()).join(" / ");
    let t = `PREDIKSI ${m.name.toUpperCase()}\n${ds}\n─────────────────────────\n`;
    t += `BBFS KUAT : ${bbfs}\nAngka Ikut : ${ai}\n`;
    if (m.name === "Hoki Draw") t += `5D (BB)   : ${rm(5, 4)}\n`;
    t += `4D (BB)   : ${rm(4, 4)}\n3D (BB)   : ${rm(3, 4)}\n2D (BB)   : ${rm(2, 10)}\n`;
    t += `─────────────────────────\nColok Bebas : ${cb}\nColok Macau : ${rd(2)} / ${rd(2)} / ${rd(2)}\n`;
    t += `Colok Shio  : ${topShio}\nInvest Twin : ${bbfs[2]}${bbfs[2]} / ${bbfs[3]}${bbfs[3]} / ${bbfs[4]}${bbfs[4]}\n`;
    t += `─────────────────────────\nUPS - UTAMAKAN PREDIKSI SENDIRI`;
    setOut(t);
    setStats({ bbfs, ai, cb: `${bbfs[0]}/${bbfs[1]}`, shio: ss[0].n.substring(0, 3) });
  };

  useEffect(() => { generate(market); /* eslint-disable-next-line */ }, []);

  const filteredMarkets = MARKETS.filter((m) => m.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="w-full p-4 md:p-7">
      <PageHead
        icon="fa-dice" color="var(--rose)"
        title="LOTTERY PREDICTOR" subtitle="Prediksi angka untuk semua pasaran"
        badges={[{ icon: "fa-dice", text: `${MARKETS.length} Pasaran`, color: "var(--rose)" }, { icon: "fa-bolt", text: "Real-time", color: "var(--gold)" }]}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_260px]">
        <div className="ds-in rounded-2xl border p-5" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          {/* Control bar */}
          <div className="mb-4 flex flex-wrap items-center gap-2.5 rounded-xl border p-2.5" style={{ background: "var(--glass)", borderColor: "var(--border)" }}>
            <button onClick={() => generate()} className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-[0.76rem] font-bold text-white transition-transform hover:scale-[1.03]" style={{ background: "linear-gradient(135deg,var(--rose),var(--gold))" }}>
              <Shuffle size={15} /> Acak Angka
            </button>
            <button onClick={() => copyText(out, "Prediksi disalin!")} className="flex items-center gap-2 rounded-lg border px-4 py-2.5 text-[0.76rem] font-semibold transition-colors hover:bg-[var(--hover)]" style={{ background: "var(--card-solid)", borderColor: "var(--border)", color: "var(--text-2)" }}>
              <Copy size={14} /> Copy
            </button>
            <div className="relative min-w-[180px] flex-1">
              <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between rounded-lg border px-4 py-2.5 text-[0.82rem] transition-colors hover:bg-[var(--hover)]" style={{ background: "var(--card-solid)", borderColor: "var(--border)", color: "var(--text)" }}>
                <span className="flex items-center gap-2"><Dice5 size={14} style={{ color: "var(--rose)" }} /> {market.name}</span>
                <ChevronDown size={15} style={{ color: "var(--text-3)" }} />
              </button>
              {open && (
                <div className="ds-scroll absolute z-30 mt-1.5 max-h-60 w-full overflow-y-auto rounded-xl border shadow-xl" style={{ background: "var(--card-solid)", borderColor: "var(--border)" }}>
                  <input autoFocus value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari pasaran..." className="w-full border-b bg-transparent px-4 py-2.5 text-sm outline-none" style={{ borderColor: "var(--border)", color: "var(--text)" }} />
                  {filteredMarkets.map((m) => (
                    <button key={m.name} onClick={() => { setMarket(m); setOpen(false); setSearch(""); generate(m); }}
                      className="flex w-full items-center gap-2.5 border-b px-4 py-2.5 text-left text-[0.8rem] transition-all hover:pl-5" style={{ borderColor: "var(--border)", color: "var(--text-2)" }}>
                      <img src={m.img} alt="" className="h-6 w-6 rounded-full object-contain" /> {m.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <pre ref={boxRef} className="ds-scroll min-h-[340px] overflow-auto whitespace-pre-wrap rounded-xl border p-5 font-jb text-[0.78rem] leading-loose" style={{ background: "var(--glass)", borderColor: "var(--border)", color: "var(--text-2)" }}>
            {out}
          </pre>
        </div>

        {/* Market card */}
        <div className="ds-in flex flex-col items-center rounded-2xl border p-6 text-center" style={{ background: "var(--card)", borderColor: "var(--border)", animationDelay: ".1s" }}>
          <div className="relative mb-4 flex h-24 w-24 items-center justify-center rounded-2xl" style={{ background: "rgba(244,114,182,0.08)", border: "2px solid rgba(244,114,182,0.2)" }}>
            <img src={market.img} alt={market.name} className="h-16 w-16 rounded-full object-contain" />
          </div>
          <div className="font-heading text-[1.05rem] font-bold tracking-tight" style={{ color: "var(--rose)" }}>{market.name.toUpperCase()}</div>
          <div className="text-[0.55rem] font-semibold uppercase tracking-[2px]" style={{ color: "var(--text-3)" }}>Official Prediction</div>
          <div className="my-4 h-0.5 w-10 rounded" style={{ background: "linear-gradient(135deg,var(--rose),var(--gold))" }} />
          <div className="grid w-full grid-cols-2 gap-2">
            <SStat val={stats.bbfs} label="BBFS" />
            <SStat val={stats.ai} label="Angka Ikut" />
            <SStat val={stats.cb} label="Colok Bebas" />
            <SStat val={stats.shio} label="Shio" />
          </div>
          <div className="mt-5 flex items-center justify-center gap-1.5 border-t pt-4 text-[0.72rem]" style={{ borderColor: "var(--border)", color: "var(--text-3)" }}>
            <ShieldCheck size={12} style={{ color: "var(--gold)" }} />
            UPS - Utamakan Prediksi Sendiri
          </div>
        </div>
      </div>
    </div>
  );
}

function SStat({ val, label }) {
  return (
    <div className="rounded-lg border p-2.5 text-center" style={{ background: "var(--glass)", borderColor: "var(--border)" }}>
      <div className="truncate font-jb text-sm font-bold" style={{ color: "var(--rose)" }}>{val}</div>
      <div className="mt-0.5 text-[0.55rem] font-semibold uppercase tracking-wider" style={{ color: "var(--text-3)" }}>{label}</div>
    </div>
  );
}