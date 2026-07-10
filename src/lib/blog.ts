/**
 * Blog, tipos, helpers e seed de posts.
 *
 * Armazenamento via dataStore (tabela `blog_posts`). Cada post tem id = slug.
 * Status pode ser "rascunho" ou "publicado", só publicados aparecem no site.
 */

import { get, list, set, remove } from "./dataStore";
import coverCustoVida from "@/assets/blog-custo-vida-eua.jpg";
import coverImigrantes from "@/assets/blog-imigrantes-qualificados.jpg";
import coverEbCategorias from "@/assets/blog-eb1-eb2-eb3.jpg";
import coverVistos2026 from "@/assets/blog-vistos-2026.jpg";

export type BlogStatus = "rascunho" | "publicado";

export type BlogCategoria =
  | "Vida nos EUA"
  | "Vistos e Green Card"
  | "Carreira e Mercado"
  | "Histórias e Casos";

export const CATEGORIAS: BlogCategoria[] = [
  "Vida nos EUA",
  "Vistos e Green Card",
  "Carreira e Mercado",
  "Histórias e Casos",
];

export interface BlogPost {
  id: string;               // = slug
  titulo: string;
  slug: string;
  categoria: BlogCategoria;
  capa: string;             // URL ou base64
  resumo: string;
  corpo: string;            // markdown
  autor: string;
  status: BlogStatus;
  data_publicacao: string;  // ISO date
  meta_title: string;
  meta_description: string;
  og_image: string;
  tempo_leitura: number;    // minutos (auto)
}

