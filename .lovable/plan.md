## Objetivo

Aproximar a dobra "Brasil vs EUA" da referência do concorrente (screenshot 1): cards maiores em fundo escuro (ink), com **contorno do mapa do país** como watermark discreto atrás de cada card e **ícone circular da bandeira + badge de seta** no topo de cada coluna. Manter a identidade Dossiê (dourado, tipografia) — só mudar essa dobra, não o site inteiro.

## Comparação com hoje

Hoje (screenshot 2, minha versão): fundo `cream-light` claro, ícones de bandeira quadrados pequenos, sem mapa de fundo, bullets com dot dourado, hierarquia mais "editorial parchment".

Concorrente (screenshot 1): fundo escuro (ink), silhueta do mapa em stroke fino atrás do card, ícone redondo colorido da bandeira + pequeno badge circular com seta diagonal ao lado, bullets com check verde (EUA) / círculo vermelho (Brasil).

## Mudanças propostas

### 1. Superfície da dobra
- Trocar `section-cream-light` → `section-ink` **apenas nesta dobra** ("Brasil vs EUA / Duas realidades").
- Manter o filete tricolor BR-Gold-US no topo.

### 2. Mapas de fundo como watermark
- Criar `src/components/site/visuals/CountryMapOutline.tsx` com dois SVGs inline — silhueta simplificada do **Brasil** e dos **EUA continental** em stroke fino (`stroke-gold/12`, `fill-none`).
- Posicionar como `absolute` dentro de cada card, canto superior direito, `opacity-[0.10]`, `pointer-events-none`, escala grande (~120% da altura do card) para escapar levemente pela borda como no concorrente.

### 3. Ícones circulares de bandeira + badge de seta
- Criar componente `FlagCircleBadge` (dentro do próprio `DualFlagIcons.tsx` ou novo `FlagCircle.tsx`):
  - Círculo de 44px com a bandeira colorida (verde/amarelo/azul para BR, listras/canton para EUA) — reusar SVGs coloridos já existentes em `flags.tsx` (versão `color="brand"`), recortados em `clip-path: circle()`.
  - Ao lado (levemente sobreposto, canto inferior direito), um segundo círculo menor (~20px) com borda dourada e ícone `ArrowUpRight` (lucide) — sinaliza "movimento / travessia".
- Substitui os quadrados de bandeira atuais no cabeçalho de cada card.

### 4. Cards
- Fundo `bg-ink-deep/60` com `border border-gold/15`, radius mantido (`--radius`), padding generoso (~40px).
- Título do card em 2 linhas (`Realidade` / `no Brasil`) — display serif, foreground claro.
- Bullets:
  - Coluna Brasil: ícone `CircleDot` vermelho suave (`text-usa-red` já no token, ou um `rose-500` sutil) — mantém a semântica "dor".
  - Coluna EUA: ícone `CheckCircle2` verde (`text-brazil-green` invertido — pode ficar estranho semanticamente; usar `emerald-500`).
- Espaçamento entre bullets ~14px, texto `text-foreground/85`.

### 5. Kicker abaixo dos cards
- Manter a frase "Você não precisa abandonar sua história..." centralizada, `text-foreground/60`, itálico dourado no trecho de ênfase, como já existe.

## Arquivos tocados

- `src/components/site/visuals/CountryMapOutline.tsx` — **novo**, SVGs Brasil + EUA.
- `src/components/site/visuals/DualFlagIcons.tsx` — adicionar `FlagCircleBadge` (ou arquivo dedicado).
- `src/components/site/sections.tsx` — reescrever apenas a dobra "Brasil vs EUA": trocar surface, novo layout de card com mapa watermark + flag circle badge + bullets com ícones semânticos.
- `src/styles.css` — sem alteração de tokens (usa `--gold`, `--ink-deep`, `--usa-red`, `--brazil-green` já existentes).

## Fora de escopo

- Não mexer nas outras dobras (segmentos, comparativo salarial, benefícios) — ficam como estão.
- Não gerar imagens raster; mapas ficam em SVG inline (zero peso extra, escalam perfeitos).
- Não trocar tipografia nem paleta global.

## Validação

Ao final, print da dobra em desktop e mobile para comparar lado a lado com o concorrente. Se o watermark do mapa ficar muito forte ou fraco, ajusto só a `opacity`.

Posso seguir?