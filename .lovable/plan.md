## Diagnóstico

A repaleta passou `--background` (ink) para `#0B0B0C` (quase preto) e `--ink-text` para `#141416`. Em qualquer lugar onde um botão/título já usava esses tokens **e** estava sobre uma superfície com a mesma cor, o contraste sumiu. Pontos críticos identificados:

1. **Admin (`bg-slate-100` claro) usando botões shadcn**
   - `variant="outline"` e `variant="secondary"` usam `bg-background`/`bg-secondary` (tokens dark do site público). No fundo claro do admin viram blocos quase pretos com hover ouro — fora de padrão e em alguns casos o texto fica `text-foreground` (cinza claro) sobre fundo escuro novo demais pelo contexto. Ainda mais grave: o admin foi escrito com Tailwind palette (slate/amber) e o `<Button>` agora puxa cor da paleta dossiê.
   - `<Button variant="outline">` no header do admin (linha 145 `admin.tsx`) → fundo escuro inesperado.
   - `<Button variant="ghost">` "Sair" (linha 151) → hover ouro com `text-accent-foreground` = preto sobre ouro, ok, mas idle herda do site público.

2. **Site público: `text-ink-text` (#141416) usado fora de seções parchment**
   - `sections.tsx` linha 478 — overlay `<ProcessIconStrip />` com `text-ink-text` cobre uma seção **escura** (CTA flow). Hoje o ícone é praticamente invisível (preto sobre preto).
   - Demais usos de `text-ink-text` em `sections.tsx`, `visa/VisaPageBody.tsx`, `blog.tsx` estão dentro de seções/cards parchment (fundo creme) — seguem legíveis.

3. **Botões/links com `bg-foreground/30`, `bg-primary-foreground`, ou usando `bg-ink`/`bg-ink-deep` em cima de `bg-ink`**
   - `avaliacao.obrigado.tsx` linhas 150/152: separador `bg-foreground/30` — fundo é ink (quase preto), foreground é claro — visível, ok.
   - Cards `bg-ink-raise` sobre `bg-ink` agora têm diferença mínima (`#16161A` vs `#0B0B0C`) — visível mas sutil; aceitável.

4. **Tipografia de botão**: novo `btn-label` é `12px uppercase tracked` — em alguns botões longos do admin (ex.: "Salvar configurações") pode comprimir/quebrar; é uma queixa de identidade, não de contraste, mas vou verificar.

## Plano de correção

### A) Restaurar o admin como tema próprio (independente do site público)

O admin foi escrito com a paleta Tailwind direta (slate/amber/white). Botões shadcn estão puxando tokens dossiê e poluindo. Corrigir reescrevendo apenas os botões nas páginas/admin para variantes neutras:

1. **Em `src/routes/admin.tsx`** trocar o `<Button variant="outline">` "Ver site" e `<Button variant="ghost">` "Sair" por botões nativos com classes slate (`<a className="inline-flex …border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 …">`), removendo a dependência do componente shadcn no shell do admin.
2. Em todas as outras páginas `admin.*.tsx` que usam `<Button>` shadcn, **manter o componente**, mas adicionar uma classe wrapper na main do admin que reescreve os tokens shadcn para a paleta clara:
   ```css
   /* styles.css */
   [data-admin-shell] {
     --background: #ffffff;
     --foreground: #0f172a;        /* slate-900 */
     --primary: #f59e0b;            /* amber-500 */
     --primary-foreground: #0f172a;
     --secondary: #f1f5f9;          /* slate-100 */
     --secondary-foreground: #0f172a;
     --muted: #f1f5f9;
     --muted-foreground: #475569;
     --accent: #fef3c7;             /* amber-100 */
     --accent-foreground: #92400e;
     --border: #e2e8f0;
     --input: #cbd5e1;
     --ring: #f59e0b;
     --card: #ffffff;
     --card-foreground: #0f172a;
     --popover: #ffffff;
     --popover-foreground: #0f172a;
   }
   ```
   E adicionar `data-admin-shell` no wrapper do `admin.tsx` (`<div className="min-h-screen flex bg-slate-100 text-slate-900" data-admin-shell>`). Isso isola o admin sem reescrever cada uso de `<Button>`.

3. **Voltar `btn-label` para o site público apenas**: o `Button` base não deve forçar uppercase no admin (relatórios, filtros, "Salvar", "Excluir" ficam estranhos em uppercase). Trocar abordagem:
   - Reverter `Button` base para `text-sm font-medium` (Inter).
   - Criar uma variante específica `cta` ou aplicar `btn-label` apenas por className nos CTAs do site público (Hero, Footer, formulários). Os botões públicos críticos hoje já recebem `variant="default"` em hero/footer; vou listar os pontos e aplicar `className="btn-label"` neles.
   - Esse caminho preserva o admin natural e devolve a tipografia premium nos CTAs reais do site.

### B) Corrigir os pontos `text-ink-text` invisíveis no público

- `sections.tsx` linha 478: trocar `text-ink-text` → `text-gold/15` (overlay decorativo sutil sobre seção escura).
- Auditar os demais `text-ink-text` para garantir que estão sempre dentro de `.section-parchment` (já estão, conforme grep).

### C) Garantir contraste mínimo nos cards escuros

- `--ink-raise` `#16161A` sobre `--ink` `#0B0B0C` → diferença visual fraca. Subir `--ink-raise` para `#1C1C20` para devolver elevação visível em cards `bg-ink-raise/50` (FAQ, scoring, blog cards).

### D) Validação

- Rodar Playwright em `/`, `/avaliacao`, `/admin`, `/admin/leads`, `/admin/scoring`. Tirar screenshots desktop 1280 e validar:
  - botões do admin com aparência clara/slate, texto legível
  - títulos `H1/H2` visíveis em todas as seções
  - CTAs do site público em Montserrat uppercase
  - cards escuros com elevação perceptível
- Se algum botão crítico ainda ficar invisível, ajustar pontualmente.

## O que NÃO muda

- Paleta dossiê do site público (preto + ouro + parchment) continua igual.
- Estrutura de rotas, copy, lógica.
- Tipografia das seções/headlines do site público.
