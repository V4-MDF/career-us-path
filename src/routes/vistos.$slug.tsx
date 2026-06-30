import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/site/StubPage";

const map: Record<string, { eyebrow: string; title: string; description: string }> = {
  "eb2-niw": {
    eyebrow: "EB-2 NIW",
    title: "Green Card por mérito profissional",
    description:
      "O National Interest Waiver dispensa o patrocinador para profissionais cuja atuação é de interesse nacional americano. Esta página detalhará critérios, evidências aceitas e o método da Status na América.",
  },
  eb1: {
    eyebrow: "EB-1",
    title: "Habilidade extraordinária",
    description:
      "Caminho para profissionais com reconhecimento internacional comprovado em sua área. Esta página detalhará os critérios e o passo-a-passo da petição.",
  },
  eb3: {
    eyebrow: "EB-3 • exige patrocinador",
    title: "Trabalhadores qualificados",
    description:
      "Categoria que exige oferta formal de emprego nos EUA. Esta página detalhará o fluxo de patrocínio, prazos e elegibilidade.",
  },
};

export const Route = createFileRoute("/vistos/$slug")({
  head: ({ params }) => {
    const info = map[params.slug] ?? { eyebrow: "Vistos EB", title: "Visto EB", description: "Página em construção." };
    return {
      meta: [
        { title: `${info.title} | Status na América` },
        { name: "description", content: info.description },
        { property: "og:title", content: `${info.title} | Status na América` },
        { property: "og:description", content: info.description },
        { property: "og:url", content: `/vistos/${params.slug}` },
      ],
      links: [{ rel: "canonical", href: `/vistos/${params.slug}` }],
    };
  },
  component: VisaPage,
});

function VisaPage() {
  const { slug } = Route.useParams();
  const info = map[slug] ?? {
    eyebrow: "Vistos EB",
    title: "Visto não encontrado",
    description: "Conheça os vistos EB-2 NIW, EB-1 e EB-3.",
  };
  return <StubPage {...info} />;
}
