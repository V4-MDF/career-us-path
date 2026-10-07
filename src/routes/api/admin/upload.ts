/**
 * Upload de mídia do admin para o R2. Recebe multipart com `file` e `path`
 * (ex.: "hero/1712345-capa.webp") e devolve a URL pública `/media/<path>`.
 */
import { createFileRoute } from "@tanstack/react-router";

const MAX_BYTES = 50 * 1024 * 1024;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

export const Route = createFileRoute("/api/admin/upload")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { getAdminEmail } = await import("@/lib/adminAuth.server");
        if (!(await getAdminEmail(request))) return json({ error: "Não autorizado." }, 401);

        const form = await request.formData();
        const file = form.get("file");
        const path = String(form.get("path") ?? "");
        if (!(file instanceof File)) return json({ error: "Arquivo ausente." }, 400);
        if (file.size > MAX_BYTES) return json({ error: "Arquivo grande demais." }, 413);
        if (!/^[a-z0-9][a-z0-9/_.-]{0,200}$/i.test(path) || path.includes("..")) {
          return json({ error: "Caminho inválido." }, 400);
        }

        const { env } = await import("cloudflare:workers");
        await env.MEDIA.put(path, file.stream(), {
          httpMetadata: {
            contentType: file.type || "application/octet-stream",
            cacheControl: "public, max-age=31536000, immutable",
          },
        });
        return json({ url: `/media/${path}` });
      },
    },
  },
});
