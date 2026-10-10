import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";

const KEY = "mamutes-tempo-com-deus";

export type TimerState = {
  durationMs: number;
  status: "running" | "paused" | "done";
  endAt: number | null;
  remainingMs: number;
  pausedAt: number | null;
  startedAt: number;
};

export function remainingOf(s: TimerState, now: number) {
  if (s.status === "running" && s.endAt) return Math.max(0, s.endAt - now);
  if (s.status === "done") return 0;
  return s.remainingMs;
}

// --- Audio: one element, unlocked on the user's tap, kept playing in background ---
function wavUrl(seconds: number, sample: (t: number) => number) {
  const rate = 22050;
  const n = Math.floor(rate * seconds);
  const buf = new ArrayBuffer(44 + n * 2);
  const v = new DataView(buf);
  const w = (o: number, s: string) => [...s].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
  w(0, "RIFF"); v.setUint32(4, 36 + n * 2, true); w(8, "WAVE"); w(12, "fmt ");
  v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, rate, true); v.setUint32(28, rate * 2, true); v.setUint16(32, 2, true);
  v.setUint16(34, 16, true); w(36, "data"); v.setUint32(40, n * 2, true);
  for (let i = 0; i < n; i++) {
    const x = Math.max(-1, Math.min(1, sample(i / rate)));
    v.setInt16(44 + i * 2, x * 32767, true);
  }
  return URL.createObjectURL(new Blob([buf], { type: "audio/wav" }));
}

let keepAliveSrc: string | null = null;
let alarmSrc: string | null = null;
let audio: HTMLAudioElement | null = null;

function sources() {
  if (!keepAliveSrc) keepAliveSrc = wavUrl(2, (t) => Math.sin(2 * Math.PI * 200 * t) * 0.0015);
  if (!alarmSrc)
    alarmSrc = wavUrl(1.6, (t) => {
      const p = t % 0.4;
      return p < 0.25 ? Math.sign(Math.sin(2 * Math.PI * (t < 0.8 ? 880 : 988) * t)) * 0.9 : 0;
    });
}

function getAudio() {
  if (!audio) {
    audio = new Audio();
    audio.loop = true;
    audio.setAttribute("playsinline", "");
  }
  return audio;
}

function playKeepAlive() {
  sources();
  const a = getAudio();
  a.src = keepAliveSrc!;
  a.volume = 1;
  void a.play().catch(() => {});
}

function playAlarm() {
  sources();
  const a = getAudio();
  a.src = alarmSrc!;
  a.volume = 1;
  void a.play().catch(() => {});
  try {
    if ("mediaSession" in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({ title: "Tempo com Deus terminou", artist: "Os Mamutes" });
    }
  } catch { /* ignore */ }
}

function stopAudio() {
  if (audio) {
    audio.pause();
    audio.removeAttribute("src");
    audio.load();
  }
}

async function showEndNotification() {
  try {
    if (!("Notification" in window) || Notification.permission !== "granted") return;
    const reg = await navigator.serviceWorker?.getRegistration();
    const opts = {
      body: "Seu Tempo com Deus terminou. Toque para parar o alarme.",
      icon: "/icon-192-v2.png",
      tag: "tempo-com-deus",
      requireInteraction: true,
      vibrate: [500, 200, 500, 200, 500],
    } as NotificationOptions;
    if (reg) await reg.showNotification("Os Mamutes — Alarme", opts);
    else new Notification("Os Mamutes — Alarme", opts);
  } catch { /* ignore */ }
}

type Ctx = {
  state: TimerState | null;
  now: number;
  ringing: boolean;
  start: (min: number) => void;
  pause: () => void;
  resume: () => void;
  restart: () => void;
  end: () => void;
  stopAlarm: () => void;
};

const TimerCtx = createContext<Ctx | null>(null);

