import { useState } from "react";
import { Megaphone, PlayCircle } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { usePublished, youtubeId, type Announcement, type Video } from "@/lib/content";

export function HomeFeed() {
  const avisos = usePublished<Announcement>("announcements", "created_at", false);
  const videos = usePublished<Video>("videos", "position", true);
  const [playing, setPlaying] = useState<Video | null>(null);
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
              <VideoWithToggle key={v.id} video={v} videoId={id} onPlay={() => setPlaying(v)} />
            );
          })}
        </section>
      )}

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

function VideoWithToggle({ video, videoId, onPlay }: { video: Video; videoId: string; onPlay: () => void }) {
  return (
    <div className="mb-4">
      <button
        type="button"
        onClick={onPlay}
        className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-2 text-left transition-colors hover:bg-secondary"
      >
        <span className="relative shrink-0">
          <img src={`https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`} alt="" loading="lazy" className="h-16 w-28 rounded-lg object-cover" />
          <PlayCircle className="absolute inset-0 m-auto h-7 w-7 text-primary-foreground drop-shadow" />
        </span>
        <span className="min-w-0">
          <span className="block font-semibold text-foreground">{video.title}</span>
          {video.description && <span className="line-clamp-2 block text-sm text-muted-foreground">{video.description}</span>}
          <span className="text-xs text-gold">Assistir aqui</span>
        </span>
      </button>
    </div>
  );
}
