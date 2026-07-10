/**
 * Corpo compartilhado das páginas de pilar de visto.
 *
 * Usado por:
 *  - /vistos/$slug                  (página-mãe — canonical próprio)
 *  - /vistos/$slug/$secao           (sub-rota de dobra — canonical próprio,
 *                                    foco em uma seção indexada isoladamente)
 *
 * Cada `<section>` carrega `id` + `section-anchor` para o scroll-spy do
 * SectionTOC + DynamicSectionHead. Os ids batem com `VISA_SECTIONS` do
 * `sectionMap.ts` — alterar lá quebra o TOC.
 */

import { Link } from "@tanstack/react-router";
import { Check, ChevronRight } from "lucide-react";
import { SectionHead } from "@/components/site/SectionHead";
import { Button } from "@/components/ui/button";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { avaliacaoHref } from "@/lib/ctaLinks";
import { COMPARISON, type VisaPage } from "@/lib/visaPages";
import { PhotoFrame } from "@/components/site/visa/PhotoFrame";
// NOTA: as fotografias abaixo são placeholders art-direcionados no mesmo
// tratamento visual do site. Substituir por fotografia real com o mesmo
// enquadramento e a classe .photo-treatment — NUNCA usar ilustração ou
// imagem genérica de IA nas páginas de visto.
import heroFamilyUsa from "@/assets/visa-hero-family-usa.jpg";
import professionalWork from "@/assets/visa-professional-work.jpg";
import familyFuture from "@/assets/visa-family-future.jpg";

