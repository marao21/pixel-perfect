import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronRight, Megaphone, PlayCircle, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { usePublished, youtubeId, type Announcement, type Video } from "@/lib/content";
import { SYSTEM_TABS } from "@/lib/system-pages";
import { BOOKS } from "@/lib/bible";

const DISMISS_KEY = "mamutes-avisos-fechados";
// Assinatura muda se o líder editar o aviso, então ele volta a aparecer.
function sig(a: Announcement) {
  const s = `${a.id}|${a.title}|${a.body ?? ""}|${a.link_url ?? ""}|${(a as { updated_at?: string }).updated_at ?? ""}`;
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return `${a.id}:${h}`;
}

export function Avisos() {
  const avisos = usePublished<Announcement>("announcements", "created_at", false);
  const [closed, setClosed] = useState<string[] | null>(null);
  useEffect(() => {
    try {
      setClosed(JSON.parse(localStorage.getItem(DISMISS_KEY) ?? "[]"));
    } catch {
      setClosed([]);
    }
  }, []);
  if (closed === null) return null;
  const visible = avisos.filter((a) => !closed.includes(sig(a)));
  if (visible.length === 0) return null;
  const dismiss = (a: Announcement) => {
    const next = [...closed, sig(a)];
    setClosed(next);
    localStorage.setItem(DISMISS_KEY, JSON.stringify(next));
  };
  return (
    <section className="mb-4 space-y-2">
      <h3 className="flex items-center gap-2 font-display text-lg uppercase text-foreground">
        <Megaphone className="h-5 w-5 text-gold" /> Avisos
      </h3>
      {visible.map((a) => (
        <article
          key={a.id}
          className="relative rounded-xl border border-gold/60 bg-gold/15 p-3 pr-11 shadow-elevated"
        >
          <div className="avisos-blink">
            <p className="font-semibold text-foreground">{a.title}</p>
            {a.body && (
              <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">{a.body}</p>
            )}
            {a.link_url && <AvisoLink url={a.link_url} />}
          </div>
          <button
            onClick={() => dismiss(a)}
            aria-label="Fechar aviso"
            className="absolute right-2 top-2 rounded-full p-1.5 text-foreground hover:bg-muted"
          >
            <X className="h-5 w-5" />
          </button>
        </article>
      ))}
    </section>
  );
}

export function HomeFeed() {
  const videos = usePublished<Video>("videos", "position", true);
  const [playing, setPlaying] = useState<Video | null>(null);
  const playingId = playing ? youtubeId(playing.youtube_url) : null;

  return (
    <>
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
          <DialogTitle className="font-display text-lg uppercase text-foreground">
            {playing?.title}
          </DialogTitle>
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
          {playing?.description && (
            <p className="text-sm text-muted-foreground">{playing.description}</p>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function AvisoLink({ url }: { url: string }) {
  const clean = url.trim();
  if (!clean) return null;
  const [target, query = ""] = clean.split("?");
  const params = new URLSearchParams(query);
  const cls = "mt-1.5 inline-flex items-center gap-1 text-sm font-semibold text-primary";
  const tab = SYSTEM_TABS.find((t) => t.path === target);
  if (tab) {
    return (
      <Link to={tab.path} className={cls}>
        Abrir <ChevronRight className="h-4 w-4" />
      </Link>
    );
  }
  const page = target.match(/^\/p\/([^/?#]+)$/);
  if (page?.[1]) {
    let slug = page[1];
    try {
      slug = decodeURIComponent(slug);
    } catch {
      /* keep raw slug */
    }
    return (
      <Link to="/p/$slug" params={{ slug }} className={cls}>
        Abrir <ChevronRight className="h-4 w-4" />
      </Link>
    );
  }
  if (target === "/biblia") {
    const b = Number(params.get("b"));
    const c = Number(params.get("c") ?? 1);
    if (Number.isInteger(b) && b >= 0 && b < BOOKS.length && c >= 1 && c <= BOOKS[b]!.ch) {
      return (
        <Link to="/biblia" search={{ b, c }} className={cls}>
          Abrir {BOOKS[b]!.pt} {c} <ChevronRight className="h-4 w-4" />
        </Link>
      );
    }
    return (
      <Link to="/biblia" className={cls}>
        Abrir <ChevronRight className="h-4 w-4" />
      </Link>
    );
  }
  if (/^https?:\/\//i.test(clean)) {
    return (
      <a href={clean} target="_blank" rel="noopener noreferrer" className={cls}>
        Abrir <ChevronRight className="h-4 w-4" />
      </a>
    );
  }
  return null;
}

function VideoWithToggle({
  video,
  videoId,
  onPlay,
}: {
  video: Video;
  videoId: string;
  onPlay: () => void;
}) {
  return (
    <div className="mb-4">
      <button
        type="button"
        onClick={onPlay}
        className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-2 text-left transition-colors hover:bg-secondary"
      >
        <span className="relative shrink-0">
          <img
            src={`https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`}
            alt=""
            loading="lazy"
            className="h-16 w-28 rounded-lg object-cover"
          />
          <PlayCircle className="absolute inset-0 m-auto h-7 w-7 text-primary-foreground drop-shadow" />
        </span>
        <span className="min-w-0">
          <span className="block font-semibold text-foreground">{video.title}</span>
          {video.description && (
            <span className="line-clamp-2 block text-sm text-muted-foreground">
              {video.description}
            </span>
          )}
          <span className="text-xs text-gold">Assistir aqui</span>
        </span>
      </button>
    </div>
  );
}
