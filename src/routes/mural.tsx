import { createFileRoute } from "@tanstack/react-router";
import { MessageCircle, Send } from "lucide-react";
import { useState } from "react";
import { Page } from "@/components/Shell";
import { useStore, type Post } from "@/lib/store";

export const Route = createFileRoute("/mural")({
  head: () => ({
    meta: [
      { title: "Mural — Os Mamutes" },
      { name: "description", content: "Versículos, insights e pedidos de oração do grupo." },
      { property: "og:title", content: "Mural — Os Mamutes" },
      { property: "og:description", content: "Versículos, insights e pedidos de oração do grupo." },
    ],
  }),
  component: Mural,
});

function Mural() {
  const { posts, addPost } = useStore();
  const [t, setT] = useState("");
  return (
    <Page kicker="Comunidade" title="Mural">
      <form onSubmit={(e) => { e.preventDefault(); if (t.trim()) { addPost(t.trim()); setT(""); } }} className="mb-5 rounded-2xl border border-border bg-card p-3">
        <textarea value={t} onChange={(e) => setT(e.target.value)} rows={3} placeholder="Compartilhe um versículo, insight ou pedido de oração…" className="w-full resize-none bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none" />
        <div className="flex justify-end"><button className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground disabled:opacity-50" disabled={!t.trim()}>Publicar</button></div>
      </form>
      <ul className="space-y-3">{posts.map((p) => <PostCard key={p.id} p={p} />)}</ul>
    </Page>
  );
}

function PostCard({ p }: { p: Post }) {
  const { like, comment } = useStore();
  const [open, setOpen] = useState(false);
  const [c, setC] = useState("");
  return (
    <li className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-secondary font-bold text-gold">{p.author[0]}</span>
        <div className="min-w-0"><p className="truncate font-semibold text-foreground">{p.author}</p><p className="text-xs text-muted-foreground">{p.createdAt}</p></div>
      </div>
      <p className="mt-3 whitespace-pre-wrap text-foreground">{p.text}</p>
      <div className="mt-3 flex gap-4 text-sm">
        <button onClick={() => like(p.id)} className={`flex items-center gap-1 ${p.liked ? "text-gold" : "text-muted-foreground"}`}><span className={p.liked ? "animate-pop" : ""}>🔥</span> {p.likes}</button>
        <button onClick={() => setOpen(!open)} className="flex items-center gap-1 text-muted-foreground"><MessageCircle className="h-4 w-4" /> {p.comments.length}</button>
      </div>
      {open && (
        <div className="mt-3 space-y-2 border-t border-border pt-3">
          {p.comments.map((x, i) => <p key={i} className="text-sm text-muted-foreground"><span className="font-semibold text-foreground">{x.author}</span> {x.text}</p>)}
          <form onSubmit={(e) => { e.preventDefault(); if (c.trim()) { comment(p.id, c.trim()); setC(""); } }} className="flex gap-2">
            <input value={c} onChange={(e) => setC(e.target.value)} placeholder="Comentar…" className="min-w-0 flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground" />
            <button className="rounded-lg bg-primary px-3 text-primary-foreground" aria-label="Enviar"><Send className="h-4 w-4" /></button>
          </form>
        </div>
      )}
    </li>
  );
}
