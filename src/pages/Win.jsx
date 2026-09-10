import React from "react";
import PageHead from "@/components/dashboard/PageHead";
import ImageGallery from "@/components/dashboard/ImageGallery";
import { WINNINGS } from "@/lib/dashboardData";

export default function Win() {
  const pg = WINNINGS.filter((d) => d.b === "pg").length;
  const pp = WINNINGS.filter((d) => d.b === "pp").length;
  return (
    <div className="w-full p-4 md:p-7">
      <PageHead
        icon="fa-trophy" color="var(--gold)"
        title="SCREENSHOT KEMENANGAN" subtitle="Total kemenangan akhir per game"
        badges={[
          { icon: "fa-trophy", text: `${WINNINGS.length} Bukti`, color: "var(--gold)" },
          { icon: "fa-gamepad", text: `${pg} PG`, color: "var(--cyan)" },
          { icon: "fa-bolt", text: `${pp} PP`, color: "var(--coral)" },
        ]}
      />
      <ImageGallery
        data={WINNINGS} accent="var(--gold)"
        cats={[{ f: "pg", label: "PG Soft", icon: "fa-gamepad" }, { f: "pp", label: "Pragmatic", icon: "fa-bolt" }]}
        tagMap={{ pg: { label: "PG", color: "var(--cyan)" }, pp: { label: "PP", color: "var(--coral)" } }}
      />
    </div>
  );
}