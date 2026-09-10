import React from "react";
import PageHead from "@/components/dashboard/PageHead";
import ImageGallery from "@/components/dashboard/ImageGallery";
import { TICKETS } from "@/lib/dashboardData";

export default function Ticket() {
  return (
    <div className="w-full p-4 md:p-7">
      <PageHead
        icon="fa-ticket" color="var(--cyan)"
        title="KODE TIKET PREMIUM" subtitle="Klik kartu untuk preview & salin gambar"
        badges={[
          { icon: "fa-layer-group", text: `${TICKETS.length} Kode`, color: "var(--cyan)" },
          { icon: "fa-fire", text: "Premium", color: "var(--coral)" },
        ]}
      />
      <ImageGallery
        data={TICKETS} accent="var(--cyan)"
        cats={[{ f: "pg", label: "PG Soft" }, { f: "pp", label: "Pragmatic" }]}
        tagMap={{ pg: { label: "PG", color: "var(--cyan)" }, pp: { label: "PP", color: "var(--gold)" } }}
      />
    </div>
  );
}