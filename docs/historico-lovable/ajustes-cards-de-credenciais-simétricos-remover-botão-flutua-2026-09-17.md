# Ajustes: cards de credenciais simétricos + remover botão flutuante central

## 1. Botão flutuante central "Iniciar triagem"

Remover completamente o botão dourado que aparece fixo no centro da parte de baixo da tela ao rolar. Ele está encostando no botão verde do WhatsApp e cobrindo o texto das seções no celular.

- Deixa de aparecer em todas as páginas (não apenas no celular).
- O botão do WhatsApp no canto continua igual.
- Os botões de chamada dentro das seções (dobras) continuam intactos, então nenhum caminho de conversão é perdido.

## 2. Cards de "Credenciais e parceiros"

Hoje os quatro cards têm alturas diferentes: o card do BBB tem um texto explicativo extra e os demais ficam menores, quebrando o alinhamento.

Ajustes:
- Todos os cards da mesma linha passam a ter altura idêntica.
- Conteúdo centralizado vertical e horizontalmente em todos eles.
- Selos (escudo, Google, bandeiras) com o mesmo tamanho em todos os cards.
- Título e número de registro com o mesmo espaçamento; o texto explicativo do BBB deixa de esticar o card.
- Números longos (CNPJ, EIN) continuam legíveis, com fonte levemente menor no celular para não quebrar no meio.

## Detalhes técnicos

- `src/routes/__root.tsx`: remover o render de `<StickyCta />` e o import; excluir `src/components/site/StickyCta.tsx`.
- `src/components/site/sections.tsx` (`PartnersBadges`): grid com `auto-rows-fr` e `items-stretch`, `<li>` com `h-full` e conteúdo em coluna centralizada (`justify-center`); padronizar `PatchIcon` (tamanho fixo, `shrink-0`) e tipografia dos rótulos/descrição; reduzir o rótulo para `text-[11px]` no mobile.
- Nenhuma mudança de texto, rota, formulário, tracking ou regra legal.
- Validação: build + Playwright a 360/393/320 px confirmando alturas iguais dos cards e ausência do botão central.
