## Auditoria de contraste — cores de texto vs. fundo

Foco: garantir WCAG AA (4.5:1 para texto normal, 3:1 para texto grande/UI) em todas as superfícies do site público e do painel admin.

### 1. Mapear as superfícies do design system
Levantar cada combinação fundo × texto usada hoje, a partir de `src/styles.css`:

- **Ink (dark padrão)** — `bg: #0B0B0C` / `fg: #ECE6D6` / `muted-fg: #B8B2A4` / `gold: #B7975A`
- **Ink-deep** — `bg: #050506` (divisor)
- **Ink-raise (cards)** — `bg: #1C1C20`
- **Parchment** — `bg: #EFE9DA` / `fg: #141416` / `muted-fg: #4A5567` / `gold: #B7975A`
- **Parchment-deep** — `bg: #E4DCC8`
- **Admin shell** — slate/white + amber

Rodar cálculo de contraste (script simples com WCAG) para cada par e listar os que ficam abaixo de AA.

### 2. Pontos suspeitos já conhecidos (a validar no audit)
- **Gold `#B7975A` como texto em parchment `#EFE9DA`** — contraste ~2.9:1 → **FALHA AA** para corpo. É o caso do screenshot enviado (frase em itálico dourada sobre parchment). Precisa escurecer o gold quando usado como *texto* em fundo claro, ou trocar por `--ink-text` com ênfase.
- **Slate `#B8B2A4` como muted-foreground em ink** — ~7:1 (OK), mas em ink-raise pode cair.
- **Parchment muted `#4A5567` em parchment-deep `#E4DCC8`** — validar (~6:1, provável OK).
- **Oxblood `#6E2233` como texto** — só usado como "lacre"; validar onde aparece.
- **Foreground `#ECE6D6` em ink-raise `#1C1C20`** — ~13:1 (OK).
- **Bordas gold-soft rgba(183,151,90,0.22)** — decoração, não afeta texto.

### 3. Correções propostas (a aplicar após aprovação)

**A. Introduzir token dedicado para "gold como texto"**
- Adicionar `--gold-ink: #7A5F2E` (ouro escurecido, ~5.2:1 em parchment, ~7:1 em ink) para uso em **texto** decorativo/ênfase.
- Manter `--gold: #B7975A` apenas para bordas, filetes, ícones e fundo de CTA (onde contrasta com `ink-deep` no `primary-foreground`).

**B. Regra semântica**
- Em `.section-parchment`: qualquer `text-primary` / `text-gold` vira automaticamente `--gold-ink` via override de token.
- Em ink: manter gold atual (contraste ~6.8:1 contra `#0B0B0C` — OK para texto grande, mas subir para `#C9A868` quando usado em corpo pequeno).

**C. Ajustar componentes específicos identificados**
- `SectionHead` / eyebrow / frases-slogan em parchment com destaque itálico dourado → trocar para `text-[--gold-ink]`.
- Links inline do blog em parchment (se houver) → mesmo tratamento.
- Botões `outline` em parchment: garantir borda e label com contraste ≥3:1.
- Placeholders de input (`--input`) em parchment: validar opacidade.
- Admin: revisar `text-muted-foreground` sobre `bg-accent` (amber claro) — provável falha, trocar para `text-amber-900`.

**D. Foco visível**
- Halo dourado atual usa gold puro; validar contraste do anel em cada superfície (já tem tratamento parchment, verificar admin).

### 4. Validação
- Script Node em `/tmp` com a lib WCAG para gerar tabela final de pares antes/depois.
- Screenshots via Playwright das 3 dobras críticas (hero parchment, seção com slogan itálico, admin dashboard) antes e depois.
- Verificar visualmente que a identidade "Dossiê" segue reconhecível — o ouro continua sendo assinatura em filetes/bordas/CTAs; só o *texto* ganha a versão escurecida.

### 5. Arquivos a tocar
- `src/styles.css` — adicionar `--gold-ink`, override em `.section-parchment`, ajuste eventual do gold em ink escuro.
- `src/components/site/sections.tsx` e demais seções — trocar classes de texto dourado por token semântico novo onde apropriado.
- `src/components/site/SectionHead.tsx` se aplicar cor fixa.
- Painel admin: `src/routes/admin.tsx` + páginas com badges/accent.

Sem mudanças de layout, tipografia ou conteúdo — puramente contraste de cor.
