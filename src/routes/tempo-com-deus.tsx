import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Play, Pause, RotateCcw, X, Heart } from "lucide-react";
import { Page } from "@/components/Shell";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/tempo-com-deus")({
  head: () => ({
    meta: [
      { title: "Tempo com Deus — Os Mamutes" },
      { name: "description", content: "Separe alguns minutos para oração, reflexão e leitura da Bíblia com um temporizador simples." },
      { property: "og:title", content: "Tempo com Deus — Os Mamutes" },
      { property: "og:description", content: "Um temporizador para seu momento diário de oração e reflexão." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TempoComDeus,
});

const KEY = "mamutes-tempo-com-deus";
const OPTIONS = [
  { min: 5, label: "5 MIN" },
  { min: 10, label: "10 MIN" },
  { min: 15, label: "15 MIN" },
  { min: 30, label: "30 MIN" },
  { min: 60, label: "1 HORA" },
];
const VERSES = [
  "“Aquietai-vos e sabei que eu sou Deus.” — Salmos 46:10",
  "“Buscai ao Senhor enquanto se pode achar.” — Isaías 55:6",
  "“Chegai-vos a Deus, e ele se chegará a vós.” — Tiago 4:8",
  "“Orai sem cessar.” — 1 Tessalonicenses 5:17",
];

// Estrutura preparada para som ambiente futuro (adicione src de áudio aqui).
export type AmbientSound = { id: string; label: string; src?: string };
export const AMBIENT_SOUNDS: AmbientSound[] = [
  { id: "none", label: "Silêncio" },
];

type State = {
  durationMs: number;
  status: "running" | "paused" | "done";
  endAt: number | null; // timestamp absoluto quando running
  remainingMs: number; // usado quando paused
  pausedAt: number | null;
  startedAt: number;
};

function load(): State | null {
  try { const s = localStorage.getItem(KEY); return s ? (JSON.parse(s) as State) : null; } catch { return null; }
}
function save(s: State | null) {
  if (s) localStorage.setItem(KEY, JSON.stringify(s)); else localStorage.removeItem(KEY);
}
function remainingOf(s: State, now: number) {
  if (s.status === "running" && s.endAt) return Math.max(0, s.endAt - now);
  if (s.status === "done") return 0;
  return s.remainingMs;
}
function fmt(ms: number, long: boolean) {
  const t = Math.ceil(ms / 1000);
  const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), s = t % 60;
  const p = (n: number) => String(n).padStart(2, "0");
  return long ? `${p(h)}:${p(m)}:${p(s)}` : `${p(m)}:${p(s)}`;
}
let audioCtx: AudioContext | null = null;
let alarmTimer: number | null = null;
let alarmStop: number | null = null;

function unlockAudio() {
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!audioCtx) audioCtx = new AC();
    void audioCtx.resume();
  } catch { /* ignore */ }
}

function beep() {
  if (!audioCtx) return;
  const t = audioCtx.currentTime;
  [0, 0.25, 0.5].forEach((d) => {
    const o = audioCtx!.createOscillator();
    const g = audioCtx!.createGain();
    o.type = "sine";
    o.frequency.value = 880;
    g.gain.setValueAtTime(0.0001, t + d);
    g.gain.exponentialRampToValueAtTime(0.5, t + d + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + d + 0.2);
    o.connect(g).connect(audioCtx!.destination);
    o.start(t + d);
    o.stop(t + d + 0.22);
  });
}

function notifyEnd() {
  try {
    if ("vibrate" in navigator) navigator.vibrate?.([400, 200, 400, 200, 400]);
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Os Mamutes", { body: "Seu Tempo com Deus terminou.", icon: "/icon-192.png" });
    }
    unlockAudio();
    stopAlarm();
    beep();
    alarmTimer = window.setInterval(() => {
      beep();
      if ("vibrate" in navigator) navigator.vibrate?.([400, 200, 400]);
    }, 1500);
    alarmStop = window.setTimeout(stopAlarm, 60_000);
  } catch { /* ignore */ }
}

function stopAlarm() {
  if (alarmTimer) clearInterval(alarmTimer);
  if (alarmStop) clearTimeout(alarmStop);
  alarmTimer = alarmStop = null;
  try { navigator.vibrate?.(0); } catch { /* ignore */ }
}

