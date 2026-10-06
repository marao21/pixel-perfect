import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Circle, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Page } from "@/components/Shell";

export const Route = createFileRoute("/pecado")({
  head: () => ({
    meta: [
      { title: "Pecado, Aqui Não! — 21 Dias em Romanos | Os Mamutes" },
      { name: "description", content: "21 dias de oração, leitura da Palavra e testemunho no livro de Romanos." },
      { property: "og:title", content: "Pecado, Aqui Não! — 21 Dias em Romanos" },
      { property: "og:description", content: "21 dias de oração, leitura da Palavra e testemunho no livro de Romanos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Pecado,
});

const ROMANOS = 44;
const DAYS: [string, number, string][] = [
  ["Romanos 1:14-17", 1, "Não me envergonho do Evangelho"],
  ["Romanos 1:28-32", 1, "Desprezaram o conhecimento de Deus"],
  ["Romanos 2:1-11", 2, "Em Deus não há parcialidade"],
  ["Romanos 2:17-24", 2, "O nome de Deus é blasfemado..."],
  ["Romanos 3:9-20", 3, "Ninguém é justo"],
  ["Romanos 3:21-26", 3, "Todos pecaram"],
  ["Romanos 4:1-8", 4, "Feliz quem tem pecados perdoados"],
  ["Romanos 4:18-25", 4, "A promessa recebida pela fé"],
  ["Romanos 5:1-11", 5, "Os frutos da paz de Deus"],
  ["Romanos 5:12-21", 5, "Morte em Adão, vida em Cristo"],
  ["Romanos 6:1-14", 6, "Mortos para o pecado, vivos para Deus"],
  ["Romanos 6:15-23", 6, "O salário do pecado é a morte"],
  ["Romanos 7:1-6", 7, "O casamento e a lei"],
  ["Romanos 7:12-20", 7, "A luta contra o pecado"],
  ["Romanos 8:1-17", 8, "Vida controlada pelo Espírito"],
  ["Romanos 8:18-27", 8, "A glória futura"],
  ["Romanos 8:28-39", 8, "Mais que vencedores"],
  ["Romanos 9:14-21", 9, "A escolha soberana de Deus"],
  ["Romanos 10:1-11", 10, "Quem nele confia não se envergonha"],
  ["Romanos 11:33-36", 11, "A Ele seja a glória para sempre"],
  ["Romanos 12:1-2 / 9-21", 12, "Vença o mal com o bem"],
];
const KEY = "mamutes-pecado";

function Pecado() {
  const [done, setDone] = useState<number[]>([]);
  useEffect(() => { try { setDone(JSON.parse(localStorage.getItem(KEY) ?? "[]")); } catch { /* ignore */ } }, []);
  const toggle = (d: number) => {
    const n = done.includes(d) ? done.filter((x) => x !== d) : [...done, d];
    setDone(n); localStorage.setItem(KEY, JSON.stringify(n));
  };
  const pct = Math.round((done.length / DAYS.length) * 100);

  return (
    <Page kicker="2ª temporada · Romanos" title="Pecado, aqui não!">
      <section className="mb-4 rounded-2xl border border-gold bg-hero p-4 text-center">
        <p className="font-semibold uppercase tracking-wide text-foreground">21 dias de oração, leitura da Palavra e testemunho</p>
        <p className="mt-1 text-sm font-bold uppercase text-gold">Debulhando o livro de Romanos</p>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{done.length} de 21 dias concluídos</p>
      </section>
      <ul className="space-y-2">
        {DAYS.map(([ref, ch, tema], i) => {
          const d = i + 1, ok = done.includes(d);
          return (
            <li key={d} className={`flex items-center gap-3 rounded-xl border bg-card p-3 ${ok ? "border-success" : "border-border"}`}>
              <button onClick={() => toggle(d)} aria-label={ok ? "Desmarcar dia" : "Marcar dia como feito"} className="shrink-0">
                {ok ? <CheckCircle2 className="h-7 w-7 text-success" /> : <Circle className="h-7 w-7 text-muted-foreground" />}
              </button>
              <Link to="/biblia" search={{ b: ROMANOS, c: ch }} className="flex min-w-0 flex-1 items-center gap-2">
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-bold uppercase text-gold">Dia {d} · {ref}</span>
                  <span className="block text-sm font-medium uppercase text-foreground">{tema}</span>
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </Link>
            </li>
          );
        })}
      </ul>
      <p className="mt-6 text-center text-xs font-bold uppercase tracking-[0.25em] text-gold">Ore • Leia • Reflita • Pratique • Testemunhe</p>
    </Page>
  );
}
