import { createFileRoute } from "@tanstack/react-router";

const VOICES = ["onyx", "echo", "ash", "ballad", "nova", "shimmer", "coral", "sage"];

export const Route = createFileRoute("/api/tts")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json().catch(() => null)) as { text?: string; voice?: string; speed?: number } | null;
        const text = typeof body?.text === "string" ? body.text.slice(0, 4000) : "";
        if (!text) return new Response("texto vazio", { status: 400 });
        const voice = VOICES.includes(body?.voice ?? "") ? body!.voice! : "onyx";
        const speed = Math.min(1.6, Math.max(0.6, Number(body?.speed) || 1));
        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) return new Response("LOVABLE_API_KEY ausente", { status: 500 });
        const upstream = await fetch("https://ai.gateway.lovable.dev/v1/audio/speech", {
          method: "POST",
          headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "openai/gpt-4o-mini-tts",
            input: text,
            voice,
            speed,
            instructions: "Leia em português do Brasil, com sotaque brasileiro natural, tom reverente e calmo, como uma leitura bíblica.",
            stream_format: "audio",
            response_format: "mp3",
          }),
        });
        if (!upstream.ok) {
          const err = await upstream.text();
          console.error("TTS", upstream.status, err);
          return new Response(err, { status: upstream.status });
        }
        return new Response(upstream.body, {
          status: 200,
          headers: { "Content-Type": upstream.headers.get("Content-Type") ?? "audio/mpeg", "Cache-Control": "no-cache" },
        });
      },
    },
  },
});
