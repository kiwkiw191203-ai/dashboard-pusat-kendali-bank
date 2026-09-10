import React, { useMemo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, X, BookOpen } from "lucide-react";
import { calcTogel, resolveBet, formatRp, fmtPct, hadiahLabel } from "@/lib/togelCalc";

export default function TogelPrizeTableModal({ open, onClose, market }) {
  const groups = useMemo(() => {
    if (!market) return [];
    const map = new Map();
    for (const b of market.bets) {
      if (!map.has(b.group)) map.set(b.group, []);
      map.get(b.group).push(b);
    }
    return Array.from(map.entries());
  }, [market]);

  return createPortal(
    <AnimatePresence>
      {open && market && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.94, y: 10 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-[88vh] w-[820px] max-w-[94vw] flex-col overflow-hidden rounded-3xl border"
            style={{ background: "var(--card-solid)", borderColor: "var(--border)", boxShadow: "0 32px 80px rgba(0,0,0,0.8)" }}>

            <div className="sticky top-0 z-10 flex items-center justify-between border-b px-5 py-3.5" style={{ borderColor: "var(--border)", background: "linear-gradient(135deg, var(--bg-2), var(--card-solid))" }}>
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl" style={{ background: "rgba(247,200,67,0.12)", border: "1px solid rgba(247,200,67,0.3)" }}>
                  <Crown size={14} style={{ color: "var(--acc)" }} />
                </span>
                <div>
                  <h3 className="font-heading text-[0.9rem] font-bold" style={{ color: "var(--text)" }}>Daftar Hadiah &amp; Diskon — {market.name}</h3>
                  <p className="text-[0.58rem]" style={{ color: "var(--text-3)" }}>{market.note}</p>
                </div>
              </div>
              <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-xl border transition-colors hover:bg-[var(--hover)]" style={{ borderColor: "var(--border)", color: "var(--text-3)", background: "var(--bg-2)" }}>
                <X size={14} />
              </button>
            </div>

            <div className="ds-scroll flex-1 overflow-y-auto px-5 py-4">
              <div className="mx-auto max-w-[760px] space-y-4">
                <div className="rounded-2xl border p-3.5" style={{ borderColor: "rgba(247,200,67,0.3)", background: "rgba(247,200,67,0.06)" }}>
                  <div className="mb-1.5 flex items-center justify-center gap-2">
                    <BookOpen size={13} style={{ color: "var(--acc)" }} />
                    <span className="text-[0.7rem] font-bold" style={{ color: "var(--text)" }}>Rumus</span>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 font-jb text-[0.64rem]" style={{ color: "var(--text-2)" }}>
                    <span><b style={{ color: "var(--acc)" }}>Modal</b> = Taruhan × (1 − Diskon)</span>
                    <span><b style={{ color: "var(--green)" }}>Menang</b> = Taruhan × Hadiah</span>
                    <span><b style={{ color: "var(--blue)" }}>Even</b> = Taruhan × (2 − Kei)</span>
                  </div>
                </div>

                {groups.map(([groupName, bets], gi) => (
                  <div key={groupName} className="overflow-hidden rounded-2xl border" style={{ borderColor: "var(--border)", background: "var(--bg-2)", boxShadow: "var(--shadow-sm)" }}>
                    <div className="flex items-center gap-2.5 border-b px-4 py-2.5" style={{ borderColor: "var(--border)", background: "linear-gradient(135deg, var(--surface-2), var(--bg-2))" }}>
                      <span className="flex h-6 w-6 items-center justify-center rounded-lg font-jb text-[0.58rem] font-black" style={{ background: "var(--acc-grad)", color: "#000" }}>{gi + 1}</span>
                      <span className="text-[0.78rem] font-bold" style={{ color: "var(--text)" }}>{groupName}</span>
                    </div>
                    <table className="w-full text-left text-[0.72rem]">
                      <thead>
                        <tr style={{ background: "var(--surface-2)" }}>
                          <th className="px-4 py-2 font-bold" style={{ color: "var(--text-3)" }}>Jenis</th>
                          <th className="px-2 py-2 font-bold" style={{ color: "var(--rose)" }}>Hadiah</th>
                          <th className="px-2 py-2 font-bold text-center" style={{ color: "var(--acc)" }}>Diskon</th>
                          <th className="px-3 py-2 font-bold text-right" style={{ color: "var(--text-3)" }}>Modal<span className="block text-[0.46rem] font-medium normal-case opacity-70">/Rp 1.000</span></th>
                          <th className="px-3 py-2 font-bold text-right" style={{ color: "var(--text-3)" }}>Menang<span className="block text-[0.46rem] font-medium normal-case opacity-70">/Rp 1.000</span></th>
                        </tr>
                      </thead>
                      <tbody>
                        {bets.map((b, bi) => {
                          const opt = b.options?.[0];
                          const cfg = resolveBet(b, opt);
                          const c = calcTogel(1000, cfg);
                          return (
                            <tr key={b.key} className="border-t" style={{ borderColor: "var(--border)", background: bi % 2 ? "var(--surface-2)" : "var(--card-solid)" }}>
                              <td className="px-4 py-2 font-semibold" style={{ color: "var(--text)" }}>{b.label}</td>
                              <td className="px-2 py-2 font-jb" style={{ color: "var(--rose)" }}>{hadiahLabel(b)}</td>
                              <td className="px-2 py-2 text-center font-jb" style={{ color: "var(--acc)" }}>{b.model === "full" ? "—" : fmtPct(b.discount || 0)}</td>
                              <td className="px-3 py-2 text-right font-jb font-bold" style={{ color: "var(--text)" }}>{formatRp(c.modalBayar).replace("Rp ", "")}</td>
                              <td className="px-3 py-2 text-right font-jb font-bold" style={{ color: "var(--green)" }}>{formatRp(c.potensiMenang).replace("Rp ", "")}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}