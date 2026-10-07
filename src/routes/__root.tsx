import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import { Toaster } from "../components/ui/sonner";
import { StoreProvider } from "../lib/store";
import { ThemeProvider } from "../lib/theme";
import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" },
      { title: "Os Mamutes" },
      { name: "description", content: "Desafio bíblico de 180 dias dos homens da Igreja Batista Belém." },
      { name: "theme-color", content: "#0f130f" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-title", content: "Os Mamutes" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@Lovable" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:wght@400;500;600;700&family=Lora:ital@0;1&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  useEffect(() => {
    if (import.meta.env.DEV || !("serviceWorker" in navigator) || window.location.protocol !== "https:") return;
    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {
      // App routes remain usable online even if the browser blocks PWA registration.
    });
  }, []);

  useEffect(() => {
    const preventGestureZoom = (event: Event) => event.preventDefault();
    window.addEventListener("gesturestart", preventGestureZoom, { passive: false });
    window.addEventListener("gesturechange", preventGestureZoom, { passive: false });
    window.addEventListener("gestureend", preventGestureZoom, { passive: false });
    return () => {
      window.removeEventListener("gesturestart", preventGestureZoom);
      window.removeEventListener("gesturechange", preventGestureZoom);
      window.removeEventListener("gestureend", preventGestureZoom);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <ThemeProvider>
        <StoreProvider>
          <DailyDevotionalGreeting />
          <Outlet />
          <Toaster />
        </StoreProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

function DailyDevotionalGreeting() {
  useEffect(() => {
    if (!("speechSynthesis" in window) || typeof SpeechSynthesisUtterance === "undefined") return;

    const today = new Date();
    const dateKey = `mamutes-devotional-greeting-${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
    if (localStorage.getItem(dateKey)) return;

    const synth = window.speechSynthesis;
    let started = false;
    let finished = false;
    let retryAvailable = true;
    const utterance = new SpeechSynthesisUtterance("Hoje tem seu devocional.");
    utterance.lang = "pt-BR";
    utterance.rate = 1;
    utterance.onstart = () => {
      started = true;
      localStorage.setItem(dateKey, "1");
    };
    utterance.onend = () => { finished = true; };
    utterance.onerror = (event) => {
      if (event.error !== "not-allowed") finished = true;
    };

    const chooseVoiceAndSpeak = () => {
      const voices = synth.getVoices();
      utterance.voice = voices.find((voice) => voice.lang.toLowerCase() === "pt-br")
        ?? voices.find((voice) => voice.lang.toLowerCase().startsWith("pt"))
        ?? null;
      synth.cancel();
      synth.speak(utterance);
    };

    const retryAfterGesture = () => {
      if (retryAvailable && !started && !finished) {
        retryAvailable = false;
        chooseVoiceAndSpeak();
      }
      window.removeEventListener("pointerdown", retryAfterGesture);
      window.removeEventListener("keydown", retryAfterGesture);
    };

    const timer = window.setTimeout(chooseVoiceAndSpeak, 500);
    window.addEventListener("pointerdown", retryAfterGesture, { once: true });
    window.addEventListener("keydown", retryAfterGesture, { once: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("pointerdown", retryAfterGesture);
      window.removeEventListener("keydown", retryAfterGesture);
      if (!started) synth.cancel();
    };
  }, []);

  return null;
}
