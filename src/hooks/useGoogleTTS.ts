import { useCallback, useEffect, useRef, useState } from "react";

const VOICE_STORAGE_KEY = "mamutes-tts-voice";
const RATE_STORAGE_KEY = "mamutes-tts-rate";
const SPEEDS = [0.8, 1, 1.25, 1.5, 2] as const;

export type TTSStatus = "idle" | "loading" | "playing" | "paused" | "error";

export type GoogleTTSCallbacks = {
  onstart?: () => void;
  onpause?: () => void;
  onresume?: () => void;
  onend?: () => void;
  onerror?: (message: string) => void;
  onPhraseChange?: (phrase: string, index: number) => void;
};

const normalizeLanguage = (lang: string) => lang.replace("_", "-").toLowerCase();
const isPortuguese = (voice: SpeechSynthesisVoice) => normalizeLanguage(voice.lang).startsWith("pt");
const isBrazilianPortuguese = (voice: SpeechSynthesisVoice) => normalizeLanguage(voice.lang) === "pt-br";
const isGoogleVoice = (voice: SpeechSynthesisVoice) => voice.name.toLowerCase().includes("google");

function sortVoices(voices: SpeechSynthesisVoice[]) {
  const rank = (voice: SpeechSynthesisVoice) => {
    if (isGoogleVoice(voice) && isBrazilianPortuguese(voice)) return 0;
    if (isGoogleVoice(voice) && isPortuguese(voice)) return 1;
    if (isBrazilianPortuguese(voice)) return 2;
    if (isPortuguese(voice)) return 3;
    return 4;
  };
  return [...voices].sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name));
}

function preferredVoice(voices: SpeechSynthesisVoice[]) {
  return sortVoices(voices).find(isPortuguese);
}

