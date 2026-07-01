/**
 * /avaliacao/obrigado — legado. Redireciona para as novas páginas dedicadas
 * conforme o query param `?q=qualificado|nao_qualificado`.
 */
import { createFileRoute, redirect } from "@tanstack/react-router";

interface ObrigadoSearch {
  q?: "qualificado" | "nao_qualificado";
  [k: string]: string | undefined;
}

export const Route = createFileRoute("/avaliacao/obrigado")({
  validateSearch: (s: Record<string, unknown>): ObrigadoSearch => {
    const out: ObrigadoSearch = {};
    Object.entries(s).forEach(([k, v]) => {
      if (typeof v === "string") out[k] = v;
    });
    return out;
  },
  beforeLoad: ({ search }) => {
    throw redirect({
      to:
        search.q === "nao_qualificado"
          ? "/avaliacao/obrigado-nao-qualificado"
          : "/avaliacao/obrigado-qualificado",
      replace: true,
    });
  },
});
