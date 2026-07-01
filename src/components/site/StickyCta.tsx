import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { useAvaliacaoHref } from "@/lib/ctaLinks";

/**
 * CTA sticky (rodapé) para "Análise gratuita". Aparece após o usuário rolar
 * ~ 60% da viewport e some quando ele chega perto do rodapé ou já está numa
 * página onde o CTA seria redundante (/avaliacao, /pre-qualificacao, /admin, /auth).
 *
 * Notas de implementação:
 *  - Fixed no bottom, respeita safe-area (iOS).
 *  - Não empurra layout: usa `position: fixed` + `pointer-events` gated.
 *  - Respeita prefers-reduced-motion (fade sem translate).
 *  - Renderiza null no SSR para evitar flash — só monta após primeiro effect.
 */
export function StickyCta() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const href = useAvaliacaoHref("sticky-cta");
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    let ticking = false;
    const compute = () => {
      ticking = false;
      const y = window.scrollY;
      const vh = window.innerHeight;
      const docH = document.documentElement.scrollHeight;
      // aparece após 60% de 1 viewport de scroll
      const past = y > vh * 0.6;
      // some quando chega perto do rodapé (CTA final já visível)
      const nearBottom = y + vh > docH - 240;
      setVisible(past && !nearBottom);
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(compute);
    };
    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", compute);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", compute);
    };
  }, [mounted]);

  if (!mounted) return null;

  // Páginas onde o CTA sticky é redundante ou atrapalha.
  const hidden =
    pathname.startsWith("/avaliacao") ||
    pathname.startsWith("/pre-qualificacao") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/auth");
  if (hidden) return null;

  return (
    <div
      aria-hidden={!visible}
      className={[
        "fixed inset-x-0 z-40 flex justify-center px-4",
        "bottom-[max(1rem,env(safe-area-inset-bottom))]",
        "transition-[opacity,transform] duration-300 ease-out motion-reduce:transition-none",
        visible ? "opacity-100 translate-y-0" : "pointer-events-none opacity-0 translate-y-3 motion-reduce:translate-y-0",
      ].join(" ")}
    >
      <Link
        to={href}
        aria-label="Iniciar análise gratuita"
        className="btn-label btn-sweep inline-flex h-12 items-center gap-2 rounded-full border border-gold/40 bg-gold px-6 text-[13px] text-ink shadow-elevated hover:bg-gold/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
      >
        Análise gratuita
        <span aria-hidden>→</span>
      </Link>
    </div>
  );
}
