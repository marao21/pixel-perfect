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
              <article key={v.id} className="overflow-hidden rounded-xl border border-border bg-card">
                <div className="aspect-video">
                  <iframe
                    className="h-full w-full"
                    src={`https://www.youtube-nocookie.com/embed/${id}`}
                    title={v.title}
                    loading="lazy"
                    allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <div className="p-3">
                  <p className="font-semibold text-foreground">{v.title}</p>
                  {v.description && <p className="mt-1 text-sm text-muted-foreground">{v.description}</p>}
                </div>
              </article>
            );
          })}
        </section>
      )}
    </>
  );
}
