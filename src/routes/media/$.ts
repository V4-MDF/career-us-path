/** Serve arquivos do bucket R2 de mídia (uploads do admin) em /media/<path>. */
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/media/$")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const key = params._splat ?? "";
        if (!key || key.includes("..")) return new Response("Not found", { status: 404 });

        const { env } = await import("cloudflare:workers");
        const obj = await env.MEDIA.get(key, {
          range: request.headers,
          onlyIf: request.headers,
        });
        if (!obj) return new Response("Not found", { status: 404 });

        const headers = new Headers();
        obj.writeHttpMetadata(headers);
        headers.set("etag", obj.httpEtag);
        headers.set("accept-ranges", "bytes");
        if (!headers.has("cache-control")) {
          headers.set("cache-control", "public, max-age=31536000, immutable");
        }

        // Precondição (If-None-Match etc.) satisfeita → sem corpo.
        if (!("body" in obj)) return new Response(null, { status: 304, headers });

        const range = obj.range as { offset?: number; length?: number } | undefined;
        if (range && request.headers.has("range")) {
          const start = range.offset ?? 0;
          const end = start + (range.length ?? obj.size - start) - 1;
          headers.set("content-range", `bytes ${start}-${end}/${obj.size}`);
          headers.set("content-length", String(end - start + 1));
          return new Response(obj.body, { status: 206, headers });
        }
        headers.set("content-length", String(obj.size));
        return new Response(obj.body, { headers });
      },
    },
  },
});
