/**
 * /avaliacao/obrigado-nao-qualificado — mantido apenas para compatibilidade.
 * Redireciona para a página de agradecimento discreta /avaliacao/obrigado.
 */
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/avaliacao/obrigado-nao-qualificado")({
  beforeLoad: () => {
    throw redirect({ to: "/avaliacao/obrigado", replace: true });
  },
});
