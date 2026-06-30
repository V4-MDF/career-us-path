/**
 * Conteúdo estruturado das páginas-pilar de visto.
 *
 * Os textos editáveis (H1, intro, CTA, FAQ) podem ser sobrescritos pelo admin
 * via tabela `site_content` (chaves abaixo). O restante (tabela comparativa,
 * etapas, listas) vive no código com fallback — pode ser promovido a
 * site_content em iterações futuras se a edição for necessária.
 *
 * REGRAS:
 *  - Apenas vistos EB. Não mencionar B-1/B-2, F-1, J-1, etc.
 *  - Linguagem sóbria. Zero promessa de aprovação, prazo ou retorno garantido.
 *  - PT-BR em todo o conteúdo.
 */

export type VisaSlug = "eb2-niw" | "eb1" | "eb3";

export interface VisaFaq {
  q: string;
  a: string;
}

export interface VisaPage {
  slug: VisaSlug;
  eyebrow: string;
  badge?: string;
  h1: string;
  intro: string;             // 1–2 frases citáveis
  metaTitle: string;
  metaDescription: string;
  /** Definição objetiva ("O que é …") — texto citável para AEO. */
  whatIs: { title: string; body: string };
  /** Critérios de elegibilidade. */
  qualifies: { title: string; intro: string; items: { title: string; body: string }[] };
  /** Etapas do processo. */
  process: { title: string; steps: { num: string; title: string; body: string }[]; note?: string };
  /** Família — quem é incluído. */
  family: { title: string; body: string };
  faq: VisaFaq[];
  ctaTitle: string;
  ctaSubtitle: string;
}

/** Página comparativa — mesma estrutura nas 3 páginas. */
export const COMPARISON = {
  headers: ["", "EB-2 NIW", "EB-1", "EB-3"],
  rows: [
    {
      label: "Precisa de patrocinador?",
      cells: ["Não", "Não", "Sim — exige oferta de emprego nos EUA"],
    },
    {
      label: "Perfil típico",
      cells: [
        "Profissional consolidado com mestrado ou habilidade excepcional",
        "Reconhecimento internacional comprovado na área",
        "Profissional qualificado com oferta formal de emprego",
      ],
    },
    {
      label: "Labor certification (PERM)?",
      cells: ["Dispensada", "Dispensada", "Necessária"],
    },
    {
      label: "Tempo estimado",
      cells: ["~24 meses", "~12 a 24 meses", "Dependente do empregador e PERM"],
    },
    {
      label: "Green Card para cônjuge e filhos",
      cells: ["Sim", "Sim", "Sim"],
    },
  ],
};

