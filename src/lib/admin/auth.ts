/**
 * Autenticação do painel admin: e-mail + senha próprios (usuários no D1).
 *
 * - A sessão fica num cookie HttpOnly definido por POST /api/admin/login;
 *   o navegador não tem acesso ao token. Aqui só guardamos QUEM está logado,
 *   lido de GET /api/admin/me.
 * - Não há cadastro público. Admins são criados em /admin/usuarios ou, o
 *   primeiro de todos, pelo script `scripts/criar-admin.mjs`.
 */

export interface AdminSession {
  userId: string;
  email: string;
}

// Cache síncrono da sessão para as APIs sync consumidas pelo layout.
let cachedSession: AdminSession | null = null;
let initialized = false;
let inflight: Promise<void> | null = null;
const listeners = new Set<() => void>();

function notify() {
  for (const l of listeners) l();
}

function setSession(email: string | null) {
  cachedSession = email ? { userId: email, email } : null;
  initialized = true;
  notify();
}

async function hydrate() {
  try {
    const res = await fetch("/api/admin/me", { credentials: "same-origin", cache: "no-store" });
    const body = (await res.json().catch(() => ({}))) as { email?: string | null };
    setSession(res.ok && body.email ? body.email : null);
  } catch {
    setSession(null);
  }
}

/** Deve ser chamado uma vez pelo layout do admin. Idempotente. */
export function initAuthListener(): () => void {
  if (typeof window === "undefined") return () => {};
  if (!inflight) inflight = hydrate();
  return () => {};
}

export function subscribeAuth(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function isReady(): boolean {
  return initialized;
}

export function getCurrentSession(): AdminSession | null {
  return cachedSession;
}

export function isAuthenticated(): boolean {
  return !!cachedSession;
}

export async function login(
  email: string,
  password: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch("/api/admin/login", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim(), password }),
    });
    const body = (await res.json().catch(() => ({}))) as { email?: string; error?: string };
    if (!res.ok || !body.email) return { ok: false, error: body.error ?? "Falha no login." };
    inflight = Promise.resolve();
    setSession(body.email);
    return { ok: true };
  } catch {
    return { ok: false, error: "Sem conexão. Tente de novo." };
  }
}

export async function logout(): Promise<void> {
  try {
    await fetch("/api/admin/logout", { method: "POST", credentials: "same-origin" });
  } catch {
    /* sessão expira sozinha */
  }
  inflight = null;
  setSession(null);
}
