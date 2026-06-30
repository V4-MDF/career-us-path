/**
 * visaQualifier — motor de pontuação por tipo de visto EB / O-1.
 *
 * Recebe as respostas do teste de pré-qualificação e devolve, para cada
 * visto avaliado, um score 0–100, uma classificação (apto / parcial / não
 * elegível) e a lista de critérios atendidos / lacunas. Em seguida escolhe
 * o "melhor visto" e até duas alternativas.
 *
 * IMPORTANTE — disclaimer regulatório:
 *  - Esta é uma triagem orientativa, NÃO é parecer jurídico.
 *  - Para EB-1A, a regra real é "atender 3 dos 10 critérios + sustained
 *    acclaim"; aqui aproximamos via contagem de critérios mapeados.
 *  - Para EB-2 NIW usamos o framework Dhanasar (3 prongs) de forma
 *    heurística baseada em titulação + impacto declarado.
 *
 * Mantenha a lógica numérica neste arquivo isolada — testes futuros e
 * ajustes finos do produto devem viver aqui.
 */

import type { PreQualAnswers } from "@/lib/prequal";

export type VisaCode = "EB-1A" | "EB-2 NIW" | "O-1" | "EB-3";

export type Verdict = "apto" | "parcial" | "nao_elegivel";

export interface VisaScore {
  code: VisaCode;
  label: string;
  short: string;            // descrição curta exibida nos cards
  score: number;            // 0–100
  verdict: Verdict;
  metCriteria: string[];    // critérios atendidos pelo perfil
  gaps: string[];           // lacunas a desenvolver
}

export interface QualificationResult {
  best: VisaScore;
  alternatives: VisaScore[];
  all: VisaScore[];
  blocker: string | null;   // ex.: ficha criminal — torna tudo inelegível
  qualifiedOverall: boolean;
  topScore: number;
}

/* ============================================================
 * Tabelas auxiliares
 * ============================================================ */

const VISA_META: Record<VisaCode, { label: string; short: string }> = {
  "EB-1A": {
    label: "EB-1A — Habilidade Extraordinária",
    short: "Green Card para profissionais com reconhecimento sustentado no topo da sua área.",
  },
  "EB-2 NIW": {
    label: "EB-2 NIW — National Interest Waiver",
    short: "Green Card por mérito profissional, sem necessidade de patrocinador americano.",
  },
  "O-1": {
    label: "O-1 — Visto de trabalho para talentos extraordinários",
    short: "Visto temporário (não-imigrante) para profissionais de destaque internacional.",
  },
  "EB-3": {
    label: "EB-3 — Trabalhador qualificado com patrocínio",
    short: "Green Card via oferta de emprego nos EUA + processo de PERM (labor cert).",
  },
};

/* ============================================================
 * Helpers
 * ============================================================ */

function verdictFor(score: number): Verdict {
  if (score >= 70) return "apto";
  if (score >= 45) return "parcial";
  return "nao_elegivel";
}

function clamp(n: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, n));
}

/* ============================================================
 * Scorers por visto
 *
 * Cada scorer começa em 0 e soma pontos por critério, anotando o que foi
 * atendido (metCriteria) e o que faltou (gaps). O score final é clamp 0–100.
 * ============================================================ */

function scoreEB1A(a: PreQualAnswers): VisaScore {
  const met: string[] = [];
  const gaps: string[] = [];
  let s = 0;

  // Reconhecimento — peso alto (EB-1A é todo sobre acclaim)
  if (a.awards === "internacional") { s += 22; met.push("Prêmios de relevância internacional"); }
  else if (a.awards === "nacional") { s += 12; met.push("Prêmios de relevância nacional"); }
  else gaps.push("Prêmios reconhecidos (nacionais/internacionais)");

  if (a.mediaCoverage) { s += 12; met.push("Cobertura de imprensa sobre seu trabalho"); }
  else gaps.push("Matérias de imprensa sobre você ou seu trabalho");

  if (a.publications === "10+") { s += 18; met.push("Acervo robusto de publicações acadêmicas"); }
  else if (a.publications === "3-9") { s += 10; met.push("Publicações acadêmicas relevantes"); }
  else if (a.publications === "1-2") { s += 4; }
  else gaps.push("Artigos / publicações acadêmicas");

  if (a.judging) { s += 10; met.push("Atuação como juiz / revisor da área"); }
  else gaps.push("Atuação como avaliador/juiz do trabalho de pares");

  if (a.originalContribution) { s += 12; met.push("Contribuições originais de impacto comprovado"); }
  else gaps.push("Contribuições originais de impacto comprovado");

  if (a.memberships) { s += 6; met.push("Membro de associações seletivas"); }
  if (a.leadershipRole) { s += 8; met.push("Cargo de liderança em organização de prestígio"); }
  if (a.highSalary) { s += 6; met.push("Remuneração acima da média da área"); }

  // Titulação reforça acclaim em academia/pesquisa
  if (a.education === "doutorado") s += 6;
  else if (a.education === "mestrado") s += 3;

  return {
    code: "EB-1A",
    ...VISA_META["EB-1A"],
    score: clamp(s),
    verdict: verdictFor(clamp(s)),
    metCriteria: met,
    gaps,
  };
}

