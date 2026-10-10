import { usePecadoDays, useTexts } from "@/lib/overrides";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Circle, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Page } from "@/components/Shell";

export const Route = createFileRoute("/pecado")({
  head: () => ({
    meta: [
      { title: "Pecado, Aqui Não! — 21 Dias em Romanos | Os Mamutes" },
      {
        name: "description",
        content: "21 dias de oração, leitura da Palavra e testemunho no livro de Romanos.",
      },
      { property: "og:title", content: "Pecado, Aqui Não! — 21 Dias em Romanos" },
      {
        property: "og:description",
        content: "21 dias de oração, leitura da Palavra e testemunho no livro de Romanos.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Pecado,
});

const ROMANOS = 44;
const KEY = "mamutes-pecado";

function Pecado() {
  const [done, setDone] = useState<number[]>([]);
  useEffect(() => {
    try {
      setDone(JSON.parse(localStorage.getItem(KEY) ?? "[]"));
    } catch {
      /* ignore */
    }
  }, []);
  const toggle = (d: number) => {
    const n = done.includes(d) ? done.filter((x) => x !== d) : [...done, d];
    setDone(n);
    localStorage.setItem(KEY, JSON.stringify(n));
  };
  const DAYS = usePecadoDays();
  const tx = useTexts();
  const pct = Math.round((done.length / DAYS.length) * 100);

  return (
    <Page kicker={tx("pecado_kicker")} title={tx("pecado_title")}>
      <section className="mb-4 rounded-2xl border border-gold bg-hero p-4 text-center">
        <p className="font-semibold uppercase tracking-wide text-foreground">
          {tx("pecado_headline")}
        </p>
        <p className="mt-1 text-sm font-bold uppercase text-gold">{tx("pecado_sub")}</p>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{done.length} de {DAYS.length} dias concluídos</p>
      </section>
      <ul className="space-y-2">
        {DAYS.map(({ ref, chapter: ch, tema, verse: v }, i) => {
          const d = i + 1,
            ok = done.includes(d);
          return (
            <li
              key={d}
              className={`flex items-center gap-3 rounded-xl border bg-card p-3 ${ok ? "border-success" : "border-border"}`}
            >
              <button
                onClick={() => toggle(d)}
                aria-label={ok ? "Desmarcar dia" : "Marcar dia como feito"}
                className="shrink-0"
              >
                {ok ? (
                  <CheckCircle2 className="h-7 w-7 text-success" />
                ) : (
                  <Circle className="h-7 w-7 text-muted-foreground" />
                )}
              </button>
              <Link
                to="/biblia"
                search={{ b: ROMANOS, c: ch, v }}
                className="flex min-w-0 flex-1 items-center gap-2"
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-bold uppercase text-gold">
                    Dia {d} · {ref}
                  </span>
                  <span className="block text-sm font-medium uppercase text-foreground">
                    {tema}
                  </span>
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </Link>
            </li>
          );
        })}
      </ul>
      <p className="mt-6 text-center text-xs font-bold uppercase tracking-[0.25em] text-gold">
        {tx("pecado_footer")}
      </p>
    </Page>
  );
}
