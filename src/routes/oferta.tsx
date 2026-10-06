import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Copy, Heart } from "lucide-react";
import { Page } from "@/components/Shell";

const pixOptions = [
  { amount: 5, code: "PIX-DEMO-OFERTA-05" },
  { amount: 10, code: "PIX-DEMO-OFERTA-10" },
  { amount: 20, code: "PIX-DEMO-OFERTA-20" },
  { amount: 50, code: "PIX-DEMO-OFERTA-50" },
];

export const Route = createFileRoute("/oferta")({
  head: () => ({
    meta: [
      { title: "Oferta — Os Mamutes" },
      { name: "description", content: "Contribua com a Igreja Batista Belém por meio do Pix." },
      { property: "og:title", content: "Oferta — Os Mamutes" },
      { property: "og:description", content: "Contribua com a Igreja Batista Belém por meio do Pix." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Oferta,
});

function Oferta() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  async function copyCode(code: string) {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      window.setTimeout(() => setCopiedCode(null), 2000);
    } catch {
      setCopiedCode(null);
    }
  }

  return (
    <Page kicker="Igreja Batista Belém" title="Oferta">
      <section className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="bg-hero px-5 py-6 text-center">
          <Heart className="mx-auto h-8 w-8 text-gold" aria-hidden="true" />
          <h2 className="mt-3 font-display text-2xl uppercase text-foreground">Ofertar é um ato de gratidão</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Escolha um valor e copie o código Pix para testar a experiência.
          </p>
        </div>
        <div className="px-5 py-6">
          <div className="grid gap-3 sm:grid-cols-2">
            {pixOptions.map(({ amount, code }) => {
              const isCopied = copiedCode === code;

              return (
                <div key={amount} className="rounded-xl border border-border bg-background p-4">
                  <p className="font-display text-2xl text-foreground">R$ {amount},00</p>
                  <p className="mt-2 break-all rounded-md bg-muted px-3 py-2 font-mono text-xs text-muted-foreground">
                    {code}
                  </p>
                  <button
                    type="button"
                    onClick={() => void copyCode(code)}
                    className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
                    aria-label={`${isCopied ? "Código copiado" : "Copiar código Pix fictício"} de R$ ${amount},00`}
                  >
                    {isCopied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                    {isCopied ? "Copiado" : "Copiar código Pix"}
                  </button>
                </div>
              );
            })}
          </div>
          <p className="mt-5 rounded-lg border border-gold/40 bg-gold/10 p-3 text-center text-xs leading-relaxed text-muted-foreground">
            Demonstração: estes códigos são fictícios e não fazem pagamentos Pix reais.
          </p>
        </div>
      </section>
    </Page>
  );
}
