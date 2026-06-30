import { createFileRoute } from "@tanstack/react-router";
import type { ComponentType } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import {
  ContrastBrasilEUA, CtaBanner, FAQ, Hero, LegacySection,
  NiwSection, PreQualPromo, ProcessSteps, SalaryCompare, Testimonials,
  VisaCards, WhyUs,
} from "@/components/site/sections";
import { OrganizationJsonLd } from "@/components/site/Seo";
import { DynamicSectionHead } from "@/components/site/DynamicSectionHead";
import { HOME_SECTIONS } from "@/lib/sectionMap";
import { BlogStrip } from "@/components/site/BlogStrip";
import { ConstellationCanvas } from "@/components/site/visuals/ConstellationCanvas";
import { useOrderedSections } from "@/lib/pageStructure";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Status na América | Green Card EB-2 NIW para profissionais brasileiros" },
      {
        name: "description",
        content:
          "Imigração legal para os EUA por mérito profissional. Preparação documental especializada para vistos EB-2 NIW, EB-1 e EB-3 — profissionais brasileiros consolidados, com Green Card para cônjuge e filhos.",
      },
      { name: "robots", content: "index,follow" },
      { property: "og:title", content: "Status na América | Green Card EB-2 NIW" },
      {
        property: "og:description",
        content:
          "Conquiste o Green Card americano pelo mérito da sua carreira. Avaliação gratuita do seu perfil EB-2 NIW.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
      { property: "og:image", content: "/og-image.jpg" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Status na América | Green Card EB-2 NIW" },
      { name: "twitter:description", content: "Imigração para os EUA por mérito profissional." },
      { name: "twitter:image", content: "/og-image.jpg" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Home,
});

/**
 * Registry de dobras da Home: cada id do `sectionMap` mapeia para o componente.
 * A ordem efetiva e a visibilidade vêm de `useOrderedSections("home")`, que lê
 * de dataStore["page_sections"]["home"] — editado em /admin/estrutura.
 *
 * Ao criar uma dobra nova: adicionar componente exportado em `sections.tsx`,
 * registrar o id em HOME_SECTIONS (sectionMap.ts), em DEFAULT_LAYOUTS.home
 * (pageStructure.ts) e neste registry.
 */
const HOME_REGISTRY: Record<string, ComponentType> = {
  "abertura": Hero,
  "blog-em-destaque": BlogStrip,
  "brasil-vs-eua": ContrastBrasilEUA,
  "eb-2-niw": NiwSection,
  "vistos-eb": VisaCards,
  "processo-eb-2-niw": ProcessSteps,
  "por-que-status": WhyUs,
  "legado": LegacySection,
  "renda-em-dolar": SalaryCompare,
  "depoimentos": Testimonials,
  "duvidas-frequentes": FAQ,
  "pre-qualificacao": PreQualPromo,
  "avaliacao-gratuita": CtaBanner,
};

function Home() {
  const layout = useOrderedSections("home");
  if (typeof window !== "undefined") (window as any).__layoutDebug = layout.map(l => l.id);


  return (
    <>
      <OrganizationJsonLd />
      <DynamicSectionHead sections={HOME_SECTIONS} baseTitle="Green Card EB-2 NIW" />
      {/* Fundo interativo global — constellation reativa ao mouse. */}
      <div aria-hidden className="fixed inset-0 -z-20 pointer-events-none">
        <ConstellationCanvas />
      </div>
      <Header />
      <main>
        {layout
          .filter((s) => s.active)
          .map((s) => {
            const Cmp = HOME_REGISTRY[s.id];
            return Cmp ? <Cmp key={s.id} /> : null;
          })}
      </main>
      <Footer />
    </>
  );
}
