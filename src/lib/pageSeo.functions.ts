/**
 * Server function: busca overrides de SEO por página (`page_seo/{slug}`) do
 * banco no SSR, para que o HTML já saia com o title/description/OG editados
 * no admin, sem precisar aguardar hidratação no cliente (crawlers do
 * Google/WhatsApp/Facebook leem só o SSR).
 *
 * Retorna um objeto parcial. Campos vazios/ausentes indicam que o valor
 * default hard-coded na rota deve ser mantido.
 */
import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";

export interface PageSeoOverride {
  meta_title?: string;
  meta_description?: string;
  og_title?: string;
  og_description?: string;
  og_image?: string;
  canonical?: string;
  robots?: "index,follow" | "noindex,follow" | "noindex,nofollow";
}

export const getPageSeoFn = createServerFn({ method: "GET" })
  .inputValidator((data: { page: string }) => ({ page: String(data?.page ?? "home") }))
  .handler(async ({ data }): Promise<PageSeoOverride> => {
    try {
      const url = process.env.SUPABASE_URL;
      const key = process.env.SUPABASE_PUBLISHABLE_KEY;
      if (!url || !key) return {};
      const supabase = createClient(url, key, {
        auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
      });
      const { data: row, error } = await supabase
        .from("kv_records")
        .select("data")
        .eq("table_name", "page_seo")
        .eq("record_id", data.page)
        .maybeSingle();
      if (error || !row) return {};
      const payload = (row.data ?? {}) as PageSeoOverride;
      // Ignora strings vazias — assim o admin pode "resetar" um campo para o default.
      const clean: PageSeoOverride = {};
      (Object.keys(payload) as Array<keyof PageSeoOverride>).forEach((k) => {
        const v = payload[k];
        if (typeof v === "string" && v.trim() !== "") {
          (clean as Record<string, string>)[k] = v;
        }
      });
      return clean;
    } catch {
      return {};
    }
  });

/**
 * Helper puro, usado no head() de cada rota: retorna o array `meta` +
 * `links` já reconciliados com os overrides do admin.
 */
export function buildSeoTags(defaults: {
  title: string;
  description: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonical: string;
  robots?: string;
  ogType?: string;
  twitterCard?: string;
}, override: PageSeoOverride | undefined) {
  const o = override ?? {};
  const title = o.meta_title || defaults.title;
  const description = o.meta_description || defaults.description;
  const ogTitle = o.og_title || defaults.ogTitle || title;
  const ogDescription = o.og_description || defaults.ogDescription || description;
  const ogImage = o.og_image || defaults.ogImage;
  // canonical do admin pode vir como caminho relativo ("/", "/sobre") — resolve
  // contra o domínio de produção só quando começa com "/".
  const canonicalRaw = o.canonical?.trim() || defaults.canonical;
  const canonical = canonicalRaw.startsWith("http")
    ? canonicalRaw
    : `https://lp.statusnaamerica.com${canonicalRaw.startsWith("/") ? canonicalRaw : `/${canonicalRaw}`}`;
  const robots = o.robots || defaults.robots || "index,follow";

  const meta: Array<Record<string, string>> = [
    { title },
    { name: "description", content: description },
    { name: "robots", content: robots },
    { property: "og:title", content: ogTitle },
    { property: "og:description", content: ogDescription },
    { property: "og:type", content: defaults.ogType || "website" },
    { property: "og:url", content: canonical },
    { name: "twitter:card", content: defaults.twitterCard || "summary_large_image" },
    { name: "twitter:title", content: ogTitle },
    { name: "twitter:description", content: ogDescription },
  ];
  if (ogImage) {
    meta.push({ property: "og:image", content: ogImage });
    meta.push({ name: "twitter:image", content: ogImage });
  }
  const links = [{ rel: "canonical", href: canonical }];
  return { meta, links };
}
