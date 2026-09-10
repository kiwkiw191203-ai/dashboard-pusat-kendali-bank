import React, { useEffect, useRef, useState } from "react";
import { MonitorPlay, Camera, Upload, Square } from "lucide-react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import { getSession } from "@/lib/dashboardAuth";
import DriveConnectButton from "./DriveConnectButton";

const INTERVALS = [5, 10, 30, 60];

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export default function ScreenCapturePanel({ sharing, setSharing, autoMode, setAutoMode, liveMode, setLiveMode, interval, onIntervalChange, onSaved }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileRef = useRef(null);
  const liveSessionIdRef = useRef(null);
  const me = getSession();
  const [driveConnected, setDriveConnected] = useState(false);

  const setLiveOffline = async () => {
    if (!liveSessionIdRef.current) return;
    try { await base44.entities.LiveScreenSession.update(liveSessionIdRef.current, { is_live: false }); } catch { /* ignore */ }
  };

  const stopShare = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setSharing(false);
    setAutoMode(false);
    setLiveMode(false);
    setLiveOffline();
  };

  const pickScreen = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setSharing(true);
      stream.getVideoTracks()[0].addEventListener("ended", stopShare);
    } catch { toast.error("Gagal mengakses layar"); }
  };

  const saveBlob = async (blob) => {
    const filename = `screenshot-${Date.now()}.png`;
    const file = new File([blob], filename, { type: blob.type || "image/png" });
    const { file_url } = await base44.integrations.Core.UploadFile({ file });

    let driveLink = "";
    if (driveConnected) {
      try {
        const imageBase64 = await blobToBase64(blob);
        const res = await base44.functions.invoke("uploadScreenshotToDrive", { imageBase64, filename });
        driveLink = res.data?.webViewLink || "";
      } catch { /* Drive upload optional, ignore failure */ }
    }

    await base44.entities.AutoScreenshot.create({
      image_url: file_url, drive_link: driveLink, captured_at: new Date().toISOString(),
      creator_name: me?.name || "", creator_email: me?.email || "",
    });
    onSaved?.();
  };

  const captureFrame = async () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth; canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      try { await saveBlob(blob); } catch { toast.error("Gagal menyimpan screenshot"); }
    }, "image/png");
  };

  useEffect(() => {
    if (!autoMode || !sharing) return;
    const id = window.setInterval(captureFrame, interval * 1000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line
  }, [autoMode, sharing, interval]);

  const captureLiveFrame = async () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth; canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      try {
        const file = new File([blob], `live-${Date.now()}.jpg`, { type: "image/jpeg" });
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        if (!liveSessionIdRef.current) {
          const existing = await base44.entities.LiveScreenSession.filter({ creator_email: me?.email });
          if (existing[0]) liveSessionIdRef.current = existing[0].id;
          else {
            const rec = await base44.entities.LiveScreenSession.create({
              creator_email: me?.email || "", creator_name: me?.name || "", frame_url: file_url, is_live: true,
            });
            liveSessionIdRef.current = rec.id;
          }
        }
        await base44.entities.LiveScreenSession.update(liveSessionIdRef.current, {
          frame_url: file_url, is_live: true, creator_name: me?.name || "",
        });
      } catch { /* ignore live frame errors */ }
    }, "image/jpeg", 0.6);
  };

  useEffect(() => {
    if (!liveMode || !sharing) {
      if (!sharing) liveSessionIdRef.current = null;
      return;
    }
    captureLiveFrame();
    const id = window.setInterval(captureLiveFrame, 2000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line
  }, [liveMode, sharing]);

  useEffect(() => {
    if (!liveMode) setLiveOffline();
    // eslint-disable-next-line
  }, [liveMode]);

  const onFile = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    try { await saveBlob(f); toast.success("Screenshot ditambahkan"); } catch { toast.error("Gagal mengunggah"); }
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="ds-in flex flex-col gap-3 rounded-2xl border p-5" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
      <button onClick={sharing ? stopShare : pickScreen}
        className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-[0.82rem] font-bold text-white transition-transform hover:scale-[1.02]"
        style={{ background: sharing ? "var(--coral)" : "linear-gradient(135deg,#1e293b,#0f172a)" }}>
        {sharing ? <Square size={15} /> : <MonitorPlay size={15} />} {sharing ? "Hentikan Berbagi" : "Pilih Layar / Jendela"}
      </button>

      <DriveConnectButton onStatusChange={setDriveConnected} />

      <div className="flex aspect-video items-center justify-center overflow-hidden rounded-xl" style={{ background: "#000" }}>
        <video ref={videoRef} autoPlay muted className={`h-full w-full object-contain ${sharing ? "" : "hidden"}`} />
        {!sharing && <span className="px-4 text-center text-[0.76rem]" style={{ color: "var(--text-3)" }}>Pratinjau layar akan muncul di sini</span>}
      </div>

      <div className="flex items-center justify-between rounded-xl border p-3" style={{ borderColor: "var(--border)", background: "var(--glass)" }}>
        <span className="text-[0.76rem] font-semibold" style={{ color: "var(--text-2)" }}>Auto Mode</span>
        <button onClick={() => setAutoMode((v) => !v)} disabled={!sharing}
          className="rounded-lg px-3 py-1.5 text-[0.7rem] font-bold transition-colors disabled:opacity-40"
          style={{ background: autoMode ? "rgba(16,185,129,0.15)" : "var(--hover)", color: autoMode ? "var(--green)" : "var(--text-3)" }}>
          {autoMode ? "Hidup" : "Mati"}
        </button>
      </div>

      <div className="flex items-center justify-between rounded-xl border p-3" style={{ borderColor: "var(--border)", background: "var(--glass)" }}>
        <span className="text-[0.76rem] font-semibold" style={{ color: "var(--text-2)" }}>Live View (Super Master)</span>
        <button onClick={() => setLiveMode((v) => !v)} disabled={!sharing}
          className="rounded-lg px-3 py-1.5 text-[0.7rem] font-bold transition-colors disabled:opacity-40"
          style={{ background: liveMode ? "rgba(239,68,68,0.15)" : "var(--hover)", color: liveMode ? "var(--coral)" : "var(--text-3)" }}>
          {liveMode ? "Hidup" : "Mati"}
        </button>
      </div>

      <div className="rounded-xl border p-3" style={{ borderColor: "var(--border)", background: "var(--glass)" }}>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[0.76rem] font-semibold" style={{ color: "var(--text-2)" }}>Interval</span>
          <div className="flex items-center gap-1.5">
            <input type="number" min={1} value={interval}
              onChange={(e) => onIntervalChange(Math.max(1, Number(e.target.value) || 1))}
              className="w-14 rounded-lg border bg-transparent px-2 py-1 text-center text-[0.72rem] outline-none focus:border-[var(--acc)]"
              style={{ borderColor: "var(--border)", color: "var(--text)" }} />
            <span className="text-[0.68rem]" style={{ color: "var(--text-3)" }}>detik</span>
          </div>
        </div>
        <div className="flex gap-1.5">
          {INTERVALS.map((s) => (
            <button key={s} onClick={() => onIntervalChange(s)}
              className="rounded-lg px-2.5 py-1.5 text-[0.68rem] font-bold transition-colors"
              style={{ background: interval === s ? "rgba(var(--acc-rgb),0.16)" : "var(--hover)", color: interval === s ? "var(--acc)" : "var(--text-3)" }}>
              {s}s
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={captureFrame} disabled={!sharing}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border py-2.5 text-[0.76rem] font-bold transition-colors hover:bg-[var(--hover)] disabled:opacity-40"
          style={{ borderColor: "var(--border)", color: "var(--text-2)" }}>
          <Camera size={14} /> Tangkap Sekarang
        </button>
        <button onClick={() => fileRef.current?.click()}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border py-2.5 text-[0.76rem] font-bold transition-colors hover:bg-[var(--hover)]"
          style={{ borderColor: "var(--border)", color: "var(--text-2)" }}>
          <Upload size={14} /> Pilih File
        </button>
        <input ref={fileRef} type="file" accept="image/*" onChange={onFile} className="hidden" />
      </div>
    </div>
  );
}