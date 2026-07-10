/**
 * /vistos/$slug. LAYOUT do pilar.
 *
 * Quando o usuário navega para /vistos/$slug          → renderiza vistos.$slug.index.tsx
 * Quando o usuário navega para /vistos/$slug/$secao   → renderiza vistos.$slug.$secao.tsx
 *
 * O loader valida o slug; ambas as folhas reusam essa validação via
 * Route.useLoaderData() na rota pai (lookup local em VISA_PAGES é barato).
 */

import { createFileRoute, Link, Outlet, notFound } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { VISA_PAGES, type VisaSlug, type VisaPage } from "@/lib/visaPages";

export const Route = createFileRoute("/vistos/$slug")({
  loader: ({ params }): { page: VisaPage } => {
    const page = VISA_PAGES[params.slug as VisaSlug];
    if (!page) throw notFound();
    return { page };
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
  component: () => <Outlet />,
});
