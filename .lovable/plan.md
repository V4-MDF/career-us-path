## Problemas
1. **Logo ausente em `/avaliacao`** — o header da rota usa um quadradinho placeholder com a letra "S" em vez do logo oficial que já é usado no Header global.
2. **Delay para o formulário aparecer** — o primeiro campo do `LeadFormProgressive` só aparece depois de um fade-in de ~350ms + espera do restore assíncrono (Supabase `get("leads_partial")`). Como o card já é renderizado, o usuário vê "0/9 preenchidos" com a área do form em branco por meio segundo até a animação de entrada rodar.

## Correções

### 1. Header do `/avaliacao` usa o logo real
Em `src/routes/avaliacao.index.tsx`:
- Importar `logoAsset from "@/assets/logo-status-na-america.png.asset.json"`.
- Substituir o bloco `<span>S</span> + Status. na América` por um `<img src={logoAsset.url} …>` com as mesmas dimensões usadas no Header global (`h-10 md:h-12 w-auto`), mantendo o `<Link to="/">` e o `aria-label`.

### 2. Formulário aparece imediatamente
Em `src/components/site/LeadFormProgressive.tsx`:
- No `.map(steps)`, quando `i === 0` **e** ainda não houve restore (`!restored` na primeira renderização), renderizar a pergunta ativa sem `motion.div` (ou com `initial={false}`) para que ela apareça no primeiro paint — sem esperar o fade de 0.35s. Manter a animação apenas para os passos seguintes (`i > 0`), que é onde ela tem valor.
- Remover o `AnimatePresence mode="wait"` envolvendo cada step individualmente — ele está zerado (nunca há saída) e só adiciona custo de mount. Trocar por um `motion.div` direto por passo.
- Também eliminar o gate visual causado pelo restore: hoje o efeito de persistência espera `restored` para gravar, mas a renderização do primeiro campo já não depende disso. Só garantir que `stepIndex` inicial (0) e `data` inicial não sejam sobrescritos com atraso quando não há partial salvo — a lógica atual já faz isso; apenas confirmar que `setRestored(true)` roda no `finally`.

Sem mudanças em lógica de submit, scoring, qualificação ou persistência.

## Validação
- Abrir `/avaliacao` no preview: o logo oficial aparece no header (idêntico ao Header global).
- Primeira pergunta "Para começarmos, qual é o seu nome completo?" fica visível já no primeiro frame, sem fade de meio segundo.
- Comportamento de restore (retomar respostas anteriores) continua funcionando: revisitar após preencher 2–3 campos deve reposicionar no passo pendente.
