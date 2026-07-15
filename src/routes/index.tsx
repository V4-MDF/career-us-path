import { createFileRoute } from "@tanstack/react-router";
import type { ComponentType } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import {
  ContrastBrasilEUA, CtaBanner, FAQ, Hero, InstitutionalVideo, LegacySection,
  NiwSection, PartnersBadges, ProcessSteps,
  SalaryCompare, Testimonials, VisaCards, WhyUs,
} from "@/components/site/sections";
import { OrganizationJsonLd, WebSiteJsonLd, FAQJsonLd } from "@/components/site/Seo";
import { BlogStrip } from "@/components/site/BlogStrip";
import { primePageSections, useOrderedSections } from "@/lib/pageStructure";
import { getPageSectionsFn } from "@/lib/pageSections.functions";
import { getPageSeoFn, buildSeoTags } from "@/lib/pageSeo.functions";
import heroFamilyUrl from "@/assets/hero-family.webp";

const OG_IMAGE = "https://lp.statusnaamerica.com/__l5e/assets-v1/db6af206-dff3-4b36-b8f2-a6d534ba74a4/og-home.jpg";

const HOME_FAQS = [
  { q: "A Status na América é confiável?", a: "Sim. Empresa registrada nos EUA (EIN 99-4846502), sede em Orlando/FL e filial no Brasil (CNPJ 62.917.376/0001-21), 130+ avaliações 5★ no Google e Facebook, acreditada pelo BBB com nota A." },
  { q: "Qual a experiência de vocês?", a: "Atuamos exclusivamente na preparação de documentação para vistos de emprego por mérito: EB-1, EB-2 NIW e EB-3. Foco gera profundidade nos critérios do USCIS." },
  { q: "Posso confiar mesmo sem ir presencialmente?", a: "Sim. A empresa é verificável por EIN, Google Business, BBB e avaliações reais. Atendimento 100% documentado e remoto, em todo o Brasil e nos EUA." },
  { q: "Já fui enganado antes. Como sei que não é mais uma promessa?", a: "Não prometemos o que não podemos garantir. Somos honestos sobre requisitos, chances reais e prazos do USCIS e consulados." },
  { q: "Meu caso é complicado, vale tentar?", a: "Casos complexos são onde o método faz mais diferença. Agende uma análise gratuita: se houver caminho, indicamos; se não houver, dizemos com a mesma honestidade." },
  { q: "Não tenho dinheiro sobrando, compensa?", a: "É um investimento significativo, e por isso a análise inicial é gratuita. Valores são apresentados com clareza após o diagnóstico, sem pressão." },
];

export const Route = createFileRoute("/")({
  head: ({ loaderData }) => {
    const { meta, links } = buildSeoTags(
      {
        title: "Status na América | Mobilidade Imigratória para brasileiros",
        description:
          "Imigração legal aos EUA por mérito profissional. Análise gratuita para vistos EB-2 NIW, EB-1 e EB-3, com Green Card para cônjuge e filhos.",
        canonical: "/",
        ogImage: OG_IMAGE,
        ogType: "website",
      },
      loaderData?.seo,
    );
    return {
      meta,
      links: [
        ...links,
        // Preload da hero LCP image.
        { rel: "preload", as: "image", href: heroFamilyUrl, fetchPriority: "high" },
      ],
    };
  },
  loader: async () => {
    const [sections, seo] = await Promise.all([
      getPageSectionsFn({ data: { page: "home" } }),
      getPageSeoFn({ data: { page: "home" } }),
    ]);
    return { sections, seo };
  },
  component: Home,
});

const HOME_REGISTRY: Record<string, ComponentType> = {
  "abertura": Hero,
  "selos-parceiros": PartnersBadges,
  "blog-em-destaque": BlogStrip,
  "brasil-vs-eua": ContrastBrasilEUA,
  "eb-2-niw": NiwSection,
  "vistos-eb": VisaCards,
  "processo-eb-2-niw": ProcessSteps,
  "por-que-status": WhyUs,
  "video-institucional": InstitutionalVideo,
  "legado": LegacySection,
  "renda-em-dolar": SalaryCompare,
  "depoimentos": Testimonials,
  "duvidas-frequentes": FAQ,
  "avaliacao-gratuita": CtaBanner,
};

function Home() {
  // Prima o store síncrono com a ordem vinda do loader (SSR + cliente),
  // para que useOrderedSections já produza o snapshot correto no 1º render.
  const { sections: initialSections } = Route.useLoaderData();
  primePageSections("home", initialSections);

  const layout = useOrderedSections("home");

  return (
    <>
      <OrganizationJsonLd />
      <WebSiteJsonLd />
      <FAQJsonLd items={HOME_FAQS} />
      <Header />
      <main>
        {layout
          .filter((s) => s.active)
          .map((s) => {
            const Cmp = HOME_REGISTRY[s.id];
            if (!Cmp) return null;
            return <Cmp key={s.id} />;
          })}
      </main>
      <Footer />
    </>
  );
}