function splitSpeechText(text: string, maxLength = 220) {
  const sentences: string[] = [];
  let start = 0;
  for (let index = 0; index < text.length; index += 1) {
    const atEnd = index === text.length - 1;
    const sentenceEnd = ".!?;:".includes(text[index] ?? "") && (atEnd || /\s/.test(text[index + 1] ?? ""));
    const paragraphEnd = text[index] === "\n";
    if (sentenceEnd || paragraphEnd) {
      const sentence = text.slice(start, index + 1).trim();
      if (sentence) sentences.push(sentence);
      start = index + 1;
    }
  }
  const finalText = text.slice(start).trim();
  if (finalText) sentences.push(finalText);

  const chunks: string[] = [];
  let current = "";
  for (const sentence of sentences.length ? sentences : [text.trim()]) {
    if (sentence.length > maxLength) {
      if (current) chunks.push(current);
      current = "";
      for (const word of sentence.split(/\s+/)) {
        const next = current ? `${current} ${word}` : word;
        if (next.length > maxLength && current) {
          chunks.push(current);
          current = word;
        } else {
          current = next;
        }
      }
    } else if (current && current.length + sentence.length + 1 > maxLength) {
      chunks.push(current);
      current = sentence;
    } else {
      current = current ? `${current} ${sentence}` : sentence;
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

type VoiceListener = () => void;
const voiceListeners = new Set<VoiceListener>();
let previousVoicesChanged: SpeechSynthesis["onvoiceschanged"] = null;
let sharedVoicesChanged: SpeechSynthesis["onvoiceschanged"] = null;

function subscribeToVoiceChanges(synth: SpeechSynthesis, listener: VoiceListener) {
  if (!sharedVoicesChanged) {
    previousVoicesChanged = synth.onvoiceschanged;
    sharedVoicesChanged = (event) => {
      previousVoicesChanged?.call(synth, event);
      voiceListeners.forEach((notify) => notify());
    };
    synth.onvoiceschanged = sharedVoicesChanged;
  }
  voiceListeners.add(listener);
  listener(); // Some browsers already have their voice list cached.

  return () => {
    voiceListeners.delete(listener);
    if (voiceListeners.size === 0 && synth.onvoiceschanged === sharedVoicesChanged) {
      synth.onvoiceschanged = previousVoicesChanged;
      previousVoicesChanged = null;
      sharedVoicesChanged = null;
    }
  };
}

export function useGoogleTTS(text: string, callbacks: GoogleTTSCallbacks = {}) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState("");
  const [rate, setRate] = useState<number>(1);
  const [status, setStatus] = useState<TTSStatus>("idle");
  const [error, setError] = useState("");
  const [currentPhrase, setCurrentPhrase] = useState("");
  const [clientReady, setClientReady] = useState(false);
  const statusRef = useRef<TTSStatus>("idle");
  const playbackId = useRef(0);
  const callbacksRef = useRef(callbacks);

  useEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);

  const supported = clientReady && typeof window !== "undefined" && "speechSynthesis" in window;
  const orderedVoices = sortVoices(voices);
  const googlePortugueseVoices = orderedVoices.filter((voice) => isGoogleVoice(voice) && isPortuguese(voice));
  const otherPortugueseVoices = orderedVoices.filter((voice) => isPortuguese(voice) && !isGoogleVoice(voice));
  const remainingVoices = orderedVoices.filter((voice) => !isPortuguese(voice));

  const transition = useCallback((next: TTSStatus) => {
    if (statusRef.current === next) return false;
    statusRef.current = next;
    setStatus(next);
    return true;
  }, []);

  useEffect(() => {
    setClientReady(true);
    try {
      const savedRate = Number(window.localStorage.getItem(RATE_STORAGE_KEY));
      if (SPEEDS.includes(savedRate as (typeof SPEEDS)[number])) setRate(savedRate);
    } catch {
      // Private browsing can disable localStorage; speech still works.
    }
  }, []);

  useEffect(() => {
    if (!supported) return;
    const synth = window.speechSynthesis;
    let storedVoiceURI = "";
    try {
      storedVoiceURI = window.localStorage.getItem(VOICE_STORAGE_KEY) ?? "";
    } catch {
      // Private browsing can disable localStorage; use the browser's default voice.
    }

    const refresh = () => {
      const available = sortVoices(synth.getVoices());
      setVoices((current) => current.length === available.length && current.every((voice, index) => voice.voiceURI === available[index]?.voiceURI) ? current : available);
      if (!available.length) return;
      setVoicesLoaded(true);
      setSelectedVoiceURI((current) => {
        if (current && available.some((voice) => voice.voiceURI === current)) return current;
        if (storedVoiceURI && available.some((voice) => voice.voiceURI === storedVoiceURI)) return storedVoiceURI;
        return preferredVoice(available)?.voiceURI ?? available[0]!.voiceURI;
      });
    };

    const unsubscribe = subscribeToVoiceChanges(synth, refresh);
    let attempts = 0;
    const retry = window.setInterval(() => {
      refresh();
      attempts += 1;
      if (synth.getVoices().length > 0 || attempts >= 20) {
        setVoicesLoaded(true);
        window.clearInterval(retry);
      }
    }, 250);

    return () => {
      unsubscribe();
      window.clearInterval(retry);
    };
  }, [supported]);

  const selectVoice = useCallback((voiceURI: string) => {
    setSelectedVoiceURI(voiceURI);
    try {
      window.localStorage.setItem(VOICE_STORAGE_KEY, voiceURI);
    } catch {
      // Voice selection remains active for this session if storage is unavailable.
    }
  }, []);

  const selectRate = useCallback((nextRate: number) => {
    setRate(nextRate);
    try {
      window.localStorage.setItem(RATE_STORAGE_KEY, String(nextRate));
    } catch {
      // Speed selection remains active for this session if storage is unavailable.
    }
  }, []);

  const stop = useCallback(() => {
    playbackId.current += 1;
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    transition("idle");
    setCurrentPhrase("");
    setError("");
  }, [transition]);

  useEffect(() => () => {
    playbackId.current += 1;
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
  }, [text]);

  const resume = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.resume();
    if (transition("playing")) callbacksRef.current.onresume?.();
  }, [supported, transition]);

  const pause = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.pause();
    if (transition("paused")) callbacksRef.current.onpause?.();
  }, [supported, transition]);

  const play = useCallback(() => {
    if (!supported || !text.trim()) return;
    if (statusRef.current === "paused") {
      resume();
      return;
    }

    const synth = window.speechSynthesis;
    synth.cancel();
    const thisPlayback = ++playbackId.current;
    const available = synth.getVoices();
    const selected = available.find((voice) => voice.voiceURI === selectedVoiceURI && isPortuguese(voice))
      ?? voices.find((voice) => voice.voiceURI === selectedVoiceURI && isPortuguese(voice))
      ?? preferredVoice(available);
    const chunks = splitSpeechText(text);
    let index = 0;

    setError("");
    setCurrentPhrase("");
    transition("loading");

    const speakNext = () => {
      if (thisPlayback !== playbackId.current) return;
      const phrase = chunks[index];
      if (phrase === undefined) {
        setCurrentPhrase("");
        transition("idle");
        callbacksRef.current.onend?.();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(phrase);
      if (selected) utterance.voice = selected;
      utterance.lang = "pt-BR";
      utterance.rate = rate;
      utterance.onstart = () => {
        if (thisPlayback !== playbackId.current) return;
        transition("playing");
        setCurrentPhrase(phrase);
        callbacksRef.current.onstart?.();
        callbacksRef.current.onPhraseChange?.(phrase, index);
      };
      utterance.onpause = () => {
        if (thisPlayback === playbackId.current && transition("paused")) callbacksRef.current.onpause?.();
      };
      utterance.onresume = () => {
        if (thisPlayback === playbackId.current && transition("playing")) callbacksRef.current.onresume?.();
      };
      utterance.onend = () => {
        if (thisPlayback !== playbackId.current) return;
        index += 1;
        speakNext();
      };
      utterance.onerror = (event) => {
        if (thisPlayback !== playbackId.current) return;
        const interrupted = event.error === "canceled" || event.error === "interrupted";
        const message = interrupted
          ? "A leitura foi interrompida."
          : "Não foi possível iniciar a voz. Confira se há uma voz em português instalada no aparelho.";
        setError(interrupted ? "" : message);
        transition(interrupted ? "idle" : "error");
        callbacksRef.current.onerror?.(message);
      };

      try {
        synth.speak(utterance);
      } catch {
        const message = "Não foi possível iniciar a leitura em voz alta neste navegador.";
        setError(message);
        transition("error");
        callbacksRef.current.onerror?.(message);
      }
    };

    speakNext(); // Starts synchronously inside the user's tap/click gesture.
  }, [rate, resume, selectedVoiceURI, supported, text, transition, voices]);

  return {
    voices: orderedVoices,
    googlePortugueseVoices,
    otherPortugueseVoices,
    remainingVoices,
    selectedVoiceURI,
    selectVoice,
    rate,
    selectRate,
    status,
    error,
    currentPhrase,
    supported,
    clientReady,
    voiceLoading: supported && !voicesLoaded,
    play,
    pause,
    resume,
    stop,
    speeds: SPEEDS,
  };
}
