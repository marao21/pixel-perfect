import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Copy, Heart } from "lucide-react";
import { Page } from "@/components/Shell";

const pixOptions = [
  { label: "R$ 5,00", code: "PIX-DEMO-OFERTA-05" },
  { label: "R$ 10,00", code: "PIX-DEMO-OFERTA-10" },
  { label: "R$ 20,00", code: "PIX-DEMO-OFERTA-20" },
  { label: "R$ 50,00", code: "PIX-DEMO-OFERTA-50" },
  { label: "Oferta livre", code: "PIX-DEMO-OFERTA-LIVRE" },
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
        <div className="bg-hero px-4 py-3 text-center">
          <Heart className="mx-auto h-6 w-6 text-gold" aria-hidden="true" />
          <h2 className="mt-1 font-display text-xl uppercase text-foreground">Ofertar é um ato de gratidão</h2>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Escolha um valor e copie o código Pix para testar a experiência.
          </p>
        </div>
        <div className="px-4 py-3">
          <div className="grid gap-2 sm:grid-cols-2">
            {pixOptions.map(({ label, code }) => {
              const isCopied = copiedCode === code;

              return (
                <div key={label} className="rounded-xl border border-border bg-background p-2.5">
                  <div className="flex items-center justify-between">
                    <p className="font-display text-lg text-foreground">{label}</p>
                    <button
                      type="button"
                      onClick={() => void copyCode(code)}
                      className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground transition hover:opacity-90"
                      aria-label={`${isCopied ? "Código copiado" : "Copiar código Pix fictício"} para ${label}`}
                    >
                      {isCopied ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <Copy className="h-3.5 w-3.5" aria-hidden="true" />}
                      {isCopied ? "Copiado" : "Copiar"}
                    </button>
                  </div>
                  <p className="mt-1.5 truncate rounded bg-muted px-2 py-1 font-mono text-[11px] text-muted-foreground">
                    {code}
                  </p>
                </div>
              );
            })}
          </div>
          <p className="mt-3 rounded-lg border border-gold/40 bg-gold/10 px-3 py-2 text-center text-[11px] leading-snug text-muted-foreground">
            Demonstração: estes códigos são fictícios e não fazem pagamentos Pix reais.
          </p>
        </div>
      </section>
    </Page>
  );
}
