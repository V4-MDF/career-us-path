## Objetivo

Reverter a "Correção 4" (formulário curto + etapa de aprofundamento opcional) e voltar ao formulário único completo em `/avaliacao`.

## Mudanças

1. **Deletar** `src/routes/avaliacao.completar.tsx`.
2. **`src/routes/avaliacao.index.tsx`**: remover a prop `fields={["nome","whatsapp","email","profissao","renda"]}` do `LeadFormProgressive` para voltar ao conjunto completo padrão (nome, whatsapp, email, profissão, renda, formação, faixa etária, cidade/UF, momento). Ajustar o subtítulo de "Cinco perguntas rápidas…" para o texto original ("Nossa equipe analisa e responde em até 48h.").
3. **`src/components/site/LeadFormProgressive.tsx`**:
   - Remover o modo de enriquecimento (props `enrichLeadId`, `fields`, `submitLabel`, `onSubmitted`) — voltar ao comportamento anterior de criar/atualizar o lead com o conjunto fixo de campos.
   - Remover a gravação de `sna_last_lead_id` em `sessionStorage/localStorage` (usada só pela etapa de aprofundamento).
   - Manter intactos: tracking (`trackFormView`/`trackLead`), UTMs, segmento, variante A/B, scoring, `leads_partial`, sessões e o redirect para `/avaliacao/obrigado-qualificado` vs `/avaliacao/obrigado-nao-qualificado`.
4. **`src/routes/avaliacao.obrigado-qualificado.tsx`** e **`avaliacao.obrigado-nao-qualificado.tsx`**: remover o CTA "Complete seu perfil" que aponta para `/avaliacao/completar`.
5. Rodar typecheck para garantir que nenhuma referência a `/avaliacao/completar` ou às props removidas ficou pendente (o `routeTree.gen.ts` é regenerado automaticamente).

## Preservado

Rotas, tracking (FormView/Lead), UTMs, A/B, scoring (com renda peso 35), páginas de obrigado qualificado/não-qualificado e funil de leads incompletos continuam iguais.
