## Diagnóstico
O painel admin roda em tema escuro, mas o Sheet de detalhes do lead em `src/routes/admin.leads.tsx` usa cores light-mode fixas (`text-slate-500`, `text-slate-700/800`, `bg-slate-50`, `bg-slate-100`, `border-slate-200`, `border-slate-100`). Sobre o fundo escuro, labels e valores ficam praticamente ilegíveis — é o que aparece no print.

## Correção
Trocar as cores fixas do slate por tokens semânticos do design system, que já se adaptam ao tema:

**`src/routes/admin.leads.tsx` (Sheet de detalhes, linhas ~393–493, e helper `Field` linhas 520–527)**
- Rótulos "PONTUAÇÃO…", "STATUS DO FUNIL", "COMPOSIÇÃO…", "UTMS", "ORIGEM DO TRÁFEGO", nomes de campos: `text-slate-500` → `text-muted-foreground`.
- Valores (nome, e-mail, whatsapp, pontos, etc.): `text-slate-700/800` → `text-foreground`.
- Fundos das barras de progresso vazias: `bg-slate-100` → `bg-muted`.
- Cabeçalhos de seção (UTMs/Composição/Origem): `bg-slate-50` → `bg-muted/40`.
- Bordas: `border-slate-200`, `border-slate-100` → `border-border`.
- `text-slate-400` (denominador " / 20") → `text-muted-foreground/70`.
- Bloco "Origem incompleta": manter o vermelho, mas usar variantes que funcionam no escuro — `bg-red-500/10 border-red-500/40 text-red-300` (título em `text-red-200`).
- Barra de composição preenchida (`bg-amber-400`) → `bg-gold` (token do projeto) para casar com o resto da UI.

**`ScoreCell` (linhas 504–518)**
- Mesma troca: `bg-slate-100` → `bg-muted` na trilha da barra.

Sem mudar layout, textos ou lógica — apenas classes de cor. Resolve o contraste do modal inteiro (título, score, composição, campos, UTMs, origem) de uma vez.

## Fora de escopo
- Tabela principal de leads, filtros e demais rotas admin — o print mostra só o Sheet.
- Nenhuma mudança de tokens globais no `src/styles.css`.
