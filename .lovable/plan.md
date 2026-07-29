## Contexto
A dobra 07 da home (`LegacySection` — "Muito mais que um visto. Um legado.") usa 5 cards de benefícios. Os textos de descrição dos cards `Green Card Direto` e `Segurança Familiar` são longos e estão quebrando a proporção visual na grade, especialmente no desktop. Os cards também usam padding e ícones relativamente grandes, o que faz a dobra parecer desproporcional.

## Objetivo
Reduzir os textos e as proporções dos cards para deixá-los mais uniformes, compactos e visualmente equilibrados na dobra, sem perder a informação jurídica essencial.

## Alterações propostas

### 1. Reduzir textos dos cards de benefícios
- **Green Card Direto**: resumir a frase longa. Manter a ideia de residência permanente e a possibilidade de naturalização após 5 anos, mas em uma linha mais curta.
- **Segurança Familiar**: resumir o texto sobre CSPA e trabalho do cônjuge. Manter as referências legais, mas de forma mais concisa.
- **Previsibilidade / Independência Profissional / Futuro dos Filhos**: ajustar pequenos excessos de texto para manter consistência.

### 2. Reduzir proporções visuais dos cards
- Diminuir o padding interno dos cards (`p-7` → `p-5` no desktop, ajustar no mobile).
- Diminuir o tamanho do ícone dos cards (`h-6 w-6` → `h-5 w-5`).
- Diminuir o espaçamento entre título e descrição (`mt-5` / `mt-3` → valores menores).
- Reduzir levemente o tamanho da descrição (`text-[15px]` → `text-[14px]`) para melhorar a densidade.
- Manter a altura uniforme quando em grid, mas permitir que o card respire melhor.

### 3. Ajustar a grade desktop
Avaliar se `xl:grid-cols-5` ainda funciona bem com textos menores. Se necessário, manter 5 colunas em xl, mas garantir que o card não fique esticado verticalmente por causa de um texto muito longo.

### 4. Manter acessibilidade
- Os textos reduzidos devem continuar claros para leitores de tela.
- Não remover informações de compliance (CSPA, 5 anos, requisitos do USCIS) — apenas condensar.

## Arquivos alterados
- `src/components/site/sections.tsx` — `LegacySection` (cards e grid de benefícios).
- Opcionalmente `src/styles.css` se for criar um utilitário de altura uniforme, mas a mudança deve ser feita com classes Tailwind existentes.

## Validação
- Build (`vite build` ou `bun run build`) sem erros.
- Verificar visualmente no preview mobile e desktop que os cards ficaram menores, alinhados e sem textos quebrados estranhamente.
- Confirmar que nenhum texto de compliance foi perdido.
