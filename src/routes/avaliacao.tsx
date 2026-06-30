/**
 * /avaliacao — LP dedicada de conversão (form como página).
 *
 * Layout vertical single-column, ocupando toda a página. Sem padronagem de
 * fundo: ink sólido + glow gold sutil no topo. O form é o protagonista.
 *
 * Query params:
 *  - ?seg=medicos|engenheiros|empresarios → pré-seleciona profissão e
 *    personaliza headline.
 *  - utm_*, src, gclid, fbclid etc. → preservados na captura.
 *
 * SEO: noindex,nofollow e fora do sitemap.
 */

import { useEffect, useMemo } from "react";
import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { ChevronLeft, ShieldCheck } from "lucide-react";
import { LeadFormProgressive } from "@/components/site/LeadFormProgressive";
import { trackFormView } from "@/lib/tracking";
import { getOrigin } from "@/lib/origin";
import type { QualResult } from "@/lib/leadQualification";

type SegKey = "medicos" | "engenheiros" | "empresarios";

interface AvaliacaoSearch {
  seg?: string;
  src?: string;
  [k: string]: string | undefined;
}

const SEG_DEFAULTS: Record<SegKey, { headline: string; profissao: string }> = {
  medicos: {
    headline: "Avaliação gratuita para médicos brasileiros.",
    profissao: "medico",
  },
  engenheiros: {
    headline: "Avaliação gratuita para engenheiros brasileiros.",
    profissao: "engenheiro",
  },
  empresarios: {
    headline: "Avaliação gratuita para empresários brasileiros.",
    profissao: "empresario",
  },
};

export const Route = createFileRoute("/avaliacao")({
  validateSearch: (s: Record<string, unknown>): AvaliacaoSearch => {
    const out: AvaliacaoSearch = {};
    Object.entries(s).forEach(([k, v]) => {
      if (typeof v === "string") out[k] = v;
    });
    return out;
  },
  head: () => ({
    meta: [
      { title: "Avaliação gratuita do seu perfil EB-2 NIW | Status na América" },
      {
        name: "description",
        content:
          "Análise gratuita e confidencial do seu perfil para o EB-2 NIW. Resposta em até 48h.",
      },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AvaliacaoPage,
});

function AvaliacaoPage() {
  const search = useSearch({ from: "/avaliacao" });
  const navigate = useNavigate();

  useEffect(() => {
    trackFormView({ seg: search.seg ?? null, src: search.src ?? null });
  }, [search.seg, search.src]);

  // Captura origem silenciosamente — fica disponível no payload do lead (admin/tracking)
  useEffect(() => {
    getOrigin("/avaliacao");
  }, []);


  const segKey = useMemo<SegKey | null>(() => {
    const s = search.seg as SegKey | undefined;
    return s && SEG_DEFAULTS[s] ? s : null;
  }, [search.seg]);

  const headline = segKey
    ? SEG_DEFAULTS[segKey].headline
    : "Descubra se você tem perfil para o Green Card americano por mérito.";

  const goToThanks = (qualification: QualResult) => {
    navigate({
      to: "/avaliacao/obrigado",
      search: { ...search, q: qualification } as never,
      replace: true,
    });
  };

  return (
    <div className="min-h-screen bg-ink text-foreground flex flex-col">
      {/* Header sticky compacto */}
      <header className="sticky top-0 z-20 border-b border-gold/15 bg-ink/85 backdrop-blur">
        <div className="container-x flex h-[64px] items-center justify-between">
          <Link to="/" className="flex items-center gap-3" aria-label="Voltar ao site">
            <span className="grid h-9 w-9 place-items-center border border-gold/60 text-gold font-display text-lg">
              S
            </span>
            <span className="font-display text-[16px]">
              Status<span className="text-gold">.</span> na América
            </span>
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-xs font-mono-label text-foreground/70 hover:text-gold"
          >
            <ChevronLeft className="h-3.5 w-3.5" /> Voltar ao site
          </Link>
        </div>
      </header>

      <main className="flex-1 relative">
        {/* Glow gold suave no topo, sem padronagem */}
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-[420px] pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 50% 0%, color-mix(in oklab, var(--gold) 8%, transparent) 0%, transparent 70%)",
          }}
        />

        <div className="relative mx-auto w-full max-w-[680px] px-5 md:px-6 py-10 md:py-14">
          {/* Intro */}
          <div className="text-center">
            <div className="inline-flex items-center gap-3">
              <span aria-hidden className="h-px w-8 bg-gold" />
              <span className="font-mono-label text-[11px] tracking-wider text-gold">
                AVALIAÇÃO GRATUITA · 100% CONFIDENCIAL
              </span>
              <span aria-hidden className="h-px w-8 bg-gold" />
            </div>

            <h1 className="mt-5 display-2 text-foreground">
              {headline}
            </h1>

            <p className="mt-5 text-base md:text-lg text-foreground/80 leading-relaxed max-w-[560px] mx-auto">
              Análise gratuita e sem compromisso. Nossa equipe analisa o seu perfil e
              responde em até 48h pelo canal informado.
            </p>
          </div>

          {/* Origem capturada silenciosamente — visível apenas no admin/tracking de cada lead */}


          {/* Formulário */}
          <div className="mt-6">
            <LeadFormProgressive
              segmentId={segKey ?? undefined}
              defaultProfissao={segKey ? SEG_DEFAULTS[segKey].profissao : undefined}
              onSubmitted={(lead) => goToThanks(lead.qualification)}
              submitLabel="Enviar para análise"
              currentPath="/avaliacao"
            />
          </div>

          {/* Credenciais — faixa horizontal compacta abaixo do form */}
          <ul className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { v: "A", l: "BBB ACCREDITED" },
              { v: "130+", l: "AVALIAÇÕES 5★" },
              { v: "25+", l: "ANOS DE EXPERIÊNCIA" },
              { v: "5.000+", l: "PROCESSOS" },
            ].map((c) => (
              <li key={c.l} className="border-l-2 border-gold/60 pl-3">
                <div className="font-display text-xl text-foreground leading-none">{c.v}</div>
                <div className="mt-2 font-mono-label text-[10px] text-foreground/60">{c.l}</div>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex items-start gap-3 text-xs text-foreground/65 border-l border-gold/40 pl-4">
            <ShieldCheck className="h-4 w-4 text-gold mt-0.5 shrink-0" />
            <span>
              Empresa registrada nos EUA (EIN 99-4846502) e no Brasil (CNPJ 62.917.376/0001-21).
              Sede em Orlando, FL · Filial em Barueri/SP.
            </span>
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
