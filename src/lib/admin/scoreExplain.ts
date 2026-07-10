/**
 * Detalhamento do score do lead, espelha a rubrica de leadScoring.ts.
 * Usado no painel de detalhe do lead para mostrar quanto cada critério somou.
 */
import type { LeadInput } from "@/lib/leadScoring";

const PROFISSAO: Record<string, number> = {
  medico: 25, dentista: 25, engenheiro: 25, advogado: 25,
  empresario: 25, ti: 25, outra_qualificada: 12, outra: 4,
};
const FORMACAO: Record<string, number> = {
  doutorado: 25, mestrado: 20, pos: 15, superior: 8, sem_superior: 2,
};
const IDADE: Record<string, number> = {
  ate_29: 4, "30_39": 10, "40_49": 15, "50_mais": 13,
};
const RENDA: Record<string, number> = {
  ate_10: 3, "10_20": 10, "20_40": 18, "40_mais": 25,
};
const MOMENTO: Record<string, number> = {
  ja_decidi: 15, proximos_1_2: 9, sonho: 3,
};

export interface ScoreLine {
  label: string;
  value: string;
  pts: number;
  max: number;
}

const LABELS: Record<string, Record<string, string>> = {
  profissao: {
    medico: "Médico", dentista: "Dentista", engenheiro: "Engenheiro",
    advogado: "Advogado", empresario: "Empresário", ti: "Tecnologia",
    outra_qualificada: "Outra qualificada", outra: "Outra",
  },
  formacao: {
    doutorado: "Doutorado", mestrado: "Mestrado", pos: "Pós-graduação",
    superior: "Superior completo", sem_superior: "Sem superior",
  },
  idade: {
    ate_29: "Até 29 anos", "30_39": "30–39 anos", "40_49": "40–49 anos", "50_mais": "50+",
  },
  renda: {
    ate_10: "Até R$ 10k", "10_20": "R$ 10–20k", "20_40": "R$ 20–40k", "40_mais": "R$ 40k+",
  },
  momento: {
    ja_decidi: "Já decidiu", proximos_1_2: "Próximos 1–2 anos", sonho: "Sonho distante",
  },
};

export function explainScore(lead: LeadInput): { lines: ScoreLine[]; total: number; max: number } {
  const lines: ScoreLine[] = [
    { label: "Profissão", value: LABELS.profissao[lead.profissao] ?? lead.profissao, pts: PROFISSAO[lead.profissao] ?? 0, max: 25 },
    { label: "Formação",  value: LABELS.formacao[lead.formacao] ?? lead.formacao,    pts: FORMACAO[lead.formacao] ?? 0,   max: 25 },
    { label: "Faixa etária", value: LABELS.idade[lead.faixaEtaria] ?? lead.faixaEtaria, pts: IDADE[lead.faixaEtaria] ?? 0,   max: 15 },
    { label: "Renda",     value: LABELS.renda[lead.renda] ?? lead.renda,             pts: RENDA[lead.renda] ?? 0,         max: 25 },
    { label: "Momento",   value: LABELS.momento[lead.momento] ?? lead.momento,       pts: MOMENTO[lead.momento] ?? 0,     max: 15 },
  ];
  return { lines, total: lines.reduce((a, l) => a + l.pts, 0), max: lines.reduce((a, l) => a + l.max, 0) };
}
