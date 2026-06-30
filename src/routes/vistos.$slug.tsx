/**
 * /vistos/$slug — página-mãe do pilar de visto.
 *
 * Renderiza a página COMPLETA. Cada dobra tem id e o SectionTOC sticky
 * acompanha o scroll, atualizando #hash e title via DynamicSectionHead.
 *
 * Sub-rotas canônicas por dobra ficam em /vistos/$slug/$secao
 * (arquivo vistos.$slug.$secao.tsx) — mesma página, head próprio.
 */

import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import {
  OrganizationJsonLd, ServiceJsonLd, FAQJsonLd, BreadcrumbJsonLd,
} from "@/components/site/Seo";
import { VISA_PAGES, type VisaSlug, type VisaPage } from "@/lib/visaPages";
import { VisaPageBody } from "@/components/site/visa/VisaPageBody";
import { DynamicSectionHead } from "@/components/site/DynamicSectionHead";
import { SectionTOC } from "@/components/site/SectionTOC";
import { VISA_SECTIONS } from "@/lib/sectionMap";

export const Route = createFileRoute("/vistos/$slug")({
  loader: ({ params }): { page: VisaPage } => {
    const page = VISA_PAGES[params.slug as VisaSlug];
    if (!page) throw notFound();
    return { page };
  },
  head: ({ params, loaderData }) => {
    const page = loaderData?.page ?? VISA_PAGES[params.slug as VisaSlug];
    if (!page) {
      return { meta: [{ title: "Visto não encontrado | Status na América" }] };
    }
    return {
      meta: [
        { title: page.metaTitle },
        { name: "description", content: page.metaDescription },
        { name: "robots", content: "index,follow" },
        { property: "og:title", content: page.metaTitle },
        { property: "og:description", content: page.metaDescription },
        { property: "og:url", content: `/vistos/${page.slug}` },
        { property: "og:type", content: "article" },
        { property: "og:locale", content: "pt_BR" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: page.metaTitle },
        { name: "twitter:description", content: page.metaDescription },
      ],
      links: [{ rel: "canonical", href: `/vistos/${page.slug}` }],
    };
  },
  notFoundComponent: () => (
    <>
      <Header />
      <main className="pt-32 pb-24 min-h-[60vh] container-x">
        <h1 className="font-display text-4xl">Visto não encontrado</h1>
        <p className="mt-4 text-foreground/70">Conheça os vistos disponíveis:</p>
        <ul className="mt-4 space-y-2">
          <li><Link to="/vistos/$slug" params={{ slug: "eb2-niw" }} className="text-gold underline">EB-2 NIW</Link></li>
          <li><Link to="/vistos/$slug" params={{ slug: "eb1" }} className="text-gold underline">EB-1</Link></li>
          <li><Link to="/vistos/$slug" params={{ slug: "eb3" }} className="text-gold underline">EB-3</Link></li>
        </ul>
      </main>
      <Footer />
    </>
  ),
  component: VisaPageRoute,
});

function VisaPageRoute() {
  const { page } = Route.useLoaderData() as { page: VisaPage };

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
      <FAQJsonLd items={page.faq} />
      <BreadcrumbJsonLd
        items={[
          { name: "Início", url: "/" },
          { name: "Vistos", url: "/" },
          { name: page.h1, url: `/vistos/${page.slug}` },
        ]}
      />

      {/* URL por dobra — sticky TOC + scroll-spy + title/canonical dinâmicos. */}
      <DynamicSectionHead sections={VISA_SECTIONS} baseTitle={page.h1} />
      <SectionTOC sections={VISA_SECTIONS} variant="ink" />

      <VisaPageBody page={page} />

      <Footer />
    </>
  );
}
