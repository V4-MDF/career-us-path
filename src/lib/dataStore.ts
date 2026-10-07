/**
 * dataStore, camada única de persistência.
 *
 * IMPLEMENTAÇÃO: Cloudflare D1 via tabela genérica `kv_records`.
 * - No navegador, toda operação passa por POST /api/kv (permissões checadas
 *   no servidor, ver `kv.server.ts`).
 * - No SSR, acessamos o D1 direto com permissão de visitante anônimo.
 *
 * Mantemos um **shadow cache em localStorage** para preservar leituras
 * síncronas em componentes que usam useSyncExternalStore (ex: pageStructure,
 * segments, sessions). A gravação SEMPRE vai para o banco; o cache é
 * atualizado em seguida para os consumidores síncronos verem o novo estado.
 *
 * NENHUM componente deve acessar localStorage diretamente para dados
 * gerenciados por este módulo.
 */

import type { KvOp, KvResult } from "./kv.server";

/**
 * Token anônimo do navegador. Registros de `sessions`, `ab_stats` e
 * `leads_partial` guardam o `client_token` de quem os criou, e só esse
 * navegador pode lê-los/atualizá-los depois.
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

async function call(req: KvOp): Promise<KvResult> {
  if (import.meta.env.SSR) {
    const { runKv } = await import("./kv.server");
    return runKv(req, { admin: false, token: "ssr" });
  }
  try {
    const res = await fetch("/api/kv", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json", "x-client-token": getClientToken() },
      body: JSON.stringify(req),
    });
    const body = (await res.json().catch(() => ({}))) as { data?: unknown; error?: string };
    return { status: res.status, data: body.data, error: body.error };
  } catch (e) {
    return { status: 0, error: e instanceof Error ? e.message : "falha de rede" };
  }
}

const ok = (r: KvResult) => r.status >= 200 && r.status < 300;

/** Tabelas cujo registro pertence ao navegador que o criou (`client_token`). */
const TOKEN_SCOPED: ReadonlyArray<string> = ["sessions", "ab_stats", "leads_partial"];

export type TableName =
  | "leads"
  | "leads_partial"
  | "sessions"
  | "site_content"
  | "segments"
  | "hero_variants"
  | "ab_stats"
  | "admin_users"          // legado, não é mais usado (login fica na tabela D1 admin_users)
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
  const r = await call({ op: "get", table, id });

  if (ok(r) && r.data != null) {
    const cache = cacheRead<T>(table);
    cache[id] = r.data as T;
    cacheWrite(table, cache);
    return r.data as T;
  }
  const cache = cacheRead<T>(table);
  return cache[id] ?? null;
}

export async function list<T = unknown>(table: TableName): Promise<Array<T & { id: string }>> {
  const r = await call({ op: "list", table });

  if (ok(r) && Array.isArray(r.data)) {
    const map: Record<string, T> = {};
    for (const row of r.data as Array<{ id: string; data: T }>) map[row.id] = row.data;
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
  const payload = (
    TOKEN_SCOPED.includes(table) && value && typeof value === "object"
      ? { ...(value as object), client_token: getClientToken() }
      : value
  ) as T;

  const r = await call({ op: "set", table, id, value: payload });
  if (!ok(r)) {
    // Loga mas mantém cache local, evita perder input do usuário em falha transitória.
    console.warn("[dataStore] set falhou", table, id, r.error ?? r.status);
  }

  const cache = cacheRead<T>(table);
  cache[id] = payload;
  cacheWrite(table, cache);
}

export async function remove(table: TableName, id: string): Promise<void> {
  const r = await call({ op: "remove", table, id });
  if (!ok(r)) console.warn("[dataStore] delete falhou", table, id, r.error ?? r.status);

  const cache = cacheRead(table);
  delete cache[id];
  cacheWrite(table, cache);
}

export function newId(prefix = "id"): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}
