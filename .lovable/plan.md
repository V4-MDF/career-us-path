## O que está acontecendo

Confirmado no código: `useContent()` (em `src/lib/siteContent.ts`) inicia sempre com o valor **padrão** da chave e só depois busca o valor real no banco, de forma assíncrona e **uma requisição por chave**.

Como o padrão de `hero.videoHidden` / `institutional.videoHidden` / `visa.<slug>.heroVideoHidden` é "vazio" (= visível), na primeira renderização o site sempre desenha a moldura do vídeo e só a remove quando a resposta do banco chega — daí o quadro aparecer por alguns segundos e sumir.

O mesmo padrão também gera dezenas de requisições paralelas ao abrir a Home (uma por texto editável), o que agrava o atraso.

## O que vou fazer

1. **Carregar o conteúdo do site em um único bloco**
   Criar um cache compartilhado em `src/lib/siteContent.ts` que busca todos os registros de `site_content` de uma vez (em vez de uma chamada por chave) e serve todas as leituras a partir dele.

2. **Hidratar instantaneamente a partir do cache local**
   O conteúdo já carregado fica guardado no navegador; em visitas seguintes o valor correto (oculto/visível) fica disponível já na primeira renderização, sem piscar.

3. **Não renderizar o slot de vídeo enquanto a configuração não for conhecida**
   Expor um indicador de "conteúdo pronto". Nos três pontos que exibem vídeo — hero da Home, dobra institucional e hero das páginas de visto — a moldura só é montada depois que a configuração é conhecida. Ou seja, na dúvida o vídeo **não** aparece (comportamento oposto ao atual). Como o vídeo não é conteúdo indexável, isso não afeta SEO nem o restante do layout.

4. **Verificação**
   Abrir a Home e uma página de visto com o vídeo marcado como oculto no admin e confirmar, via navegador automatizado, que nenhuma moldura de vídeo aparece em nenhum momento do carregamento — e que, com o vídeo ativo, ele continua aparecendo normalmente.

## Detalhes técnicos

- `useContent(key)` passa a ler de um store único (`list("site_content")` + cache do `dataStore`), mantendo a mesma assinatura para não alterar os ~100 pontos de uso.
- Novo `useContentReady()` (ou retorno `{ value, ready }` interno) usado apenas pelos blocos de vídeo em `src/components/site/sections.tsx` (`Hero`, `InstitutionalVideo`) e `src/components/site/visa/VisaPageBody.tsx`.
- A leitura do cache local acontece após a hidratação (não durante o render SSR) para evitar divergência de hidratação; o slot só monta quando `ready === true`.
- Nenhuma mudança de schema, de política do banco ou do painel admin.
