/** Sessão do admin: devolve o e-mail do admin logado (cookie de sessão). */
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/admin/me")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { getAdminEmail } = await import("@/lib/adminAuth.server");
        const email = await getAdminEmail(request);
        return new Response(JSON.stringify({ email }), {
          status: email ? 200 : 401,
          headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
        });
      },
    },
  },
});
