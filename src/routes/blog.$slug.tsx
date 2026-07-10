import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ChevronRight, Clock, Link as LinkIcon } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  OrganizationJsonLd, ArticleJsonLd, BreadcrumbJsonLd,
} from "@/components/site/Seo";
import { getPost, listPublishedPosts, type BlogPost } from "@/lib/blog";
import { avaliacaoHref } from "@/lib/ctaLinks";

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params }) => {
    const post = await getPost(params.slug);
    if (!post || post.status !== "publicado") throw notFound();
    return { post };
  },
  head: ({ params, loaderData }) => {
    const p = loaderData?.post;
    if (!p) return { meta: [{ title: "Post não encontrado | Status na América" }] };
    return {
      meta: [
        { title: `${p.meta_title || p.titulo} | Status na América` },
        { name: "description", content: p.meta_description || p.resumo },
        { name: "robots", content: "index,follow" },
        { property: "og:title", content: p.meta_title || p.titulo },
        { property: "og:description", content: p.meta_description || p.resumo },
        { property: "og:type", content: "article" },
        { property: "og:url", content: `/blog/${p.slug}` },
        { property: "og:image", content: p.og_image || p.capa },
        { property: "og:locale", content: "pt_BR" },
        { property: "article:published_time", content: p.data_publicacao },
        { property: "article:author", content: p.autor },
        { property: "article:section", content: p.categoria },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:image", content: p.og_image || p.capa },
        { name: "twitter:title", content: p.meta_title || p.titulo },
        { name: "twitter:description", content: p.meta_description || p.resumo },
      ],
      links: [{ rel: "canonical", href: `/blog/${params.slug}` }],
    };
  },
  notFoundComponent: () => (
    <>
      <Header />
      <main className="pt-32 pb-24 container-x">
        <h1 className="font-display text-4xl">Post não encontrado</h1>
        <Link to="/blog" className="mt-6 inline-block text-gold underline">Voltar ao blog</Link>
      </main>
      <Footer />
    </>
  ),
  component: PostPage,
});

