import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import {
  AuthorityStrip, ContrastBrasilEUA, CtaBanner, FAQ, Hero, HeroAssessment, LegacySection,
  NiwSection, PersonaCards, ProcessSteps, SalaryCompare, Testimonials,
  VisaCards, WhyUs,
} from "@/components/site/sections";
import { OrganizationJsonLd } from "@/components/site/Seo";
import { DynamicSectionHead } from "@/components/site/DynamicSectionHead";
import { SectionTOC } from "@/components/site/SectionTOC";
import { HOME_SECTIONS } from "@/lib/sectionMap";
import { BlogStrip } from "@/components/site/BlogStrip";
import { ConstellationCanvas } from "@/components/site/visuals/ConstellationCanvas";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Status na América | Green Card EB-2 NIW para profissionais brasileiros" },
      {
        name: "description",
        content:
          "Imigração legal para os EUA por mérito profissional. Assessoria EB-2 NIW, EB-1 e EB-3 para profissionais brasileiros consolidados, com Green Card para cônjuge e filhos.",
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

function Home() {
  return (
    <>
      <OrganizationJsonLd />
      <DynamicSectionHead sections={HOME_SECTIONS} baseTitle="Green Card EB-2 NIW" />
      {/* Fundo interativo global — constellation reativa ao mouse. */}
      <div aria-hidden className="fixed inset-0 -z-20 pointer-events-none">
        <ConstellationCanvas />
      </div>
      <Header />
      <SectionTOC sections={HOME_SECTIONS} />
      <main>
        <Hero />
        <HeroAssessment />
        <AuthorityStrip />
        <BlogStrip />
        <ContrastBrasilEUA />
        <NiwSection />
        <VisaCards />
        <PersonaCards />
        <ProcessSteps />
        <WhyUs />
        <LegacySection />
        <SalaryCompare />
        <Testimonials />
        <FAQ />
        <CtaBanner />
      </main>
      <Footer />
    </>
  );
}
