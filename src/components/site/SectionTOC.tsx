/**
 * <SectionTOC> — sumário das dobras da página.
 *
 * Dois layouts num único componente:
 *  - Desktop (lg+): nav sticky vertical discreto na lateral direita,
 *    estilo MDN/Stripe docs. Item ativo destacado em gold.
 *  - Mobile: chip "Nesta página" + bottom sheet com a lista completa.
 *
 * Só aparece quando `sections.length >= 4` — evita ruído em páginas curtas.
 * Click rola com `scrollIntoView({ behavior: 'smooth' })` e atualiza o hash.
 */

import { useEffect, useState } from "react";
import { ChevronUp, List } from "lucide-react";
import { useScrollSpy, scrollToSection } from "@/hooks/useScrollSpy";
import type { SectionDef } from "@/lib/sectionMap";

interface Props {
  sections: SectionDef[];
  /** Esconde no mobile (chip + sheet). Default false. */
  hideOnMobile?: boolean;
  /** Esconde no desktop (rail). Default false. */
  hideOnDesktop?: boolean;
  /** Variante de cor da rail desktop. */
  variant?: "ink" | "parchment";
}

export function SectionTOC({
  sections,
  hideOnMobile,
  hideOnDesktop,
  variant = "ink",
}: Props) {
  const ids = sections.map((s) => s.id);
  const activeId = useScrollSpy({ ids });
  const [sheetOpen, setSheetOpen] = useState(false);

  if (sections.length < 4) return null;

  const handleClick = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setSheetOpen(false);
    scrollToSection(id);
  };

  const railColor =
    variant === "parchment"
      ? "text-ink-text/70 hover:text-ink-text"
      : "text-foreground/70 hover:text-foreground";
  const activeColor = variant === "parchment" ? "text-ink-text" : "text-foreground";

  return (
    <>
      {/* Desktop rail (lg+) */}
      {!hideOnDesktop && (
        <nav
          aria-label="Nesta página"
          className="hidden lg:block fixed top-[140px] right-5 z-30 w-[200px] max-h-[calc(100vh-200px)] overflow-y-auto pr-1"
        >
          <p id="toc-rail-title" className="font-mono-label text-[9px] text-gold mb-3 px-2">NESTA PÁGINA</p>
          <ul className="space-y-0.5" aria-labelledby="toc-rail-title">
            {sections.map((s) => {
              const isActive = s.id === activeId;
              return (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    onClick={handleClick(s.id)}
                    aria-current={isActive ? "location" : undefined}
                    className={`group flex items-center gap-2 py-2 px-2 text-[12px] leading-tight border-l-2 transition-colors ${
                      isActive
                        ? `border-gold ${activeColor}`
                        : `border-transparent ${railColor} hover:border-gold/50`
                    }`}
                  >
                    <span className="truncate">{s.label}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      )}


      {/* Mobile chip — aparece após scroll inicial */}
      {!hideOnMobile && (
        <MobileChip
          activeLabel={sections.find((s) => s.id === activeId)?.label ?? "Nesta página"}
          onOpen={() => setSheetOpen(true)}
        />
      )}

      {/* Mobile sheet */}
      {sheetOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="toc-sheet-title"
          onClick={() => setSheetOpen(false)}
        >
          <div className="absolute inset-0 bg-ink-deep/70 backdrop-blur-sm" />
          <div
            className="absolute bottom-0 left-0 right-0 max-h-[70vh] overflow-y-auto bg-ink border-t border-gold/30 px-5 pt-5 pb-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <p id="toc-sheet-title" className="font-mono-label text-gold">NESTA PÁGINA</p>
              <button
                onClick={() => setSheetOpen(false)}
                className="min-h-11 min-w-11 grid place-items-center text-foreground/80 hover:text-gold"
                aria-label="Fechar sumário"
              >
                <ChevronUp aria-hidden className="h-4 w-4" />
              </button>
            </div>
            <ul className="space-y-1">
              {sections.map((s) => {
                const isActive = s.id === activeId;
                return (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      onClick={handleClick(s.id)}
                      aria-current={isActive ? "location" : undefined}
                      className={`block min-h-11 py-3 text-base border-b border-gold/10 transition-colors ${
                        isActive ? "text-gold" : "text-foreground hover:text-gold"
                      }`}
                    >
                      {s.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}

    </>
  );
}

function MobileChip({ activeLabel, onOpen }: { activeLabel: string; onOpen: () => void }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onScroll = () => setVisible(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <button
      onClick={onOpen}
      className={`lg:hidden fixed bottom-5 left-1/2 -translate-x-1/2 z-40 inline-flex items-center gap-2 border border-gold/40 bg-ink-deep/90 backdrop-blur px-4 h-10 text-sm text-foreground transition-opacity ${
        visible ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
      aria-label="Abrir sumário desta página"
    >
      <List className="h-3.5 w-3.5 text-gold" />
      <span className="truncate max-w-[200px]">{activeLabel}</span>
    </button>
  );
}
