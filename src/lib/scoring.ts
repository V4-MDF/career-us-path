/**
 * Scoring (Prompt 7) — Pontuação de qualidade do perfil 0–100, derivada AO VIVO.
 *
 * Mede ADERÊNCIA DO PERFIL ao EB-2 NIW. Não é uma classe fixa: o score é sempre
 * recomputado a partir do `scoring_model` atual + respostas cruas do lead.
 * Trocar pesos no admin repontua todos os leads automaticamente.
 *
 * Persistência: o modelo vive em dataStore.table("settings") sob id "scoring_model".
 * Status de funil (Novo/Em contato/Qualificado/Proposta/Convertido/Descartado) é
 * MANUAL e separado do score — vive em cada lead.
 *
 * Roadmap (Supabase): adicionar segundo eixo "pontuação de engajamento" (chegou em
 * /avaliacao, retornos, tempo de preenchimento, páginas vistas) e visão de matriz
 * perfil × engajamento. Estrutura é extensível — `factors` pode receber fatores
 * comportamentais sem refatorar a função de cálculo.
 */
import { get, set } from "@/lib/dataStore";
import type { LeadInput } from "@/lib/leadScoring";

export type FactorKey = "renda" | "profissao" | "formacao" | "momento" | "idade";

export interface Factor {
  key: FactorKey;
  label: string;
  /** Campo da resposta no LeadInput (faixaEtaria para idade). */
  field: keyof LeadInput;
  /** Peso inteiro (somatório alvo = 100; normalizado em runtime). */
  peso: number;
  /** Mapa resposta-bruta → aderência 0..1. */
  valores: Record<string, number>;
  /** Rótulos legíveis das respostas (para UI). */
  labels: Record<string, string>;
}

export interface PriorityBand {
  /** Identificador estável. */
  id: "prioritario" | "aquecer" | "observar" | "baixa";
  label: string;
  /** Score mínimo (inclusive) para entrar na faixa. */
  min: number;
  /** Cor da escala calor→fria. */
  tone: "hot" | "warm" | "cool" | "cold";
}

export interface ScoringModel {
  version: number;
  updatedAt: string;
  factors: Factor[];
  faixas: PriorityBand[];
}

export const FUNNEL_STATUSES = [
  "novo",
  "em_contato",
  "qualificado",
  "proposta",
  "convertido",
  "descartado",
] as const;
export type FunnelStatus = (typeof FUNNEL_STATUSES)[number];

export const FUNNEL_LABEL: Record<FunnelStatus, string> = {
  novo: "Novo",
  em_contato: "Em contato",
  qualificado: "Qualificado",
  proposta: "Proposta",
  convertido: "Convertido",
  descartado: "Descartado",
};

/* ----------------------------------------------------------------
 * DEFAULT MODEL — defaults do briefing (pesos somam 100).
 * ---------------------------------------------------------------- */
export const DEFAULT_MODEL: ScoringModel = {
  version: 2,
  updatedAt: new Date(0).toISOString(),
  factors: [
    {
      key: "renda",
      label: "Renda",
      field: "renda",
      peso: 35,
      valores: { "40_mais": 1.0, "20_40": 0.7, "10_20": 0.4, ate_10: 0.12 },
      labels: {
        "40_mais": "R$ 40k+",
        "20_40": "R$ 20–40k",
        "10_20": "R$ 10–20k",
        ate_10: "Até R$ 10k",
      },
    },
    {
      key: "profissao",
      label: "Profissão",
      field: "profissao",
      peso: 20,
      valores: {
        medico: 1.0, engenheiro: 1.0, empresario: 1.0,
        dentista: 1.0, advogado: 1.0, ti: 1.0,
        outra_qualificada: 0.5, outra: 0.15,
      },
      labels: {
        medico: "Médico", engenheiro: "Engenheiro", empresario: "Empresário",
        dentista: "Dentista", advogado: "Advogado", ti: "Tecnologia",
        outra_qualificada: "Outra qualificada", outra: "Outra",
      },
    },
    {
      key: "formacao",
      label: "Formação",
      field: "formacao",
      peso: 15,
      valores: { doutorado: 1.0, mestrado: 1.0, pos: 0.75, superior: 0.4, sem_superior: 0.1 },
      labels: {
        doutorado: "Doutorado", mestrado: "Mestrado", pos: "Pós-graduação",
        superior: "Superior completo", sem_superior: "Sem superior",
      },
    },
    {
      key: "momento",
      label: "Momento da decisão",
      field: "momento",
      peso: 15,
      valores: { ja_decidi: 1.0, proximos_1_2: 0.6, sonho: 0.2 },
      labels: {
        ja_decidi: "Já decidiu", proximos_1_2: "Próximos 1–2 anos", sonho: "Sonho / pesquisando",
      },
    },
    {
      key: "idade",
      label: "Faixa etária",
      field: "faixaEtaria",
      peso: 15,
      valores: { "40_49": 1.0, "50_mais": 0.85, "30_39": 0.65, ate_29: 0.25 },
      labels: { "40_49": "40–49 anos", "50_mais": "50+", "30_39": "30–39 anos", ate_29: "Até 29 anos" },
    },
  ],
  faixas: [
    { id: "prioritario", label: "Prioritário", min: 80, tone: "hot" },
    { id: "aquecer",     label: "Aquecer",     min: 60, tone: "warm" },
    { id: "observar",    label: "Observar",    min: 40, tone: "cool" },
    { id: "baixa",       label: "Baixa aderência", min: 0, tone: "cold" },
  ],
};

