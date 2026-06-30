/**
 * BlogStrip — faixa de conteúdo do blog logo abaixo do hero da Home.
 * Lê posts publicados via listPublishedPosts; se vazio, mostra placeholders.
 */
import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Clock } from "lucide-react";
import { listPublishedPosts, type BlogPost } from "@/lib/blog";

interface Card {
  slug: string;
  titulo: string;
  resumo: string;
  categoria: string;
  tempo_leitura: number;
  placeholder?: boolean;
}

const PLACEHOLDERS: Card[] = [
  { slug: "#", titulo: "Como o EB-2 NIW avalia o seu impacto profissional",
    resumo: "Os três pilares Dhanasar e como construir evidências de mérito.",
    categoria: "Vistos e Green Card", tempo_leitura: 6, placeholder: true },
  { slug: "#", titulo: "Vida em Orlando: o que ninguém te conta no primeiro ano",
    resumo: "Custos reais, escolas, healthcare e a curva de adaptação de famílias brasileiras.",
    categoria: "Vida nos EUA", tempo_leitura: 8, placeholder: true },
  { slug: "#", titulo: "Médicos brasileiros nos EUA: caminhos sem refazer residência",
    resumo: "Estratégias EB-2 NIW para perfis clínicos com atuação reconhecida.",
    categoria: "Carreira e Mercado", tempo_leitura: 7, placeholder: true },
];

export function BlogStrip() {
  const [posts, setPosts] = useState<Card[] | null>(null);
  useEffect(() => {
    let alive = true;
    listPublishedPosts()
      .then((all) => {
        if (!alive) return;
        if (!all || all.length === 0) { setPosts(PLACEHOLDERS); return; }
        setPosts(all.slice(0, 3).map((p: BlogPost) => ({
          slug: p.slug, titulo: p.titulo, resumo: p.resumo,
          categoria: p.categoria, tempo_leitura: p.tempo_leitura,
        })));
      })
      .catch(() => { if (alive) setPosts(PLACEHOLDERS); });
    return () => { alive = false; };
  }, []);

  const items = posts ?? PLACEHOLDERS;

  return (
    <section
      id="blog-em-destaque"
      aria-label="Conteúdo em destaque"
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
            className="inline-flex items-center gap-2 font-mono-label text-gold hover:translate-x-1 transition-transform"
          >
            Ver todos os artigos <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="mt-10 grid md:grid-cols-3 gap-5">
          {items.map((p) => {
            const Wrapper: React.ElementType = p.placeholder ? "article" : Link;
            const props: Record<string, unknown> = p.placeholder
              ? {}
              : { to: "/blog/$slug", params: { slug: p.slug } };
            return (
              <Wrapper
                key={p.slug + p.titulo}
                {...props}
                className="group block relative gold-tick border border-gold/20 bg-ink-raise/60 p-7 h-full hover:border-gold/60 transition-colors"
              >
                <div className="flex items-center gap-2 font-mono-label text-gold/80">
                  <BookOpen className="h-3 w-3" /> {p.categoria}
                </div>
                <h3 className="mt-4 font-display text-lg leading-snug text-foreground group-hover:text-gold transition-colors">
                  {p.titulo}
                </h3>
                <p className="mt-3 text-sm text-foreground/70 leading-relaxed line-clamp-3">
                  {p.resumo}
                </p>
                <div className="mt-6 flex items-center justify-between text-xs font-mono-label text-foreground/55">
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
              </Wrapper>
            );
          })}
        </div>
      </div>
    </section>
  );
}
