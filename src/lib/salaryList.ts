/**
 * Lista de salários (dobra "Renda em dólar").
 *
 * COMPLIANCE (FTC §5 / FDUTPA):
 *  - Todos os valores estão em BASE ANUAL nas duas colunas (BR e EUA)
 *    para evitar comparação em bases diferentes, que gera impressão
 *    líquida enganosa mesmo com disclaimer.
 *  - Cada linha tem `fonte` visível no card. Valores dos EUA são
 *    referenciados ao U.S. Bureau of Labor Statistics (Occupational
 *    Employment and Wage Statistics — OEWS).
 *  - `regulamentada: true` marca profissões que EXIGEM licenciamento
 *    nos EUA — o Green Card não substitui esse processo.
 *
 * PENDENTE DE VALIDAÇÃO: os números atuais precisam ser conferidos
 * contra o BLS antes do go-live. Se algum não bater, o número muda,
 * a fonte permanece.
 */
import { get, set } from "./dataStore";

export type SalaryRow = {
  id: string;
  profissao: string;
  br_anual: string;       // ex "R$ 300.000 / ano"
  eua_anual: string;      // ex "US$ 280.000 / ano"
  fonte: string;          // ex "Fonte: U.S. BLS — OEWS"
  regulamentada: boolean; // exige licenciamento nos EUA
  ordem: number;
  ativo: boolean;
};

const RECORD_ID = "salary_list";

const BLS = "Fonte: U.S. BLS — OEWS";

/** Seed inicial. Valores brutos anuais, PENDENTES de validação contra o BLS. */
export const SEED_SALARY: SalaryRow[] = [
  { id: "medico",     profissao: "Médico especialista",                         br_anual: "R$ 300.000", eua_anual: "US$ 280.000", fonte: BLS, regulamentada: true,  ordem: 1,  ativo: true },
  { id: "eng-sw",     profissao: "Engenheiro de software sênior",               br_anual: "R$ 240.000", eua_anual: "US$ 160.000", fonte: BLS, regulamentada: false, ordem: 2,  ativo: true },
  { id: "ia-ml",      profissao: "Especialista em IA / Machine Learning",       br_anual: "R$ 264.000", eua_anual: "US$ 180.000", fonte: BLS, regulamentada: false, ordem: 3,  ativo: true },
  { id: "data",       profissao: "Cientista de dados",                          br_anual: "R$ 216.000", eua_anual: "US$ 140.000", fonte: BLS, regulamentada: false, ordem: 4,  ativo: true },
  { id: "eng-senior", profissao: "Engenheiro (civil/mecânico/elétrico) sênior", br_anual: "R$ 216.000", eua_anual: "US$ 120.000", fonte: BLS, regulamentada: false, ordem: 5,  ativo: true },
  { id: "dentista",   profissao: "Dentista",                                    br_anual: "R$ 180.000", eua_anual: "US$ 170.000", fonte: BLS, regulamentada: true,  ordem: 6,  ativo: true },
  { id: "farma",      profissao: "Farmacêutico",                                br_anual: "R$ 96.000",  eua_anual: "US$ 130.000", fonte: BLS, regulamentada: true,  ordem: 7,  ativo: true },
  { id: "enfermeiro", profissao: "Enfermeiro(a)",                               br_anual: "R$ 72.000",  eua_anual: "US$ 90.000",  fonte: BLS, regulamentada: true,  ordem: 8,  ativo: true },
  { id: "financas",   profissao: "Profissional de finanças / controller sênior",br_anual: "R$ 216.000", eua_anual: "US$ 120.000", fonte: BLS, regulamentada: false, ordem: 9,  ativo: true },
  { id: "arquiteto",  profissao: "Arquiteto",                                   br_anual: "R$ 120.000", eua_anual: "US$ 95.000",  fonte: BLS, regulamentada: false, ordem: 10, ativo: true },
];

// Migra registros antigos (br_mensal → br_anual, sem fonte/regulamentada).
type LegacyRow = Partial<SalaryRow> & { br_mensal?: string };
function migrate(rows: LegacyRow[]): SalaryRow[] {
  return rows.map((r, i) => {
    const seed = SEED_SALARY.find((s) => s.id === r.id);
    return {
      id: r.id ?? `row_${i}`,
      profissao: r.profissao ?? seed?.profissao ?? "",
      br_anual: r.br_anual ?? seed?.br_anual ?? (r.br_mensal ? r.br_mensal : "R$ 0"),
      eua_anual: r.eua_anual ?? seed?.eua_anual ?? "US$ 0",
      fonte: r.fonte ?? seed?.fonte ?? BLS,
      regulamentada: r.regulamentada ?? seed?.regulamentada ?? false,
      ordem: r.ordem ?? i + 1,
      ativo: r.ativo ?? true,
    };
  });
}

export async function loadSalaryList(): Promise<SalaryRow[]> {
  const row = await get<{ value: LegacyRow[] }>("site_content", RECORD_ID);
  const value = row?.value;
  if (Array.isArray(value) && value.length > 0) {
    return migrate(value).sort((a, b) => a.ordem - b.ordem);
  }
  return SEED_SALARY;
}

export async function saveSalaryList(rows: SalaryRow[]): Promise<void> {
  const normalized = rows
    .map((r, i) => ({ ...r, ordem: i + 1 }))
    .sort((a, b) => a.ordem - b.ordem);
  await set("site_content", RECORD_ID, { value: normalized });
}

/** Semeia se o registro nunca foi salvo. Idempotente. */
export async function ensureSalarySeed(): Promise<void> {
  const row = await get<{ value: SalaryRow[] }>("site_content", RECORD_ID);
  if (!row || !Array.isArray(row.value) || row.value.length === 0) {
    await set("site_content", RECORD_ID, { value: SEED_SALARY });
  }
}
