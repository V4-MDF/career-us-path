/**
 * Conteúdo estruturado das páginas-pilar de visto.
 *
 * Os textos editáveis (H1, intro, CTA, FAQ) podem ser sobrescritos pelo admin
 * via tabela `site_content` (chaves abaixo). O restante (tabela comparativa,
 * etapas, listas) vive no código com fallback, pode ser promovido a
 * site_content em iterações futuras se a edição for necessária.
 *
 * REGRAS:
 *  - Apenas vistos EB. Não mencionar B-1/B-2, F-1, J-1, etc.
 *  - Linguagem sóbria. Zero promessa de aprovação, prazo ou retorno garantido.
 *  - PT-BR em todo o conteúdo.
 */

export type VisaSlug = "eb2-niw" | "eb1" | "eb3" | "o1";

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
  /** Definição objetiva ("O que é …"), texto citável para AEO. */
  whatIs: { title: string; body: string };
  /** Critérios avaliados pelo USCIS. `legalBasis` é a legenda de base
   *  legal exibida abaixo da lista de critérios — obrigatória e específica
   *  por visto (Dhanasar só se aplica ao NIW). */
  qualifies: { title: string; intro: string; legalBasis: string; items: { title: string; body: string }[] };
  /** Etapas do processo. */
  process: { title: string; steps: { num: string; title: string; body: string }[]; note?: string };
  /** Família, quem é incluído. */
  family: { title: string; body: string };
  faq: VisaFaq[];
  ctaTitle: string;
  ctaSubtitle: string;
}

