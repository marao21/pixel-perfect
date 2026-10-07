import { Link } from "@tanstack/react-router";
import { Home, CalendarDays, HandCoins, ShieldCheck, BookOpen, BookMarked, Sun, Moon, Coffee, Palette, LogIn, LogOut, ShieldAlert, Menu, FileText, UserPlus, ChevronDown } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { useTheme, type Theme } from "@/lib/theme";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useCustomPages } from "@/lib/content";

const THEMES: { id: Theme; label: string; icon: typeof Sun }[] = [
  { id: "claro", label: "Claro", icon: Sun },
  { id: "escuro", label: "Escuro", icon: Moon },
  { id: "sepia", label: "Sépia", icon: Coffee },
  { id: "azul", label: "Azul", icon: Palette },
];

function MenuButton() {
  const [open, setOpen] = useState(false);
  const [appearanceOpen, setAppearanceOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const pages = useCustomPages();
  const { theme, setTheme } = useTheme();
  const item = "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-foreground hover:bg-muted";

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) setOpen(false);
  };
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button aria-label="Abrir menu" title="Menu" className="rounded-full border border-border bg-card p-1.5 text-muted-foreground hover:text-foreground">
          <Menu className="h-4 w-4" />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 overflow-y-auto bg-card">
        <SheetHeader><SheetTitle className="font-display uppercase">Menu</SheetTitle></SheetHeader>
        <nav className="mt-4 flex flex-col gap-1">
          {TABS.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} onClick={() => setOpen(false)} activeOptions={{ exact: to === "/" }} className={item} activeProps={{ className: "text-primary" }}>
              <Icon className="h-5 w-5" /> {label}
            </Link>
          ))}
          {pages.length > 0 && <p className="mt-3 px-3 text-xs font-semibold uppercase tracking-wider text-gold">Mais</p>}
          {pages.map((p) => (
            <Link key={p.id} to="/p/$slug" params={{ slug: p.slug }} onClick={() => setOpen(false)} className={item} activeProps={{ className: "text-primary" }}>
              <FileText className="h-5 w-5" /> {p.title}
            </Link>
          ))}
        </nav>
        <section className="mt-6 border-t border-border pt-4">
          <h3 className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Conta</h3>
          <div className="mt-2 flex flex-col gap-1">
            {user ? (
              <>
                <p className="truncate px-3 py-2 text-sm text-muted-foreground" title={user.email ?? "Conta conectada"}>{user.email ?? "Conta conectada"}</p>
                <button type="button" onClick={() => void handleLogout()} className={item}>
                  <LogOut className="h-5 w-5" /> Sair
                </button>
              </>
            ) : (
              <>
                <Link to="/login" search={{ cadastro: false }} onClick={() => setOpen(false)} className={item}>
                  <LogIn className="h-5 w-5" /> Entrar
                </Link>
                <Link to="/login" search={{ cadastro: true }} onClick={() => setOpen(false)} className={item}>
                  <UserPlus className="h-5 w-5" /> Criar cadastro
                </Link>
              </>
            )}
          </div>
        </section>
        <section className="mt-6 border-t border-border pt-4">
          <button type="button" aria-expanded={appearanceOpen} onClick={() => setAppearanceOpen((value) => !value)} className={`${item} w-full justify-between`}>
            <span className="flex items-center gap-3"><Palette className="h-5 w-5" /> Aparência</span>
            <span className="flex items-center gap-2 text-xs font-normal text-muted-foreground">
              {THEMES.find(({ id }) => id === theme)?.label}
              <ChevronDown className={`h-4 w-4 transition-transform ${appearanceOpen ? "rotate-180" : ""}`} />
            </span>
          </button>
          {appearanceOpen && (
            <div className="mt-2 grid grid-cols-2 gap-2" aria-label="Escolha uma cor">
              {THEMES.map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => { setTheme(id); setAppearanceOpen(false); }} aria-pressed={theme === id} className={`flex min-h-11 items-center gap-2 rounded-xl border px-3 text-sm font-medium ${theme === id ? "border-primary bg-primary/10 text-primary" : "border-border text-foreground hover:bg-muted"}`}>
                  <Icon className="h-4 w-4" /> {label}
                </button>
              ))}
            </div>
          )}
        </section>
      </SheetContent>
    </Sheet>
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
    <main className="mx-auto w-full max-w-xl px-4 pb-6 pt-0 md:max-w-2xl lg:max-w-3xl relative overflow-x-hidden">
      <header className="sticky top-0 z-40 -mx-4 mb-5 flex min-h-16 md:rounded-b-2xl items-center gap-3 border-b border-border bg-background/95 px-4 py-2.5 backdrop-blur">
        <MenuButton />
        <div className="min-w-0 flex-1">
          <p className="font-display text-xl uppercase leading-none tracking-wide text-foreground">Os Mamutes</p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-gold">Desafio Bíblico</p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <NetworkStatus />
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

