/**
 * Auth do painel admin — PROTOTYPE-GRADE.
 *
 * ⚠️ ATENÇÃO DE SEGURANÇA:
 *   Esta autenticação roda 100% no client (localStorage). NÃO é segurança real.
 *   Serve apenas ao período de validação (sem leads reais em produção).
 *   Antes de tráfego pago, MIGRAR para Supabase Auth + RLS:
 *     - trocar checkCredentials por supabase.auth.signInWithPassword
 *     - trocar a flag de sessão por supabase.auth.getSession()
 *     - proteger /admin/* por um middleware server-side
 *
 * Primeiro admin via env (Vite):
 *   VITE_ADMIN_EMAIL=admin@statusnaamerica.com
 *   VITE_ADMIN_PASSWORD=trocar-isto
 * No primeiro login válido, o registro é semeado em `admin_users`.
 * Novos usuários SÓ podem ser criados de dentro de /admin/usuarios.
 */

import { get, list, newId, set, remove } from "@/lib/dataStore";

export interface AdminUser {
  id: string;
  email: string;
  /** Hash simples (NÃO é seguro — apenas para validação). */
  password_hash: string;
  role: "admin" | "editor";
  createdAt: string;
}

const SESSION_KEY = "status_admin_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 12; // 12h

interface SessionPayload {
  userId: string;
  email: string;
  exp: number;
  sig: string;
}

/** Hash pseudo-aleatório — apenas para não deixar senhas em texto puro no LS. */
function hashPassword(pw: string): string {
  let h = 5381;
  for (let i = 0; i < pw.length; i++) h = (h * 33) ^ pw.charCodeAt(i);
  // mistura com sal fixo do projeto
  const salt = "status_na_america_v1";
  let s = 0;
  for (let i = 0; i < salt.length; i++) s = (s * 31 + salt.charCodeAt(i)) >>> 0;
  return (h >>> 0).toString(16) + "." + (s ^ h >>> 0).toString(16);
}

function sign(payload: Omit<SessionPayload, "sig">): string {
  return hashPassword(JSON.stringify(payload));
}

function readSession(): SessionPayload | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SessionPayload;
    if (parsed.exp < Date.now()) return null;
    const expected = sign({ userId: parsed.userId, email: parsed.email, exp: parsed.exp });
    if (expected !== parsed.sig) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function getCurrentSession(): SessionPayload | null {
  return readSession();
}

export function isAuthenticated(): boolean {
  return !!readSession();
}

/** Sem usuários no LS? semeia o admin do .env no PRIMEIRO login válido. */
async function ensureEnvAdmin(email: string, password: string): Promise<void> {
  const envEmail = import.meta.env.VITE_ADMIN_EMAIL as string | undefined;
  const envPass = import.meta.env.VITE_ADMIN_PASSWORD as string | undefined;
  if (!envEmail || !envPass) return;
  if (email.trim().toLowerCase() !== envEmail.trim().toLowerCase()) return;
  if (password !== envPass) return;

  const existing = (await list<AdminUser>("admin_users")).find(
    (u) => u.email.toLowerCase() === envEmail.toLowerCase()
  );
  if (existing) return;

  const u: AdminUser = {
    id: newId("user"),
    email: envEmail,
    password_hash: hashPassword(envPass),
    role: "admin",
    createdAt: new Date().toISOString(),
  };
  await set("admin_users", u.id, u);
}

export async function login(email: string, password: string): Promise<{ ok: boolean; error?: string }> {
  await ensureEnvAdmin(email, password);
  const users = await list<AdminUser>("admin_users");
  const user = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  if (!user) return { ok: false, error: "Credenciais inválidas." };
  if (user.password_hash !== hashPassword(password)) {
    return { ok: false, error: "Credenciais inválidas." };
  }
  const exp = Date.now() + SESSION_TTL_MS;
  const base = { userId: user.id, email: user.email, exp };
  const payload: SessionPayload = { ...base, sig: sign(base) };
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(payload));
  return { ok: true };
}

export function logout() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SESSION_KEY);
}

/* ---------------- CRUD de usuários (apenas de dentro do admin) ---------------- */

export async function listUsers(): Promise<AdminUser[]> {
  return list<AdminUser>("admin_users");
}

export async function createUser(input: {
  email: string;
  password: string;
  role: AdminUser["role"];
}): Promise<{ ok: boolean; error?: string }> {
  const email = input.email.trim().toLowerCase();
  if (!email || !input.password) return { ok: false, error: "Email e senha são obrigatórios." };
  const existing = (await list<AdminUser>("admin_users")).find((u) => u.email.toLowerCase() === email);
  if (existing) return { ok: false, error: "Já existe um usuário com este email." };
  const u: AdminUser = {
    id: newId("user"),
    email,
    password_hash: hashPassword(input.password),
    role: input.role,
    createdAt: new Date().toISOString(),
  };
  await set("admin_users", u.id, u);
  return { ok: true };
}

export async function updateUserPassword(id: string, password: string): Promise<void> {
  const u = await get<AdminUser>("admin_users", id);
  if (!u) return;
  await set("admin_users", id, { ...u, password_hash: hashPassword(password) });
}

export async function updateUserRole(id: string, role: AdminUser["role"]): Promise<void> {
  const u = await get<AdminUser>("admin_users", id);
  if (!u) return;
  await set("admin_users", id, { ...u, role });
}

export async function deleteUser(id: string): Promise<void> {
  await remove("admin_users", id);
}
