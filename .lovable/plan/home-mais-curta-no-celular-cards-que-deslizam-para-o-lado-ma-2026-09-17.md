# Home mais curta no celular: cards que deslizam para o lado + mais botões

## O que muda

1. **Cards em trilha deslizante (swipe lateral) no celular**
   Nas seções com muitos cards, em vez de empilhar tudo verticalmente, os cards ficam
   lado a lado numa faixa que o dedo arrasta, com o card seguinte "espiando" na borda
   direita (efeito Apple: encaixe suave em cada card, sem botões de seta).
   No desktop nada muda — continua a grade atual.

   Seções que passam a deslizar no celular:
   - Vistos (EB-1 / EB-2 NIW / O-1)
   - Perfis atendidos
   - As 4 etapas do processo
   - Depoimentos
   - Credenciais e parceiros
   - Blog em destaque

   Ganho estimado de altura no celular: cada seção dessas passa de 3–4 alturas de card
   para 1, encurtando bem a página.

```text
   [ card 1        ][ card 2   >
   ●  ○  ○  ○      (indicador de posição)
```

2. **Mais botões de ação entre as dobras**
   Hoje o botão principal aparece só em poucas dobras. Passa a existir um botão de
   ação discreto no fim de cada dobra de conteúdo (Vistos, Processo, Por que a Status,
   Renda em dólar, Depoimentos, Dúvidas), alternando entre "Iniciar análise" e
   "Falar no WhatsApp", sem repetir o mesmo texto duas vezes seguidas.
   Nada de botão flutuante central — só o WhatsApp no canto, como está hoje.

3. **Menos altura em blocos longos**
   - Textos de apoio longos no celular ganham "ler mais" onde passam de ~4 linhas
     (Legado, Por que a Status, Contraste Brasil/EUA).
   - Espaçamento vertical entre seções levemente reduzido no celular.
   - Dúvidas frequentes: todas fechadas por padrão no celular.

## O que não muda

Textos, ordem das seções, links, formulários, rastreamento, avisos legais e o painel
administrativo permanecem exatamente como estão.

## Detalhes técnicos

- Novo componente `src/components/site/CardRail.tsx`: wrapper com
  `flex snap-x snap-mandatory overflow-x-auto` + `basis-[86%] shrink-0 snap-center`
  nos filhos no breakpoint mobile, `md:grid` restaurando as colunas atuais;
  `scrollbar-width: none`, `overscroll-behavior-x: contain`, indicadores de posição
  via `IntersectionObserver` (sem dependência nova — embla fica de reserva se
  precisarmos de dots controlados).
- Utilitário `.card-rail` / `.card-rail-item` em `src/styles.css` para reuso nas
  páginas de visto e LPs depois.
- `sections.tsx`: `VisaCards`, `PersonaCards`, `ProcessSteps`, `Testimonials`,
  `PartnersBadges` e `BlogStrip.tsx` trocam a `div.grid` pelo `CardRail`
  mantendo as classes de card atuais (`auto-rows-fr` cai no mobile).
- CTAs: novo `SectionCta` (variação do botão dourado existente, `btn-label`)
  reaproveitando os hrefs de `useAvaliacaoHref` e o número do WhatsApp já
  configurado.
- Clamp de texto: utilitário `.clamp-mobile` + botão "ler mais" local por seção.
- Respeita `prefers-reduced-motion` (sem scroll suave animado).
- Validação com Playwright a 360/393px: altura total da home antes/depois, ausência
  de overflow horizontal na página (a rolagem fica contida nas trilhas).
