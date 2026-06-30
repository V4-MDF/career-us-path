import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import {
  AuthorityStrip, ContrastBrasilEUA, CtaForm, FAQ, Hero, NiwSection,
  PersonaCards, ProcessSteps, SalaryCompare, Testimonials, VisaCards, WhyUs,
} from "@/components/site/sections";
import { OrganizationJsonLd } from "@/components/site/Seo";

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
      <Header />
      <main>
        <Hero />
        <AuthorityStrip />
        <ContrastBrasilEUA />
        <NiwSection />
        <VisaCards />
        <PersonaCards />
        <ProcessSteps />
        <WhyUs />
        <SalaryCompare />
        <Testimonials />
        <FAQ />
        <CtaForm />
      </main>
      <Footer />
    </>
  );
}
