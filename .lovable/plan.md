## Objetivo

Cada dobra do site público passa a ter uma URL própria, de forma híbrida:

- **Home, Sobre, Contato, Blog index, Blog post**: hash anchors (`/#processo-eb-2-niw`). UX de scroll-spy atualiza a URL ao rolar; deep-link abre na dobra; `title`/`canonical`/`og:url` se ajustam ao hash ativo. SEO indexa como *passage* da página pai (estratégia que o Google já usa nativamente para conteúdo bem estruturado).
- **Pilares de visto (`/vistos/*`)**: cada dobra ganha **sub-rota real** (`/vistos/eb-2-niw-green-card-por-merito/processo`), com `head()` próprio, canonical próprio, entrada no `sitemap.xml`. Aqui SEO importa mais — é onde o tráfego de busca decide.

Tudo data-driven, reaproveitando `slugifyAEO` do `aeoSlug.ts` da Fase 2 do skill.

## Arquitetura

### 1. Catálogo de dobras (`src/lib/sectionMap.ts` — novo)

Fonte única de verdade. Para cada rota, lista as dobras com:
```ts
{
  id: "processo-eb-2-niw",       // slug AEO, vira id do <section> e #hash
  label: "Processo EB-2 NIW",    // usado no scroll-spy, TOC e <title> dinâmico
  intent: string,                // 1 frase p/ <meta description> ao deep-link
  indexable?: boolean,           // true → entra no sitemap (só pilares)
}
```
A Home tem ~14 dobras já existentes em `sections.tsx` — o map só nomeia cada uma com slug AEO. Pilares e blog idem.

### 2. `<SectionAnchor>` (`src/components/site/SectionAnchor.tsx` — novo)

Wrapper de `<section>` que aplica `id`, `aria-labelledby`, `scroll-margin-top` (compensa header fixo) e registra a section no contexto de scroll-spy. Substitui os `<section>` atuais em `sections.tsx`, `vistos.$slug.tsx`, `sobre.tsx`, `contato.tsx`, `blog.$slug.tsx`.

### 3. Hook `useScrollSpy` (`src/hooks/useScrollSpy.ts` — novo)

- `IntersectionObserver` com `rootMargin: "-30% 0px -55% 0px"` (dispara quando a dobra está realmente em foco visual).
- Debounce 250ms via `requestAnimationFrame` + `setTimeout` antes de chamar `history.replaceState`.
- **Não** empurra entrada no histórico (replaceState, não pushState) — botão voltar continua limpo.
- Respeita `prefers-reduced-motion`: desabilita o smooth-scroll programático mas mantém a atualização de URL.
- Expõe `activeId` para o componente raiz da rota atualizar `<title>` e canonical dinâmicos.

### 4. Atualização dinâmica de `<title>` e canonical

Componente `<DynamicSectionHead>` montado no shell de cada rota pública (apenas client-side). Quando `activeId` muda:
- `document.title` = `"<label da dobra> · <título da página> · Status na América"`.
- `<link rel="canonical">` reescrito para `currentPath#<id>` (mantém o canonical da página-mãe; a fragmento sinaliza contexto ao crawler sem fragmentar autoridade).
- `og:url` igualmente.

Importante: o canonical "duro" do SSR continua sendo a página-mãe (sem hash). A atualização é client-only; crawlers SSR pegam a versão íntegra da página, browsers/social-share atualizam ao navegar entre dobras.

### 5. Sub-rotas canônicas dos pilares (`/vistos/*/...`)

Criar:
- `src/routes/vistos.$slug.tsx` continua sendo o layout/index (devolve a página inteira).
- `src/routes/vistos.$slug.$secao.tsx` (nova) — rota leaf que renderiza **a mesma página** mas com:
  - `<title>`, `og:title`, `og:description` derivados da dobra (`sectionMap[slug][secao]`).
  - `canonical` apontando para `/vistos/<slug>/<secao>` (não para a página-mãe — Google indexa como página separada).
  - Loader que valida `secao` contra o catálogo; `notFound()` se inválida.
  - JSON-LD `WebPage` + `BreadcrumbList` (Home → Pilar → Seção).
  - Scroll automático até a `<section id={secao}>` no mount.
- Sitemap (`src/routes/sitemap[.]xml.ts`) passa a iterar `sectionMap` e emitir uma entrada por dobra indexável dos pilares.

