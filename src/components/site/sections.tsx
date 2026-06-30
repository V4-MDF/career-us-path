import { Link } from "@tanstack/react-router";
import {
  AlertTriangle, Award, Building2, CheckCircle2, GraduationCap,
  HandCoins, Heart, MapPin, PlayCircle, ShieldCheck, Sparkles, Star,
  Stethoscope, TrendingUp, Users, Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { useContent } from "@/lib/siteContent";
import { LeadForm } from "./LeadForm";

/* ---------------- 2. HERO ---------------- */
export function Hero() {
  const eyebrow = useContent("hero.eyebrow");
  const title = useContent("hero.title");
  const sub = useContent("hero.subtitle");
  const cta = useContent("hero.cta");
  const proof = useContent("hero.proof");

  return (
    <section className="relative overflow-hidden pt-28 md:pt-36 pb-20">
      {/* Placeholder de vídeo/imagem (terra → EUA). Substituir por <video> real. */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 stars-pattern opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/85 to-background" />
        <div className="absolute -top-32 right-1/3 h-[40rem] w-[40rem] rounded-full bg-gold/10 blur-3xl" />
        <div className="absolute top-40 -left-32 h-[30rem] w-[30rem] rounded-full bg-navy/40 blur-3xl" />
      </div>

      <div className="container-x grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
        <div>
          <p className="inline-flex items-center gap-2 text-[11px] tracking-[0.22em] text-gold">
            <span className="h-px w-8 bg-gold/60" />
            {eyebrow}
          </p>
          <h1 className="mt-5 font-display text-4xl md:text-6xl leading-[1.05]">
            {title.split("mérito").length > 1 ? (
              <>
                {title.split("mérito")[0]}
                <span className="text-gold italic">mérito</span>
                {title.split("mérito")[1]}
              </>
            ) : title}
          </h1>
          <p className="mt-6 text-lg text-foreground/80 max-w-xl leading-relaxed">{sub}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#avaliacao">
              <Button size="lg" className="text-base">{cta}</Button>
            </a>
            <a href="#niw">
              <Button size="lg" variant="outline" className="text-base">
                <PlayCircle className="mr-2 h-4 w-4" /> Entenda o EB-2 NIW
              </Button>
            </a>
          </div>

          <div className="mt-10 flex items-start gap-3 text-sm text-muted-foreground border-l-2 border-gold/40 pl-4">
            <Star className="h-4 w-4 text-gold mt-0.5 shrink-0 fill-gold" />
            <span>{proof}</span>
          </div>
        </div>

        {/* Visual lateral — placeholder cinemático */}
        <div className="relative hidden lg:block">
          <div className="aspect-[4/5] rounded-2xl overflow-hidden border border-gold/20 bg-surface shadow-elegant">
            <div className="h-full w-full bg-gradient-to-br from-navy via-surface to-background flex items-end p-6">
              <div className="text-xs uppercase tracking-[0.2em] text-gold/80">
                Imagem / vídeo placeholder<br />
                <span className="text-foreground/60 normal-case tracking-normal text-sm">
                  Família brasileira em paisagem americana
                </span>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-6 -left-6 rounded-xl border border-gold/30 bg-surface/90 backdrop-blur p-4 shadow-elegant">
            <div className="flex items-center gap-2">
              {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 text-gold fill-gold" />)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Nota 5,0 no Google</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- 3. FAIXA AUTORIDADE ---------------- */
export function AuthorityStrip() {
  const items = ["Veja-SA", "Forbes BR", "Exame", "Valor", "InfoMoney", "BBB Accredited"];
  return (
    <section className="border-y border-border/40 bg-surface/40">
      <div className="container-x py-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-muted-foreground">
        <span className="text-xs uppercase tracking-[0.2em] text-gold/80">Reconhecimento</span>
        {items.map((i) => (
          <span key={i} className="font-serif text-base text-foreground/55">{i}</span>
        ))}
      </div>
    </section>
  );
}

/* ---------------- 4. BRASIL vs EUA ---------------- */
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
    <section className="section-cream py-24">
      <div className="container-x">
        <div className="max-w-2xl">
          <Badge variant="outline" className="border-navy/30 text-navy">Por que migrar agora</Badge>
          <h2 className="mt-4 font-display text-3xl md:text-5xl text-navy">
            Duas realidades. Uma decisão.
          </h2>
        </div>

        <div className="mt-12 grid md:grid-cols-2 gap-6">
          <Card className="border-destructive/20 bg-white">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                <h3 className="font-serif text-xl text-navy m-0">A realidade que você já conhece no Brasil</h3>
              </div>
              <ul className="mt-6 space-y-3">
                {brasil.map((b) => (
                  <li key={b} className="flex gap-3 text-navy/85">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-destructive shrink-0" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-gold/40 bg-white">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 text-success">
                <CheckCircle2 className="h-5 w-5" />
                <h3 className="font-serif text-xl text-navy m-0">O que os EUA oferecem a quem é qualificado</h3>
              </div>
              <ul className="mt-6 space-y-3">
                {eua.map((b) => (
                  <li key={b} className="flex gap-3 text-navy/85">
                    <CheckCircle2 className="h-4 w-4 text-success mt-1 shrink-0" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <p className="mt-12 max-w-3xl font-serif text-2xl md:text-3xl text-navy leading-snug">
          {title} <span className="text-gold">{subtitle}</span>
        </p>
      </div>
    </section>
  );
}

/* ---------------- 5. EB-2 NIW (carro-chefe) ---------------- */
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
    <section id="niw" className="py-24 relative">
      <div className="absolute inset-0 -z-10 stars-pattern opacity-20" />
      <div className="container-x grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <Badge className="bg-gold text-gold-foreground">CARRO-CHEFE • EB-2 NIW</Badge>
          <h2 className="mt-4 font-display text-3xl md:text-5xl">{title}</h2>
          <p className="mt-5 text-foreground/80 leading-relaxed">{lead}</p>

          <ul className="mt-8 grid sm:grid-cols-2 gap-4">
            {bullets.map(({ icon: Icon, t }) => (
              <li key={t} className="flex gap-3 rounded-xl border border-border/60 bg-surface/60 p-4">
                <Icon className="h-5 w-5 text-gold shrink-0" />
                <span className="text-sm leading-snug">{t}</span>
              </li>
            ))}
          </ul>

          <a href="#avaliacao" className="inline-block mt-8">
            <Button size="lg">Quero saber se tenho perfil</Button>
          </a>
        </div>

        {/* Placeholder de vídeo explicativo */}
        <div className="relative">
          <div className="aspect-video rounded-2xl overflow-hidden border border-gold/30 bg-gradient-to-br from-navy via-surface to-background grid place-items-center shadow-elegant">
            <button className="group flex flex-col items-center gap-3 text-foreground/90">
              <span className="grid h-20 w-20 place-items-center rounded-full bg-gold text-gold-foreground transition-transform group-hover:scale-105">
                <PlayCircle className="h-10 w-10" />
              </span>
              <span className="font-serif text-lg">Entenda o EB-2 NIW em 4 minutos</span>
              <span className="text-xs text-muted-foreground uppercase tracking-[0.2em]">Vídeo placeholder</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- 6. CARDS DE VISTOS ---------------- */
export function VisaCards() {
  const visas = [
    {
      slug: "eb2-niw",
      tag: "Em destaque",
      title: "EB-2 NIW",
      desc: "Green Card por mérito profissional. Sem patrocinador, com a família inclusa.",
      featured: true,
    },
    {
      slug: "eb1",
      tag: "Habilidade extraordinária",
      title: "EB-1",
      desc: "Para profissionais com reconhecimento internacional comprovado em sua área.",
    },
    {
      slug: "eb3",
      tag: "Exige patrocinador",
      title: "EB-3",
      desc: "Caminho para profissionais qualificados com oferta formal de emprego nos EUA.",
    },
  ];
  return (
    <section className="py-24 bg-surface/40">
      <div className="container-x">
        <div className="flex items-end justify-between gap-6 mb-10">
          <div>
            <Badge variant="outline" className="border-gold/40 text-gold">Vistos EB</Badge>
            <h2 className="mt-3 font-display text-3xl md:text-5xl">Três caminhos. Uma estratégia para cada perfil.</h2>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {visas.map((v) => (
            <Link key={v.slug} to="/vistos/$slug" params={{ slug: v.slug }}>
              <Card
                className={`h-full transition-all hover:-translate-y-1 ${
                  v.featured
                    ? "border-gold bg-gradient-to-br from-surface to-navy/40 shadow-elegant"
                    : "border-border bg-surface"
                }`}
              >
                <CardContent className="p-7">
                  <Badge
                    className={v.featured ? "bg-gold text-gold-foreground" : "bg-muted text-muted-foreground"}
                  >
                    {v.tag}
                  </Badge>
                  <h3 className="mt-4 font-display text-3xl">{v.title}</h3>
                  <p className="mt-3 text-sm text-foreground/75 leading-relaxed">{v.desc}</p>
                  <span className="mt-6 inline-flex items-center text-sm text-gold">
                    Conhecer este visto →
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- 7. PARA SEU MOMENTO DE CARREIRA ----------------
 * Estes cards apontam para o motor de Landing Pages do Prompt 2.
 */
export function PersonaCards() {
  const personas = [
    {
      slug: "medicos",
      icon: Stethoscope,
      title: "Médicos",
      headline: "Sua trajetória clínica é um ativo de interesse americano.",
    },
    {
      slug: "engenheiros",
      icon: Wrench,
      title: "Engenheiros",
      headline: "Da infraestrutura à tecnologia: o mercado americano valoriza o que você já faz.",
    },
    {
      slug: "empresarios",
      icon: Building2,
      title: "Empresários",
      headline: "Geração de empregos e impostos pesa positivamente na sua petição.",
    },
  ];
  return (
    <section className="py-24">
      <div className="container-x">
        <div className="max-w-2xl">
          <Badge variant="outline" className="border-gold/40 text-gold">Para o seu momento de carreira</Badge>
          <h2 className="mt-4 font-display text-3xl md:text-5xl">
            Profissões consolidadas têm caminho mais curto pelo EB-2 NIW.
          </h2>
        </div>
        <div className="mt-12 grid md:grid-cols-3 gap-5">
          {personas.map((p) => {
            const Icon = p.icon;
            return (
              <Card key={p.slug} className="border-border bg-surface hover:border-gold/50 transition-colors">
                <CardContent className="p-7">
                  <span className="grid h-12 w-12 place-items-center rounded-xl bg-gold/15 text-gold">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-5 font-display text-2xl">{p.title}</h3>
                  <p className="mt-3 text-foreground/75 leading-relaxed">{p.headline}</p>
                  <Link to="/lp/$slug" params={{ slug: p.slug }} className="mt-6 inline-flex items-center text-sm text-gold">
                    Ver caminho para {p.title.toLowerCase()} →
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ---------------- 8. PROCESSO ---------------- */
export function ProcessSteps() {
  const title = useContent("process.title");
  const steps = [
    { n: "01", t: "Avaliação gratuita do seu perfil", d: "Análise estratégica do seu histórico, formação e trajetória — sem custo e sem compromisso." },
    { n: "02", t: "Estratégia e preparação da petição", d: "Montagem da petição no rigor exigido pelo USCIS, com documentação técnica e narrativa profissional sólida." },
    { n: "03", t: "Acompanhamento até a aprovação e adaptação", d: "Suporte ativo durante o processo e na chegada aos EUA: documentação, escola, banco, mudança." },
  ];
  return (
    <section className="section-cream py-24">
      <div className="container-x">
        <Badge variant="outline" className="border-navy/30 text-navy">Como trabalhamos</Badge>
        <h2 className="mt-4 font-display text-3xl md:text-5xl text-navy max-w-3xl">{title}</h2>
        <div className="mt-12 grid md:grid-cols-3 gap-5">
          {steps.map((s) => (
            <div key={s.n} className="rounded-2xl bg-white border border-navy/10 p-7">
              <span className="font-display text-5xl text-gold">{s.n}</span>
              <h3 className="mt-4 font-serif text-xl text-navy">{s.t}</h3>
              <p className="mt-2 text-navy/75">{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- 9. POR QUE A STATUS ---------------- */
export function WhyUs() {
  const title = useContent("why.title");
  const lead = useContent("why.lead");
  const items = [
    { icon: MapPin, t: "Sede própria em Orlando, Flórida" },
    { icon: Users, t: "Equipe dedicada por especialidade" },
    { icon: Award, t: "+25 anos de experiência [CONFIRMAR]" },
    { icon: Star, t: "Nota 5,0 no Google" },
    { icon: Heart, t: "+1.000 famílias atendidas [CONFIRMAR]" },
    { icon: ShieldCheck, t: "Assessoria completa: documentação, tradução, mudança, bancos, escolas" },
  ];
  return (
    <section className="py-24 bg-surface/30">
      <div className="container-x grid lg:grid-cols-[0.9fr_1.1fr] gap-12">
        <div>
          <Badge variant="outline" className="border-gold/40 text-gold">Por que nós</Badge>
          <h2 className="mt-4 font-display text-3xl md:text-5xl">{title}</h2>
          <p className="mt-5 text-foreground/80 leading-relaxed max-w-md">{lead}</p>
        </div>
        <ul className="grid sm:grid-cols-2 gap-4">
          {items.map(({ icon: Icon, t }) => (
            <li key={t} className="rounded-xl border border-border bg-surface p-5 flex gap-3">
              <Icon className="h-5 w-5 text-gold shrink-0 mt-0.5" />
              <span className="leading-snug">{t}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---------------- 10. SALÁRIO BRASIL vs EUA ---------------- */
export function SalaryCompare() {
  // Valores genéricos na home; o motor de LPs traz comparativos específicos por cargo.
  const rows = [
    { p: "Médico especialista", br: "R$ 25.000 [CONFIRMAR]", us: "US$ 22.000 [CONFIRMAR]" },
    { p: "Engenheiro sênior", br: "R$ 18.000 [CONFIRMAR]", us: "US$ 12.500 [CONFIRMAR]" },
    { p: "Profissional de TI sênior", br: "R$ 20.000 [CONFIRMAR]", us: "US$ 14.000 [CONFIRMAR]" },
  ];
  return (
    <section className="py-24">
      <div className="container-x">
        <div className="max-w-2xl">
          <Badge variant="outline" className="border-gold/40 text-gold">
            <HandCoins className="h-3.5 w-3.5 mr-1" /> Renda em dólar
          </Badge>
          <h2 className="mt-4 font-display text-3xl md:text-5xl">
            A mesma carreira. Outro patamar de remuneração.
          </h2>
          <p className="mt-4 text-foreground/75">
            Estimativas de mercado mensais médias. Valores específicos por cargo e cidade
            são apresentados nas páginas dedicadas a cada profissão.
          </p>
        </div>

        <div className="mt-10 rounded-2xl border border-border overflow-hidden bg-surface">
          <div className="grid grid-cols-[1.4fr_1fr_1fr] text-xs uppercase tracking-[0.16em] text-muted-foreground bg-surface-alt px-6 py-4">
            <span>Profissão</span><span>Brasil</span><span className="text-gold">Estados Unidos</span>
          </div>
          {rows.map((r) => (
            <div key={r.p} className="grid grid-cols-[1.4fr_1fr_1fr] items-center px-6 py-5 border-t border-border">
              <span className="font-serif text-lg">{r.p}</span>
              <span className="text-foreground/70">{r.br}</span>
              <span className="text-gold font-medium flex items-center gap-1">
                <TrendingUp className="h-4 w-4" /> {r.us}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- 11. DEPOIMENTOS ----------------
 * substituir por depoimentos reais autorizados
 */
export function Testimonials() {
  const items = [
    { name: "Dr. R. M.", role: "Médico cardiologista — São Paulo", q: "O processo foi conduzido com método e clareza. Em cada etapa eu sabia exatamente o que esperar." },
    { name: "L. C.", role: "Engenheira civil — Belo Horizonte", q: "A equipe construiu uma narrativa profissional que eu sozinha não saberia montar para o USCIS." },
    { name: "P. A.", role: "Empresário — Curitiba", q: "Eles entenderam o porte da minha operação e como traduzir isso para o critério de interesse nacional." },
    { name: "Família S.", role: "Chegada em Orlando", q: "Nossos filhos estão na escola e a vida começou antes mesmo da gente desfazer as malas." },
  ];
  return (
    <section className="section-cream py-24">
      <div className="container-x">
        <Badge variant="outline" className="border-navy/30 text-navy">Quem já fez essa travessia</Badge>
        <h2 className="mt-4 font-display text-3xl md:text-5xl text-navy max-w-3xl">
          Histórias de profissionais brasileiros que reescreveram o próprio capítulo.
        </h2>
        <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {items.map((i) => (
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
  );
}

/* ---------------- 12. FAQ ---------------- */
export function FAQ() {
  const faqs = [
    {
      q: "O EB-2 NIW exige que eu tenha uma empresa me contratando nos EUA?",
      a: "Não. Essa é justamente a essência do National Interest Waiver: o profissional dispensa o patrocinador ao demonstrar que sua atuação é de interesse nacional americano. A petição é construída sobre o seu próprio histórico.",
    },
    {
      q: "Preciso ter inglês fluente para começar?",
      a: "Não para iniciar a estratégia. O inglês é desejável para a vida nos EUA e nós orientamos sobre o nível recomendável, mas o processo de petição em si é técnico e conduzido pela equipe.",
    },
    {
      q: "Quanto tempo dura o processo?",
      a: "O ciclo do EB-2 NIW costuma levar em torno de dois anos entre preparação, protocolo e decisão, podendo variar conforme fila consular e contexto do caso. Por isso recomendamos começar cedo — quanto antes a estratégia é desenhada, mais tempo se ganha.",
    },
    {
      q: "Não tenho mestrado, ainda tenho perfil?",
      a: "Pode ter. O EB-2 NIW também acomoda profissionais sem título de mestre quando há habilidade excepcional comprovada por trajetória, publicações, prêmios, liderança de projetos, geração de empregos ou impacto setorial. A avaliação gratuita serve exatamente para mapear isso.",
    },
    {
      q: "Como estão as filas e a emissão de vistos para brasileiros hoje?",
      a: "O cenário consular tem flutuações naturais ao longo do tempo, o que reforça a importância do planejamento antecipado. A Status na América acompanha esse cenário e estrutura cada caso conforme as regras vigentes, sem prometer prazos.",
    },
    {
      q: "Quanto custa?",
      a: "A avaliação inicial é gratuita. O investimento da assessoria depende do perfil, da complexidade do caso e da composição familiar. Tudo é apresentado de forma transparente antes de qualquer contratação.",
    },
  ];
  return (
    <section className="py-24">
      <div className="container-x max-w-3xl">
        <Badge variant="outline" className="border-gold/40 text-gold">Dúvidas frequentes</Badge>
        <h2 className="mt-4 font-display text-3xl md:text-5xl">Antes que você pergunte.</h2>
        <Accordion type="single" collapsible className="mt-10">
          {faqs.map((f, i) => (
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
  );
}

/* ---------------- 13. CTA + FORMULÁRIO ---------------- */
export function CtaForm() {
  const title = useContent("cta.title");
  const sub = useContent("cta.subtitle");
  return (
    <section id="avaliacao" className="py-24 bg-gradient-to-b from-background to-surface relative">
      <div className="absolute inset-0 stars-pattern opacity-15 -z-10" />
      <div className="container-x grid lg:grid-cols-[1fr_1fr] gap-12 items-start">
        <div className="lg:pt-8">
          <Badge className="bg-gold text-gold-foreground">Avaliação gratuita</Badge>
          <h2 className="mt-4 font-display text-3xl md:text-5xl leading-tight">{title}</h2>
          <p className="mt-5 text-foreground/80 max-w-md leading-relaxed">{sub}</p>
          <ul className="mt-8 space-y-3 text-sm text-foreground/80">
            {[
              "Análise estratégica gratuita do seu perfil",
              "Resposta em até 48h pelo WhatsApp",
              "Confidencial e sem compromisso",
              "Atendimento por equipe especializada",
            ].map((i) => (
              <li key={i} className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-gold mt-0.5 shrink-0" /> {i}</li>
            ))}
          </ul>
        </div>
        <LeadForm />
      </div>
    </section>
  );
}