/* ---------------- EB-2 NIW (carro-chefe) ---------------- */
const eb2niw: VisaPage = {
  slug: "eb2-niw",
  eyebrow: "VISTO EB-2 NIW",
  badge: "Principal",
  h1: "EB-2 NIW: o Green Card americano por mérito profissional",
  intro:
    "O EB-2 National Interest Waiver é um Green Card concedido a profissionais brasileiros qualificados cuja atuação é de interesse nacional dos Estados Unidos — sem necessidade de empresa patrocinadora e sem oferta de emprego.",
  metaTitle:
    "EB-2 NIW: Green Card por mérito profissional | Status na América",
  metaDescription:
    "Entenda o EB-2 National Interest Waiver: critérios, prova de interesse nacional, etapas e prazos. Sem patrocinador. Green Card para cônjuge e filhos.",
  whatIs: {
    title: "O que é o National Interest Waiver",
    body:
      "O National Interest Waiver (NIW) é uma modalidade do visto EB-2 que DISPENSA tanto o empregador patrocinador quanto a labor certification (PERM), por se demonstrar que a atuação do profissional é benéfica de forma relevante aos interesses dos Estados Unidos. Na prática, o próprio profissional peticiona seu Green Card com base no mérito da sua carreira — sem depender de uma empresa americana.",
  },
  qualifies: {
    title: "Quem se qualifica para o EB-2 NIW",
    intro:
      "São dois grupos de elegibilidade no EB-2; em seguida, o caso é avaliado pelos três critérios do precedente Matter of Dhanasar (2016), que substituiu o teste anterior.",
    items: [
      {
        title: "Grau avançado OU habilidade excepcional",
        body:
          "Mestrado, doutorado, ou bacharelado com 5+ anos de experiência progressiva na área (equiparado a grau avançado). Alternativamente, comprovação de habilidade excepcional via evidências objetivas (formação, experiência, reconhecimento do setor, remuneração acima da média, associações etc.).",
      },
      {
        title: "Dhanasar #1 — Mérito e importância nacional",
        body:
          "A atuação proposta deve ter mérito substancial e importância nacional. Não se exige que tenha alcance nacional em si — basta que os benefícios potenciais (econômicos, científicos, culturais, em saúde, em educação) extrapolem o impacto local.",
      },
      {
        title: "Dhanasar #2 — Bem posicionado para avançar",
        body:
          "O profissional precisa estar bem posicionado para efetivamente avançar nesta atuação nos EUA: histórico de realizações, plano consistente, recursos, formação compatível e demanda no mercado americano.",
      },
      {
        title: "Dhanasar #3 — Benefício de dispensar o patrocinador",
        body:
          "Os EUA se beneficiam ao dispensar a exigência de oferta de emprego e PERM neste caso específico — porque a urgência, a singularidade do perfil ou o impacto justificam a flexibilização da regra geral.",
      },
    ],
  },
  process: {
    title: "Como funciona o processo",
    steps: [
      {
        num: "01",
        title: "Estruturação do caso",
        body:
          "Diagnóstico do perfil, mapeamento de evidências (formação, publicações, prêmios, faturamento, impacto), construção do plano de atuação nos EUA e da narrativa jurídica.",
      },
      {
        num: "02",
        title: "Petição I-140",
        body:
          "Submissão da I-140 ao USCIS com a documentação completa e o memorando legal demonstrando os três critérios de Dhanasar. Eventual resposta a RFE (Request for Evidence).",
      },
      {
        num: "03",
        title: "Aprovação e ajuste / consular",
        body:
          "Aprovada a I-140, segue-se o ajuste de status (se já estiver nos EUA com status válido) ou o processamento consular no Brasil — encerrando com a emissão do Green Card.",
      },
    ],
    note:
      "Prazo realista total: aproximadamente 24 meses, com forte variação por volume do USCIS e disponibilidade consular. Começar cedo importa: a estruturação do caso é a etapa mais sensível ao tempo.",
  },
  family: {
    title: "Green Card para toda a família",
    body:
      "A petição EB-2 NIW inclui cônjuge e filhos solteiros menores de 21 anos, que recebem Green Card derivado junto com o requerente principal. O cônjuge passa a poder trabalhar livremente nos EUA, e os filhos têm acesso à educação pública americana nas mesmas condições de residentes.",
  },
  faq: [
    {
      q: "Preciso de uma empresa americana me contratando?",
      a:
        "Não. O EB-2 NIW dispensa tanto o empregador patrocinador quanto a labor certification (PERM). O próprio profissional peticiona seu Green Card com base no mérito.",
    },
    {
      q: "Preciso obrigatoriamente de mestrado?",
      a:
        "Não necessariamente. Mestrado ou doutorado qualificam diretamente como grau avançado, mas bacharelado + 5 anos de experiência progressiva também é aceito. Alternativamente, é possível qualificar pela via de habilidade excepcional, demonstrada por evidências objetivas.",
    },
    {
      q: "Inglês fluente é obrigatório para começar?",
      a:
        "Não é requisito para a petição EB-2 NIW. O caso é instruído em inglês pela assessoria jurídica; o profissional não precisa ser fluente para iniciar. A fluência, no entanto, é um diferencial relevante para a vida e a carreira nos EUA.",
    },
    {
      q: "Quanto tempo leva o processo?",
      a:
        "Estimativa realista de aproximadamente 24 meses, considerando estruturação, petição I-140, eventual RFE e ajuste/consular. Os prazos do USCIS e dos consulados oscilam — por isso começar cedo importa. Não trabalhamos com prazos garantidos.",
    },
    {
      q: "Como está a emissão de vistos para brasileiros em 2026?",
      a:
        "Há flutuações reais na agenda consular e nos tempos de processamento, que dependem de fatores externos ao caso. Por isso planejamento antecipado importa: estruturar a petição cedo amplia a janela de manobra. Acompanhamos o cenário e conduzimos cada caso conforme as regras vigentes — sem prometer prazos.",
    },
    {
      q: "Quanto custa?",
      a:
        "A avaliação inicial do perfil é gratuita. O investimento da assessoria varia conforme a composição da família, a complexidade da documentação e o estágio do caso. Apresentamos a proposta após o diagnóstico.",
    },
  ],
  ctaTitle: "Descubra se você já tem perfil para o EB-2 NIW.",
  ctaSubtitle:
    "Avaliação gratuita e confidencial. Em até 48h nossa equipe analisa sua trajetória e indica o caminho mais coerente.",
};

