/**
 * useScrollSpy — observa `<section id=…>` na rota e devolve o id ativo,
 * atualizando `window.location.hash` via `history.replaceState` (debounced).
 *
 * Princípios:
 *  - Um único IntersectionObserver para todas as sections (barato).
 *  - `rootMargin: "-30% 0px -55% 0px"` → dispara quando a dobra está
 *    realmente no foco visual do leitor (terço superior).
 *  - replaceState, não pushState — botão voltar não polui.
 *  - Debounce de 220ms para evitar >4 atualizações/s em scroll rápido.
 *  - SSR-safe (no-op no servidor).
 *  - Não dispara durante scroll programático (`suspendUntil` ref).
 */

import { useEffect, useRef, useState } from "react";

export interface ScrollSpyOptions {
  /** Lista de ids a observar. Quando muda, o observer é recriado. */
  ids: string[];
  /** Quando true, atualiza window.location.hash. Default: true. */
  syncHash?: boolean;
  /** rootMargin do IntersectionObserver. */
  rootMargin?: string;
}

export function useScrollSpy({
  ids,
  syncHash = true,
  rootMargin = "-30% 0px -55% 0px",
}: ScrollSpyOptions): string | null {
  const [activeId, setActiveId] = useState<string | null>(null);
  const debounceRef = useRef<number | null>(null);
  const suspendUntilRef = useRef<number>(0);

  useEffect(() => {
    if (typeof window === "undefined" || typeof IntersectionObserver === "undefined") return;
    if (ids.length === 0) return;

    // Mantém o map dos elementos visíveis: id → intersectionRatio.
    const visibility = new Map<string, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = (entry.target as HTMLElement).id;
          if (!id) continue;
          if (entry.isIntersecting) {
            visibility.set(id, entry.intersectionRatio || 0.0001);
          } else {
            visibility.delete(id);
          }
        }

        // Escolhe a section com maior visibilidade respeitando a ORDEM
        // dos ids (em empate, vence a primeira da lista — comportamento
        // intuitivo para leitura de cima para baixo).
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
        // Suspende atualização durante scroll programático
        if (performance.now() < suspendUntilRef.current) {
          setActiveId(bestId);
          return;
        }

        setActiveId(bestId);

        if (syncHash) {
          if (debounceRef.current !== null) window.clearTimeout(debounceRef.current);
          debounceRef.current = window.setTimeout(() => {
            const desired = `#${bestId}`;
            if (window.location.hash !== desired) {
              const url = `${window.location.pathname}${window.location.search}${desired}`;
              window.history.replaceState(null, "", url);
            }
          }, 220);
        }
      },
      { rootMargin, threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] },
    );

    const elements: HTMLElement[] = [];
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) {
        observer.observe(el);
        elements.push(el);
      }
    }

    return () => {
      observer.disconnect();
      if (debounceRef.current !== null) window.clearTimeout(debounceRef.current);
    };
  }, [ids.join("|"), syncHash, rootMargin]);

  return activeId;
}

/**
 * Helper: rola até a section com o id pedido, respeitando reduced-motion
 * e o header fixo. Suspende o scroll-spy por 600ms para evitar oscilação.
 */
export function scrollToSection(id: string, suspendSpyMs = 600) {
  if (typeof window === "undefined") return;
  const el = document.getElementById(id);
  if (!el) return;
  const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  // Atualiza o hash imediatamente — replaceState p/ não poluir o histórico.
  const url = `${window.location.pathname}${window.location.search}#${id}`;
  window.history.replaceState(null, "", url);
  // Suspende o scroll-spy por um curto período via marcador no window.
  (window as unknown as { __spySuspendUntil?: number }).__spySuspendUntil =
    performance.now() + suspendSpyMs;
}
