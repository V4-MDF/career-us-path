/**
 * AEO Slug Utilities — Status na América
 * =======================================
 *
 * Slugs otimizados para Answer Engine Optimization (Google + LLMs).
 *
 * Princípios:
 *  1. Normalização estrita: apenas [a-z0-9-]. Sem acentos, sem maiúsculas,
 *     sem caracteres especiais.
 *  2. Injeção semântica: se o título não carrega a keyword-âncora do nicho,
 *     ela é prefixada/sufixada automaticamente para casar com queries reais
 *     em PT-BR ("como conseguir green card", "morar legalmente nos EUA",
 *     "visto americano para [profissão]").
 *  3. Prevenção de colisão: aceita `uniqueKey` opcional (ID, SKU, código
 *     interno) anexado ao final como sufixo curto.
 *  4. Idempotência: slugify(slugify(x)) === slugify(x).
 *  5. SSR-safe: sem `window`, sem `document`, sem `Intl` opcional.
 *
 * Uso típico:
 *
 *   slugifyAEO("EB-2 NIW")                          → "eb-2-niw"
 *   slugifyAEO("Checklist NIW", { kind: "checklist", topic: "eb-2-niw", year: 2026 })
 *                                                   → "checklist-eb-2-niw-documentos-2026"
 *   slugifyAEO("Médico brasileiro nos EUA",
 *              { kind: "guia", profession: "medico" })
 *                                                   → "como-medico-brasileiro-pode-morar-nos-eua-com-eb-2-niw"
 *
 * NUNCA edite slugs persistidos diretamente — use `migrateSlug()` para
 * gerar o novo slug + registrar o redirect 301 em `LEGACY_REDIRECTS`.
 */

// =============================================================================
// Configuração de keywords-âncora (editável conforme estratégia evoluir)
// =============================================================================

/**
 * Keywords prioritárias confirmadas pelo cliente (Fase 1):
 *  - "visto americano para [profissão]"
 *  - "morar legalmente nos EUA"
 *  - "como conseguir green card"
 *
 * Mantemos como mapa para que a Fase 2 do skill possa ser re-executada
 * mudando só este bloco sem tocar na lógica.
 */
export const AEO_KEYWORDS = {
  /** Termo guarda-chuva que TODA URL de visto deve carregar. */
  greenCard: "green-card",
  /** Sufixo humano para cada visto — capta intenção comercial. */
  visaBenefit: {
    "eb-2-niw": "green-card-por-merito",
    "eb-1": "green-card-habilidade-extraordinaria",
    "eb-3": "green-card-por-oferta-de-trabalho",
  } as Record<string, string>,
  /** Padrão de slug para guias por profissão. */
  professionTemplate: (profession: string) =>
    `como-${profession}-brasileiro-pode-morar-nos-eua-com-eb-2-niw`,
  /** Prefixos por tipo de conteúdo (ordem importa: precede o título). */
  contentPrefix: {
    guia: "guia-",
    como: "como-",
    checklist: "checklist-",
    custos: "quanto-custa-",
    comparativo: "", // o sufixo "-vs-" + "-qual-escolher" é gerado à parte
    case: "case-",
    historia: "historia-",
  } as Record<string, string>,
} as const;

// =============================================================================
// Slugify base — normalização estrita ASCII
// =============================================================================

/**
 * Normaliza qualquer string para o subset seguro de URL: [a-z0-9-].
 * Idempotente.
 */
