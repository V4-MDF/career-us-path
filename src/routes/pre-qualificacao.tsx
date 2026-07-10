/**
 * /pre-qualificacao. Teste estruturado de pré-qualificação.
 *
 * Diferente de /avaliacao (formulário comercial curto), aqui o respondente
 * tem um questionário longo (4 etapas) que gera um VEREDICTO automático por
 * visto (EB-1A, EB-2 NIW, O-1, EB-3) com link público compartilhável e CTA
 * para WhatsApp.
 *
 * Fluxo:
 *  1) renderiza <PreQualForm>;
 *  2) ao submeter → qualifyVisas() + saveResponse() → setResult(record);
 *  3) renderiza <PreQualResult variant="personal">.
 *
 * SEO: noindex (página de conversão, não institucional).
 */

import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { PreQualForm } from "@/components/site/prequal/PreQualForm";
import { PreQualResult } from "@/components/site/prequal/PreQualResult";
import { qualifyVisas } from "@/lib/visaQualifier";
import { saveResponse, type PreQualAnswers, type PreQualResponse } from "@/lib/prequal";
import { getOrigin } from "@/lib/origin";

export const Route = createFileRoute("/pre-qualificacao")({
  component: PreQualPage,
  head: () => ({
    meta: [
      { title: "Teste de pré-qualificação. Status na América" },
      { name: "description", content: "Descubra em minutos qual visto americano (EB-1A, EB-2 NIW, O-1 ou EB-3) tem mais afinidade com o seu perfil." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

function PreQualPage() {
  const [submitting, setSubmitting] = useState(false);
  const [record, setRecord] = useState<PreQualResponse | null>(null);

  async function handleSubmit(answers: PreQualAnswers) {
    setSubmitting(true);
    try {
      const result = qualifyVisas(answers);
      const origin = getOrigin("/pre-qualificacao");
      const saved = await saveResponse(answers, result, origin);
      setRecord(saved);
      // scroll suave ao topo para o usuário ver o veredicto
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="bg-ink min-h-screen pt-[68px]">
      {/* Glow gold sutil no topo */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-[68px] h-64 bg-gradient-to-b from-gold/[0.06] to-transparent" />

      <div className="container-x py-12 sm:py-16 max-w-3xl relative">
        <Link to="/" className="inline-flex items-center gap-1.5 text-[13px] text-foreground/80 hover:text-gold mb-8">
          <ChevronLeft className="h-3.5 w-3.5" /> Voltar ao site
        </Link>

        {!record && (
          <>
            <header className="mb-10">
              <p className="font-mono-label text-gold/80">PRÉ-QUALIFICAÇÃO · 4 ETAPAS · ~5 MIN</p>
              <h1 className="mt-3 font-display text-3xl sm:text-4xl leading-tight text-foreground">
                Descubra qual visto americano tem mais afinidade com o seu perfil.
              </h1>
              <p className="mt-4 text-foreground/75 max-w-2xl">
                Avaliamos seu perfil contra os critérios dos vistos <strong>EB-1A</strong>,
                <strong> EB-2 NIW</strong>, <strong>O-1</strong> e <strong>EB-3</strong>. Ao final você
                recebe um resultado imediato, com pontos fortes, lacunas e um link público
                para conversar pelo WhatsApp com nossa equipe.
              </p>
            </header>

            <PreQualForm onSubmit={handleSubmit} submitting={submitting} />
          </>
        )}

        {record && <PreQualResult record={record} variant="personal" />}
      </div>
    </main>
  );
}
