## Diagnóstico

Errei o balanço cromático. Empilhei elementos que competem entre si:
- fundo `ink` escuro (Dossiê)
- bandeiras coloridas realistas (verde/amarelo/azul/vermelho)
- badge dourado com seta
- mapa dourado watermark
- checks verde `emerald-400` (hue que não existe no design system)
- bullets vermelho `usa-red`

Resultado: 5 famílias de cor disputando atenção na mesma dobra. Isso quebra a identidade "Dossiê / Credencial", que vive de **uma cor de acento por dobra** (o dourado) sobre superfície neutra.

## Princípio UX que vou aplicar

**Uma cor identifica cada lado. Nada mais.**

Cada card fica monocromático-tonal: escolhe UM hue do design system (`--brazil-green` para BR, `--usa-blue` para US) e usa ele em **todas as camadas** — mapa, círculo da bandeira, marcador de bullet, borda superior. O ouro fica reservado para a hierarquia editorial (eyebrow, número, filete tricolor), como no resto do site. O contraste entre os dois cards passa a ser **verde vs azul**, não "arco-íris vs arco-íris".

## Direção visual

### Superfície
- Volta para `section-cream-light` (fundo parchment claro). Motivo UX: a mensagem é "duas realidades lado a lado, você decide" — informação analítica, não emocional. Superfície clara aumenta legibilidade e reduz peso visual. O ink escuro fica reservado para dobras de autoridade/CTA.
- Mantém o filete tricolor no topo da dobra como assinatura de transição.

### Cards
- Fundo branco puro, `border border-ink-text/10`, `border-t-2` na cor do país (verde-brasil no card BR, azul-usa no card US). Radius grande, shadow suave — mesmo padrão dos cards de segmento.
- Padding generoso e uniforme (40px desktop, 28px mobile).

### Mapa como watermark
- Silhueta do país em stroke fino, `opacity ~0.08`, na **cor do lado** (verde no card BR, azul no card US), canto superior direito, escapando pela borda.
- Substitui o dourado atual — o mapa passa a reforçar o hue do card em vez de introduzir um terceiro tom.

### Ícone de identificação do país
- **Corte o círculo da bandeira colorida + badge de seta.** Ele é o principal ruído: introduz 4 cores realistas por lado.
- Troca por um **glifo monocromático simples**: um pequeno chip retangular com o contorno da bandeira em `currentColor` (versão `mono` que já existe em `flags.tsx`), da cor do país. Discreto, tipo selo de dossiê. Sem badge de seta.
- Alternativa se você preferir manter um elemento circular: círculo vazado com apenas as iniciais **BR** / **US** em `font-mono-label`, borda na cor do país. Mais "credencial", menos "app de viagem".

### Título do card
- Duas linhas, display serif, `text-ink-text`: "Realidade / no Brasil" e "Oportunidades / nos EUA". Mantém o estilo do concorrente sem herdar as cores dele.

### Bullets
- **Sem check verde emerald.** Marcador único: um pequeno traço horizontal (`h-px w-3`) na cor do país, alinhado à linha do texto — mesma linguagem gráfica do filete dourado que já usamos em SectionHead. Legível, silencioso, editorial.
- Texto `text-ink-text/85`, espaçamento 14px.

### Kicker abaixo
- Frase-âncora centralizada, itálico dourado no trecho de ênfase — como já estava. Só ajusto tamanho para não competir com os cards.

## Paleta final da dobra (auditada)

Só estas cores aparecem:
1. `--cream-light` (fundo)
2. `--brazil-green` (tudo do card BR)
3. `--usa-blue` (tudo do card US)
4. `--gold` (eyebrow, número, filete tricolor, itálico do kicker)
5. `--ink-text` (tipografia)

Zero verde emerald, zero vermelho, zero bandeira colorida. WCAG AA validado em cada par.

## Arquivos tocados

- `src/components/site/sections.tsx` — reescrever a dobra `ContrastSection` seguindo o novo esquema.
- `src/components/site/visuals/CountryMapOutline.tsx` — mantém (já é monocromático via `currentColor`, só muda a cor aplicada no consumidor).
- `src/components/site/visuals/FlagCircleBadge.tsx` — **fica não utilizado**. Deleto se você confirmar que não quer resgatar em outra dobra.

## Fora de escopo

Não mexo em nenhuma outra dobra nesta rodada. Depois que essa ficar coerente, revisamos as vizinhas (Renda em Dólar em `section-sky`, Legado em verde-brasil) com o mesmo critério — uma cor por dobra, sem sobreposição.

## Validação

Print da dobra desktop + mobile depois da mudança para você comparar. Se o azul/verde ficarem pesados na sua tela, ajusto só a opacidade do border-top e do mapa watermark, sem mexer no resto.

Posso seguir?