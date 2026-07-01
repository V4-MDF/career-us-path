
# Adaptar o visual do site ao painel admin

Hoje o site público segue a identidade **Dossiê / Credencial** (fundo `ink #0B0B0C`, parchment `#EFE9DA`, ouro `#B7975A`, Montserrat display + Inter body, filetes dourados, radius 0.875rem). O `/admin` ficou num tema genérico shadcn: fundo `bg-slate-100`, sidebar `bg-slate-900` com amarelo `amber-400`, cards brancos com sombras suaves, sem tipografia da marca.

O plano traz a linguagem visual do site para o admin, mantendo densidade e legibilidade de painel (não é um clone estético da home — é a marca aplicada a uma UI de trabalho).

## Direção visual do admin

- **Superfícies**: fundo geral `parchment-deep`, cards `parchment` com filete lateral dourado (em vez de branco puro + sombra). Sidebar em `ink-deep` com filete dourado à direita.
- **Ouro como acento único** (troca do `amber-400`): item ativo do menu, KPIs, badges de status, focus ring, `border-l` dos StatCards.
- **Tipografia**: títulos de página em Montserrat 700 uppercase com tracking largo + filete dourado curto (mesma assinatura do `SectionHead` público). Corpo e tabelas em Inter. Números de KPI em Montserrat 800.
- **Header do admin**: barra `parchment` com hairline `gold/25`, breadcrumb em mono-label dourado ("ADMIN · LEADS").
- **Login `/auth`**: adota o mesmo fundo `ink` do site, card `parchment`, logo oficial no topo (não mais o "S" placeholder).
- **Componentes shadcn**: já herdam do `--radius` e das cores via tokens — a mudança principal é dropar as classes `slate-*`/`amber-*` hardcoded do shell e dos helpers admin.

## O que muda no código

**`src/components/admin/ui.tsx`** — reescrita dos 3 helpers:
- `PageHeader`: título Montserrat uppercase + filete gold + eyebrow mono ("ADMIN"). Descrição em `ink-text/70`.
- `StatCard`: fundo `parchment`, borda `gold/20`, filete lateral em `gold` (default) ou `oxblood`/`success` para os accents. Label em mono uppercase; valor em Montserrat 800.
- `SectionCard`: fundo `parchment`, header com hairline `gold/25`, footer `parchment-deep`.
- `ClassBadge`: paleta A/B/C/D remapeada — A `gold`, B `ink`, C `slate`, D `parchment-deep` (mantém legibilidade sem verde/azul).

**`src/routes/admin.tsx`** — shell:
- Fundo `bg-parchment-deep text-ink-text` (era `slate-100`).
- Sidebar `bg-ink-deep` com borda direita `border-r border-gold/20`; item ativo `bg-gold text-ink-deep`; hover `bg-ink-raise`; badges "crítico" em `gold/80`.
- Header sticky `bg-parchment` com hairline dourado e breadcrumb mono. Botões "Ver site" e "Sair" em `variant="ghost"` no tom da marca.
- Logo: substituir o quadrado "S" pela logo oficial já usada no header público (`@/assets/logo-status-na-america.png.asset.json`).
- Rodapé lateral: "Auth · Lovable Cloud" em `slate` claro sobre `ink-deep`.

**`src/routes/auth.tsx`** — página de login:
- Fundo full-screen `bg-ink` com o mesmo backdrop sutil do site.
- Card `bg-parchment text-ink-text rounded-2xl` com filete dourado no topo.
- Logo oficial no topo (não o "S").
- Labels/inputs no padrão do site (Inter, focus ring `gold`).

**Nenhum outro admin.*.tsx precisa ser tocado** — todos usam `PageHeader`/`SectionCard`/`StatCard` + `Button`/`Input`/`Table` do shadcn, que herdam tokens automaticamente. Se algum lugar tiver `bg-white`, `text-slate-*` ou `bg-amber-*` hardcoded, esses ficam remapeados via grep no fim.

## Fora de escopo

- Nada de nova feature, tabela, rota ou lógica.
- Sem tocar em site público, banco, RLS ou server functions.
- Sem tema dark toggle no admin — o admin fica no par `parchment/ink` (claro operacional com identidade da marca).

## Verificação

- Rodar typecheck.
- Abrir `/admin` e `/auth` no preview via Playwright (viewport 1280) e capturar screenshots do dashboard, de uma listagem (`/admin/leads`) e do login para confirmar consistência com a home.
