import React from "react";
import PageHead from "@/components/dashboard/PageHead";
import ImageGallery from "@/components/dashboard/ImageGallery";
import { RRNS } from "@/lib/dashboardData";

export default function Rrn() {
  const bank = RRNS.filter((d) => d.b === "bank").length;
  const ew = RRNS.filter((d) => d.b === "ewallet").length;
  const ot = RRNS.filter((d) => d.b === "other").length;
  return (
    <div className="w-full p-4 md:p-7">
      <PageHead
        icon="fa-receipt" color="var(--teal)"
        title="BUKTI TRANSFER RRN" subtitle="Klik kartu untuk preview & salin gambar"
        badges={[
          { icon: "fa-building-columns", text: `${bank} Bank`, color: "var(--cyan)" },
          { icon: "fa-wallet", text: `${ew} E-Wallet`, color: "var(--gold)" },
          { icon: "fa-ellipsis", text: `${ot} Lainnya`, color: "var(--purple)" },
        ]}
      />
      <ImageGallery
        data={RRNS} accent="var(--teal)"
        cats={[
          { f: "bank", label: "Bank", icon: "fa-building-columns" },
          { f: "ewallet", label: "E-Wallet", icon: "fa-wallet" },
          { f: "other", label: "Lainnya", icon: "fa-ellipsis" },
        ]}
        tagMap={{
          bank: { label: "BANK", color: "var(--cyan)" },
          ewallet: { label: "E-WALLET", color: "var(--gold)" },
          other: { label: "LAINNYA", color: "var(--purple)" },
        }}
      />
    </div>
  );
}