/* ----------------------------------------------------------------
 * Persistência do modelo (dataStore.settings → "scoring_model").
 * Fallback ao DEFAULT_MODEL se inexistente / corrompido.
 * ---------------------------------------------------------------- */
const MODEL_ID = "scoring_model";

export async function loadModel(): Promise<ScoringModel> {
  try {
    const m = await get<ScoringModel>("settings", MODEL_ID);
    if (m && Array.isArray(m.factors) && Array.isArray(m.faixas)) return m;
  } catch { /* noop */ }
  return DEFAULT_MODEL;
}

export async function saveModel(model: ScoringModel): Promise<void> {
  const next: ScoringModel = { ...model, updatedAt: new Date().toISOString() };
  await set("settings", MODEL_ID, next);
}

export async function resetModel(): Promise<ScoringModel> {
  await saveModel({ ...DEFAULT_MODEL, version: DEFAULT_MODEL.version + Math.floor(Math.random() * 1000) });
  return loadModel();
}

/* ----------------------------------------------------------------
 * CÁLCULO — score 0..100 + composição por fator.
 * Pesos são NORMALIZADOS para somar 100 antes da multiplicação.
 * ---------------------------------------------------------------- */
export interface FactorContribution {
  key: FactorKey;
  label: string;
  /** Resposta crua do lead. */
  raw: string;
  /** Rótulo legível (do labels do fator). */
  display: string;
  /** Peso normalizado (0..100). */
  pesoNorm: number;
  /** Aderência 0..1. */
  aderencia: number;
  /** Contribuição em pontos (peso × aderência). */
  pontos: number;
}

export interface ComputedScore {
  score: number;
  composicao: FactorContribution[];
  band: PriorityBand;
}

/** Soma dos pesos brutos (pode ≠ 100 enquanto admin edita). */
export function weightSum(model: ScoringModel): number {
  return model.factors.reduce((a, f) => a + Math.max(0, f.peso), 0);
}

/** Faixa de prioridade derivada do score (ordenada do maior `min` ao menor). */
export function bandForScore(score: number, model: ScoringModel): PriorityBand {
  const sorted = [...model.faixas].sort((a, b) => b.min - a.min);
  return sorted.find((b) => score >= b.min) ?? sorted[sorted.length - 1];
}

export function computeScore(lead: LeadInput, model: ScoringModel = DEFAULT_MODEL): ComputedScore {
  const total = weightSum(model) || 1;
  const composicao: FactorContribution[] = model.factors.map((f) => {
    const raw = String((lead as unknown as Record<string, unknown>)[f.field] ?? "");
    const aderencia = f.valores[raw] ?? 0;
    const pesoNorm = (Math.max(0, f.peso) / total) * 100;
    const pontos = pesoNorm * aderencia;
    return {
      key: f.key,
      label: f.label,
      raw,
      display: f.labels[raw] ?? raw ?? "—",
      pesoNorm,
      aderencia,
      pontos,
    };
  });
  const score = Math.round(composicao.reduce((a, c) => a + c.pontos, 0));
  return { score, composicao, band: bandForScore(score, model) };
}

/* ----------------------------------------------------------------
 * UI helpers — paleta da escala calor→fria.
 * ---------------------------------------------------------------- */
export const TONE_CLASS: Record<PriorityBand["tone"], string> = {
  hot:  "bg-rose-100 text-rose-800 border-rose-200",
  warm: "bg-amber-100 text-amber-800 border-amber-200",
  cool: "bg-sky-100 text-sky-800 border-sky-200",
  cold: "bg-slate-100 text-slate-600 border-slate-200",
};

export const TONE_BAR: Record<PriorityBand["tone"], string> = {
  hot:  "bg-rose-500",
  warm: "bg-amber-500",
  cool: "bg-sky-500",
  cold: "bg-slate-400",
};

/** Histograma simples (20 bins de 5pts). */
export function histogram(scores: number[], binSize = 5): number[] {
  const bins = Math.ceil(100 / binSize) + 1; // 0..100 inclusive
  const out = new Array<number>(bins).fill(0);
  scores.forEach((s) => {
    const idx = Math.min(bins - 1, Math.max(0, Math.floor(s / binSize)));
    out[idx]++;
  });
  return out;
}