export function VisaPageBody({ page, hideHero = false }: { page: VisaPage; hideHero?: boolean }) {
  return (
    <main className={hideHero ? "pt-0" : "pt-28"}>
      {!hideHero && (
      /* Hero fotográfico — full-bleed com overlay navy forte (AA em todo
         texto). Grão + vinheta vêm do <PhotoFrame>. Fora do scroll-spy. */
      <section id="abertura" aria-label="Abertura" className="section-anchor bg-ink relative overflow-hidden min-h-[86vh] flex items-center">
        <PhotoFrame
          src={heroFamilyUsa}
          alt="Família brasileira em frente à casa nos Estados Unidos com bandeira americana"
          fill
          priority
          width={1920}
          height={1088}
          focal="60% 40%"
          className="!rounded-none"
        />
        {/* Overlay navy sólido: 88% no lado do texto → 45% no lado oposto,
            garantindo AA no H1/subtítulo sem padrões sobre a foto. */}
        <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-[#0A111C]/92 via-[#0A111C]/75 to-[#0A111C]/45" />

        <div className="container-x section-pad relative w-full">
          <nav aria-label="Breadcrumb" className="font-mono-label text-foreground/70 flex items-center gap-2">
            <Link to="/" className="hover:text-gold">Início</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-gold">{page.eyebrow}</span>
          </nav>

          <div className="mt-6 flex items-center gap-3">
            <span aria-hidden className="h-px w-10 bg-gold/70" />
            <span className="font-mono-label text-gold">{page.eyebrow}</span>
            {page.badge && (
              <span className="rounded-md border border-gold/60 px-2 py-0.5 font-mono-label text-[9px] text-gold">
                {page.badge}
              </span>
            )}
          </div>

          <h1 className="mt-5 font-display text-[40px] md:text-[64px] leading-[1.04] max-w-4xl text-foreground drop-shadow-[0_2px_20px_rgba(0,0,0,0.5)]">
            {page.h1}
          </h1>
          <p className="mt-6 text-lg md:text-xl text-foreground/90 leading-relaxed max-w-3xl">
            {page.intro}
          </p>
          <div className="mt-10">
            <a href={avaliacaoHref(`visto_${page.slug}_hero`)}>
              <Button size="lg" className="btn-label btn-sweep h-12 px-7 text-base">
                Análise gratuita
              </Button>
            </a>
          </div>
        </div>
      </section>
      )}

      {/* 1 — Definição — layout editorial: texto + retrato profissional */}
      <section id="definicao" aria-label="Definição" className="section-anchor section-parchment">
        <div className="container-x section-pad grid md:grid-cols-12 gap-10 items-center">
          <div className="md:col-span-7 order-2 md:order-1">
            <SectionHead num="01" eyebrow="DEFINIÇÃO" variant="parchment" title={page.whatIs.title} />
            <p className="mt-6 text-lg leading-relaxed text-ink-text/85">{page.whatIs.body}</p>
          </div>
          <div className="md:col-span-5 order-1 md:order-2">
            <PhotoFrame
              src={professionalWork}
              alt="Profissional brasileira em ambiente corporativo nos Estados Unidos"
              ratio="4/5"
              width={1280}
              height={1600}
              className="shadow-elevated ring-1 ring-gold/25"
            />
          </div>
        </div>
      </section>

      {/* 2 — Elegibilidade */}
      <section id="elegibilidade" aria-label="Elegibilidade" className="section-anchor bg-ink">
        <div className="container-x section-pad">
          <SectionHead num="02" eyebrow="ELEGIBILIDADE" title={page.qualifies.title} kicker={page.qualifies.intro} />
          <ul className="mt-12 grid gap-5 md:grid-cols-2">
            {page.qualifies.items.map((it) => (
              <li key={it.title} className="gold-tick rounded-2xl border border-gold/20 bg-ink-raise/60 p-7 pt-9 shadow-soft transition-[border-color,box-shadow] hover:border-gold/45 hover:shadow-elevated">
                <h3 className="font-display text-2xl text-foreground">{it.title}</h3>
                <p className="mt-3 text-foreground/75 leading-relaxed">{it.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 3 — Processo */}
      <section id="processo" aria-label="Processo" className="section-anchor section-parchment">
        <div className="container-x section-pad">
          <SectionHead num="03" eyebrow="PROCESSO" variant="parchment" title={page.process.title} />
          <ol className="mt-12 grid gap-6 md:grid-cols-3">
            {page.process.steps.map((s) => (
              <li key={s.num} className="rounded-2xl border border-ink-text/15 bg-white p-7 shadow-soft">
                <div className="font-mono-label text-gold">ETAPA {s.num}</div>
                <h3 className="mt-3 font-display text-2xl text-ink-text">{s.title}</h3>
                <p className="mt-3 text-ink-text/75 leading-relaxed">{s.body}</p>
              </li>
            ))}
          </ol>
          {page.process.note && (
            <p className="mt-8 text-sm text-ink-text/70 italic max-w-3xl">{page.process.note}</p>
          )}
        </div>
      </section>

      {/* 4 — Família — dobra emocional. Foto grande da família (coração do
          "futuro dos filhos / legado"), texto ao lado com peso reduzido. */}
      <section id="familia" aria-label="Família" className="section-anchor bg-ink-deep relative overflow-hidden">
        <div aria-hidden className="absolute inset-0 guilloche opacity-30" />
        <div className="container-x section-pad grid md:grid-cols-12 gap-10 items-center relative">
          <div className="md:col-span-7 order-2 md:order-1">
            <PhotoFrame
              src={familyFuture}
              alt="Família brasileira feliz em bairro suburbano americano, transmitindo pertencimento e futuro"
              ratio="3/2"
              width={1600}
              height={1200}
              className="shadow-elegant ring-1 ring-gold/25"
            />
          </div>
          <div className="md:col-span-5 order-1 md:order-2">
            <SectionHead num="04" eyebrow="FAMÍLIA" title={page.family.title} />
            <p className="mt-6 text-lg leading-relaxed text-foreground/85">{page.family.body}</p>
          </div>
        </div>
      </section>

      {/* 5 — Comparativo */}
      <section id="comparativo" aria-label="Comparativo EB" className="section-anchor section-parchment">
        <div className="container-x section-pad">
          <SectionHead
            num="05"
            eyebrow="COMPARATIVO"
            variant="parchment"
            title="EB-2 NIW vs EB-1 vs EB-3"
            kicker="Três caminhos legítimos, três perfis distintos."
          />
          <div className="mt-10 overflow-x-auto rounded-2xl border border-ink-text/15 bg-white shadow-soft">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-ink">
                  {COMPARISON.headers.map((h, i) => (
                    <th key={i} className="px-5 py-4 text-left font-mono-label text-gold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARISON.rows.map((row) => (
                  <tr key={row.label} className="border-t border-ink-text/10 align-top">
                    <th className="px-5 py-4 text-left font-mono-label text-ink-text/70 w-[28%]">
                      {row.label}
                    </th>
                    {row.cells.map((c, i) => (
                      <td key={i} className="px-5 py-4 text-ink-text/85">{c}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-6 flex flex-wrap gap-3 text-sm">
            {page.slug !== "eb2-niw" && (
              <Link to="/vistos/$slug" params={{ slug: "eb2-niw" }} className="underline text-ink-text hover:text-gold">
                → Página completa EB-2 NIW
              </Link>
            )}
            {page.slug !== "eb1" && (
              <Link to="/vistos/$slug" params={{ slug: "eb1" }} className="underline text-ink-text hover:text-gold">
                → Página EB-1
              </Link>
            )}
            {page.slug !== "eb3" && (
              <Link to="/vistos/$slug" params={{ slug: "eb3" }} className="underline text-ink-text hover:text-gold">
                → Página EB-3
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* 6 — Dúvidas frequentes */}
      <section id="duvidas-frequentes" aria-label="Dúvidas frequentes" className="section-anchor bg-ink">
        <div className="container-x section-pad max-w-4xl">
          <SectionHead num="06" eyebrow="PERGUNTAS FREQUENTES" title="O que mais perguntam sobre este visto" />
          <Accordion type="single" collapsible className="mt-10 border-t border-gold/20">
            {page.faq.map((f, i) => (
              <AccordionItem key={i} value={`f-${i}`} className="border-b border-gold/20">
                <AccordionTrigger className="py-5 text-left font-display text-lg md:text-xl text-foreground hover:no-underline hover:text-gold">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="pb-6 text-foreground/80 leading-relaxed">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* 7 — Análise gratuita (CTA) */}
      <section id="avaliacao-gratuita" aria-label="Análise gratuita" className="section-anchor section-parchment">
        <div className="container-x section-pad grid lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-7">
            <SectionHead num="07" eyebrow="ANÁLISE GRATUITA" variant="parchment" title={page.ctaTitle} kicker={page.ctaSubtitle} />
            <ul className="mt-8 space-y-3 text-ink-text/80">
              {[
                "Análise individual do perfil em até 48h",
                "Indicação da categoria EB mais coerente",
                "Sem custo · 100% confidencial",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-gold shrink-0 mt-1" /> {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-ink-text/15 bg-white p-8 shadow-elevated">
              <p className="font-mono-label text-gold">PRÓXIMO PASSO</p>
              <h3 className="mt-3 font-display text-2xl text-ink-text">
                Comece pela análise gratuita do seu perfil.
              </h3>
              <p className="mt-3 text-ink-text/70 text-[15px] leading-relaxed">
                Em poucos minutos enviamos sua análise para a equipe especializada
                em vistos EB. Resposta em até 48h por e-mail.
              </p>
              <a href={avaliacaoHref(`visto_${page.slug}_cta`)} className="mt-7 inline-block">
                <Button size="lg" className="btn-label btn-sweep h-12 px-7">Fazer minha análise gratuita</Button>
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
