import { Megaphone, PlayCircle } from "lucide-react";
import { usePublished, youtubeId, type Announcement, type Video } from "@/lib/content";

export function HomeFeed() {
  const avisos = usePublished<Announcement>("announcements", "created_at", false);
  const videos = usePublished<Video>("videos", "position", true);

  return (
    <>
      {avisos.length > 0 && (
        <section className="mt-6 space-y-2">
          <h3 className="flex items-center gap-2 font-display text-lg uppercase text-foreground">
            <Megaphone className="h-5 w-5 text-gold" /> Avisos
          </h3>
          {avisos.map((a) => (
            <article key={a.id} className="rounded-xl border border-gold/40 bg-gold/10 p-3">
              <p className="font-semibold text-foreground">{a.title}</p>
              {a.body && <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">{a.body}</p>}
            </article>
          ))}
        </section>
      )}
      {videos.length > 0 && (
        <section className="mt-6 space-y-3">
          <h3 className="flex items-center gap-2 font-display text-lg uppercase text-foreground">
            <PlayCircle className="h-5 w-5 text-primary" /> Vídeos
          </h3>
          {videos.map((v) => {
            const id = youtubeId(v.youtube_url);
            if (!id) return null;
            return (
              <a key={v.id} href={v.youtube_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-xl border border-border bg-card p-2 transition-colors hover:bg-secondary">
                <span className="relative shrink-0">
                  <img src={`https://i.ytimg.com/vi/${id}/mqdefault.jpg`} alt="" loading="lazy" className="h-16 w-28 rounded-lg object-cover" />
                  <PlayCircle className="absolute inset-0 m-auto h-7 w-7 text-primary-foreground drop-shadow" />
                </span>
                <span className="min-w-0">
                  <span className="block font-semibold text-foreground">{v.title}</span>
                  {v.description && <span className="line-clamp-2 block text-sm text-muted-foreground">{v.description}</span>}
                  <span className="text-xs text-gold">Abrir no YouTube</span>
                </span>
              </a>
            );
          })}
        </section>
      )}
    </>
  );
}
