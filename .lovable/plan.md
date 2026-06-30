## Problema

O usuário clica em "Enviar para análise" em `/avaliacao` e nada acontece — sem redirect. A rota `/avaliacao/obrigado` existe e está corretamente wired no `LeadFormProgressive.submit()` (chama `onSubmitted` → `goToThanks` → `navigate({to:"/avaliacao/obrigado"})`), mas a navegação falha silenciosamente em produção/preview.

Sinais coletados no session replay e console:
- `System Error (Vite error overlay displayed)` aparece logo após a interação na home.
- Hydration mismatch nos links de `/avaliacao` (server renderiza `/avaliacao`, cliente renderiza `/avaliacao?src=...`). Indica que os hrefs/UTMs são construídos com algo não-determinístico (provavelmente lendo `window`/`document` ou state inicializado fora de `useEffect`), o que pode quebrar a árvore do form e impedir o handler de submit de rodar até o fim.
- O `submit()` faz `set("leads", ...)` antes de `navigate(...)`. Se algo dentro do `set` ou do `getOrigin` lança em SSR/hydratação inconsistente, o `catch` engole a exceção e só pinta `setError("Não foi possível enviar agora.")` — explicando o "nada acontece".

## Investigação (Playwright, build mode)

1. Reproduzir o fluxo end-to-end em `http://localhost:8080/avaliacao?utm_source=teste`, preenchendo todos os 9 campos e clicando Enviar. Capturar:
   - URL final após click;
   - mensagem de erro renderizada pelo form (se aparecer "Não foi possível enviar agora");
   - `console` errors + `pageerror` listeners;
   - `localStorage.status_leads` para confirmar se o lead foi gravado mesmo sem redirect.
2. Confirmar se o problema é (a) `submit()` joga exception silenciosa, (b) `navigate(...)` não aciona, ou (c) `/avaliacao/obrigado` monta mas redireciona para `/` por algum guard.

## Correções planejadas

Dependendo do resultado, aplicar uma combinação curta destas fixes em `src/components/site/LeadFormProgressive.tsx`, `src/routes/avaliacao.tsx` e `src/routes/avaliacao.obrigado.tsx`:

1. **Tornar `submit()` resiliente e observável**
   - Trocar o `catch {}` genérico por `catch (err) { console.error("[avaliacao] submit failed", err); setError(...) }` para o erro real aparecer no console.
   - Garantir que `navigate(...)` rode mesmo se `registerConversion` ou `remove("leads_partial", ...)` falharem (envolver cada um em try/catch isolado).
   - Chamar `onSubmitted` **antes** do `setLoading(false)`/early-return de erro e fazer `await navigate(...)` para evitar race com unmount.

2. **Sanitizar o `search` passado ao redirect**
   - `navigate({ to:"/avaliacao/obrigado", search:{...search, q} })` pode falhar se `search` contiver `undefined`. Filtrar para manter só strings antes de espalhar, e tipar com `as never` removido (usar validateSearch correto).

3. **Eliminar a hydration mismatch dos CTAs**
   - Os hrefs `/avaliacao?src=...` são montados pelo cliente mas SSR renderiza `/avaliacao`. Mover a geração desses params para `useEffect` + state, ou usar `<Link to="/avaliacao" search={{ src:"header_cta" }}>` de forma estável no SSR. Isso para o Vite error overlay parar de subir e não derrubar handlers downstream.

4. **Garantir que `/avaliacao/obrigado` é alcançável diretamente**
   - Adicionar log em `Obrigado()` (temporário) confirmando mount; abrir `/avaliacao/obrigado?q=qualificado` direto no browser para isolar render vs navegação.

## Validação

Re-rodar o Playwright após o fix: preencher os 9 campos com perfil qualificado e com perfil não-qualificado, e confirmar:
- URL muda para `/avaliacao/obrigado?...&q=qualificado` ou `&q=nao_qualificado`;
- screenshot da página de obrigado correspondente;
- `localStorage.status_leads` contém o registro com `origin`;
- `localStorage.status_leads_partial` foi limpo;
- console sem erros e sem overlay do Vite.