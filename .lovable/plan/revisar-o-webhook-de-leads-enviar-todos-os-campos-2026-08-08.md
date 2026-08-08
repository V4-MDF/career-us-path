# Revisar o webhook de leads: enviar todos os campos

O webhook hoje envia o objeto do lead como ele é gravado no banco. Verificado no código: alguns dados importantes não chegam ao destino.

## O que está faltando hoje

- **Score não é enviado.** O score é calculado no envio, mas só a qualificação (`qualificado` / `nao_qualificado`) entra no objeto do lead. O número em si é descartado.
- **Valores em código interno.** Campos de escolha vão como `20_40`, `50_mais`, `ja_decidi`, `outra_qualificada` — sem o texto legível ("R$ 20 a 40 mil", "Já decidi", etc.). Em Zapier/Make/planilha isso aparece ilegível.
- **Campos vazios sem explicação.** `cidade` e `uf` existem na estrutura do lead mas não são perguntados no formulário atual, então sempre vão em branco.
- **UTM/origem aninhados.** `utm` e `origin` vão como objetos; muitas ferramentas de automação não leem subníveis. Faltam campos planos como `utm_source`, `utm_campaign`, `landing_page` e `referrer`.
- **O formulário legado não dispara webhook.** `LeadForm.tsx` grava o lead mas não chama o webhook. As rotas atuais (`/avaliacao`, `/avaliacao/whatsapp`, home) usam o formulário progressivo, então na prática não perde lead hoje — mas fica inconsistente.

## O que passa a ser enviado

Payload plano e completo, com `event: "lead.created"`:

- Identificação: `id`, `created_at`, `nome`, `email`, `whatsapp` (mascarado e também só dígitos em `whatsapp_e164`)
- Respostas: `objetivo_visto`, `profissao`, `formacao`, `faixa_etaria`, `renda`, `momento` — cada uma com **valor bruto** e **rótulo legível** (`renda` + `renda_label`)
- Avaliação: `score`, `qualification`, `qualification_reasons`
- Origem: `segmento`, `variante_ab`, `landing_page`, `referrer`, `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`
- `lead_raw`: o objeto completo original, para quem quiser tudo sem depender do formato plano

O botão "Testar webhook" no admin passa a enviar um exemplo com exatamente esse mesmo formato, para você conferir o mapeamento antes de ir ao ar.

## Detalhes técnicos

1. `src/components/site/LeadFormProgressive.tsx`: incluir `score: leadScore` no objeto `lead` antes de `set("leads", id, lead)` (também melhora o admin, que hoje recalcula).
2. Novo `src/lib/leadWebhookPayload.ts`: `buildLeadWebhookPayload(lead)` que achata `utm`/`origin`, adiciona os `*_label` a partir dos mesmos dicionários de opções usados no formulário, e normaliza `whatsapp`. Os rótulos ficam num mapa único exportado para não duplicar strings.
3. `src/lib/leadWebhook.ts`: `sendLeadWebhook` passa a enviar `buildLeadWebhookPayload(lead)`; `testLeadWebhook` usa a mesma função com um lead de exemplo completo.
4. `src/components/site/LeadForm.tsx`: chamar `void sendLeadWebhook(lead)` após `set("leads", id, lead)`, em fire-and-forget, para paridade.
5. `src/routes/api/public/lead-webhook.ts`: sem mudança de contrato; apenas confirmar que o schema aceita o payload plano (`z.record` já aceita).
6. Texto explicativo do cartão em `admin.tracking.tsx` atualizado para listar os campos enviados.
