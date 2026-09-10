import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { getSiteLogo } from "@/lib/pkpbi/siteLogos";

// Each animation is visually distinct — pick deterministically per site name
const ANIMATIONS = [
  { initial: { rotate: -12, scale: 0.85 }, animate: { rotate: 0, scale: 1 }, whileHover: { rotate: [0, -8, 8, -4, 0], scale: 1.12 }, transition: { type: "spring", stiffness: 300, damping: 12 }, hoverTransition: { duration: 0.5 } },
  { initial: { scale: 0.4, opacity: 0 }, animate: { scale: 1, opacity: 1 }, whileHover: { scale: 1.18 }, transition: { type: "spring", stiffness: 220, damping: 10 }, hoverTransition: { type: "spring", stiffness: 400, damping: 8 } },
  { initial: { y: -14, opacity: 0 }, animate: { y: 0, opacity: 1 }, whileHover: { y: -5 }, transition: { type: "spring", stiffness: 200, damping: 14 }, hoverTransition: { type: "spring", stiffness: 400, damping: 10 } },
  { initial: { x: -18, opacity: 0 }, animate: { x: 0, opacity: 1 }, whileHover: { x: 4 }, transition: { type: "spring", stiffness: 200, damping: 16 }, hoverTransition: { type: "spring", stiffness: 400, damping: 10 } },
  { initial: { x: 18, opacity: 0 }, animate: { x: 0, opacity: 1 }, whileHover: { x: -4 }, transition: { type: "spring", stiffness: 200, damping: 16 }, hoverTransition: { type: "spring", stiffness: 400, damping: 10 } },
  { initial: { scale: 0, rotate: -180 }, animate: { scale: 1, rotate: 0 }, whileHover: { rotate: 360, scale: 1.1 }, transition: { type: "spring", stiffness: 200, damping: 15 }, hoverTransition: { duration: 0.6, ease: "easeInOut" } },
  { initial: { y: 12, opacity: 0, scale: 0.8 }, animate: { y: 0, opacity: 1, scale: 1 }, whileHover: { y: -4, scale: 1.1 }, transition: { type: "spring", stiffness: 250, damping: 12 }, hoverTransition: { type: "spring", stiffness: 400, damping: 10 } },
  { initial: { opacity: 0, scale: 1.6 }, animate: { opacity: 1, scale: 1 }, whileHover: { scale: 1.15 }, transition: { duration: 0.4, ease: "easeOut" }, hoverTransition: { duration: 0.2, ease: "easeOut" } },
  { initial: { rotateX: 90, opacity: 0 }, animate: { rotateX: 0, opacity: 1 }, whileHover: { rotateX: 25 }, transition: { type: "spring", stiffness: 200, damping: 16 }, hoverTransition: { type: "spring", stiffness: 300, damping: 12 } },
  { initial: { y: 0, scale: 0.9 }, animate: { y: [0, -6, 0], scale: 1 }, whileHover: { y: [0, -8, 0] }, transition: { duration: 0.6, ease: "easeInOut" }, hoverTransition: { duration: 0.5, ease: "easeInOut", repeat: Infinity } },
];

function pickAnimation(situs) {
  if (!situs) return ANIMATIONS[0];
  let hash = 0;
  for (let i = 0; i < situs.length; i++) {
    hash = (hash << 5) - hash + situs.charCodeAt(i);
    hash |= 0;
  }
  return ANIMATIONS[Math.abs(hash) % ANIMATIONS.length];
}

export default function SiteLogo({ situs, size = "md", wide = false, className = "" }) {
  const [imgError, setImgError] = useState(false);
  const animation = useMemo(() => pickAnimation(situs), [situs]);
  const sizeClasses = { sm: "h-6 w-6", md: "h-8 w-8", lg: "h-10 w-10", xl: "h-12 w-12" };
  const cls = wide ? "h-9 w-28" : (sizeClasses[size] || sizeClasses.md);
  const logoUrl = getSiteLogo(situs);

  if (imgError) {
    if (wide) {
      return <span className="font-semibold text-sm" style={{ color: "var(--text)" }}>{situs || "—"}</span>;
    }
    return (
      <div className={`${cls} rounded-lg flex items-center justify-center font-bold text-sm shrink-0 ${className}`}
        style={{ background: "var(--bg-2)", color: "var(--text-3)" }}>
        {situs?.charAt(0)?.toUpperCase() || "?"}
      </div>
    );
  }

  return (
    <motion.img
      src={logoUrl}
      alt={situs || "Site"}
      onError={() => setImgError(true)}
      initial={animation.initial}
      animate={animation.animate}
      whileHover={animation.whileHover}
      transition={animation.transition}
      className={`${cls} rounded-lg object-contain shrink-0 cursor-pointer ${className}`}
      style={{ background: "var(--glass)", padding: "0.125rem" }}
    />
  );
}