import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Page } from "@/components/Shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Nova senha — Os Mamutes" },
      { name: "description", content: "Crie uma nova senha para sua conta dos Mamutes." },
      { property: "og:title", content: "Nova senha — Os Mamutes" },
      { property: "og:description", content: "Crie uma nova senha para sua conta." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const [pw, setPw] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  return (
    <Page title="Nova senha">
      <section className="mx-auto max-w-md rounded-2xl border border-border bg-card p-5">
        <h1 className="mb-3 font-display text-2xl uppercase text-foreground">Criar nova senha</h1>
        <form
          className="space-y-3"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            const { error } = await supabase.auth.updateUser({ password: pw });
            setBusy(false);
            if (error) return setMsg(error.message);
            navigate({ to: "/" });
          }}
        >
          <Input type="password" minLength={6} required placeholder="Nova senha (mín. 6 caracteres)" value={pw} onChange={(e) => setPw(e.target.value)} />
          {msg && <p className="text-sm text-destructive">{msg}</p>}
          <Button type="submit" className="w-full" disabled={busy}>Salvar senha</Button>
        </form>
      </section>
    </Page>
  );
}
