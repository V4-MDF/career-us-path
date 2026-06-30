/**
 * Seções da Home — Sistema "Dossiê / Credencial".
 *
 * Mudanças do Prompt 3.1:
 *  - Tipografia Bodoni Moda + Hanken Grotesk + JetBrains Mono (via tokens).
 *  - Hero com motion orquestrado (respeita prefers-reduced-motion).
 *  - SectionHead com filete dourado + numeração mono.
 *  - PersonaCards mantém-se como CONTEÚDO institucional, mas o CTA rola para
 *    o formulário (#avaliacao) — sem links para /lp/* (LPs são privadas).
 *  - Todos os "[CONFIRMAR]" foram removidos do conteúdo público (controle
 *    pendente vive em src/lib/pendingValidation.ts, visível só no admin).
 */

import { Link } from "@tanstack/react-router";
import { motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle, Award, Building2, CheckCircle2, Heart, MapPin,
  PlayCircle, ShieldCheck, Sparkles, Star, Stethoscope, TrendingUp,
  Users, Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { useContent } from "@/lib/siteContent";
import { LeadForm } from "./LeadForm";
import { SectionHead } from "./SectionHead";

/* ============================================================
 * 1. HERO — momento orquestrado (eyebrow → headline linha a linha
 *    → imagem → filete dourado se desenhando).
 * ============================================================ */
export function Hero() {
  const eyebrow = useContent("hero.eyebrow");
  const title = useContent("hero.title");
  const sub = useContent("hero.subtitle");
  const cta = useContent("hero.cta");
  const proof = useContent("hero.proof");
  const reduce = useReducedMotion();

  // Quebra a headline em 2 linhas para máscara (com fallback gracioso)
  const lines = splitHeadline(title);

  const easeOut = [0.22, 0.61, 0.36, 1] as const;
  const t = (d: number) => (reduce ? 0 : d);

  return (
    <section className="relative overflow-hidden pt-28 md:pt-36 pb-20 md:pb-28">
      {/* Camadas de fundo: ink + guilloché muito sutil + vinheta */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 guilloche" />
        <div className="absolute inset-0 bg-gradient-to-b from-ink-deep/30 via-transparent to-ink" />
      </div>

      <div className="container-x grid lg:grid-cols-[1.1fr_0.9fr] gap-14 items-center">
        <div>
          {/* Eyebrow com filete */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: t(0.45), ease: easeOut }}
            className="flex items-center gap-3"
          >
            <span aria-hidden className="h-px w-10 bg-gold" />
            <span className="font-mono-label text-gold">{eyebrow}</span>
          </motion.div>

          {/* Headline com revelação linha a linha (máscara) */}
          <h1 className="mt-7 font-display text-[42px] md:text-[64px] leading-[1.02] tracking-[-0.015em]">
            {lines.map((ln, i) => (
              <span key={i} className="block overflow-hidden pb-1">
                <motion.span
                  className="block"
                  initial={{ y: "110%" }}
                  animate={{ y: "0%" }}
                  transition={{ duration: t(0.7), ease: easeOut, delay: t(0.15 + i * 0.12) }}
                >
                  {renderEmphasis(ln)}
                </motion.span>
              </span>
            ))}
          </h1>

          {/* Filete dourado que "desenha" */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: t(0.8), ease: easeOut, delay: t(0.55) }}
            style={{ transformOrigin: "left center" }}
            className="mt-8 h-px w-24 bg-gold"
          />

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: t(0.55), ease: easeOut, delay: t(0.7) }}
            className="mt-6 text-[17px] leading-relaxed text-foreground/80 max-w-xl"
          >
            {sub}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: t(0.55), ease: easeOut, delay: t(0.85) }}
            className="mt-9 flex flex-wrap gap-3"
          >
            <a href="#avaliacao">
              <Button size="lg" className="btn-sweep h-12 px-7 text-[15px]">
                {cta}
              </Button>
            </a>
            <a href="#niw">
              <Button size="lg" variant="outline" className="h-12 px-6 text-[15px] border-gold/40 text-foreground hover:border-gold hover:bg-gold/5">
                <PlayCircle className="mr-2 h-4 w-4" /> Entenda o EB-2 NIW
              </Button>
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: t(0.5), delay: t(1.1) }}
            className="mt-12 flex items-start gap-3 text-sm text-foreground/65 border-l border-gold/50 pl-4"
          >
            <Star className="h-4 w-4 text-gold mt-0.5 shrink-0 fill-gold" />
            <span>{proof}</span>
          </motion.div>
        </div>

        {/* Retrato editorial — placeholder com tratamento duotone navy */}
        <motion.div
          className="relative hidden lg:block"
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: t(1.1), ease: easeOut, delay: t(0.25) }}
        >
          <div className="relative aspect-[4/5] overflow-hidden border border-gold/30 bg-ink-raise">
            {/* Tratamento duotone — gradientes navy + grão sutil */}
            <div className="absolute inset-0 bg-gradient-to-br from-ink-deep via-ink-raise to-ink" />
            <div className="absolute inset-0 guilloche" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-deep via-transparent to-transparent" />

            {/* Moldura dourada interna — borda gravada */}
            <div className="absolute inset-3 border border-gold/30 pointer-events-none" />

            <div className="absolute bottom-0 left-0 right-0 p-7">
              <p className="font-mono-label text-gold/80">RETRATO EDITORIAL</p>
              <p className="mt-2 font-display text-2xl leading-tight text-foreground">
                Família brasileira em paisagem americana
              </p>
              <p className="mt-2 text-xs text-foreground/55 leading-relaxed">
                {/* Diretriz para o cliente: substituir por fotografia real art-direcionada
                    com este tratamento — duotone navy + grão + vinheta. Nunca usar
                    ilustração genérica nem imagem gerada por IA. */}
                Substituir por fotografia real art-direcionada (duotone navy + grão).
              </p>
            </div>
          </div>

          {/* Selo "5,0 Google" — credencial */}
          <div className="absolute -bottom-6 -left-6 border border-gold bg-ink-deep/95 backdrop-blur p-4 max-w-[180px]">
            <div className="absolute top-0 left-0 h-[3px] w-10 bg-gold" />
            <div className="flex items-center gap-1 text-gold">
              {[...Array(5)].map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-gold" />)}
            </div>
            <p className="mt-1.5 font-mono-label text-foreground/70">NOTA 5,0 GOOGLE</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/** Quebra a headline em até 2 linhas para a máscara do hero. */
function splitHeadline(t: string): string[] {
  const words = t.split(/\s+/);
  if (words.length <= 6) return [t];
  const mid = Math.ceil(words.length / 2);
  return [words.slice(0, mid).join(" "), words.slice(mid).join(" ")];
}

/** Aplica itálico dourado em "mérito" quando presente. */
function renderEmphasis(text: string) {
  const parts = text.split(/(mérito)/i);
  return parts.map((p, i) =>
    /^mérito$/i.test(p)
      ? <span key={i} className="font-display italic text-gold">{p}</span>
      : <span key={i}>{p}</span>
  );
}

/* ============================================================
 * 2. FAIXA DE AUTORIDADE — selos de credencial
 * ============================================================ */
export function AuthorityStrip() {
  const items = ["Veja-SA", "Forbes BR", "Exame", "Valor", "InfoMoney", "BBB Accredited"];
  return (
    <section className="section-ink-deep border-y border-gold/15">
      <div className="container-x py-7 flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
        <span className="font-mono-label text-gold">RECONHECIMENTO</span>
        {items.map((i) => (
          <span key={i} className="font-display text-base text-foreground/50">{i}</span>
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
    <Reveal as="section" className="section-parchment py-24 md:py-32">
      <div className="container-x">
        <SectionHead
          num="01"
          eyebrow="POR QUE MIGRAR AGORA"
          title="Duas realidades. Uma decisão."
          variant="parchment"
        />

        <div className="mt-14 grid md:grid-cols-2 gap-6">
          <div className="relative gold-tick bg-white border border-ink-text/10 p-8">
            <div className="flex items-center gap-3 text-oxblood">
              <AlertTriangle className="h-5 w-5" />
              <h3 className="font-display text-xl text-ink-text m-0">
                A realidade que você já conhece no Brasil
              </h3>
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

          <div className="relative gold-tick bg-white border border-gold/40 p-8">
            <div className="flex items-center gap-3 text-success">
              <CheckCircle2 className="h-5 w-5" />
              <h3 className="font-display text-xl text-ink-text m-0">
                O que os EUA oferecem a quem é qualificado
              </h3>
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
    <Reveal as="section" id="niw" className="py-24 md:py-32 relative">
      <div className="absolute inset-0 -z-10 guilloche" />
      <div className="container-x grid lg:grid-cols-2 gap-14 items-center">
        <div>
          <SectionHead num="02" eyebrow="CARRO-CHEFE — EB-2 NIW" title={title} />
          <p className="mt-6 text-[17px] text-foreground/80 leading-relaxed max-w-xl">{lead}</p>

          <ul className="mt-9 grid sm:grid-cols-2 gap-3">
            {bullets.map(({ icon: Icon, t }) => (
              <li key={t} className="relative gold-tick border border-gold/25 bg-ink-raise/50 p-5">
                <Icon className="h-5 w-5 text-gold mb-3" />
                <span className="text-sm leading-snug text-foreground/90">{t}</span>
              </li>
            ))}
          </ul>

          <a href="#avaliacao" className="inline-block mt-10">
            <Button size="lg" className="btn-sweep h-12 px-7">Quero saber se tenho perfil</Button>
          </a>
        </div>

        {/* Vídeo placeholder com moldura dourada */}
        <div className="relative">
          <div className="aspect-video overflow-hidden border border-gold/40 bg-ink-deep relative">
            <div className="absolute inset-0 bg-gradient-to-br from-ink-raise via-ink to-ink-deep" />
            <div className="absolute inset-0 guilloche" />
            <div className="absolute inset-3 border border-gold/30 pointer-events-none" />
            <button className="absolute inset-0 group flex flex-col items-center justify-center gap-4 text-foreground/90">
              <span className="grid h-20 w-20 place-items-center rounded-full bg-gold text-gold-foreground transition-transform group-hover:scale-105">
                <PlayCircle className="h-10 w-10" />
              </span>
              <span className="font-display text-xl">Entenda o EB-2 NIW em 4 minutos</span>
              <span className="font-mono-label text-foreground/55">VÍDEO PLACEHOLDER</span>
            </button>
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
    <Reveal as="section" className="section-ink-deep py-24 md:py-32 border-y border-gold/10">
      <div className="container-x">
        <SectionHead
          num="03"
          eyebrow="VISTOS EB"
          title="Três caminhos. Uma estratégia para cada perfil."
        />
        <div className="mt-14 grid md:grid-cols-3 gap-5">
          {visas.map((v) => (
            <Link key={v.slug} to="/vistos/$slug" params={{ slug: v.slug }} className="group block">
              <article
                className={`relative gold-tick h-full border p-8 transition-colors ${
                  v.featured
                    ? "border-gold bg-ink-raise"
                    : "border-gold/20 bg-ink-raise/60 hover:border-gold/60"
                }`}
              >
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
 * 6. PARA SEU MOMENTO DE CARREIRA — CONTEÚDO INSTITUCIONAL
 *    Mostra que atendem esses perfis. CTA rola para o formulário
 *    (#avaliacao) — NÃO linka para /lp/* (LPs são privadas).
 * ============================================================ */
export function PersonaCards() {
  const personas = [
    { icon: Stethoscope, title: "Médicos",
      headline: "Sua trajetória clínica é um ativo de interesse americano." },
    { icon: Wrench, title: "Engenheiros",
      headline: "Da infraestrutura à tecnologia: o mercado americano valoriza o que você já faz." },
    { icon: Building2, title: "Empresários",
      headline: "Geração de empregos e impostos pesa positivamente na sua petição." },
  ];
  return (
    <Reveal as="section" className="py-24 md:py-32">
      <div className="container-x">
        <SectionHead
          num="04"
          eyebrow="PERFIS QUE ATENDEMOS"
          title="Profissões consolidadas têm caminho mais curto pelo EB-2 NIW."
        />
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
                {/* CTA INTERNO: rola para o formulário na própria home.
                    Não linkar para /lp/* — LPs são privadas (tráfego pago apenas). */}
                <a href="#avaliacao" className="mt-7 inline-flex items-center text-sm text-gold hover:text-gold">
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
 * 7. PROCESSO
 * ============================================================ */
export function ProcessSteps() {
  const title = useContent("process.title");
  const steps = [
    { n: "01", t: "Avaliação gratuita do seu perfil",
      d: "Análise estratégica do seu histórico, formação e trajetória — sem custo e sem compromisso." },
    { n: "02", t: "Estratégia e preparação da petição",
      d: "Montagem da petição no rigor exigido pelo USCIS, com documentação técnica e narrativa profissional sólida." },
    { n: "03", t: "Acompanhamento até a aprovação e adaptação",
      d: "Suporte ativo durante o processo e na chegada aos EUA: documentação, escola, banco, mudança." },
  ];
  return (
    <Reveal as="section" className="section-parchment py-24 md:py-32">
      <div className="container-x">
        <SectionHead num="05" eyebrow="COMO TRABALHAMOS" title={title} variant="parchment" />
        <div className="mt-14 grid md:grid-cols-3 gap-5">
          {steps.map((s) => (
            <div key={s.n} className="relative gold-tick bg-white border border-ink-text/10 p-8">
              <span className="font-display text-[56px] leading-none text-gold">{s.n}</span>
              <h3 className="mt-5 font-display text-xl text-ink-text">{s.t}</h3>
              <p className="mt-3 text-ink-text/75">{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </Reveal>
  );
}

/* ============================================================
 * 8. POR QUE A STATUS — estatísticas tipo "certificado"
 * ============================================================ */
export function WhyUs() {
  const title = useContent("why.title");
  const lead = useContent("why.lead");

  // Stats no padrão "certificado": número grande Bodoni + label mono
  const stats = [
    { value: "+1.000", label: "FAMÍLIAS ATENDIDAS" },
    { value: "+25", label: "ANOS DE EXPERIÊNCIA" },
    { value: "5,0", label: "NOTA NO GOOGLE" },
    { value: "100%", label: "FOCO EM VISTOS EB" },
  ];
  const items = [
    { icon: MapPin, t: "Sede própria em Orlando, Flórida" },
    { icon: Users, t: "Equipe dedicada por especialidade" },
    { icon: ShieldCheck, t: "Assessoria completa: documentação, tradução, mudança, bancos, escolas" },
    { icon: Heart, t: "Acompanhamento da família do primeiro contato à adaptação" },
  ];
  return (
    <Reveal as="section" className="py-24 md:py-32 relative">
      <div className="absolute inset-0 -z-10 guilloche" />
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

        {/* Bloco de estatísticas como CERTIFICADO */}
        <div className="mt-16 border-y border-gold/30">
          <div className="grid grid-cols-2 md:grid-cols-4">
            {stats.map((s, i) => (
              <div
                key={s.label}
                className={`relative py-10 px-6 ${i > 0 ? "md:border-l border-gold/15" : ""}`}
              >
                {/* Filete superior dourado curto */}
                <div className="absolute top-0 left-6 h-[2px] w-8 bg-gold" />
                <CountUp value={s.value} className="font-display text-[52px] md:text-[64px] leading-none text-foreground" />
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
 * 9. SALÁRIO BRASIL vs EUA
 * ============================================================ */
export function SalaryCompare() {
  // Valores genéricos na home; LPs (privadas) carregam comparativos específicos por cargo.
  const rows = [
    { p: "Médico especialista", br: "R$ 25.000 / mês", us: "US$ 22.000 / mês" },
    { p: "Engenheiro sênior",   br: "R$ 18.000 / mês", us: "US$ 12.500 / mês" },
    { p: "Profissional de TI sênior", br: "R$ 20.000 / mês", us: "US$ 14.000 / mês" },
  ];
  return (
    <Reveal as="section" className="py-24 md:py-32">
      <div className="container-x">
        <SectionHead
          num="07"
          eyebrow="RENDA EM DÓLAR"
          title="A mesma carreira. Outro patamar de remuneração."
          kicker="Estimativas de mercado mensais médias. Valores variam por especialidade, cidade e senioridade."
        />

        <div className="mt-14 border border-gold/25 overflow-hidden">
          <div className="grid grid-cols-[1.4fr_1fr_1fr] font-mono-label text-foreground/60 bg-ink-deep px-6 py-4 border-b border-gold/20">
            <span>PROFISSÃO</span><span>BRASIL</span><span className="text-gold">ESTADOS UNIDOS</span>
          </div>
          {rows.map((r, i) => (
            <div
              key={r.p}
              className={`grid grid-cols-[1.4fr_1fr_1fr] items-center px-6 py-6 ${i > 0 ? "border-t border-gold/15" : ""}`}
            >
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
 * 10. DEPOIMENTOS
 * ============================================================ */
export function Testimonials() {
  const items = [
    { name: "Dr. R. M.", role: "Médico cardiologista — São Paulo",
      q: "O processo foi conduzido com método e clareza. Em cada etapa eu sabia exatamente o que esperar." },
    { name: "L. C.", role: "Engenheira civil — Belo Horizonte",
      q: "A equipe construiu uma narrativa profissional que eu sozinha não saberia montar para o USCIS." },
    { name: "P. A.", role: "Empresário — Curitiba",
      q: "Eles entenderam o porte da minha operação e como traduzir isso para o critério de interesse nacional." },
    { name: "Família S.", role: "Chegada em Orlando",
      q: "Nossos filhos estão na escola e a vida começou antes mesmo da gente desfazer as malas." },
  ];
  return (
    <Reveal as="section" className="section-parchment py-24 md:py-32">
      <div className="container-x">
        <SectionHead
          num="08"
          eyebrow="QUEM JÁ FEZ ESSA TRAVESSIA"
          title="Histórias de profissionais brasileiros que reescreveram o próprio capítulo."
          variant="parchment"
        />
        <div className="mt-14 grid md:grid-cols-2 lg:grid-cols-4 gap-5">
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
 * 11. FAQ
 * ============================================================ */
export function FAQ() {
  const faqs = [
    { q: "O EB-2 NIW exige que eu tenha uma empresa me contratando nos EUA?",
      a: "Não. Essa é justamente a essência do National Interest Waiver: o profissional dispensa o patrocinador ao demonstrar que sua atuação é de interesse nacional americano. A petição é construída sobre o seu próprio histórico." },
    { q: "Preciso ter inglês fluente para começar?",
      a: "Não para iniciar a estratégia. O inglês é desejável para a vida nos EUA e nós orientamos sobre o nível recomendável, mas o processo de petição em si é técnico e conduzido pela equipe." },
    { q: "Quanto tempo dura o processo?",
      a: "O ciclo do EB-2 NIW costuma levar em torno de dois anos entre preparação, protocolo e decisão, podendo variar conforme fila consular e contexto do caso. Por isso recomendamos começar cedo — quanto antes a estratégia é desenhada, mais tempo se ganha." },
    { q: "Não tenho mestrado, ainda tenho perfil?",
      a: "Pode ter. O EB-2 NIW também acomoda profissionais sem título de mestre quando há habilidade excepcional comprovada por trajetória, publicações, prêmios, liderança de projetos, geração de empregos ou impacto setorial. A avaliação gratuita serve exatamente para mapear isso." },
    { q: "Como estão as filas e a emissão de vistos para brasileiros hoje?",
      a: "O cenário consular tem flutuações naturais ao longo do tempo, o que reforça a importância do planejamento antecipado. A Status na América acompanha esse cenário e estrutura cada caso conforme as regras vigentes, sem prometer prazos." },
    { q: "Quanto custa?",
      a: "A avaliação inicial é gratuita. O investimento da assessoria depende do perfil, da complexidade do caso e da composição familiar. Tudo é apresentado de forma transparente antes de qualquer contratação." },
  ];
  return (
    <Reveal as="section" className="py-24 md:py-32">
      <div className="container-x max-w-3xl">
        <SectionHead num="09" eyebrow="DÚVIDAS FREQUENTES" title="Antes que você pergunte." />
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
 * 12. CTA + FORMULÁRIO
 * ============================================================ */
export function CtaForm() {
  const title = useContent("cta.title");
  const sub = useContent("cta.subtitle");
  return (
    <section id="avaliacao" className="section-ink-deep py-24 md:py-32 relative border-t border-gold/15">
      <div className="absolute inset-0 guilloche -z-10" />
      <div className="container-x grid lg:grid-cols-[1fr_1fr] gap-14 items-start">
        <div className="lg:pt-8">
          <SectionHead num="10" eyebrow="AVALIAÇÃO GRATUITA" title={title} kicker={sub} />
          <ul className="mt-9 space-y-3 text-[15px] text-foreground/80">
            {[
              "Análise estratégica gratuita do seu perfil",
              "Resposta em até 48h pelo WhatsApp",
              "Confidencial e sem compromisso",
              "Atendimento por equipe especializada",
            ].map((i) => (
              <li key={i} className="flex gap-3">
                <CheckCircle2 className="h-4 w-4 text-gold mt-1 shrink-0" /> {i}
              </li>
            ))}
          </ul>
        </div>
        <LeadForm />
      </div>
    </section>
  );
}

/* ============================================================
 * Helpers — Reveal (scroll) e CountUp (estatísticas)
 * ============================================================ */
function Reveal({
  children, className, as: As = "section", id,
}: {
  children: React.ReactNode;
  className?: string;
  as?: "section" | "div";
  id?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const reduce = useReducedMotion();
  const Comp = As as any;
  return (
    <Comp ref={ref} id={id} className={className}>
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : undefined}
        transition={{ duration: 0.55, ease: [0.22, 0.61, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </Comp>
  );
}

function CountUp({ value, className }: { value: string; className?: string }) {
  // Extrai prefixo + número + sufixo (ex.: "+1.000", "5,0", "100%")
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
    const decimals = (num.split(/[.,]/)[1] || "").length;
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
