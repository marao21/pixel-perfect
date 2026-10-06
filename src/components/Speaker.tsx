import { useEffect, useRef, useState } from "react";
import { Pause, Play, Square } from "lucide-react";

function splitForSpeech(text: string, maxLength = 220) {
  const words = text.trim().split(/\s+/);
  const chunks: string[] = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxLength && current) {
      chunks.push(current);
      current = word;
    } else {
      current = next;
    }
  }

  if (current) chunks.push(current);
  return chunks;
}

function useVoices() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    const synth = window.speechSynthesis;
    let active = true;
    let attempts = 0;

    const load = () => {
      if (!active) return;
      const all = synth.getVoices();
      all.sort((a, b) => {
        const localeRank = (voice: SpeechSynthesisVoice) => {
          const lang = voice.lang.replace("_", "-").toLowerCase();
          return lang === "pt-br" ? 0 : lang.startsWith("pt") ? 1 : 2;
        };
        return localeRank(a) - localeRank(b) || a.name.localeCompare(b.name);
      });
      setVoices(all);
    };

    load();
    synth.addEventListener("voiceschanged", load);
    const retry = window.setInterval(() => {
      load();
      attempts += 1;
      if (attempts >= 20) window.clearInterval(retry);
    }, 250);

    return () => {
      active = false;
      synth.removeEventListener("voiceschanged", load);
      window.clearInterval(retry);
    };
  }, []);

  return voices;
}

export function Speaker({ text }: { text: string }) {
  const voices = useVoices();
  const [deviceVoice, setDeviceVoice] = useState("");
  const [rate, setRate] = useState(1);
  const [state, setState] = useState<"idle" | "playing" | "paused">("idle");
  const [error, setError] = useState("");
  const playbackId = useRef(0);
  const supported = typeof window !== "undefined" && "speechSynthesis" in window;

  useEffect(() => {
    if (!voices.length) return;
    setDeviceVoice((current) => current || voices.find((voice) => voice.lang.replace("_", "-").toLowerCase() === "pt-br")?.voiceURI || voices[0]!.voiceURI);
  }, [voices]);

  const stop = () => {
    playbackId.current += 1;
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    setState("idle");
    setError("");
  };

  useEffect(() => stop, [text]); // eslint-disable-line react-hooks/exhaustive-deps

  const play = () => {
    if (!supported || !text.trim()) return;
    const synth = window.speechSynthesis;

    if (state === "paused") {
      synth.resume();
      setState("playing");
      return;
    }

    synth.cancel();
    const currentPlayback = ++playbackId.current;
    const availableVoices = synth.getVoices();
    const voice = availableVoices.find((item) => item.voiceURI === deviceVoice)
      ?? voices.find((item) => item.voiceURI === deviceVoice)
      ?? availableVoices.find((item) => item.lang.replace("_", "-").toLowerCase() === "pt-br")
      ?? availableVoices.find((item) => item.lang.toLowerCase().startsWith("pt"));
    const chunks = splitForSpeech(text);
    let chunkIndex = 0;

    setError("");
    setState("playing");

    const speakNext = () => {
      if (currentPlayback !== playbackId.current) return;
      const chunk = chunks[chunkIndex++];
      if (!chunk) {
        setState("idle");
        return;
      }

      const utterance = new SpeechSynthesisUtterance(chunk);
      if (voice) utterance.voice = voice;
      utterance.lang = voice?.lang || "pt-BR";
      utterance.rate = rate;
      utterance.onend = speakNext;
      utterance.onerror = (event) => {
        if (currentPlayback !== playbackId.current) return;
        if (event.error !== "canceled" && event.error !== "interrupted") {
          setError("O celular não conseguiu iniciar a leitura. Confira se a voz em português está instalada e tente novamente.");
          setState("idle");
        }
      };
      synth.speak(utterance);
    };

    speakNext();
  };

  const pause = () => {
    if (!supported) return;
    window.speechSynthesis.pause();
    setState("paused");
  };

  return (
    <div className="space-y-2 rounded-xl border border-border bg-secondary p-3">
      <div className="flex items-center gap-2">
        {state === "playing" ? (
          <button onClick={pause} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground" aria-label="Pausar"><Pause className="h-4 w-4" /></button>
        ) : (
          <button onClick={play} disabled={!text || !supported} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground disabled:opacity-50" aria-label="Ouvir"><Play className="h-4 w-4" /></button>
        )}
        <button onClick={stop} disabled={!supported} className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border text-muted-foreground disabled:opacity-50" aria-label="Parar"><Square className="h-4 w-4" /></button>
        <select value={deviceVoice} onChange={(event) => setDeviceVoice(event.target.value)} disabled={!voices.length} className="min-w-0 flex-1 rounded-lg border border-input bg-background px-2 py-2 text-sm text-foreground disabled:opacity-60" aria-label="Voz">
          {voices.length === 0 && <option value="">{supported ? "Carregando vozes do aparelho…" : "Leitura em voz alta indisponível"}</option>}
          {voices.map((voice) => <option key={voice.voiceURI} value={voice.voiceURI}>{voice.name.replace(/\s*\(.*\)/, "").replace(/ - Portuguese.*$/, "")} · {voice.lang}</option>)}
        </select>
      </div>
      <label className="flex items-center gap-3 text-xs text-muted-foreground">
        Velocidade
        <input type="range" min={0.6} max={1.6} step={0.1} value={rate} onChange={(event) => setRate(Number(event.target.value))} className="flex-1 accent-[var(--primary)]" />
        <span className="w-8 text-foreground">{rate.toFixed(1)}x</span>
      </label>
      {error && <p role="status" className="text-xs leading-relaxed text-destructive">{error}</p>}
      {!supported && <p role="status" className="text-xs leading-relaxed text-muted-foreground">Este navegador não oferece leitura em voz alta. Abra a página no Chrome ou Safari atualizado.</p>}
    </div>
  );
}
