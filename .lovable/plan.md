
# Correções na LP /avaliacao + Funil de leads incompletos

Três mudanças coordenadas, sem mexer em scoring/A/B/tracking existentes.

## 1) Rastrear origem do lead (UTM + página interna)

Hoje só capturamos `utm_*` no submit. Vamos adicionar uma camada de **referrer interno** sticky para saber **de qual página do site** o usuário chegou ao `/avaliacao`.

- Novo helper `src/lib/origin.ts`:
  - `captureInternalReferrer()` — ao montar `/avaliacao`, lê `document.referrer` e a página anterior salva em `sessionStorage` (atualizada num listener global no `__root.tsx` a cada navegação). Salva em `sessionStorage` como `sna_origin` `{ from_path, from_title, referrer, landing_path, landing_ts }`.
  - `getOrigin()` — devolve o snapshot para gravar junto do lead/parcial.
- `LeadForm` passa a persistir, junto do lead final, um campo `origin` com `{ utm, internal: { from_path, from_title, referrer, landing_path } }`.
- A LP `/avaliacao` mostra um **chip discreto no topo do formulário** indicando a origem detectada (ex: *"Você veio de: /vistos/eb-2-niw · campanha: meta-medicos"*) — útil tanto para confiança visual quanto para QA. Estilo sutil, mono-label dourado.

## 2) Form como Typeform progressivo (uma pergunta por vez, próximas se revelam)

Substituir o stepper de 3 telas por um **scroll progressivo** em pergunta única, com as seguintes propriedades:

- Layout vertical: cada pergunta ocupa um bloco grande, com label tipográfica (Bodoni Moda) e input/select abaixo. Só a pergunta atual é "ativa"; as próximas só aparecem (fade+slide com framer-motion) quando a anterior tem valor válido.
- Avanço: `Enter` ou botão "Continuar →" passa o foco para a próxima pergunta e faz scroll suave até ela. Respostas anteriores ficam visíveis e editáveis (clicando voltam ao modo "ativo").
- Barra de progresso fina no topo (% de campos preenchidos sobre o total).
- Ordem das perguntas: nome → email → whatsapp → profissão → formação → faixa etária → cidade/UF → renda → momento. Último bloco mostra um resumo e o botão final "Enviar para análise".
- Coluna esquerda (headline + microprova) some em telas pequenas e o form ocupa a largura cheia para imersão.
- **Salvamento incremental (chave para o item 3)**: a cada campo válido, faz `set("leads_partial", partialId, { ... })` no `dataStore`. `partialId` é gerado uma única vez por sessão (`sessionStorage.sna_partial_id`). Quando o submit final ocorre com sucesso, remove o registro parcial e grava o lead completo em `leads`.

Componente novo: `src/components/site/LeadFormProgressive.tsx`. O `LeadForm` atual continua existindo para retrocompatibilidade (LPs por segmento), mas `/avaliacao` passa a usar o progressivo.

## 3) Admin: categoria "Leads incompletos" + funil de abandono

Nova rota `src/routes/admin.leads-incompletos.tsx` e item no sidebar do admin entre "Leads" e "Pontuação".

- **Lista**: tabela com `created_at`, `last_update`, último campo preenchido, % concluído, nome/email/whats (se já preenchidos), origem (utm + página interna). Ordenação por mais recente.
- **Funil de abandono**: gráfico de barras horizontais (com `recharts` que já está no projeto) mostrando quantos leads pararam em cada campo da sequência — `nome → email → whatsapp → profissão → … → momento → completou`. Calculado a partir de `leads_partial` + `leads` agrupados.
- **Detalhe do lead parcial**: drawer com todos os campos preenchidos, origem completa e botão "Copiar WhatsApp" se já existir, para rescue manual.
- **Limpeza**: registros parciais com mais de 30 dias são purgados ao abrir a tela (manutenção leve).
- **KPI no Dashboard**: card "Leads incompletos (últimos 7d)" + "Taxa de conclusão" (completos / (completos + parciais)).

## Detalhes técnicos

- Sem mudanças em: scoring (`scoring.ts`), A/B (`abEngine.ts`), tracking (`tracking.ts` — eventos `ViewContent`/`Lead` permanecem; opcionalmente disparamos `FormStep` por etapa, sem PII).
- `dataStore` ganha o "collection" `leads_partial`; mesma API `set/get/list/remove` já existente.
- `origin.ts` é puro client (lê `sessionStorage`/`document.referrer`); o listener global vai num `useEffect` em `__root.tsx` que atualiza `sna_last_path` a cada mudança de rota.
- Validação por campo é a mesma já existente, só fatiada por pergunta.

## Arquivos afetados

```text
NOVO  src/lib/origin.ts
NOVO  src/components/site/LeadFormProgressive.tsx
NOVO  src/routes/admin.leads-incompletos.tsx
EDIT  src/routes/__root.tsx                 (listener de last_path)
EDIT  src/routes/avaliacao.tsx              (usa LeadFormProgressive + chip de origem)
EDIT  src/lib/dataStore.ts                  (apenas se faltar tipagem p/ leads_partial)
EDIT  src/routes/admin.tsx                  (item no sidebar)
EDIT  src/routes/admin.index.tsx            (cards de KPI)
```

Posso seguir e implementar?
