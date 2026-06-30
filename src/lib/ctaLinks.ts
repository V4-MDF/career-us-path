/**
 * Helper para gerar o href da LP de avaliação preservando UTMs e adicionando
 * `seg` (segmento da LP de origem) e `src` (página de origem).
 *
 * Como funciona:
 *  - Em SSR retorna "/avaliacao" puro.
 *  - No browser, lê window.location.search e preserva todos os params
 *    (utm_*, gclid, fbclid, ref etc.), sobrepondo seg/src quando passados.
 *
 * Uso:
 *   <a href={avaliacaoHref("home_hero")}>...</a>
 *   <a href={avaliacaoHref("lp_medicos", "medicos")}>...</a>
 */
export function avaliacaoHref(src: string, seg?: string): string {
  if (typeof window === "undefined") return "/avaliacao";
  const incoming = new URLSearchParams(window.location.search);
  const out = new URLSearchParams();

  // Preserva tudo que veio na URL atual (utm_*, gclid, fbclid, etc.)
  incoming.forEach((value, key) => {
    if (key === "src" || key === "seg") return; // serão sobrescritos abaixo
    if (value) out.set(key, value);
  });

  if (seg) out.set("seg", seg);
  out.set("src", src);

  const qs = out.toString();
  return qs ? `/avaliacao?${qs}` : "/avaliacao";
}
