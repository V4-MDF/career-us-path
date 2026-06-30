## Diagnóstico

A rolagem da home está travando por 4 causas que se somam (confirmadas no replay + console):

1. **Loop de re-render no `useOrderedSections`** — console acusa `getServerSnapshot should be cached to avoid an infinite loop`. Em `src/lib/pageStructure.ts:186` o snapshot do servidor (`reconcile(page, null)`) retorna um array novo a cada chamada, então o React entra em loop de hidratação na Home (que é a raiz da árvore visível). Isso por si só já causa engasgos sob qualquer scroll.

2. **`ConstellationCanvas` global rodando 60fps durante todo o scroll** — está montado como `fixed inset-0` em `src/routes/index.tsx`. O `IntersectionObserver` observa o próprio canvas fixo, que **nunca sai da viewport**, então o RAF não pausa nunca. São 30–120 partículas + linhas O(n²) repintadas em canvas full-screen enquanto o usuário rola — principal causa do "engasgo entre dobras".

3. **Parallax do Hero continua atualizando `transform` mesmo depois do Hero sair da tela** — o replay mostra o elemento id:132 recebendo `translateY(...%)` a cada frame de scroll. O `useScroll` do Hero não tem `layoutEffect:false` nem cutoff por viewport, e o scroll-spy também escuta scroll em paralelo.

4. **Hydration mismatch nos CTAs** — `href="/avaliacao?bust=..."` muda entre SSR e cliente (ver console: `+ bust=1782852906729 / - /avaliacao`). Isso força re-hydration de várias subárvores no primeiro scroll, agravando o jank inicial.

Bônus (relacionado): o `SectionTOC` desktop usa `backdrop-blur` no sheet móvel — segundo a heurística de perf da Lovable, `backdrop-blur` sobre conteúdo animado degrada scroll. Hoje só impacta mobile aberto, mas vale trocar por shadow/solid.

## Plano de Correção

### 1. Estabilizar `useOrderedSections` (mata o loop)
- Em `src/lib/pageStructure.ts`, memoizar também o **server snapshot** (cache por page slug) para que `useSyncExternalStore` receba sempre a mesma referência. Resultado: zero warning, zero loop, zero re-render da home inteira a cada tick.

### 2. Domar o `ConstellationCanvas`
- Pausar o RAF durante o scroll (debounce 180ms após o último evento) — enquanto o usuário rola, o canvas congela; volta a animar quando a rolagem para.
- Trocar o `IntersectionObserver` (inútil em `position:fixed`) por listener de `scroll`+`visibilitychange`.
- Reduzir `density` default de `0.00008` → `0.00005` e linkDistance `130` → `110` para cortar custo O(n²).
- Manter o gate de `prefers-reduced-motion` e `<768px` já existente.

### 3. Limitar o parallax do Hero ao Hero visível
- Em `sections.tsx` `Hero`, envolver o `useScroll` com `offset: ["start start", "end start"]` e adicionar um `useReducedMotion`/viewport check para desligar a transform quando o Hero saiu de cena (`scrollYProgress > 1`). Isso para o `style.transform` de atualizar a cada frame enquanto o usuário lê as outras dobras.

### 4. Eliminar o hydration mismatch dos CTAs
- Localizar onde o `?bust=<timestamp>&src=...` é injetado nos `<a href>` (CTAs do header, hero, NIW e CTA final). Mover a injeção do timestamp para `onClick` (ou usar `useEffect` para reescrever o href após mount), de forma que o SSR e o primeiro render do cliente produzam exatamente o mesmo HTML. Mantém o tracking, remove o warning e impede re-hydration em cascata no primeiro scroll.

### 5. Polimentos rápidos de fluidez
- Trocar `backdrop-blur-sm` do overlay do `SectionTOC` por `bg-ink-deep/85` puro (sem blur).
- Garantir `will-change: transform` apenas no nó com parallax ativo (e remover quando termina), evitando promoção desnecessária de camadas nas outras dobras.

## Validação
- Console limpo do warning `getServerSnapshot`.
- Console limpo do warning de hydration mismatch nos `href`s.
- Playwright headless: rolar a home top→bottom medindo `performance.now()` entre frames; nenhum gap > 50ms (60fps ≈ 16ms).
- Reordenação de dobras no `/admin/estrutura` continua refletindo na home (regressão da correção anterior).

## Restrições
- Não mexer em copy, layout visual nem na ordem padrão das dobras.
- Não remover o `ConstellationCanvas` — só estabilizá-lo.
- Manter o tracking de origem (`src=...`) — só mudar **quando** o querystring é anexado ao href.
