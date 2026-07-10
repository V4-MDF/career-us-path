/**
 * useScrollSpy, observa `<section id=…>` na rota e devolve o id ativo,
 * atualizando `window.location.hash` via `history.replaceState` (debounced).
 *
 * Princípios (revisado para eliminar jank de scroll, especialmente Safari):
 *  - Um único IntersectionObserver para todas as sections (barato).
 *  - `rootMargin: "-30% 0px -55% 0px"` → dobra em foco visual do leitor.
 *  - Nunca ler/escrever layout no callback (só Map<id, ratio>).
 *  - Só reagimos DEPOIS que o usuário pausa o scroll (~180ms) — evita
 *    setState + replaceState em rajada durante o scroll (Safari repinta
 *    a tab-strip a cada `document.title = ...`, o que trava o gesto).
 *  - Atualiza state e hash na mesma janela (uma única mutação DOM).
 *  - replaceState, não pushState, botão voltar não polui.
 *  - SSR-safe (no-op no servidor).
 *  - Não dispara durante scroll programático (`suspendUntil` ref).
 *  - Sem scrollTo/scrollIntoView em callback de scroll: o scroll é do usuário.
 */

import { useEffect, useRef, useState } from "react";

// Estado compartilhado entre `scrollToSection` e o hook `useScrollSpy`.
// Durante um scroll programático, suspendemos atualizações de activeId/hash
// para evitar "flicker" do título e da URL passando por todas as dobras
// intermediárias durante a animação smooth-scroll.
const programmaticScroll = {
  /** timestamp (performance.now) até quando ignorar updates do observer */
  until: 0,
  /** id-alvo do scroll programático, vira activeId imediatamente */
  targetId: null as string | null,
};

export interface ScrollSpyOptions {
  /** Lista de ids a observar. Quando muda, o observer é recriado. */
  ids: string[];
  /** Quando true, atualiza window.location.hash. Default: true. */
  syncHash?: boolean;
  /** rootMargin do IntersectionObserver. */
  rootMargin?: string;
  /** Debounce (ms) do settle após o observer. Default 180ms. */
  settleMs?: number;
}

export function useScrollSpy({
  ids,
  syncHash = true,
  rootMargin = "-30% 0px -55% 0px",
  settleMs = 180,
}: ScrollSpyOptions): string | null {
  const [activeId, setActiveId] = useState<string | null>(null);
  const activeIdRef = useRef<string | null>(null);
  const settleRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || typeof IntersectionObserver === "undefined") return;
    if (ids.length === 0) return;

    const visibility = new Map<string, number>();

    const scheduleSettle = () => {
      if (settleRef.current !== null) window.clearTimeout(settleRef.current);
      settleRef.current = window.setTimeout(() => {
        // Escolhe a dobra com maior ratio no momento do "settle".
        let bestId: string | null = null;
        let bestRatio = 0;
        for (const id of ids) {
          const r = visibility.get(id) ?? 0;
          if (r > bestRatio) {
            bestRatio = r;
            bestId = id;
          }
        }
        if (!bestId) return;
        if (bestId === activeIdRef.current) return; // idempotente

        activeIdRef.current = bestId;
        setActiveId(bestId);

        if (syncHash) {
          const desired = `#${bestId}`;
          if (window.location.hash !== desired) {
            const url = `${window.location.pathname}${window.location.search}${desired}`;
            window.history.replaceState(null, "", url);
          }
        }
      }, settleMs);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        // Atualiza o mapa de visibilidade SEM tocar em DOM/estado.
        for (const entry of entries) {
          const id = (entry.target as HTMLElement).id;
          if (!id) continue;
          if (entry.isIntersecting) {
            visibility.set(id, entry.intersectionRatio || 0.0001);
          } else {
            visibility.delete(id);
          }
        }

        // Scroll programático em andamento: mantém activeId travado no alvo,
        // sem tocar em URL/título — o `scrollToSection` já fez isso uma vez.
        if (performance.now() < programmaticScroll.until) {
          if (
            programmaticScroll.targetId &&
            programmaticScroll.targetId !== activeIdRef.current
          ) {
            activeIdRef.current = programmaticScroll.targetId;
            setActiveId(programmaticScroll.targetId);
          }
          return;
        }

        // Debounce: só decide a dobra ativa quando o scroll pausa.
        scheduleSettle();
      },
      { rootMargin, threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] },
    );

    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }

    return () => {
      observer.disconnect();
      if (settleRef.current !== null) window.clearTimeout(settleRef.current);
    };
  }, [ids.join("|"), syncHash, rootMargin, settleMs]);

  return activeId;
}

/**
 * Helper: rola até a section com o id pedido, respeitando reduced-motion
 * e o header fixo. Suspende o scroll-spy durante a animação para evitar
 * flicker do <title> e do hash passando por todas as dobras intermediárias.
 *
 * Usado apenas em cliques explícitos (TOC, deep-link inicial). Nunca
 * chamado por handlers de scroll.
 */
export function scrollToSection(id: string, suspendSpyMs = 900) {
  if (typeof window === "undefined") return;
  const el = document.getElementById(id);
  if (!el) return;
  const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  // Trava o spy ANTES de iniciar o scroll programático.
  programmaticScroll.until = performance.now() + (reduced ? 0 : suspendSpyMs);
  programmaticScroll.targetId = id;

  el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });

  // Atualiza o hash uma única vez, imediatamente, sem debounce/flicker.
  const url = `${window.location.pathname}${window.location.search}#${id}`;
  if (window.location.hash !== `#${id}`) {
    window.history.replaceState(null, "", url);
  }
}
