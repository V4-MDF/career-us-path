/**
 * /pre-qualificacao/r/:token, página pública compartilhável do resultado.
 *
 * Lê o registro do dataStore pelo token e renderiza o mesmo componente
 * <PreQualResult> em variante "public" (sem auto-save e sem 1ª pessoa).
 *
 * Casos de uso:
 *  - lead manda o link pelo WhatsApp para o consultor;
 *  - consultor abre o resultado no celular antes da conversa.
 *
 * Não exibe dados sensíveis adicionais, só o veredicto + critérios.
 */

import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { PreQualResult } from "@/components/site/prequal/PreQualResult";
import { get } from "@/lib/dataStore";
import type { PreQualResponse } from "@/lib/prequal";

export const Route = createFileRoute("/pre-qualificacao/r/$token")({
  component: PublicResultPage,
  head: () => ({
    meta: [
      { title: "Resultado do teste de pré-qualificação. Status na América" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

function PublicResultPage() {
  const { token } = Route.useParams();
  const [record, setRecord] = useState<PreQualResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    get<PreQualResponse>("prequal_responses", token).then((r) => {
      if (!active) return;
      setRecord(r);
      setLoading(false);
    });
    return () => { active = false; };
  }, [token]);

  return (
    <main className="bg-ink min-h-screen pt-[68px]">
      <div className="container-x py-12 sm:py-16 max-w-3xl">
        <Link to="/" className="inline-flex items-center gap-1.5 text-[13px] text-foreground/80 hover:text-gold mb-8">
          <ChevronLeft className="h-3.5 w-3.5" /> Voltar ao site
        </Link>

        {loading && (
          <p className="text-foreground/80">Carregando resultado…</p>
        )}

        {!loading && !record && (
          <div className="rounded-2xl border border-gold/20 bg-ink-raise/40 p-8 text-center shadow-soft">
            <h1 className="font-display text-2xl text-foreground">Resultado não encontrado</h1>
            <p className="mt-3 text-foreground/70">
              O link pode ter expirado ou ter sido aberto em outro dispositivo. Faça novamente o
              teste para gerar um novo link público.
            </p>
            <Link to="/pre-qualificacao" className="inline-block mt-6 underline text-gold">
              Refazer o teste
            </Link>
          </div>
        )}

        {!loading && record && <PreQualResult record={record} variant="public" />}
      </div>
    </main>
  );
}
