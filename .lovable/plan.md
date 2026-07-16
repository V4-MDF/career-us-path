Objetivo: aumentar a conversão da home adicionando botões de chamada às dobras principais e transformando o CTA central (hero e dobra final) em um botão de alto contraste.

Escopo aprovado:
- Dobras principais que recebem CTA: Vistos (03), Processo EB-2 NIW (05), Renda em Dólar (08), Depoimentos (09) e FAQ (10).
- Botão central: CTA primário da hero e CTA primário da dobra final de fechamento.

Alterações propostas:

1. Novo estilo de botão de alto impacto
- Criar uma variante de botão `cta` (ou classe `btn-cta`) no design system: fundo gold (`--gold`), texto ink (`--ink-deep`), borda sutil e shadow/dimensão elevada.
- Garantir que funcione nas seções escuras (hero, CTA final, NIW, perfis) e respeite o hover state.
- Aplicar essa variante ao botão principal do hero e ao botão principal da dobra final, substituindo o estilo primário atual mais apagado.

2. CTAs adicionais nas dobras principais
- Vistos (03): adicionar CTA textual ou botão após a grade de cards, levando para `/avaliacao` com src `home_vistos`.
- Processo EB-2 NIW (05): botão abaixo das 4 etapas, com src `home_processo`.
- Renda em Dólar (08): botão abaixo da tabela/cards, com src `home_salarios`.
- Depoimentos (09): botão abaixo dos vídeos, com src `home_depoimentos`.
- FAQ (10): botão ao final do acordeão, com src `home_faq`.
- Todos os CTAs usam `avaliacaoHref` / `useAvaliacaoHref` para preservar UTMs e segmentação.

3. Ajustes de responsividade
- Botões em mobile devem ocupar largura total (`w-full`) e ter altura confortável (h-12/h-14).
- Manter alinhamento e espaçamento consistentes com o grid existente.

4. Verificação
- Rodar build/typecheck para garantir que não haja imports quebrados ou classes inválidas.
- Validar visualmente no preview desktop e mobile.

Sem alterações de backend: mudanças restritas aos componentes de apresentação da home (`src/components/site/sections.tsx`, `src/components/ui/button.tsx` e `src/styles.css`).