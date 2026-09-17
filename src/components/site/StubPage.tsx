import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/** Página-stub reutilizável p/ rotas a serem implementadas pelos próximos prompts. */
export function StubPage({
  eyebrow,
  title,
  description,
  ctaHref = "/#avaliacao",
}: {
  eyebrow: string;
  title: string;
  description: string;
  ctaHref?: string;
}) {
  return (
    <>
      <Header />
      <main className="pt-32 pb-24 min-h-[70vh]">
        <div className="container-x max-w-3xl">
          <Badge variant="outline" className="border-gold/40 text-gold">{eyebrow}</Badge>
          <h1 className="mt-4 font-display text-4xl md:text-6xl">{title}</h1>
          <p className="mt-6 text-lg text-foreground/80 leading-relaxed">{description}</p>
          <p className="mt-4 text-sm text-muted-foreground italic">
            Página em construção, conteúdo completo será adicionado nos próximos passos.
          </p>
          <div className="mt-10 flex gap-3">
            <a href={ctaHref}><Button className="btn-label" size="lg">Iniciar triagem do meu caso</Button></a>
            <Link to="/"><Button className="btn-label" size="lg" variant="outline"><ArrowLeft className="mr-2 h-4 w-4" /> Voltar à home</Button></Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
