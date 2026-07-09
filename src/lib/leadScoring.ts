/**
 * Lead scoring — rubrica do briefing.
 * Score 0–100 + classificação A/B/C/D (não exibida ao usuário).
 */

export interface LeadInput {
  nome: string;
  email: string;
  whatsapp: string;
  objetivo_visto?: "morar" | "trabalhar" | "estudar" | "turismo" | "";
  profissao: string;
  faixaEtaria: string;
  formacao: string;
  cidade: string;
  uf: string;
  renda: string;
  momento: string;
}

export interface ScoredLead extends LeadInput {
  id: string;
  createdAt: string;
  score: number;
  classificacao: "A" | "B" | "C" | "D";
  utm: Record<string, string>;
}

const profissaoScore: Record<string, number> = {
  medico: 25,
  dentista: 25,
  engenheiro: 25,
  advogado: 25,
  empresario: 25,
  ti: 25,
  outra_qualificada: 12,
  outra: 4,
};

const formacaoScore: Record<string, number> = {
  doutorado: 20,
  mestrado: 20,
  pos: 15,
  superior: 8,
  sem_superior: 2,
};

const idadeScore: Record<string, number> = {
  "ate_29": 4,
  "30_39": 10,
  "40_49": 15,
  "50_mais": 13,
};

const rendaScore: Record<string, number> = {
  "ate_10": 3,
  "10_20": 10,
  "20_40": 18,
  "40_mais": 25,
  "40_80": 25,
  "80_150": 25,
  "150_mais": 25,
};

const momentoScore: Record<string, number> = {
  ja_decidi: 15,
  proximos_1_2: 9,
  sonho: 3,
};

export function computeScore(lead: LeadInput): { score: number; classificacao: ScoredLead["classificacao"] } {
  const score =
    (profissaoScore[lead.profissao] ?? 0) +
    (formacaoScore[lead.formacao] ?? 0) +
    (idadeScore[lead.faixaEtaria] ?? 0) +
    (rendaScore[lead.renda] ?? 0) +
    (momentoScore[lead.momento] ?? 0);

  const classificacao: ScoredLead["classificacao"] =
    score >= 80 ? "A" : score >= 60 ? "B" : score >= 40 ? "C" : "D";

  return { score, classificacao };
}

export function captureUtms(search: string): Record<string, string> {
  const params = new URLSearchParams(search);
  const utms: Record<string, string> = {};
  ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"].forEach((k) => {
    const v = params.get(k);
    if (v) utms[k] = v;
  });
  return utms;
}
