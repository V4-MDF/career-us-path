/**
 * Seções da Home — Sistema "Dossiê / Credencial".
 *
 * Prompt 5: dados reais + CTAs apontando para LP /avaliacao com src/seg/utms.
 *  - ProcessSteps: substituído pelo processo real EB-2 NIW (4 etapas).
 *  - WhyUs: estatísticas reais (25+ anos, 5.000+ processos, 98% satisfação,
 *           1.000+ famílias, 130+ avaliações 5★, BBB nota A).
 *  - Testimonials: depoimentos reais (Pedro Rezende, Ruani Costa).
 *  - FAQ: perguntas reais (confiança, experiência, atendimento remoto, valor).
 *  - LegacySection: nova dobra "Muito mais que um visto. Um legado.".
 *  - CtaForm (com form inline) → CtaBanner (CTA forte para /avaliacao).
 *  - AuthorityStrip: credenciais reais (BBB A, EIN, sede Orlando).
 *  - Todos os CTAs usam avaliacaoHref(src[, seg]) — preserva utms/seg.
 */

import { Link } from "@tanstack/react-router";
import { motion, useInView, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle, Award, Briefcase, Building2, CheckCircle2, FileText,
  GraduationCap, Heart, Layers, MapPin, PlayCircle, ShieldCheck,
  Sparkles, Star, Stethoscope, TrendingUp, Users, Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { useContent } from "@/lib/siteContent";
import { avaliacaoHref } from "@/lib/ctaLinks";
import { SectionHead } from "./SectionHead";
import { BrUsRouteBackdrop } from "./visuals/BrUsRouteBackdrop";
import { FamilySealBackdrop } from "./visuals/FamilySealBackdrop";
import { ProcessIconStrip } from "./visuals/ProcessIconStrip";
import { LeadFormProgressive } from "./LeadFormProgressive";
import { useLocation } from "@tanstack/react-router";
import { FlagsBRUS } from "./flags";
import heroSkyline from "@/assets/hero-skyline.jpg";
import familyPortrait from "@/assets/family-portrait.jpg";
import passportDocuments from "@/assets/passport-documents.jpg";
import usMapEngraving from "@/assets/us-map-engraving.png";

/* ============================================================
 * 1. HERO
 * ============================================================ */
export function Hero() {
  const eyebrow = useContent("hero.eyebrow");
  const title = useContent("hero.title");
  const sub = useContent("hero.subtitle");
  const cta = useContent("hero.cta");
  const proof = useContent("hero.proof");
  const reduce = useReducedMotion();
  const lines = splitHeadline(title);
  // Easing assinatura — cubic-bezier(0.16, 1, 0.3, 1) (expo-out premium).
  const easeSig = [0.16, 1, 0.3, 1] as const;

  // Parallax sutil ligado ao scroll do hero (≤8%). Desligado em mobile e quando
  // o usuário pede menos movimento — evita jank/composite por frame.
  const heroRef = useRef<HTMLElement>(null);
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const isMobile = useMediaQuery("(max-width: 767px)");
  const enableParallax = isDesktop && !reduce;
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", enableParallax ? "6%" : "0%"]);

  // Tempo + delay: no mobile, reveals curtos (~0.35s) e sem cascata de delays,
  // mantendo o "luxo silencioso" sem peso de movimento. Reduced-motion → 0.
  const t = (d: number) => (reduce ? 0 : isMobile ? Math.min(d * 0.5, 0.35) : d);
  const dly = (d: number) => (reduce || isMobile ? 0 : d);



  return (
    <section
      ref={heroRef}
      id="abertura"
      aria-label="Abertura"
      className="section-anchor relative overflow-hidden pt-32 md:pt-44 pb-24 md:pb-36"
    >
      {/* Skyline NYC ao amanhecer — atmosfera EUA. Overlay forte preserva legibilidade. */}
      <div aria-hidden className="absolute inset-0 -z-20">
        <img
          src={heroSkyline}
          alt=""
          width={1600}
          height={1024}
          fetchPriority="high"
          className="h-full w-full object-cover object-bottom opacity-[0.22] motion-safe:[mask-image:linear-gradient(to_bottom,black_40%,transparent_100%)]"
        />
      </div>
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-ink/85 via-ink/80 to-ink" />
      {/* Motivo geográfico BR→USA — dot-grid + rota tracejada animada. */}
      <div aria-hidden className="absolute inset-0 -z-10 text-gold">
        <BrUsRouteBackdrop />
      </div>

      <div className="container-x grid lg:grid-cols-[1.1fr_0.9fr] gap-16 lg:gap-20 items-center">
        <div>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: t(0.5), ease: easeSig }}
            className="flex items-center gap-3"
          >
            <span aria-hidden className="h-px w-10 bg-gold" />
            <span className="font-mono-label text-gold">{eyebrow}</span>
          </motion.div>

          {/* H1: tipo fluido grande e confiante (display-1). No desktop, reveal linha-a-linha com máscara y; no mobile/reduced, fade puro — sem peso visual. */}
          <h1 className="display-1 mt-8">
            {lines.map((ln, i) => (
              <span key={i} className="block overflow-hidden pb-1">
                <motion.span
                  className="block"
                  initial={isMobile || reduce ? { opacity: 0 } : { y: "110%" }}
                  animate={isMobile || reduce ? { opacity: 1 } : { y: "0%" }}
                  transition={{ duration: t(0.85), ease: easeSig, delay: dly(0.15 + i * 0.1) }}
                >
                  {renderEmphasis(ln)}
                </motion.span>
              </span>
            ))}
          </h1>

          {/* Filete dourado que se desenha da esquerda → direita. */}
          <motion.div
            initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
            transition={{ duration: t(0.9), ease: easeSig, delay: dly(0.55) }}
            style={{ transformOrigin: "left center" }}
            className="mt-10 h-px w-28 bg-gold"
          />

          <motion.p
            initial={{ opacity: 0, y: isMobile ? 6 : 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: t(0.7), ease: easeSig, delay: dly(0.7) }}
            className="lead mt-7 max-w-xl"
          >
            {sub}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: isMobile ? 6 : 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: t(0.7), ease: easeSig, delay: dly(0.85) }}
            className="mt-10 flex flex-wrap gap-3"
          >
            <Link to={avaliacaoHref("home_hero")} aria-label="Ir para o formulário de avaliação gratuita">
              <Button size="lg" className="btn-label btn-sweep h-12 px-7 text-[15px] active:scale-[0.98]">
                {cta}
              </Button>
            </Link>

            <a href="#eb-2-niw">
              <Button
                size="lg" variant="outline"
                className="btn-label h-12 px-6 text-[15px] border-gold/40 text-foreground hover:border-gold hover:bg-gold/5"
              >
                <PlayCircle className="mr-2 h-4 w-4" /> Entenda o EB-2 NIW
              </Button>
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: t(0.6), delay: dly(1.1) }}
            className="mt-14 flex items-start gap-3 text-sm text-foreground/60 border-l border-gold/50 pl-4 max-w-md"
          >
            <Star className="h-4 w-4 text-gold mt-0.5 shrink-0 fill-gold" />
            <span>{proof}</span>
          </motion.div>



        </div>

        {/* Bloco editorial — parallax sutil (apenas desktop). */}
        <motion.div
          className="relative hidden lg:block"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ duration: t(1.0), ease: easeSig, delay: t(0.25) }}
          style={enableParallax ? { y: imgY, willChange: "transform" } : undefined}
        >
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-gold/30 bg-ink-raise shadow-elevated">
            {/* Fotografia editorial — família multigeracional em paisagem americana. */}
            <img
              src={familyPortrait}
              alt="Família brasileira em paisagem americana ao amanhecer"
              width={1280}
              height={1600}
              loading="eager"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-deep via-ink-deep/30 to-transparent" />
            <div className="absolute inset-3 rounded-2xl border border-gold/30 pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 p-7">
              <div className="flex items-center gap-3 mb-3">
                <FlagsBRUS size={14} />
                <span className="font-mono-label text-gold/80">RETRATO EDITORIAL</span>
              </div>
              <p className="font-display text-2xl leading-tight text-foreground">
                Uma família. Um Green Card. Um novo capítulo.
              </p>
            </div>
          </div>

          <div className="absolute -bottom-6 -left-6 rounded-xl border border-gold bg-ink-deep/95 backdrop-blur p-4 max-w-[200px] shadow-elevated">
            <div className="absolute top-0 left-0 h-[3px] w-10 bg-gold" />
            <div className="flex items-center gap-1 text-gold">
              {[...Array(5)].map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-gold" />)}
            </div>
            <p className="mt-1.5 font-mono-label text-foreground/70">130+ AVALIAÇÕES 5★</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}


