import { useEffect, useState, type ReactNode } from "react";
import { Download, Share, PlusSquare, MoreVertical } from "lucide-react";

type BIPEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isMobileDevice() {
  const ua = navigator.userAgent;
  const iPadOS = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
  return /Android|iPhone|iPad|iPod|Mobile/i.test(ua) || iPadOS;
}
function isIOS() {
  const ua = navigator.userAgent;
  return /iPhone|iPad|iPod/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}
function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

export function InstallGate({ children }: { children: ReactNode }) {
  const [blocked, setBlocked] = useState(false);
  const [ios, setIos] = useState(false);
  const [prompt, setPrompt] = useState<BIPEvent | null>(null);
  const [help, setHelp] = useState(false);

  useEffect(() => {
    setIos(isIOS());
    setBlocked(isMobileDevice() && !isStandalone());
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BIPEvent);
    };
    const onInstalled = () => {
      setBlocked(false);
      setPrompt(null);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (!blocked) return <>{children}</>;

  const install = async () => {
    if (prompt) {
      await prompt.prompt();
      const choice = await prompt.userChoice;
      setPrompt(null);
      if (choice.outcome === "accepted") return;
    }
    setHelp(true);
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6 bg-background px-6 text-center">
      <img src="/mamutes-logo-transparent-256.png" alt="Logotipo dos Mamutes" className="h-40 w-40 object-contain" />
      <div>
        <h1 className="font-display text-4xl uppercase tracking-wide text-foreground">Os Mamutes</h1>
        <p className="mt-2 text-sm text-muted-foreground">Instale o app no seu celular para continuar.</p>
      </div>
      <button
        onClick={install}
        className="inline-flex w-full max-w-xs items-center justify-center gap-2 rounded-xl bg-primary px-6 py-4 text-lg font-bold text-primary-foreground shadow-lg"
      >
        <Download className="h-6 w-6" /> Baixar o app Os Mamutes
      </button>
      {help && (
        <div className="w-full max-w-xs rounded-xl border border-border bg-card p-4 text-left text-sm text-card-foreground">
          {ios ? (
            <ol className="space-y-2">
              <li className="flex items-center gap-2">1. Toque em <Share className="h-4 w-4" /> <b>Compartilhar</b></li>
              <li className="flex items-center gap-2">2. Toque em <PlusSquare className="h-4 w-4" /> <b>Adicionar à Tela de Início</b></li>
              <li>3. Abra o app pelo ícone na tela inicial.</li>
            </ol>
          ) : (
            <ol className="space-y-2">
              <li className="flex items-center gap-2">1. Toque no menu <MoreVertical className="h-4 w-4" /> do navegador</li>
              <li>2. Toque em <b>Instalar app</b> ou <b>Adicionar à tela inicial</b></li>
              <li>3. Abra o app pelo ícone na tela inicial.</li>
            </ol>
          )}
        </div>
      )}
    </div>
  );
}
