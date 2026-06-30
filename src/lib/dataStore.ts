/**
 * dataStore — camada única de persistência.
 *
 * Implementação atual: localStorage (chave `status_${table}`).
 * Toda persistência do app passa por aqui. Para migrar para Supabase no futuro,
 * basta reescrever este arquivo mantendo a mesma API assíncrona.
 *
 * NENHUM componente deve acessar localStorage diretamente.
 */

export type TableName =
  | "leads"
  | "site_content"
  | "segments"
  | "hero_variants"
  | "ab_stats"
  | "admin_users"
  | "settings"      // chave/valor: branding, contatos, links, tracking
  | "page_seo"      // SEO por página (id = slug da página)
  | "media"         // imagens/logos/og (id = slot)
  | "page_sections"; // ordem/ativação das dobras por página

const PREFIX = "status_";

const isBrowser = () => typeof window !== "undefined" && !!window.localStorage;

function readTable<T = unknown>(table: TableName): Record<string, T> {
  if (!isBrowser()) return {};
  try {
    const raw = window.localStorage.getItem(PREFIX + table);
    return raw ? (JSON.parse(raw) as Record<string, T>) : {};
  } catch {
    return {};
  }
}

function writeTable<T = unknown>(table: TableName, data: Record<string, T>) {
  if (!isBrowser()) return;
  window.localStorage.setItem(PREFIX + table, JSON.stringify(data));
}

export async function get<T = unknown>(table: TableName, id: string): Promise<T | null> {
  const data = readTable<T>(table);
  return data[id] ?? null;
}

export async function list<T = unknown>(table: TableName): Promise<Array<T & { id: string }>> {
  const data = readTable<T>(table);
  return Object.entries(data).map(([id, value]) => ({ ...(value as object), id } as T & { id: string }));
}

export async function set<T = unknown>(table: TableName, id: string, value: T): Promise<void> {
  const data = readTable<T>(table);
  data[id] = value;
  writeTable(table, data);
}

export async function remove(table: TableName, id: string): Promise<void> {
  const data = readTable(table);
  delete data[id];
  writeTable(table, data);
}

export function newId(prefix = "id"): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}
