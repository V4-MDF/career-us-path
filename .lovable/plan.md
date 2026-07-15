## Diagnóstico (PageSpeed lp.statusnaamerica.com — mobile)

- Desempenho 97, mas **LCP = NO_LCP** e **TBT = NO_LCP**: o Lighthouse não conseguiu identificar o Largest Contentful Paint. Isso geralmente é o vídeo no hero (o `<video>`/iframe não conta como LCP) — falta um elemento LCP claro (imagem estática) acima da dobra.
- FCP 3,0 s e Speed Index 4,2 s no 4G lento — puxados por render-blocking, imagens pesadas e cache curto.
- Insights principais: cache ineficiente (162 KiB), entrega de imagens (270 KiB), recursos que bloqueiam render, JS legado (12 KiB), CSS/JS não usado.
- Contraste: 1 par de cores ainda falha em WCAG AA.
- A11y agente: um `<a role="listitem">` no BlogStrip com `role` inadequado para `<a>`.

## Plano de otimização

### 1. Resolver o "NO_LCP" (raiz do problema)
No hero da home (`src/routes/index.tsx` + `HeroBackgroundMedia` / `VideoPlayer`):
- Renderizar uma **imagem de poster estática** como LCP real acima do vídeo (mesmo enquadramento, `<img>` com `fetchpriority="high"`, `decoding="async"`, `width`/`height` explícitos).
- Só montar o `<video>`/embed depois do primeiro paint (efeito após hidratação) — o poster fica atrás como LCP estável.
- Adicionar `<link rel="preload" as="image" href="..." fetchpriority="high">` no `head()` da rota `/` (index.tsx, não __root).

### 2. Entrega de imagens (−270 KiB)
- Converter hero + imagens de vistos para **AVIF/WebP** via `vite-imagetools` (já permitido pelo stack). Fallback WebP.
- Servir tamanhos responsivos com `srcset`/`sizes` no `PhotoFrame` e no hero de vistos.
- `loading="lazy"` + `decoding="async"` em tudo abaixo da dobra (blog strip, testemunhos, contraste BR×EUA). Apenas o LCP fica `eager` + `fetchpriority="high"`.
- Auditar OG image (`src/assets/og-home.jpg`) e logo `.webp` — garantir dimensões corretas, sem sobre-resolução.

### 3. Cache de estáticos (−162 KiB por revisita)
- Configurar cabeçalhos `Cache-Control: public, max-age=31536000, immutable` para assets com hash (`/assets/*`) via `public/_headers` (Cloudflare Pages/Workers respeita).
- HTML permanece `no-cache`.

### 4. Render-blocking + JS legado + JS/CSS não usado
- Mover `<link>` de fontes Google para `preconnect` + `preload` da fonte crítica (Montserrat 600 + Inter 400) e `font-display: swap`. Remover pesos não usados.
- Adicionar `defer`/`async` em scripts do TrackingInjector (GTM/Pixel) e só injetá-los **após** `requestIdleCallback` ou 2s após load — hoje bloqueiam TTI. Isso também reduz "Terceiros".
- Rota `/` (que é o que `lp.statusnaamerica.com` serve) tem 14 dobras. Fazer **lazy import** das seções abaixo da dobra (`BlogStrip`, `Testimonials`, `ContrastBrasilEUA`, `Video institucional`, etc.) com `React.lazy` + `Suspense`, seguindo `tanstack-code-splitting` (sem exportar as funções de componente de rota).
- Configurar `build.target: "es2020"` no `vite.config.ts` para reduzir polyfills legados (o insight "JS legado 12 KiB" aponta transforms desnecessários).
- Purgar CSS não usado: Tailwind v4 já faz tree-shake; remover classes/utilitários mortos em `styles.css` e componentes de visuals não utilizados nesta LP (`ConstellationCanvas`, `FamilySealBackdrop` se não aparecem em `/`).

### 5. Correções de acessibilidade
- Contraste: identificar o par que falha (provavelmente texto `text-ink/70` sobre gold ou legenda em footer) e subir opacidade para ≥ 80% conforme já aplicamos em body/legal.
- BlogStrip: trocar `<a role="listitem">` — remover o `role="listitem"` do `<a>` e envolver a lista em `<ul><li><a>...</a></li></ul>` semanticamente correto.

### 6. Verificação
- Após deploy, rodar novo PageSpeed em mobile — meta: LCP < 2,5 s medido (elemento identificado), FCP < 1,8 s, Speed Index < 3,4 s, sem "NO_LCP".

## Detalhes técnicos

- Preload de LCP: `head().links` **na rota**, não em `__root.tsx` (senão vira sitewide).
- Lazy sections: manter função `HomeComponent` **não exportada** e usar `const BlogStrip = lazy(() => import("@/components/site/BlogStrip"))` no topo do arquivo, com `<Suspense fallback={null}>`.
- Cache headers: criar `public/_headers` com regras por prefixo `/assets/*` e `/_build/*` — Cloudflare respeita.
- Terceiros (GTM/Pixel): já centralizados no `TrackingInjector`; injetar via `useEffect` com `setTimeout(..., 1500)` ou `requestIdleCallback`, mantendo `dataLayer` inicializado sincronamente para não perder eventos iniciais.
- Nada disso mexe em backend, scoring, ou lógica de leads.

## Fora do escopo
- Redesign, novo conteúdo, mudanças em Admin, novas rotas ou backend.
- Substituir o vídeo do hero — só adicionar o poster/LCP na frente dele.
