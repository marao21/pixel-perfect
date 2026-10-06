import { useEffect, useRef, useState } from "react";
import { Loader2, Pause, Play, Sparkles, Square } from "lucide-react";

const AI_VOICES = [
  { id: "onyx", label: "Onyx — masculina grave" },
  { id: "echo", label: "Echo — masculina suave" },
  { id: "ash", label: "Ash — masculina clara" },
  { id: "ballad", label: "Ballad — masculina expressiva" },
  { id: "nova", label: "Nova — feminina jovem" },
  { id: "shimmer", label: "Shimmer — feminina suave" },
  { id: "coral", label: "Coral — feminina calorosa" },
  { id: "sage", label: "Sage — feminina serena" },
];

function useVoices() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const load = () =>
      setVoices(window.speechSynthesis.getVoices().filter((v) => v.lang.replace("_", "-").toLowerCase() === "pt-br"));
    load();
    window.speechSynthesis.onvoiceschanged = load;
    return () => { window.speechSynthesis.cancel(); };
  }, []);
  return voices;
}

function chunk(text: string, max = 3500) {
  const parts: string[] = [];
  let cur = "";
  for (const s of text.split(/(?<=[.!?;])\s+/)) {
    if ((cur + " " + s).length > max && cur) { parts.push(cur); cur = s; } else cur = cur ? cur + " " + s : s;
  }
  if (cur) parts.push(cur);
  return parts;
}

export function Speaker({ text }: { text: string; lang?: string }) {
  const voices = useVoices();
  const [mode, setMode] = useState<"ia" | "aparelho">("ia");
  const [aiVoice, setAiVoice] = useState("onyx");
  const [deviceVoice, setDeviceVoice] = useState("");
  const [rate, setRate] = useState(1);
  const [state, setState] = useState<"idle" | "loading" | "playing" | "paused">("idle");
  const [error, setError] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const runId = useRef(0);

  useEffect(() => { if (!deviceVoice && voices.length) setDeviceVoice(voices[0]!.name); }, [voices, deviceVoice]);

  const stop = () => {
    runId.current++;
    window.speechSynthesis?.cancel();
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ""; }
    setState("idle");
  };
  useEffect(() => stop, [text, mode]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchPart = async (part: string) => {
    const r = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: part, voice: aiVoice, speed: rate }),
    });
    if (!r.ok) throw new Error(r.status === 402 ? "Créditos de IA esgotados." : r.status === 429 ? "Muitas requisições, tente já já." : "Falha ao gerar o áudio.");
    return URL.createObjectURL(await r.blob());
  };

  const playAI = async () => {
    const id = ++runId.current;
    const parts = chunk(text);
    setState("loading"); setError("");
    try {
      let next: Promise<string> | null = fetchPart(parts[0]!);
      for (let i = 0; i < parts.length; i++) {
        const url: string = await next!;
        next = i + 1 < parts.length ? fetchPart(parts[i + 1]!) : null;
        if (id !== runId.current) return;
        const a = audioRef.current!;
        a.src = url;
        setState("playing");
        await a.play();
        await new Promise<void>((res) => { a.onended = () => res(); });
        URL.revokeObjectURL(url);
        if (id !== runId.current) return;
      }
      setState("idle");
    } catch (e) {
      if (id === runId.current) { setError(e instanceof Error ? e.message : "Erro"); setState("idle"); }
    }
  };

  const playDevice = () => {
    const s = window.speechSynthesis;
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

  const play = () => {
    if (state === "paused") {
      if (mode === "ia") audioRef.current?.play(); else window.speechSynthesis.resume();
      setState("playing"); return;
    }
    if (mode === "ia") playAI(); else playDevice();
  };
  const pause = () => {
    if (mode === "ia") audioRef.current?.pause(); else window.speechSynthesis.pause();
    setState("paused");
  };

  const tab = (m: typeof mode, label: React.ReactNode) => (
    <button onClick={() => setMode(m)} className={`flex flex-1 items-center justify-center gap-1 rounded-lg py-1.5 text-xs font-semibold ${mode === m ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>{label}</button>
  );

  return (
    <div className="space-y-3 rounded-xl border border-border bg-secondary p-3">
      <audio ref={audioRef} hidden />
      <div className="flex gap-1 rounded-lg bg-background p-1">
        {tab("ia", <><Sparkles className="h-3.5 w-3.5" /> Vozes IA (melhores)</>)}
        {tab("aparelho", "Voz do aparelho")}
      </div>
      <div className="flex items-center gap-2">
        {state === "playing" ? (
          <button onClick={pause} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground" aria-label="Pausar"><Pause className="h-4 w-4" /></button>
        ) : (
          <button onClick={play} disabled={!text || state === "loading"} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground disabled:opacity-50" aria-label="Ouvir">
            {state === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
          </button>
        )}
        <button onClick={stop} className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border text-muted-foreground" aria-label="Parar"><Square className="h-4 w-4" /></button>
        {mode === "ia" ? (
          <select value={aiVoice} onChange={(e) => { stop(); setAiVoice(e.target.value); }} className="min-w-0 flex-1 rounded-lg border border-input bg-background px-2 py-2 text-sm text-foreground" aria-label="Voz IA">
            {AI_VOICES.map((v) => <option key={v.id} value={v.id}>{v.label}</option>)}
          </select>
        ) : (
          <select value={deviceVoice} onChange={(e) => setDeviceVoice(e.target.value)} className="min-w-0 flex-1 rounded-lg border border-input bg-background px-2 py-2 text-sm text-foreground" aria-label="Voz">
            {voices.length === 0 && <option>Nenhuma voz pt-BR no aparelho</option>}
            {voices.map((v) => <option key={v.name} value={v.name}>{v.name.replace(/\s*\(.*\)/, "").replace(/ - Portuguese.*$/, "")}</option>)}
          </select>
        )}
      </div>
      <label className="flex items-center gap-3 text-xs text-muted-foreground">
        Velocidade
        <input type="range" min={0.6} max={1.6} step={0.1} value={rate} onChange={(e) => setRate(Number(e.target.value))} className="flex-1 accent-[var(--primary)]" />
        <span className="w-8 text-foreground">{rate.toFixed(1)}x</span>
      </label>
      {state === "loading" && <p className="text-xs text-muted-foreground">Preparando a voz…</p>}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
