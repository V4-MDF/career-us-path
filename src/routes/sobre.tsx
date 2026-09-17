/**
 * /sobre — página institucional de autoridade e confiança.
 *
 * Dois pilares narrativos:
 *   1) Presença física nos EUA (Orlando) — acompanhamento além do processo.
 *   2) História da fundadora Lia — ex-insider que saiu para construir algo melhor.
 *
 * Toda copy/imagem editável via `site_content` (chaves `sobre.*`).
 * CTA primário sempre → /avaliacao. Sem textura. Fundos sólidos.
 */
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Building2,
  MapPin,
  ShieldCheck,
  BadgeCheck,
  Home as HomeIcon,
  Landmark,
  GraduationCap,
  Heart,
  Plane,
} from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { PartnersBadges } from "@/components/site/sections";
import { Button } from "@/components/ui/button";
import { useContent } from "@/lib/siteContent";
import { getPageSeoFn, buildSeoTags } from "@/lib/pageSeo.functions";

export const Route = createFileRoute("/sobre")({
  loader: () => getPageSeoFn({ data: { page: "sobre" } }),
  head: ({ loaderData }) => {
    const { meta, links } = buildSeoTags(
      {
        title: "Sobre | Status Immigration Law Firm — assessoria de imigração em Orlando",
        description:
          "Conheça a Status Immigration Law Firm: assessoria de imigração para brasileiros com sede em Orlando/FL e filial no Brasil. Equipe dedicada à preparação documental de processos EB-1, EB-2 NIW e EB-3.",
        ogTitle: "Sobre | Status Immigration Law Firm",
        ogDescription:
          "Assessoria de imigração para brasileiros com equipe presente nos Estados Unidos. Orlando/FL e Barueri/SP.",
        canonical: "/sobre",
      },
      loaderData,
    );
    return {
      meta,
      links,
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Status Immigration Law Firm",
            legalName: "Status Immigration Law Firm LLC",
            url: "https://lp.statusnaamerica.com",
            taxID: "99-4846502",
            sameAs: [
              "https://instagram.com/status_america",
              "https://facebook.com/statusnaamerica",
              "https://youtube.com/@status.naamerica",
            ],
            address: [
              {
                "@type": "PostalAddress",
                streetAddress: "7575 KingsPointe Pkwy #4",
                addressLocality: "Orlando",
                addressRegion: "FL",
                postalCode: "32819",
                addressCountry: "US",
              },
              {
                "@type": "PostalAddress",
                streetAddress: "Alameda Araguaia 2104",
                addressLocality: "Barueri",
                addressRegion: "SP",
                postalCode: "06455-000",
                addressCountry: "BR",
              },
            ],
          }),
        },
      ],
    };
  },
  component: SobrePage,
});

function SobrePage() {
  return (
    <>
      <Header />
      <main className="bg-parchment text-ink-text">
        <SobreHero />
        <NossaHistoria />
        <DiferencialEUA />
        <NumerosCredenciais />
        <PartnersBadges />
        <OndeEstamos />
        <CtaFinal />
      </main>
      <Footer />
    </>
  );
}

/* --------------------------------- Hero --------------------------------- */

