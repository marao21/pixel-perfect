import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Page } from "@/components/Shell";
import { Speaker } from "@/components/Speaker";
import { getDevotionalForDay, TOTAL_DAYS } from "@/lib/devotionals";
import { CURRENT_DAY } from "@/lib/store";

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

const MESES = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];

function Devocional() {
  const [day, setDay] = useState(CURRENT_DAY);
  const d = getDevotionalForDay(day);
  const hoje = new Date();

  return (
    <Page kicker="Segunda a sábado" title="Devocional Diário">
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
          <span className="block font-display text-lg leading-none">{String(hoje.getDate()).padStart(2, "0")}</span>
          <span className="block text-[10px] font-semibold tracking-widest">{MESES[hoje.getMonth()]}</span>
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
        Dia {day} de {TOTAL_DAYS}
      </p>

      <article className="rounded-2xl border border-border bg-card p-5">
        <h2 className="font-display text-3xl leading-tight text-foreground">{d.title}</h2>

        <p className="mt-4 leading-relaxed text-muted-foreground">{d.verse}</p>
        <p className="mt-2 text-right text-sm font-semibold text-gold">{d.ref}</p>

        <div className="mt-4">
          <Speaker text={`${d.title}. ${d.verse} ${d.ref}. ${d.body.join(" ")}`} />
        </div>

        <div className="mt-5 space-y-4 leading-relaxed text-foreground/90">
          {d.body.map((p, i) => <p key={i}>{p}</p>)}
        </div>

        <p className="mt-6 text-sm italic text-muted-foreground">{d.author}</p>

        <blockquote className="mt-5 border-t border-border pt-4 text-sm italic leading-relaxed text-muted-foreground">
          “{d.quote}”
          <footer className="mt-1 not-italic">— {d.quoteAuthor}</footer>
        </blockquote>
      </article>
    </Page>
  );
}
