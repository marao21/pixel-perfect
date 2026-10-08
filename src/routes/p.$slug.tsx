import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Page } from "@/components/Shell";
import { db, youtubeId, pageVideos, type CustomPage } from "@/lib/content";

export const Route = createFileRoute("/p/$slug")({
  head: () => ({
    meta: [
      { title: "Página — Os Mamutes" },
      { name: "description", content: "Conteúdo especial do grupo Os Mamutes." },
      { property: "og:title", content: "Página — Os Mamutes" },
      { property: "og:description", content: "Conteúdo especial do grupo Os Mamutes." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CustomPageView,
});

function CustomPageView() {
  const { slug } = Route.useParams();
  const [page, setPage] = useState<CustomPage | null | undefined>(undefined);
  useEffect(() => {
    setPage(undefined);
    db.from("custom_pages").select("*").eq("slug", slug).maybeSingle().then(({ data }: { data: CustomPage | null }) => setPage(data));
  }, [slug]);
  const vids = page ? pageVideos(page).map((v) => ({ ...v, id: youtubeId(v.url) })).filter((v): v is typeof v & { id: string } => !!v.id) : [];

  return (
    <>
      <Page title={page?.title ?? ""}>
        {page === undefined && <p className="text-sm text-muted-foreground">Carregando…</p>}
        {page === null && (
          <div className="rounded-2xl border border-border bg-card p-6 text-center">
            <p className="text-foreground">Página não encontrada.</p>
            <Link to="/" className="mt-2 inline-block text-sm font-semibold text-primary">Voltar ao início</Link>
          </div>
        )}
        {page && (
          <article className="space-y-4">
            <h1 className="font-display text-3xl uppercase text-foreground">{page.title}</h1>
            {vids.map((v, i) => (
              <VideoSection
                key={`${v.id}-${i}`}
                videoId={v.id}
                title={v.title}
                text={v.text}
                index={i}
                pageTitle={page.title}
              />
            ))}
            {page.body && (
              <div className="rounded-2xl border border-border bg-card p-5 font-serif-read text-[17px] leading-relaxed text-foreground whitespace-pre-line">
                {page.body}
              </div>
            )}
          </article>
        )}
      </Page>
    </>
  );
}

function VideoSection({ videoId, title, text, index, pageTitle }: { videoId: string; title: string; text: string; index: number; pageTitle: string }) {
  const [showText, setShowText] = useState(false);
  return (
    <section className="space-y-2">
      {title && <h2 className="font-display text-xl uppercase text-foreground">{title}</h2>}
      <div className="aspect-video overflow-hidden rounded-2xl border border-border bg-card">
        <iframe className="h-full w-full" src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0`} title={title || `${pageTitle} — vídeo ${index + 1}`} loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
      </div>
      {text && (
        <div>
          <button
            type="button"
            onClick={() => setShowText((s) => !s)}
            className="w-full rounded-xl border border-border bg-card px-4 py-3 text-left font-semibold text-foreground transition-colors hover:bg-secondary"
          >
            {showText ? "Ocultar texto" : "Mostrar texto"}
          </button>
          {showText && (
            <div className="mt-2 rounded-2xl border border-border bg-card p-4 font-serif-read text-[16px] leading-relaxed text-foreground whitespace-pre-line">
              {text}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
