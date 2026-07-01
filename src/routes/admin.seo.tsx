import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Info, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PageHeader, SectionCard } from "@/components/admin/ui";
import { get, set } from "@/lib/dataStore";
import { broadcast } from "@/lib/admin/settings";
import { ImageUploader } from "@/components/admin/ImageUploader";

export const Route = createFileRoute("/admin/seo")({ component: SeoPage });

interface PageSeo {
  id: string;
  meta_title: string;
  meta_description: string;
  og_title: string;
  og_description: string;
  og_image: string;
  canonical: string;
  robots: "index,follow" | "noindex,follow" | "noindex,nofollow";
}

const PAGES: Array<{ slug: string; label: string; defaults: PageSeo }> = [
  { slug: "home", label: "Home", defaults: {
    id: "home",
    meta_title: "Status na América | Green Card EB-2 NIW para profissionais brasileiros",
    meta_description: "Imigração legal para os EUA por mérito profissional. Preparação documental especializada para vistos EB-2 NIW, EB-1 e EB-3 — profissionais brasileiros consolidados.",
    og_title: "Status na América | Green Card EB-2 NIW",
    og_description: "Conquiste o Green Card americano pelo mérito da sua carreira.",
    og_image: "/og-image.jpg", canonical: "/", robots: "index,follow",
  }},
  { slug: "sobre", label: "Sobre", defaults: { id: "sobre", meta_title: "Sobre — Status na América", meta_description: "Conheça a Status na América.", og_title: "", og_description: "", og_image: "", canonical: "/sobre", robots: "index,follow" }},
  { slug: "contato", label: "Contato", defaults: { id: "contato", meta_title: "Contato — Status na América", meta_description: "Fale com nossa equipe.", og_title: "", og_description: "", og_image: "", canonical: "/contato", robots: "index,follow" }},
];

function SeoPage() {
  return (
    <>
      <PageHeader
        title="SEO"
        description="Meta tags por página. Para LPs, edite no segmento correspondente."
        actions={<SitemapDownloadButton />}
      />
      <div className="mb-4 rounded-md border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900 flex gap-2">
        <Info className="h-4 w-4 mt-0.5 shrink-0" />
        <div>SEO das LANDING PAGES (médicos, engenheiros, empresários, ...) é editado em <Link to="/admin/segmentos" className="underline font-medium">Segmentos</Link>.</div>
      </div>
      <Tabs defaultValue="home">
        <TabsList>{PAGES.map((p) => <TabsTrigger key={p.slug} value={p.slug}>{p.label}</TabsTrigger>)}</TabsList>
        {PAGES.map((p) => (
          <TabsContent key={p.slug} value={p.slug} className="mt-4">
            <SeoEditor page={p} />
          </TabsContent>
        ))}
      </Tabs>
    </>
  );
}

/**
 * Gerar sitemap a partir do estado atual do dataStore — inclui posts do
 * blog criados via admin (que o sitemap server-side não enxerga porque vive
 * em localStorage). Faz download de um sitemap.xml pronto.
 */
