/**
 * Template único de Landing Page de conversão.
 *
 * Prompt 5: formulário inline REMOVIDO. Os CTAs navegam para a LP dedicada
 * /avaliacao com `seg` e `src` preenchidos, preservando UTMs (avaliacaoHref).
 * Hero A/B segue intacto; abEngine.registerConversion é disparado no submit
 * do form em /avaliacao (LeadForm já trata via segmentId).
 */

import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertTriangle, Award, CheckCircle2, Clock, DollarSign, Heart,
  MapPin, PlayCircle, ShieldCheck, Sparkles, Star,
  TrendingUp, Users, XCircle,
} from "lucide-react";
import type { Segment, HeroVariant } from "@/lib/segments";
import { avaliacaoHref } from "@/lib/ctaLinks";

interface Props {
  segment: Segment;
  variant: HeroVariant | null;
}

/* Header de conversão enxuto — sem menu para não vazar tráfego pago */
function ConversionHeader({ segmentId }: { segmentId: string }) {
  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-border/40 bg-background/85 backdrop-blur">
      <div className="container-x flex h-16 items-center justify-between">
        <Link to="/" className="font-serif text-xl">
          Status<span className="text-gold">.</span> na América
        </Link>
        <div className="flex items-center gap-2">
          <a href={avaliacaoHref(`lp_${segmentId}_header`, segmentId)}>
            <Button className="btn-label" size="sm">Avaliação gratuita</Button>
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
          © {new Date().getFullYear()} Status na América. A Status na América atua na preparação
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

export function LandingPageTemplate({ segment, variant }: Props) {
  // Hero: usa variante A/B ativa; fallback no hero_default do segmento.
  const hero = variant ?? { ...segment.hero_default, segment_id: segment.id } as Pick<HeroVariant, "eyebrow" | "h1" | "sub" | "cta_texto">;
  const ctaHref = avaliacaoHref(`lp_${segment.id}`, segment.id);


  return (
    <div className="bg-background text-foreground">
      <ConversionHeader segmentId={segment.id} />
      <main className="pt-16">
        {/* 1. HERO */}
        <section className="relative overflow-hidden pt-16 md:pt-24 pb-20">
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 stars-pattern opacity-25" />
            <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/85 to-background" />
            <div className="absolute -top-32 right-1/4 h-[36rem] w-[36rem] rounded-full bg-gold/10 blur-3xl" />
          </div>

          <div className="container-x grid lg:grid-cols-[1.05fr_0.95fr] gap-12 items-center">
            <div>
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
              <div className="mt-8 flex flex-wrap gap-3">
                <a href={ctaHref}>
                  <Button size="lg" className="btn-label text-base">{hero.cta_texto}</Button>
                </a>
              </div>
              <div className="mt-10 flex items-start gap-3 text-sm text-muted-foreground border-l-2 border-gold/40 pl-4">
                <Star className="h-4 w-4 text-gold mt-0.5 shrink-0 fill-gold" />
                <span>{segment.prova_social}</span>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="aspect-[4/5] rounded-2xl overflow-hidden border border-gold/20 bg-surface shadow-elegant">
                {variant?.imagem ? (
                  <img src={variant.imagem} alt="" width={800} height={1000} loading="lazy" decoding="async" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-ink via-ink-raise to-ink-deep flex items-end p-6">
                    <div className="text-xs uppercase tracking-[0.2em] text-gold/80">
                      Imagem placeholder<br />
                      <span className="text-foreground/60 normal-case tracking-normal text-sm">
                        Profissional brasileiro nos EUA
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* 2. COMPARATIVO BR vs EUA */}
        <section className="section-cream py-24">
          <div className="container-x">
            <div className="max-w-3xl">
              <Badge variant="outline" className="border-navy/30 text-navy">
                <DollarSign className="h-3.5 w-3.5 mr-1" /> {segment.comparativo.label}
              </Badge>
              <h2 className="mt-4 font-display text-3xl md:text-5xl text-navy">
                Por que {segment.nome.toLowerCase()} brasileiros estão construindo carreira nos EUA.
              </h2>
            </div>

            <div className="mt-12 grid md:grid-cols-2 gap-6">
              <Card className="border-destructive/20 bg-white">
                <CardContent className="p-8">
                  <p className="text-xs uppercase tracking-[0.18em] text-destructive">Brasil</p>
                  <p className="mt-3 font-serif text-3xl text-navy">{segment.comparativo.lado_brasil}</p>
                </CardContent>
              </Card>
              <Card className="border-gold/50 bg-white shadow-elegant">
                <CardContent className="p-8">
                  <p className="text-xs uppercase tracking-[0.18em] text-gold">Estados Unidos</p>
                  <p className="mt-3 font-serif text-3xl text-navy flex items-center gap-2">
                    <TrendingUp className="h-7 w-7 text-gold" /> {segment.comparativo.lado_eua}
                  </p>
                </CardContent>
              </Card>
            </div>
            {segment.comparativo.observacao && (
              <p className="mt-6 text-sm text-navy/65">{segment.comparativo.observacao}</p>
            )}
          </div>
        </section>

        {/* 3. DOR */}
        <section className="py-24">
          <div className="container-x max-w-4xl">
            <Badge variant="outline" className="border-gold/40 text-gold">
              <AlertTriangle className="h-3.5 w-3.5 mr-1" /> A realidade que pesa
            </Badge>
            <h2 className="mt-4 font-display text-3xl md:text-5xl">Você já vive isso no Brasil?</h2>
            <ul className="mt-10 grid sm:grid-cols-2 gap-4">
              {segment.dores.map((d) => (
                <li key={d} className="flex gap-3 rounded-xl border border-border bg-surface p-5">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-destructive shrink-0" />
                  <span className="text-foreground/85 leading-snug">{d}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 4. CUSTO DE ADIAR */}
        <section className="py-20 bg-surface/40 border-y border-border/40">
          <div className="container-x max-w-3xl text-center">
            <Clock className="mx-auto h-10 w-10 text-gold" />
            <h2 className="mt-5 font-display text-3xl md:text-4xl leading-tight">
              Enquanto você espera, o tempo (e o dólar) seguem correndo.
            </h2>
            <p className="mt-6 text-lg text-foreground/80 leading-relaxed">
              {segment.custo_adiar}
            </p>
          </div>
        </section>

        {/* 5. O CAMINHO — EB-2 NIW */}
        <section className="py-24">
          <div className="container-x grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="bg-gold text-gold-foreground">EB-2 NIW</Badge>
              <h2 className="mt-4 font-display text-3xl md:text-5xl">
                O caminho: Green Card por mérito, sem patrocinador.
              </h2>
              <p className="mt-5 text-foreground/80 leading-relaxed">
                O EB-2 National Interest Waiver permite que profissionais qualificados
                solicitem a residência permanente baseada no próprio histórico, sem
                depender de empresa contratante nos EUA.
              </p>
              <ul className="mt-8 grid sm:grid-cols-2 gap-3">
                {[
                  { icon: ShieldCheck, t: "Sem empregador patrocinador" },
                  { icon: Award, t: "Baseado na sua trajetória" },
                  { icon: Heart, t: "Green Card para cônjuge e filhos" },
                  { icon: Sparkles, t: "Caminho à cidadania após 5 anos" },
                ].map(({ icon: Icon, t }) => (
                  <li key={t} className="flex gap-3 rounded-xl border border-border bg-surface p-4">
                    <Icon className="h-5 w-5 text-gold shrink-0" />
                    <span className="text-sm leading-snug">{t}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-xs text-muted-foreground">
                Nota: também avaliamos EB-1 e EB-3 quando se mostram o melhor caminho para o seu caso.
              </p>
            </div>

            <div className="relative">
              <div className="aspect-video rounded-2xl overflow-hidden border border-gold/30 bg-gradient-to-br from-ink via-ink-raise to-ink-deep grid place-items-center shadow-elegant">
                <button type="button" className="group flex flex-col items-center gap-3 text-foreground/90">
                  <span className="grid h-20 w-20 place-items-center rounded-full bg-gold text-gold-foreground transition-transform group-hover:scale-105">
                    <PlayCircle className="h-10 w-10" />
                  </span>
                  <span className="font-serif text-lg">Entenda o EB-2 NIW</span>
                  <span className="text-xs text-muted-foreground uppercase tracking-[0.2em]">Vídeo placeholder</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 6. PROCESSO EB-2 NIW (real) */}
        <section className="section-cream py-24">
          <div className="container-x">
            <Badge variant="outline" className="border-navy/30 text-navy">Processo EB-2 NIW</Badge>
            <h2 className="mt-4 font-display text-3xl md:text-5xl text-navy max-w-3xl">
              Quatro etapas. Conduzidas com rigor.
            </h2>
            <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { n: "01", t: "Análise Criteriosa", d: "Avaliamos histórico, formação, impacto e potencial para o EB-2 NIW." },
                { n: "02", t: "Arquitetura Estratégica", d: "Estruturamos a narrativa do seu Endeavor para evidenciar o interesse nacional americano." },
                { n: "03", t: "Preparação Documental", d: "Documentação meticulosa, cartas de recomendação e evidências de alto padrão." },
                { n: "04", t: "Revisão Final", d: "Organização impecável da Petition nos critérios exigidos pelo USCIS." },
              ].map((s) => (
                <div key={s.n} className="rounded-2xl bg-white border border-navy/10 p-7">
                  <span className="font-display text-5xl text-gold">{s.n}</span>
                  <h3 className="mt-4 font-serif text-xl text-navy">{s.t}</h3>
                  <p className="mt-2 text-navy/75">{s.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 7. CHECKLIST — Este caminho é para você que: */}
        <section className="py-24">
          <div className="container-x max-w-3xl">
            <Badge variant="outline" className="border-gold/40 text-gold">Pré-qualificação</Badge>
            <h2 className="mt-4 font-display text-3xl md:text-5xl">Este caminho é para você que:</h2>
            <ul className="mt-10 space-y-3">
              {segment.checklist.map((item) => (
                <li
                  key={item.texto}
                  className={`flex gap-3 rounded-xl border p-5 ${
                    item.positivo
                      ? "border-success/30 bg-success/5"
                      : "border-destructive/30 bg-destructive/5"
                  }`}
                >
                  {item.positivo ? (
                    <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                  )}
                  <span className="leading-snug">{item.texto}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 8. AUTORIDADE */}
        <section className="py-24 bg-surface/40">
          <div className="container-x grid lg:grid-cols-[0.9fr_1.1fr] gap-12">
            <div>
              <Badge variant="outline" className="border-gold/40 text-gold">Por que a Status</Badge>
              <h2 className="mt-4 font-display text-3xl md:text-5xl">Sede própria nos EUA, equipe dedicada a brasileiros.</h2>
              <p className="mt-5 text-foreground/80 leading-relaxed max-w-md">
                Estrutura completa para acompanhar você do primeiro contato à instalação da família nos Estados Unidos.
              </p>
            </div>
            <ul className="grid sm:grid-cols-2 gap-4">
              {[
                { icon: MapPin, t: "Sede própria em Orlando, Flórida" },
                { icon: Users, t: "Equipe dedicada por especialidade" },
                { icon: Award, t: "+25 anos de experiência" },
                { icon: Star, t: "Nota 5,0 no Google · Selo BBB" },
                { icon: Heart, t: "+1.000 famílias atendidas" },
                { icon: ShieldCheck, t: "Documentação, tradução, mudança, bancos, escolas" },
              ].map(({ icon: Icon, t }) => (
                <li key={t} className="rounded-xl border border-gold/25 bg-ink-raise/60 p-5 flex gap-3">
                  <Icon className="h-5 w-5 text-gold shrink-0 mt-0.5" />
                  <span className="leading-snug">{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 9. DEPOIMENTOS — substituir por reais autorizados */}
        <section className="section-cream py-24">
          <div className="container-x">
            <Badge variant="outline" className="border-navy/30 text-navy">Quem já fez essa travessia</Badge>
            <h2 className="mt-4 font-display text-3xl md:text-5xl text-navy max-w-3xl">
              Brasileiros que reescreveram o próprio capítulo.
            </h2>
            <div className="mt-12 grid md:grid-cols-3 gap-5">
              {[
                { name: "Dr. R. M.", role: "Médico — São Paulo", q: "O processo foi conduzido com método e clareza em cada etapa." },
                { name: "L. C.", role: "Engenheira — Belo Horizonte", q: "A equipe construiu uma narrativa profissional que sozinha eu não saberia montar." },
                { name: "P. A.", role: "Empresário — Curitiba", q: "Entenderam o porte da minha operação e traduziram isso para o critério de interesse nacional." },
              ].map((i) => (
                <Card key={i.name} className="border-navy/10 bg-white">
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="flex gap-1 text-gold">
                      {[...Array(5)].map((_, k) => <Star key={k} className="h-4 w-4 fill-gold" />)}
                    </div>
                    <p className="mt-4 text-navy/85 italic font-serif leading-relaxed">"{i.q}"</p>
                    <div className="mt-6 pt-4 border-t border-navy/10">
                      <p className="font-medium text-navy">{i.name}</p>
                      <p className="text-xs text-navy/60">{i.role}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* 10. FAQ — segmento + base */}
        <section className="py-24">
          <div className="container-x max-w-3xl">
            <Badge variant="outline" className="border-gold/40 text-gold">Dúvidas frequentes</Badge>
            <h2 className="mt-4 font-display text-3xl md:text-5xl">Antes que você pergunte.</h2>
            <Accordion type="single" collapsible className="mt-10">
              {[...segment.faq_segmento, ...BASE_FAQ].map((f, i) => (
                <AccordionItem key={i} value={`f-${i}`} className="border-border">
                  <AccordionTrigger className="text-left font-serif text-lg hover:text-gold">
                    {f.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-foreground/80 leading-relaxed">
                    {f.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* 11. CTA FINAL + FORMULÁRIO */}
        <section id="avaliacao" className="py-24 bg-gradient-to-b from-background to-surface relative">
          <div className="absolute inset-0 stars-pattern opacity-15 -z-10" />
          <div className="container-x grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-start">
            <div>
              <Badge className="bg-gold text-gold-foreground">Avaliação gratuita</Badge>
              <h2 className="mt-4 font-display text-3xl md:text-5xl leading-tight">
                Descubra se você tem perfil para o Green Card.
              </h2>
              <p className="mt-5 text-foreground/80 max-w-md leading-relaxed">
                Avaliação confidencial e sem compromisso. Em até 48h nossa equipe analisa
                seu perfil e indica o caminho mais coerente com sua história.
              </p>
              <ul className="mt-8 space-y-3 text-sm text-foreground/80">
                {[
                  "Análise estratégica do seu perfil",
                  "Resposta em até 48h por e-mail",
                  "Confidencial e sem compromisso",
                  "Equipe especializada em vistos EB",
                ].map((i) => (
                  <li key={i} className="flex gap-2">
                    <CheckCircle2 className="h-4 w-4 text-gold mt-0.5 shrink-0" /> {i}
                  </li>
                ))}
              </ul>
            </div>

            {/* Card de CTA (form vive em /avaliacao). */}
            <div className="rounded-2xl border border-gold/30 bg-surface p-7 md:p-9">
              <p className="text-[11px] tracking-[0.22em] text-gold">PRÓXIMO PASSO</p>
              <h3 className="mt-3 font-display text-2xl leading-tight">
                Comece pela análise gratuita do seu perfil.
              </h3>
              <p className="mt-3 text-foreground/75 text-[15px] leading-relaxed">
                Em poucos minutos você envia seus dados. Nossa equipe responde
                em até 48h por e-mail.
              </p>
              <a href={avaliacaoHref(`lp_${segment.id}_cta`, segment.id)} className="mt-7 inline-block">
                <Button size="lg" className="btn-label text-base">Fazer minha avaliação gratuita</Button>
              </a>
            </div>
          </div>
        </section>
      </main>
      <LpFooter />
    </div>
  );
}

const BASE_FAQ = [
  {
    q: "Preciso de inglês fluente para começar?",
    a: "Não para iniciar a estratégia. O inglês é desejável para a vida nos EUA — orientamos sobre o nível recomendável — mas o processo de petição em si é técnico e conduzido pela equipe.",
  },
  {
    q: "Quanto tempo dura o processo?",
    a: "O ciclo do EB-2 NIW costuma levar em torno de dois anos entre preparação, protocolo e decisão. Por isso recomendamos começar cedo.",
  },
  {
    q: "O EB-2 NIW exige uma empresa me contratando nos EUA?",
    a: "Não. Essa é justamente a essência do National Interest Waiver: o profissional dispensa o patrocinador ao demonstrar que sua atuação é de interesse nacional americano.",
  },
  {
    q: "Como estão as filas e a emissão de vistos para brasileiros hoje?",
    a: "O cenário consular tem flutuações naturais ao longo do tempo, o que reforça a importância do planejamento antecipado. Acompanhamos esse cenário e estruturamos cada caso conforme as regras vigentes, sem prometer prazos.",
  },
  {
    q: "Quanto custa?",
    a: "A avaliação inicial é gratuita. O investimento da preparação documental depende do perfil, da complexidade do caso e da composição familiar — apresentado de forma transparente antes de qualquer contratação.",
  },
];

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
