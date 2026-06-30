import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/site/StubPage";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "Conteúdo | Status na América" },
      { name: "description", content: "Artigos sobre EB-2 NIW, vistos EB e vida nos EUA para profissionais brasileiros." },
      { property: "og:title", content: "Conteúdo | Status na América" },
      { property: "og:url", content: "/blog" },
    ],
    links: [{ rel: "canonical", href: "/blog" }],
  }),
  component: () => (
    <StubPage
      eyebrow="Conteúdo"
      title="Artigos e materiais"
      description="Em breve: guias completos sobre EB-2 NIW, EB-1, EB-3 e adaptação à vida americana."
    />
  ),
});
