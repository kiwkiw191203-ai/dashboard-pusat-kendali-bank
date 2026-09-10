import React from "react";
import PageHead from "@/components/dashboard/PageHead";
import ImageGallery from "@/components/dashboard/ImageGallery";
import { BANKS } from "@/lib/dashboardData";

export default function Bank() {
  const bank = BANKS.filter((d) => d.b === "bank").length;
  const ew = BANKS.filter((d) => d.b === "ewallet").length;
  return (
    <div className="w-full p-4 md:p-7">
      <PageHead
        icon="fa-building-columns" color="var(--blue)"
        title="PROFIL BANK & EWALLET" subtitle="Koleksi profil pembayaran tersimpan"
        badges={[
          { icon: "fa-building-columns", text: `${bank} Bank`, color: "var(--blue)" },
          { icon: "fa-wallet", text: `${ew} Ewallet`, color: "var(--green)" },
        ]}
      />
      <ImageGallery
        data={BANKS} accent="var(--blue)"
        cats={[{ f: "bank", label: "Bank", icon: "fa-building-columns" }, { f: "ewallet", label: "Ewallet", icon: "fa-wallet" }]}
        tagMap={{ bank: { label: "BANK", color: "var(--blue)" }, ewallet: { label: "EWALLET", color: "var(--green)" } }}
      />
    </div>
  );
}