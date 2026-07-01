/**
 * Server functions para gestão de usuários admin.
 *
 * Só admins autenticados podem chamar. Usam `supabaseAdmin` para acessar
 * `auth.users` (que não é exposto via API pública) e a tabela user_roles.
 */

import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error || !data) throw new Error("Forbidden");
}

export type AdminListItem = {
  user_id: string;
  email: string;
  created_at: string | null;
};

export const listAdmins = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminListItem[]> => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: roles, error } = await supabaseAdmin
      .from("user_roles")
      .select("user_id, created_at")
      .eq("role", "admin");
    if (error) throw new Error(error.message);
    if (!roles || roles.length === 0) return [];

    // fetch emails via admin api
    const { data: usersPage, error: uerr } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 200,
    });
    if (uerr) throw new Error(uerr.message);
    const emailById = new Map<string, string>();
    for (const u of usersPage.users) emailById.set(u.id, u.email ?? "");

    return roles.map((r) => ({
      user_id: r.user_id,
      email: emailById.get(r.user_id) ?? "(email não encontrado)",
      created_at: r.created_at,
    }));
  });

export const createAdminUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      email: z.string().email(),
      password: z.string().min(8, "Senha deve ter no mínimo 8 caracteres."),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const email = data.email.trim().toLowerCase();

    // Try to find existing user
    let userId: string | null = null;
    for (let page = 1; page <= 10 && !userId; page++) {
      const { data: pageData, error } = await supabaseAdmin.auth.admin.listUsers({
        page, perPage: 200,
      });
      if (error) throw new Error(error.message);
      const found = pageData.users.find((u) => (u.email ?? "").toLowerCase() === email);
      if (found) userId = found.id;
      if (pageData.users.length < 200) break;
    }

    // Create if missing
    if (!userId) {
      const { data: created, error: cerr } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: data.password,
        email_confirm: true,
      });
      if (cerr || !created.user) throw new Error(cerr?.message || "Falha ao criar usuário.");
      userId = created.user.id;
    } else {
      // Update password for existing user
      const { error: uerr } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        password: data.password,
      });
      if (uerr) throw new Error(uerr.message);
    }

    const { error: insErr } = await supabaseAdmin
      .from("user_roles")
      .upsert({ user_id: userId, role: "admin" }, { onConflict: "user_id,role" });
    if (insErr) throw new Error(insErr.message);

    return { ok: true, user_id: userId, email };
  });

export const revokeAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ user_id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    if (data.user_id === context.userId) {
      throw new Error("Você não pode remover o próprio acesso admin.");
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("user_roles")
      .delete()
      .eq("user_id", data.user_id)
      .eq("role", "admin");
    if (error) throw new Error(error.message);
    return { ok: true };
  });
