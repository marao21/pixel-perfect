import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Copy, Heart } from "lucide-react";
import { Page } from "@/components/Shell";
import { useSettings, type PixOption } from "@/lib/content";

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
  const opts: PixOption[] = settings?.pix_options?.length
    ? settings.pix_options
    : settings && (settings.pix_key || settings.pix_qr_url)
      ? [{ id: "legacy", label: "", key: settings.pix_key ?? "", receiver: settings.pix_receiver ?? "", amount: null, qr: settings.pix_qr_url ?? "" }]
      : [];

  return (
    <Page kicker="Igreja Batista Belém" title="Oferta">
      <section className="mb-4 overflow-hidden rounded-2xl border border-border bg-card">
        <div className="bg-hero px-4 py-3 text-center">
          <Heart className="mx-auto h-6 w-6 text-gold" aria-hidden="true" />
          <h2 className="mt-1 font-display text-xl uppercase text-foreground">Ofertar é um ato de gratidão</h2>
          <p className="text-xs leading-relaxed text-muted-foreground">Aponte a câmera do seu banco para o QR Code ou copie a chave Pix.</p>
        </div>
        {opts.length === 0 && (
          <div className="px-4 py-6 text-center">
            <div className="mx-auto flex w-56 items-center justify-center rounded-xl border-2 border-dashed border-border px-4 py-10">
              <p className="text-sm text-muted-foreground">O QR Code do Pix da igreja aparecerá aqui em breve.</p>
            </div>
          </div>
        )}
      </section>
      <div className="grid gap-4 md:grid-cols-2">
        {opts.map((p) => <PixCard key={p.id} p={p} />)}
      </div>
    </Page>
  );
}

function PixCard({ p }: { p: PixOption }) {
  const [copied, setCopied] = useState(false);
  async function copyKey() {
    try { await navigator.clipboard.writeText(p.key); setCopied(true); window.setTimeout(() => setCopied(false), 2000); } catch { setCopied(false); }
  }
  return (
    <section className="rounded-2xl border border-border bg-card p-4 text-center">
      {p.label && <h3 className="font-display text-lg uppercase text-foreground">{p.label}</h3>}
      <p className="mb-3 font-display text-2xl text-gold">
        {p.amount !== null ? p.amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "Valor livre"}
      </p>
      {p.qr && <img src={p.qr} alt="QR Code Pix" className="mx-auto w-52 rounded-xl bg-white p-2" />}
      <div className="mt-3 space-y-3 text-left">
        {p.receiver && (
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Recebedor</p>
            <p className="text-sm font-semibold text-foreground">{p.receiver}</p>
          </div>
        )}
        {p.key && (
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Chave Pix</p>
            <p className="mt-1 truncate rounded-lg bg-muted px-3 py-2 font-mono text-xs text-foreground">{p.key}</p>
            <button type="button" onClick={() => void copyKey()}
              className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90">
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Chave copiada" : "Copiar chave Pix"}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
