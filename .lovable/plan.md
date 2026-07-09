## Objetivo
Sair do monocromático "ink + gold" e trazer dualidade cromática **Brasil ↔ EUA** ao site, com dobras em contraste, ícones/símbolos dos dois países e novas imagens de fundo. Sem quebrar a identidade "Dossiê" — o dourado continua como fio condutor, mas ganha companhia de **verde-brasil**, **azul-americano** e **off-white/parchment claro**.

---

## 1. Ampliar a paleta (design tokens em `src/styles.css`)

Adicionar tokens semânticos novos, mantendo os atuais:

- `--brazil-green` (#0E5C3A — verde bandeira dessaturado, "dossiê")
- `--brazil-yellow` (#E6B84A — puxa pro ouro atual, evita clash)
- `--usa-blue` (#0B2A5B — navy americano profundo)
- `--usa-red` (#8A1F2B — oxblood levemente mais vermelho, uso raro tipo "lacre")
- `--cream-light` (#F7F2E6 — parchment mais claro para dobras "arejadas")
- `--sky-soft` (#DCE6F0 — azul-céu esbranquiçado para respiro)

Gradientes prontos:
- `--gradient-br-us`: verde → dourado → azul (usado em filetes divisores e barras finas)
- `--gradient-parchment-sky`: parchment → sky-soft (dobras claras "americanas")

## 2. Novas variantes de dobra (surfaces em contraste)

Hoje só temos `ink`, `ink-deep`, `parchment`. Adicionar:

- `section-cream-light` — parchment mais claro, para "respirar" entre duas dobras escuras.
- `section-sky` — fundo azul-suave com filete azul-americano (usado em dobras que falam do lado EUA: benefícios, futuro dos filhos, comparativo salarial).
- `section-verde-brasil` — fundo verde-dossiê escuro com dourado (dobras que falam do lado BR: quem é você hoje, decisão, segmentos).

Regra de ritmo: alternar **BR-escuro → cream-light → sky → ink → parchment**, criando o efeito visual de "travessia" a cada dobra.

## 3. Ícones e símbolos dos dois países

Criar `src/components/site/visuals/DualFlagIcons.tsx` com SVGs inline (não bitmaps) reutilizáveis:

- Bandeira BR estilizada (losango + círculo, monocromática dourada ou verde)
- Bandeira US estilizada (listras + estrelas simplificadas, monocromática dourada ou azul)
- Ícone "ponte BR→US" (silhueta continentes conectados por linha dourada)
- Águia americana (silhueta linha fina, motif-soft)
- Cristo Redentor (silhueta linha fina, motif-soft)
- Estátua da Liberdade (silhueta linha fina, motif-soft)

Uso: como watermark discreto no canto das dobras, no eyebrow das seções ("• BRASIL HOJE" com bandeirinha BR à esquerda, "• EUA AMANHÃ" com bandeirinha US), e como ícones grandes decorativos em cards.

## 4. Novas imagens de fundo

Gerar 4-5 novas imagens (via imagegen, premium onde precisa) e subir via lovable-assets:

- **Hero alternativo** — skyline NY + silhueta Rio ao fundo com transição dourada no meio (para variar do backdrop atual)
- **Seção "Quem é você hoje"** — textura de mapa antigo do Brasil, tons parchment + verde
- **Seção "O que muda"** — mapa antigo dos EUA, tons parchment + azul-navy
- **Seção Comparativo salarial** — fundo split (metade parchment quente / metade sky-soft) com marcas d'água de moedas BRL/USD
- **Seção Pré-qualificação** — passaporte aberto estilizado, dourado + azul-americano
- **Backdrop /avaliacao** — atualmente escuro; adicionar overlay com silhuetas dos dois países

## 5. Componentes que ficam mais coloridos

- **Cards de segmento** (`segments.ts` render): borda superior colorida por segmento (empresário=verde, médico=azul, engenheiro=dourado, artista=oxblood suave).
- **Faixa de credenciais / partners badges**: filete tricolor BR-gold-US em cima.
- **Ícones de processo** (`ProcessIconStrip.tsx`): cada etapa recebe uma cor (verde → dourado → azul), sinalizando a "jornada".
- **Botões CTA secundários**: variante `outline-brazil` (borda verde) e `outline-usa` (borda azul) para diferenciação em dobras claras.
- **Timeline / passos numerados**: números grandes em cores alternadas verde/azul, mantendo dourado só nos ativos.

## 6. Dobras específicas com nova identidade cromática

Aplicação prática nas dobras da Home (segundo `pageStructure`):

1. Hero — mantém ink + nova imagem de skyline dual
2. Segmentos — `section-cream-light` (era parchment): cards com bordas coloridas
3. Comparativo salarial — `section-sky` (novo): split BR/US visual
4. Benefícios / Futuro dos filhos — `section-verde-brasil` (novo): dourado sobre verde
5. Depoimentos — `section-ink` mantém, mas cards com filete tricolor
6. Casos de sucesso — `section-parchment` (mantém)
7. Pré-qualificação — `section-sky` com passaporte de fundo
8. Blog — mantém, thumbs com borda dourada
9. FAQ — `section-cream-light`
10. CTA final — `section-ink-deep` com gradiente BR→US no filete

## 7. Coerência de acessibilidade

Cada nova cor de fundo passa por checagem WCAG AA:
- Verde brasil escuro (#0E5C3A) + parchment foreground → ~9:1 ✅
- Sky soft (#DCE6F0) + ink-text foreground → ~11:1 ✅
- Cream light (#F7F2E6) + ink-text → ~14:1 ✅
- Nunca usar amarelo-brasil como texto sobre branco (falha AA); só como accent/borda.

## 8. Painel admin — controle de tema

Adicionar em `/admin/conteudo` um bloco "Paleta expandida" com toggle por dobra: escolher entre `ink`, `parchment`, `cream-light`, `sky`, `verde-brasil`, `ink-deep`. Assim você experimenta combinações sem depender de código.

---

## Arquivos que serão tocados

- `src/styles.css` — tokens, novas variantes de section, gradientes, filetes tricolor
- `src/components/site/visuals/DualFlagIcons.tsx` — novo (SVGs BR/US)
- `src/components/site/visuals/CountryBackdrop.tsx` — novo (backdrop dual)
- `src/components/site/sections.tsx` — aplicar variantes por dobra, filetes coloridos
- `src/components/site/ProcessIconStrip.tsx` — cores alternadas
- `src/components/site/PartnersBadges.tsx` — filete tricolor
- `src/lib/segments.ts` — cor por segmento
- `src/assets/*.jpg.asset.json` — 4-5 novos backgrounds
- `src/routes/avaliacao.index.tsx` — novo backdrop
- `src/routes/pre-qualificacao.tsx` — fundo passaporte
- `src/routes/admin.conteudo.tsx` — controle de paleta por dobra
- `src/lib/pageStructure.ts` — campo `surface` por seção

---

## Fora de escopo (deixar para depois se você quiser)

- Modo claro completo (light mode global) — hoje o site é dark-first e isso seria refactor grande
- Ilustrações vetoriais custom desenhadas à mão (usaria bibliotecas/geração)
- Reescrever a Home visualmente em outra estrutura — mantemos as 14 dobras

---

## Como quero validar

Antes de fechar, prints das principais dobras (Home, /avaliacao, /pre-qualificacao, /vistos/eb2-niw) para você comparar antes/depois. Se alguma cor pesar demais, ajustamos saturação sem refazer.

Posso seguir?