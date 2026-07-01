## Diagnóstico rápido

O comportamento “magnético” e descentralizado parece vir principalmente de três pontos:

1. A Home atualiza o hash da URL e o título conforme cada dobra entra na viewport; isso cria trabalho extra durante o scroll e pode dar sensação de puxão.
2. Há `scroll-behavior: smooth` global e scroll programático para hashes, então links/âncoras podem animar a página inteira em vez de apenas navegar naturalmente.
3. A Home ainda usa animações de texto/hero com Motion, canvas fixo e SVG animado, além de reveal em todas as dobras; juntos, isso pesa no scroll.

## Plano de correção

1. **Remover o efeito “magnético” da Home**
   - Desativar a sincronização automática de hash durante scroll na Home.
   - Manter os IDs das dobras para SEO/AEO e links diretos, mas sem ficar reescrevendo a URL a cada rolagem.
   - Evitar scroll programático automático no carregamento, exceto quando o usuário abrir uma URL com hash explícito.

2. **Deixar o scroll mais natural**
   - Trocar o `scroll-behavior: smooth` global por comportamento automático.
   - Aplicar smooth scroll apenas em cliques intencionais de âncora, respeitando `prefers-reduced-motion`.
   - Ajustar `scroll-margin-top` para centralizar melhor o início das dobras abaixo do header.

3. **Reduzir animações de texto**
   - Remover animação linha-a-linha do H1 e fades sequenciais no Hero.
   - Manter a Hero estática/premium, com no máximo uma entrada simples de opacidade via CSS.
   - Remover Motion do Hero onde for apenas decoração.

4. **Simplificar reveals das dobras**
   - Manter reveal apenas uma vez, mas ainda mais leve: menos deslocamento, menor duração e sem `will-change` persistente.
   - Em mobile, praticamente desativar movimento de texto e manter só opacidade curta ou estado estático.

5. **Desligar fundos animados pesados na Home**
   - Remover o `ConstellationCanvas` global da Home ou deixá-lo estático/desativado.
   - Parar a animação contínua da rota BR→EUA no SVG; manter o desenho como fundo estático.
   - Remover/evitar `backdrop-blur` em header/dropdowns públicos durante scroll, substituindo por fundo sólido translúcido.

6. **Validar visualmente a fluidez**
   - Testar a Home em desktop e mobile com Playwright.
   - Conferir se as dobras param no lugar correto, sem puxões, sem desalinhamento de conteúdo e sem animações excessivas.

## Resultado esperado

A Home deve rolar como uma página institucional normal: fluida, sem “snap”/puxões, sem troca constante de URL durante o scroll e com animações discretas o suficiente para preservar performance.