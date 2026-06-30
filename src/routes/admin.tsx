/**
 * Layout do painel admin — tema CLARO, sidebar escura com destaque dourado.
 *
 * Gate de auth client-side: redireciona para /admin/login se não autenticado.
 * /admin/login renderiza fora do shell (sem sidebar).
 *
 * ⚠️ Esta proteção é de UX (validação). Substituir por Supabase Auth + RLS
 *    antes de tráfego pago — ver src/lib/admin/auth.ts.
 */
import { Outlet, Link, createFileRoute, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  BarChart3, BookText, ExternalLink, FileText, Image as ImageIcon, LayoutDashboard,
  Link as LinkIcon, LogOut, Menu, Search, Settings, ShieldCheck,
  Sparkles, Tag, Users, Users2, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { getCurrentSession, isAuthenticated, logout } from "@/lib/admin/auth";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

type NavItem = {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
  badge?: string;
};
const NAV: NavItem[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/leads", label: "Leads", icon: Users, badge: "crítico" },
  { to: "/admin/segmentos", label: "Segmentos / LPs", icon: Tag, badge: "crítico" },
  { to: "/admin/ab", label: "Teste A/B", icon: BarChart3, badge: "crítico" },
  { to: "/admin/blog", label: "Blog", icon: BookText },
  { to: "/admin/conteudo", label: "Textos & Conteúdo", icon: FileText },
  { to: "/admin/midia", label: "Imagens & Mídia", icon: ImageIcon },
  { to: "/admin/links", label: "Botões & Links", icon: LinkIcon },
  { to: "/admin/seo", label: "SEO", icon: Search },
  { to: "/admin/tracking", label: "Tracking", icon: Sparkles },
  { to: "/admin/usuarios", label: "Usuários", icon: Users2 },
  { to: "/admin/configuracoes", label: "Configurações", icon: Settings },
];

function AdminLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [openMobile, setOpenMobile] = useState(false);

  const isLogin = pathname === "/admin/login";

  useEffect(() => {
    if (isLogin) { setAuthed(true); return; }
    if (!isAuthenticated()) {
      navigate({ to: "/admin/login", replace: true });
      setAuthed(false);
    } else {
      setAuthed(true);
    }
  }, [pathname, isLogin, navigate]);

  if (isLogin) {
    return (
      <div className="min-h-screen bg-slate-100">
        <Outlet />
        <Toaster richColors position="top-right" />
      </div>
    );
  }
  if (authed === null) {
    return <div className="min-h-screen grid place-items-center bg-slate-50 text-slate-500">Carregando…</div>;
  }
  if (!authed) return null;

  const session = getCurrentSession();

  return (
    <div className="min-h-screen flex bg-slate-100 text-slate-900">
      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-100 transform transition-transform lg:translate-x-0 ${
          openMobile ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="px-5 py-5 border-b border-slate-800 flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-amber-400 text-slate-900 font-serif text-lg font-bold">S</span>
          <div>
            <div className="font-serif text-sm leading-tight">Status. na América</div>
            <div className="text-[10px] tracking-[0.2em] text-amber-400/80">PAINEL ADMIN</div>
          </div>
        </div>
        <nav className="p-3 space-y-1">
          {NAV.map((item) => {
            const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to as string}
                onClick={() => setOpenMobile(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                  active
                    ? "bg-amber-400 text-slate-900 font-medium"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="flex-1">{item.label}</span>
                {item.badge && !active && (
                  <span className="text-[9px] uppercase tracking-wider text-amber-400/80">{item.badge}</span>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 inset-x-0 p-4 border-t border-slate-800 text-xs text-slate-400 flex items-center gap-2">
          <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
          <span>Modo validação · localStorage</span>
        </div>
      </aside>

      {/* Backdrop mobile */}
      {openMobile && (
        <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setOpenMobile(false)} />
      )}

      {/* Conteúdo */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-14 bg-white border-b border-slate-200 flex items-center px-4 gap-3 sticky top-0 z-20">
          <button className="lg:hidden p-2" onClick={() => setOpenMobile((o) => !o)} aria-label="Menu">
            {openMobile ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div className="flex-1 min-w-0 text-sm text-slate-600 truncate">
            {NAV.find((n) => (n.exact ? pathname === n.to : pathname.startsWith(n.to)))?.label ?? "Admin"}
          </div>
          <a href="/" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" className="gap-1.5">
              <ExternalLink className="h-3.5 w-3.5" /> Ver site
            </Button>
          </a>
          <div className="hidden sm:block text-xs text-slate-500 max-w-[180px] truncate">{session?.email}</div>
          <Button
            variant="ghost" size="sm" className="gap-1.5 text-slate-600"
            onClick={() => { logout(); navigate({ to: "/admin/login", replace: true }); }}
          >
            <LogOut className="h-3.5 w-3.5" /> Sair
          </Button>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1400px] w-full mx-auto">
          <Outlet />
        </main>
        <Toaster richColors position="top-right" />
      </div>
    </div>
  );
}
