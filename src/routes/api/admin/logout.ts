/** Encerra a sessão do admin e apaga o cookie. */
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/admin/logout")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { logout, sessionCookie } = await import("@/lib/adminAuth.server");
        await logout(request);
        return new Response(null, {
          status: 204,
          headers: { "Set-Cookie": sessionCookie(request, null), "Cache-Control": "no-store" },
        });
      },
    },
  },
});
