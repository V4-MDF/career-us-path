## Objetivo

Remover todos os travessões longos (`—`) do site e substituí-los por pontuação natural em português brasileiro (ponto quando a segunda parte é uma afirmação forte; vírgula ou dois-pontos quando é continuação da ideia). Aplicar em copy visível, painel admin e comentários de código.

## Escopo

Aproximadamente 320 ocorrências em ~50 arquivos, distribuídas em três grupos:

**Copy visível ao visitante (~180 ocorrências)** — prioridade alta, tom precisa ficar natural:
- `src/lib/siteContent.ts` (defaults de textos da Home e institucional)
- `src/lib/visaPages.ts` + `src/components/site/visa/VisaPageBody.tsx` (páginas de visto EB-2 NIW / EB-1 / EB-3)
- `src/lib/blog.ts` (posts do blog)
- `src/components/site/sections.tsx` (14 dobras da Home, FAQ, CTAs)
- `src/components/site/LeadFormProgressive.tsx`, `src/components/site/prequal/PreQualForm.tsx`, `src/components/site/prequal/PreQualResult.tsx`
- `src/routes/avaliacao.index.tsx`, `src/routes/avaliacao.obrigado.tsx`, `src/routes/sobre.tsx`, `src/routes/llm-info.tsx`, `src/routes/vistos.$slug.*`
- `src/lib/leadQualification.ts`, `src/lib/scoring.ts`, `src/lib/leadScoring.ts`, `src/lib/visaQualifier.ts`, `src/lib/segments.ts` (strings de mensagens exibidas)
- `src/lib/whatsapp.ts` (mensagem enviada ao lead)

**Painel admin (~80 ocorrências)**:
- `src/routes/admin.*.tsx` (todos os rótulos, tooltips e textos exibidos)

**Comentários e docs de código (~60 ocorrências)**:
- Cabeçalhos de arquivos, JSDoc, `README.md`, comentários inline em `src/lib/*`, `src/hooks/*`, `src/components/site/visuals/*`, `src/styles.css`.

## Regra de substituição

Aplicar caso a caso conforme a função retórica do travessão:

- **Ponto final** quando a segunda parte é conclusão ou afirmação de peso.  
  Ex.: `"Green Card por mérito profissional — sem empresa patrocinadora."` → `"Green Card por mérito profissional. Sem empresa patrocinadora."`
- **Vírgula** quando é aposto curto ou explicação natural.  
  Ex.: `"documentação preparada com o rigor exigido pelo USCIS — sem promessas de prazo."` → `"documentação preparada com o rigor exigido pelo USCIS, sem promessas de prazo."`
- **Dois-pontos** quando introduz lista, definição ou consequência direta.  
  Ex.: `"O que controlamos — a qualidade da estruturação."` → `"O que controlamos: a qualidade da estruturação."`
- **Parênteses** quando é nota lateral que já vem cercada por vírgulas em cascata.
- Preservar `—` apenas em contextos técnicos onde ele não é copy: separadores de UI que não são texto lido (ex.: labels tipo `"RETRATO EDITORIAL"` não têm travessão, mas listas com formato `"BBB · Nota A"` já usam `·` e ficam). Traços curtos (`-`) e meia-quadratins (`–`) em datas/intervalos ficam.

## Não muda

- Nada de layout, estilo, rotas, tracking, scoring, A/B, RLS, migrations.
- Fontes, cores, componentes shadcn.
- Estrutura de arquivos.
- `·` (ponto médio) usado como separador tipográfico (ex.: `"BBB · Nota A"`) fica.
- URLs, código, nomes de variáveis.

## Execução

Faço a revisão em quatro lotes, um commit lógico por lote, relendo cada arquivo alterado para garantir que o texto continua natural em PT-BR (não é substituição cega por regex — cada `—` vira a pontuação adequada ao contexto):

1. **Lote 1 — Copy da Home e institucional**: `siteContent.ts`, `sections.tsx`, `sobre.tsx`, `Footer`, `Header`, `llm-info.tsx`.
2. **Lote 2 — Páginas de visto e blog**: `visaPages.ts`, `VisaPageBody.tsx`, `vistos.$slug.*`, `blog.ts`.
3. **Lote 3 — Formulários e fluxo de conversão**: `LeadFormProgressive`, `PreQualForm`, `PreQualResult`, `avaliacao.*`, `whatsapp.ts`, `leadQualification.ts`, `scoring.ts`, `leadScoring.ts`, `visaQualifier.ts`, `segments.ts`.
4. **Lote 4 — Admin + comentários e docs**: `src/routes/admin.*.tsx`, `README.md`, comentários em `src/lib/*`, `src/hooks/*`, `src/components/**`, `src/styles.css`, `src/server.ts`.

Após cada lote, rodo `rg "—" <arquivos-do-lote>` para confirmar zero ocorrências residuais e faço leitura visual das seções principais na preview para checar se nenhuma frase ficou truncada ou estranha.

## Entregável

Zero `—` no repositório (`rg "—" src/` retorna vazio), copy visível reescrita em PT-BR natural sem alterar significado, admin com rótulos limpos, comentários de código sem o caractere. Nenhuma mudança funcional.