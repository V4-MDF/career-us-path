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
import {
  getCurrentSession, isAuthenticated, isReady, initAuthListener, logout, subscribeAuth,
} from "@/lib/admin/auth";
import logoAsset from "@/assets/logo-status-na-america.webp.asset.json";

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

  return (
    <div data-admin-shell className="min-h-screen flex bg-parchment-deep text-ink-text">
      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-ink-deep text-parchment border-r border-gold/20 transform transition-transform lg:translate-x-0 ${
          openMobile ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="px-5 py-5 border-b border-gold/15 flex items-center gap-3">
          <img
            src={logoAsset.url}
            alt="Status Immigration Law Firm"
            className="h-9 w-9 rounded-md object-contain bg-parchment/5 p-1"
          />
          <div className="min-w-0">
            <div className="font-display text-xs font-bold uppercase tracking-[0.14em] leading-tight text-parchment truncate">
              Status Immigration Law Firm
            </div>
            <div className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.28em] text-gold/80">
              Painel admin
            </div>
          </div>
        </div>
        <nav className="p-3 space-y-0.5">
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
                    ? "bg-gold text-ink-deep font-semibold"
                    : "text-parchment/75 hover:bg-ink-raise hover:text-parchment"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="flex-1 truncate">{item.label}</span>
                {item.badge && !active && (
                  <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-gold/70">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 inset-x-0 p-4 border-t border-gold/15 font-mono text-[10px] uppercase tracking-[0.22em] text-parchment/50 flex items-center gap-2">
          <ShieldCheck className="h-3.5 w-3.5 text-gold" />
          <span>Auth · Lovable Cloud</span>
        </div>
      </aside>

      {/* Backdrop mobile */}
      {openMobile && (
        <div className="fixed inset-0 bg-ink-deep/60 z-30 lg:hidden" onClick={() => setOpenMobile(false)} />
      )}

      {/* Conteúdo */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-14 bg-parchment border-b border-gold/25 flex items-center px-4 gap-3 sticky top-0 z-20">
          <button
            className="lg:hidden p-2 text-ink-text hover:text-gold transition-colors"
            onClick={() => setOpenMobile((o) => !o)}
            aria-label="Menu"
          >
            {openMobile ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div className="flex-1 min-w-0 font-mono text-[11px] uppercase tracking-[0.22em] text-ink-text/70 truncate">
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
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1400px] w-full mx-auto">
          <Outlet />
        </main>
        <Toaster richColors position="top-right" />
      </div>
    </div>
  );
}
