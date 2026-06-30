/**
 * Componente JSON-LD reutilizável (Organization / LocalBusiness).
 * Renderiza um <script type="application/ld+json"> inline.
 * Pode ser usado dentro do componente da rota; para metadados <title>/<meta>,
 * usamos head() do createFileRoute do TanStack Router.
 */

export function OrganizationJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Status na América",
    description:
      "Assessoria de mobilidade migratória para profissionais brasileiros — EB-2 NIW, EB-1 e EB-3.",
    image: "/og-image.jpg",
    url: "/",
    telephone: "[CONFIRMAR]",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Orlando",
      addressRegion: "FL",
      addressCountry: "US",
    },
    areaServed: ["BR", "US"],
    knowsLanguage: ["pt-BR", "en"],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
