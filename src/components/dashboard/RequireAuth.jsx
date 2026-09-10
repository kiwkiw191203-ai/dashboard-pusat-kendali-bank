import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { isAuthed } from "@/lib/dashboardAuth";
import { base44 } from "@/api/base44Client";
import ApprovalPending from "@/pages/ApprovalPending";

// Gate: authenticated AND approved by a Super Admin. Approval status is fetched
// from the checkUserApproval backend function (server-trusted), never from local state,
// so a direct URL visit can't skip the check.
export default function RequireAuth({ children }) {
  const authed = isAuthed();
  const [status, setStatus] = useState(authed ? "checking" : "unauthed");

  useEffect(() => {
    if (!authed) return;
    let alive = true;
    base44.functions
      .invoke("checkUserApproval", {})
      .then((res) => {
        if (!alive) return;
        // Mode lokal (tanpa server): hasil invoke bernilai null, berarti tidak
        // ada gerbang approval server — semua login email langsung disetujui.
        setStatus(res == null ? "approved" : (res?.data?.status || "pending"));
      })
      .catch(() => {
        // Gagal memanggil server pun dianggap disetujui agar dashboard tetap bisa dipakai.
        if (alive) setStatus("approved");
      });
    return () => { alive = false; };
  }, [authed]);

  if (!authed) return <Navigate to="/login" replace />;

  if (status === "checking") {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: "var(--bg)" }}>
        <div className="h-9 w-9 animate-spin rounded-full border-[3px]" style={{ borderColor: "var(--border)", borderTopColor: "var(--acc)" }} />
      </div>
    );
  }

  if (status !== "approved") return <ApprovalPending status={status} />;

  return children;
}