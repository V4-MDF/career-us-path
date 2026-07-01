import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { login, signUp } from "@/lib/admin/auth";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

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

        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="signin">Entrar</TabsTrigger>
            <TabsTrigger value="signup">Criar conta</TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <SignInForm nextUrl={(next as string) || "/admin"} />
          </TabsContent>
          <TabsContent value="signup">
            <SignUpForm />
          </TabsContent>
        </Tabs>

        <div className="mt-4 flex items-start gap-2 text-[11px] text-slate-500">
          <ShieldCheck className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />
          <p>
            Criar conta é aberto, mas o acesso ao painel exige role <em>admin</em>.
            Um administrador libera em <em>/admin/usuarios</em>.
          </p>
        </div>
      </div>
    </div>
  );
}

function GoogleButton() {
  const [loading, setLoading] = useState(false);
  async function onGoogle() {
    setLoading(true);
    const res = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + "/auth",
    });
    if (res.error) {
      setLoading(false);
      toast.error(res.error.message ?? "Falha no Google Sign-In.");
    }
    // se redirected, o browser navega; caso contrário, o listener trata
  }
  return (
    <Button
      type="button"
      variant="outline"
      className="w-full mt-3"
      onClick={onGoogle}
      disabled={loading}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Continuar com Google"}
    </Button>
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
      className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm space-y-4 mt-3"
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
      <GoogleButton />
    </form>
  );
}

function SignUpForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Senha deve ter no mínimo 6 caracteres.");
      return;
    }
    setLoading(true);
    const res = await signUp(email, password);
    setLoading(false);
    if (!res.ok) {
      toast.error(res.error ?? "Falha ao criar conta.");
      return;
    }
    if (res.needsConfirmation) {
      toast.success("Conta criada. Verifique seu email para confirmar.");
    } else {
      toast.success("Conta criada. Peça a um admin para liberar seu acesso.");
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm space-y-4 mt-3"
    >
      <div>
        <Label htmlFor="su-email">Email</Label>
        <Input
          id="su-email" type="email" autoComplete="email" required
          value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="su-password">Senha</Label>
        <Input
          id="su-password" type="password" autoComplete="new-password" required minLength={6}
          value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1"
        />
      </div>
      <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white" disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Criar conta"}
      </Button>
      <GoogleButton />
    </form>
  );
}
