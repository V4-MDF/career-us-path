## Escopo

Seis correções pedidas, todas em código de apresentação (sem mexer em scoring, A/B, dataStore ou rotas de admin).

---

### 1. Tipografia legível (Montserrat + Inter)

Trocar globalmente Bodoni Moda + Hanken Grotesk pela combinação solicitada:

- **Display/Títulos**: `Montserrat` (700/800), com `text-transform: uppercase` e `letter-spacing` levemente positivo (tracking-wide) — ativado por padrão em `h1/h2` e nos utilitários `display-1/2/3`.
- **Corpo**: `Inter` 400/500 (já adequado para leitura confortável).
- **Dados/labels**: manter `JetBrains Mono` (não é problema de legibilidade).

Implementação:
- `bun add @fontsource/montserrat @fontsource-variable/inter`
- Atualizar `src/styles.css`: trocar `--font-display` e `--font-sans`, ajustar `@utility display-1/2/3` para incluir `text-transform: uppercase` e `font-weight: 800`, reduzir `letter-spacing` negativo herdado de Bodoni (que comprime texto e prejudica leitura).
- Aumentar `line-height` do corpo de `1.55` para `1.65` e `font-size` base de 15px para 16px.
- Remover `<link>` do Google Fonts antigo em `__root.tsx`.

Comentário no CSS marcando que a identidade "Dossiê" agora é expressa por estrutura/cor (ink + parchment + gold), não por serifa.

---

### 2. Motivos visuais EUA / Brasil / família / processo

Quatro componentes SVG novos em `src/components/site/visuals/`, todos `aria-hidden`, leves, com `prefers-reduced-motion` respeitado e fallback estático no mobile:

| Componente | Onde | O que faz |
|---|---|---|
| `BrUsRouteBackdrop.tsx` | Hero da Home (atrás do `<h1>`) | SVG inline com silhuetas estilizadas de BR e USA conectadas por uma rota pontilhada animada (dash-offset). Opacity 0.08, cor gold. |
| `FamilySealBackdrop.tsx` | Dobra família/legado (`#familia` no sections.tsx) | Silhuetas lineares de família (4 figuras) + selo circular com águia estilizada à direita. |
| `ProcessIconStrip.tsx` | Dobra do processo (`#processo`) | Tira de ícones SVG sobre a timeline: passaporte → formulário I-140 → carimbo USCIS → Green Card. Anima em sequência ao entrar na viewport (uma vez). |
| `ConstellationCanvas.tsx` | Fundo global da Home (atrás de tudo, mix-blend overlay) | Canvas 2D com ~80 pontos formando constelação reativa ao mouse (linhas até 120px de distância). Pausa quando aba inativa; desativado em `prefers-reduced-motion` e em viewport < 768px (substituído por gradient estático). |

Tokens novos em `styles.css`: `--motif-opacity` e utilitário `.motif-soft` para padronizar opacidade/blend.

---

### 3. Carrossel do blog na hero

Nova dobra `BlogStrip.tsx` colocada logo abaixo do hero (antes de "Credenciais"), lendo `getPublishedPosts()` do `src/lib/blog.ts`. Mostra os 3 posts mais recentes em cards horizontais (título, categoria, lead, tempo de leitura). Link "Ver todos →" para `/blog`. Se não houver posts publicados, renderiza placeholder enxuto com 3 títulos sugeridos (sem quebrar layout).

---

### 4. Remover botão de WhatsApp do site público

Remover **todos** os CTAs/links de WhatsApp do site público:
- `src/routes/avaliacao.tsx` — botão no header e qualquer menção secundária.
- `src/routes/avaliacao.obrigado.tsx` — bloco "Falar agora no WhatsApp".
- `src/routes/blog.$slug.tsx` — botão de share WhatsApp (manter X/Twitter e LinkedIn).
- `src/components/site/Footer.tsx` e Header — se houver link/FAB.
- `src/components/site/sections.tsx` — qualquer CTA secundário "fale conosco no WhatsApp".

Manter no `/admin` (campo `whatsapp_br/us` em admin/links e coluna `whatsapp` em leads — é dado operacional do time, não CTA público). Manter `whatsapp` como campo coletado no formulário (continua sendo canal de retorno informado pelo lead).

Substituir CTAs secundários por "Enviar e-mail" (mailto) onde fizer sentido.

---

### 5. Fundo interativo global

Coberto pelo `ConstellationCanvas` acima (item 2, fundo global). Adicionalmente:
- Hero ganha parallax sutil já existente + camada nova de "ruído cinético" (grain animado em CSS, 60fps via `transform: translate3d`).
- Respeita `prefers-reduced-motion` e mobile.

---

### 6. Fix da /avaliacao

Sem repro do usuário, mas auditoria do código + sessão revela problemas prováveis:

- O header da `/avaliacao` tem botão de WhatsApp que será removido (item 4).
- `LeadFormProgressive` (499 linhas) será verificado para: avanço entre perguntas, validação, persistência de `leads_partial` e fallback quando `segmentId` é `undefined`. Vou rodar Playwright contra `localhost:8080/avaliacao` em build mode para reproduzir o fluxo completo (todas as perguntas até "Enviar para análise") e identificar o ponto de travamento.
- Garantir que `goToThanks` recebe `search` válido (hoje o cast `as never` pode estar disparando warning de tipo).
- Confirmar que o `originLabel` aparece quando há UTM mas não bloqueia render quando ausente.

Se o Playwright revelar bug específico (ex: pergunta X não avança, botão desabilitado), corrijo no mesmo passo. Se estiver "lento/visualmente confuso", refino UX: barra de progresso mais visível, foco automático no próximo campo, mensagens de erro inline.

---

## Ordem de execução

1. Instalar fontes + atualizar `styles.css` (item 1).
2. Criar componentes de motivos visuais (item 2) e `BlogStrip` (item 3).
3. Wire-in nos sections/hero da Home.
4. Remover WhatsApp do público (item 4).
5. Reproduzir `/avaliacao` com Playwright, corrigir bug encontrado (item 6).
6. Build + smoke test visual (screenshots desktop + mobile).

## Detalhes técnicos

- **Fontes**: `@fontsource/montserrat` (pesos 400/600/700/800) e `@fontsource-variable/inter` importados em `src/styles.css` no bloco superior de imports. Sem `<link>` Google Fonts.
- **SVGs**: inline (não asset CDN) — são pequenos (<5KB cada) e precisam responder a CSS vars de cor.
- **Canvas**: `requestAnimationFrame` com `IntersectionObserver` para pausar quando hero sai da tela; `useReducedMotion` desliga; `matchMedia("(max-width: 767px)")` força fallback.
- **Tipografia uppercase**: aplicada via `@utility display-1/2/3` e em `h1/h2`, não no body — preserva legibilidade de parágrafos.
- **Não mexer**: `dataStore`, `scoring.ts`, `abEngine.ts`, rotas `/admin/*`, sitemap, lógica de leads.

## O que NÃO está no escopo

- Refatoração de URL por dobra (já entregue em turno anterior).
- Mudanças em copywriting (só remoção de menções a WhatsApp em CTAs).
- Novos campos no formulário.
