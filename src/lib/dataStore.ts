/**
 * dataStore, camada única de persistência.
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

import { createClient } from "@supabase/supabase-js";

/**
 * Cliente anônimo com header `x-client-token`.
 *
 * As policies de UPDATE anônimo em `sessions`, `ab_stats` e `leads_partial`
 * exigem que o header `x-client-token` bata com `data->>'client_token'`.
 * Sem isso, o UPDATE é silenciosamente negado e apenas o primeiro INSERT
 * (ex.: só o nome do lead) fica salvo. Por isso todo acesso ao kv_records
 * passa por este cliente, que envia o token em todas as requisições.
 */
const CLIENT_TOKEN_KEY = "sna_client_token";

function getClientToken(): string {
  if (typeof window === "undefined") return "ssr";
  try {
    let t = window.localStorage.getItem(CLIENT_TOKEN_KEY);
    if (!t) {
      t = `ct_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
      window.localStorage.setItem(CLIENT_TOKEN_KEY, t);
    }
    return t;
  } catch {
    return "anon";
  }
}

const SUPABASE_URL =
  (import.meta.env.VITE_SUPABASE_URL as string) || (process.env.SUPABASE_URL as string);
const SUPABASE_KEY =
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string) ||
  (process.env.SUPABASE_PUBLISHABLE_KEY as string);

function isNewApiKey(v: string) {
  return v.startsWith("sb_publishable_") || v.startsWith("sb_secret_");
}

// IMPORTANTE: este cliente NÃO gerencia sessão de auth. Dois GoTrueClient com
// o mesmo storageKey disputam o lock de refresh do token e travam
// `auth.getSession()` (painel admin ficava preso em "Carregando…").
// Aqui apenas reaproveitamos o access token do cliente gerado.
let accessToken: string | null = null;
if (typeof window !== "undefined") {
  void authClient.auth.getSession().then(({ data }) => {
    accessToken = data.session?.access_token ?? null;
  });
  authClient.auth.onAuthStateChange((_e, session) => {
    accessToken = session?.access_token ?? null;
  });
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
  global: {
    headers: { "x-client-token": getClientToken() },
    fetch: (input, init) => {
      const headers = new Headers(
        typeof Request !== "undefined" && input instanceof Request ? input.headers : undefined,
      );
      if (init?.headers) new Headers(init.headers).forEach((v, k) => headers.set(k, v));
      if (isNewApiKey(SUPABASE_KEY) && headers.get("Authorization") === `Bearer ${SUPABASE_KEY}`) {
        headers.delete("Authorization");
      }
      headers.set("apikey", SUPABASE_KEY);
      headers.set("x-client-token", getClientToken());
      if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
      return fetch(input, { ...init, headers });
    },
  },
});


/** Tabelas cuja policy de UPDATE anônimo exige `client_token` no payload. */
const TOKEN_SCOPED: ReadonlyArray<string> = ["sessions", "ab_stats", "leads_partial"];

export type TableName =
  | "leads"
  | "leads_partial"
  | "sessions"
  | "site_content"
  | "segments"
  | "hero_variants"
  | "ab_stats"
  | "admin_users"          // legado, não é mais usado (auth via Supabase)
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
    // limite do localStorage, falha silenciosa, o banco continua sendo a verdade.
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
  // Evitamos `.upsert()` porque o PostgREST, ao traduzir para
  // `INSERT ... ON CONFLICT DO UPDATE`, exige que exista policy de UPDATE para
  // o role, o que quebra o INSERT anônimo em tabelas como `leads` /
  // `prequal_responses` (onde por design não há UPDATE para anon).
  // Estratégia: INSERT; em caso de conflito de unique (23505), UPDATE.
  //
  // Em tabelas "rolling" (sessions / ab_stats / leads_partial) o payload precisa
  // carregar `client_token`, senão a policy de UPDATE anônimo nega a gravação e
  // só o primeiro INSERT sobrevive.
  const payload = (
    TOKEN_SCOPED.includes(table) && value && typeof value === "object"
      ? { ...(value as object), client_token: getClientToken() }
      : value
  ) as T;

  const insert = await supabase
    .from("kv_records")
    .insert({ table_name: table, record_id: id, data: payload as never });

  if (insert.error) {
    if (insert.error.code === "23505") {
      const update = await supabase
        .from("kv_records")
        .update({ data: payload as never, updated_at: new Date().toISOString() })
        .eq("table_name", table)
        .eq("record_id", id);
      if (update.error) {
        console.warn("[dataStore] update falhou", table, id, update.error.message);
      }
    } else {
      // Loga mas mantém cache local, evita perder input do usuário em falha transitória.
      console.warn("[dataStore] insert falhou", table, id, insert.error.message);
    }
  }

  const cache = cacheRead<T>(table);
  cache[id] = payload;
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
