import { useEffect, useState, type ReactNode } from "react";
import { Download, Share } from "lucide-react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string }>;
};

function isMobileDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent.toLowerCase();
  const mobileUa = /android|iphone|ipod|blackberry|windows phone|opera mini|mobile/.test(ua);
  const ipadOs = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
  return mobileUa || ipadOs;
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as { standalone?: boolean }).standalone === true
  );
}

/**
 * On mobile browsers, shows ONLY an install screen until the app is
 * installed (standalone). On desktop or once installed, renders children.
 */
export function InstallGate({ children }: { children: ReactNode }) {
  const [blocked, setBlocked] = useState<boolean | null>(null);
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const update = () => setBlocked(isMobileDevice() && !isStandalone());
    update();

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setBlocked(false);
    const mq = window.matchMedia("(display-mode: standalone)");
    mq.addEventListener("change", update);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      mq.removeEventListener("change", update);
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  // Wait for the client check before deciding (SSR renders children).
  if (blocked === null || !blocked) return <>{children}</>;

  const handleInstall = async () => {
    if (deferred) {
      await deferred.prompt();
      const { outcome } = await deferred.userChoice;
      if (outcome === "accepted") setBlocked(false);
      setDeferred(null);
    }
  };

  const isIos = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      <img
        src="/mamutes-logo-transparent-256.png"
        alt="Logotipo dos Mamutes"
        className="h-40 w-40 object-contain"
      />
      <h1 className="mt-6 font-display text-4xl uppercase tracking-wide text-foreground">
        Os Mamutes
      </h1>
      <p className="mt-1 text-sm font-semibold uppercase tracking-[0.2em] text-gold">
        Desafio Bíblico
      </p>
      <p className="mt-6 max-w-xs text-sm text-muted-foreground">
        Para usar o sistema no celular, instale o app no seu aparelho.
      </p>
      {deferred ? (
        <button
          type="button"
          onClick={() => void handleInstall()}
          className="mt-8 flex items-center gap-2 rounded-2xl bg-gold px-8 py-4 font-display text-lg uppercase tracking-wide text-background shadow-lg"
        >
          <Download className="h-5 w-5" /> Baixar o app Os Mamutes
        </button>
      ) : (
        <div className="mt-8 max-w-xs rounded-2xl border border-gold/40 bg-gold/10 p-4 text-left text-sm text-foreground">
          <p className="flex items-center gap-2 font-semibold">
            <Download className="h-4 w-4 text-gold" /> Baixar o app Os Mamutes
          </p>
          {isIos ? (
            <p className="mt-2 text-muted-foreground">
              Toque em <Share className="inline h-4 w-4" /> <strong>Compartilhar</strong> e depois em{" "}
              <strong>"Adicionar à Tela de Início"</strong>.
            </p>
          ) : (
            <p className="mt-2 text-muted-foreground">
              Abra o menu do navegador (<strong>⋮</strong>) e toque em{" "}
              <strong>"Instalar app"</strong> ou <strong>"Adicionar à tela inicial"</strong>.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
