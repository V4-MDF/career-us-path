/**
 * Lista de salários (dobra "Renda em dólar").
 *
 * Persistência: gravamos como UM registro em `site_content` (id="salary_list")
 * contendo { value: SalaryRow[] }. Isso reaproveita as policies existentes
 * (anon read, admin write) sem exigir nova tabela.
 *
 * Marcada internamente como "pendente de validação" (números de referência
 * que o cliente ajusta depois). Não exibimos marcador no front, é uma nota
 * apenas para o admin.
 */
import { get, set } from "./dataStore";

export type SalaryRow = {
  id: string;
  profissao: string;
  br_mensal: string;   // ex "R$ 25.000"
  eua_anual: string;   // ex "US$ 280.000"
  ordem: number;
  ativo: boolean;
};

const RECORD_ID = "salary_list";

/** Seed inicial. Valores brutos, PENDENTES de validação. */
export const SEED_SALARY: SalaryRow[] = [
  { id: "medico",       profissao: "Médico especialista",                           br_mensal: "R$ 25.000", eua_anual: "US$ 280.000", ordem: 1,  ativo: true },
  { id: "eng-sw",       profissao: "Engenheiro de software sênior",                 br_mensal: "R$ 20.000", eua_anual: "US$ 160.000", ordem: 2,  ativo: true },
  { id: "ia-ml",        profissao: "Especialista em IA / Machine Learning",         br_mensal: "R$ 22.000", eua_anual: "US$ 180.000", ordem: 3,  ativo: true },
  { id: "data",         profissao: "Cientista de dados",                            br_mensal: "R$ 18.000", eua_anual: "US$ 140.000", ordem: 4,  ativo: true },
  { id: "eng-senior",   profissao: "Engenheiro (civil/mecânico/elétrico) sênior",   br_mensal: "R$ 18.000", eua_anual: "US$ 120.000", ordem: 5,  ativo: true },
  { id: "dentista",     profissao: "Dentista",                                      br_mensal: "R$ 15.000", eua_anual: "US$ 170.000", ordem: 6,  ativo: true },
  { id: "farma",        profissao: "Farmacêutico",                                  br_mensal: "R$ 8.000",  eua_anual: "US$ 130.000", ordem: 7,  ativo: true },
  { id: "enfermeiro",   profissao: "Enfermeiro(a)",                                 br_mensal: "R$ 6.000",  eua_anual: "US$ 90.000",  ordem: 8,  ativo: true },
  { id: "financas",     profissao: "Profissional de finanças / controller sênior",  br_mensal: "R$ 18.000", eua_anual: "US$ 120.000", ordem: 9,  ativo: true },
  { id: "arquiteto",    profissao: "Arquiteto",                                     br_mensal: "R$ 10.000", eua_anual: "US$ 95.000",  ordem: 10, ativo: true },
];

export async function loadSalaryList(): Promise<SalaryRow[]> {
  const row = await get<{ value: SalaryRow[] }>("site_content", RECORD_ID);
  const value = row?.value;
  if (Array.isArray(value) && value.length > 0) {
    return [...value].sort((a, b) => a.ordem - b.ordem);
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
