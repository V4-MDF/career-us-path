## Auditoria + ajustes

### 1. Bug de reordenação das dobras (flicker)
Sintoma: a ordem da Home muda "sozinha" ao carregar.

Causa em `src/lib/pageStructure.ts`:
- SSR/initial snapshot devolve `DEFAULT_LAYOUTS` (ordem do código).
- Depois da hidratação, `ensureHydrated` busca a ordem salva no Supabase e dispara `status:admin-change`, forçando re-render com a nova ordem. Resultado visível: as dobras "pulam" de lugar.
- Além disso, `getServerSnapshot` e o snapshot do cliente inicial divergem quando já existe layout em `localStorage`, mas o snapshot inicial ignora isso.

Correções:
- Ler `localStorage` de forma síncrona no primeiro snapshot do cliente (já feito), mas também disparar o `dispatchEvent` só quando o payload vindo do Supabase for diferente do cache atual (comparar chaves `id:active`). Sem diferença, sem broadcast.
- Persistir o snapshot do Supabase no `localStorage` antes do broadcast, para que o próximo carregamento já parta da ordem correta e não haja flicker em visitas subsequentes.
- Garantir estabilidade do cache em `getCachedSnapshot` (já usa key). Adicionar guarda para não trocar referência quando reconcile devolver mesma ordem.

### 2. Dobra "Duas realidades. Uma decisão."
Objetivo: mais compacta e mais direta.

Mudanças em `ContrastBrasilEUA` (`src/components/site/sections.tsx`):
- Remover a faixa fotográfica dos dois cards (sem `photo`, sem `photo-treatment`, sem `familySuburbUsa`/`brasilSomber` nessa dobra).
- Reduzir padding para `p-6 md:p-7` e enxugar espaços verticais (título `text-xl md:text-2xl`, `mt-4` no título, `space-y-2.5` na lista).
- Card Brasil: paleta vermelha assertiva. Accent `#B23A3A` (vermelho sóbrio), fundo `bg-[#FBEEEE]`, borda topo 3px vermelha, badge "BR" e eyebrow em vermelho, ícones `AlertOctagon`/`XCircle` em vermelho.
- Card EUA: paleta verde de conquista. Accent `#2E7D5B` mantido, fundo `bg-[#EEF6F1]`, borda topo verde, badge "US" e eyebrow em verde, ícones `CheckCircle2` em verde.
- Divisor central com seta BR→US mantido, mas menor (h-9 w-9).
- Mobile: cards empilhados, sem imagens, altura muito menor.
- Section padding reduzido: substituir `section-pad` por classe utilitária com `py-16 md:py-20` local ao bloco (ou wrapper interno com `py-2` a menos).

### 3. Verificação pós-mudança
- Recarregar `/` várias vezes (com e sem `localStorage`) confirmando que a ordem não "salta".
- Screenshot desktop + mobile da dobra "Duas realidades" confirmando cards curtos, ícones vermelhos (BR) e verdes (EUA), sem fotos.

### Escopo
Somente `src/lib/pageStructure.ts` e `src/components/site/sections.tsx` (bloco `ContrastBrasilEUA` + remoção dos imports de foto se ficarem órfãos). Sem tocar em outras dobras, admin, backend ou dados salvos.