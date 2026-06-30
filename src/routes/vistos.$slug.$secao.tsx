/**
 * /vistos/$slug/$secao — sub-rota canônica por dobra de visto.
 *
 * Renderiza a MESMA página completa (VisaPageBody), mas com:
 *  - <title>, og:* e <description> derivados da dobra (sectionMap).
 *  - canonical apontando para /vistos/$slug/$secao (não para a página-mãe).
 *  - JSON-LD WebPage + BreadcrumbList Home → Visto → Dobra.
 *  - Auto-scroll até a section ao montar.
 *
 * Permite que cada dobra rankeie como página própria sem fragmentar o
 * conteúdo: o crawler vê uma versão otimizada para a query daquela dobra,
 * e o usuário ainda navega o pilar inteiro.
 */

import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import {
  OrganizationJsonLd, ServiceJsonLd, FAQJsonLd, BreadcrumbJsonLd,
} from "@/components/site/Seo";
import { VISA_PAGES, type VisaSlug, type VisaPage } from "@/lib/visaPages";
import { VisaPageBody } from "@/components/site/visa/VisaPageBody";
import { DynamicSectionHead } from "@/components/site/DynamicSectionHead";
import { SectionTOC } from "@/components/site/SectionTOC";
import { VISA_SECTIONS, getVisaSection, type SectionDef } from "@/lib/sectionMap";
import { scrollToSection } from "@/hooks/useScrollSpy";

interface LoaderData {
  page: VisaPage;
  section: SectionDef;
}

export const Route = createFileRoute("/vistos/$slug/$secao")({
  loader: ({ params }): LoaderData => {
    const page = VISA_PAGES[params.slug as VisaSlug];
    if (!page) throw notFound();
    const section = getVisaSection(params.secao);
    if (!section) throw notFound();
    return { page, section };
  },
  head: ({ params, loaderData }) => {
    const d = loaderData;
    if (!d) {
      return { meta: [{ title: "Seção não encontrada | Status na América" }] };
    }
    const { page, section } = d;
    const title = `${section.label} — ${page.h1} | Status na América`;
    const description = section.intent ?? page.metaDescription;
    const url = `/vistos/${page.slug}/${section.id}`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { name: "robots", content: "index,follow" },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: url },
        { property: "og:type", content: "article" },
        { property: "og:locale", content: "pt_BR" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  notFoundComponent: () => (
    <>
      <Header />
      <main className="pt-32 pb-24 min-h-[60vh] container-x">
        <h1 className="font-display text-4xl">Seção não encontrada</h1>
        <p className="mt-4 text-foreground/70">
          Esta dobra não existe nesta página de visto.
        </p>
        <Link to="/" className="mt-6 inline-block text-gold underline">
          Voltar ao início
        </Link>
      </main>
      <Footer />
    </>
  ),
  component: VisaSectionRoute,
});

function VisaSectionRoute() {
  const { page, section } = Route.useLoaderData() as LoaderData;

  // Auto-scroll até a dobra ao montar (delay para fontes/layout estabilizarem).
  useEffect(() => {
    const t = window.setTimeout(() => scrollToSection(section.id, 800), 100);
    return () => window.clearTimeout(t);
  }, [section.id]);

  return (
    <>
      <Header />

      <OrganizationJsonLd />
      <ServiceJsonLd
        name={page.h1}
        description={page.metaDescription}
        url={`/vistos/${page.slug}`}
        serviceType={page.eyebrow.replace(/^VISTO\s+/, "")}
      />
      {section.id === "duvidas-frequentes" && <FAQJsonLd items={page.faq} />}
      <BreadcrumbJsonLd
        items={[
          { name: "Início", url: "/" },
          { name: "Vistos", url: "/" },
          { name: page.h1, url: `/vistos/${page.slug}` },
          { name: section.label, url: `/vistos/${page.slug}/${section.id}` },
        ]}
      />

      {/* freezeHash: estamos na sub-rota canônica — não rebobina o canonical
          com #hash; mantém o canonical apontando para a sub-rota inteira. */}
      <DynamicSectionHead
        sections={VISA_SECTIONS}
        baseTitle={page.h1}
        freezeHash
      />
      <SectionTOC sections={VISA_SECTIONS} variant="ink" />

      <VisaPageBody page={page} />

      <Footer />
    </>
  );
}
