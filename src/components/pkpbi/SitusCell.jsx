import React from "react";
import SiteLogo from "@/components/pkpbi/SiteLogo";
import { hasSiteLogo } from "@/lib/pkpbi/siteLogos";

export default function SitusCell({ situs }) {
  if (hasSiteLogo(situs)) {
    return <SiteLogo situs={situs} wide />;
  }
  return <span className="font-semibold text-sm" style={{ color: "var(--text)" }}>{situs || "—"}</span>;
}