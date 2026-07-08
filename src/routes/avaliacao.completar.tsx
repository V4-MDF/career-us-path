/**
 * /avaliacao/completar — etapa OPCIONAL de aprofundamento do perfil.
 *
 * Fluxo (fase de validação):
 *   /avaliacao (form curto: nome, whatsapp, e-mail, profissão, renda)
 *     → /avaliacao/obrigado-* (Lead disparado, leadId salvo em storage)
 *     → CTA "Complete seu perfil para agilizar sua análise"
 *     → /avaliacao/completar (4 campos: formação, idade, cidade/UF, momento)
 *     → enriquece o MESMO lead + recalcula score
 *
 * Não recria lead, não duplica tracking. Se não houver leadId em storage,
 * exibe fallback pedindo que o visitante faça a análise primeiro.
 *
 * SEO: noindex,nofollow.
 */
import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, ChevronLeft, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LeadFormProgressive } from "@/components/site/LeadFormProgressive";

export const Route = createFileRoute("/avaliacao/completar")({
  head: () => ({
    meta: [
      { title: "Complete seu perfil — análise EB-2 NIW | Status na América" },
      {
        name: "description",
        content:
          "Complete o seu perfil com 4 perguntas extras para agilizar a análise da nossa equipe.",
      },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: CompletarPage,
});

function CompletarPage() {
  const navigate = useNavigate();
  const [leadId, setLeadId] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    try {
      const id =
        window.sessionStorage.getItem("sna_last_lead_id") ??
        window.localStorage.getItem("sna_last_lead_id");
      setLeadId(id);
    } catch { /* ignore */ }
    finally { setChecked(true); }
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
        <div className="relative mx-auto w-full max-w-[680px] px-5 md:px-6 py-12 md:py-16">
          <div className="text-center">
            <div className="inline-flex items-center gap-3">
              <span aria-hidden className="h-px w-8 bg-gold" />
              <span className="font-mono-label text-[11px] tracking-wider text-gold">
                COMPLETE SEU PERFIL · OPCIONAL
              </span>
              <span aria-hidden className="h-px w-8 bg-gold" />
            </div>
            <h1 className="mt-5 display-2 text-foreground">
              Mais 4 perguntas para agilizar sua análise.
            </h1>
            <p className="mt-5 text-base md:text-lg text-foreground/80 leading-relaxed max-w-[560px] mx-auto">
              Etapa opcional — informações adicionais deixam o diagnóstico da nossa
              equipe mais preciso e ajudam a indicar o caminho ideal para o seu perfil.
            </p>
          </div>

          {!checked ? null : done ? (
            <div className="mt-10 rounded-2xl border border-gold/30 bg-ink-raise p-8 text-center">
              <CheckCircle2 className="mx-auto h-12 w-12 text-gold" />
              <h3 className="mt-4 font-display text-2xl">Perfil enriquecido.</h3>
              <p className="mt-2 text-foreground/75 text-sm max-w-md mx-auto">
                Recebemos as informações adicionais. Nossa equipe já pode conduzir uma
                análise mais aprofundada — sem necessidade de novo envio.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Button onClick={() => navigate({ to: "/" })} size="lg" className="btn-label">
                  Voltar para o site
                </Button>
              </div>
            </div>
          ) : leadId ? (
            <div className="mt-8">
              <LeadFormProgressive
                enrichLeadId={leadId}
                currentPath="/avaliacao/completar"
                fields={["formacao", "faixaEtaria", "cidade_uf", "momento"]}
                submitLabel="Enviar informações adicionais"
                onSubmitted={() => setDone(true)}
              />
              <p className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => navigate({ to: "/" })}
                  className="font-mono-label text-[11px] text-foreground/50 hover:text-gold underline underline-offset-4"
                >
                  Pular esta etapa
                </button>
              </p>
            </div>
          ) : (
            <div className="mt-10 rounded-2xl border border-gold/30 bg-ink-raise p-8 text-center">
              <ShieldCheck className="mx-auto h-10 w-10 text-gold/80" />
              <h3 className="mt-4 font-display text-xl">Faça sua análise primeiro.</h3>
              <p className="mt-2 text-foreground/75 text-sm max-w-md mx-auto">
                Esta etapa só está disponível após o envio do formulário inicial de análise.
              </p>
              <div className="mt-6">
                <Link to="/avaliacao">
                  <Button size="lg" className="btn-label">Fazer análise gratuita</Button>
                </Link>
              </div>
            </div>
          )}
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
