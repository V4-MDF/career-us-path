## Objetivo
Separar a página de obrigado em duas URLs distintas para que o Pixel (Meta) e GA4 possam disparar conversões diferentes para leads qualificados vs. não qualificados.

## Mudanças

1. **`src/routes/avaliacao.obrigado-qualificado.tsx`**
   - Remover o redirect. Renderizar `<ObrigadoQualificado />` diretamente.
   - `head()` com título "Obrigado | Status na América" e `robots: noindex,nofollow`.
   - No mount: disparar evento de tracking `lead_qualificado` (GA4 + Meta `Lead` custom).

2. **`src/routes/avaliacao.obrigado-nao-qualificado.tsx`**
   - Remover o redirect. Renderizar `<ObrigadoNaoQualificado />` diretamente.
   - `head()` idem, `noindex,nofollow`.
   - No mount: disparar evento `lead_nao_qualificado`.

3. **`src/routes/avaliacao.obrigado.tsx`**
   - Converter em roteador de compatibilidade: lê `readQualificationResult()` do sessionStorage e faz `navigate({ to: "/avaliacao/obrigado-qualificado" | "/avaliacao/obrigado-nao-qualificado", replace: true })`. Fallback → não-qualificado.
   - Mantém acesso direto legado funcionando.

4. **`src/components/site/LeadFormProgressive.tsx`**
   - No submit bem-sucedido, após salvar `lastQualificationResult` em sessionStorage, redirecionar já para a URL específica (`/avaliacao/obrigado-qualificado` se score ≥ 50, senão `/avaliacao/obrigado-nao-qualificado`), em vez de `/avaliacao/obrigado`. Isso garante que o Pixel veja PageView na URL correta.

5. **`src/lib/tracking.ts`** (se necessário)
   - Adicionar helpers `trackLeadQualified()` e `trackLeadUnqualified()` para GA4 + Meta.

## Fora de escopo
- Não altero conteúdo visual das duas variantes (`ObrigadoQualificado` / `ObrigadoNaoQualificado`) — já existem em `ObrigadoContent.tsx`.
- Não mexo em outros formulários (pré-qualificação/contato).