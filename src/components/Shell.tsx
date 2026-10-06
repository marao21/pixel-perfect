import { Link } from "@tanstack/react-router";
import { Home, CalendarDays, HandCoins, ShieldCheck, BookOpen, BookMarked, Sun, Moon, Coffee } from "lucide-react";
import type { ReactNode } from "react";
import { useTheme, type Theme } from "@/lib/theme";

const THEMES: { id: Theme; label: string; icon: typeof Sun }[] = [
  { id: "claro", label: "Claro", icon: Sun },
  { id: "escuro", label: "Escuro", icon: Moon },
  { id: "sepia", label: "Sépia", icon: Coffee },
];

function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="flex shrink-0 gap-1 rounded-full border border-border bg-card p-1">
      {THEMES.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => setTheme(id)}
          aria-label={label}
          title={label}
          className={`rounded-full p-1.5 transition-colors ${theme === id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
        >
          <Icon className="h-4 w-4" />
        </button>
      ))}
    </div>
  );
}

const TABS = [
  { to: "/", label: "Home", icon: Home },
  { to: "/plano", label: "Plano", icon: CalendarDays },
  { to: "/biblia", label: "Bíblia", icon: BookMarked },
  { to: "/oferta", label: "Oferta", icon: HandCoins },
  { to: "/pecado", label: "Pecado", icon: ShieldCheck },
  { to: "/devocional", label: "Devocional", icon: BookOpen },
] as const;

export function Page({ title, kicker, children }: { title: string; kicker?: string; children: ReactNode }) {
  return (
    <main className="mx-auto w-full max-w-xl px-4 pb-28 pt-6">
      <header className="mb-5 flex items-center gap-3">
        <img
          src="/mamutes-logo-transparent-256.png"
          alt="Os Mamutes"
          width={56}
          height={56}
          decoding="async"
          className="h-14 w-14 shrink-0 object-contain"
        />
        <div className="min-w-0 flex-1">
        {kicker && <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">{kicker}</p>}
        <h1 className="font-display text-3xl uppercase leading-none tracking-wide text-foreground">{title}</h1>
        </div>
        <ThemeSwitcher />
      </header>
      {children}
    </main>
  );
}

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/95 backdrop-blur">
      <ul className="mx-auto grid max-w-xl grid-cols-6">
        {TABS.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <Link
              to={to}
              activeOptions={{ exact: to === "/" }}
              className="flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium text-muted-foreground transition-colors"
              activeProps={{ className: "text-primary" }}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
