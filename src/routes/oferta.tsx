import { createFileRoute } from "@tanstack/react-router";
import { Page } from "@/components/Shell";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/oferta")({
  head: () => ({
    meta: [
      { title: "Ranking — Os Mamutes" },
      { name: "description", content: "Quem está mais constante no desafio de 180 dias." },
      { property: "og:title", content: "Ranking — Os Mamutes" },
      { property: "og:description", content: "Quem está mais constante no desafio de 180 dias." },
    ],
  }),
  component: Ranking,
});

const MEDALS = ["🥇", "🥈", "🥉"];

function Ranking() {
  const { profiles } = useStore();
  return (
    <Page kicker="Mamutes de elite 🦣" title="Ranking">
      <ol className="space-y-2">
        {profiles.map((p, i) => (
          <li key={p.id} className={`grid grid-cols-[2.5rem_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border p-3 ${i < 3 ? "border-gold bg-hero" : "border-border bg-card"} ${p.id === "me" ? "ring-1 ring-primary" : ""}`}>
            <span className="text-center font-display text-2xl text-foreground">{i < 3 ? MEDALS[i] : i + 1}</span>
            <span className="min-w-0">
              <span className="block truncate font-semibold text-foreground">{p.name}</span>
              <span className="text-xs text-muted-foreground">🔥 {p.streak} dias seguidos</span>
            </span>
            <span className="text-right">
              <span className="block font-display text-2xl leading-none text-foreground">{p.done}</span>
              <span className="text-[10px] uppercase text-muted-foreground">dias</span>
            </span>
          </li>
        ))}
      </ol>
    </Page>
  );
}
