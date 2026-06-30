/**
 * Helper para gerar o href da LP de avaliação preservando UTMs e adicionando
 * `seg` (segmento da LP de origem) e `src` (página de origem).
 *
 * IMPORTANTE — hydration:
 *  - `avaliacaoHref` lê `window.location.search`, então retorna valores
 *    diferentes em SSR vs cliente. Para usar em JSX renderizado, prefira o
 *    hook `useAvaliacaoHref`, que devolve "/avaliacao" no primeiro render
 *    (igual ao SSR) e injeta os params após mount — evita hydration mismatch.
 */
import { useEffect, useState } from "react";

export function avaliacaoHref(src: string, seg?: string): string {
  if (typeof window === "undefined") return "/avaliacao";
  const incoming = new URLSearchParams(window.location.search);
  const out = new URLSearchParams();

  incoming.forEach((value, key) => {
    if (key === "src" || key === "seg") return;
    if (value) out.set(key, value);
  });

  if (seg) out.set("seg", seg);
  out.set("src", src);

  const qs = out.toString();
  return qs ? `/avaliacao?${qs}` : "/avaliacao";
}

/**
 * Hook seguro para SSR. Primeiro render = "/avaliacao" (idêntico ao servidor);
 * após mount, atualiza com os utm/src/seg reais. Evita warning de hydration
 * mismatch e o re-render em cascata que ele provoca no primeiro scroll.
 */
export function useAvaliacaoHref(src: string, seg?: string): string {
  const [href, setHref] = useState<string>("/avaliacao");
  useEffect(() => {
    setHref(avaliacaoHref(src, seg));
  }, [src, seg]);
  return href;
}

