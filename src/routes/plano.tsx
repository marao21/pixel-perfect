import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Circle, Headphones } from "lucide-react";
import { useState } from "react";
import { Page } from "@/components/Shell";
import { PLAN } from "@/lib/bible";
import { CURRENT_DAY, useStore } from "@/lib/store";

export const Route = createFileRoute("/plano")({
  head: () => ({
    meta: [
      { title: "Plano de Leitura 180 Dias — Os Mamutes" },
      { name: "description", content: "Cronograma completo para ler a Bíblia em 180 dias." },
      { property: "og:title", content: "Plano de Leitura 180 Dias — Os Mamutes" },
      { property: "og:description", content: "Cronograma completo para ler a Bíblia em 180 dias." },
    ],
  }),
  component: Plano,
});

const FILTERS = ["Todos", "Concluídos", "Pendentes"] as const;

function Plano() {
  const { done, toggle } = useStore();
  const [f, setF] = useState<(typeof FILTERS)[number]>("Todos");
  const list = PLAN.filter((d) => f === "Todos" || (f === "Concluídos" ? done.has(d.day) : !done.has(d.day)));

  return (
    <Page kicker={`${done.size}/180 concluídos`} title="Plano">
      <div className="sticky top-0 z-10 -mx-4 mb-4 flex gap-2 bg-background/95 px-4 py-2 backdrop-blur">
        {FILTERS.map((x) => (
          <button key={x} onClick={() => setF(x)} className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${f === x ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>{x}</button>
        ))}
      </div>
      <ul className="space-y-2">
        {list.map((d) => {
          const ok = done.has(d.day);
          return (
            <li key={d.day} className={`flex items-center gap-3 rounded-xl border bg-card p-3 ${d.day === CURRENT_DAY ? "border-gold" : "border-border"}`}>
              <button onClick={() => toggle(d.day)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-secondary font-display text-lg text-foreground">{d.day}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium text-foreground">{d.label}</span>
                  <span className="text-xs text-muted-foreground">{d.day === CURRENT_DAY ? "Hoje" : `${d.refs.length} capítulos`}</span>
                </span>
                {ok ? <CheckCircle2 className="h-6 w-6 shrink-0 text-success" /> : <Circle className="h-6 w-6 shrink-0 text-muted-foreground" />}
              </button>
              <Link to="/biblia" search={{ day: d.day }} aria-label="Ler" className="shrink-0 rounded-lg p-2 text-muted-foreground hover:text-primary"><Headphones className="h-5 w-5" /></Link>
            </li>
          );
        })}
      </ul>
    </Page>
  );
}