/** Página comparativa, mesma estrutura nas 3 páginas. */
export const COMPARISON = {
  headers: ["", "EB-2 NIW", "EB-1", "O-1"],
  rows: [
    {
      label: "Precisa de patrocinador?",
      cells: [
        "Não",
        "Não",
        "Exige peticionário nos EUA — empregador ou agente. Não exige oferta permanente.",
      ],
    },
    {
      label: "Perfil típico",
      cells: [
        "Profissional consolidado com mestrado ou habilidade excepcional",
        "Reconhecimento internacional comprovado na área",
        "Habilidade extraordinária em ciências, artes, educação, negócios, atletismo, cinema ou TV",
      ],
    },
    {
      label: "Labor certification (PERM)?",
      cells: ["Dispensada", "Dispensada", "Não se aplica (visto temporário)"],
    },
    {
      label: "Tempo estimado",
      cells: [
        "~24 meses",
        "~12 a 24 meses",
        "Alguns meses (Premium Processing disponível)",
      ],
    },
    {
      label: "Green Card para cônjuge e filhos, junto do requerente principal",
      cells: [
        "Sim",
        "Sim",
        "Não — é visto temporário; cônjuge e filhos entram como O-3, sem autorização de trabalho",
      ],
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
    "O EB-2 National Interest Waiver é um Green Card concedido a profissionais brasileiros qualificados cuja atuação é de interesse nacional dos Estados Unidos, sem necessidade de empresa patrocinadora e sem oferta de emprego.",
  metaTitle:
    "EB-2 NIW: Green Card por mérito profissional | Status na América",
  metaDescription:
    "Entenda o EB-2 National Interest Waiver: critérios, prova de interesse nacional, etapas e prazos. Sem patrocinador. Green Card para cônjuge e filhos, junto do requerente principal.",
  whatIs: {
    title: "O que é o National Interest Waiver",
    body:
      "O National Interest Waiver (NIW) é uma modalidade do visto EB-2 que DISPENSA tanto o empregador patrocinador quanto a labor certification (PERM), por se demonstrar que a atuação do profissional é benéfica de forma relevante aos interesses dos Estados Unidos. Na prática, o próprio profissional peticiona seu Green Card com base no mérito da sua carreira, sem depender de uma empresa americana.",
  },
  qualifies: {
    title: "O que o USCIS avalia no EB-2 NIW",
    intro:
      "O EB-2 admite duas portas de entrada. Além delas, o USCIS avalia o pedido de dispensa por três critérios estabelecidos em precedente administrativo.",
    legalBasis: "Critérios do National Interest Waiver conforme o precedente Matter of Dhanasar (AAO, 2016).",
    items: [
      {
        title: "Grau avançado OU habilidade excepcional",
        body:
          "Mestrado, doutorado, ou bacharelado com 5+ anos de experiência progressiva na área (equiparado a grau avançado). Alternativamente, comprovação de habilidade excepcional via evidências objetivas (formação, experiência, reconhecimento do setor, remuneração acima da média, associações etc.).",
      },
      {
        title: "Seu trabalho tem mérito e importância para os EUA",
        body:
          "A atuação proposta deve ter mérito substancial e importância nacional. Não se exige que tenha alcance nacional em si, basta que os benefícios potenciais (econômicos, científicos, culturais, em saúde, em educação) extrapolem o impacto local.",
      },
      {
        title: "Você está bem posicionado para realizar esse trabalho",
        body:
          "O profissional precisa estar bem posicionado para efetivamente avançar nesta atuação nos EUA: histórico de realizações, plano consistente, recursos, formação compatível e demanda no mercado americano.",
      },
      {
        title: "É vantajoso para os EUA dispensar o patrocinador no seu caso",
        body:
          "Os EUA se beneficiam ao dispensar a exigência de oferta de emprego e PERM neste caso específico, porque a urgência, a singularidade do perfil ou o impacto justificam a flexibilização da regra geral.",
      },
    ],

  },
  process: {
    title: "Como preparamos a sua documentação",
    steps: [
      {
        num: "01",
        title: "Análise Criteriosa",
        body:
          "Organizamos e revisamos histórico, formação e evidências de impacto para o EB-2 NIW, diagnóstico individual antes de qualquer compromisso.",
      },
      {
        num: "02",
        title: "Arquitetura Estratégica",
        body:
          "Organizamos a documentação demonstrando que a atuação proposta tem mérito substancial e importância nacional para os Estados Unidos.",
      },
      {
        num: "03",
        title: "Preparação Documental",
        body:
          "Documentação meticulosa, cartas de recomendação e evidências de alto padrão, coerência técnica e narrativa em cada peça.",
      },
      {
        num: "04",
        title: "Revisão Final",
        body:
          "Organização completa e criteriosa do seu processo, dentro dos padrões exigidos pelo USCIS.",
      },
    ],
    note:
      "Prazo realista total do ciclo (estruturação → protocolo → decisão → ajuste/consular): aproximadamente 24 meses, com forte variação por USCIS e disponibilidade consular. Começar cedo importa.",
  },
  family: {
    title: "Green Card para toda a família",
    body:
      "O processo EB-2 NIW inclui cônjuge e filhos solteiros menores de 21 anos, que recebem Green Card derivado junto do requerente principal. Uma vez concedida a residência permanente, o cônjuge pode trabalhar livremente nos EUA, e os filhos têm acesso à educação pública americana nas mesmas condições de residentes. A idade do filho é apurada segundo as regras do Child Status Protection Act (CSPA), que em determinados casos preserva o benefício mesmo após os 21 anos — o tempo de processamento influencia esse cálculo.",
  },
  faq: [
    {
      q: "Preciso de uma empresa americana me contratando?",
      a:
        "Não. O EB-2 NIW dispensa tanto o empregador patrocinador quanto a labor certification (PERM). O próprio profissional conduz seu Green Card com base no mérito.",
    },
    {
      q: "Preciso obrigatoriamente de mestrado?",
      a:
        "Não necessariamente. Mestrado ou doutorado qualificam diretamente como grau avançado, mas bacharelado + 5 anos de experiência progressiva também é aceito. Alternativamente, é possível qualificar pela via de habilidade excepcional, demonstrada por evidências objetivas.",
    },
    {
      q: "Inglês fluente é obrigatório para começar?",
      a:
        "Não é requisito para o EB-2 NIW. A documentação é instruída em inglês pela equipe jurídica parceira; o profissional não precisa ser fluente para iniciar. A fluência, no entanto, é um diferencial relevante para a vida e a carreira nos EUA.",
    },
    {
      q: "Quanto tempo leva o processo?",
      a:
        "Estimativa realista de aproximadamente 24 meses, considerando estruturação, processo I-140, eventual RFE e ajuste/consular. Os prazos do USCIS e dos consulados oscilam, por isso começar cedo importa. Não trabalhamos com prazos garantidos.",
    },
    {
      q: "Como está a emissão de vistos para brasileiros em 2026?",
      a:
        "Há flutuações reais na agenda consular e nos tempos de processamento, que dependem de fatores externos ao caso. Por isso planejamento antecipado importa: estruturar o processo cedo amplia a janela de manobra. Acompanhamos o cenário e organizamos a documentação de cada caso conforme as regras vigentes, sem prometer prazos.",
    },
    {
      q: "Quanto custa?",
      a:
        "A análise inicial do perfil é gratuita. O investimento da preparação documental varia conforme a composição da família, a complexidade da documentação e o estágio do caso. O valor da assessoria é separado das taxas oficiais do governo americano (USCIS), que são pagas diretamente ao órgão e podem variar. Apresentamos a proposta e o panorama completo de custos após o diagnóstico.",
    },
    {
      q: "As taxas do governo americano estão incluídas no valor da assessoria?",
      a:
        "Não. Existem duas coisas diferentes: (1) as taxas oficiais do governo americano (USCIS), pagas diretamente ao órgão; e (2) o valor da nossa assessoria, que cobre a preparação e organização estratégica do seu processo. São separados. As taxas do USCIS são definidas pelo próprio governo, podem mudar e são pagas por formulário. Na fase final (Green Card), parte das taxas é individual — ou seja, cônjuge e filhos têm suas próprias taxas. Na sua análise gratuita, explicamos exatamente quais taxas se aplicam ao seu caso e à sua família.",
    },
    {
      q: "Preciso pagar taxas separadas para minha família?",
      a:
        "Na etapa da petição inicial, a taxa é do requerente principal. Já na etapa final de Green Card, cônjuge e filhos entram com seus próprios formulários e taxas — portanto, há custos individuais por pessoa nessa fase. Detalhamos isso na análise, conforme o tamanho da sua família.",
    },
  ],
  ctaTitle: "Entenda como o seu perfil se posiciona diante dos critérios do USCIS para o EB-2 NIW.",
  ctaSubtitle:
    "Análise gratuita e confidencial. Em até 48h nossa equipe organiza as informações do seu perfil e apresenta um panorama das categorias de visto aplicáveis.",
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
      "O EB-1 é a primeira categoria de visto baseado em emprego (Employment-Based, primeira preferência). Reúne três sub-categorias. EB-1A (habilidade extraordinária), EB-1B (pesquisadores e professores notáveis) e EB-1C (executivos e gerentes multinacionais). A modalidade mais comum para profissionais brasileiros sem vínculo com multinacional é a EB-1A.",
  },
  qualifies: {
    title: "O que o USCIS avalia no EB-1A",
    intro:
      "Exige demonstração de reconhecimento internacional sustentado, perfil mais alto que o EB-2 NIW. O USCIS avalia evidências em ao menos 3 dos 10 critérios oficiais, ou o equivalente a um prêmio internacional único (ex.: Nobel, Oscar, Pulitzer). A lista abaixo é um resumo; a relação completa dos dez critérios está no regulamento federal.",
    legalBasis: "Critérios definidos no regulamento federal 8 CFR 204.5(h)(3).",
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
      { num: "01", title: "Diagnóstico de critérios", body: "Mapeamento de evidências objetivas em pelo menos 3 dos critérios oficiais." },
      { num: "02", title: "Processo I-140", body: "Organização do conjunto documental para protocolo, conduzido pelo requerente ou pelo advogado responsável." },
      { num: "03", title: "Aprovação e ajuste / consular", body: "Conclusão do processo, com Green Card para o requerente, cônjuge e filhos." },
    ],
    note:
      "Premium Processing está disponível no EB-1, o que pode acelerar a resposta inicial do USCIS, sem garantir prazo total do processo.",
  },
  family: {
    title: "Green Card para toda a família",
    body:
      "Como nas demais categorias EB, cônjuge e filhos solteiros menores de 21 anos são incluídos como derivados e recebem Green Card junto do requerente principal. A idade do filho é apurada segundo as regras do Child Status Protection Act, que em determinados casos preserva o benefício mesmo após os 21 anos — o tempo de processamento influencia esse cálculo.",
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
      a: "A análise inicial é gratuita. A proposta de preparação documental varia conforme complexidade do caso e composição da família. O valor da assessoria é separado das taxas oficiais do governo americano (USCIS), que são pagas diretamente ao órgão e podem variar.",
    },
    {
      q: "As taxas do governo americano estão incluídas no valor da assessoria?",
      a: "Não. Existem duas coisas diferentes: (1) as taxas oficiais do governo americano (USCIS), pagas diretamente ao órgão; e (2) o valor da nossa assessoria, que cobre a preparação e organização estratégica do seu processo. São separados. As taxas do USCIS são definidas pelo próprio governo, podem mudar e são pagas por formulário. Na fase final (Green Card), parte das taxas é individual — cônjuge e filhos têm suas próprias taxas. Na sua análise gratuita, explicamos exatamente quais taxas se aplicam ao seu caso e à sua família.",
    },
    {
      q: "Preciso pagar taxas separadas para minha família?",
      a: "Na etapa da petição inicial, a taxa é do requerente principal. Já na etapa final de Green Card, cônjuge e filhos entram com seus próprios formulários e taxas — há custos individuais por pessoa nessa fase. Detalhamos na análise, conforme o tamanho da sua família.",
    },
  ],
  ctaTitle: "Tem reconhecimento internacional? Avalie o EB-1.",
  ctaSubtitle: "Em até 48h organizamos as informações do seu perfil e apresentamos um panorama das categorias EB aplicáveis ao seu caso.",
};

