Atualmente o formulário redireciona para `/avaliacao/obrigado-qualificado` ou `/avaliacao/obrigado-nao-qualificado`, deixando explícito no URL se o lead foi qualificado. O objetivo é usar uma única URL neutra (`/avaliacao/obrigado`) e decidir o conteúdo no cliente de forma discreta.

## Alterações propostas

1. **Unificar destino do formulário**
   - Em `src/routes/avaliacao.index.tsx`, o callback `goToThanks` sempre navegará para `/avaliacao/obrigado`.
   - Antes de navegar, guarda em `sessionStorage` a chave `lastQualificationResult` (`qualificado` | `nao_qualificado`).
   - Mantém o salvamento de `lastQualifiedLead` no `LeadFormProgressive` para o WhatsApp automático.

2. **Tornar `/avaliacao/obrigado` a página canônica**
   - Substitui o redirect legado em `src/routes/avaliacao.obrigado.tsx` por um componente que:
     - Lê `lastQualificationResult` do `sessionStorage` no cliente.
     - Renderiza o conteúdo de "qualificado" ou "não qualificado".
     - Se não houver estado (acesso direto), exibe uma mensagem genérica de "Perfil recebido".
   - O SEO continua `noindex,nofollow`.

3. **Reutilizar conteúdo existente**
   - Extrai os JSX das páginas `avaliacao.obrigado-qualificado.tsx` e `avaliacao.obrigado-nao-qualificado.tsx` para componentes internos no arquivo unificado (ou para um novo módulo `src/components/site/ObrigadoContent.tsx`), preservando o layout, copy, WhatsApp automático e CTA do Instagram.

4. **Redirecionar URLs antigas**
   - Transforma `src/routes/avaliacao.obrigado-qualificado.tsx` e `src/routes/avaliacao.obrigado-nao-qualificado.tsx` em rotas que apenas redirecionam para `/avaliacao/obrigado`.
   - Isso mantém links antigos/externos funcionando sem expor a variação ao usuário final.

5. **Testar fluxo**
   - Submeter um lead qualificado: deve abrir `/avaliacao/obrigado` e mostrar a versão qualificada (com WhatsApp automático).
   - Submeter um lead não qualificado: deve abrir `/avaliacao/obrigado` e mostrar a versão de acolhimento.
   - Acessar `/avaliacao/obrigado-qualificado` ou `/avaliacao/obrigado-nao-qualificado` diretamente: deve redirecionar para `/avaliacao/obrigado`.

## Resultado esperado
- O cliente sempre vê apenas `/avaliacao/obrigado` no navegador, independente do resultado.
- A variação de conteúdo é controlada internamente por `sessionStorage`, sem expor "não qualificado" no endereço.