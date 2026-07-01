/**
 * dataStore — camada única de persistência.
 *
 * IMPLEMENTAÇÃO: Lovable Cloud (Postgres) via tabela genérica `kv_records`.
 * Mantemos um **shadow cache em localStorage** para preservar leituras
 * síncronas em componentes que usam useSyncExternalStore (ex: pageStructure,
 * segments, sessions). A gravação SEMPRE vai para o banco; o cache é
 * atualizado em seguida para os consumidores síncronos verem o novo estado.
 *
 * NENHUM componente deve acessar localStorage diretamente para dados
 * gerenciados por este módulo.
 */

import { supabase } from "@/integrations/supabase/client";

export type TableName =
  | "leads"
  | "leads_partial"
  | "sessions"
  | "site_content"
  | "segments"
  | "hero_variants"
  | "ab_stats"
  | "admin_users"          // legado — não é mais usado (auth via Supabase)
  | "settings"
  | "page_seo"
  | "media"
  | "page_sections"
  | "blog_posts"
  | "prequal_responses";

const PREFIX = "status_";
const isBrowser = () => typeof window !== "undefined" && !!window.localStorage;

function cacheRead<T = unknown>(table: TableName): Record<string, T> {
  if (!isBrowser()) return {};
  try {
    const raw = window.localStorage.getItem(PREFIX + table);
    return raw ? (JSON.parse(raw) as Record<string, T>) : {};
  } catch {
    return {};
  }
}

function cacheWrite<T = unknown>(table: TableName, data: Record<string, T>) {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(PREFIX + table, JSON.stringify(data));
  } catch {
    // limite do localStorage — falha silenciosa, o banco continua sendo a verdade.
  }
}

export async function get<T = unknown>(table: TableName, id: string): Promise<T | null> {
  const { data, error } = await supabase
    .from("kv_records")
    .select("data")
    .eq("table_name", table)
    .eq("record_id", id)
    .maybeSingle();

  if (!error && data) {
    const cache = cacheRead<T>(table);
    cache[id] = data.data as T;
    cacheWrite(table, cache);
    return data.data as T;
  }
  const cache = cacheRead<T>(table);
  return cache[id] ?? null;
}

export async function list<T = unknown>(table: TableName): Promise<Array<T & { id: string }>> {
  const { data, error } = await supabase
    .from("kv_records")
    .select("record_id, data")
    .eq("table_name", table);

  if (!error && data) {
    const map: Record<string, T> = {};
    for (const row of data) map[row.record_id] = row.data as T;
    cacheWrite(table, map);
    return Object.entries(map).map(
      ([id, value]) => ({ ...(value as object), id } as T & { id: string })
    );
  }
  const cache = cacheRead<T>(table);
  return Object.entries(cache).map(
    ([id, value]) => ({ ...(value as object), id } as T & { id: string })
  );
}

export async function set<T = unknown>(table: TableName, id: string, value: T): Promise<void> {
  const { error } = await supabase
    .from("kv_records")
    .upsert(
      { table_name: table, record_id: id, data: value as unknown as object },
      { onConflict: "table_name,record_id" }
    );

  if (error) {
    // Loga mas mantém cache local — evita perder input do usuário em falha transitória.
    console.warn("[dataStore] upsert falhou", table, id, error.message);
  }

  const cache = cacheRead<T>(table);
  cache[id] = value;
  cacheWrite(table, cache);
}

export async function remove(table: TableName, id: string): Promise<void> {
  const { error } = await supabase
    .from("kv_records")
    .delete()
    .eq("table_name", table)
    .eq("record_id", id);
  if (error) console.warn("[dataStore] delete falhou", table, id, error.message);

  const cache = cacheRead(table);
  delete cache[id];
  cacheWrite(table, cache);
}

export function newId(prefix = "id"): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}
