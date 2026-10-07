/** Gestão de administradores (só admin logado). */
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

export const Route = createFileRoute("/api/admin/users")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const auth = await import("@/lib/adminAuth.server");
        if (!(await auth.getAdmin(request))) return json({ error: "Não autorizado." }, 401);
        return json({ users: await auth.listAdmins() });
      },
      POST: async ({ request }) => {
        const auth = await import("@/lib/adminAuth.server");
        if (!(await auth.getAdmin(request))) return json({ error: "Não autorizado." }, 401);
        const parsed = z
          .object({
            email: z.string().email("E-mail inválido.").max(200),
            password: z
              .string()
              .min(auth.MIN_PASSWORD_LENGTH, `Senha deve ter no mínimo ${auth.MIN_PASSWORD_LENGTH} caracteres.`)
              .max(200),
          })
          .safeParse(await request.json().catch(() => null));
        if (!parsed.success) return json({ error: parsed.error.issues[0]?.message ?? "Dados inválidos." }, 400);
        return json(await auth.upsertAdmin(parsed.data.email, parsed.data.password));
      },
      DELETE: async ({ request }) => {
        const auth = await import("@/lib/adminAuth.server");
        const me = await auth.getAdmin(request);
        if (!me) return json({ error: "Não autorizado." }, 401);
        const parsed = z.object({ id: z.string().min(1).max(100) }).safeParse(await request.json().catch(() => null));
        if (!parsed.success) return json({ error: "Dados inválidos." }, 400);
        if (parsed.data.id === me.id) return json({ error: "Você não pode remover o próprio acesso." }, 400);
        await auth.removeAdmin(parsed.data.id);
        return json({ ok: true });
      },
    },
  },
});
