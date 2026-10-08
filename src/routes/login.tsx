import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Page } from "@/components/Shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShieldCheck, Mail, Lock, User, Eye, EyeOff } from "lucide-react";

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>) => ({
    cadastro: search["cadastro"] === true || search["cadastro"] === "true",
  }),
  component: LoginRoute,
});

function LoginRoute() {
  const { cadastro } = Route.useSearch();
  const [isSignUp, setIsSignUp] = useState(cadastro);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => setIsSignUp(cadastro), [cadastro]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              name: fullName,
            },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;

        if (data?.session) {
          setSuccessMsg("Conta criada e login realizado com sucesso!");
          navigate({ to: "/" });
        } else if (data?.user && (data.user.identities?.length ?? 0) === 0) {
          setErrorMsg('Este email já tem conta. Faça login ou use "Esqueci minha senha".');
          setIsSignUp(false);
        } else if (data?.user) {
          setSuccessMsg(
            "Conta criada com sucesso! Verifique sua caixa de entrada para confirmar o email ou faça login caso a confirmação esteja desativada.",
          );
          setIsSignUp(false);
        } else {
          setSuccessMsg("Conta criada com sucesso! Faça login abaixo.");
          setIsSignUp(false);
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        if (data?.session) {
          navigate({ to: "/" });
        } else {
          setErrorMsg("Falha ao realizar login. Verifique seu email e senha.");
        }
      }
    } catch (err: unknown) {
      const errObj = err as { message?: string; error_description?: string } | null;
      const rawMsg =
        errObj?.message ||
        errObj?.error_description ||
        (typeof err === "string" ? err : JSON.stringify(err)) ||
        "";
      if (
        rawMsg.toLowerCase().includes("rate limit") ||
        rawMsg.toLowerCase().includes("over_email_send_rate_limit") ||
        rawMsg.toLowerCase().includes("email rate limit exceeded")
      ) {
        setErrorMsg(
          "Limite de envios de email excedido pelo provedor (Supabase). Por favor, aguarde alguns minutos antes de tentar cadastrar novamente ou desative a confirmação de email no painel do Supabase se estiver em ambiente de testes.",
        );
      } else if (
        rawMsg.toLowerCase().includes("database error saving new user") ||
        rawMsg.toLowerCase().includes("db error")
      ) {
        setErrorMsg(
          "Erro ao salvar o usuário no banco de dados. Certifique-se de que a tabela profiles e a trigger do Supabase estão configuradas corretamente.",
        );
      } else if (rawMsg.toLowerCase().includes("invalid login credentials")) {
        setErrorMsg(
          'Email ou senha incorretos. Se você já tem conta e esqueceu a senha, toque em "Esqueci minha senha".',
        );
      } else if (rawMsg.toLowerCase().includes("email not confirmed")) {
        setErrorMsg(
          "Seu email ainda não foi confirmado. Abra o link que enviamos para sua caixa de entrada.",
        );
      } else {
        setErrorMsg(rawMsg || "Ocorreu um erro na autenticação.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
    } catch (err: unknown) {
      const errObj = err as { message?: string; error_description?: string } | null;
      const rawMsg = errObj?.message || errObj?.error_description || JSON.stringify(err) || "";
      if (
        rawMsg.includes("Unsupported provider") ||
        rawMsg.includes("not enabled") ||
        rawMsg.includes("validation_failed")
      ) {
        setErrorMsg(
          "O login com o Google/Gmail não está habilitado no painel do Supabase. Por favor, utilize email e senha ou cadastre-se.",
        );
      } else {
        setErrorMsg(rawMsg || "Ocorreu um erro ao entrar com o Gmail.");
      }
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
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
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

              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Ou</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full font-bold gap-2"
                onClick={handleGoogleLogin}
                disabled={loading}
              >
                <svg
                  className="h-4 w-4"
                  aria-hidden="true"
                  focusable="false"
                  data-prefix="fab"
                  data-icon="google"
                  role="img"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 488 512"
                >
                  <path
                    fill="currentColor"
                    d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C318.5 110.7 286.7 96 248 96c-87.8 0-160 72.2-160 160s72.2 160 160 160c94.2 0 134.4-65.7 140.2-104H248v-85.2h239.9c1.2 12.8 2.1 26.7 2.1 41.2z"
                  ></path>
                </svg>
                Entrar com o Gmail
              </Button>

              <div className="flex flex-col items-center gap-2 text-center">
                {!isSignUp && (
                  <button
                    type="button"
                    className="text-xs text-muted-foreground underline-offset-4 hover:underline"
                    onClick={async () => {
                      setErrorMsg(null);
                      if (!email.trim()) {
                        setErrorMsg("Digite seu email acima para recuperar a senha.");
                        return;
                      }
                      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
                        redirectTo: `${window.location.origin}/reset-password`,
                      });
                      if (error) setErrorMsg(error.message);
                      else
                        setSuccessMsg(
                          "Enviamos um link para criar uma nova senha. Confira seu email.",
                        );
                    }}
                  >
                    Esqueci minha senha
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className="text-xs text-primary underline-offset-4 hover:underline"
                >
                  {isSignUp ? "Já tem uma conta? Faça login" : "Não tem conta? Cadastre-se"}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Page>
  );
}
