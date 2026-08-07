/**
 * Repasse de leads para um webhook externo configurado no admin.
 * Endpoint público (chamado pelo próprio site) para evitar CORS no destino.
 */
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
} as const;

const schema = z.object({
  url: z.string().url().max(2000).refine((u) => u.startsWith("https://"), "URL deve ser https://"),
  payload: z.record(z.string(), z.unknown()),
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...CORS },
  });
}

export const Route = createFileRoute("/api/public/lead-webhook")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      POST: async ({ request }) => {
        let parsed;
        try {
          parsed = schema.parse(await request.json());
        } catch (e) {
          return json({ ok: false, error: e instanceof Error ? e.message : "payload inválido" }, 400);
        }
        try {
          const res = await fetch(parsed.url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(parsed.payload),
          });
          if (!res.ok) {
            const text = (await res.text().catch(() => "")).slice(0, 300);
            return json({ ok: false, status: res.status, error: `Destino respondeu ${res.status}. ${text}` }, 502);
          }
          return json({ ok: true, status: res.status });
        } catch (e) {
          return json({ ok: false, error: e instanceof Error ? e.message : "falha de rede" }, 502);
        }
      },
    },
  },
});