function SitemapDownloadButton() {
  async function generate() {
    const { listPublishedPosts } = await import("@/lib/blog");
    const posts = await listPublishedPosts();
    const entries = [
      { path: "/", priority: "1.0", changefreq: "weekly" },
      { path: "/vistos/eb2-niw", priority: "0.9", changefreq: "monthly" },
      { path: "/vistos/eb1", priority: "0.8", changefreq: "monthly" },
      { path: "/vistos/eb3", priority: "0.8", changefreq: "monthly" },
      { path: "/sobre", priority: "0.7", changefreq: "monthly" },
      { path: "/contato", priority: "0.6", changefreq: "monthly" },
      { path: "/blog", priority: "0.7", changefreq: "weekly" },
      { path: "/llm-info", priority: "0.5", changefreq: "monthly" },
      ...posts.map((p) => ({
        path: `/blog/${p.slug}`,
        priority: "0.6",
        changefreq: "monthly",
        lastmod: p.data_publicacao,
      })),
    ];
    const urls = entries.map((e) => {
      const tags = [
        `    <loc>${e.path}</loc>`,
        (e as { lastmod?: string }).lastmod && `    <lastmod>${(e as { lastmod?: string }).lastmod}</lastmod>`,
        `    <changefreq>${e.changefreq}</changefreq>`,
        `    <priority>${e.priority}</priority>`,
      ].filter(Boolean).join("\n");
      return `  <url>\n${tags}\n  </url>`;
    });
    const xml = [
      `<?xml version="1.0" encoding="UTF-8"?>`,
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
      ...urls,
      `</urlset>`,
    ].join("\n");
    const blob = new Blob([xml], { type: "application/xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "sitemap.xml"; a.click();
    URL.revokeObjectURL(url);
    toast.success(`Sitemap gerado com ${entries.length} URLs.`);
  }
  return (
    <Button variant="outline" onClick={generate} className="gap-1.5">
      <Save className="h-4 w-4" /> Gerar sitemap
    </Button>
  );
}

function SeoEditor({ page }: { page: { slug: string; label: string; defaults: PageSeo } }) {
  const [v, setV] = useState<PageSeo>(page.defaults);
  useEffect(() => { (async () => {
    const row = await get<PageSeo>("page_seo", page.slug);
    setV(row ? { ...page.defaults, ...row } : page.defaults);
  })(); }, [page]);

  const upd = <K extends keyof PageSeo>(k: K, val: PageSeo[K]) => setV({ ...v, [k]: val });

  async function save() {
    await set("page_seo", page.slug, v);
    broadcast();
    toast.success("SEO salvo.");
  }

  const tLen = v.meta_title.length, dLen = v.meta_description.length;

  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <SectionCard title="Edição">
        <div className="space-y-3">
          <div>
            <label className="text-xs text-slate-500">Meta title <span className={tLen > 60 ? "text-rose-600" : "text-slate-400"}>({tLen}/60)</span></label>
            <Input value={v.meta_title} onChange={(e) => upd("meta_title", e.target.value)} className="mt-1" />
          </div>
          <div>
            <label className="text-xs text-slate-500">Meta description <span className={dLen > 160 ? "text-rose-600" : "text-slate-400"}>({dLen}/160)</span></label>
            <Textarea rows={2} value={v.meta_description} onChange={(e) => upd("meta_description", e.target.value)} className="mt-1" />
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div><label className="text-xs text-slate-500">OG Title</label><Input className="mt-1" value={v.og_title} onChange={(e) => upd("og_title", e.target.value)} /></div>
            <div><label className="text-xs text-slate-500">Canonical</label><Input className="mt-1" value={v.canonical} onChange={(e) => upd("canonical", e.target.value)} /></div>
            <div className="sm:col-span-2"><label className="text-xs text-slate-500">OG Description</label><Textarea rows={2} className="mt-1" value={v.og_description} onChange={(e) => upd("og_description", e.target.value)} /></div>
            <div className="sm:col-span-2">
              <label className="text-xs text-slate-500">OG Image</label>
              <div className="mt-1">
                <ImageUploader
                  value={v.og_image}
                  onChange={(url) => upd("og_image", url)}
                  folder="seo"
                  filenameHint={`${v.id || "page"}-og`}
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-500">Robots</label>
              <Select value={v.robots} onValueChange={(val) => upd("robots", val as PageSeo["robots"])}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="index,follow">index, follow</SelectItem>
                  <SelectItem value="noindex,follow">noindex, follow</SelectItem>
                  <SelectItem value="noindex,nofollow">noindex, nofollow</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={save} className="bg-amber-400 text-slate-900 hover:bg-amber-500 gap-1.5"><Save className="h-4 w-4" />Salvar</Button>
        </div>
      </SectionCard>

      <div className="space-y-4">
        <SectionCard title="Preview — Google">
          <div className="p-3 rounded-md bg-white border border-slate-100">
            <div className="text-[11px] text-emerald-700">statusnaamerica.com {v.canonical}</div>
            <div className="text-[18px] text-[#1a0dab] leading-snug truncate">{v.meta_title || "—"}</div>
            <div className="text-[13px] text-slate-700 line-clamp-2">{v.meta_description || "—"}</div>
          </div>
        </SectionCard>
        <SectionCard title="Preview — OG (WhatsApp / Facebook)">
          <div className="rounded-md border border-slate-200 overflow-hidden">
            <div className="aspect-[1.91/1] bg-slate-100 grid place-items-center text-xs text-slate-400">
              {v.og_image ? <img src={v.og_image} alt="" className="object-cover w-full h-full" /> : "OG image"}
            </div>
            <div className="p-3 bg-white">
              <div className="text-[11px] text-slate-500 uppercase">statusnaamerica.com</div>
              <div className="font-semibold text-sm">{v.og_title || v.meta_title}</div>
              <div className="text-xs text-slate-600 line-clamp-2">{v.og_description || v.meta_description}</div>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
