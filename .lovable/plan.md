## Objetivo
Criar uma segunda versão da página de análise em `/avaliacao/whatsapp` que, ao enviar o formulário, redireciona direto para o WhatsApp com uma mensagem pré-preenchida contendo as respostas — sem passar pelas páginas de obrigado.

## Escopo
- Nova rota: `src/routes/avaliacao.whatsapp.tsx`
- Reaproveita o mesmo formulário e perguntas de `/avaliacao` (Nome, Email, Telefone, Renda, Escolaridade, Profissão, etc.), mantendo o mesmo layout vertical em `bg-ink` com alto contraste.
- Mantém o cálculo de score e salva o lead no backend normalmente (mesma persistência de `/avaliacao`), com `channel: "avaliacao-whatsapp"` para diferenciar a origem.
- Dispara os mesmos eventos de tracking (`form_start`, `form_submit`, `Lead`) já usados hoje.
- Não usa a lógica de qualificado/não-qualificado nem redireciona para páginas de obrigado.

## Comportamento do envio
Ao clicar em "Enviar":
1. Valida campos, calcula score, salva o lead.
2. Dispara `trackFormSubmit` + `Lead`.
3. Monta a mensagem WhatsApp com as respostas do formulário.
4. Abre `https://wa.me/<NUMERO>?text=<mensagem-encoded>` em nova aba (`window.open`, `target=_blank`).
5. Exibe um estado de confirmação simples na própria página ("Abrimos o WhatsApp em uma nova aba…") com botão de fallback caso o popup seja bloqueado.

## Formato da mensagem WhatsApp
Texto em português, quebras de linha via `%0A`, exemplo:
```
Olá! Acabei de preencher a análise no site.

Nome: {nome}
Email: {email}
Telefone: {telefone}
Renda: {renda}
Escolaridade: {escolaridade}
Profissão: {profissao}
Área de interesse: {visto}

Pontuação: {score}/100
```

## Número do WhatsApp
Usar o mesmo número já configurado no site (o mesmo que era usado antes da remoção global dos botões WhatsApp — em `siteContent` / contato). Se não existir mais, ler de `site_content` com fallback para o número institucional exibido em `/contato`.

## Detalhes técnicos
- Arquivo: `src/routes/avaliacao.whatsapp.tsx` com `createFileRoute("/avaliacao/whatsapp")`.
- Componente derivado de `LeadFormProgressive` (ou wrapper que injeta um `onSubmit` customizado). Preferência: adicionar prop opcional `mode: "default" | "whatsapp"` em `LeadFormProgressive` para não duplicar lógica; no modo `whatsapp` ele salva o lead e retorna os dados via callback em vez de navegar para `/avaliacao/obrigado-*`.
- `head()` próprio com title/description específicos e `robots: noindex` (rota de campanha, não canônica).
- Sem botão WhatsApp fixo/global — apenas o CTA final desta página abre o WhatsApp (respeita a decisão anterior de remover botões WhatsApp das outras páginas).

## Fora do escopo
- Nenhuma alteração em `/avaliacao` atual, nas páginas de obrigado, ou em outras rotas.
- Sem novos campos no formulário.
- Sem mudança no modelo de scoring.
