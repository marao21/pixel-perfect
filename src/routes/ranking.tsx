import { createFileRoute } from "@tanstack/react-router";
import { Flame, Trophy } from "lucide-react";
import { Page } from "@/components/Shell";
import { usePlanLength } from "@/lib/plan-choice";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/ranking")({
  head: () => ({
    meta: [
      { title: "Ranking de Leitura — Os Mamutes" },
      { name: "description", content: "Acompanhe o progresso do grupo no desafio de leitura bíblica." },
    ],
  }),
  component: Ranking,
});

function Ranking() {
  const { profiles } = useStore();
  const [days] = usePlanLength();

  return (
    <Page kicker="Caminhamos juntos" title="Ranking">
      <section className="mb-4 rounded-2xl border border-gold/40 bg-hero p-4">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-gold"><Trophy className="h-4 w-4" /> Desafio de {days} dias</p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Cada dia de leitura conta. Continue firme e incentive os irmãos do grupo.</p>
      </section>
      <ol className="space-y-2">
        {profiles.map((profile, index) => {
          const progress = Math.min(100, Math.round((profile.done / days) * 100));
          return (
            <li key={profile.id} className={`rounded-xl border bg-card p-4 ${profile.id === "me" ? "border-gold" : "border-border"}`}>
              <div className="flex items-center gap-3">
                <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full font-display text-xl ${index < 3 ? "bg-gold/15 text-gold" : "bg-secondary text-muted-foreground"}`}>{index + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-foreground">{profile.name}</p>
                  <p className="text-xs text-muted-foreground">{profile.done} de {days} dias · {progress}%</p>
                </div>
                <span className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-gold"><Flame className="h-4 w-4" />{profile.streak}</span>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-secondary">
                <div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
              </div>
            </li>
          );
        })}
      </ol>
    </Page>
  );
}
