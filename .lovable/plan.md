# Plano: botão de WhatsApp na página de obrigado dos qualificados

## Contexto

A página `/avaliacao/obrigado` já renderiza a versão `ObrigadoQualificado` quando o resultado salvo no `sessionStorage` é `qualificado`. Hoje o componente tenta abrir o WhatsApp automaticamente e só exibe um botão de fallback caso o navegador bloqueie o popup. O pedido é tornar o botão de WhatsApp um CTA visível e sempre presente para leads qualificados.

## O que será feito

1. **Promover o botão de WhatsApp a CTA principal** no `ObrigadoQualificado` (`src/components/site/ObrigadoContent.tsx`):
   - Botão de WhatsApp visível imediatamente após o título/subtítulo, independente de popup ter sido bloqueado.
   - Manter o comportamento de abrir o WhatsApp automaticamente após 400 ms (se houver dados do lead), mas sem esconder o botão principal.
   - Texto do botão: "Conversar no WhatsApp" ou similar, com ícone `MessageCircle`.

2. **Garantir que o botão funcione mesmo sem dados de lead no sessionStorage**:
   - Se `lastQualifiedLead` existir, usar a mensagem personalizada `leadWhatsAppMessage`.
   - Se não existir, usar `buildWhatsAppLink` com uma mensagem genérica do tipo "Olá! Acabei de enviar meu perfil para análise no site da Status na América. Gostaria de conversar sobre os próximos passos.".

3. **Ajustar layout e prioridade visual**:
   - WhatsApp como botão primário (`variant="default"` / classe `btn-primary` do design system).
   - Redes sociais e "Voltar ao site" como ações secundárias abaixo.
   - Manter o card de explicação "Seu navegador bloqueou a abertura automática..." apenas quando o popup for bloqueado, mas o botão principal já estará visível antes disso.

4. **Revisar salvamento dos dados do lead**:
   - Verificar `src/components/site/LeadFormProgressive.tsx` para confirmar que `lastQualifiedLead` continua sendo salvo com os campos esperados antes do redirecionamento para `/avaliacao/obrigado`.
   - Não alterar o fluxo de qualificação (threshold 50 pontos) nem a lógica de salvamento do lead no backend.

## Arquivos envolvidos

- `src/components/site/ObrigadoContent.tsx` — alteração principal.
- `src/components/site/LeadFormProgressive.tsx` — verificação/ajuste do salvamento de `lastQualifiedLead`.
- `src/lib/whatsapp.ts` — possível extração da mensagem genérica de fallback (se necessário).

## Fora do escopo

- Não alterar a página de não-qualificados (`ObrigadoNaoQualificado`).
- Não mudar rotas, tracking, A/B, scoring ou backend de leads.
- Não alterar o design system (tokens, cores, fontes).