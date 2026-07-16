## Problema

No `/admin/conteudo`, os campos aparecem vazios (sem os textos atuais do site). Não é problema de gravação, é de **carregamento**: a função de load faz ~90 SELECTs sequenciais ao Postgres (um por chave), e o formulário fica em branco enquanto isso. Além disso, se uma chave já foi salva com valor `""` no banco (como aconteceu com `hero.videoHidden`, `hero.videoUrl`, `hero.posterUrl`), o operador `??` mantém a string vazia em vez de cair no default do código — reforçando a sensação de "sem informação".

## Correção

**`src/routes/admin.conteudo.tsx` — função `ContentPage` (useEffect de load):**

1. Trocar o `for` sequencial por **uma única chamada** `list("site_content")` (já existe em `dataStore.ts` e traz todas as linhas em um SELECT).
2. Montar um mapa `{record_id → value}` a partir do retorno.
3. Para cada chave de `defaultContent`, usar:
   - `dbMap[k].value` quando existir E for **não-vazio**
   - `defaultContent[k]` caso contrário
   
   (isso resolve o caso de valor `""` gravado antigamente — comportamento consistente com o `useContent` público, que já ignora string vazia).

Resultado: o formulário carrega instantaneamente com os textos atuais, o operador pode revisar/editar, e "Salvar tudo" continua funcionando normalmente.

## Escopo

- Só `src/routes/admin.conteudo.tsx` é alterado.
- Nenhuma mudança em `siteContent.ts`, `dataStore.ts`, componentes do site público, ou dados existentes no banco.
- Sem migrations.