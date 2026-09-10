import React from "react";
import { motion } from "framer-motion";

// Robot maintenance animasi — melayang, mata berkedip, antena berdenyut, sinar scan.
export default function MaintenanceRobot({ color = "var(--acc-2)", size = 180 }) {
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Aura + orbit */}
      <motion.div animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.1, 0.3] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-4 rounded-full blur-3xl" style={{ background: color }} />
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 rounded-full" style={{ border: `1.5px dashed ${color}44` }} />
      <motion.div animate={{ rotate: -360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} className="absolute inset-0">
        <span className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 rounded-full" style={{ background: color, boxShadow: `0 0 10px ${color}` }} />
      </motion.div>

      {/* Robot body */}
      <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        className="relative" style={{ width: size * 0.56 }}>
        {/* Antena */}
        <div className="mx-auto h-5 w-[2px]" style={{ background: `${color}88` }} />
        <motion.div animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }} transition={{ duration: 1.2, repeat: Infinity }}
          className="mx-auto -mt-6 mb-1 h-2.5 w-2.5 rounded-full" style={{ background: color, boxShadow: `0 0 14px ${color}` }} />

        {/* Kepala */}
        <div className="relative mx-auto rounded-2xl border"
          style={{ width: "100%", height: size * 0.34, background: "linear-gradient(160deg, #1A2B42 0%, #0F1B2D 100%)", borderColor: `${color}55`, boxShadow: `0 0 28px ${color}33` }}>
          {/* Mata */}
          <div className="flex h-full items-center justify-center gap-3">
            {[0, 1].map((i) => (
              <motion.span key={i}
                animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
                transition={{ duration: 4, repeat: Infinity, delay: i * 0.05, times: [0, 0.82, 0.87, 0.92, 1] }}
                className="h-3.5 w-3.5 rounded-full" style={{ background: color, boxShadow: `0 0 12px ${color}` }} />
            ))}
          </div>
          {/* Scan line */}
          <motion.div animate={{ y: [4, size * 0.3, 4], opacity: [0.15, 0.6, 0.15] }} transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-x-2 h-[2px] rounded-full" style={{ background: color }} />
          {/* Telinga */}
          <span className="absolute -left-1.5 top-1/2 h-5 w-1.5 -translate-y-1/2 rounded-full" style={{ background: `${color}77` }} />
          <span className="absolute -right-1.5 top-1/2 h-5 w-1.5 -translate-y-1/2 rounded-full" style={{ background: `${color}77` }} />
        </div>

        {/* Badan */}
        <div className="relative mx-auto mt-2 rounded-xl border"
          style={{ width: "84%", height: size * 0.2, background: "linear-gradient(160deg, #16273D 0%, #0F1B2D 100%)", borderColor: "rgba(255,255,255,0.1)" }}>
          <div className="flex h-full items-center justify-center gap-1.5">
            {[0, 1, 2].map((i) => (
              <motion.span key={i} animate={{ opacity: [0.25, 1, 0.25] }} transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.25 }}
                className="h-1.5 w-1.5 rounded-full" style={{ background: i === 1 ? "#F7C843" : color }} />
            ))}
          </div>
          {/* Tangan */}
          <motion.span animate={{ rotate: [0, -22, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -left-3 top-1 h-6 w-1.5 origin-top rounded-full" style={{ background: `${color}88` }} />
          <motion.span animate={{ rotate: [0, 22, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
            className="absolute -right-3 top-1 h-6 w-1.5 origin-top rounded-full" style={{ background: `${color}88` }} />
        </div>
      </motion.div>

      {/* Bayangan melayang */}
      <motion.div animate={{ scaleX: [1, 0.82, 1], opacity: [0.35, 0.18, 0.35] }} transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-1 h-2 rounded-full blur-md" style={{ width: size * 0.4, background: color }} />
    </div>
  );
}