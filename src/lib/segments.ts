/**
 * Segmentos de carreira para o motor de Landing Pages.
 *
 * Todo o conteúdo da LP (exceto Hero, que é A/B) vive aqui.
 * O admin (próximo prompt) edita esses registros via dataStore.
 */

import { get, list, set } from "./dataStore";

export interface ComparativoSegmento {
  label: string;
  lado_brasil: string;
  lado_eua: string;
  observacao?: string;
}

export interface ChecklistItem {
  texto: string;
  positivo: boolean;
}

export interface FAQItem {
  q: string;
  a: string;
}

export type VisaSlugRef = "eb2-niw" | "eb1" | "eb3";

export interface Segment {
  id: string;
  slug: string;
  nome: string;
  ativo: boolean;
  noindex?: boolean;
  /** Página de visto cuja estrutura será reusada no corpo da LP. */
  visa_slug?: VisaSlugRef;
  /** Profissão pré-selecionada no LeadForm (chave do select). */
  profissao_default?: string;
  eyebrow: string;
  prova_social: string;
  comparativo: ComparativoSegmento;
  dores: string[];
  custo_adiar: string;
  checklist: ChecklistItem[];
  faq_segmento: FAQItem[];
  meta_title: string;
  meta_description: string;
  /** Hero default usado se NÃO houver variantes A/B ativas. */
  hero_default: {
    eyebrow: string;
    h1: string;
    sub: string;
    cta_texto: string;
    imagem?: string;
  };
}

export interface HeroVariant {
  id: string;
  segment_id: string;
  nome: string;
  ativo: boolean;
  /** Peso relativo para o sorteio ponderado (ex.: 50/50, 70/30). */
  peso: number;
  eyebrow: string;
  h1: string;
  sub: string;
  cta_texto: string;
  /** Opcional, imagem de fundo do Hero. */
  imagem?: string;
}

export interface AbStats {
  id: string; // mesmo id da variante
  variant_id: string;
  segment_id: string;
  impressions: number;
  conversions: number;
}

/* ---------------- SEED ---------------- */

