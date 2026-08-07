# Campo de Webhook para envio de leads

Adicionar um campo de URL de webhook no Admin › Tracking. Quando ativo, cada lead novo do formulário é enviado para essa URL em formato JSON.

## O que o usuário verá

- Novo cartão em **Admin › Tracking**: "Webhook de Leads", com switch Ativo/Inativo e campo de URL (`https://hooks.zapier.com/...`).
- Texto explicativo curto: o que é enviado e quando.
- Botão "Testar webhook" que envia um lead de exemplo e mostra sucesso/erro via toast.
- Salva junto com os demais códigos no botão "Salvar" existente.

## Comportamento

- Disparo no momento em que o lead é gravado com sucesso (formulário completo em `/avaliacao`, `/avaliacao/whatsapp` e as demais variantes que usam o mesmo formulário).
- Envio não bloqueia o usuário: se o webhook falhar, o lead já está salvo e o visitante segue para a página de obrigado normalmente. Falhas ficam apenas no log.
- Sem token/segredo (conforme definido): apenas a URL.

## Detalhes técnicos

1. `src/lib/admin/settings.ts`: adicionar `webhook_url: string` e `webhook_enabled: boolean` a `TrackingSettings` e `defaultTracking`.
2. `src/routes/admin.tracking.tsx`: adicionar o cartão do webhook (fora da lista genérica `items`, por causa do botão de teste) com switch, input de URL e validação simples de `https://`.
3. Novo `src/lib/leadWebhook.ts` com `sendLeadWebhook(lead)`: lê `getTrackingSettings()`, e se ativo faz `POST` JSON. Como a URL é externa, o envio é feito por um endpoint próprio do app para evitar bloqueio de CORS do destino:
   - Novo server route `src/routes/api/public/lead-webhook.ts` (POST) que valida o corpo com Zod (`url` + `payload`), exige que a URL seja `https://`, e repassa o POST ao destino. Retorna status do destino. Sem PII adicional além do próprio lead enviado pelo formulário.
4. `src/components/site/LeadFormProgressive.tsx`: depois do `set("leads", id, lead)` bem-sucedido, chamar `void sendLeadWebhook(lead)` em fire-and-forget dentro de try/catch.
5. Payload enviado: campos do lead (nome, contato, respostas, score, qualificação), `source`/rota de origem, `created_at` e `id`.
