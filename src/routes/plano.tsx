import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Circle } from "lucide-react";
import { useState } from "react";
import { usePlanLength } from "@/lib/plan-choice";
import { Page } from "@/components/Shell";
import { PLAN_LENGTHS, getPlan } from "@/lib/bible";
import { CURRENT_DAY, useStore } from "@/lib/store";

export const Route = createFileRoute("/plano")({
  head: () => ({
    meta: [
      { title: "Plano de Leitura 90, 180 Dias ou 1 Ano — Os Mamutes" },
      {
        name: "description",
        content: "Cronograma completo para ler a Bíblia em 90 dias, 180 dias ou 1 ano.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { property: "og:title", content: "Plano de Leitura 90, 180 Dias ou 1 Ano — Os Mamutes" },
      {
        property: "og:description",
        content: "Cronograma completo para ler a Bíblia em 90 dias, 180 dias ou 1 ano.",
      },
    ],
  }),
  component: Plano,
});

const FILTERS = ["Todos", "Concluídos", "Pendentes"] as const;

function Plano() {
  const { done, toggle } = useStore();
  const [f, setF] = useState<(typeof FILTERS)[number]>("Todos");
  const [len, pick] = usePlanLength();
  const PLAN = getPlan(len);
  const list = PLAN.filter(
    (d) => f === "Todos" || (f === "Concluídos" ? done.has(d.day) : !done.has(d.day)),
  );

  return (
    <Page kicker={`${done.size}/${len} concluídos`} title="Plano">
      <div className="mb-3 grid grid-cols-3 gap-1.5 rounded-xl border border-border bg-secondary p-1.5">
        {PLAN_LENGTHS.map((p) => (
          <button
            key={p.id}
            onClick={() => pick(p.id)}
            className={`rounded-lg py-2 text-sm font-bold transition-colors ${len === p.id ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground"}`}
          >
            {p.label}
          </button>
        ))}
      </div>
      <div className="sticky top-20 z-10 -mx-4 mb-4 flex gap-2 bg-background/95 px-4 py-2 backdrop-blur">
        {FILTERS.map((x) => (
          <button
            key={x}
            onClick={() => setF(x)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${f === x ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}
          >
            {x}
          </button>
        ))}
      </div>
      <ul className="space-y-2">
        {list.map((d) => {
          const ok = done.has(d.day);
          return (
            <li
              key={d.day}
              className={`flex items-center gap-3 rounded-xl border bg-card p-3 ${d.day === CURRENT_DAY ? "border-gold" : "border-border"}`}
            >
              <Link
                to="/biblia"
                search={{ day: d.day, plan: len }}
                className="flex min-w-0 flex-1 items-center gap-3 text-left"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-secondary font-display text-lg text-foreground">
                  {d.day}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-medium text-foreground">{d.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {d.day === CURRENT_DAY ? "Hoje" : `${d.refs.length} capítulos`}
                  </span>
                </span>
              </Link>
              <button
                onClick={() => toggle(d.day)}
                aria-label={ok ? "Desmarcar" : "Marcar como lido"}
                className="shrink-0 rounded-lg p-1"
              >
                {ok ? (
                  <CheckCircle2 className="h-6 w-6 text-success" />
                ) : (
                  <Circle className="h-6 w-6 text-muted-foreground" />
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </Page>
  );
}
