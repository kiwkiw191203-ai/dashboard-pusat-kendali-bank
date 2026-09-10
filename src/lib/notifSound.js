let audioCtx = null;

function getCtx() {
  if (!audioCtx) {
    try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch { return null; }
  }
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}

function tone(ctx, freq, start, dur, type = "sine", vol = 0.12) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.frequency.value = freq;
  osc.type = type;
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(vol, start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, start + dur);
  osc.start(start);
  osc.stop(start + dur);
}

export function playNotifSound(type) {
  const ctx = getCtx();
  if (!ctx) return;
  const now = ctx.currentTime;

  switch (type) {
    case "error":
    case "broadcast": {
      // Dramatic alarm — descending sawtooth + low rumble
      [880, 700, 520, 380].forEach((f, i) => tone(ctx, f, now + i * 0.12, 0.3, "sawtooth", 0.14));
      tone(ctx, 80, now, 0.6, "sine", 0.2);
      break;
    }
    case "warning": {
      // Urgent triple-beep
      [0, 0.18, 0.36].forEach((t) => { tone(ctx, 580, now + t, 0.13, "square", 0.1); tone(ctx, 880, now + t, 0.13, "sine", 0.06); });
      break;
    }
    case "success": {
      // Pleasant ascending chime
      [523, 659, 784, 1047].forEach((f, i) => tone(ctx, f, now + i * 0.07, 0.4, "sine", 0.12));
      break;
    }
    default: {
      // Info — gentle two-tone bell
      tone(ctx, 659, now, 0.5, "sine", 0.1);
      tone(ctx, 988, now + 0.1, 0.5, "sine", 0.08);
    }
  }

  // Vibrate on mobile
  try {
    if (navigator.vibrate) {
      if (type === "error" || type === "broadcast") navigator.vibrate([100, 50, 100, 50, 200]);
      else if (type === "warning") navigator.vibrate([80, 40, 80]);
      else navigator.vibrate(60);
    }
  } catch {}
}