/**
 * Catálogo de dobras (sections) por rota pública.
 *
 * Cada dobra tem:
 *  - `id`: slug AEO (vira o `id` do `<section>` + `#hash` na URL).
 *  - `label`: nome curto exibido no TOC e em `<title>` dinâmico ao rolar.
 *  - `intent`: 1 frase para `<meta description>` em deep-link de dobra
 *              indexável (sub-rota dos pilares de visto).
 *  - `indexable`: quando `true`, a dobra entra no `sitemap.xml` como
 *              sub-rota canônica `/vistos/<slug>/<id>` (apenas pilares).
 *
 * Princípios:
 *  - Slugs em PT-BR, kebab-case, sem acentos.
 *  - Mesmas keywords-âncora do `aeoSlug.ts` quando aplicável.
 *  - Reutilizado por: SectionAnchor, SectionTOC, DynamicSectionHead,
 *    sitemap, e pela sub-rota vistos.$slug.$secao.
 */

export interface SectionDef {
  id: string;
  label: string;
  intent?: string;
  indexable?: boolean;
}

// ============================================================
// HOME, 13 dobras (após reordenação do design dossiê).
// Nenhuma é indexable: a Home indexa como página única.
// ============================================================
export const HOME_SECTIONS: SectionDef[] = [
  { id: "abertura",             label: "Abertura" },
  { id: "selos-parceiros",      label: "Selos e parceiros" },
  { id: "blog-em-destaque",     label: "Blog em destaque" },
  { id: "brasil-vs-eua",        label: "Brasil vs EUA" },
  { id: "eb-2-niw",             label: "EB-2 NIW" },
  { id: "vistos-eb",            label: "Vistos EB" },
  { id: "processo-eb-2-niw",    label: "Processo" },
  { id: "por-que-status",       label: "Por que a Status" },
  { id: "video-institucional",  label: "Vídeo institucional" },
  { id: "legado",               label: "Legado" },
  { id: "renda-em-dolar",       label: "Renda em dólar" },
  { id: "depoimentos",          label: "Depoimentos" },
  { id: "duvidas-frequentes",   label: "Dúvidas frequentes" },
  { id: "avaliacao-gratuita",   label: "Análise gratuita" },
];

// ============================================================
// PILARES DE VISTO, 7 dobras, todas indexáveis.
// Geram sub-rotas /vistos/$slug/$secao com canonical próprio.
// ============================================================
export const VISA_SECTIONS: SectionDef[] = [
  {
    id: "definicao",
    label: "Definição",
    intent: "O que é o visto, em uma definição objetiva e citável.",
    indexable: true,
  },
  {
    id: "criterios",
    label: "O que o USCIS avalia",
    intent: "Critérios avaliados pelo USCIS para este visto.",
    indexable: true,
  },
  {
    id: "processo",
    label: "Processo",
    intent: "Como é o processo, etapa por etapa, com prazos realistas.",
    indexable: true,
  },
  {
    id: "familia",
    label: "Família",
    intent: "Quem é incluído no processo: cônjuge e filhos.",
    indexable: true,
  },
  {
    id: "comparativo",
    label: "Comparativo EB",
    intent: "Comparação entre EB-2 NIW, EB-1 e O-1 lado a lado.",
    indexable: true,
  },
  {
    id: "duvidas-frequentes",
    label: "Dúvidas frequentes",
    intent: "Perguntas mais comuns sobre este visto, respondidas.",
    indexable: true,
  },
  {
    id: "avaliacao-gratuita",
    label: "Análise gratuita",
    intent: "Como solicitar a análise gratuita do seu perfil.",
    indexable: false, // CTA, não vale a pena indexar isolado
  },
];

// ============================================================
// SOBRE / CONTATO, stubs ainda; mantemos o map para quando expandirem.
// ============================================================
export const SOBRE_SECTIONS: SectionDef[] = [
  { id: "quem-somos",     label: "Quem somos" },
  { id: "metodo",         label: "Método" },
  { id: "credenciais",    label: "Credenciais" },
];

export const CONTATO_SECTIONS: SectionDef[] = [
  { id: "fale-conosco",   label: "Fale conosco" },
  { id: "enderecos",      label: "Endereços" },
];

// ============================================================
// BLOG POST, sections fixas (header/corpo/cta/relacionados) +
// h2s do corpo são adicionados dinamicamente pelo SectionTOC
// em modo `auto-extract`.
// ============================================================
export const BLOG_POST_SECTIONS: SectionDef[] = [
  { id: "introducao",  label: "Introdução" },
  { id: "conteudo",    label: "Conteúdo" },
  { id: "avaliacao",   label: "Avaliação" },
];

// ============================================================
// Lookup helper, usado pela sub-rota e pelo sitemap.
// ============================================================
export function getVisaSection(id: string): SectionDef | undefined {
  return VISA_SECTIONS.find((s) => s.id === id);
}

export function visaSectionPath(slug: string, sectionId: string): string {
  return `/vistos/${slug}/${sectionId}`;
}

/** IDs antigos → novos (para redirecionar hashes legados client-side). */
export const LEGACY_HASH_REDIRECTS: Record<string, string> = {
  niw: "eb-2-niw",
  faq: "duvidas-frequentes",
  avaliacao: "avaliacao-gratuita",
};
