import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Page } from "@/components/Shell";
import { db, youtubeId, type CustomPage } from "@/lib/content";

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
  const urls = page ? (page.youtube_urls?.length ? page.youtube_urls : page.youtube_url ? [page.youtube_url] : []) : [];
  const vids = Array.from(new Set(urls.map((u) => youtubeId(u)).filter((x): x is string => !!x)));

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
            {vids.map((vid, i) => (
              <div key={vid} className="aspect-video overflow-hidden rounded-2xl border border-border bg-card">
                <iframe className="h-full w-full" src={`https://www.youtube-nocookie.com/embed/${vid}?rel=0`} title={`${page.title} — vídeo ${i + 1}`} loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
              </div>
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
