/**
 * /sitemap.xml — gerado server-side a partir das rotas indexáveis + posts
 * publicados do blog. /admin e /lp/* são EXCLUÍDOS por design.
 *
 * Observação: o blog vive em localStorage (camada `dataStore`) — o handler
 * server-side não tem acesso direto. Por isso o sitemap server-side lista
 * as rotas estáticas + posts-semente conhecidos. Para regenerar incluindo
 * posts criados no admin, use a ação "Gerar sitemap" em /admin/seo, que
 * monta o XML a partir do estado atual do dataStore (download).
 */

import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

const BASE_URL = "";

interface SitemapEntry {
  path: string;
  changefreq?: "weekly" | "monthly";
  priority?: string;
  lastmod?: string;
}

// Posts-semente (alinhado a src/lib/blog.ts).
// Posts criados via admin não aparecem aqui — usar "Gerar sitemap" no admin.
const SEED_POST_SLUGS = [
  "custo-de-vida-nos-eua-guia-realista",
  "por-que-os-eua-querem-imigrantes-qualificados",
  "eb1-eb2-niw-ou-eb3-qual-green-card",
  "emissao-de-vistos-brasileiros-2026",
];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/vistos/eb2-niw", changefreq: "monthly", priority: "0.9" },
          { path: "/vistos/eb1", changefreq: "monthly", priority: "0.8" },
          { path: "/vistos/eb3", changefreq: "monthly", priority: "0.8" },
          { path: "/sobre", changefreq: "monthly", priority: "0.7" },
          { path: "/contato", changefreq: "monthly", priority: "0.6" },
          { path: "/blog", changefreq: "weekly", priority: "0.7" },
          { path: "/llm-info", changefreq: "monthly", priority: "0.5" },
          ...SEED_POST_SLUGS.map((slug) => ({
            path: `/blog/${slug}`,
            changefreq: "monthly" as const,
            priority: "0.6",
          })),
        ];

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ].filter(Boolean).join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
