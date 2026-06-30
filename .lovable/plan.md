
## Escopo

Refatorar a página `/avaliacao`, ajustar o `LeadFormProgressive` e reconstruir `/avaliacao/obrigado` para suportar dois desfechos (qualificado x ainda-não-qualificado). Mudanças só de apresentação/UX e regras de qualificação no cliente — sem mexer em dataStore, A/B engine ou `scoring.ts` admin.

---

### 1. Reformatar `/avaliacao` (layout + contraste)

`src/routes/avaliacao.tsx`:

- **Fundo**: remover o `guilloche` losangulado. Substituir por fundo `bg-ink` sólido com um **gradiente radial suave** no topo (gold 4% → transparente) e uma linha hairline `border-gold/15` separando header. Sem padronagem repetida.
- **Layout**: trocar o grid 2 colunas por **layout vertical centralizado**, max-width `680px`, ocupando 100% da viewport (`min-h-screen flex flex-col`). O form passa a ser o protagonista — preenche a página inteira na vertical, com bastante respiro entre perguntas.
- **Header acima**: compacto (logo + "Voltar ao site"), igual já está, mas com `bg-ink/80 backdrop-blur` sticky.
- **Bloco de intro acima do form** (no topo da coluna única): chip "AVALIAÇÃO GRATUITA · 100% CONFIDENCIAL", `h1` em `display-2` (tamanho reduzido vs hero), parágrafo curto. **Sem grid de credenciais lateral** — credenciais viram uma faixa horizontal compacta abaixo do form (ou no footer da página).
- **Contraste/legibilidade**: forçar `text-foreground` (não `text-foreground/55`) nos labels principais e aumentar tamanho mínimo do input para 16px. Trocar borda fina sumida do card por `border-gold/25` + `bg-ink-raise` (mais elevação visível).
- **Origem (chip "ORIGEM:")**: encolher para chip discreto acima do card, fonte mono mas em `text-foreground/50`, sem ocupar largura inteira.

---

### 2. `LeadFormProgressive` — ajustes pontuais

`src/components/site/LeadFormProgressive.tsx`:

- **Faixas de renda ampliadas** (público alvo tem renda alta). Substituir o select de renda por:
  - `ate_10` — Até R$ 10 mil
  - `10_20` — R$ 10–20 mil
  - `20_40` — R$ 20–40 mil
  - `40_80` — R$ 40–80 mil  *(novo)*
  - `80_150` — R$ 80–150 mil  *(novo)*
  - `150_mais` — Acima de R$ 150 mil  *(novo)*
- Atualizar `LABELS.renda` no mesmo arquivo para refletir as novas chaves. Não mexer em `scoring.ts` (ele tunable via admin); só estender `leadScoring.ts` (`rendaScore`) adicionando as 3 novas faixas com pesos crescentes (mantendo o teto em 25 para não distorcer o score existente).
- **Card mais legível**: aumentar font-size das perguntas ativas (`display-3`/24–28px) e dos inputs (16px base). Forçar cor `text-foreground` (não /90) nos valores colapsados.
- **Tela cheia vertical**: remover paddings horizontais grandes; o form recebe `w-full` e cresce naturalmente. Cada pergunta com `py-6` (mais ar). Barra de progresso fica **sticky no topo** do card, sempre visível.
- **Auto-advance** continua igual; **Enter** continua avançando inputs de texto.

---

### 3. Gating de qualificação (form condicional)

Critério de qualificação mínimo (heurística sóbria, executada só após o submit final):
- **Formação**: pelo menos `superior` (rejeita `sem_superior`).
- **Renda**: pelo menos `10_20` (rejeita `ate_10`).
- **Profissão**: qualquer uma listada conta; `outra` (sem qualificação declarada) rebaixa.

Implementação em `src/lib/leadQualification.ts` (novo arquivo, ~30 linhas):
```ts
export type QualResult = "qualificado" | "nao_qualificado";
export function evaluateQualification(d: LeadInput): {
  result: QualResult;
  reasons: string[];
};
```
Retorna `nao_qualificado` se: `formacao === "sem_superior"` OU `renda === "ate_10"` OU (`profissao === "outra"` E `renda` em `["ate_10","10_20"]`).

