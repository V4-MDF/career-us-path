import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Clock, Filter } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { SectionHead } from "@/components/site/SectionHead";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OrganizationJsonLd, BreadcrumbJsonLd } from "@/components/site/Seo";
import {
  CATEGORIAS, listPublishedPosts, type BlogCategoria, type BlogPost,
} from "@/lib/blog";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "Blog | Status Immigration Law Firm" },
      {
        name: "description",
        content:
          "Artigos sobre vistos EB (EB-2 NIW, EB-1, EB-3), Green Card e vida nos EUA para profissionais brasileiros.",
      },
      { name: "robots", content: "index,follow" },
      { property: "og:title", content: "Blog | Status Immigration Law Firm" },
      {
        property: "og:description",
        content:
          "Guias e análises sobre imigração qualificada, vistos EB e vida nos Estados Unidos.",
      },
      { property: "og:url", content: "/blog" },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "pt_BR" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/blog" }],
  }),
  component: BlogIndex,
});

function BlogIndex() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [filtro, setFiltro] = useState<BlogCategoria | "Todos">("Todos");

  useEffect(() => {
    listPublishedPosts().then(setPosts);
  }, []);

  const filtered = useMemo(
    () => (filtro === "Todos" ? posts : posts.filter((p) => p.categoria === filtro)),
    [posts, filtro],
  );

  const featured = posts[0];
  const rest = filtered.filter((p) => p.id !== featured?.id || filtro !== "Todos");

  return (
    <>
      <Header />
      <OrganizationJsonLd />
      <BreadcrumbJsonLd items={[{ name: "Início", url: "/" }, { name: "Blog", url: "/blog" }]} />

      <main className="pt-28">
        <section className="bg-ink">
          <div className="container-x py-16 md:py-20">
            <SectionHead
              eyebrow="BLOG"
              title="Artigos para quem está construindo um plano sério de imigração."
              kicker="Análises sóbrias sobre vistos EB, Green Card e vida nos EUA. Sem fantasia, sem promessa."
            />
          </div>
        </section>

        {/* Filtros */}
        <section className="bg-ink-deep border-y border-gold/15">
          <div className="container-x py-5 flex flex-wrap items-center gap-2">
            <Filter className="h-4 w-4 text-gold/70" />
            <span className="font-mono-label text-foreground/80 mr-3">FILTRAR</span>
            {(["Todos", ...CATEGORIAS] as const).map((c) => {
              const active = filtro === c;
              return (
                <button
                  key={c}
                  onClick={() => setFiltro(c)}
                  className={`px-3 py-1.5 text-xs font-mono-label border transition-colors ${
                    active
                      ? "border-gold bg-gold text-ink-deep"
                      : "border-gold/30 text-foreground/70 hover:border-gold/60 hover:text-foreground"
                  }`}
                >
                  {c}
                </button>
              );
            })}
          </div>
        </section>

        {/* Destaque */}
        {featured && filtro === "Todos" && (
          <section className="bg-ink">
            <div className="container-x py-14">
              <Link
                to="/blog/$slug"
                params={{ slug: featured.slug }}
                className="grid lg:grid-cols-12 gap-8 group rounded-3xl border border-gold/20 bg-ink-raise/40 overflow-hidden shadow-elevated transition-[border-color,box-shadow] hover:border-gold/45"
              >
                <div className="lg:col-span-7 aspect-[16/10] lg:aspect-auto bg-ink-deep overflow-hidden">
                  <img
                    src={featured.capa}
                    alt={featured.titulo}
                    width={1200}
                    height={630}
                    loading="eager"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="lg:col-span-5 p-8 md:p-10 flex flex-col justify-center">
                  <div className="flex items-center gap-3 font-mono-label text-gold">
                    <span>DESTAQUE</span>
                    <span className="text-foreground/80">·</span>
                    <span className="text-foreground/80">{featured.categoria}</span>
                  </div>
                  <h2 className="mt-4 font-display text-3xl md:text-4xl leading-tight group-hover:text-gold transition-colors">
                    {featured.titulo}
                  </h2>
                  <p className="mt-4 text-foreground/75 leading-relaxed">{featured.resumo}</p>
                  <div className="mt-6 flex items-center gap-4 text-xs text-foreground/80">
                    <span>{formatDate(featured.data_publicacao)}</span>
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" /> {featured.tempo_leitura} min de leitura
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          </section>
        )}

        {/* Grid */}
        <section className="bg-ink pb-24">
          <div className="container-x">
            {rest.length === 0 ? (
              <p className="text-foreground/80">Nenhum post nesta categoria.</p>
            ) : (
              <ul className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {rest.map((p) => (
                  <li key={p.id}>
                    <Link
                      to="/blog/$slug"
                      params={{ slug: p.slug }}
                      className="block group rounded-2xl border border-gold/15 bg-ink-raise/40 h-full overflow-hidden shadow-soft transition-[border-color,box-shadow,transform] hover:border-gold/45 hover:shadow-elevated"
                    >
                      <div className="aspect-[16/10] bg-ink-deep overflow-hidden">
                        <img
                          src={p.capa}
                          alt={p.titulo}
                          width={800}
                          height={500}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      </div>
                      <div className="p-6">
                        <Badge variant="outline" className="border-gold/40 text-gold font-mono-label text-[10px]">
                          {p.categoria}
                        </Badge>
                        <h3 className="mt-3 font-display text-xl leading-snug group-hover:text-gold transition-colors">
                          {p.titulo}
                        </h3>
                        <p className="mt-2 text-sm text-foreground/70 line-clamp-3">{p.resumo}</p>
                        <div className="mt-4 flex items-center gap-3 text-[11px] text-foreground/80">
                          <span>{formatDate(p.data_publicacao)}</span>
                          <span>·</span>
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {p.tempo_leitura} min
                          </span>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* CTA final */}
        <section className="section-parchment">
          <div className="container-x py-16 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <h2 className="font-display text-3xl text-ink-text">
                Pronto para iniciar a pré-qualificação documental?
              </h2>
              <p className="mt-2 text-ink-text/75">
                Análise individual e gratuita em até 48h.
              </p>
            </div>
            <Link to="/" hash="avaliacao">
              <Button size="lg" className="btn-label btn-sweep h-12 px-7">Iniciar pré-qualificação documental</Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("pt-BR", {
      day: "2-digit", month: "long", year: "numeric",
    });
  } catch {
    return iso;
  }
}
