# Sessões, Conversão e Qualidade em /admin/origens

Hoje a aba só conta leads (completos + parciais). O usuário pediu três métricas novas baseadas em **sessões** (visitantes do site, não só quem abriu o formulário).

## 1. Rastrear sessões no site

Criar `src/lib/sessions.ts`:
- `ensureSession()` — gera um `session_id` (UUID) em `sessionStorage` na primeira pageview da aba. Persiste 1 registro em `dataStore["sessions"]` com:
  - `id`, `createdAt`
  - `origin: LeadOrigin` (captura UTM + referrer + landing_path no mesmo padrão de `origin.ts`)
  - `converted: false` (atualizado depois)
  - `qualified: false`
- Chamado uma vez no `__root.tsx` (mesmo ponto onde já chamamos o tracker de origem).

Atualizar `LeadFormProgressive.tsx`:
- Ao salvar parcial → marcar `converted_partial=true` na sessão atual.
- Ao concluir lead → marcar `converted=true` e `qualified` (usando `leadQualification` + score ≥ 70 do modelo ao vivo).
- Vincular `session_id` no lead salvo (`leads` e `leads_partial`) para evitar dupla contagem.

## 2. Estender /admin/origens

Em `src/routes/admin.origens.tsx`:

**Novos StatCards (topo, substituem layout atual de 4):**
- Sessões (total)
- Leads iniciados / Conversão sessão→lead (%)
- Leads completos / Conversão lead→completo (%)
- Qualificados / Taxa de qualidade sobre sessões (%)

**Tabela "Comparativo por dimensão" — novas colunas:**
| Dim | Sessões | Iniciados | Completos | Conv. sessão→lead | Conv. lead→completo | Qualificados | Taxa qualidade | Score médio |

Agrupamento das sessões pelo mesmo `bucketValue(dim, session.origin)` já existente.

**Definição de "qualificado":** lead completo com `qualified === true` (critérios de `leadQualification.ts`) **ou** `score ≥ 70` no modelo ativo — o que for mais permissivo. Documentar no header da seção.

## 3. Detalhes técnicos
- Nova coleção `dataStore["sessions"]` — sem migração; vazia até o primeiro acesso.
- Sessões antigas (pré-deploy) ficam como "não rastreadas"; a aba mostra aviso quando `sessions.length < leads.length` indicando que o histórico de sessões começa a partir do deploy.
- Export CSV passa a incluir as novas colunas.
- Zero mudança visual no resto do admin; só essa rota e o hook no `__root`.

## Arquivos tocados
- `src/lib/sessions.ts` (novo)
- `src/routes/__root.tsx` (chamar `ensureSession`)
- `src/components/site/LeadFormProgressive.tsx` (marcar conversão/qualificação na sessão)
- `src/routes/admin.origens.tsx` (KPIs + colunas + CSV)