No `submit()` do `LeadFormProgressive`:
- Sempre persiste o lead (com `status: "novo"` igual hoje) — não descartamos contato, só roteamos a UX.
- Calcula `qualification` e passa via `onSubmitted({ id, qualification })`.
- Adiciona `qualification` e `qualification_reasons` ao objeto salvo em `leads` (campos novos, opcionais; admin já ignora extras).

No `/avaliacao`, `goToThanks` passa `qualification` como search param:
```ts
navigate({ to: "/avaliacao/obrigado", search: { ...search, q: result }, replace: true })
```

---

### 4. Reconstruir `/avaliacao/obrigado`

`src/routes/avaliacao.obrigado.tsx`:

- Aceita `?q=qualificado|nao_qualificado` (default `qualificado` para compat).
- **Layout**: mesma estética minimal vertical da nova `/avaliacao`. Header igual. `min-h-screen flex` centralizado.
- **Variante "qualificado"** (positivo, como hoje, mas refinada):
  - Selo gold com check, chip "PERFIL RECEBIDO".
  - `h1`: "Obrigado. Sua avaliação está em análise."
  - 3 cards de próximos passos (mantém os atuais 01/02/03).
  - CTA: "Conhecer o EB-2 NIW" → `/vistos/eb2-niw` + "Voltar ao site".
- **Variante "nao_qualificado"** (nova):
  - Selo neutro (ink), chip "PERFIL REGISTRADO".
  - `h1`: "Recebemos seu perfil — vamos guardar seu contato."
  - Parágrafo honesto: "Pelo que você compartilhou, hoje o seu perfil ainda não atende a todos os critérios mínimos para os vistos EB-2 NIW / EB-1. Isso pode mudar conforme sua carreira evolui."
  - Bloco "Enquanto isso, conheça o caminho" com 2 cards:
    1. **Guia EB-2 NIW** → `/vistos/eb2-niw` (entender requisitos).
    2. **Artigos do nosso blog** → `/blog` (estudar e se preparar).
  - Nota fina: "Se quiser conversar mesmo assim, escreva para [email]."
- Tracking: `trackLead()` dispara nos dois casos (lead foi capturado), mas com `qualification` como custom param.

---

### 5. Validação

- `tsgo --noEmit` deve passar.
- Playwright contra `localhost:8080/avaliacao`: preencher fluxo qualificado → ver obrigado positivo; preencher fluxo com renda `ate_10` + formacao `sem_superior` → ver obrigado "nao_qualificado". Screenshot dos dois desfechos.
- Verificar admin `/admin/leads` continua listando ambos (campos `qualification` extras não quebram render).

---

## Detalhes técnicos

- **Não mexer**: `dataStore.ts`, `scoring.ts` (admin), `abEngine.ts`, `origin.ts`, rotas `/admin/*`, `tracking.ts`.
- **Novo arquivo**: `src/lib/leadQualification.ts`.
- **Editados**: `src/routes/avaliacao.tsx`, `src/routes/avaliacao.obrigado.tsx`, `src/components/site/LeadFormProgressive.tsx`, `src/lib/leadScoring.ts` (só extensão de `rendaScore`).
- Faixas novas em `rendaScore`: `40_80: 25`, `80_150: 25`, `150_mais: 25` (mantém teto; modelo admin tunável fica intacto porque lê do dataStore).
- A gating é puramente UI/roteamento. Lead nunca é descartado — sempre vai para `leads` e fica visível no admin com a flag `qualification` para o time decidir como tratar.

## Fora do escopo

- Mudanças no admin (tag de qualificação aparece como campo cru; UI dedicada fica para outro turno se pedido).
- Mudanças no formulário inline da Home (continua linkando para `/avaliacao`).
- Novos eventos de pixel além de `trackLead` já existente.
