import { createFileRoute } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Page } from "@/components/Shell";
import { Speaker } from "@/components/Speaker";
import { BOOKS, getPlan, VERSIONS, fetchChapter, type Verse } from "@/lib/bible";

export const Route = createFileRoute("/biblia")({
  validateSearch: (s: Record<string, unknown>): { day?: number; plan?: 90 | 180 | 365; b?: number; c?: number; v?: number } => {
    const p = Number(s["plan"]);
    return { ...(s["b"] !== undefined ? { b: Number(s["b"]), c: Number(s["c"] ?? 1) } : {}), ...(s["day"] ? { day: Number(s["day"]) } : {}), ...(s["v"] ? { v: Number(s["v"]) } : {}), ...(p === 90 || p === 365 || p === 180 ? { plan: p as 90 | 180 | 365 } : {}) };
  },
  head: () => ({
    meta: [
      { title: "Bíblia com Leitura em Voz Alta — Os Mamutes" },
      { name: "description", content: "Leia e ouça a Bíblia em várias versões, escolhendo a voz." },
      { property: "og:title", content: "Bíblia com Leitura em Voz Alta — Os Mamutes" },
      { property: "og:description", content: "Leia e ouça a Bíblia em várias versões." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Biblia,
});

const sel = "min-w-0 rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground";

function Biblia() {
  const { day, plan, b, c, v: startVerse } = Route.useSearch();
  const today = day ? getPlan(plan ?? 180)[day - 1] : undefined;
  const start = today?.refs[0];
  const [bookIdx, setBookIdx] = useState(b ?? (start ? BOOKS.indexOf(start.book) : 0));
  const [chapter, setChapter] = useState(c ?? start?.chapter ?? 1);
  const [version, setVersion] = useState("NAA");
  const [verses, setVerses] = useState<Verse[]>([]);
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const book = BOOKS[bookIdx]!;
  const lang = VERSIONS.find((v) => v.id === version)!.lang;

  useEffect(() => {
    let alive = true;
    setStatus("loading");
    fetchChapter(bookIdx, chapter, version)
      .then((v) => { if (alive) { setVerses(v); setStatus("ok"); } })
      .catch(() => alive && setStatus("error"));
    return () => { alive = false; };
  }, [bookIdx, chapter, version]);

  useEffect(() => {
    if (status !== "ok" || !startVerse) return;
    const el = document.getElementById(`vers-${startVerse}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [status, startVerse, bookIdx, chapter]);

  const navigate = Route.useNavigate();
  const fullPlan = getPlan(plan ?? 180);
  const pos = today ? today.refs.findIndex((r) => BOOKS.indexOf(r.book) === bookIdx && r.chapter === chapter) : -1;
  const goTo = (bi: number, c: number) => { setBookIdx(bi); setChapter(c); window.scrollTo({ top: 0 }); };
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
    setBookIdx(b); setChapter(c); window.scrollTo({ top: 0 });
  };

  return (
    <Page kicker={today ? `Leitura do dia ${day} · Plano ${plan === 365 ? "1 ano" : `${plan ?? 180} dias`}` : "Palavra de Deus"} title="Bíblia">
      {today && (
        <div className="mb-4 rounded-xl border border-gold bg-card p-3">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gold">Leitura de hoje</p>
          <p className="mb-2 font-medium text-foreground">{today.label}</p>
          {pos >= 0 && <p className="mb-2 text-xs text-muted-foreground">Capítulo {pos + 1} de {today.refs.length} · toque em "Próximo" para seguir a ordem</p>}
          <div className="flex flex-wrap gap-1.5">
            {today.refs.map((r) => {
              const bi = BOOKS.indexOf(r.book), on = bi === bookIdx && r.chapter === chapter;
              return (
                <button key={`${bi}-${r.chapter}`} onClick={() => { setBookIdx(bi); setChapter(r.chapter); }} className={`rounded-lg border px-2.5 py-1 text-xs font-bold ${on ? "border-primary bg-primary text-primary-foreground" : "border-border bg-secondary text-foreground"}`}>
                  {r.book.pt} {r.chapter}
                </button>
              );
            })}
          </div>
        </div>
      )}
      <div className="mb-3 grid grid-cols-[minmax(0,1fr)_5rem] gap-2">
        <select className={sel} value={bookIdx} onChange={(e) => { setBookIdx(Number(e.target.value)); setChapter(1); }}>
          {BOOKS.map((b, i) => <option key={b.en} value={i}>{b.pt}</option>)}
        </select>
        <select className={sel} value={chapter} onChange={(e) => setChapter(Number(e.target.value))}>
          {Array.from({ length: book.ch }, (_, i) => <option key={i} value={i + 1}>{i + 1}</option>)}
        </select>
      </div>
      <div className="mb-3">
        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Versão</p>
        <div className="grid grid-cols-4 gap-1.5 rounded-xl border border-border bg-secondary p-1.5">
          {VERSIONS.map((v) => (
            <button key={v.id} onClick={() => setVersion(v.id)} className={`rounded-lg py-2 text-sm font-bold tracking-wide transition-colors ${version === v.id ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:bg-background"}`}>{v.label}</button>
          ))}
        </div>
      </div>
      <Speaker text={status === "ok" ? `${book.pt}, capítulo ${chapter}. ${verses.map((v) => v.text).join(" ")}` : ""} />

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
        {status === "error" && <p className="text-destructive">Não foi possível carregar este capítulo. Verifique sua conexão.</p>}
        {status === "ok" && (
          <div className="px-4 py-3 sm:px-5">
            {verses.map((v) => (
              <p key={v.verse} id={`vers-${v.verse}`} className={`grid grid-cols-[1.75rem_minmax(0,1fr)] gap-2 border-b border-border/50 py-3 last:border-b-0 ${startVerse && v.verse >= startVerse ? "rounded-lg bg-gold/15 px-2" : ""}`}>
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
