import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/site/StubPage";

// Landing pages segmentadas — serão geradas pelo motor de LPs do Prompt 2.
const map: Record<string, { eyebrow: string; title: string; description: string }> = {
  medicos: {
    eyebrow: "Para médicos",
    title: "O caminho do médico brasileiro para o Green Card",
    description: "Estratégia EB-2 NIW para médicos consolidados — especialidades, residência e adaptação clínica nos EUA.",
  },
  engenheiros: {
    eyebrow: "Para engenheiros",
    title: "O caminho do engenheiro brasileiro para o Green Card",
    description: "Estratégia EB-2 NIW para engenheiros sêniores em infraestrutura, energia, tecnologia e mais.",
  },
  empresarios: {
    eyebrow: "Para empresários",
    title: "O caminho do empresário brasileiro para o Green Card",
    description: "Geração de empregos, impostos e impacto setorial como pilares da sua petição EB-2 NIW.",
  },
};

export const Route = createFileRoute("/lp/$slug")({
  head: ({ params }) => {
    const info = map[params.slug] ?? { eyebrow: "LP", title: "Landing page", description: "Página em construção." };
    return {
      meta: [
        { title: `${info.title} | Status na América` },
        { name: "description", content: info.description },
        { property: "og:title", content: info.title },
        { property: "og:description", content: info.description },
        { property: "og:url", content: `/lp/${params.slug}` },
      ],
      links: [{ rel: "canonical", href: `/lp/${params.slug}` }],
    };
  },
  component: LpPage,
});

function LpPage() {
  const { slug } = Route.useParams();
  const info = map[slug] ?? { eyebrow: "Landing page", title: "Em breve", description: "Conteúdo segmentado em produção." };
  return <StubPage {...info} />;
}
