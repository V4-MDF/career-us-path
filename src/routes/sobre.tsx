import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/site/StubPage";

export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [
      { title: "Sobre a Status na América | Imigração para os EUA" },
      { name: "description", content: "Conheça a Status na América, assessoria de mobilidade migratória sediada em Orlando, FL." },
      { property: "og:title", content: "Sobre a Status na América" },
      { property: "og:url", content: "/sobre" },
    ],
    links: [{ rel: "canonical", href: "/sobre" }],
  }),
  component: () => (
    <StubPage
      eyebrow="Quem somos"
      title="Status na América — Orlando, Flórida"
      description="Mais de duas décadas estruturando casos de imigração para brasileiros qualificados. Página completa em produção."
    />
  ),
});
