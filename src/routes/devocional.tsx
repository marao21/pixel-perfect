import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Page } from "@/components/Shell";
import { getDevotionalForDay, TOTAL_DAYS } from "@/lib/devotionals";
import { useDevotionalOverride } from "@/lib/content";

export const Route = createFileRoute("/devocional")({
  head: () => ({
    meta: [
      { title: "Devocional Diário — Os Mamutes" },
      {
        name: "description",
        content:
          "Palavra diária sobre liderança, família e integridade para o homem cristão — um devocional diferente para cada dia do ano.",
      },
      { property: "og:title", content: "Devocional Diário — Os Mamutes" },
      {
        property: "og:description",
        content: "Um devocional diferente para cada um dos 365 dias do ano.",
      },
    ],
  }),
  component: Devocional,
});

const MESES = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];
const SEMANAS = [
  "DOMINGO",
  "SEGUNDA-FEIRA",
  "TERÇA-FEIRA",
  "QUARTA-FEIRA",
  "QUINTA-FEIRA",
  "SEXTA-FEIRA",
  "SÁBADO",
];

/** Dia do ano (1-365) a partir de uma data. */
function diaDoAno(data: Date): number {
  const inicio = new Date(data.getFullYear(), 0, 1);
  return Math.floor((data.getTime() - inicio.getTime()) / 86400000) + 1;
}

/** Data (no ano corrente) correspondente ao dia do ano informado. */
function dataDoDia(day: number): Date {
  return new Date(new Date().getFullYear(), 0, day);
}

function Devocional() {
  const [day, setDay] = useState(() => Math.min(TOTAL_DAYS, Math.max(1, diaDoAno(new Date()))));
  const d = useDevotionalOverride(day, getDevotionalForDay(day));
  const data = dataDoDia(day);

  return (
    <Page kicker="Todos os dias do ano" title="Devocional Diário">
      {/* Data + navegação entre dias */}
      <div className="mb-5 flex items-center justify-between">
        <button
          onClick={() => setDay((v) => Math.max(1, v - 1))}
          disabled={day <= 1}
          className="grid h-9 w-9 place-items-center rounded-lg border border-border text-muted-foreground disabled:opacity-40"
          aria-label="Dia anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="rounded-lg bg-primary px-3 py-1.5 text-center leading-tight text-primary-foreground">
          <span className="block font-display text-lg leading-none">
            {String(data.getDate()).padStart(2, "0")}
          </span>
          <span className="block text-xs font-semibold tracking-widest">
            {MESES[data.getMonth()]}
          </span>
        </div>
        <button
          onClick={() => setDay((v) => Math.min(TOTAL_DAYS, v + 1))}
          disabled={day >= TOTAL_DAYS}
          className="grid h-9 w-9 place-items-center rounded-lg border border-border text-muted-foreground disabled:opacity-40"
          aria-label="Próximo dia"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <p className="mb-3 text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {SEMANAS[data.getDay()]} · {String(data.getDate()).padStart(2, "0")}/
        {String(data.getMonth() + 1).padStart(2, "0")} · Dia {day} de {TOTAL_DAYS}
      </p>

      <article className="rounded-2xl border border-border bg-card p-5">
        <h2 className="font-display text-3xl leading-tight text-foreground">{d.title}</h2>

        <p className="mt-4 leading-relaxed text-muted-foreground">{d.verse}</p>
        <p className="mt-2 text-right text-sm font-semibold text-gold">{d.ref}</p>

        <div className="mt-5 space-y-4 leading-relaxed text-foreground/90">
          {d.body.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        <p className="mt-6 text-sm italic text-muted-foreground">{d.author}</p>

        <blockquote className="mt-5 border-t border-border pt-4 text-sm italic leading-relaxed text-muted-foreground">
          “{d.quote}”<footer className="mt-1 not-italic">— {d.quoteAuthor}</footer>
        </blockquote>
      </article>
    </Page>
  );
}
