import React, { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calculator, Copy, Check, BookOpen, RotateCcw, Hash, X } from "lucide-react";
import { toast } from "sonner";
import PageHead from "@/components/dashboard/PageHead";
import TogelPrizeTableModal from "@/components/togel/TogelPrizeTableModal";
import { TOGEL_MARKETS } from "@/lib/togelMarkets";
import { loadLiveMarkets } from "@/lib/togelConfigStore";
import { calcTogel, resolveBet, formatRp, fmtPct, hadiahLabel, keiLabel } from "@/lib/togelCalc";

const fmtNum = (n) => new Intl.NumberFormat("en-US").format(Number(n) || 0);

export default function TogelCalculator() {
  const [markets, setMarkets] = useState(() => JSON.parse(JSON.stringify(TOGEL_MARKETS)));
  useEffect(() => { loadLiveMarkets().then(setMarkets); }, []);
  const [marketKey, setMarketKey] = useState("umum");
  const [betKey, setBetKey] = useState("4d");
  const [optionIdx, setOptionIdx] = useState(0);
  const [jumlah, setJumlah] = useState(1000);
  const [copied, setCopied] = useState(false);
  const [showTable, setShowTable] = useState(false);

  const market = markets.find((m) => m.key === marketKey) || markets[0];
  const bet = market?.bets.find((b) => b.key === betKey) || market?.bets[0];
  const option = bet?.options?.[optionIdx];

  // Reset pilihan ketika ganti pasaran/bet
  useEffect(() => { setOptionIdx(0); }, [betKey, marketKey]);

  const cfg = useMemo(() => resolveBet(bet, option), [bet, option]);
  const res = useMemo(() => calcTogel(jumlah, cfg), [jumlah, cfg]);

  const onMarketChange = (key) => {
    setMarketKey(key);
    const m = markets.find((x) => x.key === key);
    if (m) setBetKey(m.bets[0]?.key);
  };

  // Group bets untuk dropdown
  const groupedBets = useMemo(() => {
    const map = new Map();
    for (const b of market?.bets || []) {
      if (!map.has(b.group)) map.set(b.group, []);
      map.get(b.group).push(b);
    }
    return Array.from(map.entries());
  }, [market]);

  const memberMessage = useMemo(() => {
    const hr = new Date().getHours();
    const salam = hr < 11 ? "Selamat pagi" : hr < 15 ? "Selamat siang" : hr < 18 ? "Selamat sore" : "Selamat malam";
    const lines = [`${salam}, Bosku.`, "", `Berikut rincian taruhan Anda ya bosku.`, "", `Pasaran        : ${market.name}`, `Jenis          : ${bet.label}${option ? " — " + option.label : ""}`, `Jumlah Taruhan : ${formatRp(jumlah)}`];

    if (cfg.model === "bb") {
      lines.push(`Hadiah Tepat    : ${cfg.prize}x`);
      lines.push(`Hadiah Terbalik : ${cfg.terbalikPrize}x`);
      lines.push(`Diskon          : ${fmtPct(cfg.discount)}`);
      lines.push(`Modal Bayar     : ${formatRp(res.modalBayar)}`);
      lines.push(`Menang (Tepat)  : ${formatRp(res.potensiMenang)}`);
      lines.push(`Menang (Terbalik): ${formatRp(res.potensiMenangTerbalik)}`);
      lines.push("", `Jadi, bila tepat Anda menerima ${formatRp(res.potensiMenang)}, bila terbalik ${formatRp(res.potensiMenangTerbalik)} ya bosku.`);
    } else if (cfg.model === "even") {
      lines.push(`Diskon          : ${fmtPct(cfg.discount)}`);
      lines.push(`Kei             : ${keiLabel(cfg.kei)}`);
      lines.push(`Modal Bayar     : ${formatRp(res.modalBayar)}`);
      lines.push(`Potensi Menang  : ${formatRp(res.potensiMenang)} (${keiLabel(cfg.kei)})`);
      lines.push("", `Jadi, bila menang Anda menerima ${formatRp(res.potensiMenang)} ya bosku.`);
    } else {
      lines.push(`Hadiah          : ${cfg.model === "full" ? bet.prize + "x" : cfg.prize + "x"}`);
      lines.push(`Diskon          : ${cfg.model === "full" ? "0% (Full)" : fmtPct(cfg.discount)}`);
      lines.push(`Modal Bayar     : ${formatRp(res.modalBayar)}`);
      lines.push(`Potensi Menang  : ${formatRp(res.potensiMenang)}`);
      lines.push("", `Jadi, Anda membayar ${formatRp(res.modalBayar)} dan berpotensi menang ${formatRp(res.potensiMenang)} ya bosku. Selamat ya Bosku.`);
    }
    lines.push("", `Terima kasih, Bosku.`);
    return lines.join("\n");
  }, [market, bet, option, jumlah, res, cfg]);

  const handleCopy = async () => {
    if (!jumlah || Number(jumlah) <= 0) { toast.error("Jumlah taruhan harus lebih dari 0"); return; }
    try {
      await navigator.clipboard.writeText(memberMessage);
      setCopied(true); toast.success("Hasil disalin, siap kirim ke member");
      setTimeout(() => setCopied(false), 1500);
    } catch { toast.error("Gagal menyalin"); }
  };

  const reset = () => {
    setMarketKey("umum"); setBetKey("4d"); setOptionIdx(0); setJumlah(1000);
    toast.info("Form direset");
  };

  return (
    <div className="w-full p-4 md:p-7">
      <PageHead
        icon="fa-calculator" color="var(--rose)"
        title="KALKULATOR TOGEL"
        subtitle="Hitung modal bayar & potensi kemenangan per jenis bet untuk semua pasaran."
        badges={[
          { text: market.name, color: "var(--rose)" },
          { text: bet?.label, color: "var(--acc)" },
        ]}
      />

      <div className="mb-5 flex flex-wrap items-center justify-end gap-2">
        <button onClick={reset}
          className="flex items-center gap-2 rounded-xl border px-3 py-2 text-[0.72rem] font-semibold transition-colors hover:bg-[var(--hover)]"
          style={{ borderColor: "var(--border)", color: "var(--text)", background: "var(--card)" }}>
          <RotateCcw size={14} /> Reset
        </button>
        <button onClick={() => setShowTable(true)}
          className="flex items-center gap-2 rounded-xl border px-3 py-2 text-[0.72rem] font-semibold transition-colors hover:bg-[var(--hover)]"
          style={{ borderColor: "var(--border)", color: "var(--text)", background: "var(--card)" }}>
          <BookOpen size={14} /> Lihat Daftar Hadiah &amp; Diskon
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[400px_1fr]">
        {/* LEFT — Inputs */}
        <div className="space-y-5">
          <div className="overflow-hidden rounded-2xl border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            <CardHeader icon={<Calculator size={15} style={{ color: "var(--rose)" }} />} bg="rgba(244,63,94,0.12)" bc="rgba(244,63,94,0.3)" title="Input Taruhan" />
            <div className="space-y-4 p-4">
              <div>
                <Label text="Pasaran" />
                <div className="relative">
                  <select value={marketKey} onChange={(e) => onMarketChange(e.target.value)}
                    className="w-full appearance-none rounded-xl border py-3 px-3 pr-9 text-[0.82rem] font-bold outline-none focus:border-[var(--rose)]"
                    style={{ background: "rgba(255,255,255,0.95)", borderColor: "rgba(0,0,0,0.12)", color: "#000" }}>
                    {markets.map((m) => <option key={m.key} value={m.key} style={{ color: "#000" }}>{m.name}</option>)}
                  </select>
                  <i className="fa-solid fa-chevron-down pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[0.6rem]" style={{ color: "rgba(0,0,0,0.5)" }} />
                </div>
                {market?.note && <p className="mt-2 text-[0.62rem] leading-snug" style={{ color: "var(--text-3)" }}>{market.note}</p>}
              </div>

              <div>
                <Label text="Jenis Bet" />
                <div className="relative">
                  <select value={betKey} onChange={(e) => setBetKey(e.target.value)}
                    className="w-full appearance-none rounded-xl border py-3 px-3 pr-9 text-[0.82rem] font-bold outline-none focus:border-[var(--rose)]"
                    style={{ background: "rgba(255,255,255,0.95)", borderColor: "rgba(0,0,0,0.12)", color: "#000" }}>
                    {groupedBets.map(([g, bets]) => (
                      <optgroup key={g} label={g}>
                        {bets.map((b) => <option key={b.key} value={b.key} style={{ color: "#000" }}>{b.label}</option>)}
                      </optgroup>
                    ))}
                  </select>
                  <i className="fa-solid fa-chevron-down pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[0.6rem]" style={{ color: "rgba(0,0,0,0.5)" }} />
                </div>
              </div>

              {/* Sub-opsi untuk multi / dasar */}
              {bet?.options && (
                <div>
                  <Label text={bet.model === "dasar" ? "Pilihan Dasar" : "Pilih Hadiah"} />
                  <div className="grid grid-cols-2 gap-2">
                    {bet.options.map((o, i) => {
                      const on = i === optionIdx;
                      return (
                        <button key={i} onClick={() => setOptionIdx(i)}
                          className="rounded-xl border-2 py-2.5 text-[0.72rem] font-bold transition-all"
                          style={{
                            borderColor: on ? "var(--rose)" : "rgba(0,0,0,0.12)",
                            background: on ? "rgba(244,63,94,0.12)" : "rgba(255,255,255,0.95)",
                            color: on ? "var(--rose)" : "#000",
                          }}>
                          {o.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div>
                <Label text="Jumlah Taruhan" />
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-jb text-[0.82rem] font-bold" style={{ color: "rgba(0,0,0,0.5)" }}>Rp</span>
                  <input inputMode="numeric" value={fmtNum(jumlah)}
                    onChange={(e) => setJumlah(Number(e.target.value.replace(/[^\d]/g, "")) || 0)}
                    className="w-full rounded-xl border py-3 pl-10 pr-3 text-[0.82rem] font-jb font-bold outline-none focus:border-[var(--rose)]"
                    style={{ background: "rgba(255,255,255,0.95)", borderColor: "rgba(0,0,0,0.12)", color: "#000" }} />
                </div>
              </div>
            </div>
          </div>

          {/* Info bet terpilih */}
          <div className="overflow-hidden rounded-2xl border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            <CardHeader icon={<BookOpen size={15} style={{ color: "var(--gold)" }} />} bg="rgba(247,200,67,0.12)" bc="rgba(247,200,67,0.3)" title="Info Bet" />
            <div className="space-y-2 p-4 text-[0.74rem]">
              <InfoRow label="Hadiah" value={hadiahLabel(bet)} color="var(--rose)" />
              <InfoRow label="Diskon" value={bet?.model === "full" ? "0% (Full)" : fmtPct(bet?.discount || 0)} color="var(--acc)" />
              {bet?.model === "even" && <InfoRow label="Kei" value={keiLabel(bet.kei)} color="var(--blue)" />}
              {bet?.model === "bb" && <InfoRow label="Tipe" value="Bolak Balik (Tepat & Terbalik)" color="var(--violet)" />}
            </div>
          </div>
        </div>

        {/* RIGHT — Result + Member message */}
        <div className="space-y-5">
          <motion.div key={betKey + jumlah + optionIdx} initial={{ opacity: 0.6, y: 6 }} animate={{ opacity: 1, y: 0 }}
            className="overflow-hidden rounded-2xl border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: "var(--border)", background: "linear-gradient(135deg, var(--bg-2), var(--card-solid))" }}>
              <span className="text-[0.78rem] font-bold" style={{ color: "var(--text)" }}>Hasil Perhitungan</span>
              <span className="rounded-full px-3 py-1.5 text-[0.62rem] font-black tracking-wider" style={{ color: "var(--green)", background: "rgba(16,185,129,0.14)", border: "1px solid rgba(16,185,129,0.4)" }}>
                {cfg.model === "bb" ? "BB" : cfg.model === "even" ? "EVEN" : (cfg.prize || bet?.prize) + "x"}
              </span>
            </div>

            {cfg.model === "bb" ? (
              <div className="grid grid-cols-2 gap-px md:grid-cols-3" style={{ background: "var(--border)" }}>
                <Stat label="Modal Bayar" value={formatRp(res.modalBayar)} color="var(--text)" />
                <Stat label="Hadiah Tepat" value={cfg.prize + "x"} color="var(--green)" />
                <Stat label="Hadiah Terbalik" value={cfg.terbalikPrize + "x"} color="var(--acc)" />
                <Stat label="Menang (Tepat)" value={formatRp(res.potensiMenang)} color="var(--green)" />
                <Stat label="Menang (Terbalik)" value={formatRp(res.potensiMenangTerbalik)} color="var(--acc)" />
                <Stat label="Profit (Tepat)" value={formatRp(res.profit)} color={res.profit >= 0 ? "var(--green)" : "var(--coral)"} />
              </div>
            ) : cfg.model === "even" ? (
              <div className="grid grid-cols-2 gap-px md:grid-cols-3" style={{ background: "var(--border)" }}>
                <Stat label="Diskon" value={fmtPct(cfg.discount)} color="var(--acc)" />
                <Stat label="Kei" value={keiLabel(cfg.kei)} color="var(--blue)" />
                <Stat label="Modal Bayar" value={formatRp(res.modalBayar)} color="var(--text)" />
                <Stat label="Potensi Menang" value={formatRp(res.potensiMenang)} color="var(--green)" />
                <Stat label="Profit" value={formatRp(res.profit)} color={res.profit >= 0 ? "var(--green)" : "var(--coral)"} />
                <Stat label="Rumus" value="Taruhan × (2 − Kei)" color="var(--text-3)" />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-px md:grid-cols-2" style={{ background: "var(--border)" }}>
                <Stat label="Hadiah" value={(cfg.prize || bet?.prize) + "x"} color="var(--rose)" />
                <Stat label="Diskon" value={cfg.model === "full" ? "0% (Full)" : fmtPct(cfg.discount)} color="var(--acc)" />
                <Stat label="Modal Bayar" value={formatRp(res.modalBayar)} color="var(--text)" />
                <Stat label="Potensi Menang" value={formatRp(res.potensiMenang)} color="var(--green)" />
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2 p-3">
              <button onClick={handleCopy}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-[0.7rem] font-bold transition-all hover:scale-[1.02]"
                style={{ background: copied ? "rgba(16,185,129,0.15)" : "var(--acc-grad)", color: copied ? "var(--green)" : "#000", border: copied ? "1px solid rgba(16,185,129,0.4)" : "1px solid transparent" }}>
                {copied ? <Check size={13} /> : <Copy size={13} />} {copied ? "Tersalin" : "Salin Hasil untuk Member"}
              </button>
            </div>
          </motion.div>

          {/* Penjelasan untuk Member */}
          <div className="overflow-hidden rounded-2xl border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: "var(--border)", background: "linear-gradient(135deg, var(--bg-2), var(--card-solid))" }}>
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl" style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.3)" }}>
                  <Hash size={14} style={{ color: "var(--green)" }} />
                </span>
                <div>
                  <h3 className="font-heading text-[0.86rem] font-bold leading-tight" style={{ color: "var(--text)" }}>Penjelasan untuk Member</h3>
                  <p className="text-[0.58rem]" style={{ color: "var(--text-3)" }}>Pesan formal siap salin &amp; kirim</p>
                </div>
              </div>
              <button onClick={handleCopy}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-[0.7rem] font-bold transition-all hover:scale-[1.02]"
                style={{ background: copied ? "rgba(16,185,129,0.15)" : "var(--acc-grad)", color: copied ? "var(--green)" : "#000", border: copied ? "1px solid rgba(16,185,129,0.4)" : "1px solid transparent" }}>
                {copied ? <Check size={13} /> : <Copy size={13} />} {copied ? "Tersalin" : "Copy ke Member"}
              </button>
            </div>
            <div className="p-4">
              <pre className="ds-scroll max-h-[340px] whitespace-pre-wrap break-words overflow-y-auto font-body text-[0.74rem] leading-relaxed" style={{ color: "var(--text-2)" }}>{memberMessage}</pre>
            </div>
          </div>
        </div>
      </div>

      <TogelPrizeTableModal open={showTable} onClose={() => setShowTable(false)} market={market} />
    </div>
  );
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

function InfoRow({ label, value, color }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span style={{ color: "var(--text-3)" }}>{label}</span>
      <span className="font-jb font-bold text-right" style={{ color }}>{value}</span>
    </div>
  );
}

function Stat({ label, value, color }) {
  return (
    <div className="p-3.5" style={{ background: "var(--card-solid)" }}>
      <div className="text-[0.54rem] font-bold uppercase tracking-wider" style={{ color: "var(--text-3)" }}>{label}</div>
      <div className="mt-1 font-heading text-[0.92rem] font-black leading-tight break-words" style={{ color }}>{value}</div>
    </div>
  );
}