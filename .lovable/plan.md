## Auditoria de contraste dos botões no painel admin (WCAG AA)

Escopo: variantes do `<Button>` shadcn dentro de `[data-admin-shell]` e seus estados **hover / disabled / focus / loading**. Sem tocar no site público.

### Contexto atual

O admin sobrescreve tokens shadcn com paleta clara (slate + amber, `src/styles.css`):
- `--primary/--accent: #f59e0b`, `--primary-foreground: #0f172a`
- `--destructive: #dc2626`, `--destructive-foreground: #fff`
- `--secondary/--muted: #f1f5f9`, `--accent bg (hover outline/ghost): #fef3c7` + `--accent-foreground: #92400e`
- `--ring: #f59e0b`

### Problemas encontrados

| Variante / estado | Combinação | Contraste | Status |
|---|---|---|---|
| `default` normal | #f59e0b / #0f172a | ~9.1:1 | OK |
| `default` **hover** (`bg-primary/90` sobre bg branco → mistura #f6a725) | / #0f172a | ~7.5:1 | OK |
| `destructive` normal | #dc2626 / #fff | **4.85:1** | Passa AA texto normal, **falha AAA** e fica frágil |
| `destructive` **hover** (`/90` mistura com branco → #e04d4d) | / #fff | **~3.6:1** | **FALHA AA** |
| `link` | #f59e0b / #fff | **~2.1:1** | **FALHA AA** grave |
| `outline`/`ghost` **hover** (`bg-accent #fef3c7` / `text-accent-foreground #92400e`) | | ~7:1 | OK |
| `secondary` **hover** (`bg-secondary/80` → mais claro) | / #0f172a | ~15:1 | OK |
| **Focus ring** (hardcoded `outline-[var(--gold)]` = #B7975A no site; no admin fica `#B7975A` sobre branco) | | **~2.4:1** | **FALHA 3:1 (UI)** |
| **Disabled** (`opacity-50` em qualquer variante) | ex: default → #f59e0b @ 50% + fg @ 50% sobre branco | **~2.3:1** | Isento WCAG mas ilegível na prática |
| **Loading** (Spinner `Loader2 text-slate-500` sobre bg branco em `ImageUploader`) | #64748b / #fff | ~4.9:1 | OK |
| **Loading** (spinner sobre `bg-primary` amber em botões default disparados) | ex: white spinner / #f59e0b | ~2.1:1 | **FALHA** se usarem `text-white`; hoje usam a fg atual (#0f172a) — OK, mas sem padronização |

### Correções

**1. Override do foco no admin** — `src/components/ui/button.tsx`
- Trocar o `outline-[var(--gold)]` fixo por token semântico `outline-ring` (usa `--ring`), para que respeite o override do admin. No admin, mudar `--ring` para um amber mais escuro `#b45309` (amber-700) → ~4.9:1 sobre branco (passa AA para componentes UI, com folga).

**2. Cascatear focus no `[data-admin-shell]`** — `src/styles.css`
- Ajustar o bloco global `:focus-visible` para usar `var(--ring)` em vez de `var(--gold)` fixo. Halo (`box-shadow`) já usa `--ink-deep`, permanece.
- Definir `--ring: #b45309` dentro de `[data-admin-shell]`.

**3. Estado disabled — melhorar legibilidade sem violar convenção**
- Trocar `disabled:opacity-50` por `disabled:opacity-60` + `disabled:saturate-50`. Em superfícies claras isso mantém o "cinza morto" percebido, mas eleva contraste para >=3:1 no rótulo (nível AA para componentes desativados, ainda que a regra formal isente).
- Complementarmente no admin: destructive/default disabled ganham `disabled:bg-slate-200 disabled:text-slate-500` via camada de override no shell admin (aplicada só a `[data-admin-shell] .btn-disabled-safe` ou via CSS `:disabled` seletor dentro do shell) — evita amber lavado e garante ~4.6:1.

**4. Destructive hover — fixar cor sólida**
- Substituir `hover:bg-destructive/90` (opacity que lava a cor sobre bg claro) por uma cor de hover sólida: `hover:bg-[color-mix(in_oklab,var(--destructive)_88%,black)]`. Resultado ≈ #c11f1f sobre branco → 5.6:1.

**5. Link variant no admin**
- Escurecer `--primary` só para uso como texto em admin não é ideal (mudaria fundo do CTA). Solução: override específico `[data-admin-shell] .btn-link, [data-admin-shell] a.text-primary` → cor `#b45309` (amber-700). Mantém `bg-primary` amber vibrante para CTAs; texto/link fica legível (~4.9:1).

**6. Loading state padronizado**
- Documentar padrão: dentro de `<Button variant="default">`, spinner herda `text-primary-foreground` (`text-current`). Em variantes claras (secondary/outline/ghost), `text-current` também resolve. Ajustar `ImageUploader.tsx` para usar `text-current` no `Loader2` quando dentro de botão (o caso citado está fora de botão, mantém `text-slate-500`).
- Adicionar `aria-busy="true"` quando o botão estiver em loading (regra de acessibilidade, não afeta contraste mas complementa).

### Arquivos a tocar

1. `src/components/ui/button.tsx`
   - `focus-visible:outline-[var(--gold)]` → `focus-visible:outline-[var(--ring)]`
   - `disabled:opacity-50` → `disabled:opacity-60 disabled:saturate-50`
   - `destructive`: hover com `color-mix` em vez de `/90`
   - Adicionar `aria-busy` opcional via prop `loading` (pequeno enhancement, mantém API atual)

2. `src/styles.css`
   - Bloco `:focus-visible` global: trocar `var(--gold)` por `var(--ring)`
   - `[data-admin-shell]`: `--ring: #b45309`; override para links (`a.text-primary, .text-primary` dentro de `[data-admin-shell]:not(button)`) para `#b45309`
   - `[data-admin-shell] button:disabled, [data-admin-shell] [role="button"][aria-disabled="true"]` → `background-color: #e2e8f0; color: #64748b;` (garante ~4.5:1 sem exceção)

3. Nenhuma alteração em rotas admin — herdam tudo via tokens.

### Validação

- Rodar Playwright em `/admin` (dashboard, `/admin/leads`, `/admin/usuarios`), capturar screenshots dos estados: normal, hover (via `page.hover`), focus (via `focus()`), disabled (botão "Salvar" em `admin.scoring` com `!dirty`).
- Script Node com cálculo WCAG confirmando ratios finais >=4.5:1 (texto) e >=3:1 (UI/foco) para todas as combinações listadas.

Sem mudanças no site público (tokens do site permanecem intactos fora do `[data-admin-shell]`).
