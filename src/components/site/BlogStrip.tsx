/**
 * BlogStrip — faixa de conteúdo do blog logo abaixo do hero da Home.
 * Mobile: carrossel horizontal com scroll-snap (cards "espiando" o próximo).
 * Desktop (md+): grid 3 colunas.
 * Cada card exibe a foto de capa do post no topo.
 */
import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Clock } from "lucide-react";
import { listPublishedPosts, type BlogPost } from "@/lib/blog";
import coverSkyline from "@/assets/hero-skyline.jpg";
import coverFamily from "@/assets/family-portrait.jpg";
import coverPassport from "@/assets/passport-documents.jpg";

interface Card {
  slug: string;
  titulo: string;
  resumo: string;
  categoria: string;
  tempo_leitura: number;
  capa: string;
  placeholder?: boolean;
}

const FALLBACK_COVERS = [coverSkyline, coverPassport, coverFamily];

const PLACEHOLDERS: Card[] = [
  { slug: "#", titulo: "Como o EB-2 NIW avalia o seu impacto profissional",
    resumo: "Os três pilares Dhanasar e como construir evidências de mérito.",
    categoria: "Vistos e Green Card", tempo_leitura: 6, capa: coverPassport, placeholder: true },
  { slug: "#", titulo: "Vida em Orlando: o que ninguém te conta no primeiro ano",
    resumo: "Custos reais, escolas, healthcare e a curva de adaptação de famílias brasileiras.",
    categoria: "Vida nos EUA", tempo_leitura: 8, capa: coverFamily, placeholder: true },
  { slug: "#", titulo: "Médicos brasileiros nos EUA: caminhos sem refazer residência",
    resumo: "Estratégias EB-2 NIW para perfis clínicos com atuação reconhecida.",
    categoria: "Carreira e Mercado", tempo_leitura: 7, capa: coverSkyline, placeholder: true },
];

function isUsableCover(src?: string): boolean {
  if (!src) return false;
  // Ignora SVG-placeholder embutido em data: usado em blog.ts.
  if (src.startsWith("data:image/svg+xml")) return false;
  return true;
}

export function BlogStrip() {
  const [posts, setPosts] = useState<Card[] | null>(null);
  useEffect(() => {
    let alive = true;
    listPublishedPosts()
      .then((all) => {
        if (!alive) return;
        if (!all || all.length === 0) { setPosts(PLACEHOLDERS); return; }
        setPosts(all.slice(0, 3).map((p: BlogPost, i: number) => ({
          slug: p.slug, titulo: p.titulo, resumo: p.resumo,
          categoria: p.categoria, tempo_leitura: p.tempo_leitura,
          capa: isUsableCover(p.capa) ? p.capa : FALLBACK_COVERS[i % FALLBACK_COVERS.length],
        })));
      })
      .catch(() => { if (alive) setPosts(PLACEHOLDERS); });
    return () => { alive = false; };
  }, []);

  const items = posts ?? PLACEHOLDERS;

  return (
    <section
      id="blog-em-destaque"
      aria-label="Blog em destaque"
      className="section-anchor section-ink-deep border-t border-gold/15"
    >
      <div className="container-x py-16 md:py-20">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3">
              <span aria-hidden className="h-px w-10 bg-gold" />
              <span className="font-mono-label text-gold">CONTEÚDO EM DESTAQUE</span>
            </div>
            <h2 className="display-3 mt-4 max-w-2xl">
              Decisões informadas exigem leitura aprofundada.
            </h2>
          </div>
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 btn-label text-gold hover:translate-x-1 transition-transform"
          >
            Ver todos os artigos <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/*
          Mobile: trilho horizontal com snap. Usa margem negativa para sangrar
          até a borda da tela (compensando container-x) e padding para deixar
          o próximo card "espiando". Desktop: grid 3 colunas tradicional.
        */}
        <div
          role="list"
          aria-label="Artigos em destaque"
          className="
            mt-10 flex gap-4 overflow-x-auto snap-x snap-mandatory
            -mx-4 px-4 pb-2
            [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
            md:mx-0 md:px-0 md:pb-0 md:overflow-visible
            md:grid md:grid-cols-3 md:gap-5 md:snap-none
          "
        >
          {items.map((p) => {
            const Wrapper: React.ElementType = p.placeholder ? "article" : Link;
            const props: Record<string, unknown> = p.placeholder
              ? {}
              : { to: "/blog/$slug", params: { slug: p.slug } };
            return (
              <Wrapper
                key={p.slug + p.titulo}
                role="listitem"
                {...props}
                className="
                  group relative gold-tick rounded-2xl border border-gold/20 bg-ink-raise/60 shadow-soft
                  hover:border-gold/60 hover:shadow-elevated transition-[border-color,box-shadow]
                  flex flex-col overflow-hidden
                  w-[80vw] max-w-[340px] shrink-0 snap-start
                  md:w-auto md:max-w-none md:shrink md:snap-align-none
                "
              >
                {/* Capa */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-ink-deep rounded-t-2xl">
                  <img
                    src={p.capa}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                  <div
                    aria-hidden
                    className="absolute inset-0 bg-gradient-to-t from-ink-deep/85 via-ink-deep/15 to-transparent"
                  />
                </div>

                {/* Conteúdo */}
                <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-center gap-2 font-mono-label text-gold/80">
                    <BookOpen className="h-3 w-3" /> {p.categoria}
                  </div>
                  <h3 className="mt-3 font-display text-lg leading-snug text-foreground group-hover:text-gold transition-colors">
                    {p.titulo}
                  </h3>
                  <p className="mt-3 text-sm text-foreground/70 leading-relaxed line-clamp-2 md:line-clamp-3">
                    {p.resumo}
                  </p>
                  <div className="mt-auto pt-5 flex items-center justify-between text-xs font-mono-label text-foreground/55">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="h-3 w-3" /> {p.tempo_leitura} min
                    </span>
                    {!p.placeholder && (
                      <span className="text-gold inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                        Ler <ArrowRight className="h-3 w-3" />
                      </span>
                    )}
                    {p.placeholder && (
                      <span className="text-foreground/40">EM BREVE</span>
                    )}
                  </div>
                </div>
              </Wrapper>
            );
          })}
        </div>

        {/* Indicador discreto de carrossel (mobile only) */}
        <div
          aria-hidden
          className="md:hidden mt-4 flex justify-center gap-1.5"
        >
          {items.map((_, i) => (
            <span key={i} className="h-1 w-6 rounded-full bg-gold/25" />
          ))}
        </div>
      </div>
    </section>
  );
}
