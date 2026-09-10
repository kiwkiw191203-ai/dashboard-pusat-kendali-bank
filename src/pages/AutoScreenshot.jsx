import React, { useEffect, useState } from "react";
import PageHead from "@/components/dashboard/PageHead";
import { base44 } from "@/api/base44Client";
import { getSession } from "@/lib/dashboardAuth";
import { useRole } from "@/lib/permissions";
import ScreenshotStats from "@/components/autoScreenshot/ScreenshotStats";
import ScreenCapturePanel from "@/components/autoScreenshot/ScreenCapturePanel";
import ScreenshotGallery from "@/components/autoScreenshot/ScreenshotGallery";
import LiveScreenGallery from "@/components/autoScreenshot/LiveScreenGallery";

export default function AutoScreenshot() {
  const [shots, setShots] = useState([]);
  const [sharing, setSharing] = useState(false);
  const [autoMode, setAutoMode] = useState(false);
  const [liveMode, setLiveMode] = useState(false);
  const [intervalSec, setIntervalSec] = useState(5);
  const me = getSession();
  const role = useRole();
  const isSuperMaster = role.key === "super_master";

  const load = async () => {
    try {
      const data = isSuperMaster
        ? await base44.entities.AutoScreenshot.list("-captured_at", 300)
        : await base44.entities.AutoScreenshot.filter({ creator_email: me?.email }, "-captured_at", 300);
      setShots(data);
    } catch { setShots([]); }
  };

  useEffect(() => {
    load();
    let u;
    try { u = base44.entities.AutoScreenshot.subscribe(load); } catch { u = () => {}; }
    return () => u();
  }, []);

  return (
    <div className="w-full p-4 md:p-7">
      <PageHead
        icon="fa-camera-retro" color="var(--blue)"
        title="DASHBOARD AUTO SCREENSHOT" subtitle="Pantau, kelola, dan tangkap layar dari satu tempat"
        badges={[{ icon: "fa-images", text: `${shots.length} Screenshot`, color: "var(--blue)" }]}
      />
      <ScreenshotStats total={shots.length} sharing={sharing} autoMode={autoMode} interval={intervalSec} />
      {isSuperMaster && <LiveScreenGallery />}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[380px_1fr]">
        <ScreenCapturePanel
          sharing={sharing} setSharing={setSharing}
          autoMode={autoMode} setAutoMode={setAutoMode}
          liveMode={liveMode} setLiveMode={setLiveMode}
          interval={intervalSec} onIntervalChange={setIntervalSec}
          onSaved={load}
        />
        <ScreenshotGallery
          shots={shots} onChange={load} showOwner={isSuperMaster} canDelete={isSuperMaster}
          onDelete={(id) => base44.entities.AutoScreenshot.delete(id)}
          onDeleteMany={(ids) => base44.entities.AutoScreenshot.deleteMany({ id: { "$in": ids } })}
        />
      </div>
    </div>
  );
}