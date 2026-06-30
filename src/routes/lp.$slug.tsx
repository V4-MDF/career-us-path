import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LandingPageTemplate, useLpState } from "@/components/site/lp/LandingPageTemplate";

/**
 * Rota dinâmica /lp/:slug — motor de Landing Pages.
 *
 * Segmentos e variantes A/B vivem no dataStore (seed em src/lib/segments.ts).
 * Hero é A/B (sticky via abEngine); restante da LP vem do segmento.
 * Se o slug não existir ou o segmento estiver inativo → redireciona para Home.
 *
 * SEO: meta_title/meta_description do segmento; noindex opcional.
 * Como segmentos vivem no client (localStorage), o head() usa o slug como
 * fallback e o admin pode complementar metas server-side no próximo prompt.
 */

const slugDefaults: Record<string, { title: string; description: string }> = {
  medicos: {
    title: "Green Card para médicos brasileiros | EB-2 NIW | Status na América",
    description:
      "Médico e quer construir carreira nos EUA? Veja como conquistar o Green Card por mérito pelo EB-2 NIW, sem patrocinador. Avaliação gratuita.",
  },
  engenheiros: {
    title: "Green Card para engenheiros brasileiros | EB-2 NIW | Status na América",
    description:
      "Engenheiro e quer carreira nos EUA? Conquiste o Green Card por mérito pelo EB-2 NIW, sem patrocinador. Avaliação gratuita do seu perfil.",
  },
  empresarios: {
    title: "Green Card para empresários brasileiros | EB-2 NIW | Status na América",
    description:
      "Empresário e quer migrar com a família para os EUA? Green Card por mérito pelo EB-2 NIW. Avaliação gratuita do seu perfil.",
  },
};

export const Route = createFileRoute("/lp/$slug")({
  head: ({ params }) => {
    const d = slugDefaults[params.slug] ?? {
      title: "Landing page | Status na América",
      description: "Conquiste o Green Card americano pelo mérito da sua carreira.",
    };
    return {
      meta: [
        { title: d.title },
        { name: "description", content: d.description },
        { property: "og:title", content: d.title },
        { property: "og:description", content: d.description },
        { property: "og:url", content: `/lp/${params.slug}` },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: `/lp/${params.slug}` }],
    };
  },
  component: LpPage,
});

function LpPage() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const { loading, segment, variant, notFound } = useLpState(slug);

  // noindex dinâmico se o admin desligar a indexação do segmento.
  useEffect(() => {
    if (!segment?.noindex) return;
    const tag = document.createElement("meta");
    tag.name = "robots";
    tag.content = "noindex,nofollow";
    document.head.appendChild(tag);
    return () => { document.head.removeChild(tag); };
  }, [segment?.noindex]);

  useEffect(() => {
    if (notFound) navigate({ to: "/", replace: true });
  }, [notFound, navigate]);

  if (loading || !segment) {
    return (
      <div className="min-h-screen grid place-items-center text-muted-foreground">
        Carregando…
      </div>
    );
  }

  return <LandingPageTemplate segment={segment} variant={variant} />;
}
