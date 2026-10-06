import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Page } from "@/components/Shell";
import { Speaker } from "@/components/Speaker";
import { DEVOTIONALS } from "@/lib/store";

export const Route = createFileRoute("/devocional")({
  head: () => ({
    meta: [
      { title: "Devocional Diário — Os Mamutes" },
      { name: "description", content: "Palavra diária sobre liderança, família e integridade para o homem cristão." },
      { property: "og:title", content: "Devocional Diário — Os Mamutes" },
      { property: "og:description", content: "Palavra diária para o homem cristão." },
    ],
  }),
  component: Devocional,
});

function Devocional() {
  const [day, setDay] = useState(DEVOTIONALS[0].day);
  const d = DEVOTIONALS.find((x) => x.day === day)!;
  return (
    <Page kicker="Palavra diária" title="Devocional">
      <div className="-mx-4 mb-5 flex gap-2 overflow-x-auto px-4 pb-1">
        {DEVOTIONALS.map((x) => (
          <button key={x.day} onClick={() => setDay(x.day)} className={`shrink-0 rounded-xl px-4 py-2 text-sm font-medium ${day === x.day ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>Dia {x.day}</button>
        ))}
      </div>
      <article className="rounded-2xl border border-border bg-card p-5">
        <h2 className="font-display text-3xl uppercase leading-tight text-foreground">{d.title}</h2>
        <blockquote className="my-4 border-l-2 border-gold pl-4 italic text-foreground">“{d.verse}”<footer className="mt-1 text-sm not-italic text-gold">{d.ref}</footer></blockquote>
        <Speaker lang="pt" text={`${d.title}. ${d.verse} ${d.ref}. ${d.body.join(" ")}`} />
        <div className="mt-4 space-y-3 leading-relaxed text-muted-foreground">{d.body.map((p, i) => <p key={i}>{p}</p>)}</div>
      </article>
    </Page>
  );
}
