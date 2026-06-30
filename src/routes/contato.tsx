import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/site/StubPage";

export const Route = createFileRoute("/contato")({
  head: () => ({
    meta: [
      { title: "Contato | Status na América" },
      { name: "description", content: "Fale com a Status na América. Avaliação gratuita do seu perfil para imigração legal aos EUA." },
      { property: "og:title", content: "Contato | Status na América" },
      { property: "og:url", content: "/contato" },
    ],
    links: [{ rel: "canonical", href: "/contato" }],
  }),
  component: () => (
    <StubPage
      eyebrow="Fale conosco"
      title="Vamos conversar sobre o seu caso"
      description="Use o formulário da página inicial para iniciar sua avaliação gratuita ou nos contate por e-mail."
    />
  ),
});
