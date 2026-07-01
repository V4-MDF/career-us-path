## Diagnóstico

Ao rodar `/avaliacao` no preview (anônimo), o console mostra:

```
[dataStore] upsert falhou sessions ... new row violates row-level security policy for table "kv_records"
Failed to load resource: 401
```

Reproduzi via `curl` como anon:
- `INSERT` puro em `kv_records` (leads/sessions) → **201 OK**.
- `INSERT ... ON CONFLICT` (o que o Supabase JS emite quando usamos `.upsert({ onConflict: ... })`) → **401 / 42501** para as mesmas linhas.

O motivo: PostgREST, ao traduzir `upsert` com `resolution=merge-duplicates`, exige que a policy de **UPDATE** cubra a linha. Para `leads` e `prequal_responses` só existe policy de INSERT para o role anon (por design — não queremos anon atualizando leads), então **todo submit do formulário público falha silenciosamente**. Para `sessions`/`leads_partial` a policy de UPDATE existe, mas o path de upsert do PostgREST com key `sb_publishable_*` ainda dispara 42501 no INSERT — provavelmente porque a checagem WITH CHECK do UPDATE é avaliada mesmo quando não há conflito.

Resultado: nenhum lead/sessão/parcial anônimo chega ao banco. Só o cache local guarda; o admin lê do banco (`kv_records`) e não vê nada.

## Correção

Trocar `dataStore.set()` para NÃO usar `upsert`. Nova estratégia (uma única função, mantém o cache shadow):

1. Tentar `.insert({ table_name, record_id, data })`.
2. Se o erro for `23505` (unique violation → o registro já existe), fazer `.update({ data, updated_at: now() }).eq('table_name', table).eq('record_id', id)`.
3. Qualquer outro erro → `console.warn` como hoje.
4. Atualizar o shadow cache no fim, como hoje.

Isso resolve todos os cenários:

- **Anon criando lead novo / sessão / parcial / prequal**: cai no INSERT (id é sempre `newId()`, único) — policy de INSERT do anon cobre.
- **Anon atualizando `leads_partial` / `sessions` / `ab_stats`** (mesmo id chamado várias vezes durante o preenchimento progressivo): INSERT bate 23505 → cai no UPDATE — policy de UPDATE do anon cobre.
- **Admin autenticado editando qualquer tabela** (ex.: mudar status do lead em `/admin/leads`): INSERT bate 23505 → UPDATE — policy "admins full kv" cobre.

Nenhuma mudança de policy/migração no banco é necessária, nem mudança em nenhum outro arquivo — o problema está isolado em `src/lib/dataStore.ts`.

## Validação

1. Rodar Playwright em `/avaliacao`, preencher o formulário até o fim, submeter, e confirmar via `psql` que uma linha nova apareceu em `kv_records` (table_name='leads'), sem warnings de RLS no console.
2. Recarregar o admin em `/admin/leads` e confirmar que o novo lead aparece.
3. Verificar também que `leads_partial` grava conforme o usuário digita (múltiplos `set()` no mesmo id → INSERT + UPDATEs).

## Arquivos

- `src/lib/dataStore.ts` — reescrever a função `set()` (única alteração).
