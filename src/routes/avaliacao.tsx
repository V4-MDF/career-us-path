/**
 * /avaliacao — LP dedicada de conversão (form como página).
 *
 * Objetivo:
 *  - Separar "chegou no formulário" (Público A) de "preencheu" (Público B).
 *  - Disparar evento de remarketing ao montar (ViewContent + FormView).
 *  - Layout premium, foco total (sem menu completo), com microprova social.
 *
 * Query params:
 *  - ?seg=medicos|engenheiros|empresarios → pré-seleciona profissão e
 *    personaliza headline.
 *  - utm_*, src, gclid, fbclid etc. → preservados na captura de lead
 *    (captureUtms lê window.location.search no submit).
 *
 * SEO: noindex,nofollow e fora do sitemap.
 */

import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { ChevronLeft, MessageCircle, ShieldCheck, Star } from "lucide-react";
import { LeadForm } from "@/components/site/LeadForm";
import { trackFormView } from "@/lib/tracking";
import { getSiteSettings } from "@/lib/admin/settings";

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
      // Privacy: LP dedicada de captura. Fora do sitemap.
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AvaliacaoPage,
});

function AvaliacaoPage() {
  const search = useSearch({ from: "/avaliacao" });
  const navigate = useNavigate();
  const [waMsisdn, setWaMsisdn] = useState<string>("16892209714");

  // Dispara evento de remarketing ao montar (Público A).
  // Re-disparo seguro: trackFormView é no-op se Pixel/GA4 não carregados.
  useEffect(() => {
    trackFormView({ seg: search.seg ?? null, src: search.src ?? null });
  }, [search.seg, search.src]);

  useEffect(() => {
    getSiteSettings().then((s) => {
      if (s.whatsapp_br) setWaMsisdn(s.whatsapp_br);
    });
  }, []);

  const segKey = useMemo<SegKey | null>(() => {
    const s = search.seg as SegKey | undefined;
    return s && SEG_DEFAULTS[s] ? s : null;
  }, [search.seg]);

  const headline = segKey
    ? SEG_DEFAULTS[segKey].headline
    : "Descubra se você tem perfil para o Green Card americano por mérito.";

  const goToThanks = () => {
    // Preserva params na transição: o admin pode usar src para filtrar leads.
    navigate({ to: "/avaliacao/obrigado", search: search as never, replace: true });
  };

  return (
    <div className="min-h-screen bg-ink text-foreground">
      {/* Header minimalista — sem menu completo (LP de conversão) */}
      <header className="border-b border-gold/20">
        <div className="container-x flex h-[68px] items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group" aria-label="Voltar ao site">
            <span className="grid h-9 w-9 place-items-center border border-gold/60 text-gold font-display text-lg">
              S
            </span>
            <span className="leading-tight">
              <span className="font-display text-[17px]">
                Status<span className="text-gold">.</span> na América
              </span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="hidden sm:inline-flex items-center gap-1 text-xs font-mono-label text-foreground/55 hover:text-gold"
            >
              <ChevronLeft className="h-3.5 w-3.5" /> Voltar ao site
            </Link>
            <a
              href={`https://wa.me/${waMsisdn}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 border border-gold/40 px-3 h-9 text-gold text-sm hover:bg-gold/10 transition-colors"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
          </div>
        </div>
      </header>

      <main>
        <section className="relative">
          <div aria-hidden className="absolute inset-0 guilloche opacity-60" />
          <div className="container-x relative section-pad grid lg:grid-cols-[1.05fr_1fr] gap-14 items-start">
            {/* Coluna esquerda — headline + microprova */}
            <div className="lg:pt-4 max-w-xl">
              <div className="flex items-center gap-3">
                <span aria-hidden className="h-px w-10 bg-gold" />
                <span className="font-mono-label text-gold">AVALIAÇÃO GRATUITA · 100% CONFIDENCIAL</span>
              </div>

              <h1 className="mt-6 font-display text-[40px] md:text-[56px] leading-[1.04] tracking-[-0.015em]">
                {headline}
              </h1>

              <p className="mt-7 text-lg leading-relaxed text-foreground/80">
                Análise gratuita e sem compromisso. Nossa equipe analisa o seu perfil e
                responde em até 48h pelo WhatsApp informado.
              </p>

              {/* Microprova social */}
              <ul className="mt-10 grid grid-cols-2 gap-4 max-w-sm">
                <Credential value="A" label="BBB ACCREDITED" />
                <Credential value="130+" label="AVALIAÇÕES 5★" />
                <Credential value="25+" label="ANOS DE EXPERIÊNCIA" />
                <Credential value="5.000+" label="PROCESSOS" />
              </ul>

              <div className="mt-10 flex items-start gap-3 text-sm text-foreground/65 border-l border-gold/50 pl-4">
                <ShieldCheck className="h-4 w-4 text-gold mt-0.5 shrink-0" />
                <span>
                  Empresa registrada nos EUA (EIN 99-4846502) e no Brasil (CNPJ 62.917.376/0001-21).
                  Sede em Orlando, FL · Filial em Barueri/SP.
                </span>
              </div>
            </div>

            {/* Coluna direita — formulário (mesmo componente, scoring + dataStore) */}
            <div>
              <LeadForm
                segmentId={segKey ?? undefined}
                defaultProfissao={segKey ? SEG_DEFAULTS[segKey].profissao : undefined}
                onSubmitted={goToThanks}
                submitLabel="Enviar para análise"
              />
            </div>
          </div>
        </section>
      </main>

      {/* Rodapé minimalista — sem links que tirem foco; disclaimer obrigatório */}
      <footer className="border-t border-gold/15 bg-ink-deep">
        <div className="container-x py-8 text-xs text-foreground/55 leading-relaxed max-w-4xl">
          <p>
            A Status na América atua na preparação e organização de documentos imigratórios.
            Não somos advogados licenciados e não prestamos consultoria jurídica nem
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

function Credential({ value, label }: { value: string; label: string }) {
  return (
    <li className="border-l-2 border-gold/60 pl-3">
      <div className="font-display text-2xl text-foreground leading-none flex items-center gap-1">
        {value}
        <Star className="h-3.5 w-3.5 text-gold/70" aria-hidden />
      </div>
      <div className="mt-2 font-mono-label text-foreground/60">{label}</div>
    </li>
  );
}