function splitHeadline(t: string): string[] {
  const words = t.split(/\s+/);
  if (words.length <= 6) return [t];
  const mid = Math.ceil(words.length / 2);
  return [words.slice(0, mid).join(" "), words.slice(mid).join(" ")];
}

function renderEmphasis(text: string) {
  const parts = text.split(/(mérito)/i);
  return parts.map((p, i) =>
    /^mérito$/i.test(p)
      ? <span key={i} className="font-display italic text-gold">{p}</span>
      : <span key={i}>{p}</span>
  );
}

/* ============================================================
 * 2. FAIXA DE AUTORIDADE — selos reais (Prompt 5)
 * ============================================================ */
export function AuthorityStrip() {
  const items = [
    "BBB · ACCREDITED A",
    "EIN 99-4846502",
    "SEDE EM ORLANDO, FL",
    "130+ AVALIAÇÕES 5★",
    "25+ ANOS DE EXPERIÊNCIA",
  ];
  return (
    <section id="credenciais" aria-label="Credenciais" className="section-anchor section-ink-deep border-y border-gold/15">
      <div className="container-x py-7 flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
        <span className="font-mono-label text-gold">CREDENCIAIS</span>
        {items.map((i) => (
          <span key={i} className="font-mono-label text-foreground/55">{i}</span>
        ))}
      </div>
    </section>
  );
}

