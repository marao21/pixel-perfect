import { createFileRoute } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Page } from "@/components/Shell";
import { BOOKS, downloadCompleteBibleOffline, getPlan, VERSIONS, fetchChapter, OfflineChapterUnavailableError, TOTAL_BIBLE_CHAPTERS, type Verse } from "@/lib/bible";
import { listPreparedOfflineChapterKeys, removePreparedOfflineBible } from "@/lib/offline-db";

export const Route = createFileRoute("/biblia")({
  validateSearch: (s: Record<string, unknown>): { day?: number; plan?: 90 | 180 | 365; b?: number; c?: number; v?: number } => {
    const p = Number(s["plan"]);
    return { ...(s["b"] !== undefined ? { b: Number(s["b"]), c: Number(s["c"] ?? 1) } : {}), ...(s["day"] ? { day: Number(s["day"]) } : {}), ...(s["v"] ? { v: Number(s["v"]) } : {}), ...(p === 90 || p === 365 || p === 180 ? { plan: p as 90 | 180 | 365 } : {}) };
  },
  head: () => ({
    meta: [
      { title: "Bíblia — Os Mamutes" },
      { name: "description", content: "Leia a Bíblia em várias versões." },
      { property: "og:title", content: "Bíblia — Os Mamutes" },
      { property: "og:description", content: "Leia a Bíblia em várias versões." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Biblia,
});

const sel = "h-11 min-w-0 rounded-xl border border-border bg-card px-2.5 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";
type OfflinePackState = { status: "checking" | "idle" | "downloading" | "ready" | "error"; completed: number; message: string };

function Biblia() {
  const { day, plan, b, c, v: startVerse } = Route.useSearch();
  const today = day ? getPlan(plan ?? 180)[day - 1] : undefined;
  const start = today?.refs[0];
  const [bookIdx, setBookIdx] = useState(b ?? (start ? BOOKS.indexOf(start.book) : 0));
  const [chapter, setChapter] = useState(c ?? start?.chapter ?? 1);
  const [selectedVerse, setSelectedVerse] = useState(startVerse ?? 1);
  const [shouldScrollToVerse, setShouldScrollToVerse] = useState(Boolean(startVerse));
  const [version, setVersion] = useState("NAA");
  const [verses, setVerses] = useState<Verse[]>([]);
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [loadError, setLoadError] = useState("");
  const [offlinePack, setOfflinePack] = useState<OfflinePackState>({ status: "checking", completed: 0, message: "" });
  const downloadController = useRef<AbortController | null>(null);
  const book = BOOKS[bookIdx]!;

  useEffect(() => () => downloadController.current?.abort(), []);

  useEffect(() => {
    let active = true;
    setOfflinePack({ status: "checking", completed: 0, message: "" });
    listPreparedOfflineChapterKeys(version).then((keys) => {
      if (!active) return;
      const completed = Math.min(keys.size, TOTAL_BIBLE_CHAPTERS);
      setOfflinePack({
        status: completed === TOTAL_BIBLE_CHAPTERS ? "ready" : "idle",
        completed,
        message: "",
      });
    });
    return () => { active = false; };
  }, [version]);

  const prepareOfflineBible = async () => {
    if (downloadController.current) return;
    const controller = new AbortController();
    downloadController.current = controller;
    setOfflinePack((current) => ({ ...current, status: "downloading", message: "" }));
    try {
      try {
        if (navigator.storage?.persist) await navigator.storage.persist();
      } catch {
        // Continue even if this browser does not grant persistent storage.
      }
      await downloadCompleteBibleOffline(version, (progress) => {
        setOfflinePack({ status: "downloading", completed: progress.completed, message: "" });
      }, controller.signal);
      setOfflinePack({ status: "ready", completed: TOTAL_BIBLE_CHAPTERS, message: "Esta tradução está pronta para uso offline neste aparelho." });
    } catch (error) {
      setOfflinePack((current) => ({
        ...current,
        status: "error",
        message: error instanceof Error ? error.message : "Não foi possível preparar a Bíblia offline.",
      }));
    } finally {
      downloadController.current = null;
      listPreparedOfflineChapterKeys(version).then((keys) => {
        setOfflinePack((current) => current.status === "downloading"
          ? { ...current, completed: Math.min(keys.size, TOTAL_BIBLE_CHAPTERS) }
          : current);
      });
    }
  };

  const clearOfflineBible = async () => {
    const label = VERSIONS.find((item) => item.id === version)?.label ?? version;
    if (!window.confirm(`Apagar do aparelho a cópia offline da tradução ${label}?`)) return;
    const removed = await removePreparedOfflineBible(version);
    if (removed) setOfflinePack({ status: "idle", completed: 0, message: "Cópia offline removida deste aparelho." });
    else setOfflinePack((current) => ({ ...current, status: "error", message: "Não foi possível apagar a cópia offline agora." }));
  };

  useEffect(() => {
    let alive = true;
    setStatus("loading");
    setLoadError("");
    fetchChapter(bookIdx, chapter, version)
      .then((v) => { if (alive) { setVerses(v); setStatus("ok"); } })
      .catch((error: unknown) => {
        if (!alive) return;
        setLoadError(error instanceof OfflineChapterUnavailableError
          ? error.message
          : "Não foi possível carregar o capítulo agora. Verifique sua conexão e tente novamente.");
        setStatus("error");
      });
    return () => { alive = false; };
  }, [bookIdx, chapter, version]);

  useEffect(() => {
    if (status !== "ok" || !shouldScrollToVerse) return;
    const el = document.getElementById(`vers-${selectedVerse}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    setShouldScrollToVerse(false);
  }, [status, selectedVerse, bookIdx, chapter, shouldScrollToVerse]);

  const navigate = Route.useNavigate();
  const fullPlan = getPlan(plan ?? 180);
  const pos = today ? today.refs.findIndex((r) => BOOKS.indexOf(r.book) === bookIdx && r.chapter === chapter) : -1;
  const goTo = (bi: number, c: number) => { setBookIdx(bi); setChapter(c); setSelectedVerse(1); setShouldScrollToVerse(false); window.scrollTo({ top: 0 }); };
  const next = () => {
    if (!today || pos < 0) return go(1);
    const r = today.refs[pos + 1];
    if (r) return goTo(BOOKS.indexOf(r.book), r.chapter);
    const nd = fullPlan[day!];
    if (nd) { navigate({ search: { day: nd.day, plan: plan ?? 180 } }); goTo(BOOKS.indexOf(nd.refs[0]!.book), nd.refs[0]!.chapter); }
  };
  const prev = () => {
    if (!today || pos < 0) return go(-1);
    const r = today.refs[pos - 1];
    if (r) return goTo(BOOKS.indexOf(r.book), r.chapter);
    const pd = fullPlan[day! - 2];
    if (pd) { const l = pd.refs[pd.refs.length - 1]!; navigate({ search: { day: pd.day, plan: plan ?? 180 } }); goTo(BOOKS.indexOf(l.book), l.chapter); }
  };
  const go = (delta: number) => {
    let b = bookIdx, c = chapter + delta;
    if (c < 1) { b = Math.max(0, b - 1); c = b === bookIdx ? 1 : BOOKS[b]!.ch; }
    if (c > BOOKS[b]!.ch) { if (b < BOOKS.length - 1) { b++; c = 1; } else c = BOOKS[b]!.ch; }
    setBookIdx(b); setChapter(c); setSelectedVerse(1); window.scrollTo({ top: 0 });
  };

  return (
    <Page kicker={today ? `Leitura do dia ${day} · Plano ${plan === 365 ? "1 ano" : `${plan ?? 180} dias`}` : "Palavra de Deus"} title="Bíblia">
      {today && (
        <div className="mb-4 rounded-xl border border-gold bg-card p-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-gold">Leitura de hoje</p>
          <p className="mb-2 font-medium text-foreground">{today.label}</p>
          {pos >= 0 && <p className="mb-2 text-xs text-muted-foreground">Capítulo {pos + 1} de {today.refs.length} · toque em "Próximo" para seguir a ordem</p>}
          <div className="flex flex-wrap gap-1.5">
            {today.refs.map((r) => {
              const bi = BOOKS.indexOf(r.book), on = bi === bookIdx && r.chapter === chapter;
              return (
                <button key={`${bi}-${r.chapter}`} onClick={() => { setBookIdx(bi); setChapter(r.chapter); setSelectedVerse(1); setShouldScrollToVerse(false); }} className={`rounded-lg border px-2.5 py-1 text-xs font-bold ${on ? "border-primary bg-primary text-primary-foreground" : "border-border bg-secondary text-foreground"}`}>
                  {r.book.pt} {r.chapter}
                </button>
              );
            })}
          </div>
        </div>
      )}
      <section className="mb-4 rounded-2xl border border-border bg-secondary/50 p-3">
        <p className="mb-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Escolha a passagem</p>
        <div className="grid grid-cols-[minmax(0,1fr)_4.25rem_4.25rem] gap-2">
          <label className="min-w-0">
            <span className="mb-1 block text-xs text-muted-foreground">Livro</span>
            <select aria-label="Livro" className={`${sel} w-full`} value={bookIdx} onChange={(e) => { setBookIdx(Number(e.target.value)); setChapter(1); setSelectedVerse(1); setShouldScrollToVerse(false); }}>
              {BOOKS.map((b, i) => <option key={b.en} value={i}>{b.pt}</option>)}
            </select>
          </label>
          <label>
            <span className="mb-1 block text-xs text-muted-foreground">Capítulo</span>
            <select aria-label="Capítulo" className={`${sel} w-full`} value={chapter} onChange={(e) => { setChapter(Number(e.target.value)); setSelectedVerse(1); setShouldScrollToVerse(false); }}>
              {Array.from({ length: book.ch }, (_, i) => <option key={i} value={i + 1}>{i + 1}</option>)}
            </select>
          </label>
          <label>
            <span className="mb-1 block text-xs text-muted-foreground">Versículo</span>
            <select aria-label="Versículo" className={`${sel} w-full`} value={selectedVerse} onChange={(e) => { setSelectedVerse(Number(e.target.value)); setShouldScrollToVerse(true); }}>
              {verses.length
                ? verses.map((v) => <option key={v.verse} value={v.verse}>{v.verse}</option>)
                : <option value={1}>1</option>}
            </select>
          </label>
        </div>
      </section>
      <section className="mb-4 rounded-2xl border border-border bg-secondary/50 p-3">
        <p className="mb-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Tradução da Bíblia</p>
        <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-7">
          {VERSIONS.map((v) => (
            <button key={v.id} disabled={offlinePack.status === "downloading"} aria-pressed={version === v.id} onClick={() => setVersion(v.id)} className={`rounded-lg border px-1 py-2 text-xs font-bold tracking-wide transition-colors disabled:opacity-60 ${version === v.id ? "border-primary bg-primary text-primary-foreground shadow-sm" : "border-transparent bg-card/70 text-muted-foreground hover:border-border hover:text-foreground"}`}>{v.label}</button>
          ))}
        </div>
      </section>
      <section className="mb-4 rounded-2xl border border-border bg-card p-4" aria-label="Preparar Bíblia para uso offline">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-semibold text-foreground">Bíblia offline · {VERSIONS.find((item) => item.id === version)?.label}</h2>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Baixe os {TOTAL_BIBLE_CHAPTERS.toLocaleString("pt-BR")} capítulos desta tradução para abrir a Bíblia inteira sem internet. Cada tradução é baixada separadamente; o preparo pode levar alguns minutos, consumir dados e usar espaço neste aparelho. Se puder, use Wi-Fi.
            </p>
          </div>
        </div>
        {offlinePack.status !== "checking" && (
          <p className="mt-3 text-xs text-muted-foreground" aria-live="polite">
            {offlinePack.completed.toLocaleString("pt-BR")} de {TOTAL_BIBLE_CHAPTERS.toLocaleString("pt-BR")} capítulos salvos neste aparelho.
          </p>
        )}
        {offlinePack.status === "downloading" && (
          <progress className="mt-2 h-2 w-full accent-primary" value={offlinePack.completed} max={TOTAL_BIBLE_CHAPTERS} aria-label="Progresso do download da Bíblia" />
        )}
        <div className="mt-3 flex flex-wrap gap-2">
          {offlinePack.status === "ready" ? (
            <p className="rounded-lg bg-primary/10 px-3 py-2 text-sm font-medium text-primary">Tradução pronta para uso offline</p>
          ) : offlinePack.status === "checking" ? (
            <p className="text-sm text-muted-foreground">Verificando capítulos já salvos…</p>
          ) : offlinePack.status === "downloading" ? (
            <button onClick={() => downloadController.current?.abort()} className="rounded-lg border border-border px-3 py-2 text-sm font-semibold text-foreground">Pausar download</button>
          ) : (
            <button onClick={() => void prepareOfflineBible()} className="rounded-lg bg-primary px-3 py-2 text-sm font-bold text-primary-foreground">
              {offlinePack.completed ? "Continuar baixando" : "Baixar Bíblia para usar offline"}
            </button>
          )}
          {offlinePack.completed > 0 && offlinePack.status !== "downloading" && offlinePack.status !== "checking" && (
            <button onClick={() => void clearOfflineBible()} className="rounded-lg border border-border px-3 py-2 text-sm font-medium text-muted-foreground">Apagar cópia offline</button>
          )}
        </div>
        {offlinePack.message && <p role="status" className="mt-2 text-xs text-muted-foreground">{offlinePack.message}</p>}
        {offlinePack.status !== "ready" && offlinePack.status !== "checking" && (
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">Mantenha o app aberto e conectado até concluir. Se a conexão cair, os capítulos salvos são mantidos e o download pode ser retomado.</p>
        )}
      </section>
      <article className="mt-5 overflow-hidden rounded-2xl border border-border bg-card">
        <header className="border-b border-border bg-hero px-5 py-5">
          <h2 className="font-display text-4xl uppercase leading-none text-primary">{book.pt} {chapter}</h2>
          {status === "ok" && (
            <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
              <span>{verses.length} versículos</span>
              <span aria-hidden="true">•</span>
              <span className="rounded-md border border-gold px-2 py-0.5 font-bold text-gold">{version}</span>
            </p>
          )}
        </header>
        {status === "loading" && <p className="text-muted-foreground">Carregando…</p>}
        {status === "error" && <p role="status" className="p-4 text-sm text-muted-foreground">{loadError}</p>}
        {status === "ok" && (
          <div className="px-4 py-3 sm:px-5">
            {verses.map((v) => (
              <p key={v.verse} id={`vers-${v.verse}`} className={`grid grid-cols-[1.75rem_minmax(0,1fr)] gap-2 border-b border-border/50 py-3 last:border-b-0 ${selectedVerse === v.verse ? "rounded-lg bg-gold/15 px-2" : ""}`}>
                <span className="pt-1 text-sm font-bold leading-none text-primary">{v.verse}</span>
                <span className="font-serif-read text-lg leading-8 text-foreground">{v.text}</span>
              </p>
            ))}
          </div>
        )}
      </article>
      <div className="mt-4 flex justify-between">
        <button onClick={prev} className="flex items-center gap-1 rounded-lg bg-secondary px-4 py-2 text-sm text-foreground"><ChevronLeft className="h-4 w-4" /> Anterior</button>
        <button onClick={next} className="flex items-center gap-1 rounded-lg bg-secondary px-4 py-2 text-sm text-foreground">Próximo <ChevronRight className="h-4 w-4" /></button>
      </div>
    </Page>
  );
}
