## Objetivo

Adaptar a dobra **"Blog em destaque"** (`BlogStrip.tsx`) para mobile: trocar o grid empilhado de 3 cards altos por um **carrossel horizontal com snap**, e mostrar a **foto de capa** do post no topo de cada card (mobile e desktop). Desktop continua em grid 3 colunas.

## Mudanças

**1. Card passa a incluir capa**
- Adicionar `capa: string` ao tipo interno `Card` em `BlogStrip.tsx`.
- Mapear `p.capa` dos posts reais (já existe em `BlogPost`).
- Placeholders ganham 3 capas distintas (usar imagens já existentes em `src/assets/` — NYC skyline, família brasileira, passaporte — sem gerar nada novo).

**2. Layout responsivo do trilho de cards**

Substituir `mt-10 grid md:grid-cols-3 gap-5` por:

```text
mobile  → flex overflow-x-auto snap-x snap-mandatory
          cards: w-[78vw] max-w-[320px] shrink-0 snap-start
          padding lateral compensando container-x para "espiar" o próximo
desktop → md:grid md:grid-cols-3 md:overflow-visible md:w-auto
```

- Esconder scrollbar (`scrollbar-width:none` + `::-webkit-scrollbar{display:none}` via utility já presente ou inline `[&::-webkit-scrollbar]:hidden`).
- Manter a mesma borda gold, `gold-tick`, hover e tipografia.

**3. Estrutura do card com capa**

```text
<article/Link>
  ├─ <img capa>   aspect-[16/10] object-cover (loading="lazy" exceto se quisermos eager no primeiro)
  ├─ overlay sutil gradient-to-t from-ink-deep/80 para legibilidade
  └─ bloco de texto atual (categoria, título, resumo, tempo, "Ler")
</article>
```

Ajustes finos:
- Padding do bloco textual: `p-6` (era `p-7`) para acomodar a imagem.
- `resumo` com `line-clamp-2` no mobile, `md:line-clamp-3` no desktop, para o card ficar mais compacto no carrossel.

**4. Indicador de carrossel (mobile only)**
- Linha discreta abaixo: `<div className="md:hidden mt-4 flex justify-center gap-1.5">` com 3 pontinhos estáticos `bg-gold/30` — apenas affordance visual, sem JS de tracking (mantém leve). Opcional; se quiser zero JS extra, omito.

## Restrições

- Não tocar em `vistos`, hero, ou outras dobras.
- Não alterar a lógica de `listPublishedPosts` nem o tipo `BlogPost`.
- Desktop (md+) deve continuar **idêntico** visualmente, exceto pela adição da imagem de capa no topo do card.
- Sem libs novas (sem embla/swiper) — usar CSS scroll-snap nativo.
- Respeitar `prefers-reduced-motion` (scroll-snap nativo já obedece).

## Arquivos afetados

- `src/components/site/BlogStrip.tsx` (único arquivo editado).

## Confirmação

Posso prosseguir? Caso prefira que eu **omita os pontinhos indicadores** ou use uma lib de carrossel (Embla) em vez de scroll-snap CSS, me avise antes de implementar.
