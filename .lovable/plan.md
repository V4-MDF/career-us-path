## Diagnóstico

O que o usuário está vendo ("dobras desorganizadas ao abrir o site") não é cache do navegador — é um **flash de reordenação** causado pela forma como o layout da Home é carregado hoje:

1. `useOrderedSections("home")` em `src/lib/pageStructure.ts` usa `useSyncExternalStore` com:
   - **serverSnapshot** = `reconcile("home", null)` → sempre a **ordem default do código** (`DEFAULT_LAYOUTS.home`).
   - **clientSnapshot** = lê `localStorage["status_page_sections"]`.
2. Ao abrir o site pela primeira vez (ou em modo anônimo, ou depois que o admin reordenou):
   - SSR renderiza a **ordem default**.
   - Cliente hidrata com a **ordem default** (localStorage vazio).
   - `ensureHydrated` dispara `loadPageSections` no Supabase, salva no cache e emite `status:admin-change`.
   - A Home **re-renderiza com a ordem salva** → o usuário vê as dobras "pularem de lugar".
3. Em navegadores que já visitaram depois de uma edição, o localStorage tem a ordem certa e não há flash. Por isso o bug parece intermitente e "parecido com cache".

## O que vamos corrigir

Fazer com que a ordem correta esteja disponível **antes do primeiro render**, eliminando o flash — sem tocar em conteúdo, tracking, A/B, scoring nem no admin.

### 1. Carregar `page_sections` no loader da rota `/`

- Em `src/routes/index.tsx`, adicionar um `loader` que busca `page_sections/home` diretamente do banco usando um cliente server-side com a publishable key (padrão já usado em outras rotas SSR do projeto), reconciliando com os defaults via `reconcile("home", …)`.
- O loader retorna `{ sections: SectionItem[] }`, exposto por `Route.useLoaderData()`.
- Fallback silencioso para `reconcile("home", null)` se a query falhar (mantém comportamento atual em caso de erro).

### 2. Injetar a ordem carregada no store síncrono antes do render

- Em `src/lib/pageStructure.ts`, expor `primePageSections(page, items)` que:
  - Escreve no shadow cache (`status_page_sections`) via `cacheWrite`-equivalente.
  - Atualiza `snapshotCache` para que `getCachedSnapshot` retorne a mesma referência estável no primeiro render.
- Em `src/routes/index.tsx`, chamar `primePageSections("home", loaderData.sections)` **de forma síncrona no corpo do componente, antes** de qualquer uso de `useOrderedSections`. Assim SSR e cliente já produzem o mesmo snapshot com a ordem salva.
- Também alinhar `getServerSnapshot` para consultar `snapshotCache` primeiro, para que SSR emita o mesmo HTML da ordem "primed".

### 3. Evitar o segundo dispatch redundante

- `ensureHydrated` continua existindo (para páginas que não passem pelo priming), mas quando a ordem já foi "primed" pelo loader e coincide com a do banco, o `dispatchEvent("status:admin-change")` não dispara (já é o comportamento após a comparação de chaves) — apenas confirmar que continua correto após o priming.

### 4. Verificação

- Abrir a Home em aba anônima com DevTools → Network para confirmar:
  - HTML SSR já sai com as dobras na ordem salva.
  - Não há reordenação visível após a hidratação.
- Rodar o build (`build:dev`) para garantir que o loader não quebra o prerender da Home (rota pública, sem `requireSupabaseAuth`).
- Testar cenário "admin muda a ordem → visitante anônimo abre a Home" (sem localStorage prévio) para confirmar que a ordem correta aparece de imediato.

## Fora do escopo

- Não mexer no admin (`/admin/estrutura`), nem em conteúdo de dobras, nem em outras páginas (só Home usa `useOrderedSections` hoje).
- Não trocar o mecanismo de persistência (`kv_records`) nem os defaults do código.
- Não desabilitar o shadow cache do `dataStore` — ele continua útil para leituras síncronas em outras superfícies.
