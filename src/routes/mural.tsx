import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Heart, MessageCircle, Send } from "lucide-react";
import { Page } from "@/components/Shell";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/mural")({
  head: () => ({
    meta: [
      { title: "Mural do Grupo — Os Mamutes" },
      { name: "description", content: "Compartilhe mensagens, pedidos de oração e palavras de incentivo." },
    ],
  }),
  component: Mural,
});

function Mural() {
  const { posts, addPost, like, comment } = useStore();
  const [newPost, setNewPost] = useState("");
  const [replies, setReplies] = useState<Record<string, string>>({});

  const publish = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = newPost.trim();
    if (!text) return;
    addPost(text);
    setNewPost("");
  };

  const publishComment = (event: FormEvent<HTMLFormElement>, postId: string) => {
    event.preventDefault();
    const text = replies[postId]?.trim();
    if (!text) return;
    comment(postId, text);
    setReplies((current) => ({ ...current, [postId]: "" }));
  };

  return (
    <Page kicker="Compartilhe com os irmãos" title="Mural">
      <form onSubmit={publish} className="mb-4 rounded-2xl border border-border bg-card p-4">
        <label htmlFor="mural-post" className="mb-2 block text-sm font-semibold text-foreground">Escreva uma mensagem</label>
        <textarea id="mural-post" value={newPost} onChange={(event) => setNewPost(event.target.value)} maxLength={500} rows={3} placeholder="Uma palavra, testemunho ou pedido de oração…" className="w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground" />
        <div className="mt-2 flex items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground">{newPost.length}/500</span>
          <button type="submit" disabled={!newPost.trim()} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-50"><Send className="h-4 w-4" /> Publicar</button>
        </div>
      </form>

      <div className="space-y-3">
        {posts.map((post) => (
          <article key={post.id} className="rounded-2xl border border-border bg-card p-4">
            <header className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold text-foreground">{post.author}</h2>
                <p className="text-xs text-muted-foreground">{post.createdAt}</p>
              </div>
              <button type="button" onClick={() => like(post.id)} aria-pressed={post.liked} aria-label={post.liked ? "Remover curtida" : "Curtir publicação"} className={`inline-flex min-h-10 items-center gap-1 rounded-lg px-2 text-sm ${post.liked ? "text-gold" : "text-muted-foreground"}`}><Heart className={`h-4 w-4 ${post.liked ? "fill-current" : ""}`} /> {post.likes}</button>
            </header>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">{post.text}</p>
            {post.comments.length > 0 && (
              <div className="mt-3 space-y-2 border-l-2 border-primary/40 pl-3">
                {post.comments.map((item, index) => <p key={`${post.id}-${index}`} className="text-sm text-muted-foreground"><span className="font-semibold text-foreground">{item.author}:</span> {item.text}</p>)}
              </div>
            )}
            <form onSubmit={(event) => publishComment(event, post.id)} className="mt-3 flex gap-2">
              <label className="sr-only" htmlFor={`comment-${post.id}`}>Escreva um comentário</label>
              <input id={`comment-${post.id}`} value={replies[post.id] ?? ""} onChange={(event) => setReplies((current) => ({ ...current, [post.id]: event.target.value }))} maxLength={240} placeholder="Escreva um comentário…" className="min-w-0 flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground" />
              <button type="submit" disabled={!replies[post.id]?.trim()} aria-label="Enviar comentário" className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-border text-primary disabled:opacity-50"><MessageCircle className="h-4 w-4" /></button>
            </form>
          </article>
        ))}
      </div>
    </Page>
  );
}
