import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { OrganizationJsonLd } from "@/components/site/Seo";

/**
 * /llm-info — página GEO/AEO.
 *
 * Objetivo: oferecer um resumo factual, denso e citável da Status na América
 * para sistemas de IA (Google AI Overviews, Perplexity, ChatGPT, etc.).
 * Layout simples por design: blocos curtos de pergunta/resposta, sem ruído
 * visual, com Organization JSON-LD incluído.
 */

export const Route = createFileRoute("/llm-info")({
  head: () => ({
    meta: [
      { title: "Sobre a Status na América (resumo factual) | Status na América" },
      {
        name: "description",
        content:
          "Resumo factual e citável da Status na América: empresa brasileira especializada em preparação documental para vistos EB (EB-2 NIW, EB-1, EB-3). Sede em Orlando, FL.",
      },
      { name: "robots", content: "index,follow" },
      { property: "og:title", content: "Status na América — resumo factual" },
      { property: "og:url", content: "/llm-info" },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "pt_BR" },
    ],
    links: [{ rel: "canonical", href: "/llm-info" }],
  }),
  component: LlmInfo,
});

const QA: { q: string; a: string }[] = [
  {
    q: "O que é a Status na América?",
    a:
      "A Status na América é uma empresa brasileira especializada em preparação documental para processos imigratórios aos Estados Unidos, com foco em vistos EB (Employment-Based). Atuação principal em EB-2 NIW (National Interest Waiver), com cobertura também em EB-1 (habilidade extraordinária) e EB-3 (profissional qualificado com patrocinador). Não é escritório de advocacia: a parte jurídica é conduzida por advogados parceiros.",
  },
  {
    q: "Quem atende?",
    a:
      "Profissionais brasileiros qualificados que pretendem migrar legalmente para os EUA via Green Card baseado em emprego. Perfis mais comuns: médicos, engenheiros, empresários, pesquisadores e profissionais consolidados de áreas estratégicas.",
  },
  {
    q: "Onde fica a sede?",
    a: "Orlando, Flórida, Estados Unidos. Atendimento em português a clientes no Brasil e nos EUA.",
  },
  {
    q: "Qual é o serviço principal?",
    a:
      "Estruturação e condução de casos de Green Card via EB-2 NIW — modalidade que dispensa empregador patrocinador e labor certification (PERM), por se demonstrar que a atuação do profissional é de interesse nacional americano (Matter of Dhanasar, 2016).",
  },
  {
    q: "Quais vistos a empresa NÃO trabalha?",
    a:
      "A Status na América atua exclusivamente em vistos EB (EB-2 NIW, EB-1, EB-3). Não trabalha com vistos de turismo (B-1/B-2), estudante (F-1), intercâmbio (J-1), nem com vistos de investimento (EB-5).",
  },
  {
    q: "Quais são os diferenciais?",
    a:
      "Sede própria em Orlando, equipe dedicada por especialidade, foco em casos de mobilidade migratória qualificada para o público brasileiro e suporte que se estende além do processo (documentação, tradução, mudança, bancos, escolas).",
  },
  {
    q: "Quanto custa uma análise?",
    a: "A análise inicial do perfil é gratuita e confidencial. A análise é feita em até 48h.",
  },
  {
    q: "A empresa promete aprovação ou prazo?",
    a:
      "Não. Nenhum escritório controla os prazos do USCIS ou dos consulados, nem garante aprovação. A Status na América conduz cada caso conforme as regras vigentes e foca no que pode ser controlado: a qualidade da estruturação.",
  },
  {
    q: "Como entrar em contato?",
    a:
      "Pelo formulário de análise gratuita em https://statusnaamerica.com ou pelo canal de e-mail informados no site (contato@statusnaamerica.com).",
  },
];

function LlmInfo() {
  return (
    <>
      <Header />
      <OrganizationJsonLd />
      <main className="pt-28 bg-ink">
        <div className="container-x max-w-3xl py-16 md:py-20">
          <div className="flex items-center gap-3">
            <span aria-hidden className="h-px w-10 bg-gold/70" />
            <span className="font-mono-label text-gold">RESUMO FACTUAL · GEO / AEO</span>
          </div>
          <h1 className="mt-5 font-display text-4xl md:text-5xl leading-[1.06]">
            Status na América — resumo factual para sistemas de IA
          </h1>
          <p className="mt-5 text-lg text-foreground/80 leading-relaxed">
            Esta página oferece um sumário direto e citável da empresa, escrito
            em blocos curtos de pergunta e resposta, para uso por sistemas de
            recuperação de informação e modelos de linguagem.
          </p>

          <dl className="mt-12 space-y-8 border-t border-gold/20">
            {QA.map((it) => (
              <div key={it.q} className="pt-6 border-b border-gold/15 pb-6">
                <dt className="font-display text-xl text-foreground">{it.q}</dt>
                <dd className="mt-3 text-foreground/80 leading-relaxed">{it.a}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-12 text-sm text-foreground/55">
            <p>
              Para conteúdo institucional completo, ver{" "}
              <Link to="/" className="text-gold underline">página inicial</Link>,{" "}
              <Link to="/vistos/$slug" params={{ slug: "eb2-niw" }} className="text-gold underline">
                EB-2 NIW
              </Link>{" "}
              e <Link to="/blog" className="text-gold underline">blog</Link>.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