const SEED_SEGMENTS: Segment[] = [
  {
    id: "medicos",
    slug: "medicos",
    nome: "Médicos",
    ativo: true,
    noindex: false,
    visa_slug: "eb2-niw",
    profissao_default: "medico",
    eyebrow: "PARA MÉDICOS BRASILEIROS",
    prova_social:
      "Atendimento dedicado a médicos brasileiros",
    comparativo: {
      label: "Salário médio de médicos",
      lado_brasil: "≈ R$ 180.000 / ano",
      lado_eua: "US$ 200.000 a 600.000 / ano",
      observacao:
        "Valores de referência (brutos). No Brasil, impostos e encargos reduzem de forma relevante o valor líquido, nos EUA a diferença é ainda maior.",
    },
    dores: [
      "Plantões disputados e jornadas exaustivas",
      "Remuneração que não acompanha sua qualificação",
      "Insegurança e instabilidade que afetam sua família",
      "Carreira refém de decisões políticas e do SUS/convênios",
      "A sensação de que poderia conquistar muito mais lá fora",
    ],
    custo_adiar:
      "Cada ano de espera é um ano de salário em dólar que não volta, e o processo já leva cerca de 2 anos. Quem decide cedo, chega na frente.",
    checklist: [
      { texto: "Médico formado, com carreira consolidada", positivo: true },
      { texto: "Tem ou está disposto a construir um perfil forte (títulos, experiência, publicações)", positivo: true },
      { texto: "Decidiu que quer construir carreira nos EUA", positivo: true },
      { texto: "Quem busca atalho ou promessa de aprovação garantida", positivo: false },
      { texto: "Quem não pretende investir em um processo sério e de médio prazo", positivo: false },
    ],
    faq_segmento: [
      {
        q: "Preciso revalidar o diploma antes do visto?",
        a: "São processos distintos; no levantamento inicial de informações explicamos a ordem documental de cada etapa.",
      },
    ],
    meta_title: "Green Card para médicos brasileiros | EB-2 NIW | Status na América",
    meta_description:
      "Médico e quer construir carreira nos EUA? Veja como conquistar o Green Card por mérito pelo EB-2 NIW, sem patrocinador. Levantamento inicial de informações gratuito.",
    hero_default: {
      eyebrow: "PARA MÉDICOS BRASILEIROS",
      h1: "Você é médico e quer construir sua carreira nos Estados Unidos?",
      sub: "Conquiste o Green Card pelo mérito da sua trajetória, pelo EB-2 NIW, sem patrocinador e sem loteria. Green Card também para cônjuge e filhos.",
      cta_texto: "Iniciar pré-qualificação documental",
    },
  },
  {
    id: "engenheiros",
    slug: "engenheiros",
    nome: "Engenheiros",
    ativo: true,
    noindex: false,
    visa_slug: "eb2-niw",
    profissao_default: "engenheiro",
    eyebrow: "PARA ENGENHEIROS BRASILEIROS",
    prova_social:
      "Engenheiros brasileiros qualificados têm forte aderência ao EB-2 NIW",
    comparativo: {
      label: "Salário médio de engenheiros",
      lado_brasil: "≈ R$ 144.000 / ano",
      lado_eua: "US$ 90.000 a 150.000 / ano",
      observacao:
        "Valores de referência (brutos). No Brasil, impostos e encargos reduzem de forma relevante o valor líquido, nos EUA a diferença é ainda maior.",
    },
    dores: [
      "Salário estagnado mesmo com anos de experiência",
      "Mercado limitado para a sua especialização",
      "Insegurança e instabilidade econômica",
      "Projetos que não acompanham o que se faz lá fora",
      "A sensação de teto na sua carreira no Brasil",
    ],
    custo_adiar:
      "A engenharia americana paga em dólar e valoriza experiência. Cada ano adiado é ganho deixado na mesa, e o processo leva cerca de 2 anos.",
    checklist: [
      { texto: "Engenheiro com formação superior e experiência sólida", positivo: true },
      { texto: "Pós-graduação/mestrado contam pontos a favor", positivo: true },
      { texto: "Decidido a levar a carreira para os EUA", positivo: true },
      { texto: "Quem espera garantia de aprovação", positivo: false },
      { texto: "Quem não quer um processo estruturado de médio prazo", positivo: false },
    ],
    faq_segmento: [
      {
        q: "Minha área de engenharia se encaixa no EB-2 NIW?",
        a: "A maioria das engenharias tem boa aderência; o levantamento inicial de informações é gratuito e indica os documentos normalmente exigidos.",
      },
    ],
    meta_title: "Green Card para engenheiros brasileiros | EB-2 NIW | Status na América",
    meta_description:
      "Engenheiro e quer carreira nos EUA? Conquiste o Green Card por mérito pelo EB-2 NIW, sem patrocinador. Levantamento inicial de informações.",
    hero_default: {
      eyebrow: "PARA ENGENHEIROS BRASILEIROS",
      h1: "Você é engenheiro e quer levar sua carreira para os Estados Unidos?",
      sub: "Conquiste o Green Card pelo mérito da sua trajetória em engenharia, pelo EB-2 NIW, sem patrocinador e sem loteria. Green Card também para cônjuge e filhos.",
      cta_texto: "Iniciar pré-qualificação documental",
    },
  },
  {
    id: "empresarios",
    slug: "empresarios",
    nome: "Empresários",
    ativo: true,
    noindex: false,
    visa_slug: "eb2-niw",
    profissao_default: "empresario",
    eyebrow: "PARA EMPRESÁRIOS BRASILEIROS",
    prova_social:
      "Empresários que geram renda, impostos e empregos são exatamente o perfil que os EUA querem atrair",
    comparativo: {
      label: "Ambiente para quem empreende",
      lado_brasil:
        "Carga tributária alta, insegurança jurídica, juros altos que encarecem o crescimento, falta de apoio e incentivo do governo",
      lado_eua:
        "Ambiente pró-negócio, segurança jurídica, incentivo a quem empreende e dólar forte",
      observacao: "Para empresários, o ganho não é só salário, é o ambiente de negócio.",
    },
    dores: [
      "Carga tributária que corrói o resultado do seu negócio",
      "Insegurança jurídica e instabilidade nas regras",
      "Juros altos que encarecem o crescimento",
      "Falta de apoio e incentivo do governo a quem empreende",
      "Violência e qualidade de vida abaixo do seu padrão",
      "Teto de crescimento no mercado brasileiro",
      "Preocupação com o futuro e a segurança dos filhos",
    ],
    custo_adiar:
      "Enquanto a decisão fica para depois, o ambiente de negócio e a moeda seguem trabalhando contra. Organizar a documentação cedo é preparação, não pressa.",
    checklist: [
      { texto: "Empresário consolidado, com histórico comprovável", positivo: true },
      { texto: "Capacidade de demonstrar geração de renda, impostos e empregos", positivo: true },
      { texto: "Decidido a levar família e patrimônio para os EUA", positivo: true },
      { texto: "Quem busca esquema ou promessa fácil", positivo: false },
      { texto: "Quem não quer um planejamento sério de médio prazo", positivo: false },
    ],
    faq_segmento: [
      {
        q: "Preciso abrir empresa nos EUA para o EB-2 NIW?",
        a: "Não necessariamente. O EB-2 NIW é por mérito próprio; no levantamento inicial de informações mostramos os documentos normalmente exigidos nessa categoria.",
      },
    ],
    meta_title: "Green Card para empresários brasileiros | EB-2 NIW | Status na América",
    meta_description:
      "Empresário e quer migrar com a família para os EUA? Green Card por mérito pelo EB-2 NIW. Levantamento inicial de informações.",
    hero_default: {
      eyebrow: "PARA EMPRESÁRIOS BRASILEIROS",
      h1: "Você empresário quer construir seu futuro com segurança nos Estados Unidos?",
      sub: "Leve sua família, seu patrimônio e sua experiência empreendedora para um ambiente de negócio estável e em dólar, com o Green Card pelo EB-2 NIW.",
      cta_texto: "Iniciar pré-qualificação documental",
    },
  },
];

