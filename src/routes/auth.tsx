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
import logoAsset from "@/assets/logo-status-na-america.png.asset.json";

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
    <div className="min-h-screen grid place-items-center px-4 bg-ink text-parchment relative overflow-hidden">
      {/* Backdrop dourado sutil */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 15%, var(--gold) 0, transparent 45%), radial-gradient(circle at 80% 85%, var(--gold) 0, transparent 40%)",
        }}
      />
      <div className="w-full max-w-sm relative">
        <div className="text-center mb-8">
          <img
            src={logoAsset.url}
            alt="Status na América"
            className="mx-auto h-14 w-14 rounded-lg object-contain bg-parchment/5 p-1.5"
          />
          <h1 className="mt-5 font-display text-lg font-bold uppercase tracking-[0.14em] text-parchment">
            Status na América
          </h1>
          <div className="mx-auto mt-3 h-px w-10 bg-gold" />
          <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.28em] text-gold/90">
            Área restrita
          </p>
        </div>

        <SignInForm nextUrl={(next as string) || "/admin"} />

        <div className="mt-5 flex items-start gap-2 text-[11px] text-parchment/60">
          <ShieldCheck className="h-3.5 w-3.5 text-gold mt-0.5 shrink-0" />
          <p>
            Acesso restrito. Novos usuários são criados exclusivamente por um
            administrador em <em className="text-parchment/80">/admin/usuarios</em>.
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
      className="relative rounded-2xl border border-gold/20 bg-parchment text-ink-text p-6 space-y-4 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.6)]"
    >
      {/* Filete dourado no topo */}
      <div aria-hidden className="absolute top-0 inset-x-6 h-px bg-gold/60" />
      <div>
        <Label htmlFor="email" className="text-ink-text font-mono text-[10px] uppercase tracking-[0.22em]">
          Email
        </Label>
        <Input
          id="email" type="email" autoComplete="username" required
          value={email} onChange={(e) => setEmail(e.target.value)}
          className="mt-1.5 text-ink-text placeholder:text-ink-text/40 bg-parchment-deep/40 border-ink-text/15 focus-visible:ring-gold"
        />
      </div>
      <div>
        <Label htmlFor="password" className="text-ink-text font-mono text-[10px] uppercase tracking-[0.22em]">
          Senha
        </Label>
        <Input
          id="password" type="password" autoComplete="current-password" required
          value={password} onChange={(e) => setPassword(e.target.value)}
          className="mt-1.5 text-ink-text placeholder:text-ink-text/40 bg-parchment-deep/40 border-ink-text/15 focus-visible:ring-gold"
        />
      </div>
      <Button
        type="submit"
        className="w-full bg-ink hover:bg-ink-raise text-parchment font-display uppercase tracking-[0.14em] text-xs font-semibold"
        disabled={loading}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Entrar"}
      </Button>
    </form>
  );
}
