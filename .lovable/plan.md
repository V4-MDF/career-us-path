## Diagnóstico

O logo hoje é servido por um único asset compartilhado: `src/assets/logo-status-na-america.png.asset.json`. Ele é o "monograma stacked" (STATUS grande + NA AMÉRICA em dourado + selo azul), diferente da versão horizontal enviada por você ("S" dourado em box + "Status. na América" em wordmark).

Usos no código (todos apontam para o mesmo asset, então trocar o asset resolve os três):

- `src/components/site/Header.tsx` — header fixo do site inteiro
- `src/routes/auth.tsx` — tela de login do admin
- `src/routes/avaliacao.index.tsx` — página `/avaliacao`

Não há outros `<img>` de logo espalhados. Favicon (`public/favicon.png`) e `og-image` são arquivos separados.

## Plano

1. **Novo asset do logo** — usar a imagem que você anexou (S em box dourado + "Status. na América" em wordmark) e subir via `lovable-assets` como o novo `logo-status-na-america.png`, sobrescrevendo o pointer `src/assets/logo-status-na-america.png.asset.json`.
   - Como o pointer é imutável (UUID único), o passo real é: gerar um novo pointer e reescrever o JSON, além de deletar o asset antigo do CDN.
2. **Ajustar dimensões do `<img>`** onde o wordmark horizontal exige proporção diferente da stacked:
   - `Header.tsx`: `h-8 md:h-10` (era `h-12 md:h-14`) — o wordmark horizontal fica desproporcional na altura atual.
   - `avaliacao.index.tsx`: mesma redução proporcional no topo do formulário.
   - `auth.tsx`: mesma redução.
3. **Favicon e og:image** — manter como estão (não fazem parte do escopo "logo do site"). Se você quiser, posso trocar o favicon para o "S" em box num passo seguinte.

## Ponto a confirmar

A imagem anexada no chat é uma captura de tela pequena e escura, não um arquivo de logo em alta resolução. Antes de subir, preciso saber:

- **Você tem o arquivo do logo horizontal em alta resolução (PNG/SVG com fundo transparente)?** O ideal é subir esse arquivo — usar o screenshot direto vai deixar o logo serrilhado e com fundo preto sólido em vez de transparente, e o problema se repete.
- Se não tiver o arquivo original, eu posso gerar uma versão vetorial/limpa a partir do screenshot (S dourado em box com borda + wordmark "Status. na América" sobre transparente), mas será uma reconstrução, não o arquivo oficial.

Me diga qual caminho: **(a) enviar o arquivo original em alta resolução** ou **(b) reconstruir a partir do screenshot**. Aí executo a troca em um passo só.
