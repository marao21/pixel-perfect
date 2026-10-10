import { usePlanRaw, useTexts } from "@/lib/overrides";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Flame, BookOpen, ChevronRight } from "lucide-react";
import { Page } from "@/components/Shell";
import { HomeFeed, Avisos } from "@/components/HomeFeed";
import { getPlan } from "@/lib/bible";
import { usePlanLength } from "@/lib/plan-choice";
import { CURRENT_DAY, DEVOTIONALS, useStore } from "@/lib/store";
import { defaultSystemPage, normalizeHomeSections, useSystemPage } from "@/lib/system-pages";
import { SystemPageContent } from "@/components/SystemPageContent";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Os Mamutes — Desafio Bíblico 180 Dias" },
      {
        name: "description",
        content: "Check-in diário, progresso e devocional dos Mamutes da Igreja Batista Belém.",
      },
      { property: "og:title", content: "Os Mamutes — Desafio Bíblico 180 Dias" },
      { property: "og:description", content: "Leia a Bíblia inteira em 180 dias com os irmãos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Home,
});

function Home() {
  const { done, profiles } = useStore();
  const [len] = usePlanLength();
  const tx = useTexts();
  const PLAN = getPlan(len, usePlanRaw());
  const today = PLAN[Math.min(CURRENT_DAY, len) - 1];
  const pct = Math.round((done.size / len) * 100);
  const me = profiles.find((p) => p.id === "me");
  const dev = DEVOTIONALS[0];
  const { data } = useSystemPage("home");
  const content = data ?? defaultSystemPage("home");

  return (
    <Page title="Home">
      {content.show_announcements && <Avisos />}
      <SystemPageContent page={content}>
      {normalizeHomeSections(content.home_sections).filter((section) => section.visible).map((section) => <div key={section.id}>
      {section.id === "reading" && today && <section className="rounded-2xl border border-border bg-hero p-5 shadow-elevated">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
          Dia {CURRENT_DAY} de {len} · Plano {len === 365 ? "1 ano" : `${len} dias`}
        </p>
        <h2 className="mt-2 font-display text-2xl uppercase text-foreground">{today.label}</h2>
        <Link
          to="/biblia"
          search={{ day: CURRENT_DAY, plan: len }}
          className="mt-1 inline-flex items-center gap-1 text-sm text-muted-foreground underline-offset-4 hover:underline"
        >
          {tx("home_reading_link")} <ChevronRight className="h-4 w-4" />
        </Link>
      </section>}

      {section.id === "progress" && <section className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">{tx("home_progress")}</p>
          <p className="font-display text-3xl text-foreground">{pct}%</p>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {done.size} de {len} dias
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">{tx("home_streak")}</p>
          <p className="flex items-center gap-1 font-display text-3xl text-foreground">
            <Flame className="h-6 w-6 text-gold" />
            {me?.streak ?? 0}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">{tx("home_streak_sub")}</p>
        </div>
      </section>}

      {section.id === "devotional" && dev && <section className="mt-4 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-gold">
          <BookOpen className="h-4 w-4" /> {tx("home_dev_title")}
        </p>
        <h3 className="mt-2 text-lg font-semibold text-foreground">{dev.title}</h3>
        <Link to="/devocional" className="mt-3 inline-flex items-center text-sm text-primary">
          {tx("home_dev_link")} <ChevronRight className="h-4 w-4" />
        </Link>
      </section>}
      {section.id === "feed" && <HomeFeed />}
      </div>)}
      </SystemPageContent>
    </Page>
  );
}
