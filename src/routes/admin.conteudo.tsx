import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Info, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PageHeader, SectionCard } from "@/components/admin/ui";
import { get, set } from "@/lib/dataStore";
import { defaultContent } from "@/lib/siteContent";
import { isPending } from "@/lib/pendingValidation";
import { broadcast } from "@/lib/admin/settings";
import { parseVideoUrl } from "@/lib/videoEmbed";

export const Route = createFileRoute("/admin/conteudo")({ component: ContentPage });

/**
 * Mapeamento das páginas institucionais → blocos/dobras → chaves de site_content.
 * Para conteúdo das LANDING PAGES, veja /admin/segmentos (não duplicar aqui).
 */
const PAGES: Array<{
  slug: string; label: string;
  sections: Array<{ title: string; keys: Array<{ k: keyof typeof defaultContent; label: string; multiline?: boolean }> }>;
}> = [
  {
    slug: "home",
    label: "Home",
    sections: [
      { title: "Hero", keys: [
        { k: "hero.eyebrow", label: "Eyebrow" },
        { k: "hero.title", label: "Título (H1)", multiline: true },
        { k: "hero.subtitle", label: "Subtítulo", multiline: true },
        { k: "hero.cta", label: "Texto do CTA" },
        { k: "hero.proof", label: "Prova social", multiline: true },
        { k: "hero.videoUrl", label: "Vídeo de fundo (YouTube ou URL MP4/WebM) — opcional, só desktop" },
        { k: "hero.posterUrl", label: "Poster/imagem de fallback (URL) — usada no mobile e enquanto o vídeo carrega" },
      ]},
      { title: "Contraste BR vs EUA", keys: [
        { k: "contrast.title", label: "Título" },
        { k: "contrast.subtitle", label: "Subtítulo", multiline: true },
      ]},
      { title: "EB-2 NIW", keys: [
        { k: "niw.title", label: "Título" },
        { k: "niw.lead", label: "Lead", multiline: true },
      ]},
      { title: "Processo", keys: [
        { k: "process.title", label: "Título" },
      ]},
      { title: "Por que a Status", keys: [
        { k: "why.title", label: "Título" },
        { k: "why.lead", label: "Lead", multiline: true },
      ]},
      { title: "CTA final", keys: [
        { k: "cta.title", label: "Título" },
        { k: "cta.subtitle", label: "Subtítulo", multiline: true },
      ]},
      { title: "Selos e parceiros", keys: [
        { k: "partners.eyebrow", label: "Eyebrow" },
        { k: "partners.title", label: "Título" },
        { k: "partners.slot1.label", label: "Slot 1 · Legenda" },
        { k: "partners.slot1.url", label: "Slot 1 · URL do logo" },
        { k: "partners.slot2.label", label: "Slot 2 · Legenda" },
        { k: "partners.slot2.url", label: "Slot 2 · URL do logo" },
        { k: "partners.slot3.label", label: "Slot 3 · Legenda" },
        { k: "partners.slot3.url", label: "Slot 3 · URL do logo" },
        { k: "partners.slot4.label", label: "Slot 4 · Legenda" },
        { k: "partners.slot4.url", label: "Slot 4 · URL do logo" },
        { k: "partners.slot5.label", label: "Slot 5 · Legenda" },
        { k: "partners.slot5.url", label: "Slot 5 · URL do logo" },
        { k: "partners.slot6.label", label: "Slot 6 · Legenda" },
        { k: "partners.slot6.url", label: "Slot 6 · URL do logo" },
      ]},
      { title: "Depoimentos em vídeo", keys: [
        { k: "testimonials.videoEyebrow", label: "Vídeo · Eyebrow" },
        { k: "testimonials.videoTitle", label: "Vídeo · Título" },
        { k: "testimonials.helderName", label: "Slot Helder · Nome" },
        { k: "testimonials.helderRole", label: "Slot Helder · Cargo" },
        { k: "testimonials.helderCaption", label: "Slot Helder · Legenda" },
        { k: "testimonials.helderVideoUrl", label: "Slot Helder · URL do vídeo (YouTube, Vimeo ou MP4)" },
        { k: "testimonials.secondaryName", label: "Slot cliente · Nome" },
        { k: "testimonials.secondaryRole", label: "Slot cliente · Cargo" },
        { k: "testimonials.secondaryCaption", label: "Slot cliente · Legenda" },
        { k: "testimonials.secondaryVideoUrl", label: "Slot cliente · URL do vídeo (YouTube, Vimeo ou MP4)" },
        { k: "testimonials.googleReviewsUrl", label: "Link · Avaliações no Google" },
      ]},
    ],
  },
  { slug: "sobre", label: "Sobre", sections: [] },
  { slug: "contato", label: "Contato", sections: [] },
  {
    slug: "eb2-niw", label: "Vistos · EB-2 NIW",
    sections: [
      { title: "Hero (imagem + texto enxuto + vídeo)", keys: [
        { k: "visa.eb2-niw.heroImage", label: "URL da imagem de fundo do hero (webp/jpg) — específica deste visto" },
        { k: "visa.eb2-niw.heroSubtitle", label: "Subtítulo curto (1–2 linhas)", multiline: true },
        { k: "visa.eb2-niw.heroVideoUrl", label: "URL do vídeo (YouTube, Vimeo ou MP4)" },
        { k: "visa.eb2-niw.heroVideoThumb", label: "URL da thumbnail (webp/jpg, opcional)" },
      ]},
      { title: "01 Definição (imagem)", keys: [
        { k: "visa.eb2-niw.definitionImage", label: "URL da imagem da dobra 01 Definição — profissional beneficiário no exercício da sua competência (não usar pose corporativa de braços cruzados)" },
      ]},
    ],
  },
  {
    slug: "eb1", label: "Vistos · EB-1",
    sections: [
      { title: "Hero (imagem + texto enxuto + vídeo)", keys: [
        { k: "visa.eb1.heroImage", label: "URL da imagem de fundo do hero (webp/jpg) — específica deste visto" },
        { k: "visa.eb1.heroSubtitle", label: "Subtítulo curto (1–2 linhas)", multiline: true },
        { k: "visa.eb1.heroVideoUrl", label: "URL do vídeo (YouTube, Vimeo ou MP4)" },
        { k: "visa.eb1.heroVideoThumb", label: "URL da thumbnail (webp/jpg, opcional)" },
      ]},
    ],
  },
  {
    slug: "eb3", label: "Vistos · EB-3",
    sections: [
      { title: "Hero (imagem + texto enxuto + vídeo)", keys: [
        { k: "visa.eb3.heroImage", label: "URL da imagem de fundo do hero (webp/jpg) — específica deste visto" },
        { k: "visa.eb3.heroSubtitle", label: "Subtítulo curto (1–2 linhas)", multiline: true },
        { k: "visa.eb3.heroVideoUrl", label: "URL do vídeo (YouTube, Vimeo ou MP4)" },
        { k: "visa.eb3.heroVideoThumb", label: "URL da thumbnail (webp/jpg, opcional)" },
      ]},
    ],
  },

];

