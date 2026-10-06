import { useEffect, useState } from "react";
import { Pause, Play, Square } from "lucide-react";

function useVoices() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const load = () => {
      const all = window.speechSynthesis.getVoices();
      const norm = (l: string) => l.replace("_", "-").toLowerCase();
      all.sort((a, b) => {
        const ap = norm(a.lang).startsWith("pt") ? 0 : 1;
        const bp = norm(b.lang).startsWith("pt") ? 0 : 1;
        return ap - bp || a.name.localeCompare(b.name);
      });
      setVoices(all);
    };
    load();
    window.speechSynthesis.onvoiceschanged = load;
    return () => { window.speechSynthesis.cancel(); };
  }, []);
  return voices;
}

export function Speaker({ text }: { text: string }) {
  const voices = useVoices();
  const [deviceVoice, setDeviceVoice] = useState("");
  const [rate, setRate] = useState(1);
  const [state, setState] = useState<"idle" | "playing" | "paused">("idle");

  useEffect(() => { if (!deviceVoice && voices.length) setDeviceVoice(voices[0]!.name); }, [voices, deviceVoice]);

  const stop = () => {
    window.speechSynthesis?.cancel();
    setState("idle");
  };
  useEffect(() => stop, [text]); // eslint-disable-line react-hooks/exhaustive-deps

  const play = () => {
    const s = window.speechSynthesis;
    if (state === "paused") { s.resume(); setState("playing"); return; }
    s.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const v = voices.find((x) => x.name === deviceVoice);
    if (v) u.voice = v;
    u.lang = "pt-BR";
    u.rate = rate;
    u.onend = () => setState("idle");
    s.speak(u);
    setState("playing");
  };
  const pause = () => { window.speechSynthesis.pause(); setState("paused"); };

  return (
    <div className="space-y-3 rounded-xl border border-border bg-secondary p-3">
      <div className="flex items-center gap-2">
        {state === "playing" ? (
          <button onClick={pause} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground" aria-label="Pausar"><Pause className="h-4 w-4" /></button>
        ) : (
          <button onClick={play} disabled={!text} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground disabled:opacity-50" aria-label="Ouvir"><Play className="h-4 w-4" /></button>
        )}
        <button onClick={stop} className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border text-muted-foreground" aria-label="Parar"><Square className="h-4 w-4" /></button>
        <select value={deviceVoice} onChange={(e) => setDeviceVoice(e.target.value)} className="min-w-0 flex-1 rounded-lg border border-input bg-background px-2 py-2 text-sm text-foreground" aria-label="Voz">
          {voices.length === 0 && <option>Nenhuma voz encontrada no aparelho</option>}
          {voices.map((v) => <option key={v.name} value={v.name}>{v.name.replace(/\s*\(.*\)/, "").replace(/ - Portuguese.*$/, "")}</option>)}
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
