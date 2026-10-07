import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Copy, Heart } from "lucide-react";
import { Page } from "@/components/Shell";
import { useSettings } from "@/lib/content";

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
  const settings = useSettings();
  const [copied, setCopied] = useState(false);

  const hasPix = Boolean(settings && (settings.pix_qr_url || settings.pix_key || settings.pix_receiver));

  async function copyKey() {
    if (!settings?.pix_key) return;
    try {
      await navigator.clipboard.writeText(settings.pix_key);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <Page kicker="Igreja Batista Belém" title="Oferta">
      <section className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="bg-hero px-4 py-3 text-center">
          <Heart className="mx-auto h-6 w-6 text-gold" aria-hidden="true" />
          <h2 className="mt-1 font-display text-xl uppercase text-foreground">Ofertar é um ato de gratidão</h2>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Aponte a câmera do seu banco para o QR Code ou copie a chave Pix.
          </p>
        </div>

        {hasPix ? (
          <div className="px-4 py-4 text-center">
            {settings?.pix_qr_url && (
              <img src={settings.pix_qr_url} alt="QR Code Pix" className="mx-auto w-56 rounded-xl bg-white p-2" />
            )}
            <div className="mt-4 space-y-3 text-left">
              {settings?.pix_receiver && (
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Recebedor</p>
                  <p className="text-sm font-semibold text-foreground">{settings.pix_receiver}</p>
                </div>
              )}
              {settings?.pix_key && (
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Chave Pix</p>
                  <p className="mt-1 truncate rounded-lg bg-muted px-3 py-2 font-mono text-xs text-foreground">
                    {settings.pix_key}
                  </p>
                  <button
                    type="button"
                    onClick={() => void copyKey()}
                    className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
                  >
                    {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                    {copied ? "Chave copiada" : "Copiar chave Pix"}
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="px-4 py-6 text-center">
            <div className="mx-auto flex w-56 items-center justify-center rounded-xl border-2 border-dashed border-border px-4 py-10">
              <p className="text-sm text-muted-foreground">O QR Code do Pix da igreja aparecerá aqui em breve.</p>
            </div>
          </div>
        )}
      </section>
    </Page>
  );
}
