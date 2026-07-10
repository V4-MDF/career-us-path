/**
 * Listas da dobra "Duas realidades. Uma decisão." (Brasil × EUA).
 *
 * Persistência: dois registros em `site_content`, id="contrast_br_list" e
 * "contrast_us_list", cada um contendo { value: ContrastItem[] }. Reaproveita
 * as policies existentes (anon read, admin write) sem exigir nova tabela.
 *
 * Editado em /admin/contraste, consumido em src/components/site/sections.tsx#ContrastBrasilEUA.
 */
import { get, set } from "./dataStore";

export type ContrastItem = {
  id: string;
  texto: string;
  ordem: number;
  ativo: boolean;
};

const BR_KEY = "contrast_br_list";
const US_KEY = "contrast_us_list";

export const SEED_BR: ContrastItem[] = [
  { id: "br-1", texto: "Insegurança no dia a dia da família", ordem: 1, ativo: true },
  { id: "br-2", texto: "Carga tributária alta e crescente", ordem: 2, ativo: true },
  { id: "br-3", texto: "Instabilidade política e econômica", ordem: 3, ativo: true },
  { id: "br-4", texto: "Oportunidades limitadas mesmo com qualificação", ordem: 4, ativo: true },
  { id: "br-5", texto: "Futuro incerto para os filhos", ordem: 5, ativo: true },
];

export const SEED_US: ContrastItem[] = [
  { id: "us-1", texto: "Economia estável e remuneração em dólar", ordem: 1, ativo: true },
  { id: "us-2", texto: "Segurança e qualidade de vida para a família", ordem: 2, ativo: true },
  { id: "us-3", texto: "Carreira valorizada por mérito e resultado", ordem: 3, ativo: true },
  { id: "us-4", texto: "Educação e saúde entre as melhores do mundo", ordem: 4, ativo: true },
  { id: "us-5", texto: "Caminho legal baseado em quem você já é", ordem: 5, ativo: true },
];

async function loadList(recordId: string, seed: ContrastItem[]): Promise<ContrastItem[]> {
  const row = await get<{ value: ContrastItem[] }>("site_content", recordId);
  const value = row?.value;
  if (Array.isArray(value) && value.length > 0) {
    return [...value].sort((a, b) => a.ordem - b.ordem);
  }
  return seed;
}

async function saveList(recordId: string, items: ContrastItem[]): Promise<void> {
  const normalized = items
    .map((r, i) => ({ ...r, ordem: i + 1 }))
    .sort((a, b) => a.ordem - b.ordem);
  await set("site_content", recordId, { value: normalized });
}

export const loadBrList = () => loadList(BR_KEY, SEED_BR);
export const loadUsList = () => loadList(US_KEY, SEED_US);
export const saveBrList = (items: ContrastItem[]) => saveList(BR_KEY, items);
export const saveUsList = (items: ContrastItem[]) => saveList(US_KEY, items);
