import { createFileRoute } from "@tanstack/react-router";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Page } from "@/components/Shell";
import { BOOKS, downloadCompleteBibleOffline, getPlan, VERSIONS, fetchChapter, OfflineChapterUnavailableError, TOTAL_BIBLE_CHAPTERS, type Verse } from "@/lib/bible";
import { listPreparedOfflineChapterKeys } from "@/lib/offline-db";

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
type DownloadDialogState = { version: string; status: "confirm" | "downloading" | "ready" | "error"; completed: number; message: string };
const BIBLE_READING_KEY = "mamutes-bible-reading";

function readSavedBibleReading(): { version: string; bookIdx: number; chapter: number } | null {
  try {
    const value = JSON.parse(localStorage.getItem(BIBLE_READING_KEY) ?? "null") as { version?: unknown; bookIdx?: unknown; chapter?: unknown } | null;
    if (!value || typeof value.version !== "string" || !VERSIONS.some((item) => item.id === value.version)) return null;
    if (!Number.isInteger(value.bookIdx) || Number(value.bookIdx) < 0 || Number(value.bookIdx) >= BOOKS.length) return null;
    const bookIdx = Number(value.bookIdx);
    if (!Number.isInteger(value.chapter) || Number(value.chapter) < 1 || Number(value.chapter) > BOOKS[bookIdx]!.ch) return null;
    return { version: value.version, bookIdx, chapter: Number(value.chapter) };
  } catch {
    return null;
  }
}

