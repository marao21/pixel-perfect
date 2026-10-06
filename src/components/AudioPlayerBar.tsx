import { LoaderCircle, Pause, Play, Square, Volume2 } from "lucide-react";
import { useId } from "react";
import { useGoogleTTS, type GoogleTTSCallbacks } from "@/hooks/useGoogleTTS";

type AudioPlayerBarProps = {
  text: string;
  label?: string;
  callbacks?: GoogleTTSCallbacks;
};

function voiceName(name: string) {
  return name.replace(/\s*\(.*\)/, "").replace(/ - Portuguese.*$/, "");
}

function speedLabel(speed: number) {
  return `${speed === 1 || speed === 2 ? speed.toFixed(1) : speed}x`;
}

export function AudioPlayerBar({ text, label = "Ouvir", callbacks }: AudioPlayerBarProps) {
  const player = useGoogleTTS(text, callbacks);
  const voiceSelectId = useId();
  const isSpeaking = player.status === "playing" || player.status === "loading";
  const statusLabel = player.status === "playing"
    ? "Reproduzindo"
    : player.status === "paused"
      ? "Pausado"
      : player.status === "loading"
        ? "Iniciando áudio…"
        : player.status === "error"
          ? "Falha na reprodução"
          : player.voiceLoading
            ? "Carregando vozes do aparelho…"
            : "Pronto para ouvir";

  return (
    <section className="space-y-3 rounded-xl border border-border bg-secondary p-3" aria-label="Leitura em voz alta">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground" aria-live="polite">
        {player.status === "loading" || player.voiceLoading
          ? <LoaderCircle className="h-4 w-4 animate-spin text-gold" aria-hidden="true" />
          : <Volume2 className={`h-4 w-4 ${player.status === "playing" ? "text-primary" : "text-muted-foreground"}`} aria-hidden="true" />}
        <span>{statusLabel}</span>
      </div>

      <div className="grid grid-cols-[1.45fr_0.8fr_0.8fr] gap-2">
        <button
          type="button"
          onClick={player.play}
          disabled={!text.trim() || !player.supported || isSpeaking}
          className="inline-flex min-h-11 min-w-0 items-center justify-center gap-1.5 rounded-lg bg-primary px-2 text-[11px] font-semibold text-primary-foreground disabled:opacity-50"
          aria-label={player.status === "paused" ? "Retomar leitura" : label}
        >
          <Play className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="text-center leading-tight">{player.status === "paused" ? "Retomar" : label}</span>
        </button>
        <button
          type="button"
          onClick={player.pause}
          disabled={!player.supported || player.status !== "playing"}
          className="inline-flex min-h-11 items-center justify-center gap-1 rounded-lg border border-border px-2 text-xs font-semibold text-foreground disabled:opacity-50"
          aria-label="Pausar"
        >
          <Pause className="h-4 w-4 shrink-0" aria-hidden="true" /> <span>Pausar</span>
        </button>
        <button
          type="button"
          onClick={player.stop}
          disabled={!player.supported || player.status === "idle"}
          className="inline-flex min-h-11 items-center justify-center gap-1 rounded-lg border border-border px-2 text-xs font-semibold text-muted-foreground disabled:opacity-50"
          aria-label="Parar"
        >
          <Square className="h-4 w-4 shrink-0" aria-hidden="true" /> <span>Parar</span>
        </button>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
        <label className="sr-only" htmlFor={voiceSelectId}>Escolher voz</label>
        <select
          id={voiceSelectId}
          value={player.selectedVoiceURI}
          onChange={(event) => player.selectVoice(event.target.value)}
          disabled={!player.voices.length}
          className="min-w-0 rounded-lg border border-input bg-background px-2 py-2 text-xs text-foreground disabled:opacity-60"
          aria-label="Voz do aparelho"
        >
          {(!player.clientReady || player.voiceLoading) && <option value="">Carregando vozes…</option>}
          {player.clientReady && !player.supported && <option value="">Leitura em voz alta indisponível</option>}
          {player.clientReady && player.supported && !player.voiceLoading && !player.voices.length && <option value="">Nenhuma voz encontrada</option>}
          {player.googlePortugueseVoices.length > 0 && (
            <optgroup label="Google · Português">
              {player.googlePortugueseVoices.map((voice) => <option key={voice.voiceURI} value={voice.voiceURI}>{voiceName(voice.name)} · {voice.lang}</option>)}
            </optgroup>
          )}
          {player.otherPortugueseVoices.length > 0 && (
            <optgroup label="Outras vozes · Português">
              {player.otherPortugueseVoices.map((voice) => <option key={voice.voiceURI} value={voice.voiceURI}>{voiceName(voice.name)} · {voice.lang}</option>)}
            </optgroup>
          )}
          {player.remainingVoices.length > 0 && (
            <optgroup label="Outras vozes disponíveis">
              {player.remainingVoices.map((voice) => <option key={voice.voiceURI} value={voice.voiceURI}>{voiceName(voice.name)} · {voice.lang}</option>)}
            </optgroup>
          )}
        </select>
        <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
          Velocidade
          <select value={player.rate} onChange={(event) => player.selectRate(Number(event.target.value))} className="rounded-lg border border-input bg-background px-2 py-2 text-xs font-semibold text-foreground" aria-label="Velocidade da fala">
            {player.speeds.map((speed) => <option key={speed} value={speed}>{speedLabel(speed)}</option>)}
          </select>
        </label>
      </div>

      {player.currentPhrase && player.status === "playing" && (
        <p className="line-clamp-2 rounded-lg border-l-2 border-gold bg-background/60 px-2 py-1.5 text-xs leading-relaxed text-muted-foreground" aria-live="polite">{player.currentPhrase}</p>
      )}
      {player.error && <p role="alert" className="text-xs leading-relaxed text-destructive">{player.error}</p>}
      {player.clientReady && !player.supported && (
        <p role="status" className="text-xs leading-relaxed text-muted-foreground">Este navegador não oferece leitura em voz alta. Abra o app no Chrome ou Safari atualizado.</p>
      )}
    </section>
  );
}