/* ============================================================
 * 3. BRASIL vs EUA
 * ============================================================ */
export function ContrastBrasilEUA() {
  const brasil = [
    "Insegurança no dia a dia da família",
    "Carga tributária alta e crescente",
    "Instabilidade política e econômica",
    "Oportunidades limitadas mesmo com qualificação",
    "Futuro incerto para os filhos",
  ];
  const eua = [
    "Economia estável e remuneração em dólar",
    "Segurança e qualidade de vida para a família",
    "Carreira valorizada por mérito e resultado",
    "Educação e saúde entre as melhores do mundo",
    "Caminho legal baseado em quem você já é",
  ];
  const title = useContent("contrast.title");
  const subtitle = useContent("contrast.subtitle");

  return (
    <Reveal as="section" id="brasil-vs-eua" className="section-parchment section-pad">
      <div className="container-x">
        <SectionHead num="01" eyebrow="POR QUE MIGRAR AGORA" title="Duas realidades. Uma decisão." variant="parchment" />
        <div className="mt-14 grid md:grid-cols-2 gap-6">
          <div className="relative gold-tick rounded-2xl bg-white border border-ink-text/10 p-8 shadow-soft">
            <div className="flex items-center gap-3 text-oxblood">
              <AlertTriangle className="h-5 w-5" />
              <h3 className="font-display text-xl text-ink-text m-0">A realidade que você já conhece no Brasil</h3>
            </div>
            <ul className="mt-7 space-y-3.5">
              {brasil.map((b) => (
                <li key={b} className="flex gap-3 text-ink-text/85">
                  <span className="mt-2.5 h-1 w-1 rounded-full bg-oxblood shrink-0" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative gold-tick rounded-2xl bg-white border border-gold/40 p-8 shadow-soft">
            <div className="flex items-center gap-3 text-success">
              <CheckCircle2 className="h-5 w-5" />
              <h3 className="font-display text-xl text-ink-text m-0">O que os EUA oferecem a quem é qualificado</h3>
            </div>
            <ul className="mt-7 space-y-3.5">
              {eua.map((b) => (
                <li key={b} className="flex gap-3 text-ink-text/85">
                  <CheckCircle2 className="h-4 w-4 text-success mt-1 shrink-0" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className="mt-14 max-w-3xl font-display text-2xl md:text-[32px] text-ink-text leading-snug">
          {title} <span className="text-gold italic">{subtitle}</span>
        </p>
      </div>
    </Reveal>
  );
}

/* ============================================================
 * 4. EB-2 NIW (carro-chefe)
 * ============================================================ */
export function NiwSection() {
  const title = useContent("niw.title");
  const lead = useContent("niw.lead");
  const bullets = [
    { icon: ShieldCheck, t: "Sem necessidade de empregador patrocinador" },
    { icon: Award, t: "Baseado no seu histórico e contribuição profissional" },
    { icon: Heart, t: "Green Card para cônjuge e filhos" },
    { icon: Sparkles, t: "Caminho para a cidadania americana após 5 anos" },
  ];
  return (
    <Reveal as="section" id="eb-2-niw" className="section-pad relative">
      <div className="absolute inset-0 -z-10 guilloche" />
      <div className="container-x grid lg:grid-cols-2 gap-14 items-center">
        <div>
          <SectionHead num="02" eyebrow="CARRO-CHEFE — EB-2 NIW" title={title} />
          <p className="mt-6 text-[17px] text-foreground/80 leading-relaxed max-w-xl">{lead}</p>
          <ul className="mt-9 grid sm:grid-cols-2 gap-3">
            {bullets.map(({ icon: Icon, t }) => (
              <li key={t} className="relative gold-tick rounded-xl border border-gold/25 bg-ink-raise/50 p-5">
                <Icon className="h-5 w-5 text-gold mb-3" />
                <span className="text-sm leading-snug text-foreground/90">{t}</span>
              </li>
            ))}
          </ul>
          <a href={avaliacaoHref("home_niw")} className="inline-block mt-10">
            <Button size="lg" className="btn-label btn-sweep h-12 px-7">Quero saber se tenho perfil</Button>
          </a>
        </div>

        <div className="relative">
          <div className="aspect-video overflow-hidden rounded-2xl border border-gold/40 bg-ink-deep relative shadow-elevated">
            {/* Foto editorial — passaporte brasileiro + documentos sobre mesa de madeira. */}
            <img
              src={passportDocuments}
              alt="Passaporte brasileiro, documentos e mapa dos Estados Unidos sobre mesa de madeira"
              width={1600}
              height={1024}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-ink-deep/80 via-ink-deep/30 to-transparent" />
            <div className="absolute inset-3 rounded-xl border border-gold/30 pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 p-6 flex items-end justify-between gap-4">
              <div>
                <p className="font-mono-label text-gold/80">DOSSIÊ EB-2 NIW</p>
                <p className="mt-1 font-display text-lg text-foreground">
                  Documentação preparada com rigor de petição americana.
                </p>
              </div>
              <FlagsBRUS size={16} />
            </div>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

/* ============================================================
 * 5. CARDS DE VISTOS
 * ============================================================ */
export function VisaCards() {
  const visas = [
    { slug: "eb2-niw", tag: "EM DESTAQUE", title: "EB-2 NIW",
      desc: "Green Card por mérito profissional. Sem patrocinador, com a família inclusa.", featured: true },
    { slug: "eb1", tag: "HABILIDADE EXTRAORDINÁRIA", title: "EB-1",
      desc: "Para profissionais com reconhecimento internacional comprovado em sua área." },
    { slug: "eb3", tag: "EXIGE PATROCINADOR", title: "EB-3",
      desc: "Caminho para profissionais qualificados com oferta formal de emprego nos EUA." },
  ];
  return (
    <Reveal as="section" id="vistos-eb" className="section-ink-deep section-pad border-y border-gold/10">
      <div className="container-x">
        <SectionHead num="03" eyebrow="VISTOS EB" title="Três caminhos. Uma estratégia para cada perfil." />
        <div className="mt-14 grid md:grid-cols-3 gap-5">
          {visas.map((v) => (
            <Link key={v.slug} to="/vistos/$slug" params={{ slug: v.slug }} className="group block">
              <article className={`relative gold-tick h-full border p-8 transition-colors ${
                v.featured ? "border-gold bg-ink-raise" : "border-gold/20 bg-ink-raise/60 hover:border-gold/60"
              }`}>
                <span className="font-mono-label text-gold">{v.tag}</span>
                <h3 className="mt-4 font-display text-[40px] leading-none">{v.title}</h3>
                <p className="mt-5 text-sm text-foreground/75 leading-relaxed">{v.desc}</p>
                <span className="mt-7 inline-flex items-center text-sm text-gold">
                  Conhecer este visto <span aria-hidden className="ml-2 transition-transform group-hover:translate-x-1">→</span>
                </span>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </Reveal>
  );
}

/* ============================================================
 * 6. PERFIS QUE ATENDEMOS — CTA leva para /avaliacao
 * ============================================================ */
export function PersonaCards() {
  const personas = [
    { icon: Stethoscope, title: "Médicos", seg: "medicos",
      headline: "Sua trajetória clínica é um ativo de interesse americano." },
    { icon: Wrench, title: "Engenheiros", seg: "engenheiros",
      headline: "Da infraestrutura à tecnologia: o mercado americano valoriza o que você já faz." },
    { icon: Building2, title: "Empresários", seg: "empresarios",
      headline: "Geração de empregos e impostos pesa positivamente na sua petição." },
  ];
  return (
    <Reveal as="section" id="perfis-atendidos" className="section-pad">
      <div className="container-x">
        <SectionHead num="04" eyebrow="PERFIS QUE ATENDEMOS" title="Profissões consolidadas têm caminho mais curto pelo EB-2 NIW." />
        <div className="mt-14 grid md:grid-cols-3 gap-5">
          {personas.map((p) => {
            const Icon = p.icon;
            return (
              <article key={p.title} className="relative gold-tick border border-gold/25 bg-ink-raise/60 p-8 transition-colors hover:border-gold/60">
                <span className="grid h-12 w-12 place-items-center border border-gold/50 text-gold">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="mt-6 font-display text-2xl">{p.title}</h3>
                <p className="mt-3 text-foreground/75 leading-relaxed">{p.headline}</p>
                {/* CTA leva à LP /avaliacao com seg + src — preserva utms da URL atual. */}
                <a
                  href={avaliacaoHref(`home_persona_${p.seg}`, p.seg)}
                  className="mt-7 inline-flex items-center text-sm text-gold hover:text-gold"
                >
                  Avaliar meu perfil <span aria-hidden className="ml-2">→</span>
                </a>
              </article>
            );
          })}
        </div>
      </div>
    </Reveal>
  );
}

/* ============================================================
 * 7. PROCESSO EB-2 NIW (Prompt 5 — 4 etapas reais)
 * ============================================================ */
export function ProcessSteps() {
  const steps = [
    { n: "01", icon: GraduationCap, t: "Análise Criteriosa",
      d: "Avaliamos histórico, formação, impacto e potencial para o EB-2 NIW." },
    { n: "02", icon: Layers, t: "Arquitetura Estratégica",
      d: "Estruturamos a narrativa do seu Endeavor para evidenciar o interesse nacional americano." },
    { n: "03", icon: FileText, t: "Preparação Documental",
      d: "Documentação meticulosa, cartas de recomendação e evidências de alto padrão." },
    { n: "04", icon: Briefcase, t: "Revisão Final",
      d: "Organização impecável da Petition nos critérios exigidos pelo USCIS." },
  ];
  return (
    <Reveal as="section" id="processo-eb-2-niw" className="section-parchment section-pad relative overflow-hidden">
      <div aria-hidden className="absolute inset-0 text-ink-text/10"><ProcessIconStrip /></div>
      <div className="container-x relative">
        <SectionHead num="05" eyebrow="PROCESSO EB-2 NIW" title="Quatro etapas. Conduzidas com rigor." variant="parchment" />
        <div className="mt-14 grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {steps.map(({ n, icon: Icon, t, d }) => (
            <div key={n} className="relative gold-tick bg-white border border-ink-text/10 p-7 flex flex-col h-full">
              <span className="font-display text-[48px] leading-none text-gold">{n}</span>
              <Icon className="h-5 w-5 text-ink-text/60 mt-5" />
              <h3 className="mt-3 font-display text-lg text-ink-text">{t}</h3>
              <p className="mt-2 text-ink-text/75 text-[15px] leading-relaxed">{d}</p>
            </div>
          ))}
        </div>
      </div>
    </Reveal>
  );
}

/* ============================================================
 * 8. POR QUE A STATUS — estatísticas reais
 * ============================================================ */
export function WhyUs() {
  const title = useContent("why.title");
  const lead = useContent("why.lead");

  // Stats reais (Prompt 5) — internamente "pendentes de validação" (admin)
  const stats = [
    { value: "25+", label: "ANOS DE EXPERIÊNCIA" },
    { value: "5.000+", label: "PROCESSOS" },
    { value: "98%", label: "DE SATISFAÇÃO" },
    { value: "1.000+", label: "FAMÍLIAS ATENDIDAS" },
  ];
  const items = [
    { icon: MapPin, t: "Sede própria em Orlando, Flórida (EIN 99-4846502)" },
    { icon: Users, t: "Filial no Brasil em Barueri/SP (CNPJ 62.917.376/0001-21)" },
    { icon: ShieldCheck, t: "Acreditação BBB — nota A" },
    { icon: Star, t: "130+ avaliações 5★ no Google e Facebook" },
  ];
  return (
    <Reveal as="section" id="por-que-status" className="section-pad relative">
      <div className="container-x">

        <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-12">
          <div>
            <SectionHead num="06" eyebrow="POR QUE A STATUS" title={title} />
            <p className="mt-6 text-foreground/80 leading-relaxed max-w-md">{lead}</p>
          </div>
          <ul className="grid sm:grid-cols-2 gap-3 self-end">
            {items.map(({ icon: Icon, t }) => (
              <li key={t} className="border border-gold/20 bg-ink-raise/50 p-5 flex gap-3">
                <Icon className="h-5 w-5 text-gold shrink-0 mt-0.5" />
                <span className="leading-snug text-foreground/85">{t}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-16 border-y border-gold/30">
          <div className="grid grid-cols-2 md:grid-cols-4">
            {stats.map((s, i) => (
              <div key={s.label} className={`relative py-10 px-6 ${i > 0 ? "md:border-l border-gold/15" : ""}`}>
                <div className="absolute top-0 left-6 h-[2px] w-8 bg-gold" />
                <CountUp value={s.value} className="stat-num text-foreground" />
                <p className="mt-3 font-mono-label text-gold/85">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Reveal>
  );
}

/* ============================================================
 * 8b. LEGADO — "Muito mais que um visto. Um legado." (Prompt 5)
 * ============================================================ */
export function LegacySection() {
  const pillars = [
    { icon: Briefcase, t: "Independência Profissional",
      d: "Trabalhe para quem quiser, abra empresa ou mude de área sem comprometer seu status." },
    { icon: ShieldCheck, t: "Green Card Direto",
      d: "Residência permanente para você e a família, caminho para a cidadania americana." },
    { icon: Heart, t: "Segurança Familiar",
      d: "Cônjuge com autorização de trabalho e filhos solteiros menores de 21 com os mesmos benefícios." },
    { icon: Sparkles, t: "Previsibilidade",
      d: "Controle do seu futuro imigratório, sem loterias e sem depender de empresas." },
  ];
  return (
    <Reveal as="section" id="legado" className="section-ink-deep section-pad border-y border-gold/10 relative overflow-hidden">
      {/* Backdrops sobrepostos: mapa dos EUA gravado + selo de família. */}
      <div aria-hidden className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <img
          src={usMapEngraving}
          alt=""
          width={1600}
          height={1024}
          loading="lazy"
          className="w-[120%] max-w-none opacity-[0.07] mix-blend-screen select-none"
        />
      </div>
      <div aria-hidden className="absolute inset-0 text-gold"><FamilySealBackdrop /></div>
      <div className="container-x relative">
        <SectionHead
          num="07"
          eyebrow="O QUE VOCÊ CONQUISTA"
          title="Muito mais que um visto. Um legado."
          kicker="O Green Card pelo EB-2 NIW reconfigura o horizonte da sua família — em quatro pilares."
        />
        <div className="mt-14 grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {pillars.map(({ icon: Icon, t, d }) => (
            <article key={t} className="relative gold-tick rounded-2xl border border-gold/25 bg-ink-raise/50 p-7 h-full shadow-soft transition-[border-color,box-shadow] hover:border-gold/55 hover:shadow-elevated">
              <Icon className="h-6 w-6 text-gold" />
              <h3 className="mt-5 font-display text-xl">{t}</h3>
              <p className="mt-3 text-foreground/75 leading-relaxed text-[15px]">{d}</p>
            </article>
          ))}
        </div>
      </div>
    </Reveal>
  );
}

/* ============================================================
 * 9. SALÁRIO BRASIL vs EUA
 * ============================================================ */
export function SalaryCompare() {
  const rows = [
    { p: "Médico especialista", br: "R$ 25.000 / mês", us: "US$ 22.000 / mês" },
    { p: "Engenheiro sênior",   br: "R$ 18.000 / mês", us: "US$ 12.500 / mês" },
    { p: "Profissional de TI sênior", br: "R$ 20.000 / mês", us: "US$ 14.000 / mês" },
  ];
  return (
    <Reveal as="section" id="renda-em-dolar" className="section-pad">
      <div className="container-x">
        <SectionHead
          num="08"
          eyebrow="RENDA EM DÓLAR"
          title="A mesma carreira. Outro patamar de remuneração."
          kicker="Estimativas de mercado mensais médias. Valores variam por especialidade, cidade e senioridade."
        />
        <div className="mt-14 rounded-2xl border border-gold/25 overflow-hidden shadow-soft">
          <div className="grid grid-cols-[1.4fr_1fr_1fr] font-mono-label text-foreground/60 bg-ink-deep px-6 py-4 border-b border-gold/20">
            <span>PROFISSÃO</span><span>BRASIL</span><span className="text-gold">ESTADOS UNIDOS</span>
          </div>
          {rows.map((r, i) => (
            <div key={r.p} className={`grid grid-cols-[1.4fr_1fr_1fr] items-center px-6 py-6 ${i > 0 ? "border-t border-gold/15" : ""}`}>
              <span className="font-display text-lg">{r.p}</span>
              <span className="text-foreground/70 font-mono text-sm">{r.br}</span>
              <span className="text-gold font-mono text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4" /> {r.us}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Reveal>
  );
}

/* ============================================================
 * 10. DEPOIMENTOS — REAIS (Prompt 5)
 * Adicionar mais depoimentos reais do Google via admin (futuro).
 * ============================================================ */
export function Testimonials() {
  const items = [
    {
      name: "Pedro Rezende",
      role: "Cliente",
      q: "Andrea transmite seriedade, informação e segurança no atendimento. Esclareceu pontos importantes com clareza, profissionalismo e transparência.",
    },
    {
      name: "Ruani Costa",
      role: "Cliente",
      q: "Amei o atendimento do Sr. Neto, atencioso em todos os detalhes e dúvidas. Um bom profissional faz toda a diferença.",
    },
  ];
  return (
    <Reveal as="section" id="depoimentos" className="section-parchment section-pad">
      <div className="container-x">
        <SectionHead
          num="09"
          eyebrow="QUEM JÁ CONFIOU NA STATUS"
          title="Avaliações reais de quem foi atendido pela equipe."
          kicker="Mais de 130 avaliações 5★ no Google e no Facebook."
          variant="parchment"
        />
        <div className="mt-14 grid md:grid-cols-2 gap-5 max-w-4xl">
          {items.map((i) => (
            <article key={i.name} className="relative gold-tick bg-white border border-ink-text/10 p-7 flex flex-col h-full">
              <div className="flex gap-0.5 text-gold">
                {[...Array(5)].map((_, k) => <Star key={k} className="h-3.5 w-3.5 fill-gold" />)}
              </div>
              <p className="mt-5 text-ink-text/85 italic font-display text-[17px] leading-relaxed">"{i.q}"</p>
              <div className="mt-auto pt-6 border-t border-ink-text/10">
                <p className="font-display text-ink-text">{i.name}</p>
                <p className="font-mono-label text-ink-text/55 mt-1">{i.role}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </Reveal>
  );
}

/* ============================================================
 * 11. FAQ — REAIS (Prompt 5)
 * ============================================================ */
export function FAQ() {
  const faqs = [
    {
      q: "A Status na América é confiável?",
      a: "Sim. Somos uma empresa registrada nos Estados Unidos (EIN 99-4846502), com sede em Orlando/FL e filial no Brasil (CNPJ 62.917.376/0001-21). Acumulamos 130+ avaliações 5★ no Google e no Facebook e somos acreditados pelo BBB com nota A. Transparência é regra: qualquer informação institucional pode ser verificada publicamente.",
    },
    {
      q: "Qual a experiência de vocês?",
      a: "Atuamos exclusivamente na preparação de documentação para vistos de emprego por mérito — EB-1, EB-2 NIW e EB-3. Esse foco gera profundidade nos critérios do USCIS. Não somos generalistas: cada caso é construído por uma equipe que já estruturou centenas de petições semelhantes.",
    },
    {
      q: "Posso confiar mesmo sem ir presencialmente?",
      a: "Sim. A empresa é verificável por EIN, Google Business, BBB e por avaliações reais de clientes. Nosso atendimento é 100% documentado e remoto, em todo o Brasil e nos Estados Unidos, com registros e contratos formais em cada etapa.",
    },
    {
      q: "Já fui enganado antes. Como sei que não é mais uma promessa?",
      a: "Não prometemos o que não podemos garantir. Somos honestos sobre requisitos, sobre as chances reais do seu perfil e sobre os prazos do USCIS e dos consulados, que não dependem de nenhum escritório. Nosso compromisso é com a qualidade da estruturação — não com retórica.",
    },
    {
      q: "Meu caso é complicado, vale tentar?",
      a: "Casos complexos são exatamente onde o método faz mais diferença. Antes de concluir que é inviável, agende uma análise: é gratuita e individual. Se houver caminho, indicamos com clareza; se não houver, dizemos com a mesma honestidade.",
    },
    {
      q: "Não tenho dinheiro sobrando, compensa?",
      a: "É um investimento significativo — e por isso a análise inicial é gratuita: para que a decisão seja informada. Valores são apresentados com clareza após o diagnóstico, sem pressão e sem letras miúdas. Não trabalhamos com promessas de ganho garantido.",
    },
  ];
  return (
    <Reveal as="section" id="duvidas-frequentes" className="section-pad">
      <div className="container-x max-w-3xl">
        <SectionHead num="10" eyebrow="DÚVIDAS FREQUENTES" title="Antes que você pergunte." />
        <Accordion type="single" collapsible className="mt-12">
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={`f-${i}`} className="border-gold/15">
              <AccordionTrigger className="text-left font-display text-lg md:text-xl hover:text-gold hover:no-underline py-5">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-foreground/75 leading-relaxed pb-6 text-[15.5px]">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </Reveal>
  );
}

/* ============================================================
 * 12. CTA FINAL — sem form inline (Prompt 5).
 * Substitui a antiga CtaForm; navega para /avaliacao com src.
 * ============================================================ */
export function CtaBanner() {
  const title = useContent("cta.title");
  const sub = useContent("cta.subtitle");
  return (
    <section id="avaliacao-gratuita" aria-label="Avaliação gratuita" className="section-anchor section-ink-deep section-pad relative border-t border-gold/15">
      {/* Sem guilloché aqui — reservado ao NIW (regra Chanel: tire um acessório). */}

      <div className="container-x">
        <div className="max-w-3xl">
          <SectionHead num="11" eyebrow="AVALIAÇÃO GRATUITA" title={title} kicker={sub} />
        </div>

        <div className="mt-12 grid lg:grid-cols-[1.2fr_1fr] gap-10 items-start">
          <ul className="grid sm:grid-cols-2 gap-3 text-[15px] text-foreground/80">
            {[
              "Análise estratégica gratuita do seu perfil",
              "Resposta em até 48h por e-mail",
              "Confidencial e sem compromisso",
              "Equipe especializada em vistos EB",
            ].map((i) => (
              <li key={i} className="flex gap-3 border border-gold/15 bg-ink-raise/40 p-4">
                <CheckCircle2 className="h-4 w-4 text-gold mt-1 shrink-0" /> {i}
              </li>
            ))}
          </ul>

          <div className="border border-gold/30 bg-ink-raise/50 p-7 lg:p-8">
            <p className="font-mono-label text-gold/80">PRÓXIMO PASSO</p>
            <h3 className="mt-3 font-display text-2xl leading-tight">
              Comece pela análise gratuita do seu perfil.
            </h3>
            <p className="mt-3 text-foreground/75 text-[15px] leading-relaxed">
              Em poucos minutos você envia seus dados. Nossa equipe responde em até 48h
              por e-mail com a indicação do caminho mais coerente.
            </p>
            <a href={avaliacaoHref("home_cta_final")} className="mt-7 inline-block">
              <Button size="lg" className="btn-label btn-sweep h-12 px-7">Fazer minha avaliação gratuita</Button>
            </a>
            <a
              href="/pre-qualificacao"
              className="mt-3 block text-[13px] text-gold/85 hover:text-gold underline underline-offset-4"
            >
              Prefere um teste rápido com resultado na hora? Faça a pré-qualificação →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
 * Helpers
 * ============================================================ */
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mql = window.matchMedia(query);
    const update = () => setMatches(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, [query]);
  return matches;
}

/**
 * Reveal — fade+slide leve via IntersectionObserver + classe CSS.
 * Substitui o `motion.div` por bloco com `content-visibility: auto`,
 * eliminando trabalho de animação JS por seção e reduzindo paint/layout
 * fora da viewport. Mantém o efeito visual quando entra na tela.
 */
function Reveal({
  children, className, as: As = "section", id,
}: {
  children: React.ReactNode;
  className?: string;
  as?: "section" | "div";
  id?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") { setShown(true); return; }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: "-80px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const Comp = As as any;
  return (
    <Comp
      ref={ref as any}
      id={id}
      aria-label={id ? id.replace(/-/g, " ") : undefined}
      className={`section-anchor cv-auto reveal ${shown ? "reveal-in" : ""} ${className ?? ""}`}
    >
      {children}
    </Comp>
  );
}


function CountUp({ value, className }: { value: string; className?: string }) {
  const match = value.match(/^([^\d-]*)([\d.,]+)(.*)$/);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(reduce ? value : match ? `${match[1]}0${match[3]}` : value);

  useEffect(() => {
    if (!inView || reduce || !match) { setDisplay(value); return; }
    const [, pre, num, post] = match;
    const target = parseFloat(num.replace(/\./g, "").replace(",", "."));
    if (!isFinite(target)) { setDisplay(value); return; }
    const decimals = num.includes(",") ? (num.split(",")[1] || "").length : 0;
    const start = performance.now();
    const dur = 1100;
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      const v = target * eased;
      const formatted = decimals
        ? v.toFixed(decimals).replace(".", ",")
        : Math.round(v).toLocaleString("pt-BR");
      setDisplay(`${pre}${formatted}${post}`);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduce, value, match]);

  return <span ref={ref} className={className}>{display}</span>;
}

// ──────────────────────────────────────────────────────────────────────────────
// HeroAssessment: bloco "Avaliação gratuita" embutido logo após o Hero, com
// o formulário progressivo (LeadFormProgressive) inline — sem mandar o usuário
// para outra página. A CTA principal do Hero ancora para #avaliacao-rapida.
// ──────────────────────────────────────────────────────────────────────────────
export function HeroAssessment() {
  const loc = useLocation();
  return (
    <section
      id="avaliacao-rapida"
      aria-label="Avaliação gratuita do seu perfil"
      className="section-anchor section-pad relative border-t border-gold/15"
    >
      <div className="container-x grid lg:grid-cols-[0.9fr_1.1fr] gap-10 lg:gap-14 items-start">
        <div>
          <p className="font-mono-label text-gold">AVALIAÇÃO GRATUITA</p>
          <h2 className="mt-4 font-display text-[clamp(1.75rem,3.4vw,2.6rem)] leading-tight">
            Comece sua avaliação aqui mesmo.
          </h2>
          <p className="mt-5 text-foreground/80 max-w-md leading-relaxed">
            Responda algumas perguntas curtas sobre o seu perfil. Suas respostas
            ficam salvas no seu dispositivo — se sair, retoma de onde parou. Nossa
            equipe responde por e-mail em até 48h.
          </p>
          <ul className="mt-7 space-y-3 text-sm text-foreground/80">
            {[
              "Sem compromisso, 100% confidencial",
              "Indicação do visto mais coerente (EB-2 NIW, EB-1, EB-3)",
              "Análise feita por equipe especializada em vistos EB",
            ].map((i) => (
              <li key={i} className="flex gap-3 border-l border-gold/40 pl-3">
                <CheckCircle2 aria-hidden className="h-4 w-4 text-gold mt-0.5 shrink-0" />
                <span>{i}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <LeadFormProgressive
            segmentId={undefined}
            currentPath={loc.pathname}
            submitLabel="Enviar para análise"
          />
        </div>
      </div>
    </section>
  );
}

