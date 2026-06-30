/**
 * /avaliacao/obrigado — agradecimento + próximos passos.
 *
 * Disparado APENAS após submit bem-sucedido em /avaliacao. É o gatilho do
 * Público B (Lead) no remarketing.
 *
 * SEO: noindex,nofollow e fora do sitemap.
 */
import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackLead } from "@/lib/tracking";
import { getSiteSettings } from "@/lib/admin/settings";

export const Route = createFileRoute("/avaliacao/obrigado")({
  head: () => ({
    meta: [
      { title: "Recebemos seu perfil — em breve falaremos com você | Status na América" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: Obrigado,
});

function Obrigado() {
  const [wa, setWa] = useState<string>("16892209714");

  // Público B — Lead (Pixel) + generate_lead (GA4). No-op se desativado.
  useEffect(() => {
    trackLead();
  }, []);

  useEffect(() => {
    getSiteSettings().then((s) => { if (s.whatsapp_br) setWa(s.whatsapp_br); });
  }, []);

  return (
    <div className="min-h-screen bg-ink text-foreground flex flex-col">
      <header className="border-b border-gold/20">
        <div className="container-x flex h-[68px] items-center">
          <Link to="/" className="flex items-center gap-3" aria-label="Status na América">
            <span className="grid h-9 w-9 place-items-center border border-gold/60 text-gold font-display text-lg">S</span>
            <span className="font-display text-[17px]">Status<span className="text-gold">.</span> na América</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 grid place-items-center">
        <div className="container-x py-20 max-w-2xl text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center border border-gold/60 text-gold">
            <CheckCircle2 className="h-8 w-8" />
          </div>

          <div className="mt-8 flex items-center justify-center gap-3">
            <span aria-hidden className="h-px w-10 bg-gold" />
            <span className="font-mono-label text-gold">PERFIL RECEBIDO</span>
            <span aria-hidden className="h-px w-10 bg-gold" />
          </div>

          <h1 className="mt-6 font-display text-[40px] md:text-[52px] leading-[1.05]">
            Obrigado. Sua avaliação está em análise.
          </h1>

          <p className="mt-6 text-lg text-foreground/80 leading-relaxed">
            Nossa equipe vai analisar o seu perfil com atenção e entrar em contato em
            até 48h pelo WhatsApp informado. Se preferir adiantar a conversa, é só
            chamar pelo botão abaixo.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="btn-sweep h-12 px-7">
                <MessageCircle className="mr-2 h-4 w-4" /> Falar agora no WhatsApp
              </Button>
            </a>
            <Link to="/">
              <Button size="lg" variant="outline" className="h-12 px-6 border-gold/40 text-foreground hover:border-gold hover:bg-gold/5">
                Voltar para o site
              </Button>
            </Link>
          </div>

          <div className="mt-14 grid sm:grid-cols-3 gap-5 text-left">
            {[
              { n: "01", t: "Análise individual", d: "Olhamos o seu histórico, formação, impacto e contexto familiar." },
              { n: "02", t: "Indicação de caminho", d: "Sinalizamos a categoria EB mais coerente com o seu perfil." },
              { n: "03", t: "Próximos passos", d: "Se fizer sentido, agendamos uma conversa estratégica." },
            ].map((s) => (
              <div key={s.n} className="border border-gold/20 bg-ink-raise/40 p-5">
                <div className="font-display text-3xl text-gold leading-none">{s.n}</div>
                <h3 className="mt-3 font-display text-base">{s.t}</h3>
                <p className="mt-2 text-sm text-foreground/70 leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="border-t border-gold/15 bg-ink-deep">
        <div className="container-x py-8 text-xs text-foreground/55 leading-relaxed max-w-4xl">
          <p>
            A Status na América atua na preparação e organização de documentos imigratórios.
            Não somos advogados licenciados e não prestamos consultoria jurídica nem
            representação legal em processos de imigração.
          </p>
        </div>
      </footer>
    </div>
  );
}
