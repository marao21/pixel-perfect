import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Page } from "@/components/Shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShieldCheck, Mail, Lock, User } from "lucide-react";

export const Route = createFileRoute("/login")({
  component: LoginRoute,
});

function LoginRoute() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
          },
        });
        if (error) throw error;
        setSuccessMsg("Conta criada com sucesso! Verifique seu email se necessário ou faça login.");
        setIsSignUp(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        navigate({ to: "/" });
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Ocorreu um erro na autenticação.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page kicker="Os Mamutes 🦣" title={isSignUp ? "Criar Conta" : "Entrar no App"}>
      <div className="mx-auto max-w-md pt-4">
        <Card className="border-border bg-card shadow-elevated">
          <CardHeader className="space-y-1">
            <CardTitle className="font-display text-2xl uppercase text-foreground">
              {isSignUp ? "Cadastre-se" : "Login"}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {isSignUp
                ? "Preencha seus dados para participar do desafio dos Mamutes."
                : "Digite seu email e senha para acessar sua conta."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuth} className="space-y-4">
              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nome Completo</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="fullName"
                      placeholder="Seu Nome"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="pl-9"
                      required={isSignUp}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
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

              <Button type="submit" className="w-full font-bold shadow-glow" disabled={loading}>
                {loading ? "Carregando..." : isSignUp ? "Criar Conta" : "Entrar"}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className="text-xs text-primary underline-offset-4 hover:underline"
                >
                  {isSignUp
                    ? "Já tem uma conta? Faça login"
                    : "Não tem conta? Cadastre-se"}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Page>
  );
}
