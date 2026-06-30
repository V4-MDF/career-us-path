/**
 * Componentes JSON-LD reutilizáveis.
 *
 * Estes componentes renderizam <script type="application/ld+json"> inline.
 * São usados dentro do componente da rota (não em head().scripts) para
 * permitir composição rica baseada em props/loaderData.
 *
 * Esquemas disponíveis:
 *  - OrganizationJsonLd   → global (LegalService + sameAs + contactPoint)
 *  - WebSiteJsonLd        → home (SearchAction opcional)
 *  - ServiceJsonLd        → páginas-pilar de visto
 *  - FAQJsonLd            → FAQPage (home + páginas de visto + posts c/ FAQ)
 *  - BreadcrumbJsonLd     → posts do blog e páginas profundas
 *  - ArticleJsonLd        → posts do blog
 *
 * Observação: usamos LegalService como @type principal — mais preciso
 * que "Organization" genérico para nosso ramo de atuação documental.
 */

function ldScript(data: object) {
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

const ORG_BASE = {
  "@type": "LegalService",
  name: "Status na América",
  alternateName: "Status na América — Imigração EB",
  description:
    "Assessoria de mobilidade migratória para profissionais brasileiros — vistos EB (EB-2 NIW, EB-1, EB-3) e Green Card.",
  url: "/",
  logo: "/og-image.jpg",
  image: "/og-image.jpg",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Orlando",
    addressRegion: "FL",
    addressCountry: "US",
  },
  areaServed: [
    { "@type": "Country", name: "Brasil" },
    { "@type": "Country", name: "Estados Unidos" },
  ],
  knowsLanguage: ["pt-BR", "en"],
  serviceType: ["EB-2 NIW", "EB-1", "EB-3", "Green Card"],
  // contactPoint e sameAs são adicionados pelo admin quando os números/URLs forem validados
};

export function OrganizationJsonLd() {
  return ldScript({ "@context": "https://schema.org", ...ORG_BASE });
}

export function WebSiteJsonLd() {
  return ldScript({
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Status na América",
    url: "/",
    inLanguage: "pt-BR",
    publisher: { ...ORG_BASE },
  });
}

interface ServiceLdProps {
  name: string;
  description: string;
  url: string;
  serviceType?: string;
}
export function ServiceJsonLd({ name, description, url, serviceType }: ServiceLdProps) {
  return ldScript({
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    serviceType: serviceType ?? name,
    url,
    provider: { ...ORG_BASE },
    areaServed: [
      { "@type": "Country", name: "Brasil" },
      { "@type": "Country", name: "Estados Unidos" },
    ],
  });
}

export interface FaqItem {
  q: string;
  a: string;
}
export function FAQJsonLd({ items }: { items: FaqItem[] }) {
  return ldScript({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.q,
      acceptedAnswer: { "@type": "Answer", text: it.a },
    })),
  });
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}
export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  return ldScript({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  });
}

interface ArticleLdProps {
  headline: string;
  description: string;
  image: string;
  datePublished: string;
  dateModified?: string;
  author: string;
  url: string;
}
export function ArticleJsonLd(p: ArticleLdProps) {
  return ldScript({
    "@context": "https://schema.org",
    "@type": "Article",
    headline: p.headline,
    description: p.description,
    image: [p.image],
    datePublished: p.datePublished,
    dateModified: p.dateModified ?? p.datePublished,
    author: { "@type": "Person", name: p.author },
    publisher: { ...ORG_BASE },
    mainEntityOfPage: { "@type": "WebPage", "@id": p.url },
    inLanguage: "pt-BR",
  });
}
