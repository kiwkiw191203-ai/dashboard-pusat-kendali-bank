import React, { useEffect, useState } from "react";
import { HardDrive, Link2, Unlink } from "lucide-react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";

const CONNECTOR_ID = "6a462db7a907dc72c65763f0";

export default function DriveConnectButton({ onStatusChange }) {
  const [connected, setConnected] = useState(false);
  const [email, setEmail] = useState("");
  const [checking, setChecking] = useState(true);

  const check = async () => {
    try {
      const res = await base44.functions.invoke("checkDriveConnection", {});
      setConnected(true);
      setEmail(res.data?.email || "");
      onStatusChange?.(true);
    } catch {
      setConnected(false);
      onStatusChange?.(false);
    }
  };

  useEffect(() => {
    base44.auth.isAuthenticated().then(async (authed) => {
      if (authed) await check();
      setChecking(false);
    });
    // eslint-disable-next-line
  }, []);

  const handleConnect = async () => {
    const url = await base44.connectors.connectAppUser(CONNECTOR_ID);
    const popup = window.open(url, "_blank");
    const timer = setInterval(() => {
      if (!popup || popup.closed) {
        clearInterval(timer);
        check();
      }
    }, 500);
  };

  const handleDisconnect = async () => {
    try {
      await base44.connectors.disconnectAppUser(CONNECTOR_ID);
      setConnected(false);
      setEmail("");
      onStatusChange?.(false);
      toast.success("Google Drive diputus");
    } catch {
      toast.error("Gagal memutus koneksi");
    }
  };

  if (checking) return null;

  return (
    <div className="flex items-center justify-between rounded-xl border p-3" style={{ borderColor: "var(--border)", background: "var(--glass)" }}>
      <div className="flex items-center gap-2">
        <HardDrive size={15} style={{ color: connected ? "var(--green)" : "var(--text-3)" }} />
        <div>
          <div className="text-[0.76rem] font-semibold" style={{ color: "var(--text-2)" }}>Google Drive Pribadi</div>
          {connected && email && <div className="text-[0.62rem]" style={{ color: "var(--text-3)" }}>{email}</div>}
        </div>
      </div>
      {connected ? (
        <button onClick={handleDisconnect} className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[0.68rem] font-bold transition-colors hover:bg-[var(--hover)]" style={{ background: "rgba(16,185,129,0.15)", color: "var(--green)" }}>
          <Unlink size={12} /> Terhubung
        </button>
      ) : (
        <button onClick={handleConnect} className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[0.68rem] font-bold transition-colors hover:bg-[var(--hover)]" style={{ background: "rgba(var(--acc-rgb),0.16)", color: "var(--acc)" }}>
          <Link2 size={12} /> Hubungkan
        </button>
      )}
    </div>
  );
}