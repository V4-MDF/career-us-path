
## Objetivo

Toda LP `/lp/$slug` (segmento) e toda variante A/B do Hero devem renderizar exatamente a mesma estrutura das páginas de visto (`/vistos/$slug`), trocando somente a **primeira dobra (Hero)** — eyebrow, H1, subtítulo, CTA e imagem. Nada mais muda entre variantes.

Hoje a LP tem 10+ dobras próprias (comparativo, dores, custo de adiar, caminho, processo, checklist, autoridade, depoimentos, FAQ…) que divergem da página de visto. Isso será substituído pelo corpo canônico do visto.

## O que muda

### 1. Corpo compartilhado do visto aceita esconder o Hero
`src/components/site/visa/VisaPageBody.tsx` recebe prop opcional `hideHero?: boolean`. Quando `true`, a `<section id="abertura">` (Hero de visto) não é renderizada — o Hero da LP entra no lugar. Nenhum outro comportamento muda; páginas de visto seguem idênticas.

### 2. `LandingPageTemplate` renderiza Hero + VisaPageBody
`src/components/site/lp/LandingPageTemplate.tsx` é reduzido a:
- `<ConversionHeader />` (mantém — sem menu para não vazar tráfego pago)
- **Hero de LP** (única dobra específica do segmento/variante): eyebrow, H1, sub, CTA, imagem — todos vindos da `HeroVariant` ativa (ou de `segment.hero_default` como fallback)
- `<VisaPageBody page={visaPage} hideHero />` — corpo idêntico ao pilar do visto
- `<LpFooter />`

Todas as outras seções antigas da LP (comparativo/dores/custo/checklist/depoimentos/FAQ do segmento etc.) são removidas do render.

### 3. Segmento aponta para uma página de visto
Novo campo em `Segment` (`src/lib/segments.ts`):
- `visa_slug: VisaSlug` (default `"eb2-niw"`) — indica qual estrutura de visto a LP deve usar.

Seed dos três segmentos existentes (`medicos`, `engenheiros`, `empresarios`) recebe `visa_slug: "eb2-niw"`. Campos legados do segmento (comparativo, dores, custo_adiar, checklist, faq_segmento) permanecem no tipo por compatibilidade com o dataStore, mas deixam de ser usados na renderização — podem ser podados em prompt futuro.

### 4. Hero default do segmento ganha `imagem`
`Segment.hero_default` recebe `imagem?: string` opcional (mesma semântica que já existe em `HeroVariant.imagem`). Assim o fallback também controla a imagem quando não há variante A/B.

### 5. Admin — LP variante A/B foca em Hero
Em `src/routes/admin.segmentos.tsx`:
- Adicionar select `visa_slug` no editor do segmento (opções: EB-2 NIW, EB-1, EB-3).
- Adicionar campo `imagem` (URL) no `hero_default`.
- Deixar explícito na UI que a variante A/B **muda apenas o Hero** (eyebrow, H1, sub, CTA e imagem). Os campos legados de conteúdo do segmento saem do formulário (ficam apenas no dataStore como legado — não editáveis).

### 6. Rota `/lp/$slug`
`src/routes/lp.$slug.tsx` carrega o segmento, resolve `VISA_PAGES[segment.visa_slug]` e passa `visaPage` para `LandingPageTemplate` junto com `segment` e `variant`. `notFound` continua se slug/segmento inválido ou se `visa_slug` não existir em `VISA_PAGES` (fallback para `eb2-niw`). Meta tags continuam vindo do segmento (title/description/noindex).

## Detalhes técnicos

- `VisaPageBody` atualmente abre com `<main className="pt-28">`. Com `hideHero`, o Hero da LP já provê seu próprio topo — a `<main>` interna passa a `pt-0` quando `hideHero` está ligado, e o wrapper externo da LP fica responsável pelo espaçamento sob o `ConversionHeader` fixo.
- O Hero da LP mantém o layout atual do template (grid 2 colunas com imagem à direita, prova social em citação lateral, badge de eyebrow em gold). Nada de repetir a abertura do visto.
- CTA do Hero e do header continuam usando `avaliacaoHref(`lp_${segment.id}`, segment.id)` — tracking A/B e conversão via `abEngine.registerConversion` permanecem intocados.
- `VISA_SECTIONS` / `DynamicSectionHead` (scroll-spy + `#hash`) **não** são incluídos na LP — LPs seguem sem TOC nem URL por dobra (é uma página de conversão, não pilar SEO). Só o conteúdo visual do corpo é reaproveitado.
- Nenhuma mudança em `abEngine.ts`, `dataStore.ts`, `ctaLinks.ts` ou nas rotas de `/vistos/*`.

## Arquivos tocados

- `src/lib/segments.ts` — adicionar `visa_slug`, `hero_default.imagem`; atualizar seeds.
- `src/lib/visaPages.ts` — exportação já pronta; sem mudança.
- `src/components/site/visa/VisaPageBody.tsx` — prop `hideHero` opcional.
- `src/components/site/lp/LandingPageTemplate.tsx` — reduzido a Header + Hero + `VisaPageBody hideHero` + Footer.
- `src/routes/lp.$slug.tsx` — resolver `visaPage` a partir de `segment.visa_slug` e passar para o template.
- `src/routes/admin.segmentos.tsx` — select de `visa_slug`, campo `imagem` no hero_default, e remoção dos editores de comparativo/dores/checklist/faq da UI.

## Fora de escopo

- Migração/purga dos campos legados no dataStore (ficam guardados para consulta e podem ser removidos em prompt futuro).
- Novas variantes de estrutura por segmento (todas usam a mesma família visa).
- Mudanças em SEO/canonical das páginas de visto.
