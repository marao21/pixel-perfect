import { createFileRoute } from "@tanstack/react-router";
import { Heart, QrCode } from "lucide-react";
import { Page } from "@/components/Shell";

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
  return (
    <Page kicker="Igreja Batista Belém" title="Oferta">
      <section className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="bg-hero px-5 py-6 text-center">
          <Heart className="mx-auto h-8 w-8 text-gold" aria-hidden="true" />
          <h2 className="mt-3 font-display text-2xl uppercase text-foreground">Ofertar é um ato de gratidão</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Aponte a câmera do seu celular para o QR Code e contribua por Pix.
          </p>
        </div>
        <div className="px-5 py-6">
          <div className="mx-auto flex aspect-square w-full max-w-64 flex-col items-center justify-center rounded-xl border-2 border-dashed border-primary bg-background p-6 text-center">
            <QrCode className="h-28 w-28 text-primary" aria-hidden="true" />
            <p className="mt-4 text-sm font-semibold text-foreground">QR Code Pix da igreja</p>
            <p className="mt-1 text-xs text-muted-foreground">Em breve</p>
          </div>
          <p className="mt-5 text-center text-xs leading-relaxed text-muted-foreground">
            Antes de confirmar, confira se o favorecido é a Igreja Batista Belém.
          </p>
        </div>
      </section>
    </Page>
  );
}
