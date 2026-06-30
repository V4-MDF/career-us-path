## Objetivo

Criar uma **segunda jornada de captação** — um teste de pré-qualificação estruturado (baseado no questionário Jotform enviado) que devolve **imediatamente um veredito**: se o lead se qualifica e qual visto EB/O é o melhor caminho. Para qualificados, gerar um **link público da resposta** e oferecer um botão de WhatsApp que abre a conversa já com esse link colado.

A página `/avaliacao` atual (formulário curto, progressivo) permanece intacta. Esta é uma jornada paralela, mais densa, para leads dispostos a entregar um perfil profissional completo.

---

## Entregáveis

### 1. Nova rota pública `/pre-qualificacao`
- Layout vertical, em **seções dobráveis numeradas** (não 1 pergunta por tela como o Typeform — o público desta página quer ver o tamanho do compromisso).
- Seções fiéis ao PDF Jotform: Dados pessoais · Formação acadêmica · Experiência profissional · Reconhecimento & conquistas · Contribuições & impacto · Mídia · Propostas/planos nos EUA · Observações finais.
- Campos com tipos certos: texto curto, textarea, data (mês/ano), select (nível de formação), boolean (Sim/Não) com follow-up condicional, anos de experiência (slider/number).
- **Sem upload de arquivos nesta primeira versão** (substituído por campos "Link para currículo/portfolio (Drive, LinkedIn, etc.)" — anexos exigiriam Cloud, fora do escopo atual).
- Validação Zod por seção; barra de progresso no topo; salvamento incremental em `leads_partial` (mesma mecânica de `LeadFormProgressive` — recuperação ao revisitar).
- Captura origem/UTMs via `origin.ts` e marca sessão em `sessions.ts`.

### 2. Motor de qualificação `src/lib/visaQualifier.ts`
Avalia as respostas contra critérios de **EB-1A**, **EB-2 NIW**, **O-1** e **EB-3** e retorna:
- `qualified: boolean` (atingiu pelo menos um visto)
- `best: { visa, score, reasoning[] }` — recomendação principal
- `alternatives: [...]` — outros vistos possíveis em ordem decrescente
- `gaps: string[]` — o que falta para destravar opções mais fortes
- `summary: string` — parágrafo humano pronto para WhatsApp/relatório

**Critérios resumidos** (números podem ser tunados depois pelo admin, como já fizemos com scoring):
- **EB-1A**: prêmios nacionais/internacionais, publicações, atuou como juiz/avaliador, mídia relevante, associações seletivas, cargo executivo, impacto original. Precisa de ≥ 3 fortes.
- **O-1**: igual ao EB-1A mas tolera evidências menos cumulativas + oferta/contrato nos EUA (campo do form).
- **EB-2 NIW**: mestrado/doutorado OU bacharelado + ≥ 5 anos exp + interesse declarado em NIW + impacto descrito.
- **EB-3**: bacharelado + experiência + oferta de emprego nos EUA.

### 3. Página de resultado dentro do mesmo fluxo
- Renderizada imediatamente após submeter, sem mudar de rota (`/pre-qualificacao#resultado`).
- **Caso qualificado**: card destacado com o visto recomendado, justificativa em bullets, vistos alternativos, próximos passos. CTA primário **WhatsApp** + CTA secundário "Ver minha resposta completa".
- **Caso não qualificado** (ainda): texto acolhedor (manual de copy), bullets dos gaps, CTA para `/avaliacao` (formulário curto) e para o Blog. Sem botão de WhatsApp.

### 4. Página pública da resposta `/pre-qualificacao/r/$token`
- Token opaco de 24 chars gerado na submissão (`crypto.getRandomValues`), persistido em `dataStore["prequal_responses"][token]`.
- Renderiza, em formato de **dossiê read-only**, todos os campos preenchidos + o veredito + a recomendação.
- `<meta name="robots" content="noindex,nofollow">` — link compartilhável mas não indexável.
- Acessível por qualquer pessoa com o link (caso de uso: lead manda ao consultor pelo WhatsApp).