function SobreHero() {
  const eyebrow = useContent("sobre.hero.eyebrow");
  const title = useContent("sobre.hero.title");
  const subtitle = useContent("sobre.hero.subtitle");
  const image = useContent("sobre.hero.image");

  return (
    <section className="relative bg-background text-foreground pt-32 pb-16 md:pt-40 md:pb-24 border-b border-gold/25 overflow-hidden">
      {image && (
        <div
          aria-hidden
          className="absolute inset-0 bg-cover bg-center opacity-20 saturate-50 brightness-110"
          style={{ backgroundImage: `url(${image})` }}
        />
      )}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/82 to-background"
      />
      <div className="container-x relative max-w-3xl">
        <div className="flex items-center gap-3">
          <span aria-hidden className="h-px w-10 bg-gold" />
          <span className="font-mono-label text-gold">{eyebrow}</span>
        </div>
        <h1 className="mt-4 font-display display-1 text-foreground">{title}</h1>
        <p className="mt-5 text-foreground/80 text-lg leading-relaxed max-w-2xl">
          {subtitle}
        </p>
        <div className="mt-8">
          <Link to="/avaliacao">
            <Button size="lg" className="btn-label">
              Iniciar pré-qualificação documental <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ Nossa história -------------------------- */

function NossaHistoria() {
  const eyebrow = useContent("sobre.historia.eyebrow");
  const title = useContent("sobre.historia.title");
  const body = useContent("sobre.historia.body");
  const image = useContent("sobre.historia.image");

  return (
    <section className="bg-parchment py-16 md:py-24 border-b border-gold/20">
      <div className="container-x grid gap-10 lg:grid-cols-[1.2fr_1fr] items-start">
        <div>
          <div className="flex items-center gap-3">
            <span aria-hidden className="h-px w-10 bg-gold" />
            <span className="font-mono-label text-oxblood">{eyebrow}</span>
          </div>
          <h2 className="mt-3 font-display display-2 text-ink-text max-w-2xl">
            {title}
          </h2>
          <div className="mt-6 space-y-4 text-ink-text/85 leading-relaxed max-w-2xl">
            {body.split(/\n+/).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-gold/40 bg-white shadow-soft overflow-hidden">
          {image ? (
            <img
              src={image}
              alt="Equipe Status Immigration Law Firm"
              className="w-full aspect-[4/5] object-cover"
              loading="lazy"
            />
          ) : (
            <div className="aspect-[4/5] bg-ink/5 flex flex-col items-center justify-center text-center p-6">
              <Building2 className="h-10 w-10 text-gold" />
              <p className="mt-3 font-mono-label text-xs text-ink-text/60">
                Imagem a completar pelo cliente
              </p>
              <p className="mt-1 text-sm text-ink-text/50">
                Sede em Orlando ou foto da equipe.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* --------------------------- Diferencial EUA ---------------------------- */

function DiferencialEUA() {
  const eyebrow = useContent("sobre.diferencial.eyebrow");
  const title = useContent("sobre.diferencial.title");
  const lead = useContent("sobre.diferencial.lead");

  const pontos = [
    {
      icon: <Plane className="h-5 w-5 text-gold" />,
      title: useContent("sobre.diferencial.p1.title"),
      text: useContent("sobre.diferencial.p1.text"),
    },
    {
      icon: <Landmark className="h-5 w-5 text-gold" />,
      title: useContent("sobre.diferencial.p2.title"),
      text: useContent("sobre.diferencial.p2.text"),
    },
    {
      icon: <GraduationCap className="h-5 w-5 text-gold" />,
      title: useContent("sobre.diferencial.p3.title"),
      text: useContent("sobre.diferencial.p3.text"),
    },
    {
      icon: <Heart className="h-5 w-5 text-gold" />,
      title: useContent("sobre.diferencial.p4.title"),
      text: useContent("sobre.diferencial.p4.text"),
    },
  ];

  return (
    <section className="section-ink-deep py-16 md:py-24 border-b border-gold/25">
      <div className="container-x">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3">
            <span aria-hidden className="h-px w-10 bg-gold" />
            <span className="font-mono-label text-gold">{eyebrow}</span>
          </div>
          <h2 className="mt-3 font-display display-2 text-foreground">{title}</h2>
          <p className="mt-4 text-foreground/80 leading-relaxed">{lead}</p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {pontos.map((p, i) => (
            <div
              key={i}
              className="liquid-card rounded-2xl p-6 relative"
            >
              <span aria-hidden className="absolute inset-x-0 top-0 h-[2px] bg-gold" />
              <div className="rounded-lg border border-gold/40 bg-gold/10 w-10 h-10 flex items-center justify-center">
                {p.icon}
              </div>
              <div className="mt-4 font-display text-lg text-foreground">{p.title}</div>
              <div className="mt-2 text-sm text-foreground/75 leading-relaxed">
                {p.text}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


/* ------------------------ Números e credenciais ------------------------- */

function NumerosCredenciais() {
  const eyebrow = useContent("sobre.numeros.eyebrow");
  const title = useContent("sobre.numeros.title");

  const stats = [
    {
      v: useContent("sobre.numeros.n1.valor"),
      l: useContent("sobre.numeros.n1.label"),
    },
    {
      v: useContent("sobre.numeros.n2.valor"),
      l: useContent("sobre.numeros.n2.label"),
    },
    {
      v: useContent("sobre.numeros.n3.valor"),
      l: useContent("sobre.numeros.n3.label"),
    },
    {
      v: useContent("sobre.numeros.n4.valor"),
      l: useContent("sobre.numeros.n4.label"),
    },
    {
      v: useContent("sobre.numeros.n5.valor"),
      l: useContent("sobre.numeros.n5.label"),
    },
  ];

  return (
    <section className="bg-background text-foreground py-16 md:py-24 border-b border-gold/25">
      <div className="container-x">
        <div className="flex items-center gap-3">
          <span aria-hidden className="h-px w-10 bg-gold" />
          <span className="font-mono-label text-gold">{eyebrow}</span>
        </div>
        <h2 className="mt-3 font-display display-2 text-foreground max-w-2xl">
          {title}
        </h2>

        <ul className="mt-10 grid gap-5 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {stats.map((s, i) => (
            <li
              key={i}
              className="liquid-card rounded-2xl p-5 text-center relative"
            >
              <span aria-hidden className="absolute inset-x-0 top-0 h-[2px] bg-gold" />
              <div className="font-display text-[clamp(1.8rem,3.2vw,2.6rem)] leading-none text-gold">
                {s.v}
              </div>
              <div className="mt-2 font-mono-label text-[11px] text-foreground/70 leading-tight">
                {s.l}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ------------------------------ Onde estamos ---------------------------- */

function OndeEstamos() {
  const usaAddress = "7575 KingsPointe Pkwy #4, Orlando, FL 32819";
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    usaAddress
  )}`;
  return (
    <section className="bg-parchment py-16 md:py-24 border-b border-gold/20">
      <div className="container-x">
        <div className="flex items-center gap-3">
          <span aria-hidden className="h-px w-10 bg-gold" />
          <span className="font-mono-label text-oxblood">ONDE ESTAMOS</span>
        </div>
        <h2 className="mt-3 font-display display-2 text-ink-text max-w-2xl">
          Duas sedes, um mesmo padrão de atendimento.
        </h2>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          <div className="rounded-xl border border-gold/40 bg-white p-6 shadow-soft lg:col-span-1">
            <span aria-hidden className="block h-[2px] w-10 bg-gold mb-4" />
            <div className="font-mono-label text-oxblood text-xs">
              MATRIZ. ESTADOS UNIDOS
            </div>
            <div className="mt-1 font-display text-lg text-ink-text">
              Status Immigration Law Firm LLC
            </div>
            <div className="mt-3 flex items-start gap-2 text-sm text-ink-text/85">
              <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-gold" />
              <span>{usaAddress}</span>
            </div>
            <div className="mt-3 font-mono-label text-[11px] text-ink-text/60">
              EIN 99-4846502
            </div>
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 font-mono-label text-xs text-gold hover:underline"
            >
              Ver no Google Maps <ArrowRight className="h-3 w-3" />
            </a>
          </div>

          <div className="rounded-xl border border-gold/40 bg-white p-6 shadow-soft lg:col-span-1">
            <span aria-hidden className="block h-[2px] w-10 bg-gold mb-4" />
            <div className="font-mono-label text-oxblood text-xs">FILIAL. BRASIL</div>
            <div className="mt-1 font-display text-lg text-ink-text">
              Alphaville · CEA Corporate
            </div>
            <div className="mt-3 flex items-start gap-2 text-sm text-ink-text/85">
              <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-gold" />
              <span>
                Alameda Araguaia 2104, Barueri/SP · CEP 06455-000
              </span>
            </div>
            <div className="mt-3 font-mono-label text-[11px] text-ink-text/60">
              CNPJ 62.917.376/0001-21
            </div>
          </div>

          <div className="rounded-xl border border-dashed border-gold/40 bg-parchment/60 p-6 lg:col-span-1">
            <span aria-hidden className="block h-[2px] w-10 bg-gold mb-4" />
            <div className="font-mono-label text-oxblood text-xs">EXPANSÃO</div>
            <div className="mt-1 font-display text-lg text-ink-text">
              Portugal e Dubai
            </div>
            <div className="mt-3 text-sm text-ink-text/75">
              Novas frentes de atendimento para brasileiros no exterior. Em breve.
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-ink-text/60">
              <HomeIcon className="h-3.5 w-3.5 text-gold" />
              <span className="font-mono-label">EM BREVE</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* --------------------------------- CTA ---------------------------------- */

function CtaFinal() {
  const title = useContent("sobre.cta.title");
  const subtitle = useContent("sobre.cta.subtitle");
  return (
    <section className="section-ink-deep py-20 border-b border-gold/25">
      <div className="container-x max-w-3xl text-center">
        <ShieldCheck className="h-8 w-8 text-gold mx-auto" />
        <h2 className="mt-4 font-display display-2 text-foreground">{title}</h2>
        <p className="mt-4 text-foreground/75 leading-relaxed">{subtitle}</p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/avaliacao">
            <Button size="lg" className="btn-label w-full sm:w-auto">
              Iniciar pré-qualificação documental <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link to="/contato">
            <Button
              size="lg"
              variant="outline"
              className="btn-label w-full sm:w-auto border-gold/40 text-foreground hover:bg-gold/10"
            >
              <BadgeCheck className="mr-2 h-4 w-4" /> Fale com a equipe
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

/* Disclaimer institucional removido: substituído pelo componente
 * <LegalDisclaimer /> global renderizado acima do <Footer />. Ver
 * src/components/legal/LegalDisclaimer.tsx. */

