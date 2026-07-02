## Causa raiz

Em TanStack file-based routing com notação por ponto, `src/routes/avaliacao.tsx` vira **layout pai** de qualquer arquivo `avaliacao.*.tsx` (obrigado, obrigado-qualificado, obrigado-nao-qualificado). Como `avaliacao.tsx` renderiza o formulário completo e **não tem `<Outlet/>`**, ao navegar para `/avaliacao/obrigado` o router monta o pai (formulário) e a rota filha (redirect / página de obrigado) nunca aparece.

Sintoma exato: submeter o form navega para `/avaliacao/obrigado-qualificado`, o URL muda, mas a tela continua mostrando o formulário — porque o pai `avaliacao.tsx` está sempre montado nesse subtree.

## Correção

Converter `avaliacao.tsx` em **rota leaf** renomeando para `avaliacao.index.tsx`. Assim:

- `avaliacao.index.tsx` → `/avaliacao` (leaf, isolada)
- `avaliacao.obrigado-qualificado.tsx` → `/avaliacao/obrigado-qualificado` (leaf, isolada)
- `avaliacao.obrigado-nao-qualificado.tsx` → `/avaliacao/obrigado-nao-qualificado` (leaf, isolada)
- `avaliacao.obrigado.tsx` → redirect legado (leaf, isolada)

Nenhuma delas será pai de nenhuma outra — todas viram irmãs num mesmo nível de URL.

### Passos

1. `mv src/routes/avaliacao.tsx src/routes/avaliacao.index.tsx`
2. Dentro do arquivo renomeado, ajustar a assinatura: `createFileRoute("/avaliacao/")` (com barra final, como o plugin gera para index routes). Também trocar `useSearch({ from: "/avaliacao" })` para `useSearch({ from: "/avaliacao/" })`.
3. Deixar o plugin regenerar `src/routeTree.gen.ts` automaticamente.

Nada mais precisa mudar — os arquivos de obrigado já estão corretos, o `goToThanks` já aponta para `/avaliacao/obrigado-qualificado` e `/avaliacao/obrigado-nao-qualificado`, e o `submit()` já foi endurecido no turno anterior.

### Arquivos

- Renomear: `src/routes/avaliacao.tsx` → `src/routes/avaliacao.index.tsx`
- Editar (dentro do arquivo renomeado): string em `createFileRoute` e em `useSearch`.