/* ---------------- EB-1 ---------------- */
const eb1: VisaPage = {
  slug: "eb1",
  eyebrow: "VISTO EB-1",
  h1: "EB-1: Green Card para habilidade extraordinária",
  intro:
    "O EB-1 é o Green Card destinado a profissionais com habilidade extraordinária, reconhecimento internacional comprovado em sua área. Também dispensa patrocinador e PERM.",
  metaTitle: "EB-1: Green Card por habilidade extraordinária | Status na América",
  metaDescription:
    "EB-1 é o Green Card para perfis com reconhecimento internacional comprovado. Sem patrocinador, sem PERM. Veja critérios, processo e como avaliar seu perfil.",
  whatIs: {
    title: "O que é o EB-1",
    body:
      "O EB-1 é a primeira categoria de visto baseado em emprego (Employment-Based, primeira preferência). Reúne três sub-categorias — EB-1A (habilidade extraordinária), EB-1B (pesquisadores e professores notáveis) e EB-1C (executivos e gerentes multinacionais). A modalidade mais comum para profissionais brasileiros sem vínculo com multinacional é a EB-1A.",
  },
  qualifies: {
    title: "Quem se qualifica para o EB-1A",
    intro:
      "Exige demonstração de reconhecimento internacional sustentado — perfil mais alto que o EB-2 NIW. O USCIS avalia evidências em ao menos 3 dos 10 critérios oficiais, ou o equivalente a um prêmio internacional único (ex.: Nobel, Oscar, Pulitzer).",
    items: [
      { title: "Prêmios e reconhecimentos nacionais ou internacionais", body: "Distinções relevantes recebidas pela atuação profissional." },
      { title: "Associações exclusivas da área", body: "Membro de associações que exigem realizações excepcionais para admissão." },
      { title: "Publicações sobre o profissional na mídia", body: "Matérias em veículos profissionais ou da grande mídia tratando do seu trabalho." },
      { title: "Atuação como julgador / avaliador", body: "Avaliação do trabalho de pares (juiz de concursos, revisor de publicações etc.)." },
      { title: "Contribuições originais de grande significância", body: "Pesquisas, métodos, produtos ou processos com impacto comprovado." },
      { title: "Outros critérios", body: "Autoria de artigos, exposição em galerias, papel crítico em organizações, remuneração elevada, sucesso comercial nas artes." },
    ],
  },
  process: {
    title: "Como funciona o processo",
    steps: [
      { num: "01", title: "Diagnóstico de elegibilidade", body: "Mapeamento de evidências objetivas em pelo menos 3 dos critérios oficiais." },
      { num: "02", title: "Petição I-140", body: "Submissão ao USCIS com a documentação probatória completa e o memorando jurídico." },
      { num: "03", title: "Aprovação e ajuste / consular", body: "Conclusão do processo, com Green Card para o requerente, cônjuge e filhos." },
    ],
    note:
      "Premium Processing está disponível no EB-1, o que pode acelerar a resposta inicial do USCIS — sem garantir prazo total do processo.",
  },
  family: {
    title: "Green Card para toda a família",
    body:
      "Como nas demais categorias EB, cônjuge e filhos solteiros menores de 21 anos são incluídos como derivados e recebem Green Card junto com o requerente principal.",
  },
  faq: [
    {
      q: "Preciso de uma empresa patrocinadora?",
      a: "Não para o EB-1A. As subcategorias EB-1B (pesquisador notável) e EB-1C (executivo multinacional) exigem vínculo formal com empregador americano.",
    },
    {
      q: "Qual a diferença entre EB-1 e EB-2 NIW?",
      a: "Ambos dispensam patrocinador (EB-1A/EB-2 NIW). O EB-1 exige perfil mais alto: reconhecimento internacional comprovado. O EB-2 NIW exige interesse nacional da atuação, com critérios mais acessíveis a profissionais consolidados.",
    },
    {
      q: "Qual o tempo estimado?",
      a: "Aproximadamente 12 a 24 meses no total, variável conforme USCIS e consulado. O Premium Processing pode acelerar a etapa I-140. Não trabalhamos com prazos garantidos.",
    },
    {
      q: "Quanto custa?",
      a: "A avaliação inicial é gratuita. A proposta de assessoria varia conforme complexidade do caso e composição da família.",
    },
  ],
  ctaTitle: "Tem reconhecimento internacional? Avalie o EB-1.",
  ctaSubtitle: "Em até 48h analisamos as evidências do seu perfil e indicamos a melhor categoria EB para o seu caso.",
};