// Para o teste A/B, o admin (próximo prompt) criará a variante B
// e ajustará pesos. Aqui já nasce 1 variante ativa por segmento (peso 100).
const SEED_VARIANTS: HeroVariant[] = SEED_SEGMENTS.map((s) => ({
  id: `${s.id}_a`,
  segment_id: s.id,
  nome: "Variante A (controle)",
  ativo: true,
  peso: 100,
  eyebrow: s.hero_default.eyebrow,
  h1: s.hero_default.h1,
  sub: s.hero_default.sub,
  cta_texto: s.hero_default.cta_texto,
}));

let seeded = false;

/** Garante o seed inicial no localStorage. Idempotente. */
export async function ensureSeed(): Promise<void> {
  if (seeded) return;
  seeded = true;
  const existing = await list<Segment>("segments");
  if (existing.length === 0) {
    await Promise.all(SEED_SEGMENTS.map((s) => set("segments", s.id, s)));
  }
  const variants = await list<HeroVariant>("hero_variants");
  if (variants.length === 0) {
    await Promise.all(SEED_VARIANTS.map((v) => set("hero_variants", v.id, v)));
  }
}

export async function getSegmentBySlug(slug: string): Promise<Segment | null> {
  await ensureSeed();
  const all = await list<Segment>("segments");
  return all.find((s) => s.slug === slug) ?? null;
}

export async function getVariantsBySegment(segmentId: string): Promise<HeroVariant[]> {
  await ensureSeed();
  const all = await list<HeroVariant>("hero_variants");
  return all.filter((v) => v.segment_id === segmentId);
}

export async function getVariant(id: string): Promise<HeroVariant | null> {
  return get<HeroVariant>("hero_variants", id);
}
