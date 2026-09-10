import React from "react";
import { Landmark, Hash, User, Calendar } from "lucide-react";
import moment from "moment";

const STATUS_STYLE = {
  valid: { label: "Valid", color: "var(--green)" },
  invalid: { label: "Tidak Valid", color: "var(--coral)" },
  pending: { label: "Pending", color: "var(--acc)" },
};

export default function ValidationCard({ item }) {
  const st = STATUS_STYLE[item.status] || STATUS_STYLE.pending;
  return (
    <div className="rounded-2xl border p-4" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Landmark size={14} style={{ color: "var(--acc)" }} />
          <span className="text-[0.82rem] font-bold" style={{ color: "var(--text)" }}>{item.bank_name}</span>
        </div>
        <span className="rounded-full px-2 py-0.5 text-[0.6rem] font-bold uppercase" style={{ background: `${st.color}1f`, color: st.color }}>
          {st.label}
        </span>
      </div>

      <div className="space-y-1.5 text-[0.74rem]" style={{ color: "var(--text-2)" }}>
        <div className="flex items-center gap-2"><Hash size={12} style={{ color: "var(--text-3)" }} /> {item.account_number}</div>
        {item.account_holder && <div className="flex items-center gap-2"><User size={12} style={{ color: "var(--text-3)" }} /> {item.account_holder}</div>}
        {item.notes && <p className="mt-1 text-[0.7rem]" style={{ color: "var(--text-3)" }}>{item.notes}</p>}
      </div>

      <div className="mt-3 flex items-center gap-1.5 border-t pt-2.5 text-[0.62rem]" style={{ borderColor: "var(--border)", color: "var(--text-3)" }}>
        <Calendar size={11} /> {moment(item.created_date).format("DD MMM YYYY, HH:mm")}
      </div>
    </div>
  );
}