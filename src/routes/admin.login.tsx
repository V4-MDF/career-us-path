import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isAuthenticated, login } from "@/lib/admin/auth";

export const Route = createFileRoute("/admin/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) navigate({ to: "/admin", replace: true });
  }, [navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);
    if (res.ok) {
      toast.success("Bem-vindo ao painel.");
      navigate({ to: "/admin", replace: true });
    } else {
      toast.error(res.error ?? "Falha no login.");
    }
  }

  return (
    <div className="min-h-screen grid place-items-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-lg bg-slate-900 text-amber-400 font-serif text-2xl font-bold">S</div>
          <h1 className="mt-4 font-serif text-xl text-slate-900">Status. na América</h1>
          <p className="text-xs uppercase tracking-[0.22em] text-slate-500 mt-1">Painel Admin</p>
        </div>
        <form onSubmit={onSubmit} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="username" required
              value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="password">Senha</Label>
            <Input id="password" type="password" autoComplete="current-password" required
              value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1" />
          </div>
          <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Entrar"}
          </Button>
        </form>
        <div className="mt-4 flex items-start gap-2 text-[11px] text-slate-500">
          <ShieldCheck className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />
          <p>
            Modo validação (client-side). Primeiro admin via <code className="bg-slate-200 px-1 rounded">VITE_ADMIN_EMAIL</code> /
            <code className="bg-slate-200 px-1 rounded ml-1">VITE_ADMIN_PASSWORD</code>. Não há auto-cadastro — novos usuários
            apenas dentro de <em>/admin/usuarios</em>.
          </p>
        </div>
      </div>
    </div>
  );
}
