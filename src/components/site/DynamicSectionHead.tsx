/**
 * <DynamicSectionHead>, atualiza `<title>` e `<link rel="canonical">`
 * client-side conforme o scroll-spy detecta uma nova dobra ativa.
 *
 * Importante:
 *  - O canonical "duro" emitido por SSR (em head() do route) NÃO muda.
 *    Crawlers que rendem HTML estático sempre veem o canonical da página-mãe.
 *  - Aqui mexemos só no documento ao vivo no browser, para que:
 *     a) Compartilhamentos do navegador peguem hash atual (#dobra).
 *     b) Aba do navegador mostre a dobra ativa.
 *     c) Engines que executam JS (Googlebot moderno) leiam o contexto fino.
 *  - Não cria histórico (replaceState).
 *  - Respeita prefers-reduced-motion (não desativa, só não força scroll).
 *
 * Recebe:
 *  - `sections`: lista do catálogo (sectionMap).
 *  - `baseTitle`: título "limpo" da página (sem brand).
 *  - `brand`: sufixo (default "Status na América").
 */

import { useEffect, useRef } from "react";
import { useScrollSpy, scrollToSection } from "@/hooks/useScrollSpy";
import { LEGACY_HASH_REDIRECTS, type SectionDef } from "@/lib/sectionMap";

interface Props {
  sections: SectionDef[];
  baseTitle: string;
  brand?: string;
  /** Quando true, NÃO atualiza window.location.hash (usado se a rota é a
   *  sub-rota canônica /vistos/$slug/$secao, o hash não faz sentido lá). */
  freezeHash?: boolean;
}

export function DynamicSectionHead({
  sections,
  baseTitle,
  brand = "Status na América",
  freezeHash = false,
}: Props) {
  const ids = sections.map((s) => s.id);
  const activeId = useScrollSpy({ ids, syncHash: !freezeHash });
  const initialHashHandled = useRef(false);
  const originalTitle = useRef<string | null>(null);

  // 1. Deep-link: ao montar, se a URL trouxer #hash legado, redireciona;
  //    se for válido, rola até a section (compensando o header fixo).
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (initialHashHandled.current) return;
    initialHashHandled.current = true;

    const raw = window.location.hash.replace(/^#/, "");
    if (!raw) return;

    const redirected = LEGACY_HASH_REDIRECTS[raw];
    const targetId = redirected ?? raw;
    if (!sections.some((s) => s.id === targetId)) return;

    // Pequeno delay para o layout estabilizar (fontes/imagens da dobra-alvo).
    const t = window.setTimeout(() => scrollToSection(targetId), 80);
    return () => window.clearTimeout(t);
  }, [sections]);

  // 2. Atualiza <title> ao vivo conforme dobra ativa.
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (originalTitle.current === null) originalTitle.current = document.title;

    if (!activeId) {
      document.title = originalTitle.current;
      return;
    }
    const def = sections.find((s) => s.id === activeId);
    if (!def) return;

    // Formato: "<Dobra> · <Página> | Status na América"
    document.title = `${def.label} · ${baseTitle} | ${brand}`;
  }, [activeId, sections, baseTitle, brand]);

  // 3. Atualiza <link rel="canonical"> client-side com o hash atual.
  //    Mantém o canonical SSR (sem hash), apenas anexa o hash quando há dobra.
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (freezeHash) return;
    const link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) return;
    if (!link.dataset.basehref) link.dataset.basehref = link.getAttribute("href") || "";
    const base = link.dataset.basehref;
    const next = activeId ? `${base}#${activeId}` : base;
    link.setAttribute("href", next);
    // Reflete também em og:url ao vivo.
    const og = document.querySelector<HTMLMetaElement>('meta[property="og:url"]');
    if (og) {
      if (!og.dataset.basecontent) og.dataset.basecontent = og.getAttribute("content") || "";
      og.setAttribute("content", activeId ? `${og.dataset.basecontent}#${activeId}` : og.dataset.basecontent);
    }
  }, [activeId, freezeHash]);

  return null;
}
