import React from "react";
import { motion } from "framer-motion";

const LOGO = "https://i.ibb.co/2YsD3Vv5/image.png";

export default function BrandLogo({ size = 40, withRings = true, showStatus = true }) {
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      {withRings && (
        <>
          {/* Pulsing radial glow */}
          <motion.div
            animate={{ scale: [1, 1.7, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 rounded-xl"
            style={{ background: "var(--acc)", filter: "blur(10px)", zIndex: 0 }}
          />
          {/* Rotating conic ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            className="absolute -inset-1.5 rounded-xl"
            style={{
              zIndex: 0,
              background: "conic-gradient(from 0deg, transparent 0%, var(--acc) 20%, transparent 40%, var(--acc) 60%, transparent 80%, var(--acc) 100%)",
              opacity: 0.55,
              WebkitMaskImage: "radial-gradient(circle, transparent 58%, black 60%, black 100%)",
              maskImage: "radial-gradient(circle, transparent 58%, black 60%, black 100%)",
            }}
          />
          {/* Dashed orbit ring */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
            className="absolute -inset-2 rounded-full opacity-25"
            style={{ border: "1px dashed var(--acc)", zIndex: 0 }}
          />
        </>
      )}

      {/* Logo image with float + shine sweep */}
      <motion.div
        className="relative z-10"
        animate={{ y: [0, -1.5, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <img
          src={LOGO}
          alt="CS PRO"
          className="object-contain"
          style={{ width: size, height: size, filter: "drop-shadow(0 0 14px rgba(var(--acc-rgb),0.85))" }}
        />
        <div className="absolute inset-0 overflow-hidden rounded-xl">
          <motion.div
            animate={{ x: ["-130%", "130%"] }}
            transition={{ duration: 2.6, repeat: Infinity, repeatDelay: 1.6, ease: "easeInOut" }}
            className="absolute inset-0"
            style={{ background: "linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.5) 50%, transparent 65%)" }}
          />
        </div>
      </motion.div>

      {/* Online status dot */}
      {showStatus && (
        <motion.span
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-0.5 -right-0.5 z-20 h-2.5 w-2.5 rounded-full border-2"
          style={{ background: "var(--green)", borderColor: "var(--card-solid)", boxShadow: "0 0 6px var(--green)" }}
        />
      )}
    </div>
  );
}