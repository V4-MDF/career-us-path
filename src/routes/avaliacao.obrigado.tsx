/**
 * /avaliacao/obrigado — rota de compatibilidade.
 *
 * A partir de agora, o formulário redireciona diretamente para
 * /avaliacao/obrigado-qualificado ou /avaliacao/obrigado-nao-qualificado,
 * para que Pixel/GA4 identifiquem cada público em URL própria.
 *
 * Esta rota permanece como fallback: lê o resultado guardado no
 * sessionStorage e redireciona para a URL específica. Sem resultado,
 * cai no fluxo de não-qualificado.
 */
import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ObrigadoFallback,
  readQualificationResult,
} from "@/components/site/ObrigadoContent";

export const Route = createFileRoute("/avaliacao/obrigado")({
  head: () => ({
    meta: [
      { title: "Perfil recebido | Status Immigration Law Firm" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: ObrigadoRouter,
});

function ObrigadoRouter() {
  const navigate = useNavigate();
  useEffect(() => {
    const result = readQualificationResult();
    if (result === "qualificado") {
      navigate({ to: "/avaliacao/obrigado-qualificado", replace: true });
    } else if (result === "nao_qualificado") {
      navigate({ to: "/avaliacao/obrigado-nao-qualificado", replace: true });
    }
  }, [navigate]);
  return <ObrigadoFallback />;
}
