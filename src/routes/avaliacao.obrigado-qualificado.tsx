/**
 * /avaliacao/obrigado-qualificado — página de agradecimento para leads qualificados.
 * SEO: noindex,nofollow.
 */
import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, ChevronLeft, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackLead } from "@/lib/tracking";
import { buildWhatsAppLink, leadWhatsAppMessage, type LeadWhatsAppInput } from "@/lib/whatsapp";

export const Route = createFileRoute("/avaliacao/obrigado-qualificado")({
  head: () => ({
    meta: [
      { title: "Perfil recebido — em análise | Status na América" },
      {
        name: "description",
        content:
          "Recebemos seu perfil. Nossa equipe entra em contato em até 48h pelo canal informado.",
      },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: ObrigadoQualificado,
});

function ObrigadoQualificado() {
  const [waHref, setWaHref] = useState<string | null>(null);
  const [popupBlocked, setPopupBlocked] = useState(false);

  useEffect(() => {
    trackLead({ qualification: "qualificado" });
  }, []);

  // Lê o lead salvo em sessionStorage, monta o link do WhatsApp e tenta abrir
  // automaticamente. Se o navegador bloquear o popup, mostramos o aviso e o
  // usuário abre pelo botão (clique = gesto do usuário, sempre passa).
  useEffect(() => {
    if (typeof window === "undefined") return;
    let raw: string | null = null;
    try { raw = window.sessionStorage.getItem("lastQualifiedLead"); } catch { /* noop */ }
    if (!raw) return;
    let lead: LeadWhatsAppInput | null = null;
    try { lead = JSON.parse(raw) as LeadWhatsAppInput; } catch { lead = null; }
    if (!lead) return;

    let cancelled = false;
    buildWhatsAppLink(leadWhatsAppMessage(lead)).then((href) => {
      if (cancelled) return;
      setWaHref(href);
      // Pequeno delay para o navegador não confundir o open com o load.
      window.setTimeout(() => {
        const win = window.open(href, "_blank", "noopener,noreferrer");
        if (!win) setPopupBlocked(true);
      }, 400);
      try { window.sessionStorage.removeItem("lastQualifiedLead"); } catch { /* noop */ }
    }).catch(() => { /* segue sem WhatsApp */ });

    return () => { cancelled = true; };
  }, []);

  return (
    <div className="min-h-screen bg-ink text-foreground flex flex-col">
      <header className="sticky top-0 z-20 border-b border-gold/15 bg-ink/85 backdrop-blur">
        <div className="container-x flex h-[64px] items-center justify-between">
          <Link to="/" className="flex items-center gap-3" aria-label="Status na América">
            <span className="grid h-9 w-9 place-items-center rounded-lg border border-gold/60 text-gold font-display text-lg">S</span>
            <span className="font-display text-[16px]">Status<span className="text-gold">.</span> na América</span>
          </Link>
          <Link to="/" className="inline-flex items-center gap-1 text-xs font-mono-label text-foreground/70 hover:text-gold">
            <ChevronLeft className="h-3.5 w-3.5" /> Voltar ao site
          </Link>
        </div>
      </header>

      <main className="flex-1 relative">
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-[420px] pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 50% 0%, color-mix(in oklab, var(--gold) 8%, transparent) 0%, transparent 70%)",
          }}
        />
        <div className="relative mx-auto w-full max-w-[720px] px-5 md:px-6 py-14 md:py-20">
          <div className="text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center border border-gold/60 text-gold rounded-full">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <div className="mt-8 inline-flex items-center justify-center gap-3">
              <span aria-hidden className="h-px w-10 bg-gold" />
              <span className="font-mono-label text-[11px] text-gold">PERFIL RECEBIDO</span>
              <span aria-hidden className="h-px w-10 bg-gold" />
            </div>

            <h1 className="mt-6 display-2 text-foreground">
              Obrigado. Sua análise está em andamento.
            </h1>

            <p className="mt-6 text-base md:text-lg text-foreground/80 leading-relaxed max-w-[560px] mx-auto">
              Nossa equipe vai analisar o seu perfil com atenção e entrar em contato em
              até 48h pelo canal informado.
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <a
                href="https://www.instagram.com/statusamerica.br/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="lg" className="btn-label h-12 px-6">
                  Conheça nossas redes sociais
                </Button>
              </a>
            </div>


            <div className="mt-14 grid sm:grid-cols-3 gap-5 text-left">
              {[
                { n: "01", t: "Análise individual", d: "Olhamos o seu histórico, formação, impacto e contexto familiar." },
                { n: "02", t: "Indicação de caminho", d: "Sinalizamos a categoria EB mais coerente com o seu perfil." },
                { n: "03", t: "Próximos passos", d: "Se fizer sentido, agendamos uma conversa estratégica." },
              ].map((s) => (
                <div key={s.n} className="border border-gold/20 bg-ink-raise/40 p-5 rounded-lg">
                  <div className="font-display text-3xl text-gold leading-none">{s.n}</div>
                  <h3 className="mt-3 font-display text-base">{s.t}</h3>
                  <p className="mt-2 text-sm text-foreground/70 leading-relaxed">{s.d}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-gold/15 bg-ink-deep">
        <div className="container-x py-8 text-xs text-foreground/55 leading-relaxed max-w-4xl">
          <p>
            A Status na América atua na preparação e organização de documentos imigratórios.
            Não somos advogados licenciados e não prestamos orientação jurídica nem
            representação legal em processos de imigração.
          </p>
          <p className="mt-3 font-mono-label text-foreground/40">
            © {new Date().getFullYear()} STATUS NA AMÉRICA LLC · EIN 99-4846502
          </p>
        </div>
      </footer>
    </div>
  );
}