/* ---------------- EB-3 ---------------- */
const eb3: VisaPage = {
  slug: "eb3",
  eyebrow: "VISTO EB-3 • EXIGE PATROCINADOR",
  h1: "EB-3: Green Card para profissionais qualificados com oferta de emprego nos EUA",
  intro:
    "O EB-3 é uma categoria de Green Card que EXIGE oferta formal de emprego nos Estados Unidos e processo de labor certification (PERM). É um caminho secundário, mais dependente de terceiros — quando há vínculo concreto com um empregador americano disposto a patrocinar.",
  metaTitle: "EB-3: Green Card com patrocínio | Status na América",
  metaDescription:
    "EB-3 é o Green Card para profissionais qualificados com oferta de emprego nos EUA. Exige patrocinador e PERM. Entenda o fluxo e quando faz sentido.",
  whatIs: {
    title: "O que é o EB-3",
    body:
      "O EB-3 é a terceira preferência de vistos baseados em emprego. Abrange três subgrupos: skilled workers (2+ anos de experiência), professionals (com diploma de bacharelado) e other workers (não-qualificados). Em qualquer hipótese, exige (a) oferta formal e contínua de emprego nos EUA e (b) labor certification (PERM) emitida pelo Departamento do Trabalho.",
  },
  qualifies: {
    title: "Quando o EB-3 faz sentido",
    intro:
      "O EB-3 é apropriado quando NÃO há perfil para EB-2 NIW ou EB-1 e existe um empregador americano disposto a conduzir o patrocínio — assumindo custos e prazos do PERM. É um caminho que depende fortemente da empresa.",
    items: [
      { title: "Há empregador disposto a patrocinar", body: "Empresa americana que aceita conduzir PERM, comprovar inexistência de mão-de-obra local e patrocinar a petição." },
      { title: "Profissional qualificado", body: "Diploma de bacharelado (professionals) ou pelo menos 2 anos de experiência/treinamento (skilled workers)." },
      { title: "Disponibilidade para o tempo do PERM", body: "O PERM costuma ser a etapa mais demorada; o processo total depende da agenda do empregador e do Departamento do Trabalho." },
    ],
  },
  process: {
    title: "Como funciona o processo",
    steps: [
      { num: "01", title: "PERM (Labor Certification)", body: "O empregador comprova ao DOL que não há trabalhador americano disponível e qualificado para a vaga, seguindo recrutamento formal regulado." },
      { num: "02", title: "Petição I-140", body: "Aprovado o PERM, o empregador submete a I-140 ao USCIS em favor do profissional." },
      { num: "03", title: "Ajuste / consular", body: "Aprovada a I-140, segue-se o ajuste de status ou processamento consular, com Green Card para o requerente, cônjuge e filhos." },
    ],
    note:
      "Os prazos variam significativamente em função do PERM e da disponibilidade do empregador. Não há como prometer cronograma.",
  },
  family: {
    title: "Green Card para a família",
    body:
      "Cônjuge e filhos solteiros menores de 21 anos são incluídos como derivados.",
  },
  faq: [
    {
      q: "Posso fazer EB-3 sem empresa patrocinadora?",
      a: "Não. O EB-3 exige obrigatoriamente oferta de emprego nos EUA e processo de PERM conduzido pelo empregador.",
    },
    {
      q: "EB-3 ou EB-2 NIW: qual escolher?",
      a: "Quando há perfil para EB-2 NIW, ele costuma ser o caminho mais autônomo — dispensa patrocinador e PERM. EB-3 é indicado quando o perfil não se enquadra nas categorias autônomas e existe uma oferta concreta de emprego.",
    },
    {
      q: "Quanto tempo leva?",
      a: "É a categoria mais dependente de terceiros — o PERM costuma ser a etapa mais longa. Não trabalhamos com prazos garantidos.",
    },
  ],
  ctaTitle: "Tem oferta de emprego nos EUA?",
  ctaSubtitle: "Em 48h indicamos se o EB-3 é o caminho mais coerente ou se existe perfil para EB-2 NIW ou EB-1 (caminhos sem patrocinador).",
};

export const VISA_PAGES: Record<VisaSlug, VisaPage> = {
  "eb2-niw": eb2niw,
  "eb1": eb1,
  "eb3": eb3,
};

/** Chaves editáveis (site_content) por página — admin pode sobrescrever. */
export const VISA_EDITABLE_KEYS = (slug: VisaSlug) =>
  [
    `visa.${slug}.h1`,
    `visa.${slug}.intro`,
    `visa.${slug}.ctaTitle`,
    `visa.${slug}.ctaSubtitle`,
  ] as const;
