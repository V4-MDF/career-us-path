/**
 * Template único de Landing Page de conversão.
 *
 * ARQUITETURA:
 * - Header enxuto (sem menu, para não vazar tráfego pago)
 * - HERO específico do segmento/variante A/B (única dobra que muda)
 * - VisaPageBody com hideHero, mesmo corpo canônico da página de visto
 *   escolhida pelo segmento (segment.visa_slug, default "eb2-niw")
 * - Footer enxuto
 *
 * O que varia entre variantes A/B é APENAS o Hero: eyebrow, H1, sub, CTA
 * e imagem. Todo o restante é idêntico à página institucional do visto.
 */

import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import type { Segment, HeroVariant } from "@/lib/segments";
import { avaliacaoHref } from "@/lib/ctaLinks";
import { VisaPageBody } from "@/components/site/visa/VisaPageBody";
import { VISA_PAGES, type VisaSlug, type VisaPage } from "@/lib/visaPages";
import { BrandLogo } from "@/components/site/BrandLogo";

interface Props {
  segment: Segment;
  variant: HeroVariant | null;
}

/* Header de conversão enxuto, sem menu para não vazar tráfego pago */
function ConversionHeader({ segmentId }: { segmentId: string }) {
  return (
    <header className="fixed top-0 inset-x-0 z-50 px-3 pt-3 md:px-6">
      <div className="liquid-glass mx-auto flex h-16 max-w-6xl items-center justify-between rounded-full px-5 md:px-8">
        <Link to="/" aria-label="Status Immigration Law Firm. Início">
          <BrandLogo priority className="h-12 w-12" />
        </Link>
        <div className="flex items-center gap-2">
          <a href={avaliacaoHref(`lp_${segmentId}_header`, segmentId)}>
            <Button className="btn-label" size="sm">Iniciar pré-qualificação documental</Button>
          </a>
        </div>
      </div>
    </header>
  );
}

function LpFooter() {
  return (
    <footer className="border-t border-border/40 bg-surface py-10">
      <div className="container-x flex flex-col sm:flex-row gap-4 items-center justify-between text-xs text-muted-foreground">
        <p className="max-w-2xl leading-relaxed">
          © {new Date().getFullYear()} Status Immigration Law Firm. A Status Immigration Law Firm atua na preparação
          e organização de documentos imigratórios. Não somos advogados licenciados e não
          prestamos orientação jurídica nem representação legal em processos de imigração.
        </p>
        <div className="flex gap-5 shrink-0">
          <Link to="/sobre" className="hover:text-gold">Sobre</Link>
          <Link to="/contato" className="hover:text-gold">Contato</Link>
        </div>
      </div>
    </footer>
  );
}

function resolveVisaPage(segment: Segment): VisaPage {
  const slug = (segment.visa_slug ?? "eb2-niw") as VisaSlug;
  return VISA_PAGES[slug] ?? VISA_PAGES["eb2-niw"];
}

export function LandingPageTemplate({ segment, variant }: Props) {
  // Hero: usa variante A/B ativa; fallback no hero_default do segmento.
  const hero = variant ?? {
    eyebrow: segment.hero_default.eyebrow,
    h1: segment.hero_default.h1,
    sub: segment.hero_default.sub,
    cta_texto: segment.hero_default.cta_texto,
    imagem: segment.hero_default.imagem,
  };
  const ctaHref = avaliacaoHref(`lp_${segment.id}`, segment.id);
  const visaPage = resolveVisaPage(segment);

  return (
    <div className="bg-background text-foreground">
      <ConversionHeader segmentId={segment.id} />
      <main className="pt-16">
        {/* 1. HERO, única dobra específica do segmento/variante */}
        <section className="relative overflow-hidden pt-20 md:pt-28 pb-20">
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 stars-pattern opacity-25" />
            <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/85 to-background" />
            <div className="absolute -top-32 right-1/4 h-[36rem] w-[36rem] rounded-full bg-gold/10 blur-3xl" />
          </div>

          <div className="container-x grid lg:grid-cols-[1fr_1fr] gap-12 items-center">
            <div className="lg:text-center">
              <p className="inline-flex items-center gap-2 text-[11px] tracking-[0.22em] text-gold">
                <span className="h-px w-8 bg-gold/60" />
                {hero.eyebrow}
              </p>
              <h1 className="mt-5 font-display text-4xl md:text-6xl leading-[1.05]">
                {hero.h1}
              </h1>
              <p className="mt-6 text-lg text-foreground/80 max-w-xl leading-relaxed">
                {hero.sub}
              </p>
              <div className="mt-8 flex flex-wrap gap-3 lg:justify-center">
                <a href={ctaHref}>
                  <Button size="lg" className="btn-label text-base">{hero.cta_texto}</Button>
                </a>
              </div>
              {segment.prova_social && (
                <div className="mt-10 flex items-start gap-3 text-sm text-muted-foreground border-l-2 border-gold/40 pl-4">
                  <Star className="h-4 w-4 text-gold mt-0.5 shrink-0 fill-gold" />
                  <span>{segment.prova_social}</span>
                </div>
              )}
            </div>

            <div className="relative hidden lg:block">
              <div className="liquid-glass aspect-[4/5] rounded-3xl overflow-hidden">
                {hero.imagem ? (
                  <img src={hero.imagem} alt="" width={800} height={1000} loading="lazy" decoding="async" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-parchment via-background to-parchment-deep flex items-end p-6">
                    <div className="text-xs uppercase tracking-[0.2em] text-gold/80">
                      Imagem placeholder<br />
                      <span className="text-foreground/80 normal-case tracking-normal text-sm">
                        Profissional brasileiro nos EUA
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* 2+. CORPO, reusa exatamente a estrutura da página de visto */}
        <VisaPageBody page={visaPage} hideHero />
      </main>
      <LpFooter />
    </div>
  );
}

/** Hook utilitário para carregar segmento + variante no client. */
export function useLpState(slug: string) {
  const [state, setState] = useState<{
    loading: boolean;
    segment: Segment | null;
    variant: HeroVariant | null;
    notFound: boolean;
  }>({ loading: true, segment: null, variant: null, notFound: false });

  useEffect(() => {
    let alive = true;
    (async () => {
      const { getSegmentBySlug } = await import("@/lib/segments");
      const { getActiveVariant } = await import("@/lib/abEngine");
      const seg = await getSegmentBySlug(slug);
      if (!alive) return;
      if (!seg || !seg.ativo) {
        setState({ loading: false, segment: null, variant: null, notFound: true });
        return;
      }
      const variant = await getActiveVariant(seg.id);
      if (!alive) return;
      setState({ loading: false, segment: seg, variant, notFound: false });
    })();
    return () => { alive = false; };
  }, [slug]);

  return state;
}
