import { Link } from "@tanstack/react-router";
import { Home, CalendarDays, HandCoins, ShieldCheck, BookOpen, BookMarked, Sun, Moon, Coffee, Palette, LogIn, LogOut, ShieldAlert } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { useTheme, type Theme } from "@/lib/theme";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

const THEMES: { id: Theme; label: string; icon: typeof Sun }[] = [
  { id: "claro", label: "Claro", icon: Sun },
  { id: "escuro", label: "Escuro", icon: Moon },
  { id: "sepia", label: "Sépia", icon: Coffee },
  { id: "azul", label: "Azul", icon: Palette },
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

function NetworkStatus() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  const label = online
    ? "Rede do aparelho conectada; a internet ou a API ainda podem estar indisponíveis"
    : "Sem rede — o app usa as páginas e os capítulos salvos neste aparelho";
  return (
    <span role="status" aria-label={label} title={label} className="grid h-6 w-3 shrink-0 place-items-center">
      <span aria-hidden="true" className={`h-2.5 w-2.5 rounded-full ring-2 ${online ? "bg-primary ring-primary/20" : "bg-gold ring-gold/20"}`} />
    </span>
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

export function Page({ children }: { title: string; kicker?: string; children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <main className="mx-auto w-full max-w-xl px-4 pb-28 pt-0 md:max-w-2xl lg:max-w-3xl relative overflow-x-hidden">
      {/* Watermelon / Mammoth background watermark logo */}
      <div className="pointer-events-none fixed inset-0 flex items-center justify-center -z-10 overflow-hidden opacity-[0.14] dark:opacity-[0.20]">
        <img
          src="/mamutes-logo-transparent-256.png"
          alt=""
          className="w-[85vw] max-w-[550px] h-auto object-contain select-none"
        />
      </div>

      <header className="sticky top-0 z-40 -mx-4 mb-5 flex min-h-16 md:rounded-b-2xl items-center gap-3 border-b border-border bg-background/95 px-4 py-2.5 backdrop-blur">
        <img
          src="/mamutes-logo-transparent-256.png"
          alt="Os Mamutes"
          width={64}
          height={64}
          decoding="async"
          className="h-16 w-16 shrink-0 object-contain"
        />
        <div className="min-w-0 flex-1">
          <p className="font-display text-xl uppercase leading-none tracking-wide text-foreground">Os Mamutes</p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-gold">Desafio Bíblico</p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <NetworkStatus />
          <ThemeSwitcher />
          <Link
            to="/admin"
            title="Área Admin"
            className="rounded-full border border-border bg-card p-1.5 text-muted-foreground hover:text-primary transition-colors"
          >
            <ShieldAlert className="h-4 w-4" />
          </Link>
          {user ? (
            <button
              onClick={handleLogout}
              title="Sair da conta"
              className="rounded-full border border-border bg-card p-1.5 text-muted-foreground hover:text-foreground transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          ) : (
            <Link
              to="/login"
              title="Entrar"
              className="rounded-full border border-border bg-card p-1.5 text-muted-foreground hover:text-foreground transition-colors"
            >
              <LogIn className="h-4 w-4" />
            </Link>
          )}
        </div>
      </header>
      <div className="relative z-10">
        {children}
      </div>
    </main>
  );
}

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/95 backdrop-blur">
      <ul className="mx-auto grid w-full max-w-xl grid-cols-6 md:max-w-2xl lg:max-w-3xl">
        {TABS.map(({ to, label, icon: Icon }) => (
          <li key={to} className="min-w-0">
            <Link
              to={to}
              activeOptions={{ exact: to === "/" }}
              aria-label={label}
              title={label}
              className="flex min-h-14 w-full min-w-0 flex-col items-center justify-center gap-1 overflow-hidden px-0 py-2 text-xs leading-none font-medium text-muted-foreground transition-colors"
              activeProps={{ className: "text-primary" }}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="block max-w-full whitespace-nowrap tracking-[-0.03em] text-[11px] sm:text-xs">{label === "Devocional" ? "Devoc." : label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
