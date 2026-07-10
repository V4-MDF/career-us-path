/**
 * Server function: fetch `page_sections/{slug}` do banco no SSR, para que a
 * ordem/visibilidade das dobras já saia correta no HTML e o cliente hidrate
 * sem flash de reordenação.
 *
 * Usa o cliente publishable server-side (sem sessão, sem localStorage), pois
 * `kv_records` já tem policy pública de SELECT.
 */
import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { reconcile, type PageSlug, type SectionItem } from "@/lib/pageStructure";

export const getPageSectionsFn = createServerFn({ method: "GET" })
  .inputValidator((data: { page: string }) => ({ page: (data?.page ?? "home") as PageSlug }))
  .handler(async ({ data }): Promise<SectionItem[]> => {
    try {
      const url = process.env.SUPABASE_URL;
      const key = process.env.SUPABASE_PUBLISHABLE_KEY;
      if (!url || !key) return reconcile(data.page, null);

      const supabase = createClient(url, key, {
        auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
      });

      const { data: row, error } = await supabase
        .from("kv_records")
        .select("data")
        .eq("table_name", "page_sections")
        .eq("record_id", data.page)
        .maybeSingle();

      if (error || !row) return reconcile(data.page, null);

      const payload = row.data as { items?: SectionItem[] } | null;
      return reconcile(data.page, payload?.items ?? null);
    } catch {
      return reconcile(data.page, null);
    }
  });
