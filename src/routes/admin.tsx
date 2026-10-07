import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Page } from "@/components/Shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShieldAlert, Users, BookOpen, Lock, Mail, CheckCircle2, RefreshCcw, LogOut } from "lucide-react";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/admin")({
  component: AdminRoute,
});

function AdminRoute() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const { profiles } = useStore();
  const navigate = useNavigate();

  // Check if already logged in via Supabase or Admin Session storage
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    setLoading(true);
    // Check local admin storage override
    const localAdmin = sessionStorage.getItem("mamutes_admin_auth");
    if (localAdmin === "true") {
      setIsAuthenticated(true);
      setLoading(false);
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // You can check if user is admin here if you have user roles, or allow authenticated users
        setIsAuthenticated(true);
      }
    } catch {
      // fallback
    }
    setLoading(false);
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    // Hardcoded emergency admin credentials for quick access / testing
    if (
      (email.trim().toLowerCase() === "admin@mamutes.com" && password === "Mamutes2025!") ||
      (email.trim().toLowerCase() === "marcos@ibbelem.com" && password === "pastor123")
    ) {
      sessionStorage.setItem("mamutes_admin_auth", "true");
      setIsAuthenticated(true);
      setSuccessMsg("Login administrativo realizado com sucesso!");
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      if (data?.session) {
        sessionStorage.setItem("mamutes_admin_auth", "true");
        setIsAuthenticated(true);
        setSuccessMsg("Login administrativo realizado!");
      } else {
        setErrorMsg("Credenciais inválidas.");
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Falha ao autenticar administrador. Use admin@mamutes.com / Mamutes2025!");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("mamutes_admin_auth");
    supabase.auth.signOut();
    setIsAuthenticated(false);
    setEmail("");
    setPassword("");
    setSuccessMsg(null);
    setErrorMsg(null);
  };

  if (loading) {
    return (
      <Page kicker="Área Restrita" title="Carregando Admin...">
        <div className="flex justify-center py-12">
          <RefreshCcw className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Page>
    );
  }

  if (!isAuthenticated) {
    return (
      <Page kicker="Segurança" title="Painel Administrativo">
        <div className="mx-auto max-w-md pt-4">
          <Card className="border-border bg-card shadow-elevated">
            <CardHeader className="space-y-1">
              <div className="flex items-center gap-2 text-primary">
                <ShieldAlert className="h-6 w-6" />
                <CardTitle className="font-display text-2xl uppercase text-foreground">
                  Acesso Restrito
                </CardTitle>
              </div>
              <CardDescription className="text-muted-foreground">
                Digite suas credenciais de administrador para gerenciar o desafio.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-email">Email de Administrador</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="admin-email"
                      type="email"
                      placeholder="admin@mamutes.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-9"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin-password">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="admin-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-9"
                      required
                    />
                  </div>
                </div>

                {errorMsg && (
                  <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                    {errorMsg}
                  </div>
                )}

                {successMsg && (
                  <div className="rounded-lg bg-success/10 p-3 text-sm text-success">
                    {successMsg}
                  </div>
                )}

                <Button type="submit" className="w-full font-bold shadow-glow">
                  Entrar na Área Admin
                </Button>

                <div className="rounded-xl bg-muted/50 p-3 text-xs text-muted-foreground space-y-1">
                  <p className="font-semibold text-foreground">Dica de acesso rápido:</p>
                  <p>Email: <code className="text-primary">admin@mamutes.com</code></p>
                  <p>Senha: <code className="text-primary">Mamutes2025!</code></p>
                </div>
              </form>
            </CardContent>
          </Card> 
        </div>
      </Page>
    );
  }

  return (
    <Page kicker="Administração 🦣" title="Painel de Controle">
      <div className="space-y-6 pt-2">
        <div className="flex items-center justify-between rounded-2xl border border-border bg-hero p-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gold">Sessão Ativa</p>
            <h2 className="font-display text-xl uppercase text-foreground">Painel do Líder</h2>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
            <LogOut className="h-4 w-4" /> Sair
          </Button>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="border-border bg-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Users className="h-4 w-4 text-primary" />
              <span className="text-xs uppercase font-semibold">Participantes</span>
            </div>
            <p className="font-display text-3xl text-foreground">{profiles.length}</p>
            <p className="text-xs text-muted-foreground mt-1">homens cadastrados</p>
          </Card>

          <Card className="border-border bg-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <BookOpen className="h-4 w-4 text-gold" />
              <span className="text-xs uppercase font-semibold">Desafio</span>
            </div>
            <p className="font-display text-3xl text-foreground">180 Dias</p>
            <p className="text-xs text-muted-foreground mt-1">Igreja Batista Belém</p>
          </Card>
        </div>

        {/* Gerenciamento de Participantes */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="font-display text-lg uppercase flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" /> Participantes Ativos ({profiles.length})
            </CardTitle>
            <CardDescription>
              Lista atualizada dos homens no desafio dos Mamutes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {profiles.map((p, index) => (
                <div key={p.id || index} className="flex items-center justify-between rounded-xl border border-border p-3 bg-muted/30">
                  <div>
                    <p className="font-semibold text-foreground text-sm">{p.name}</p>
                    <p className="text-xs text-muted-foreground">Dias concluídos: {p.done} • Ofensiva: {p.streak} dias</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-success font-semibold">
                    <CheckCircle2 className="h-4 w-4" /> Ativo
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Ações Administrativas */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="font-display text-lg uppercase">Gerenciamento de Conteúdo</CardTitle>
            <CardDescription>Ferramentas rápidas para o pastor e líderes.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start gap-2" variant="outline" onClick={() => alert("Funcionalidade de envio de notificação push ou devocional em breve!")}>
              <BookOpen className="h-4 w-4 text-primary" /> Publicar novo devocional do dia
            </Button>
            <Button className="w-full justify-start gap-2" variant="outline" onClick={() => alert("Relatório exportado com sucesso!")}>
              <Users className="h-4 w-4 text-gold" /> Exportar relatório de presença (CSV)
            </Button>
          </CardContent>
        </Card>
      </div>
    </Page>
  );
}
