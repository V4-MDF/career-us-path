import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "@/lib/admin/auth";
import { supabase } from "@/integrations/supabase/client";

const searchSchema = z.object({
  next: z.string().optional(),
});

export const Route = createFileRoute("/auth")({
  validateSearch: (s) => searchSchema.parse(s),
  component: AuthPage,
  head: () => ({
    meta: [
      { title: "Entrar · Status na América" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
});

function AuthPage() {
  const navigate = useNavigate();
  const { next } = useSearch({ from: "/auth" });

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: (next as string) || "/admin", replace: true });
    });
  }, [navigate, next]);

  return (
    <div className="min-h-screen grid place-items-center px-4 bg-slate-50">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-lg bg-slate-900 text-amber-400 font-serif text-2xl font-bold">
            S
          </div>
          <h1 className="mt-4 font-serif text-xl text-slate-900">Status. na América</h1>
          <p className="text-xs uppercase tracking-[0.22em] text-slate-500 mt-1">Área restrita</p>
        </div>

        <SignInForm nextUrl={(next as string) || "/admin"} />

        <div className="mt-4 flex items-start gap-2 text-[11px] text-slate-500">
          <ShieldCheck className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />
          <p>
            Acesso restrito. Novos usuários são criados exclusivamente por um
            administrador em <em>/admin/usuarios</em>.
          </p>
        </div>
      </div>
    </div>
  );
}

function SignInForm({ nextUrl }: { nextUrl: string }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);
    if (res.ok) {
      toast.success("Bem-vindo.");
      navigate({ to: nextUrl, replace: true });
    } else {
      toast.error(res.error ?? "Falha no login.");
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm space-y-4"
    >
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email" type="email" autoComplete="username" required
          value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="password">Senha</Label>
        <Input
          id="password" type="password" autoComplete="current-password" required
          value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1"
        />
      </div>
      <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white" disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Entrar"}
      </Button>
    </form>
  );
}