export function PrayerTimerProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<TimerState | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [ringing, setRinging] = useState(false);
  const vibTimer = useRef<number | null>(null);
  const wakeLock = useRef<{ release: () => Promise<void> } | null>(null);

  // Keep the screen on while the timer runs so the countdown and alarm never sleep.
  const acquireWakeLock = useCallback(async () => {
    try {
      const nav = navigator as Navigator & { wakeLock?: { request: (t: "screen") => Promise<{ release: () => Promise<void> }> } };
      if (nav.wakeLock && !wakeLock.current) {
        wakeLock.current = await nav.wakeLock.request("screen");
      }
    } catch { /* unsupported or denied */ }
  }, []);

  const releaseWakeLock = useCallback(() => {
    const wl = wakeLock.current;
    wakeLock.current = null;
    if (wl) void wl.release().catch(() => {});
  }, []);

  useEffect(() => {
    if (state?.status === "running") {
      void acquireWakeLock();
      const reacquire = () => {
        if (document.visibilityState === "visible") void acquireWakeLock();
      };
      document.addEventListener("visibilitychange", reacquire);
      return () => document.removeEventListener("visibilitychange", reacquire);
    }
    releaseWakeLock();
  }, [state?.status, acquireWakeLock, releaseWakeLock]);

  const save = (s: TimerState | null) => {
    if (s) localStorage.setItem(KEY, JSON.stringify(s));
    else localStorage.removeItem(KEY);
    setState(s);
  };

  const stopAlarm = useCallback(() => {
    setRinging(false);
    stopAudio();
    if (vibTimer.current) clearInterval(vibTimer.current);
    vibTimer.current = null;
    try { navigator.vibrate?.(0); } catch { /* ignore */ }
    void navigator.serviceWorker?.getRegistration().then((r) =>
      r?.getNotifications({ tag: "tempo-com-deus" }).then((ns) => ns.forEach((n) => n.close())),
    );
    setState((s) => {
      if (s?.status === "done") localStorage.removeItem(KEY);
      return s?.status === "done" ? null : s;
    });
  }, []);

  const ring = useCallback(() => {
    setRinging(true);
    playAlarm();
    void showEndNotification();
    try { navigator.vibrate?.([600, 300, 600, 300, 600]); } catch { /* ignore */ }
    if (vibTimer.current) clearInterval(vibTimer.current);
    vibTimer.current = window.setInterval(() => {
      try { navigator.vibrate?.([600, 300, 600]); } catch { /* ignore */ }
      if (audio && audio.paused) void audio.play().catch(() => {});
    }, 2000);
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      const s = raw ? (JSON.parse(raw) as TimerState) : null;
      if (s?.status === "running" && s.endAt && Date.now() >= s.endAt) {
        const d = { ...s, status: "done" as const, endAt: null, remainingMs: 0 };
        localStorage.setItem(KEY, JSON.stringify(d));
        setState(d);
        ring();
      } else if (s?.status === "done") {
        setState(s);
        ring();
      } else setState(s);
    } catch { /* ignore */ }
  }, [ring]);

  useEffect(() => {
    if (state?.status !== "running") return;
    const tick = () => {
      const n = Date.now();
      setNow(n);
      if (state.endAt && n >= state.endAt) {
        save({ ...state, status: "done", remainingMs: 0, endAt: null });
        ring();
      }
    };
    tick();
    const id = window.setInterval(tick, 250);
    document.addEventListener("visibilitychange", tick);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [state, ring]);

  const start = (min: number) => {
    stopAlarm();
    if ("Notification" in window && Notification.permission === "default") {
      void Notification.requestPermission().catch(() => {});
    }
    playKeepAlive(); // unlocks audio on this tap and keeps the timer alive in background
    const n = Date.now(), d = min * 60_000;
    save({ durationMs: d, status: "running", endAt: n + d, remainingMs: d, pausedAt: null, startedAt: n });
    setNow(n);
  };
  const pause = () => {
    if (!state || state.status !== "running") return;
    const n = Date.now();
    save({ ...state, status: "paused", remainingMs: remainingOf(state, n), endAt: null, pausedAt: n });
  };
  const resume = () => {
    if (!state || state.status !== "paused") return;
    playKeepAlive();
    const n = Date.now();
    save({ ...state, status: "running", endAt: n + state.remainingMs, pausedAt: null });
    setNow(n);
  };
  const restart = () => state && start(state.durationMs / 60_000);
  const end = () => {
    stopAlarm();
    stopAudio();
    save(null);
  };

  return (
    <TimerCtx.Provider value={{ state, now, ringing, start, pause, resume, restart, end, stopAlarm }}>
      {children}
      {ringing && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6 bg-background/95 p-6 text-center">
          <p className="animate-pulse font-display text-5xl uppercase text-gold">⏰ Alarme</p>
          <p className="max-w-sm font-serif-read text-foreground">
            Seu Tempo com Deus terminou. Que este momento tenha renovado sua fé.
          </p>
          <button
            onClick={stopAlarm}
            className="w-full max-w-sm rounded-2xl bg-primary px-6 py-5 font-display text-3xl uppercase text-primary-foreground"
          >
            🔕 Parar alarme
          </button>
        </div>
      )}
    </TimerCtx.Provider>
  );
}

export function usePrayerTimer() {
  const c = useContext(TimerCtx);
  if (!c) throw new Error("usePrayerTimer must be inside PrayerTimerProvider");
  return c;
}