/** Cálculo simples de tempo de leitura, ~220 palavras/min. */
export function calcReadingTime(markdown: string): number {
  const words = markdown.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

export function slugify(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

/**
 * Merge stored posts with seed posts. Em SSR (Cloudflare Worker) o
 * `dataStore` lê de localStorage e devolve `[]`, então caímos no seed .
 * isso garante que páginas-semente do blog tenham HTML pré-renderizado
 * para SEO/compartilhamento. No browser, posts criados/editados via admin
 * sobrescrevem o seed pelo mesmo slug.
 */
function mergeWithSeed(stored: BlogPost[]): BlogPost[] {
  const bySlug = new Map<string, BlogPost>();
  for (const p of SEED_POSTS) bySlug.set(p.slug, p);
  for (const p of stored) bySlug.set(p.slug, p); // stored vence
  return Array.from(bySlug.values()).sort((a, b) =>
    (b.data_publicacao || "").localeCompare(a.data_publicacao || ""),
  );
}

export async function listAllPosts(): Promise<BlogPost[]> {
  await ensureSeed();
  const stored = await list<BlogPost>("blog_posts");
  return mergeWithSeed(stored);
}

export async function listPublishedPosts(): Promise<BlogPost[]> {
  const all = await listAllPosts();
  return all.filter((p) => p.status === "publicado");
}

export async function getPost(slug: string): Promise<BlogPost | null> {
  await ensureSeed();
  const stored = await get<BlogPost>("blog_posts", slug);
  if (stored) return stored;
  return SEED_POSTS.find((p) => p.slug === slug) ?? null;
}

export async function savePost(post: BlogPost): Promise<void> {
  const withRT = { ...post, tempo_leitura: calcReadingTime(post.corpo || "") };
  await set("blog_posts", post.slug, withRT);
}

export async function deletePost(slug: string): Promise<void> {
  await remove("blog_posts", slug);
}

/* --------------------------- SEED --------------------------- */

const SEED_FLAG_KEY = "_seeded_v1";

const PLACEHOLDER_COVER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="%230E1726"/><stop offset="1" stop-color="%2316223A"/></linearGradient></defs><rect width="1200" height="630" fill="url(%23g)"/><rect x="40" y="40" width="60" height="2" fill="%23B7975A"/><text x="40" y="320" font-family="serif" font-size="56" fill="%23ECE6D6">Status na América</text><text x="40" y="370" font-family="monospace" font-size="14" fill="%23B7975A" letter-spacing="3">DOSSIE / IMIGRACAO</text></svg>`
  );

const SEED_POSTS: BlogPost[] = [
  {
    id: "custo-de-vida-nos-eua-guia-realista",
    slug: "custo-de-vida-nos-eua-guia-realista",
    titulo:
      "Quanto custa viver nos Estados Unidos? O guia realista para famílias brasileiras",
    categoria: "Vida nos EUA",
    capa: coverCustoVida,
    resumo:
      "Moradia, escola, saúde, mercado e poder de compra: o que muda quando uma família brasileira de classe média se muda para os EUA, sem fantasia e sem catastrofismo.",
    autor: "Equipe Status na América",
    status: "publicado",
    data_publicacao: "2026-05-12",
    meta_title:
      "Custo de vida nos EUA: guia realista para famílias brasileiras",
    meta_description:
      "Quanto custa viver nos Estados Unidos hoje? Moradia, escola, saúde e poder de compra para famílias brasileiras, comparativo objetivo.",
    og_image: coverCustoVida,
    tempo_leitura: 0, // calculado em save
    corpo: `## Por que esta conversa precisa ser honesta

O custo de vida nos EUA é repetidamente medido por extremos: ou se vende uma fantasia, ou se ouve histórias de famílias quebradas pelo aluguel em Manhattan. A realidade é mais útil quando comparamos cenários reais, cidade média da Flórida, subúrbio do Texas, cidade pequena no Meio-Oeste, e olhamos para o poder de compra equivalente.

## Moradia: o maior item do orçamento

Em cidades como Orlando, Tampa, Houston ou Dallas, uma casa de 3 quartos em bairro de classe média parte de US$ 2.200 a US$ 3.500/mês de aluguel em 2025–2026. Comprar a mesma casa significa entrada de 10–20% e prestação compatível com o aluguel, dependendo das taxas.

## Escola pública: o ponto que mais surpreende

A rede pública americana, em bairros de classe média, é gratuita e funcional. É um dos itens em que o poder de compra de uma família brasileira efetivamente sobe, escolas particulares deixam de ser obrigatoriedade.

## Saúde: planejamento, não loteria

O sistema de saúde americano funciona por planos privados, em geral subsidiados pelo empregador. Famílias com plano contratam coberturas robustas; o que importa é entender franquias (deductibles) e copagamentos antes da mudança.

## Mercado e estilo de vida

Itens básicos custam, em média, o equivalente em dólar ao que custam em real no Brasil, o que, dada a paridade, representa um aumento absoluto. Em compensação, eletrônicos, carros, combustível e refeições em redes ficam significativamente mais baratos.

<!-- expandir conteúdo -->
`,
  },
  {
    id: "por-que-os-eua-querem-imigrantes-qualificados",
    slug: "por-que-os-eua-querem-imigrantes-qualificados",
    titulo: "Por que os Estados Unidos querem imigrantes qualificados",
    categoria: "Vida nos EUA",
    capa: coverImigrantes,
    resumo:
      "Imigração legal qualificada não é uma exceção americana, é um pilar histórico. Entenda por que profissionais que geram renda, impostos e empregos são exatamente o perfil que os EUA buscam atrair.",
    autor: "Equipe Status na América",
    status: "publicado",
    data_publicacao: "2026-05-20",
    meta_title:
      "Por que os EUA querem imigrantes qualificados (e como isso muda o seu plano)",
    meta_description:
      "A imigração legal qualificada é um pilar da política americana. Entenda os interesses econômicos por trás dos vistos EB e por que o seu perfil pode ser exatamente o que os EUA buscam.",
    og_image: coverImigrantes,
    tempo_leitura: 0,
    corpo: `## Imigração não é só o que aparece nas manchetes

O debate público sobre imigração nos EUA é dominado pela imigração irregular na fronteira sul. Essa é uma realidade, mas é apenas um lado de uma equação muito maior. Em paralelo, os Estados Unidos mantêm um dos maiores programas de imigração legal qualificada do mundo, com categorias específicas (EB-1, EB-2, EB-3, EB-5) desenhadas para atrair perfis que somam à economia.

## Por que esse interesse existe

A economia americana cresce, há décadas, em larga medida por importar talentos. Médicos, engenheiros, pesquisadores, fundadores de empresas e profissionais de áreas estratégicas geram receita tributária, criam empregos e mantêm a competitividade tecnológica do país.

## Onde o EB-2 NIW se encaixa

O National Interest Waiver é, talvez, o exemplo mais explícito dessa lógica: a lei DISPENSA o requisito de empregador patrocinador quando o profissional, sozinho, é considerado de interesse nacional. É o reconhecimento de que existem perfis cuja entrada nos EUA é desejável por mérito próprio.

## O que isso significa para você

Se você é um profissional brasileiro consolidado, médico, engenheiro, empresário, especialista de área, é provável que se enquadre no perfil que a imigração legal americana foi desenhada para atrair. O caminho existe; o que define o resultado é a estruturação correta do caso.

<!-- expandir conteúdo -->
`,
  },
  {
    id: "eb1-eb2-niw-ou-eb3-qual-green-card",
    slug: "eb1-eb2-niw-ou-eb3-qual-green-card",
    titulo:
      "EB-1, EB-2 NIW ou EB-3: qual caminho de Green Card combina com o seu perfil?",
    categoria: "Vistos e Green Card",
    capa: coverEbCategorias,
    resumo:
      "Três categorias EB, três perfis distintos. Um comparativo objetivo entre EB-1, EB-2 NIW e EB-3 para você entender em qual caminho seu perfil se encaixa.",
    autor: "Equipe Status na América",
    status: "publicado",
    data_publicacao: "2026-05-28",
    meta_title:
      "EB-1, EB-2 NIW ou EB-3: qual Green Card combina com o seu perfil",
    meta_description:
      "Comparativo objetivo entre EB-1, EB-2 NIW e EB-3 para profissionais brasileiros: critérios, prazo, patrocinador e quando cada categoria faz sentido.",
    og_image: coverEbCategorias,
    tempo_leitura: 0,
    corpo: `## Três categorias, três lógicas distintas

Existem três categorias de Green Card baseado em emprego (Employment-Based) mais comuns para profissionais brasileiros qualificados: **EB-1**, **EB-2 NIW** e **EB-3**. A escolha não é uma questão de gosto, cada uma tem critérios próprios e atende a um perfil distinto.

## EB-1, habilidade extraordinária

Perfil mais alto. Exige reconhecimento internacional comprovado na área (ao menos 3 dos 10 critérios oficiais do USCIS, ou um prêmio internacional único). Dispensa patrocinador e PERM. Veja a página completa em [/vistos/eb1](/vistos/eb1).

## EB-2 NIW, interesse nacional

Carro-chefe para profissionais consolidados. Exige grau avançado (ou bacharelado + 5 anos) ou habilidade excepcional, e demonstração de que a atuação é de interesse nacional (Matter of Dhanasar). DISPENSA patrocinador e PERM. Veja [/vistos/eb2-niw](/vistos/eb2-niw).

## EB-3, profissional qualificado com oferta de emprego

EXIGE empregador americano patrocinador e processo de PERM. É o caminho indicado quando há uma oferta concreta de trabalho e o perfil não se enquadra nas categorias autônomas. Veja [/vistos/eb3](/vistos/eb3).

## Como decidir

A pergunta não é "qual é o melhor visto?", é "qual é o melhor visto **para este perfil e este momento**?". A definição correta da categoria é a primeira etapa de um processo bem estruturado.

<!-- expandir conteúdo -->
`,
  },
  {
    id: "emissao-de-vistos-brasileiros-2026",
    slug: "emissao-de-vistos-brasileiros-2026",
    titulo:
      "Emissão de vistos para brasileiros em 2026: o que considerar e por que planejar com antecedência",
    categoria: "Vistos e Green Card",
    capa: coverVistos2026,
    resumo:
      "Cenários consulares oscilam, e essa é exatamente a razão pela qual o planejamento antecipado importa. Uma leitura sóbria do que está acontecendo e como isso impacta projetos sérios de imigração.",
    autor: "Equipe Status na América",
    status: "publicado",
    data_publicacao: "2026-06-02",
    meta_title:
      "Vistos para brasileiros em 2026: o que considerar antes de começar",
    meta_description:
      "Como estão a agenda consular e os prazos do USCIS para brasileiros em 2026, e por que planejar com antecedência é o que diferencia projetos sérios de imigração.",
    og_image: coverVistos2026,
    tempo_leitura: 0,
    corpo: `## O que está realmente acontecendo

Os tempos de processamento do USCIS e a agenda dos consulados americanos no Brasil oscilam ao longo do ano. Em 2025–2026, observam-se variações relevantes, algumas etapas mais lentas, outras mais ágeis, em função de fluxo, prioridades e capacidade.

## Por que tratar isso com sobriedade importa

Promessas de prazo são, em qualquer cenário, irresponsáveis. Nenhum escritório controla a janela consular ou a fila do USCIS. O que pode ser controlado é a **qualidade da estruturação do caso** e o **momento de iniciar**.

## Por que planejar com antecedência

A maior parte do tempo de um projeto sério de Green Card está na fase de preparação: reunir evidências, redigir a narrativa jurídica do caso, organizar documentação da família. Quem inicia esse trabalho cedo abre janela para múltiplos cenários consulares.

## O que isso muda no seu plano

Se sua decisão de mudar para os EUA é firme, a recomendação é objetiva: começar a avaliação agora. O processo é longo por natureza; o que cabe ao profissional é não somar a esse tempo a demora da decisão.

<!-- expandir conteúdo -->
`,
  },
];

/** Insere os posts-semente apenas uma vez; migra capas antigas (placeholder) para as novas. */
export async function ensureSeed(): Promise<void> {
  for (const p of SEED_POSTS) {
    const existing = await get<BlogPost>("blog_posts", p.slug);
    if (!existing) {
      await set("blog_posts", p.slug, { ...p, tempo_leitura: calcReadingTime(p.corpo) });
      continue;
    }
    // Migração: se a capa armazenada é o placeholder antigo (SVG inline) ou
    // está vazia, troca pela capa real do seed atual.
    const stale = !existing.capa || existing.capa.startsWith("data:image/svg+xml");
    if (stale) {
      await set("blog_posts", p.slug, {
        ...existing,
        capa: p.capa,
        og_image: existing.og_image && !existing.og_image.startsWith("data:image/svg+xml") ? existing.og_image : p.og_image,
      });
    }
  }
  await set("blog_posts", SEED_FLAG_KEY, { done: true });
}
