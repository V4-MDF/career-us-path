## Objetivo

Rodar uma checagem de performance no site público (Home, /vistos/*, /lp/*, /avaliacao, /blog) e eliminar as causas reais de **layout shift**, **travamentos durante scroll** e **trabalho desnecessário de animação**, mantendo 60fps em mobile. Sem mexer em conteúdo, scoring, A/B, formulário ou rotas de admin.

## Diagnóstico (já levantado na exploração)

- **Fontes**: Bodoni Moda + Hanken Grotesk + JetBrains Mono carregadas via `<link>` sem `font-display` controlado pelo CSS local — usamos `&display=swap` na URL, ok, mas faltam fallbacks com métricas próximas → causa CLS quando a fonte real entra.
- **Imagens**: várias `<img>` no blog, LP e admin sem `width/height` (`LandingPageTemplate.tsx:119`, `blog.tsx:107/153`, `blog.$slug.tsx:128`) → CLS. Nenhuma imagem da Home/Hero tem `fetchpriority="high"` nem `preload`.
- **Animações** (`src/components/site/sections.tsx`): 17 elementos `motion.*`, parallax no Hero com `useScroll`+`useTransform` aplicando `translateY/scale` em uma imagem grande, animações `whileInView` em seções abaixo da dobra. Em mobile com tela longa, isso gera jank (layout/composite por frame).
- **CSS**: algumas transições com `transform` em containers grandes sem `will-change`; `route-fade-in` aplicado no shell raiz a cada navegação.
- **Sem code-splitting de rota** explícito além do default do TanStack; admin atualmente compartilha bundle se imports vazarem.

## Correções (escopo cirúrgico, sem mexer em lógica)

### 1. Estabilidade de layout (CLS → 0)
- Adicionar `width`, `height` e `aspect-ratio` (via classe ou atributo) em **toda** `<img>` pública (LP, blog index, blog post, hero quando houver).
- No `__root.tsx`, adicionar `<link rel="preconnect">` já existe; acrescentar `font-size-adjust`/`size-adjust` em `@font-face` locais de fallback para Bodoni Moda e Hanken Grotesk em `styles.css`, evitando reflow quando a webfont entra.
- Reservar altura mínima dos blocos que dependem de webfont na dobra do Hero (line-height fixo já presente, validar `min-height` no H1).

### 2. Animação eficiente (60fps)
- **Hero parallax**: trocar `useScroll`/`useTransform` aplicando `y`+`scale` em imagem por uma versão que só anima `transform: translate3d` com `will-change: transform` no elemento alvo, e desliga totalmente em mobile (`matchMedia('(max-width: 768px)')`) e quando `prefers-reduced-motion`.
- Auditar os 17 `motion.*` em `sections.tsx`: manter animação de entrada apenas em **Hero, AuthorityStrip e NiwSection** (acima/perto da dobra). Substituir os `whileInView` das seções abaixo (`Testimonials`, `FAQ`, `CtaBanner`, `LegacySection`, `SalaryCompare`) por classe CSS leve (`animate-fade-in` única, com `content-visibility: auto`).
- Adicionar `content-visibility: auto; contain-intrinsic-size: …` nas seções longas para o navegador pular trabalho de layout/paint fora da viewport.
- Remover `route-fade-in` aplicado no shell raiz para rotas admin (mantém apenas no shell público).

### 3. Carga e bundle
- Adicionar `<link rel="preload" as="image" fetchpriority="high">` para a imagem do Hero (quando houver) na `head()` de `src/routes/index.tsx`.
- Garantir que `admin.*` e `LandingPageTemplate` não sejam puxados pelo bundle inicial da Home (revisar imports estáticos cruzados; converter para lazy se necessário).
- Reduzir os pesos do Google Fonts para os realmente usados (`Bodoni Moda 400;600;700`, `Hanken Grotesk 400;500;600;700`, `JetBrains Mono 500`) — auditar e cortar o que não aparece.

### 4. Verificação (Lighthouse local via Playwright headless)
Após cada bloco, rodar Lighthouse contra `http://localhost:8080/` e `/vistos/eb-2-niw` e registrar antes/depois de LCP, CLS, TBT, e fps no scroll (Performance trace).

Metas:
- **CLS < 0.05** em todas as rotas públicas
- **LCP < 2.5s** mobile simulado
- **TBT < 200ms**
- Scroll a 60fps (sem long tasks > 50ms durante interação) no Hero e ProcessSteps

## Restrições (não negociáveis)
- Não alterar textos, dados, scoring, A/B, formulário, rotas, dataStore.
- Não trocar design system, tokens ou tipografia visual.
- Não remover animações do Hero — apenas torná-las mais baratas.
- Não tocar em rotas `/admin/*` exceto para garantir que não vazem para o bundle público.

## Entregáveis
1. Patch em `styles.css`, `__root.tsx`, `sections.tsx`, `LandingPageTemplate.tsx`, `blog.tsx`, `blog.$slug.tsx`, `index.tsx`.
2. Relatório curto com métricas Lighthouse antes/depois para Home e uma página de pilar.
