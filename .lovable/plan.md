## Objetivo
Após um lead qualificado enviar o formulário geral (`/avaliacao`) e ser salvo no painel, mostrar a página de obrigado-qualificado e abrir automaticamente o WhatsApp com uma mensagem pré-preenchida contendo os dados do lead. Não qualificados continuam com o fluxo atual (sem WhatsApp).

## Mudanças

**1. `src/lib/whatsapp.ts`**
- Adicionar helper `leadWhatsAppMessage(lead)` que monta uma mensagem parecida com a da pré-qualificação: nome, e-mail, WhatsApp, profissão, renda, formação, timing, score, origem/UTM.

**2. `src/routes/avaliacao.index.tsx`**
- Ao salvar o lead qualificado, além de navegar para `/avaliacao/obrigado-qualificado`, passar os dados via `search` params (ou salvar temporariamente em `sessionStorage` com chave `lastQualifiedLead`) para a página de obrigado montar a mensagem.
- Preferência: `sessionStorage` (evita URLs longas com dados pessoais).

**3. `src/routes/avaliacao.obrigado-qualificado.tsx`**
- Ler `lastQualifiedLead` do sessionStorage no mount.
- Chamar `buildWhatsAppLink(leadWhatsAppMessage(lead))` (usa `whatsapp_br` das Configurações).
- Auto-abrir em nova aba via `window.open(href, "_blank")` uma única vez (dentro de `useEffect`, com guarda para não reabrir em re-render / StrictMode).
- Adicionar bloco visível de fallback: botão gold "Abrir WhatsApp agora" + texto "Se a janela não abrir automaticamente, clique no botão." Manter o botão "Conheça nossas redes sociais" já existente.
- Limpar `sessionStorage` após uso.

**4. Bloqueio de popup**
- Muitos navegadores bloqueiam `window.open` sem interação. Mitigar com:
  - Delay pequeno + `noopener,noreferrer`.
  - Se `window.open` retornar `null`, exibir aviso discreto acima do botão ("Seu navegador bloqueou a abertura automática — clique no botão abaixo").

## Fora de escopo
- Página de não qualificado permanece igual.
- Pré-qualificação (`/pre-qualificacao`) já tem seu próprio fluxo de WhatsApp — não mexer.
- Nenhuma mudança em schema/DB — o lead continua sendo salvo como hoje antes do redirect.
