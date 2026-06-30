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
import { broadcast } from "@/lib/admin/settings";

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
    ],
  },
  { slug: "sobre", label: "Sobre", sections: [] },
  { slug: "contato", label: "Contato", sections: [] },
  { slug: "eb2-niw", label: "Vistos · EB-2 NIW", sections: [] },
  { slug: "eb1", label: "Vistos · EB-1", sections: [] },
  { slug: "eb3", label: "Vistos · EB-3", sections: [] },
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
                  Página stub — ainda sem dobras editáveis mapeadas. Será expandida quando a página tiver seu próprio conteúdo institucional implementado.
                </p>
              </SectionCard>
            ) : p.sections.map((sec) => (
              <SectionCard key={sec.title} title={sec.title}>
                <div className="space-y-3">
                  {sec.keys.map((f) => (
                    <div key={f.k}>
                      <label className="text-xs text-slate-500">{f.label}</label>
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
      description="Configuração avançada — o site lê esta ordem (quando aplicada nos componentes).">
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