function ContentPage() {
  const [page, setPage] = useState("home");
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    (async () => {
      const map: Record<string, string> = {};
      for (const k of Object.keys(defaultContent) as (keyof typeof defaultContent)[]) {
        const row = await get<{ value: string }>("site_content", k);
        map[k] = row?.value ?? defaultContent[k];
      }
      setValues(map);
    })();
  }, []);

  async function save(k: string) {
    await set("site_content", k, { value: values[k] ?? "" });
    broadcast();
    toast.success("Texto salvo.");
  }

  async function saveAll() {
    await Promise.all(Object.entries(values).map(([k, v]) => set("site_content", k, { value: v })));
    broadcast();
    toast.success("Todos os textos foram salvos.");
  }

  const active = PAGES.find((p) => p.slug === page)!;

  return (
    <>
      <PageHeader
        title="Textos & Conteúdo"
        description="Cada campo é pré-preenchido com o texto atual do site (com fallback ao padrão do código)."
        actions={<Button onClick={saveAll} className="bg-amber-400 text-slate-900 hover:bg-amber-500 gap-1.5"><Save className="h-4 w-4" />Salvar tudo</Button>}
      />

      <div className="mb-4 rounded-md border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900 flex gap-2">
        <Info className="h-4 w-4 mt-0.5 shrink-0" />
        <div>
          Conteúdo das <strong>Landing Pages</strong> (médicos, engenheiros, empresários, ...) é editado em{" "}
          <Link to="/admin/segmentos" className="underline font-medium">Segmentos / LPs</Link>, para evitar duplicação.
        </div>
      </div>

      <Tabs value={page} onValueChange={setPage}>
        <TabsList className="flex flex-wrap h-auto">
          {PAGES.map((p) => <TabsTrigger key={p.slug} value={p.slug}>{p.label}</TabsTrigger>)}
        </TabsList>

        {PAGES.map((p) => (
          <TabsContent key={p.slug} value={p.slug} className="mt-4 space-y-4">
            {p.sections.length === 0 ? (
              <SectionCard>
                <p className="text-sm text-slate-500">
                  Página stub, ainda sem dobras editáveis mapeadas. Será expandida quando a página tiver seu próprio conteúdo institucional implementado.
                </p>
              </SectionCard>
            ) : p.sections.map((sec) => (
              <SectionCard key={sec.title} title={sec.title}>
                <div className="space-y-3">
                  {sec.keys.map((f) => (
                    <div key={f.k}>
                      <div className="flex items-center justify-between">
                        <label className="text-xs text-slate-500">{f.label}</label>
                        {isPending(f.k) && (
                          <span
                            title="Valor exibido no site público, mas pendente de validação pelo cliente."
                            className="inline-flex items-center gap-1 rounded border border-amber-300 bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-amber-700"
                          >
                            ● Pendente de validação
                          </span>
                        )}
                      </div>
                      {f.multiline ? (
                        <Textarea rows={2} value={values[f.k] ?? ""} className="mt-1"
                          onChange={(e) => setValues({ ...values, [f.k]: e.target.value })}
                          onBlur={() => save(f.k)} />
                      ) : (
                        <Input value={values[f.k] ?? ""} className="mt-1"
                          onChange={(e) => setValues({ ...values, [f.k]: e.target.value })}
                          onBlur={() => save(f.k)} />
                      )}
                      <div className="mt-0.5 text-[10px] text-slate-400">Chave: {f.k} · salva ao sair do campo</div>
                      {/^URL do vídeo/i.test(f.label) && (values[f.k] ?? "").trim() !== "" && (() => {
                        const parsed = parseVideoUrl(values[f.k] ?? "");
                        return parsed ? (
                          <div className="mt-1 text-[10px] font-medium text-emerald-700">
                            ✓ {parsed.kind === "youtube" ? "YouTube" : parsed.kind === "vimeo" ? "Vimeo" : "Arquivo de vídeo"} reconhecido
                          </div>
                        ) : (
                          <div className="mt-1 text-[10px] font-medium text-oxblood">
                            ⚠ URL inválida. Cole um link do YouTube (watch, youtu.be ou shorts), Vimeo ou .mp4/.webm. O site mostrará um placeholder até corrigir.
                          </div>
                        );
                      })()}
                    </div>
                  ))}
                </div>
              </SectionCard>
            ))}
            {/* Estrutura de dobras (toggle/reorder simples) */}
            {p.sections.length > 0 && active.slug === "home" && <PageSections />}
          </TabsContent>
        ))}
      </Tabs>
    </>
  );
}

