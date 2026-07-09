## Sincronizar ordem das dobras entre admin e site público

### Causa raiz
`useOrderedSections("home")` (em `src/lib/pageStructure.ts`) lê o snapshot **apenas do localStorage** via `useSyncExternalStore`. Quando o admin salva a nova ordem, o valor vai para o Supabase (`kv_records`) e também para o localStorage **do navegador do admin** — mas qualquer outro visitante (outro navegador/dispositivo/aba anônima) nunca hidrata do banco e continua vendo a ordem default. Resultado: o rearranjo "não aparece" no site principal.

Além disso, `HOME_SECTIONS` em `src/lib/sectionMap.ts` ainda lista `credenciais` (14 itens), enquanto o layout real da Home tem 13 dobras — o `AuthorityStrip` que usava esse id é código órfão. Isso explica o "não está atualizado com as dobras atuais".

### Mudanças

**1. `src/lib/pageStructure.ts` — hidratar do banco no cliente**
- Adicionar um `useEffect`-equivalent externo ao `useSyncExternalStore`: um pequeno módulo de inicialização que, no primeiro import no browser, chama `loadPageSections("home")` (que já lê do Supabase via `dataStore.get`). O resultado atualiza o localStorage (`dataStore.set` já faz isso via cache) e dispara `broadcast()` para o `useSyncExternalStore` re-renderizar.
- Implementação: uma função `ensureHydrated(page)` chamada dentro de `subscribe()` na primeira execução (guarda por `Set<PageSlug>` para não repetir). Assim, todo componente que usa `useOrderedSections` dispara a hidratação uma vez por sessão.
- Sem SSR breakage: `ensureHydrated` só roda quando `typeof window !== "undefined"`.

**2. `src/lib/sectionMap.ts` — alinhar HOME_SECTIONS**
- Remover o item `{ id: "credenciais", label: "Credenciais" }` de `HOME_SECTIONS` (ficam 13 itens, batendo com `DEFAULT_LAYOUTS.home` e `HOME_REGISTRY`).
- Manter o comentário do bloco atualizado.

**3. `src/components/site/sections.tsx` — remover código órfão**
- Remover o export `AuthorityStrip` (linhas ~183-204) que não é usado em lugar nenhum e mantém um `id="credenciais"` inconsistente. O comentário do topo do arquivo que o menciona também sai.

### Fora do escopo
- Sem mudanças de RLS/migrations — `kv_records` já existe e `dataStore.get` já lê do banco.
- Sem mudanças no `HOME_REGISTRY` (já bate com os 13 ids).
- Sem alterar o admin (`/admin/estrutura`) — a lista dele já vem correta de `DEFAULT_LAYOUTS.home`.