/* ---------------- EB-3 ---------------- */
const eb3: VisaPage = {
  slug: "eb3",
  eyebrow: "VISTO EB-3 • EXIGE PATROCINADOR",
  h1: "EB-3: Green Card para profissionais qualificados com oferta de emprego nos EUA",
  intro:
    "O EB-3 é uma categoria de Green Card que EXIGE oferta formal de emprego nos Estados Unidos e processo de labor certification (PERM). É um caminho secundário, mais dependente de terceiros, quando há vínculo concreto com um empregador americano disposto a patrocinar.",
  metaTitle: "EB-3: Green Card com patrocínio | Status na América",
  metaDescription:
    "EB-3 é o Green Card para profissionais qualificados com oferta de emprego nos EUA. Exige patrocinador e PERM. Entenda o fluxo e quando faz sentido.",
  whatIs: {
    title: "O que é o EB-3",
    body:
      "O EB-3 é a terceira preferência de vistos baseados em emprego. Abrange três subgrupos: skilled workers (2+ anos de experiência), professionals (com diploma de bacharelado) e other workers (não-qualificados). Em qualquer hipótese, exige (a) oferta formal e contínua de emprego nos EUA e (b) labor certification (PERM) emitida pelo Departamento do Trabalho.",
  },
  qualifies: {
    title: "O que o USCIS exige no EB-3",
    intro:
      "O EB-3 é apropriado quando NÃO há perfil para EB-2 NIW ou EB-1 e existe um empregador americano disposto a conduzir o patrocínio, assumindo custos e prazos do PERM. É um caminho que depende fortemente da empresa.",
    legalBasis: "Requisitos definidos no regulamento federal 8 CFR 204.5(l) e no processo de labor certification (20 CFR 656), conduzido pelo Departamento do Trabalho.",
    items: [
      { title: "Há empregador disposto a patrocinar", body: "Empresa americana que aceita conduzir PERM, comprovar inexistência de mão-de-obra local e patrocinar o processo." },
      { title: "Profissional qualificado", body: "Diploma de bacharelado (professionals) ou pelo menos 2 anos de experiência/treinamento (skilled workers)." },
      { title: "Disponibilidade para o tempo do PERM", body: "O PERM costuma ser a etapa mais demorada; o processo total depende da agenda do empregador e do Departamento do Trabalho." },
    ],
  },
  process: {
    title: "Como funciona o processo",
    steps: [
      { num: "01", title: "PERM (Labor Certification)", body: "O empregador comprova ao DOL que não há trabalhador americano disponível e qualificado para a vaga, seguindo recrutamento formal regulado." },
      { num: "02", title: "Processo I-140", body: "Aprovado o PERM, o empregador submete a I-140 ao USCIS em favor do profissional." },
      { num: "03", title: "Ajuste / consular", body: "Aprovada a I-140, segue-se o ajuste de status ou processamento consular, com Green Card para o requerente, cônjuge e filhos." },
    ],
    note:
      "Os prazos variam significativamente em função do PERM e da disponibilidade do empregador. Não há como prometer cronograma.",
  },
  family: {
    title: "Green Card para a família",
    body:
      "Cônjuge e filhos solteiros menores de 21 anos são incluídos como derivados, junto do requerente principal. A idade do filho é apurada segundo as regras do Child Status Protection Act, que em determinados casos preserva o benefício mesmo após os 21 anos — o tempo de processamento influencia esse cálculo.",
  },
  faq: [
    {
      q: "Posso fazer EB-3 sem empresa patrocinadora?",
      a: "Não. O EB-3 exige obrigatoriamente oferta de emprego nos EUA e processo de PERM conduzido pelo empregador.",
    },
    {
      q: "EB-3 ou EB-2 NIW: qual escolher?",
      a: "Quando há perfil para EB-2 NIW, ele costuma ser o caminho mais autônomo, dispensa patrocinador e PERM. EB-3 é indicado quando o perfil não se enquadra nas categorias autônomas e existe uma oferta concreta de emprego.",
    },
    {
      q: "Quanto tempo leva?",
      a: "É a categoria mais dependente de terceiros, o PERM costuma ser a etapa mais longa. Não trabalhamos com prazos garantidos.",
    },
    {
      q: "As taxas do governo americano estão incluídas no valor da assessoria?",
      a: "Não. Existem duas coisas diferentes: (1) as taxas oficiais do governo americano (USCIS), pagas diretamente ao órgão; e (2) o valor da nossa assessoria, que cobre a preparação e organização estratégica do seu processo. São separados. As taxas do USCIS são definidas pelo próprio governo, podem mudar e são pagas por formulário. Na fase final (Green Card), parte das taxas é individual — cônjuge e filhos têm suas próprias taxas. Na sua análise gratuita, explicamos exatamente quais taxas se aplicam ao seu caso e à sua família.",
    },
    {
      q: "Preciso pagar taxas separadas para minha família?",
      a: "Na etapa da petição inicial, a taxa é do requerente principal. Já na etapa final de Green Card, cônjuge e filhos entram com seus próprios formulários e taxas — há custos individuais por pessoa nessa fase. Detalhamos na análise, conforme o tamanho da sua família.",
    },
  ],
  ctaTitle: "Tem oferta de emprego nos EUA?",
  ctaSubtitle: "Em 48h apresentamos um panorama das categorias aplicáveis ao seu contexto (EB-3, EB-2 NIW ou EB-1).",
};

