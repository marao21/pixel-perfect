import { useState } from "react";
import { Megaphone, PlayCircle } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { usePublished, youtubeId, type Announcement, type Video } from "@/lib/content";

export function HomeFeed() {
  const avisos = usePublished<Announcement>("announcements", "created_at", false);
  const videos = usePublished<Video>("videos", "position", true);
  const [playing, setPlaying] = useState<Video | null>(null);
  const [showReading, setShowReading] = useState(false);
  const playingId = playing ? youtubeId(playing.youtube_url) : null;

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
              <button
                key={v.id}
                type="button"
                onClick={() => setPlaying(v)}
                className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-2 text-left transition-colors hover:bg-secondary"
              >
                <span className="relative shrink-0">
                  <img src={`https://i.ytimg.com/vi/${id}/mqdefault.jpg`} alt="" loading="lazy" className="h-16 w-28 rounded-lg object-cover" />
                  <PlayCircle className="absolute inset-0 m-auto h-7 w-7 text-primary-foreground drop-shadow" />
                </span>
                <span className="min-w-0">
                  <span className="block font-semibold text-foreground">{v.title}</span>
                  {v.description && <span className="line-clamp-2 block text-sm text-muted-foreground">{v.description}</span>}
                  <span className="text-xs text-gold">Assistir aqui</span>
                </span>
              </button>
            );
          })}
        </section>
      )}

      <div className="mt-6">
        <button
          type="button"
          onClick={() => setShowReading((prev) => !prev)}
          className="flex w-full items-center justify-between rounded-xl border border-border bg-card px-4 py-3 text-left font-display uppercase tracking-wide text-foreground shadow-sm transition-colors hover:bg-secondary"
        >
          <span>Campo de Leitura</span>
          <span className="text-xs font-sans font-semibold text-gold">
            {showReading ? "Ocultar" : "Aperte para ver"}
          </span>
        </button>
        {showReading && (
          <div className="mt-2 rounded-xl border border-border bg-card p-4 text-sm text-foreground animate-fadeIn">
            <p className="leading-relaxed">Aqui está o campo para leitura disponível para meditação e acompanhamento do desafio. Clique novamente no botão acima para ocultá-lo.</p>
          </div>
        )}
      </div>

      <Dialog open={!!playing} onOpenChange={(open) => !open && setPlaying(null)}>
        <DialogContent className="max-w-3xl border-border bg-card p-3 sm:p-4">
          <DialogTitle className="font-display text-lg uppercase text-foreground">{playing?.title}</DialogTitle>
          {playingId && (
            <div className="aspect-video w-full overflow-hidden rounded-lg">
              <iframe
                key={playingId}
                src={`https://www.youtube-nocookie.com/embed/${playingId}?autoplay=1&rel=0`}
                title={playing?.title ?? "Vídeo"}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
              />
            </div>
          )}
          {playing?.description && <p className="text-sm text-muted-foreground">{playing.description}</p>}
        </DialogContent>
      </Dialog>
    </>
  );
}