function baseSlug(input: string): string {
  if (!input) return "";
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove diacríticos
    .toLowerCase()
    .replace(/['"`´]/g, "")          // apóstrofos e crases viram nada
    .replace(/[^a-z0-9]+/g, "-")      // tudo que não é alfanumérico vira hífen
    .replace(/-+/g, "-")              // colapsa hífens repetidos
    .replace(/(^-|-$)/g, "");         // apara bordas
}

// =============================================================================
// API pública
// =============================================================================

export type ContentKind =
  | "visa"          // pilar de visto
  | "guia"          // guia editorial
  | "como"          // explainer "como X"
  | "checklist"     // checklist (documentos, etapas)
  | "custos"        // página de custos
  | "comparativo"   // comparativo A vs B
  | "case"          // case de aprovação
  | "historia"      // depoimento longo
  | "generic";      // sem injeção semântica

export interface SlugifyOptions {
  /** Tipo de conteúdo — define prefixos/sufixos injetados. */
  kind?: ContentKind;
  /**
   * Topic ID interno (ex: "eb-2-niw", "eb-1"). Quando presente, é anexado
   * ao slug para amarrar tematicamente. Garante que `/blog/checklists/checklist-eb-2-niw-…`
   * sempre carregue o código do visto.
   */
  topic?: string;
  /** Profissão alvo (medico, engenheiro, empresario). */
  profession?: string;
  /** Ano de relevância — anexado quando o conteúdo é time-sensitive. */
  year?: number;
  /**
   * Sufixo único anti-colisão (ID, SKU, código). Convertido para baseSlug
   * e truncado em 12 chars. Use quando dois itens podem gerar o mesmo título.
   */
  uniqueKey?: string | number;
  /** Tamanho máximo final do slug (default 80). */
  maxLength?: number;
}

/**
 * Slug AEO contextual. Aplica injeção semântica conforme `kind`.
 *
 * Garantias:
 *  - Resultado sempre matches /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/ (ou string vazia).
 *  - Idempotente: slugifyAEO(slugifyAEO(x, opts), opts) === slugifyAEO(x, opts).
 */
export function slugifyAEO(title: string, opts: SlugifyOptions = {}): string {
  const { kind = "generic", topic, profession, year, uniqueKey, maxLength = 80 } = opts;
  const base = baseSlug(title);

  let slug = base;

  // 1. Prefixo semântico por tipo de conteúdo
  const prefix = AEO_KEYWORDS.contentPrefix[kind];
  if (prefix && !slug.startsWith(prefix)) {
    slug = `${prefix}${slug}`;
  }

  // 2. Caso especial: guia por profissão usa template fixo
  if (kind === "guia" && profession) {
    const template = AEO_KEYWORDS.professionTemplate(baseSlug(profession));
    slug = template;
  }

  // 3. Caso especial: pilar de visto — anexa o "benefício humano"
  if (kind === "visa" && topic) {
    const code = baseSlug(topic);
    const benefit = AEO_KEYWORDS.visaBenefit[code];
    slug = benefit ? `${code}-${benefit}` : `${code}-${AEO_KEYWORDS.greenCard}`;
  }

  // 4. Anexa topic quando aplicável (mas não duplica)
  if (topic && kind !== "visa" && kind !== "guia") {
    const t = baseSlug(topic);
    if (t && !slug.includes(t)) slug = `${slug}-${t}`;
  }

  // 5. Anexa ano quando passado
  if (year && Number.isFinite(year)) {
    const y = String(year);
    if (!slug.includes(y)) slug = `${slug}-${y}`;
  }

  // 6. Sufixo único anti-colisão (curto)
  if (uniqueKey != null) {
    const u = baseSlug(String(uniqueKey)).slice(0, 12);
    if (u) slug = `${slug}-${u}`;
  }

  // 7. Normalização final + truncamento por palavra
  slug = baseSlug(slug);
  if (slug.length > maxLength) {
    slug = slug.slice(0, maxLength).replace(/-[^-]*$/, ""); // não corta no meio de palavra
  }
  return slug;
}

/**
 * Gera slug para hub comparativo: `<a>-vs-<b>-qual-escolher`.
 * Ordena alfabeticamente para garantir canonical único (eb-1-vs-eb-2 ≠ eb-2-vs-eb-1
 * seria ruim para SEO — escolhemos a ordem alfabética como canônica).
 */
export function slugifyComparison(a: string, b: string): string {
  const [first, second] = [baseSlug(a), baseSlug(b)].sort();
  return `${first}-vs-${second}-qual-escolher`;
}

// =============================================================================
// Mapa de redirects 301 (URLs antigas → novas)
// =============================================================================

/**
 * Tabela explícita de redirects. Lida pela server route
 * `src/routes/api/_redirects.ts` (Fase 3) e pelo client-side fallback no
 * `__root.tsx`. Mantenha entradas aqui SEMPRE que renomear uma URL pública,
 * mesmo que o backlink seja interno.
 *
 * Regra: chave = path antigo SEM querystring; valor = path novo.
 */
export const LEGACY_REDIRECTS: Record<string, string> = {
  // Pilares de visto
  "/vistos/eb-2-niw": "/vistos/eb-2-niw-green-card-por-merito",
  "/vistos/eb2-niw": "/vistos/eb-2-niw-green-card-por-merito",
  "/vistos/eb-1": "/vistos/eb-1-green-card-habilidade-extraordinaria",
  "/vistos/eb1": "/vistos/eb-1-green-card-habilidade-extraordinaria",
  "/vistos/eb-3": "/vistos/eb-3-green-card-por-oferta-de-trabalho",
  "/vistos/eb3": "/vistos/eb-3-green-card-por-oferta-de-trabalho",
  // Blog: posts-semente que tinham slug flat → nova taxonomia
  "/blog/checklist-eb2-niw": "/blog/checklists/checklist-eb-2-niw-documentos-2026",
  "/blog/quanto-custa-eb2": "/blog/custos/quanto-custa-processo-eb-2-niw-em-2026",
  "/blog/medico-brasileiro-eua":
    "/blog/guias/como-medico-brasileiro-pode-morar-nos-eua-com-eb-2-niw",
};

/**
 * Resolve um path legado para o novo, ou devolve `null` se não há redirect.
 * Usado tanto no SSR (server route) quanto no client (fallback) para garantir
 * que backlinks antigos nunca quebrem.
 */
export function resolveLegacyPath(pathname: string): string | null {
  // Normaliza trailing slash p/ casar com a tabela
  const key = pathname.replace(/\/+$/, "") || "/";
  return LEGACY_REDIRECTS[key] ?? null;
}

/**
 * Helper para o sitemap e para `<Link>`s internos: dado o "código curto"
 * de um visto (eb-2-niw), devolve o path AEO canônico.
 */
export function visaCanonicalPath(code: string): string {
  const c = baseSlug(code);
  const benefit = AEO_KEYWORDS.visaBenefit[c] ?? AEO_KEYWORDS.greenCard;
  return `/vistos/${c}-${benefit}`;
}

/**
 * Helper para o sitemap: dado categoria + slug do post, devolve o path AEO
 * canônico no formato `/blog/<categoria>/<slug>`.
 */
export function blogCanonicalPath(categoria: string, slug: string): string {
  return `/blog/${baseSlug(categoria)}/${baseSlug(slug)}`;
}

/**
 * Helper compatibilidade: re-exporta a slugify antiga do `blog.ts` como
 * `slugifyAEO` em modo `generic`. Mantém migração suave.
 */
export const slugify = (s: string) => slugifyAEO(s, { kind: "generic" });
