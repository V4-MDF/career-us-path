Implementar eventos de tracking "form iniciado" e "form enviado" nos formulários do site, padronizando GA4/Meta e sem quebrar os eventos existentes.

### O que será feito

1. **Expandir `src/lib/tracking.ts`**
   - Adicionar `trackFormStart(meta?)`:
     - GA4: `form_start` (com `form_name`)
     - Meta: `trackCustom("FormStart")` (com `content_name`)
   - Adicionar `trackFormSubmit(meta?)`:
     - GA4: `form_submit` (com `form_name`)
     - Meta: `trackCustom("FormSubmit")` (com `content_name`)
   - Manter `trackFormView` e `trackLead` intactos (não alteram funil de remarketing atual).

2. **Wire nos formulários principais**
   - **`LeadFormProgressive.tsx`** (análise /avaliacao):
     - `form_start` → na primeira interação real do usuário (primeira vez que um campo passa a ser válido e salva parcial).
     - `form_submit` → no clique do botão de enviar, imediatamente antes do processamento/submit.
   - **`PreQualForm.tsx`** (/pre-qualificacao):
     - `form_start` → no primeiro campo de contato preenchido/editado.
     - `form_submit` → no `handleSubmit`.
   - **`LeadForm.tsx`** (formulário legacy de LPs, se ainda usado em algum lugar):
     - `form_start` e `form_submit` nos momentos equivalentes.
   - **`/routes/contato.tsx`** (formulário de mensagem):
     - Substituir o push manual ao `dataLayer` por `trackFormSubmit({ form_name: "contato" })`.
     - Adicionar `trackFormStart({ form_name: "contato" })` na primeira mudança de campo.

3. **Evitar duplicidade e ruído**
   - Cada evento dispara apenas uma vez por sessão de exibição do formulário (use ref/flag booleano).
   - `form_start` dispara quando o usuário realmente começa a digitar/selecionar, não no mount.
   - `form_submit` dispara no botão, independentemente de sucesso/falha de validação (o evento é sobre intenção de envio); se houver erro de validação, ainda assim conta como submit attempt.

4. **Teste/validação**
   - Build (`bun run build`) passa.
   - Verificar no console do preview que, ao preencher o form, `form_start` e `form_submit` aparecem no `dataLayer`/gtag/fbq (quando tracking estiver ativo).

### Technical details
- Arquivos alterados: `src/lib/tracking.ts`, `src/components/site/LeadFormProgressive.tsx`, `src/components/site/prequal/PreQualForm.tsx`, `src/components/site/LeadForm.tsx`, `src/routes/contato.tsx`.
- Sem alterações no backend/data layer.
- Sem novas dependências.