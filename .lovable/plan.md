## Objetivo
Enriquecer o site com imagens reais (fotografia + ícones) que reforcem o tema EUA / imigração / família, sem quebrar a estética "Dossiê / Credencial" (ink, parchment, gold).

## Imagens a gerar (via imagegen, salvas em `src/assets/`)

1. **hero-skyline.jpg** — skyline NYC/DC ao amanhecer, tom sépia/dourado escuro, baixa saturação, overlay-ready (para Hero da Home).
2. **family-portrait.jpg** — família multigeracional em ambiente premium, luz natural quente, tom editorial (para dobra de "vida nos EUA" / EB-2 NIW).
3. **passport-documents.jpg** — passaporte brasileiro + documentos sobre mesa de madeira escura, top-down (para dobra de processo).
4. **us-map-engraving.png** (transparent) — mapa dos EUA estilo gravura/dossiê em gold sobre transparente (para backgrounds de seção).
5. **statue-liberty-silhouette.png** (transparent) — silhueta sutil em gold para acento.
6. **br-us-flags-crest.png** (transparent) — brasão combinando bandeiras BR+US estilo selo (para footer/credencial).

## Ícones de países
- Adicionar `<FlagBR />` e `<FlagUS />` como componentes SVG inline em `src/components/site/flags.tsx` (sem dependência externa).
- Usar nos badges de "Brasil → EUA", header de origem em LPs e cards.

## Onde aplicar

| Local | Imagem | Tratamento |
|---|---|---|
| Hero da Home | `hero-skyline.jpg` | Fundo com gradient overlay ink 80% → 100% |
| Dobra EB-2 NIW | `family-portrait.jpg` | Split 50/50 com texto, mask suave |
| Dobra "Processo" | `passport-documents.jpg` | Acento lateral, 40% opacity |
| Backgrounds de seção | `us-map-engraving.png` | Tile/posicionado, 8-12% opacity, parallax sutil |
| Footer / selos | `br-us-flags-crest.png` | Centralizado, pequeno |
| LPs por segmento | `family-portrait.jpg` ou variantes | Hero secundário |
| Página `/avaliacao` | `us-map-engraving.png` | Apenas como watermark muito leve (fundo continua sólido, conforme pedido anterior) |

## Performance
- Todas as fotos em `.jpg` com width ≤1600px; PNG transparentes apenas para gravuras/selos.
- `loading="lazy"` exceto no Hero (eager + fetchpriority="high").
- `prefers-reduced-motion`: desabilita parallax dos backdrops.

## Arquivos afetados
- Novos: 6 assets em `src/assets/`, `src/components/site/flags.tsx`, `src/components/site/ImageBackdrop.tsx`.
- Editados: `src/components/site/sections.tsx` (Hero, EB-2, Processo), `src/components/site/lp/LandingPageTemplate.tsx`, `src/components/site/Footer.tsx`, `src/routes/avaliacao.tsx` (watermark leve).

## Fora do escopo
- Não trocar a tipografia atual (Montserrat/Inter).
- Não alterar copy nem o formulário de avaliação.
- Não remover os backdrops SVG existentes (`BrUsRouteBackdrop`, `FamilySealBackdrop`, `ConstellationCanvas`) — as novas imagens convivem com eles.
