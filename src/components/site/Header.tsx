/**
 * Header, site público "Dossiê / Credencial".
 *
 * Mudanças (Prompt 3.1):
 *  - Removidos os itens soltos EB-2 NIW / EB-1 / EB-3: agora vivem dentro de
 *    UM dropdown "Vistos" (acessível por teclado + tap mobile).
 *  - Removidos os links públicos de segmento (Médicos/Engenheiros/Empresários):
 *    as LPs /lp/:slug são privadas (apenas via URL direta vinda de anúncio).
 *  - Estilo de filete dourado + nav-link com underline animado.
 */

import { Link } from "@tanstack/react-router";
import { ChevronDown, Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAvaliacaoHref } from "@/lib/ctaLinks";
import logoAsset from "@/assets/logo-status-na-america.webp.asset.json";


interface VistoItem {
  label: string;
  hint: string;
  badge?: string;
  to: string;
}

const VISTOS: VistoItem[] = [
  { label: "Visto EB-2 NIW", hint: "Sem patrocinador", badge: "Principal", to: "/vistos/eb2-niw" },
  { label: "Visto EB-1", hint: "Habilidade extraordinária", to: "/vistos/eb1" },
  { label: "Visto EB-3", hint: "Exige patrocinador", to: "/vistos/eb3" },
];

const NAV = [
  { label: "Início", to: "/" as const },
  { label: "Sobre", to: "/sobre" as const },
  { label: "Blog", to: "/blog" as const },
  { label: "Contato", to: "/contato" as const },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [vistosOpen, setVistosOpen] = useState(false);
  const [vistosMobileOpen, setVistosMobileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const avaliacaoHeaderHref = useAvaliacaoHref("header_cta");
  const avaliacaoMobileHref = useAvaliacaoHref("header_mobile_cta");



  // Fecha dropdown ao clicar fora ou ao pressionar Esc
  useEffect(() => {
    if (!vistosOpen) return;
    const onClick = (e: MouseEvent) => {
      if (!dropdownRef.current?.contains(e.target as Node)) setVistosOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setVistosOpen(false); };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [vistosOpen]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-gold/20 bg-ink/95">
      {/* Filete dourado superior, assinatura do dossiê */}
      <div className="h-px w-full bg-gold/40" />

      <div className="container-x flex h-[68px] items-center justify-between gap-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group" aria-label="Status na América. Início">
          <img
            src={logoAsset.url}
            alt="Status na América. Mobilidade Imigratória"
            className="h-11 w-auto md:h-14"
            width={260}
            height={56}
            decoding="async"
          />
        </Link>


        {/* Nav desktop */}
        <nav aria-label="Navegação principal" className="hidden lg:flex items-center gap-8 text-sm">
          <Link to="/" className="nav-link text-foreground/85 hover:text-foreground" activeOptions={{ exact: true }} activeProps={{ "aria-current": "page" }}>
            Início
          </Link>

          {/* Dropdown Vistos */}
          <div ref={dropdownRef} className="relative" onMouseEnter={() => setVistosOpen(true)} onMouseLeave={() => setVistosOpen(false)}>
            <button
              type="button"
              className="nav-link inline-flex items-center gap-1 text-foreground/85 hover:text-foreground"
              aria-haspopup="menu"
              aria-expanded={vistosOpen}
              aria-controls="vistos-menu"
              onClick={() => setVistosOpen((v) => !v)}
            >
              Vistos
              <ChevronDown aria-hidden className={`h-3.5 w-3.5 transition-transform ${vistosOpen ? "rotate-180" : ""}`} />
            </button>

            {vistosOpen && (
              <div
                id="vistos-menu"
                role="menu"
                aria-label="Tipos de visto"
                className="absolute left-1/2 top-full -translate-x-1/2 pt-3 animate-in fade-in slide-in-from-top-2 duration-200"
              >
                <div className="w-[340px] rounded-xl border border-gold/30 bg-ink-deep p-2 shadow-elegant">
                  {/* Filete superior dourado */}
                  <div aria-hidden className="absolute left-6 right-6 top-0 h-[3px] w-10 bg-gold" />
                  {VISTOS.map((v) => (
                    <Link
                      key={v.to}
                      to={v.to}
                      role="menuitem"
                      className="group flex items-start justify-between gap-3 px-4 py-3 hover:bg-gold/5 transition-colors"
                      onClick={() => setVistosOpen(false)}
                      activeProps={{ "aria-current": "page" }}
                    >
                      <div>
                        <div className="font-display text-base text-foreground group-hover:text-gold">
                          {v.label}
                        </div>
                        <div className="font-mono-label mt-1 text-[10px] text-foreground/70">{v.hint}</div>
                      </div>
                      {v.badge && (
                        <span className="shrink-0 rounded-md border border-gold/60 px-2 py-0.5 font-mono-label text-[9px] text-gold">
                          {v.badge}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {NAV.slice(1).map((n) => (
            <Link key={n.to} to={n.to} className="nav-link text-foreground/85 hover:text-foreground" activeProps={{ "aria-current": "page" }}>
              {n.label}
            </Link>
          ))}
        </nav>


        {/* CTA */}
        <div className="flex items-center gap-3">
          <a href={avaliacaoHeaderHref} className="hidden sm:block">
            <Button size="sm" className="btn-label btn-sweep h-10 px-5">Análise gratuita</Button>
          </a>
          <button
            type="button"
            className="lg:hidden grid h-11 w-11 place-items-center rounded-lg border border-gold/40 text-gold"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
          >
            {open ? <X aria-hidden className="h-4 w-4" /> : <Menu aria-hidden className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Menu mobile */}
      {open && (
        <nav id="mobile-menu" aria-label="Navegação móvel" className="lg:hidden border-t border-gold/20 bg-ink">
          <div className="container-x flex flex-col py-5 gap-1">
            {NAV.slice(0, 1).map((n) => (
              <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="min-h-11 flex items-center text-foreground border-b border-gold/10" activeProps={{ "aria-current": "page" }}>
                {n.label}
              </Link>
            ))}

            {/* Acordeão Vistos */}
            <div className="border-b border-gold/10">
              <button
                type="button"
                className="w-full min-h-11 flex items-center justify-between text-foreground"
                onClick={() => setVistosMobileOpen((v) => !v)}
                aria-expanded={vistosMobileOpen}
                aria-controls="mobile-vistos"
              >
                Vistos <ChevronDown aria-hidden className={`h-4 w-4 transition-transform ${vistosMobileOpen ? "rotate-180" : ""}`} />
              </button>
              {vistosMobileOpen && (
                <div id="mobile-vistos" className="pl-3 pb-3 space-y-2 border-l border-gold/30 ml-1">
                  {VISTOS.map((v) => (
                    <Link key={v.to} to={v.to} onClick={() => setOpen(false)} className="block py-2 min-h-11" activeProps={{ "aria-current": "page" }}>
                      <span className="font-display text-base text-foreground">{v.label}</span>
                      <span className="block font-mono-label text-[10px] text-foreground/70">{v.hint}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {NAV.slice(1).map((n) => (
              <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="min-h-11 flex items-center text-foreground border-b border-gold/10" activeProps={{ "aria-current": "page" }}>
                {n.label}
              </Link>
            ))}
            <a href={avaliacaoMobileHref} onClick={() => setOpen(false)} className="mt-4">
              <Button className="btn-label w-full btn-sweep min-h-11">Análise gratuita</Button>
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}