function scoreEB2NIW(a: PreQualAnswers): VisaScore {
  const met: string[] = [];
  const gaps: string[] = [];
  let s = 0;

  // Prong 1: advanced degree OR exceptional ability
  if (a.education === "doutorado") { s += 22; met.push("Doutorado (advanced degree)"); }
  else if (a.education === "mestrado") { s += 18; met.push("Mestrado (advanced degree)"); }
  else if (a.education === "graduacao" && a.experienceYears >= 5) {
    s += 14; met.push("Graduação + 5+ anos de experiência (equivalente a mestrado)");
  } else {
    gaps.push("Diploma de mestrado/doutorado ou graduação + 5 anos de experiência");
  }

  // Prong 2: well-positioned — experiência + senioridade + renda
  if (a.experienceYears >= 10) { s += 12; met.push("Mais de 10 anos de experiência consolidada"); }
  else if (a.experienceYears >= 5) { s += 7; met.push("Experiência sólida (5+ anos)"); }
  else gaps.push("Tempo de experiência mais robusto (5+ anos)");

  if (a.seniority === "executivo" || a.seniority === "lideranca") {
    s += 10; met.push("Atuação em posição de liderança ou executiva");
  } else if (a.seniority === "senior") {
    s += 6; met.push("Atuação como sênior");
  } else gaps.push("Senioridade comprovada (sênior, lead ou executivo)");

  if (a.income === "80k+" || a.income === "40-80k") {
    s += 8; met.push("Faixa de remuneração consistente com profissional consolidado");
  }

  // Prong 3: national importance (impacto declarado)
  if (a.originalContribution) { s += 10; met.push("Contribuições originais com impacto demonstrável"); }
  if (a.publications !== "0") { s += 6; met.push("Produção intelectual publicada"); }
  if (a.mediaCoverage) { s += 4; met.push("Reconhecimento público pelo trabalho"); }
  if (a.awards === "internacional" || a.awards === "nacional") {
    s += 6; met.push("Premiações que reforçam o mérito substancial");
  }
  if (a.area === "saude" || a.area === "tecnologia" || a.area === "engenharia" || a.area === "ciencia") {
    s += 4; met.push("Área de atuação com forte alinhamento ao interesse nacional dos EUA");
  }

  if (!a.originalContribution && a.publications === "0" && !a.mediaCoverage) {
    gaps.push("Evidência de impacto substancial (publicações, contribuições, imprensa)");
  }

  return {
    code: "EB-2 NIW",
    ...VISA_META["EB-2 NIW"],
    score: clamp(s),
    verdict: verdictFor(clamp(s)),
    metCriteria: met,
    gaps,
  };
}

function scoreO1(a: PreQualAnswers): VisaScore {
  // O-1 é como um EB-1 mais flexível e não-imigrante. Damos um "boost" sobre o EB-1A.
  const eb1 = scoreEB1A(a);
  const boosted = clamp(eb1.score + 12);
  const gaps = [...eb1.gaps];
  const met = [...eb1.metCriteria];
  if (!a.usJobOffer) {
    gaps.unshift("Patrocinador americano (empregador ou agente) — exigência do O-1");
  } else {
    met.unshift("Possui patrocinador / oferta nos EUA");
  }
  return {
    code: "O-1",
    ...VISA_META["O-1"],
    score: boosted,
    verdict: verdictFor(boosted),
    metCriteria: met,
    gaps,
  };
}

function scoreEB3(a: PreQualAnswers): VisaScore {
  const met: string[] = [];
  const gaps: string[] = [];
  let s = 30; // baseline — exige menos do que EB-1/EB-2

  if (a.experienceYears >= 2) { s += 18; met.push("2+ anos de experiência na função"); }
  else gaps.push("Experiência mínima de 2 anos na função (skilled worker)");

  if (a.education === "graduacao" || a.education === "mestrado" || a.education === "doutorado") {
    s += 10; met.push("Formação superior compatível");
  }

  if (a.usJobOffer) { s += 32; met.push("Possui oferta de emprego nos EUA (essencial para EB-3)"); }
  else gaps.push("Oferta formal de emprego nos EUA — EB-3 exige patrocinador");

  if (a.englishLevel === "fluente" || a.englishLevel === "avancado") {
    s += 8; met.push("Inglês avançado/fluente");
  } else gaps.push("Inglês em nível avançado");

  return {
    code: "EB-3",
    ...VISA_META["EB-3"],
    score: clamp(s),
    verdict: verdictFor(clamp(s)),
    metCriteria: met,
    gaps,
  };
}

/* ============================================================
 * Orquestrador
 * ============================================================ */

export function qualifyVisas(a: PreQualAnswers): QualificationResult {
  // Bloqueadores absolutos (declarados pelo próprio respondente)
  let blocker: string | null = null;
  if (a.criminalRecord) {
    blocker = "Histórico criminal declarado exige análise jurídica individual antes de qualquer recomendação.";
  }

  const all: VisaScore[] = [scoreEB1A(a), scoreEB2NIW(a), scoreO1(a), scoreEB3(a)];

  // Quando há blocker, mantém os scores (para o admin ver) mas força verdict
  if (blocker) {
    all.forEach((v) => { v.verdict = "nao_elegivel"; });
  }

  const sorted = [...all].sort((x, y) => y.score - x.score);
  const best = sorted[0];
  const alternatives = sorted.slice(1, 3).filter((v) => v.verdict !== "nao_elegivel");

  return {
    best,
    alternatives,
    all,
    blocker,
    qualifiedOverall: !blocker && best.verdict !== "nao_elegivel",
    topScore: best.score,
  };
}
