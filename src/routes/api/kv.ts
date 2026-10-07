/**
 * Endpoint único do dataStore no navegador. As regras de permissão ficam em
 * `kv.server.ts`; aqui só identificamos quem chama (admin logado ou
 * visitante com `x-client-token`).
 */
import { createFileRoute } from "@tanstack/react-router";

const MAX_BODY = 1_900_000; // D1 aceita até ~2 MB por linha.

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

export const Route = createFileRoute("/api/kv")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { runKv } = await import("@/lib/kv.server");
        const { getAdminEmail } = await import("@/lib/adminAuth.server");

        const raw = await request.text();
        if (raw.length > MAX_BODY) return json({ error: "payload grande demais" }, 413);
        let body;
        try {
          body = JSON.parse(raw);
        } catch {
          return json({ error: "JSON inválido" }, 400);
        }

        const token = (request.headers.get("x-client-token") ?? "").slice(0, 100) || "anon";
        const admin = !!(await getAdminEmail(request));
        try {
          const result = await runKv(body, { admin, token });
          return json({ data: result.data ?? null, error: result.error }, result.status);
        } catch (e) {
          console.error("[api/kv]", e);
          return json({ error: "erro interno" }, 500);
        }
      },
    },
  },
});
