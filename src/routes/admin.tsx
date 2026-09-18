/**
 * Layout do painel admin, identidade "Dossiê" (parchment + ink + gold).
 *
 * Auth gate: redireciona para /auth se não autenticado. /admin/login é legado
 * e permanece renderizando fora do shell.
 */
import { Outlet, Link, createFileRoute, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, useSyncExternalStore } from "react";
import {
  BarChart3, BookText, Compass, DollarSign, ExternalLink, FileText, Image as ImageIcon, LayoutDashboard,
  Layers, Link as LinkIcon, LogOut, Menu, Scale, Search, Settings, ShieldCheck,
  Sparkles, Tag, Target, Users, Users2, UserX, X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { BrandLogo } from "@/components/site/BrandLogo";
import {
  getCurrentSession, isAuthenticated, isReady, initAuthListener, logout, subscribeAuth,
} from "@/lib/admin/auth";

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
  { to: "/admin/leads-incompletos", label: "Leads incompletos", icon: UserX },
  { to: "/admin/pre-qualificacao", label: "Pré-qualificação", icon: ShieldCheck },
  { to: "/admin/scoring", label: "Pontuação", icon: Target },
  { to: "/admin/origens", label: "Origens & Canais", icon: Compass },
  { to: "/admin/segmentos", label: "Segmentos / LPs", icon: Tag, badge: "crítico" },

  { to: "/admin/ab", label: "Teste A/B", icon: BarChart3, badge: "crítico" },
  { to: "/admin/blog", label: "Blog", icon: BookText },
  { to: "/admin/conteudo", label: "Textos & Conteúdo", icon: FileText },
  { to: "/admin/salarios", label: "Renda em dólar", icon: DollarSign },
  { to: "/admin/contraste", label: "Brasil × EUA", icon: Scale },
  { to: "/admin/estrutura", label: "Estrutura de Páginas", icon: Layers },
  { to: "/admin/midia", label: "Imagens & Mídia", icon: ImageIcon },
  { to: "/admin/links", label: "Botões & Links", icon: LinkIcon },
  { to: "/admin/seo", label: "SEO", icon: Search },
  { to: "/admin/tracking", label: "Tracking", icon: Sparkles },
  { to: "/admin/usuarios", label: "Administradores", icon: Users2 },
  { to: "/admin/configuracoes", label: "Configurações", icon: Settings },
];

function useAuthSnapshot() {
  return useSyncExternalStore(
    (cb) => subscribeAuth(cb),
    () => `${isReady()}|${isAuthenticated()}|${getCurrentSession()?.userId ?? ""}`,
    () => "false|false|",
  );
}

function AdminLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const [openMobile, setOpenMobile] = useState(false);

  useEffect(() => {
    const unsub = initAuthListener();
    return () => { unsub(); };
  }, []);

  useAuthSnapshot();
  const ready = isReady();
  const authed = isAuthenticated();

  const isLogin = pathname === "/admin/login";

  useEffect(() => {
    if (isLogin) return;
    if (ready && !authed) {
      navigate({ to: "/auth", search: { next: "/admin" }, replace: true });
    }
  }, [ready, authed, isLogin, navigate]);

  if (isLogin) {
    return (
      <div data-admin-shell className="min-h-screen bg-ink">
        <Outlet />
        <Toaster richColors position="top-right" />
      </div>
    );
  }
  if (!ready) {
    return (
      <div data-admin-shell className="min-h-screen grid place-items-center bg-parchment-deep text-ink-text/60 font-mono text-xs uppercase tracking-[0.22em]">
        Carregando…
      </div>
    );
  }
  if (!authed) return null;

  const session = getCurrentSession();
  const activeItem = NAV.find((n) => (n.exact ? pathname === n.to : pathname.startsWith(n.to)));
  const userInitial = session?.email?.trim().charAt(0).toUpperCase() || "A";

  return (
    <div data-admin-shell className="min-h-screen flex bg-parchment-deep text-ink-text">
      {/* Sidebar */}
      <aside
        className={`admin-sidebar fixed inset-y-0 left-0 z-40 w-72 transform border-r transition-transform lg:static lg:w-64 lg:translate-x-0 ${
          openMobile ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-3 border-b border-gold/25 px-5 py-5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-gold/50 bg-parchment">
            <BrandLogo priority className="h-full w-full rounded-full" />
          </div>
          <div className="min-w-0">
            <div className="truncate font-display text-xs font-bold uppercase leading-tight tracking-[0.08em] text-parchment">
              Status Immigration Law Firm
            </div>
            <div className="mt-1 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-gold">
              Painel admin
            </div>
          </div>
        </div>
        <nav className="admin-sidebar-nav space-y-1 overflow-y-auto p-3 pb-20">
          {NAV.map((item) => {
            const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to as string}
                onClick={() => setOpenMobile(false)}
                className={`flex min-h-10 items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                  active
                    ? "admin-nav-active font-semibold"
                    : "admin-nav-idle"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="flex-1 truncate">{item.label}</span>
                {item.badge && !active && (
                  <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.12em] text-gold">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="admin-sidebar-footer absolute inset-x-0 bottom-0 border-t border-gold/25 p-3">
          <Link
            to="/admin/configuracoes"
            onClick={() => setOpenMobile(false)}
            className="admin-user-settings flex min-w-0 items-center gap-3 rounded-md px-2 py-2 transition-colors"
            aria-label="Abrir configurações do usuário"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gold/55 bg-gold/15 font-display text-sm font-bold text-gold">
              {userInitial}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-xs font-semibold text-parchment">
                {session?.email || "Administrador"}
              </span>
              <span className="mt-0.5 block font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-parchment/55">
                Configurações da conta
              </span>
            </span>
            <Settings className="h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
          </Link>
        </div>
      </aside>

      {/* Backdrop mobile */}
      {openMobile && (
        <div className="fixed inset-0 z-30 bg-foreground/45 backdrop-blur-sm lg:hidden" onClick={() => setOpenMobile(false)} />
      )}

      {/* Conteúdo */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="admin-topbar sticky top-0 z-20 flex min-h-16 items-center gap-3 border-b px-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setOpenMobile((o) => !o)}
            aria-label="Menu"
          >
            {openMobile ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <div className="min-w-0 flex-1 truncate font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-text/75">
            <span className="text-gold">Admin</span>
            <span className="mx-2 text-ink-text/30">·</span>
            <span>{activeItem?.label ?? "Painel"}</span>
          </div>
          <a href="/" target="_blank" rel="noopener noreferrer">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 bg-parchment border-ink-text/30 text-ink-text hover:bg-ink-text hover:text-parchment hover:border-ink-text"
            >
              <ExternalLink className="h-3.5 w-3.5" /> Ver site
            </Button>
          </a>
          <div className="hidden sm:block text-xs font-medium text-ink-text max-w-[180px] truncate">
            {session?.email}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-ink-text hover:text-oxblood hover:bg-ink-text/5"
            onClick={async () => { await logout(); navigate({ to: "/auth", replace: true }); }}
          >
            <LogOut className="h-3.5 w-3.5" /> Sair
          </Button>
        </header>
        <main className="mx-auto w-full max-w-[1400px] flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
        <Toaster richColors position="top-right" />
      </div>
    </div>
  );
}
