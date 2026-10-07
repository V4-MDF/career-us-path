/**
 * Server function: fetch `page_sections/{slug}` do banco no SSR, para que a
 * ordem/visibilidade das dobras já saia correta no HTML e o cliente hidrate
 * sem flash de reordenação.
 *
 * Lê direto do D1 (`page_sections` é conteúdo público).
 */
import { createServerFn } from "@tanstack/react-start";
import { reconcile, type PageSlug, type SectionItem } from "@/lib/pageStructure";

export const getPageSectionsFn = createServerFn({ method: "GET" })
  .inputValidator((data: { page: string }) => ({ page: (data?.page ?? "home") as PageSlug }))
  .handler(async ({ data }): Promise<SectionItem[]> => {
    try {
      const { runKv } = await import("@/lib/kv.server");
      const res = await runKv(
        { op: "get", table: "page_sections", id: data.page },
        { admin: false, token: "ssr" },
      );
      const payload = res.data as { items?: SectionItem[] } | null;
      return reconcile(data.page, payload?.items ?? null);
    } catch {
      return reconcile(data.page, null);
    }
  });
