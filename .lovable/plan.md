## Problema

No rodapé da Home hoje temos duas dobras de conversão coladas:

```text
… FAQ (ink) → CTA "Análise gratuita" → CTA "Pré-qualificação" → Footer
```

São dois CTAs disputando o mesmo momento de decisão — repetitivo e enfraquece cada um.

## Proposta

Fundir em **uma única dobra de fechamento com duas ofertas lado a lado**, mantendo as duas rotas mas apresentadas como escolha, não como sequência.

```text
┌──────────────────────── CTA FINAL (ink-deep) ─────────────────────────┐
│  DUAS FORMAS DE COMEÇAR                                               │
│                                                                       │
│  ┌─ Análise gratuita ────────┐   ┌─ Pré-qualificação ───────────┐    │
│  │ PRINCIPAL / destaque ouro │   │ Secundária / outline          │    │
│  │ Resposta em até 48h       │   │ Resultado em 2 min            │    │
│  │ [FAZER MINHA ANÁLISE]     │   │ [INICIAR PRÉ-QUALIFICAÇÃO]    │    │
│  └───────────────────────────┘   └───────────────────────────────┘    │
└───────────────────────────────────────────────────────────────────────┘
```

- Uma única superfície (ink-deep) com filete tricolor no topo.
- Análise gratuita como CTA principal (botão sólido dourado, hierarquia maior).
- Pré-qualificação como opção rápida (botão outline, texto menor).
- Copy curta indicando quando escolher cada uma ("quero um diagnóstico completo" vs "quero saber em 2 minutos").

## Mudanças técnicas

- `src/components/site/sections.tsx`
  - Reescrever `CtaBanner` para renderizar as duas ofertas em grid 2-col (empilha no mobile).
  - Remover `PreQualPromo` como dobra independente (função absorvida).
- `src/lib/pageStructure.ts`
  - Remover o item `pre-qualificacao` da ordem padrão.
  - Migração leve no `useOrderedSections`: se um usuário tiver a ordem salva com `pre-qualificacao`, filtra silenciosamente (id deixa de existir).
- `src/routes/admin.estrutura.tsx` — nada a fazer, o registry de dobras já é dinâmico.
- Rota `/pre-qualificacao` continua existindo e acessível pelo botão dentro do CTA fundido.

## Ritmo final do rodapé

```text
Depoimentos (parchment)  →  FAQ (ink)  →  CTA final duplo (ink-deep)  →  Footer
```

Sem duas dobras de mesma cor coladas e sem dois CTAs consecutivos.
