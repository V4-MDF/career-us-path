/**
 * Autenticação do painel admin — Supabase Auth (Lovable Cloud).
 *
 * - Login por email/senha ou Google.
 * - Acesso ao /admin depende de o usuário ter a role `admin` na tabela
 *   `public.user_roles` (verificação via RPC `has_role`).
 * - Novos usuários fazem cadastro público em /auth (basta um email válido),
 *   mas nenhum acesso admin é concedido automaticamente. Um admin existente
 *   promove usuários em /admin/usuarios.
 *
 * Bootstrap do primeiro admin:
 *   1. Crie uma conta em /auth com o email desejado.
 *   2. Rode no banco: INSERT INTO public.user_roles(user_id, role)
 *      SELECT id, 'admin' FROM auth.users WHERE email='seu@email.com';
 */

import { supabase } from "@/integrations/supabase/client";

export interface AdminSession {
  userId: string;
  email: string;
}

// Cache síncrono da sessão + role para as APIs sync consumidas pelo layout.
let cachedSession: AdminSession | null = null;
let cachedIsAdmin = false;
let initialized = false;
const listeners = new Set<() => void>();

function notify() {
  for (const l of listeners) l();
}

async function refreshRole(userId: string): Promise<boolean> {
  const { data, error } = await supabase.rpc("has_role", {
    _user_id: userId,
    _role: "admin",
  });
  if (error) {
    console.warn("[auth] has_role RPC falhou:", error.message);
    return false;
  }
  return !!data;
}

async function hydrateFromSession() {
  const { data } = await supabase.auth.getSession();
  const s = data.session;
  if (!s?.user) {
    cachedSession = null;
    cachedIsAdmin = false;
  } else {
    cachedSession = { userId: s.user.id, email: s.user.email ?? "" };
    cachedIsAdmin = await refreshRole(s.user.id);
  }
  initialized = true;
  notify();
}

/** Deve ser chamado uma vez pelo layout do admin. Idempotente. */
export function initAuthListener(): () => void {
  if (typeof window === "undefined") return () => {};
  void hydrateFromSession();
  const { data: sub } = supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === "SIGNED_OUT" || !session?.user) {
      cachedSession = null;
      cachedIsAdmin = false;
      notify();
      return;
    }
    if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "USER_UPDATED") {
      cachedSession = { userId: session.user.id, email: session.user.email ?? "" };
      cachedIsAdmin = await refreshRole(session.user.id);
      notify();
    }
  });
  return () => sub.subscription.unsubscribe();
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
  return !!cachedSession && cachedIsAdmin;
}

export async function login(
  email: string,
  password: string
): Promise<{ ok: boolean; error?: string }> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });
  if (error || !data.session) {
    return { ok: false, error: error?.message ?? "Credenciais inválidas." };
  }
  cachedSession = { userId: data.session.user.id, email: data.session.user.email ?? "" };
  cachedIsAdmin = await refreshRole(data.session.user.id);
  notify();
  if (!cachedIsAdmin) {
    return {
      ok: false,
      error: "Sua conta ainda não tem acesso admin. Peça a um administrador para liberar.",
    };
  }
  return { ok: true };
}

export async function signUp(
  email: string,
  password: string
): Promise<{ ok: boolean; error?: string; needsConfirmation?: boolean }> {
  const redirect = typeof window !== "undefined" ? `${window.location.origin}/auth` : undefined;
  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: { emailRedirectTo: redirect },
  });
  if (error) return { ok: false, error: error.message };
  const needsConfirmation = !data.session;
  return { ok: true, needsConfirmation };
}

export async function logout(): Promise<void> {
  await supabase.auth.signOut();
  cachedSession = null;
  cachedIsAdmin = false;
  notify();
}