### 5. Botão WhatsApp inteligente
- Número de destino configurável em `dataStore["settings"]["whatsapp_number"]` (editado em `/admin/configuracoes`, padrão: o número do Jotform `+1 321 247 5925`).
- Mensagem pré-preenchida:
  > "Olá, sou *{nome}*. Fiz a pré-qualificação no site e o resultado indicou o visto *{visto}*. Segue minha resposta completa: {link público}"
- `https://wa.me/<num>?text=<encoded>` aberto em nova aba.
- Cada clique incrementa contador `whatsapp_clicks` na resposta — vira métrica no admin.

### 6. Admin `/admin/pre-qualificacao`
Lista todas as submissões com:
- Nome, e-mail, telefone, data
- Veredito (qualificado / não), visto recomendado, score
- Origem / UTM (igual ao módulo de Leads)
- Cliques no WhatsApp
- Link "Abrir resposta pública" + botão "Copiar link"
- Export CSV
- Filtros: por visto recomendado, qualificado sim/não, período

Também adicionar **card de KPIs no Dashboard**: total de pré-qualificações, % qualificadas, distribuição por visto recomendado.

### 7. Pontos de entrada no site
- Item novo no **menu Header**: "Teste de qualificação" (ou inserir como filho do dropdown Vistos).
- CTA no fim das **páginas-pilar de vistos** (`/vistos/eb-2-niw`, `/vistos/eb-1`, `/vistos/eb-3`): "Faça o teste estruturado".
- Card adicional na dobra `avaliacao-gratuita` da Home oferecendo as duas vias: "Avaliação rápida (3 min)" vs "Pré-qualificação completa (10 min)".

### 8. Conteúdo editável
Todos os textos (cabeçalho da página, intro de cada seção, mensagens de veredito, copy do WhatsApp) lidos via `siteContent.ts` com fallback no código — gerenciáveis em `/admin/conteudo` na nova aba "Pré-qualificação".

---

## Detalhes técnicos

```text
src/
  routes/
    pre-qualificacao.tsx               (form + resultado inline)
    pre-qualificacao.r.$token.tsx      (dossiê público read-only)
    admin.pre-qualificacao.tsx         (CRUD/listagem)
  components/site/prequal/
    PreQualForm.tsx                    (form em seções dobráveis)
    PreQualResult.tsx                  (card de veredito + WhatsApp)
    PreQualDossier.tsx                 (renderização read-only)
    PreQualSections/*.tsx              (uma por seção do PDF)
  lib/
    visaQualifier.ts                   (motor de scoring por visto + recomendação)
    prequal.ts                         (load/save em dataStore, geração de token, contador whatsapp)
    whatsapp.ts                        (helper para montar URL wa.me)
```

**Persistência** (localStorage via `dataStore`, mantendo o padrão atual do site):
- `prequal_responses[token]` = `{ token, createdAt, contact, answers, verdict, origin, sessionId, whatsappClicks }`
- `leads_partial[sessionId]` reaproveitado para autosave durante o preenchimento.
- Submissão também grava um registro em `leads` (compatível com o módulo de Leads existente) marcando `source: "pre-qualificacao"` e copiando o score do veredito.

**Tracking**: ao submeter qualificado, marcar sessão como `qualified=true` (mesma função de `sessions.ts`).

**Acessibilidade**: cada seção é um `<details>` semântico, com `aria-expanded`, foco visível, navegação por teclado, e respeito a `prefers-reduced-motion` (sem animações de transição entre seções).

**Reordenação**: a nova rota também será adicionada a `pageStructure.ts` para ficar disponível no módulo `/admin/estrutura` quando expandirmos páginas além da Home.

---

## Fora de escopo (próximos passos)
- Upload real de currículo/certificados (precisa de Lovable Cloud + Storage).
- Envio automático por e-mail da resposta (precisa de Cloud + Resend).
- Notificação ao consultor por WhatsApp (precisa de connector GatewayAPI/Twilio).

Se quiser que qualquer um destes entre já neste ciclo, é só dizer e eu adapto antes de implementar.