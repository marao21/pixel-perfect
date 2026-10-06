import { useEffect, useState } from "react";
import { Pause, Play, Square } from "lucide-react";

export function useVoices() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const load = () => setVoices(window.speechSynthesis.getVoices());
    load();
    window.speechSynthesis.onvoiceschanged = load;
    return () => { window.speechSynthesis.cancel(); };
  }, []);
  return voices;
}

export function Speaker({ text, lang }: { text: string; lang: string }) {
  const voices = useVoices();
  const [voiceName, setVoiceName] = useState("");
  const [rate, setRate] = useState(1);
  const [state, setState] = useState<"idle" | "playing" | "paused">("idle");

  const sorted = [...voices].sort((a, b) => Number(b.lang.startsWith(lang)) - Number(a.lang.startsWith(lang)));
  useEffect(() => {
    if (!voiceName && sorted.length) setVoiceName(sorted[0]!.name);
  }, [sorted.length]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { window.speechSynthesis?.cancel(); setState("idle"); }, [text]);

  const play = () => {
    const s = window.speechSynthesis;
    if (state === "paused") { s.resume(); setState("playing"); return; }
    s.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const v = voices.find((x) => x.name === voiceName);
    if (v) { u.voice = v; u.lang = v.lang; } else u.lang = lang === "pt" ? "pt-BR" : "en-US";
    u.rate = rate;
    u.onend = () => setState("idle");
    s.speak(u);
    setState("playing");
  };

  if (typeof window !== "undefined" && !window.speechSynthesis) return null;

  return (
    <div className="space-y-3 rounded-xl border border-border bg-secondary p-3">
      <div className="flex items-center gap-2">
        {state === "playing" ? (
          <button onClick={() => { window.speechSynthesis.pause(); setState("paused"); }} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground" aria-label="Pausar"><Pause className="h-4 w-4" /></button>
        ) : (
          <button onClick={play} disabled={!text} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground disabled:opacity-50" aria-label="Ouvir"><Play className="h-4 w-4" /></button>
        )}
        <button onClick={() => { window.speechSynthesis.cancel(); setState("idle"); }} className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border text-muted-foreground" aria-label="Parar"><Square className="h-4 w-4" /></button>
        <select value={voiceName} onChange={(e) => setVoiceName(e.target.value)} className="min-w-0 flex-1 rounded-lg border border-input bg-background px-2 py-2 text-sm text-foreground" aria-label="Voz">
          {sorted.length === 0 && <option>Carregando vozes…</option>}
          {sorted.map((v) => <option key={v.name} value={v.name}>{v.name} ({v.lang})</option>)}
        </select>
      </div>
      <label className="flex items-center gap-3 text-xs text-muted-foreground">
        Velocidade
        <input type="range" min={0.6} max={1.6} step={0.1} value={rate} onChange={(e) => setRate(Number(e.target.value))} className="flex-1 accent-[var(--primary)]" />
        <span className="w-8 text-foreground">{rate.toFixed(1)}x</span>
      </label>
    </div>
  );
}