function Biblia() {
  const { day, plan, b, c, v: startVerse } = Route.useSearch();
  const today = day ? getPlan(plan ?? 180)[day - 1] : undefined;
  const start = today?.refs[0];
  const startBookIdx = start ? BOOKS.indexOf(start.book) : undefined;
  const startChapter = start?.chapter;
  const savedReading = readSavedBibleReading();
  const [bookIdx, setBookIdx] = useState(b ?? startBookIdx ?? savedReading?.bookIdx ?? 0);
  const [chapter, setChapter] = useState(c ?? startChapter ?? savedReading?.chapter ?? 1);
  const [selectedVerse, setSelectedVerse] = useState(startVerse ?? 1);
  const [shouldScrollToVerse, setShouldScrollToVerse] = useState(Boolean(startVerse));
  const [version, setVersion] = useState(savedReading?.version ?? "NAA");
  const [loadedVersion, setLoadedVersion] = useState(savedReading?.version ?? "NAA");
  const [verses, setVerses] = useState<Verse[]>([]);
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [loadError, setLoadError] = useState("");
  const [downloadDialog, setDownloadDialog] = useState<DownloadDialogState | null>(null);
  const [versionMenuOpen, setVersionMenuOpen] = useState(false);
  const downloadController = useRef<AbortController | null>(null);
  const checkingVersion = useRef(false);
  const book = BOOKS[bookIdx]!;

  useEffect(() => () => downloadController.current?.abort(), []);

  useEffect(() => {
    try { localStorage.setItem(BIBLE_READING_KEY, JSON.stringify({ version, bookIdx, chapter })); } catch { /* Keep reading if storage is unavailable. */ }
  }, [version, bookIdx, chapter]);

  useEffect(() => {
    const referenceBook = b ?? startBookIdx;
    const referenceChapter = c ?? startChapter;
    if (referenceBook === undefined || referenceChapter === undefined) return;
    setBookIdx(referenceBook);
    setChapter(referenceChapter);
    setSelectedVerse(startVerse ?? 1);
    setShouldScrollToVerse(Boolean(startVerse));
  }, [b, c, day, plan, startBookIdx, startChapter, startVerse]);

  const prepareOfflineBible = async (targetVersion: string, initialCount = 0) => {
    if (downloadController.current) return;
    const controller = new AbortController();
    downloadController.current = controller;
    setDownloadDialog({ version: targetVersion, status: "downloading", completed: initialCount, message: "" });
    try {
      try {
        if (navigator.storage?.persist) await navigator.storage.persist();
      } catch {
        // Continue even if this browser does not grant persistent storage.
      }
      await downloadCompleteBibleOffline(targetVersion, (progress) => {
        setDownloadDialog({ version: targetVersion, status: "downloading", completed: progress.completed, message: "" });
      }, controller.signal);
      setDownloadDialog({ version: targetVersion, status: "ready", completed: TOTAL_BIBLE_CHAPTERS, message: "Tradução pronta para uso offline neste aparelho." });
    } catch (error) {
      const saved = await listPreparedOfflineChapterKeys(targetVersion).catch(() => new Set<string>());
      setDownloadDialog({
        version: targetVersion,
        status: "error",
        completed: Math.min(saved.size, TOTAL_BIBLE_CHAPTERS),
        message: controller.signal.aborted ? "Download pausado. Os capítulos já salvos foram mantidos." : error instanceof Error ? error.message : "Não foi possível preparar a Bíblia offline.",
      });
    } finally {
      downloadController.current = null;
    }
  };

  const selectTranslation = async (nextVersion: string) => {
    if (checkingVersion.current || downloadController.current) return;
    checkingVersion.current = true;
    try {
      const prepared = await listPreparedOfflineChapterKeys(nextVersion);
      const completed = Math.min(prepared.size, TOTAL_BIBLE_CHAPTERS);
      if (completed === TOTAL_BIBLE_CHAPTERS) {
        setVersion(nextVersion);
        setDownloadDialog(null);
        return;
      }
      const missing = TOTAL_BIBLE_CHAPTERS - completed;
      setDownloadDialog({
        version: nextVersion,
        status: "confirm",
        completed,
        message: completed
          ? `${completed.toLocaleString("pt-BR")} capítulos já estão salvos. Quer baixar os ${missing.toLocaleString("pt-BR")} que faltam?`
          : `Esta tradução ainda não está baixada. Quer salvar os ${TOTAL_BIBLE_CHAPTERS.toLocaleString("pt-BR")} capítulos para usar a Bíblia sem internet?`,
      });
    } finally {
      checkingVersion.current = false;
    }
  };

  useEffect(() => {
    let alive = true;
    setStatus("loading");
    setLoadError("");
    fetchChapter(bookIdx, chapter, version)
      .then((v) => { if (alive) { setVerses(v); setLoadedVersion(version); setStatus("ok"); } })
      .catch((error: unknown) => {
        if (!alive) return;
        if (error instanceof OfflineChapterUnavailableError && typeof navigator !== "undefined" && !navigator.onLine) {
          const fallbackVersions = [...VERSIONS].sort((a, b) => Number(b.id === version) - Number(a.id === version));
          void (async () => {
            for (const candidate of fallbackVersions) {
              if (candidate.id === version) continue;
              try {
                const cachedVerses = await fetchChapter(bookIdx, chapter, candidate.id);
                if (!alive) return;
                setVerses(cachedVerses);
                setLoadedVersion(candidate.id);
                setStatus("ok");
                return;
              } catch { /* Try another locally cached translation. */ }
            }
            if (alive) {
              setLoadError(error.message);
              setStatus("error");
            }
          })();
          return;
        }
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
        <div className="grid grid-cols-2 gap-2">
          <label className="col-span-2 min-w-0">
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
          <div className="relative min-w-0">
            <div className="mb-1 flex h-[1.25rem] items-center justify-between gap-1">
              <span className="text-xs text-muted-foreground">Versículo</span>
              <button type="button" aria-label={`Tradução da Bíblia: ${VERSIONS.find((item) => item.id === version)?.label}`} aria-expanded={versionMenuOpen} onClick={() => setVersionMenuOpen((open) => !open)} className="inline-flex min-h-6 items-center gap-0.5 rounded-md px-1 text-xs font-bold text-primary hover:bg-primary/10">
                {VERSIONS.find((item) => item.id === version)?.label}
                <ChevronDown className="h-3 w-3" />
              </button>
            </div>
            {versionMenuOpen && (
              <div role="group" aria-label="Escolha a tradução da Bíblia" className="absolute right-0 top-7 z-30 w-40 overflow-hidden rounded-xl border border-border bg-card p-1.5 shadow-xl">
                {VERSIONS.map((item) => (
                  <button key={item.id} type="button" aria-pressed={version === item.id} disabled={Boolean(downloadController.current)} onClick={() => { setVersionMenuOpen(false); void selectTranslation(item.id); }} className={`flex min-h-10 w-full items-center justify-between rounded-lg px-3 text-left text-sm font-semibold disabled:opacity-50 ${version === item.id ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-secondary"}`}>
                    <span>{item.label}</span>
                    <span className="text-xs opacity-75">{version === item.id ? "Selecionada" : "Escolher"}</span>
                  </button>
                ))}
              </div>
            )}
            <select aria-label="Versículo" className={`${sel} w-full`} value={selectedVerse} onChange={(e) => { setSelectedVerse(Number(e.target.value)); setShouldScrollToVerse(true); }}>
              {verses.length
                ? verses.map((v) => <option key={v.verse} value={v.verse}>{v.verse}</option>)
                : <option value={1}>1</option>}
            </select>
          </div>
        </div>
      </section>
      {downloadDialog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget && downloadDialog.status !== "downloading") setDownloadDialog(null); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="offline-download-title" className="w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-2xl">
            <h2 id="offline-download-title" className="text-lg font-bold text-foreground">Bíblia offline · {VERSIONS.find((item) => item.id === downloadDialog.version)?.label}</h2>
            {downloadDialog.status === "confirm" ? (
              <>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{downloadDialog.message}</p>
                <p className="mt-2 text-xs text-muted-foreground">O download pode consumir dados e espaço. Se puder, use Wi-Fi.</p>
                <div className="mt-5 flex justify-end gap-2">
                  <button onClick={() => { if (navigator.onLine) setVersion(downloadDialog.version); setDownloadDialog(null); }} className="min-h-11 rounded-lg border border-border px-4 text-sm font-semibold text-foreground">Agora não</button>
                  <button onClick={() => { const { version: target, completed } = downloadDialog; setVersion(target); void prepareOfflineBible(target, completed); }} className="min-h-11 rounded-lg bg-primary px-4 text-sm font-bold text-primary-foreground">Baixar tradução</button>
                </div>
              </>
            ) : (
              <>
                <p role="status" className="mt-2 text-sm text-muted-foreground">{downloadDialog.message || (downloadDialog.status === "downloading" ? "Baixando capítulos… mantenha o app aberto e conectado." : `${downloadDialog.completed.toLocaleString("pt-BR")} de ${TOTAL_BIBLE_CHAPTERS.toLocaleString("pt-BR")} capítulos salvos neste aparelho.`)}</p>
                <p className="mt-3 text-xs text-muted-foreground" aria-live="polite">{downloadDialog.completed.toLocaleString("pt-BR")} de {TOTAL_BIBLE_CHAPTERS.toLocaleString("pt-BR")} capítulos</p>
                <progress className="mt-2 h-2 w-full accent-primary" value={downloadDialog.completed} max={TOTAL_BIBLE_CHAPTERS} aria-label="Progresso do download da Bíblia" />
                <div className="mt-5 flex justify-end gap-2">
                  {downloadDialog.status === "downloading" ? (
                    <button onClick={() => downloadController.current?.abort()} className="min-h-11 rounded-lg border border-border px-4 text-sm font-semibold text-foreground">Pausar</button>
                  ) : downloadDialog.status === "error" ? (
                    <>
                      <button onClick={() => setDownloadDialog(null)} className="min-h-11 rounded-lg border border-border px-4 text-sm font-semibold text-foreground">Fechar</button>
                      <button onClick={() => { const { version: target, completed } = downloadDialog; void prepareOfflineBible(target, completed); }} className="min-h-11 rounded-lg bg-primary px-4 text-sm font-bold text-primary-foreground">Continuar baixando</button>
                    </>
                  ) : (
                    <button onClick={() => setDownloadDialog(null)} className="min-h-11 rounded-lg bg-primary px-4 text-sm font-bold text-primary-foreground">Concluir</button>
                  )}
                </div>
              </>
            )}
          </section>
        </div>
      )}
      <article className="mt-5 overflow-hidden rounded-2xl border border-border bg-card">
        <header className="border-b border-border bg-hero px-5 py-5">
          <h2 className="font-display text-4xl uppercase leading-none text-primary">{book.pt} {chapter}</h2>
          {status === "ok" && (
            <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
              <span>{verses.length} versículos</span>
              <span aria-hidden="true">•</span>
              <span className="rounded-md border border-gold px-2 py-0.5 font-bold text-gold">{loadedVersion}</span>
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
                <span className="font-serif-read text-xl leading-8 text-foreground">{v.text}</span>
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
