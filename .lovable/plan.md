## Problema

1. Após enviar o formulário em `/avaliacao`, o usuário nem sempre é redirecionado para a página de obrigado.
2. Hoje existe uma única rota `/avaliacao/obrigado` que alterna entre "qualificado" e "não qualificado" por query param (`?q=`). O pedido é ter **duas páginas dedicadas**, cada uma com seu próprio URL.

## Solução

### 1. Duas páginas de obrigado dedicadas

Criar duas rotas separadas, cada uma com seu `head()` próprio (mantendo `noindex,nofollow`):

- `src/routes/avaliacao.obrigado-qualificado.tsx` → `/avaliacao/obrigado-qualificado`
  - Tom positivo: "Obrigado. Sua avaliação está em análise." + CTA EB-2 NIW + timeline 01/02/03.
- `src/routes/avaliacao.obrigado-nao-qualificado.tsx` → `/avaliacao/obrigado-nao-qualificado`
  - Tom acolhedor: "Recebemos seu perfil — vamos guardar seu contato." + cards de guia/blog + email de contato.

Cada página recebe o conteúdo hoje presente em `Qualificado` / `NaoQualificado` dentro de `avaliacao.obrigado.tsx`, extraído como componentes de página completos (header + main + footer, como já existe).

### 2. Redirecionar para a rota certa

Em `src/routes/avaliacao.tsx`, ajustar `goToThanks` para escolher a rota com base em `qualification`:

```tsx
navigate({
  to: qualification === "qualificado"
    ? "/avaliacao/obrigado-qualificado"
    : "/avaliacao/obrigado-nao-qualificado",
  replace: true,
});
```

Descartar o query param `?q=` (não é mais necessário).

### 3. Legado / compatibilidade

Manter `src/routes/avaliacao.obrigado.tsx` como **redirect** para não quebrar links externos: no `beforeLoad`, se `search.q === "nao_qualificado"` redireciona para `/avaliacao/obrigado-nao-qualificado`, caso contrário para `/avaliacao/obrigado-qualificado`.

### 4. Garantir que o redirect sempre aconteça

Em `src/components/site/LeadFormProgressive.tsx`, endurecer o `submit()`:

- Envolver `evaluateQualification()` em try/catch com fallback `qual = { result: "qualificado", reasons: [] }` (assume qualificado por padrão para não travar o funil).
- Mover a chamada `onSubmitted(...)` para **antes** dos efeitos colaterais de sessão/tracking, de modo que uma falha em `markSessionConverted`, `registerConversion` ou `remove(leads_partial)` nunca impeça a navegação. Esses efeitos já estão em try/catch isolados; só precisamos reordenar.
- O `set("leads", ...)` continua sendo aguardado, mas `dataStore.set` já não lança (loga warn e cacheia em localStorage), então o fluxo sempre atinge `onSubmitted`.

### Arquivos

- Novo: `src/routes/avaliacao.obrigado-qualificado.tsx`
- Novo: `src/routes/avaliacao.obrigado-nao-qualificado.tsx`
- Editar: `src/routes/avaliacao.obrigado.tsx` (vira redirect)
- Editar: `src/routes/avaliacao.tsx` (`goToThanks` roteia para a rota correta)
- Editar: `src/components/site/LeadFormProgressive.tsx` (`submit()` endurecido)

Nada muda em admin, dataStore, RLS ou schema.
