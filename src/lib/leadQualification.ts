/**
 * Lead qualification, heurística sóbria para roteamento de UX pós-submit.
 *
 * NÃO descarta leads. Apenas determina se o usuário deve ver a página de
 * obrigado "qualificado" (caminho direto à consultoria) ou "nao_qualificado"
 * (acolher + convidar a estudar antes). O lead é sempre persistido em
 * dataStore.leads para que o time decida como tratar.
 *
 * O scoring tunável do admin (src/lib/scoring.ts) segue sendo a fonte
 * canônica de priorização, esta função existe só para roteamento de tela.
 */
import type { LeadInput } from "./leadScoring";

export type QualResult = "qualificado" | "nao_qualificado";

export interface QualificationOutcome {
  result: QualResult;
  reasons: string[];
}

export function evaluateQualification(d: LeadInput): QualificationOutcome {
  const reasons: string[] = [];

  if (d.formacao === "sem_superior") {
    reasons.push("Sem ensino superior. EB-2 NIW exige diploma superior + experiência ou pós.");
  }
  if (d.renda === "ate_10") {
    reasons.push("Faixa de renda atual abaixo do mínimo recomendado para o investimento do processo.");
  }
  if (d.profissao === "outra" && (d.renda === "ate_10" || d.renda === "10_20")) {
    reasons.push("Área de atuação fora das categorias com histórico recorrente de aprovação combinada à faixa de renda atual.");
  }

  return {
    result: reasons.length === 0 ? "qualificado" : "nao_qualificado",
    reasons,
  };
}
