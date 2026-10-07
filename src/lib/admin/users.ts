/** Cliente das rotas /api/admin/users (gestão de administradores). */

export type AdminListItem = {
  user_id: string;
  email: string;
  created_at: string | null;
};

async function call<T>(method: string, body?: unknown): Promise<T> {
  const res = await fetch("/api/admin/users", {
    method,
    credentials: "same-origin",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) throw new Error(data.error || `Falha (${res.status}).`);
  return data;
}

export async function listAdmins(): Promise<AdminListItem[]> {
  const { users } = await call<{ users: Array<{ id: string; email: string; created_at: string }> }>("GET");
  return users.map((u) => ({ user_id: u.id, email: u.email, created_at: u.created_at }));
}

export async function createAdminUser(data: { email: string; password: string }) {
  return call<{ id: string; email: string }>("POST", data);
}

export async function revokeAdmin(data: { user_id: string }) {
  return call<{ ok: true }>("DELETE", { id: data.user_id });
}