const HOME_SECTIONS = [
  "hero", "authority-strip", "contrast", "niw", "visa-cards",
  "persona-cards", "process", "why", "salary", "testimonials", "faq", "cta-form",
];

function PageSections() {
  const [order, setOrder] = useState<{ id: string; active: boolean }[]>(
    HOME_SECTIONS.map((id) => ({ id, active: true }))
  );

  useEffect(() => {
    (async () => {
      const row = await get<{ items: { id: string; active: boolean }[] }>("page_sections", "home");
      if (row?.items) setOrder(row.items);
    })();
  }, []);

  async function persist(next: typeof order) {
    setOrder(next);
    await set("page_sections", "home", { items: next });
    broadcast();
  }

  function move(idx: number, dir: -1 | 1) {
    const j = idx + dir;
    if (j < 0 || j >= order.length) return;
    const next = [...order];
    [next[idx], next[j]] = [next[j], next[idx]];
    persist(next);
  }

  return (
    <SectionCard title="Estrutura da Home (ordem e visibilidade)"
      description="Configuração avançada, o site lê esta ordem (quando aplicada nos componentes).">
      <ul className="divide-y divide-slate-100">
        {order.map((s, i) => (
          <li key={s.id} className="py-2 flex items-center gap-3">
            <span className="text-xs text-slate-400 w-6">{i + 1}.</span>
            <span className="flex-1 font-mono text-xs">{s.id}</span>
            <Button variant="ghost" size="sm" onClick={() => move(i, -1)}>↑</Button>
            <Button variant="ghost" size="sm" onClick={() => move(i, 1)}>↓</Button>
            <Button variant={s.active ? "secondary" : "outline"} size="sm"
              onClick={() => { const c = [...order]; c[i] = { ...c[i], active: !c[i].active }; persist(c); }}>
              {s.active ? "Ativa" : "Oculta"}
            </Button>
          </li>
        ))}
      </ul>
    </SectionCard>
  );
}
