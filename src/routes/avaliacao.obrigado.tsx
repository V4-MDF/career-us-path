/**
 * /avaliacao/obrigado, página de agradecimento única e discreta.
 *
 * A variação (qualificado / não qualificado) é decidida pelo
 * `lastQualificationResult` guardado em sessionStorage no submit do formulário.
 * Dessa forma o URL não revela o resultado ao cliente.
 *
 * SEO: noindex,nofollow.
 */
import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  ObrigadoQualificado,
  ObrigadoNaoQualificado,
  ObrigadoFallback,
  readQualificationResult,
  type QualificationResult,
} from "@/components/site/ObrigadoContent";

export const Route = createFileRoute("/avaliacao/obrigado")({
  head: () => ({
    meta: [
      { title: "Perfil recebido | Status na América" },
      {
        name: "description",
        content:
          "Recebemos seu perfil. Nossa equipe entra em contato em até 48h pelo canal informado.",
      },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: ObrigadoPage,
});

function ObrigadoPage() {
  const [result, setResult] = useState<QualificationResult | "loading">("loading");

  useEffect(() => {
    setResult(readQualificationResult() ?? "nao_qualificado");
  }, []);

  if (result === "loading") {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center">
        <span className="font-mono-label text-sm text-foreground/80">Carregando...</span>
      </div>
    );
  }

  if (result === "qualificado") return <ObrigadoQualificado />;
  if (result === "nao_qualificado") return <ObrigadoNaoQualificado />;
  return <ObrigadoFallback />;
}