function PostPage() {
  const { post } = Route.useLoaderData();
  const [related, setRelated] = useState<BlogPost[]>([]);

  useEffect(() => {
    listPublishedPosts().then((all) => {
      const sameCat = all.filter((p) => p.categoria === post.categoria && p.id !== post.id).slice(0, 2);
      const fillers = all.filter((p) => p.id !== post.id && !sameCat.find((s) => s.id === p.id)).slice(0, 3 - sameCat.length);
      setRelated([...sameCat, ...fillers].slice(0, 3));
    });
  }, [post.id, post.categoria]);

  return (
    <>
      <Header />

      <OrganizationJsonLd />
      <ArticleJsonLd
        headline={post.titulo}
        description={post.resumo}
        image={post.og_image || post.capa}
        datePublished={post.data_publicacao}
        author={post.autor}
        url={`/blog/${post.slug}`}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Início", url: "/" },
          { name: "Blog", url: "/blog" },
          { name: post.titulo, url: `/blog/${post.slug}` },
        ]}
      />

      <main className="pt-28">
        <article>
          {/* Header do post */}
          <header className="bg-ink">
            <div className="container-x max-w-3xl py-12 md:py-16">
              <nav aria-label="Breadcrumb" className="font-mono-label text-foreground/80 flex items-center gap-2 flex-wrap">
                <Link to="/" className="hover:text-gold">Início</Link>
                <ChevronRight className="h-3 w-3" />
                <Link to="/blog" className="hover:text-gold">Blog</Link>
                <ChevronRight className="h-3 w-3" />
                <span className="text-gold truncate">{post.categoria}</span>
              </nav>

              <Badge variant="outline" className="mt-6 border-gold/40 text-gold font-mono-label text-[10px]">
                {post.categoria}
              </Badge>
              <h1 className="mt-4 font-display text-4xl md:text-5xl leading-[1.08]">{post.titulo}</h1>
              <p className="mt-5 text-lg text-foreground/80 leading-relaxed">{post.resumo}</p>

              <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-foreground/80 font-mono-label">
                <span>{post.autor}</span>
                <span aria-hidden>·</span>
                <span>{formatDate(post.data_publicacao)}</span>
                <span aria-hidden>·</span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" /> {post.tempo_leitura} min de leitura
                </span>
              </div>
            </div>
          </header>

          {/* Capa */}
          {post.capa && (
            <div className="bg-ink-deep">
              <div className="container-x max-w-5xl py-8">
                <img
                  src={post.capa}
                  alt={post.titulo}
                  width={1200}
                  height={630}
                  loading="eager"
                  className="w-full aspect-[16/9] object-cover rounded-3xl border border-gold/20 shadow-elevated"
                />
              </div>
            </div>
          )}

          {/* Corpo */}
          <div className="bg-ink">
            <div className="container-x max-w-3xl py-12 md:py-16">
              <div className="prose-dossie">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {sanitizeMarkdown(post.corpo)}
                </ReactMarkdown>
              </div>

              {/* Compartilhar */}
              <ShareRow url={`/blog/${post.slug}`} title={post.titulo} />

              {/* CTA final */}
              <div className="mt-12 rounded-2xl border border-gold/30 bg-ink-raise/50 p-8 shadow-soft">
                <h2 className="font-display text-2xl">Pronto para avaliar o seu perfil?</h2>
                <p className="mt-2 text-foreground/75">Análise individual e gratuita em até 48h.</p>
                <a href={avaliacaoHref(`blog_${post.slug}`)} className="mt-5 inline-block">
                  <Button size="lg" className="btn-label btn-sweep h-12 px-7">Análise gratuita</Button>
                </a>
              </div>
            </div>
          </div>

          {/* Relacionados */}
          {related.length > 0 && (
            <section className="section-parchment">
              <div className="container-x py-16">
                <div className="flex items-center gap-3">
                  <span aria-hidden className="h-px w-10 bg-gold/70" />
                  <span className="font-mono-label text-ink-text/70">CONTINUE LENDO</span>
                </div>
                <ul className="mt-8 grid gap-6 md:grid-cols-3">
                  {related.map((r) => (
                    <li key={r.id}>
                      <Link
                        to="/blog/$slug"
                        params={{ slug: r.slug }}
                        className="block group rounded-2xl border border-ink-text/15 bg-white h-full overflow-hidden shadow-soft transition-[border-color,box-shadow] hover:border-ink-text/35 hover:shadow-elevated"
                      >
                        <div className="aspect-[16/10] overflow-hidden">
                          <img src={r.capa} alt={r.titulo} width={600} height={375} loading="lazy"
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                        </div>
                        <div className="p-5">
                          <div className="font-mono-label text-[10px] text-gold">{r.categoria}</div>
                          <h3 className="mt-2 font-display text-lg leading-snug group-hover:text-oxblood transition-colors">
                            {r.titulo}
                          </h3>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}
        </article>
      </main>

      <Footer />
    </>
  );
}

function sanitizeMarkdown(md: string) {
  // remove o marcador de "expandir conteúdo" para não aparecer no site
  return md.replace(/<!--\s*expandir conte[uú]do\s*-->/gi, "").trim();
}

function ShareRow({ url, title }: { url: string; title: string }) {
  const [origin, setOrigin] = useState("");
  useEffect(() => { if (typeof window !== "undefined") setOrigin(window.location.origin); }, []);
  const full = `${origin}${url}`;
  const enc = encodeURIComponent;

  return (
    <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-gold/15 pt-6">
      <span className="font-mono-label text-foreground/80">COMPARTILHAR</span>
      <a className="text-sm underline hover:text-gold" target="_blank" rel="noopener noreferrer"
        href={`mailto:?subject=${enc(title)}&body=${enc(full)}`}>E-mail</a>
      <a className="text-sm underline hover:text-gold" target="_blank" rel="noopener noreferrer"
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${enc(full)}`}>LinkedIn</a>
      <a className="text-sm underline hover:text-gold" target="_blank" rel="noopener noreferrer"
        href={`https://twitter.com/intent/tweet?text=${enc(title)}&url=${enc(full)}`}>X</a>
      <button
        className="text-sm underline hover:text-gold inline-flex items-center gap-1.5"
        onClick={() => navigator.clipboard?.writeText(full)}>
        <LinkIcon className="h-3.5 w-3.5" /> Copiar link
      </button>
    </div>
  );
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
  } catch { return iso; }
}
