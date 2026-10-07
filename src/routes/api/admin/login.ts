/** Login do painel admin (e-mail + senha). Define o cookie de sessão. */
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const schema = z.object({
  email: z.string().email().max(200),
  password: z.string().min(1).max(200),
});

function json(body: unknown, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store", ...headers },
  });
}

export const Route = createFileRoute("/api/admin/login")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const origin = request.headers.get("origin");
        if (origin && origin !== new URL(request.url).origin) return json({ error: "Origem inválida." }, 403);

        let input;
        try {
          input = schema.parse(await request.json());
        } catch {
          return json({ error: "Informe e-mail e senha." }, 400);
        }
        const { login, sessionCookie } = await import("@/lib/adminAuth.server");
        const result = await login(request, input.email, input.password);
        if (!result.ok) return json({ error: result.error }, result.status);
        return json({ email: result.email }, 200, { "Set-Cookie": sessionCookie(request, result.token) });
      },
    },
  },
});
