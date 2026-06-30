## Diagnóstico

O Manual de Copy define termos **proibidos por compliance** e **termos recomendados** para posicionar a Status na América como **preparadora documental** — não como assessoria jurídica nem consultoria. Hoje o site usa repetidamente dois termos da lista negra:

- **"Assessoria" / "assessoria jurídica"** — usada como auto-descrição da marca (meta tags, footer, /sobre, /llm-info, Schema.org, FAQs de visa pages, LP template).
- **"Consultoria jurídica"** — aparece nos disclaimers ("não prestamos consultoria jurídica"). Mesmo em negação, o Manual proíbe o uso do termo.

Promessas de aprovação e "garantias" já estão corretamente tratadas (sempre em negativa). Não há violação ali.

## Substituições (conforme tabela do Manual)

| Atual (proibido) | Substituir por |
|---|---|
| Assessoria de mobilidade migratória | **Especialistas em preparação documental para mobilidade migratória** |
| Assessoria EB-2 NIW / EB-1 / EB-3 | **Preparação documental para vistos EB-2 NIW, EB-1 e EB-3** |
| O investimento da assessoria | **O investimento da preparação documental** |
| A assessoria jurídica conduz em inglês | **A equipe jurídica parceira conduz em inglês** |
| "primeira etapa de uma assessoria séria" | **"primeira etapa de um processo bem estruturado"** |
| "não prestamos consultoria jurídica nem representação legal" | **"não prestamos orientação jurídica nem representação legal"** |

## Arquivos a editar

1. **Meta/SEO/Schema** — `src/routes/index.tsx`, `src/routes/sobre.tsx`, `src/routes/llm-info.tsx`, `src/routes/admin.seo.tsx` (default), `src/components/site/Seo.tsx` (description default + comentário do Schema).
2. **Footer** — `src/components/site/Footer.tsx` (linha 40 descritor + linha 113 disclaimer).
3. **Disclaimers** — `src/routes/avaliacao.tsx`, `src/routes/avaliacao.obrigado.tsx`, `src/components/site/lp/LandingPageTemplate.tsx` (linha 56).
4. **FAQs e textos de visa** — `src/lib/visaPages.ts` (linhas 168, 183, 249) e `src/components/site/lp/LandingPageTemplate.tsx` (linha 434).
5. **Blog seed** — `src/lib/blog.ts` (linha 225).

Schema.org `LegalService` em `Seo.tsx` permanece (é classificação técnica do JSON-LD, não copy visível ao usuário); ajusto apenas a `description`.

Comentários internos de código (`// garante…`, nomes de variáveis) ficam como estão — o Manual rege comunicação ao público, não código.

## Validação

Após as edições, rodar `rg -n -i 'assessoria|consultoria jurídica' src/` esperando zero ocorrências em strings voltadas ao usuário, e abrir Home + /sobre + /avaliacao + Footer para confirmar tom alinhado ao Manual.
