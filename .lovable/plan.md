## Objetivo
Remover o card/menção do **Visto EB-3** da Home e substituir pelo **Visto O-1** em todos os pontos onde ainda aparece como um dos vistos em destaque da LP.

## Escopo

1. **Home — dobra de vistos (03) e demais menções**
   - Substituir o card "Visto EB-3 — Exige patrocinador" por "Visto O-1 — Habilidade extraordinária".
   - Ajustar descrição curta para O-1 (base legal: 8 CFR 214.2(o)(3), foco em habilidade extraordinária em ciências, artes, educação, negócios ou esportes, com evidências reconhecidas).
   - Atualizar link do card para `/vistos/o1`.

2. **Tabela comparativa / seções institucionais da Home**
   - Onde EB-3 aparecer como coluna/linha ao lado de EB-1 e EB-2 NIW, trocar por O-1.
   - Manter EB-1, EB-2 NIW e O-1 como o trio destacado (alinhado ao reposicionamento anterior).

3. **Textos auxiliares**
   - Qualquer copy da Home que cite "EB-3" como exemplo (ex.: "processos como EB-1, EB-2 NIW e EB-3") passa a citar O-1.
   - `src/lib/siteContent.ts` e `src/lib/visaPages.ts` revisados apenas nos trechos referenciados pela Home.

## Fora de escopo
- **A página `/vistos/eb3` continua no ar** (conforme decisão anterior). Só removemos a exposição dela na Home.
- Não alteramos blog, FAQ, /criterios, /pre-qualificacao, footer, sitemap dinâmico.
- Nenhuma mudança de design system, backend ou tracking.

## Arquivos previstos
- `src/components/site/sections.tsx` — card EB-3 → O-1 na dobra 03 e em qualquer trio de vistos.
- `src/lib/siteContent.ts` — textos padrão do card/menções.
- `src/lib/visaPages.ts` — apenas se a Home ler dali o resumo do card.

## Verificação
- Build passa.
- Home no desktop e mobile mostra EB-1 → EB-2 NIW → O-1 na dobra de vistos, sem menção a EB-3.
- Link do card O-1 abre `/vistos/o1`.
