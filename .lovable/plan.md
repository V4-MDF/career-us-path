## Adicionar pergunta "Tipo de visto buscado" ao formulário de Análise

Nova pergunta inserida logo após o WhatsApp (posição 4), antes de Profissão. Não altera scoring nem qualificação — apenas captura a intenção para o admin.

### Mudanças

**1. `src/lib/leadScoring.ts`** — Adicionar campo opcional ao `LeadInput`:
```ts
objetivo_visto?: "morar" | "trabalhar" | "estudar" | "turismo" | "";
```

**2. `src/components/site/LeadFormProgressive.tsx`**
- Novo `FieldKey`: `"objetivo_visto"`.
- Inserir em `PROGRESSIVE_FIELDS` após `whatsapp`:
  > "O que você está buscando nos EUA?" — opções: Morar definitivamente / Trabalhar / Estudar / Turismo.
- `isFieldValid`: exige valor não vazio.
- Renderizar como `<Select>` no `ActiveQuestion` (mesmo padrão de profissão/formação, com auto-advance).
- Adicionar label em `LABELS.objetivo_visto` e linha no resumo final (`Summary k="Objetivo"`).
- Incluir no `empty` inicial.

**3. `src/lib/whatsapp.ts`** — Incluir "Objetivo" na mensagem gerada para o WhatsApp do lead qualificado (linha extra logo abaixo de Nome/Contato).

**4. `src/routes/admin.leads.tsx`** — Adicionar o campo "Objetivo do visto" no modal de detalhes do lead (na seção de perfil), usando o mesmo componente `Field` semântico.

### Fora do escopo
- Sem mudanças em scoring, qualificação, RLS, migrations ou tipos do Supabase (`objetivo_visto` viaja dentro do JSON do lead — a coluna `data` já é flexível, não requer migração de schema).
- Sem bifurcação de fluxo: todos os objetivos seguem o mesmo caminho até o final.