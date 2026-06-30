## Objetivo

1. Tirar o tom azulado/navy do site e aproximar a identidade de **preto profundo + ouro** (mantendo o ouro `#B7975A` como único acento cromático).
2. Padronizar a tipografia dos botões/CTAs para o mesmo registro do resto do site (Montserrat uppercase tracked), eliminando o look "mono" do exemplo `VER TODOS OS ARTIGOS →`.

## 1. Repaleta — de navy para preto

Editar **`src/styles.css`** (os tokens são a fonte única; tudo no site puxa daí):

| Token | Antes (navy) | Depois (preto carvão) |
|---|---|---|
| `--ink` (background) | `#0E1726` | `#0B0B0C` |
| `--ink-deep` | `#0A111C` | `#050506` |
| `--ink-raise` (cards/surface) | `#16223A` | `#16161A` |
| `--ink-text` (texto em parchment) | `#1B2435` | `#141416` |
| `--muted` (dark) | `#1A263F` | `#1B1B1F` |
| `--slate` (muted-foreground) | `#AEB7C4` | `#B8B2A4` (cinza com leve ouro) |
| `--gold-soft` (border default) | `rgba(183,151,90,0.22)` | manter |

Resultado: superfícies escuras passam de navy frio para preto neutro/carvão; ouro fica como único brilho.

Também:
- Em `src/lib/admin/settings.ts`, mudar o default `accent_color: "#1E3A5F"` (navy) para `"#0B0B0C"` (preto), e renomear o label em `src/routes/admin.configuracoes.tsx` de "Cor de destaque (navy)" para "Cor de destaque (ink)".
- Em **`src/components/site/lp/LandingPageTemplate.tsx`** trocar os usos hardcoded de `text-navy`, `border-navy/*`, `bg-gradient-to-br from-navy via-surface to-background` por tokens equivalentes (`text-ink-text`, `border-ink/20`, `bg-gradient-to-br from-ink via-ink-raise to-ink-deep`) para que a LP também siga a nova paleta.
- Os aliases `--color-navy` em `styles.css` continuam apontando para `--ink` (já é o caso), então classes legadas `bg-navy`/`text-navy-foreground` automaticamente passam a renderizar preto sem quebrar nada.

Não mexer no ouro nem no parchment — a relação preto/ouro/papel é o ponto da identidade.

## 2. Tipografia dos botões

Hoje o componente `Button` (`src/components/ui/button.tsx`) usa `text-sm font-medium` (Inter), enquanto vários CTAs/links do site (ex. `VER TODOS OS ARTIGOS →` no `BlogStrip.tsx`) usam `font-mono-label` (JetBrains Mono uppercase). Isso cria três registros tipográficos diferentes (Inter / Montserrat / Mono) competindo na mesma página.

Ações:
- Atualizar **`src/components/ui/button.tsx`** para que o estilo base use a mesma assinatura tipográfica do resto do site: `font-display uppercase tracking-[0.14em] text-[12px] font-semibold` (Montserrat 600, uppercase, tracked) — alinhado aos `display-*` e eyebrows. Tamanhos `sm`/`lg` mantêm a mesma família, ajustando apenas a `font-size` (11px / 13px).
- Criar uma classe utilitária `.btn-label` em `src/styles.css` com o mesmo recipe (Montserrat uppercase tracked) para reaproveitar em CTAs `<a>`/`<Link>` que hoje usam `font-mono-label`.
- Substituir `font-mono-label` por `btn-label` **apenas em elementos que são CTAs/botões**, não em eyebrows/labels informativos:
  - `BlogStrip.tsx` (link "VER TODOS OS ARTIGOS →")
  - `Header.tsx` (CTA do header, se houver `font-mono-label` no botão de avaliação)
  - `LeadFormProgressive.tsx` (link "Recuperar progresso" e botão de etapa, linhas 325 e similares)
  - Qualquer outro `font-mono-label` que esteja dentro de `<Button>`, `<a className="… cta">`, etc.
- **Manter `font-mono-label`** nos eyebrows de seção (`SectionHead`, `sections.tsx`), credenciais, breadcrumbs, métricas — ali o mono é proposital ("dados oficiais de dossiê") e não compete com o título.

## 3. Verificação

- Rodar Playwright em `/`, `/avaliacao`, `/lp/medicos` e `/blog`: tirar screenshots para confirmar (a) ausência de azul perceptível em hero/cards/footer, (b) CTAs com a mesma "voz" do título (Montserrat tracked) e não mais com aparência de código mono.
- Conferir que parchment (seções claras) e o ouro continuam intactos — só o frio do navy sai.

## O que NÃO muda

- Estrutura de componentes, rotas, copy, lead scoring, dataStore, admin.
- Paleta parchment, ouro, oxblood e successo.
- Eyebrows, números de seção e dados em `font-mono` (intencional na identidade dossiê).