/* ---------------- O-1 (não-imigrante, ponte para EB-1A) ---------------- */
const o1: VisaPage = {
  slug: "o1",
  eyebrow: "VISTO O-1",
  h1: "O-1: visto temporário para profissionais de habilidade extraordinária",
  intro:
    "O O-1 é um visto de não-imigrante destinado a pessoas com habilidade extraordinária em ciências, artes, educação, negócios ou atletismo (O-1A) ou em cinema e televisão (O-1B). É temporário — não é Green Card — e admite peticionário na forma de empregador OU agente nos EUA, sem exigir oferta de emprego permanente.",
  metaTitle: "O-1: visto temporário por habilidade extraordinária | Status na América",
  metaDescription:
    "O-1 é o visto de não-imigrante para habilidade extraordinária. Admite empregador ou agente peticionário, sem exigir oferta permanente. Entenda critérios, processo e limites.",
  whatIs: {
    title: "O que é o O-1",
    body:
      "O O-1 é um visto de não-imigrante (temporário) para pessoas com habilidade extraordinária. A subcategoria O-1A cobre ciências, educação, negócios e atletismo; a O-1B cobre artes, cinema e televisão. Diferente do EB-1A, o O-1 exige um peticionário nos Estados Unidos — pode ser um empregador americano OU um agente, o que permite que profissionais autônomos utilizem a categoria. Não é Green Card e não confere residência permanente, mas é frequentemente utilizado como ponte enquanto se constrói o caso do EB-1A.",
  },
  qualifies: {
    title: "O que o USCIS avalia no O-1",
    intro:
      "Exige-se demonstração de habilidade extraordinária, mediante evidências em ao menos 3 dos 8 critérios oficiais — ou, alternativamente, um prêmio internacional único de alto porte. A lista abaixo é um resumo; a relação completa está no regulamento federal.",
    legalBasis: "Critérios definidos no regulamento federal 8 CFR 214.2(o)(3).",
    items: [
      { title: "Prêmios ou reconhecimentos nacionais/internacionais", body: "Distinções relevantes recebidas pela atuação na área." },
      { title: "Associações que exigem realizações excepcionais", body: "Filiação a entidades que admitem membros por conquistas de destaque." },
      { title: "Publicações sobre o profissional em mídia especializada ou de grande circulação", body: "Matérias tratando do trabalho da pessoa, não escritas por ela." },
      { title: "Atuação como julgador do trabalho de pares", body: "Participação em bancas, revisões por pares, comitês de avaliação." },
      { title: "Contribuições originais de grande significância", body: "Métodos, pesquisas, obras, produtos ou processos com impacto comprovado." },
      { title: "Autoria de artigos acadêmicos ou profissionais", body: "Publicações em veículos especializados na área." },
      { title: "Papel crítico ou essencial em organizações de destaque", body: "Função de liderança comprovada em entidades reconhecidas." },
      { title: "Remuneração elevada ou outros indicadores da área", body: "Salário/cachê acima da média do setor ou sucesso comercial (para artes)." },
    ],
  },
  process: {
    title: "Como preparamos a sua documentação",
    steps: [
      { num: "01", title: "Diagnóstico do perfil", body: "Mapeamento das evidências disponíveis, identificação do peticionário viável (empregador ou agente) e do enquadramento O-1A ou O-1B." },
      { num: "02", title: "Organização documental", body: "Preparação das evidências, cartas de consulta (advisory opinion) da associação da área e do dossiê de suporte." },
      { num: "03", title: "Processo I-129", body: "Organização do conjunto documental para protocolo, conduzido pelo peticionário nos EUA. Premium Processing disponível." },
      { num: "04", title: "Emissão do visto", body: "Aprovada a petição, o profissional obtém o visto no consulado; cônjuge e filhos entram com O-3." },
    ],
    note:
      "O O-1 é geralmente concedido por até 3 anos, com renovações por períodos de até 1 ano. É comum ser utilizado como ponte enquanto o EB-1A é preparado. Não trabalhamos com prazos garantidos.",
  },
  family: {
    title: "Família em status O-3",
    body:
      "Cônjuge e filhos solteiros menores de 21 anos podem acompanhar o titular como O-3. Este é um ponto crítico do O-1: o status O-3 NÃO autoriza trabalho nos Estados Unidos. Os dependentes podem estudar, mas não podem exercer atividade remunerada — diferença essencial em relação às categorias EB (EB-1, EB-2 NIW e EB-3), em que cônjuge e filhos recebem Green Card e podem trabalhar livremente.",
  },
  faq: [
    {
      q: "O-1 é Green Card?",
      a: "Não. O O-1 é um visto temporário (não-imigrante). Ele autoriza estadia e trabalho no perfil da petição, mas não confere residência permanente. Muitos profissionais utilizam o O-1 como ponte enquanto constroem o caso do EB-1A (Green Card por habilidade extraordinária).",
    },
    {
      q: "Preciso de empregador para o O-1?",
      a: "Precisa de peticionário nos EUA, mas ele pode ser um empregador OU um agente. O modelo de agente permite que profissionais autônomos utilizem a categoria, sem depender de oferta de emprego permanente. É uma flexibilidade que o EB-3 não oferece.",
    },
    {
      q: "Meu cônjuge pode trabalhar com O-3?",
      a: "Não. O status O-3 (para cônjuge e filhos) autoriza permanência e estudo nos EUA, mas não autoriza trabalho. Se o casal precisa que ambos trabalhem, o caminho mais adequado costuma ser uma categoria EB, em que o cônjuge recebe Green Card e pode trabalhar sem restrição.",
    },
    {
      q: "Qual a diferença entre O-1 e EB-1A?",
      a: "Ambos exigem habilidade extraordinária, mas o EB-1A é Green Card (permanente) e dispensa peticionário — o próprio profissional peticiona. O O-1 é temporário e exige peticionário (empregador ou agente). Na prática, muitos casos começam pelo O-1 (mais rápido, com Premium Processing) e evoluem para o EB-1A.",
    },
    {
      q: "Quanto tempo leva?",
      a: "A preparação documental leva algumas semanas a alguns meses, conforme a complexidade das evidências. O USCIS costuma decidir a I-129 em prazos que podem ser encurtados por Premium Processing. Depois vem o processamento consular. Não trabalhamos com prazos garantidos.",
    },
    {
      q: "As taxas do governo americano estão incluídas no valor da assessoria?",
      a: "Não. Existem duas coisas diferentes: (1) as taxas oficiais do governo americano (USCIS), pagas diretamente ao órgão; e (2) o valor da nossa assessoria, que cobre a preparação e organização estratégica do seu processo. São separados. As taxas do USCIS são definidas pelo próprio governo, podem mudar e são pagas por formulário. Na sua análise gratuita, explicamos exatamente quais taxas se aplicam ao seu caso e à sua família.",
    },
  ],
  ctaTitle: "Entenda como o seu perfil se posiciona diante dos critérios do USCIS para o O-1.",
  ctaSubtitle: "Análise gratuita e confidencial. Em até 48h nossa equipe organiza um panorama das categorias aplicáveis — O-1, EB-1A e correlatas.",
};

export const VISA_PAGES: Record<VisaSlug, VisaPage> = {
  "eb2-niw": eb2niw,
  "eb1": eb1,
  "eb3": eb3,
  "o1": o1,
};

/** Chaves editáveis (site_content) por página, admin pode sobrescrever. */
export const VISA_EDITABLE_KEYS = (slug: VisaSlug) =>
  [
    `visa.${slug}.h1`,
    `visa.${slug}.intro`,
    `visa.${slug}.ctaTitle`,
    `visa.${slug}.ctaSubtitle`,
  ] as const;