A página-mãe `/vistos/<slug>` mantém canonical próprio (sem hash). A sub-rota da seção tem canonical próprio (`/vistos/<slug>/<secao>`). Não há conflito porque os títulos e descrições são distintos.

### 6. Redirects e legados

Adicionar entradas em `LEGACY_REDIRECTS` (do `aeoSlug.ts`) caso alguém já compartilhe `/vistos/eb-2-niw#processo` — o client-side detecta o hash legado e redireciona para a sub-rota canônica `/vistos/eb-2-niw-green-card-por-merito/processo`.

### 7. UX visível (sem mexer em conteúdo)

- TOC sticky aparece em mobile como bottom-sheet acionado por um chip "Nesta página" — só nas páginas com 4+ dobras (pilares e posts longos).
- Em desktop, TOC vertical discreto na lateral direita dos pilares (igual MDN/Stripe docs), 16px from edge, hover-only com fade.
- Active item destacado em `gold`; click rola com `behavior: 'smooth'` (ou `instant` se `reduced-motion`).

### 8. Acessibilidade

- `<section>` ganha `aria-labelledby` apontando para o `<h2 id=…>` interno.
- TOC é `<nav aria-label="Nesta página">`.
- Skip-link existente continua intacto (`#conteudo`).

## Arquivos tocados

**Novos:**
- `src/lib/sectionMap.ts` — catálogo de dobras por rota.
- `src/components/site/SectionAnchor.tsx` — wrapper de `<section>`.
- `src/components/site/SectionTOC.tsx` — TOC sticky/bottom-sheet.
- `src/components/site/DynamicSectionHead.tsx` — atualiza title/canonical ao rolar.
- `src/hooks/useScrollSpy.ts` — IntersectionObserver + debounce.
- `src/routes/vistos.$slug.$secao.tsx` — sub-rota canônica de dobra.

**Editados (cirurgicamente, só wrap e id):**
- `src/components/site/sections.tsx` — cada section vira `<SectionAnchor id=… label=…>`.
- `src/routes/index.tsx` — monta `DynamicSectionHead` e `SectionTOC` (mobile).
- `src/routes/vistos.$slug.tsx` — idem + canonical/og dinâmicos quando há hash; passa para layout/Outlet quando sub-rota.
- `src/routes/sobre.tsx`, `src/routes/contato.tsx`, `src/routes/blog.$slug.tsx` — wrap das sections + TOC.
- `src/routes/sitemap[.]xml.ts` — emite entradas para sub-rotas dos pilares.
- `src/lib/aeoSlug.ts` — adiciona helpers `sectionPath(slug, secao)` e mais entradas em `LEGACY_REDIRECTS` para hashes antigos.

**Não tocado:** scoring, A/B, formulário, dataStore, admin, design tokens, conteúdo textual.

## Performance e quirks

- `IntersectionObserver` único por rota (não um por section).
- `scroll-margin-top: calc(var(--header-h) + 16px)` no CSS global em vez de JS.
- `history.replaceState` é barato; debounce evita >4 chamadas/s.
- TOC desktop usa `position: sticky`, sem JS de layout.
- Pré-fetch das sub-rotas de pilar com `preload="intent"` no TOC.

## Validação

Após implementar, rodo Playwright headless em `/`, `/vistos/eb-2-niw-green-card-por-merito` e `/vistos/eb-2-niw-green-card-por-merito/processo`:
1. Confirmo que rolar atualiza o hash (sem entrar no histórico).
2. Deep-link `/...#faq` abre na dobra correta.
3. Sub-rota da seção tem `<title>` e `canonical` próprios distintos da página-mãe.
4. Sitemap inclui as novas URLs.
5. `prefers-reduced-motion` desliga o smooth-scroll mas mantém a URL ativa.

## Fora do escopo

- Sub-rotas por seção em Home, Sobre, Contato, Blog (decisão: ali o ganho SEO real é via passages do Google, e o custo de criar 14 rotas para a Home não compensa).
- Mudança de design ou conteúdo das dobras existentes.
- Tradução/conteúdo novo.

## Notas

O erro "Temporary infrastructure issue while preparing the build environment" da última build é transitório de infra (não do código). Vou apenas rodar a build na primeira etapa da execução para confirmar que está limpo antes de começar.