function TempoComDeus() {
  const [state, setState] = useState<State | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [confirm, setConfirm] = useState(false);
  const [verse] = useState(() => VERSES[new Date().getDate() % VERSES.length]!);

  useEffect(() => { setState(load()); }, []);

  const update = (s: State | null) => {
  if (s?.status !== "done") {
    stopAlarm();
  }
  save(s);
  setState(s);
};

  useEffect(() => {
    if (state?.status !== "running") return;
    let raf = 0;
    const tick = () => {
      const n = Date.now();
      setNow(n);
      if (state.endAt && n >= state.endAt) {
        update({ ...state, status: "done", remainingMs: 0, endAt: null });
        notifyEnd();
      }
    };
    tick();
    const id = window.setInterval(tick, 250);
    const onVis = () => tick();
    document.addEventListener("visibilitychange", onVis);
    return () => { clearInterval(id); cancelAnimationFrame(raf); document.removeEventListener("visibilitychange", onVis); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const start = (min: number) => {
    const n = Date.now(), d = min * 60_000;
    if ("Notification" in window && Notification.permission === "default") {
      // pedido só após ação do usuário, uma única vez
      void Notification.requestPermission().catch(() => {});
    }
    update({ durationMs: d, status: "running", endAt: n + d, remainingMs: d, pausedAt: null, startedAt: n });
    setNow(n);
  };
  const pause = () => {
    if (!state || state.status !== "running") return;
    const n = Date.now();
    update({ ...state, status: "paused", remainingMs: remainingOf(state, n), endAt: null, pausedAt: n });
  };
  const resume = () => {
    if (!state || state.status !== "paused") return;
    const n = Date.now();
    update({ ...state, status: "running", endAt: n + state.remainingMs, pausedAt: null });
    setNow(n);
  };
  const restart = () => state && start(state.durationMs / 60_000);
  const end = () => { setConfirm(false); update(null); };

  if (!state) {
    return (
      <Page title="Tempo com Deus">
        <section className="py-4 text-center">
          <h1 className="font-display text-4xl uppercase tracking-wide text-foreground">Tempo com Deus</h1>
          <p className="mx-auto mt-3 max-w-md font-serif-read text-muted-foreground">“Separe alguns minutos do seu dia para estar na presença de Deus.”</p>
        </section>
        <p className="mb-3 mt-4 text-center text-xs font-semibold uppercase tracking-[0.2em] text-gold">Escolha o tempo</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {OPTIONS.map((o) => (
            <button key={o.min} onClick={() => start(o.min)} className={`rounded-2xl border border-border bg-card px-4 py-7 font-display text-3xl text-foreground shadow-elevated transition-colors hover:border-primary hover:text-primary ${o.min === 60 ? "col-span-2 sm:col-span-1" : ""}`}>
              {o.label}
            </button>
          ))}
        </div>
      </Page>
    );
  }

  if (state.status === "done") {
    return (
      <Page title="Tempo com Deus">
        <section className="flex min-h-[60vh] flex-col items-center justify-center text-center">
          <Heart className="h-12 w-12 text-gold" />
          <h1 className="mt-4 font-display text-3xl uppercase text-foreground">Tempo com Deus concluído ❤️</h1>
          <p className="mx-auto mt-3 max-w-md font-serif-read text-muted-foreground">“Que este momento tenha renovado sua fé, sua esperança e sua comunhão com Deus.”</p>
          <div className="mt-8 flex w-full max-w-sm flex-col gap-3">
            <button onClick={stopAlarm} className="rounded-xl bg-gold px-4 py-3 font-semibold uppercase text-background">🔕 Parar alarme</button>
            <button onClick={() => update(null)} className="rounded-xl bg-primary px-4 py-3 font-semibold uppercase text-primary-foreground">Fazer novamente</button>
            <Link to="/" onClick={() => { stopAlarm(); save(null); }} className="rounded-xl border border-border px-4 py-3 font-semibold uppercase text-foreground hover:bg-muted">Voltar</Link>
          </div>
        </section>
      </Page>
    );
  }

  const rem = remainingOf(state, now);
  const long = state.durationMs >= 3_600_000;
  const pct = 100 - (rem / state.durationMs) * 100;
  const btn = "flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl border border-border bg-card px-2 text-xs font-semibold uppercase text-foreground hover:bg-muted";

  return (
    <Page title="Tempo com Deus">
      <section className="flex min-h-[65vh] flex-col items-center justify-center text-center">
        <h1 className="font-display text-2xl uppercase tracking-wide text-gold">Tempo com Deus</h1>
        <p className="mt-6 font-display text-7xl tabular-nums text-foreground sm:text-8xl" aria-live="off">{fmt(rem, long)}</p>
        <div className="mt-4 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-secondary">
          <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
        </div>
        {state.status === "paused" && <p className="mt-3 text-xs uppercase tracking-widest text-muted-foreground">Pausado</p>}
        <div className="mt-8 grid w-full max-w-sm grid-cols-4 gap-2">
          <button onClick={resume} disabled={state.status === "running"} className={`${btn} disabled:opacity-40`}><Play className="h-5 w-5" />Iniciar</button>
          <button onClick={pause} disabled={state.status !== "running"} className={`${btn} disabled:opacity-40`}><Pause className="h-5 w-5" />Pausar</button>
          <button onClick={restart} className={btn}><RotateCcw className="h-5 w-5" />Reiniciar</button>
          <button onClick={() => setConfirm(true)} className={btn}><X className="h-5 w-5" />Encerrar</button>
        </div>
        <p className="mx-auto mt-10 max-w-md font-serif-read text-sm italic text-muted-foreground">{verse}</p>
      </section>
      <AlertDialog open={confirm} onOpenChange={setConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Encerrar</AlertDialogTitle>
            <AlertDialogDescription>Deseja realmente encerrar seu Tempo com Deus?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continuar</AlertDialogCancel>
            <AlertDialogAction onClick={end}>Encerrar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Page>
  );
}
