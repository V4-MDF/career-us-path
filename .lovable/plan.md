## Objetivo

Permitir que o admin reordene e oculte/exiba qualquer dobra do site, com a página pública renderizando na ordem definida — em vez da ordem fixa hoje hardcoded em `routes/index.tsx`.

## Estado atual (auditado)

- `src/lib/sectionMap.ts` já é a fonte de verdade dos ids/labels de dobra (`HOME_SECTIONS`, `VISA_SECTIONS`).
- `src/routes/admin.conteudo.tsx` tem um stub `PageSections` com **lista desatualizada** (ids errados, inclui `persona-cards` que foi removido) e fica escondido dentro da aba “Home” de Textos. Os toggles não afetam nada — `routes/index.tsx` renderiza as `<Section />` em ordem fixa.
- `dataStore` já tem o slot `page_sections` registrado.
- `HOME_SECTIONS` reais hoje: `abertura, credenciais, brasil-vs-eua, eb-2-niw, vistos-eb, processo-eb-2-niw, por-que-status, legado, renda-em-dolar, depoimentos, duvidas-frequentes, avaliacao-gratuita` (mais `BlogStrip` que vive entre `Hero` e `ContrastBrasilEUA`).

## Entregável

### 1. Nova rota `/admin/estrutura` (aba "Estrutura de Páginas")

Lista de páginas no topo (segmented control): **Home**, **EB-2 NIW**, **EB-1**, **EB-3** (as três páginas-pilar de visto). Para a página selecionada:

- Lista vertical das dobras com:
  - número da posição
  - ícone de arrastar + label da dobra (vindo do `sectionMap`)
  - toggle **Ativa/Oculta**
  - botões ↑ ↓ como fallback acessível ao drag
  - botão "Restaurar padrão" no topo, com confirmação
- Drag-and-drop por reorder (HTML5 nativo — sem nova dependência; já temos toda a UI shadcn).
- Indicador de dobras "fixas" (Hero/Abertura não pode ser ocultada nem movida da posição 1 — regra de UX para não quebrar a página).
- Salvamento automático em `dataStore["page_sections"][pageSlug] = { items: [{id, active}], updatedAt }` + `broadcast()` para refletir em outras abas abertas.

### 2. Hook `useOrderedSections(pageSlug, defaults)`

`src/lib/usePageSections.ts` — lê o slot, faz merge com defaults (adiciona novas dobras que apareceram no código depois da última edição; remove ids que não existem mais), retorna `Array<{id, active}>` ordenado. Reativo via subscribe do `dataStore`.

### 3. Refatorar Home para consumir a ordem

`src/routes/index.tsx`: substituir o JSX fixo por um map sobre `useOrderedSections("home", HOME_SECTIONS)`, com um `SECTION_REGISTRY: Record<string, React.FC>` que mapeia id → componente. Dobras com `active: false` não renderizam. `Hero` permanece sempre em posição 1.

### 4. Refatorar `VisaPageBody` da mesma forma

Mesmo padrão para as páginas-pilar, usando `VISA_SECTIONS` como default e `pageSlug = "vistos:eb-2-niw"` etc.

### 5. Limpeza

- Remover o `PageSections` stub de `admin.conteudo.tsx` e a lista hardcoded local errada.
- Adicionar link "Estrutura" na sidebar do admin (entre "Textos & Conteúdo" e "Mídia").

## Detalhes técnicos

- Sem novas dependências: drag-and-drop via `draggable` + `onDragOver/onDrop` nativos (suficiente para uma lista curta de 10–13 itens).
- Persistência segue o padrão atual (`get`/`set` do `dataStore`, `localStorage`); pronto para virar tabela Supabase depois (`page_structure(page_slug, items jsonb, updated_at)`).
- Merge defensivo: se o código adicionar/remover dobras, o admin reconcilia automaticamente (novas entram no fim como ativas; órfãs somem).
- Acessível: cada item tem `role="listitem"`, drag handle com `aria-label`, e setas ↑↓ funcionam por teclado.
- Mobile: drag desabilitado < md, só setas ↑↓.

## Fora de escopo (proposital)

- Páginas Sobre/Contato continuam stubs.
- Blog index e posts já são dinâmicos por natureza (lista de posts), não precisam de reorder de dobra.
- Nenhuma mudança em SEO/sitemap (os ids de dobra continuam os mesmos).
