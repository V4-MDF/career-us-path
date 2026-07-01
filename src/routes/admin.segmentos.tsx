import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, ExternalLink, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { PageHeader, SectionCard } from "@/components/admin/ui";
import { list, newId, remove, set } from "@/lib/dataStore";
import { ensureSeed, type Segment } from "@/lib/segments";
import { broadcast } from "@/lib/admin/settings";

export const Route = createFileRoute("/admin/segmentos")({ component: SegmentsPage });

const empty = (): Segment => ({
  id: newId("seg"),
  slug: "novo-segmento",
  nome: "Novo Segmento",
  ativo: true,
  noindex: false,
  visa_slug: "eb2-niw",
  profissao_default: "outra_qualificada",
  eyebrow: "PARA PROFISSIONAIS BRASILEIROS",
  prova_social: "",
  comparativo: { label: "Comparativo", lado_brasil: "", lado_eua: "", observacao: "" },
  dores: [],
  custo_adiar: "",
  checklist: [],
  faq_segmento: [],
  meta_title: "",
  meta_description: "",
  hero_default: { eyebrow: "", h1: "", sub: "", cta_texto: "Fazer minha análise gratuita", imagem: "" },
});

function SegmentsPage() {
  const [list_, setList] = useState<Segment[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);

  async function reload() {
    await ensureSeed();
    const all = await list<Segment>("segments");
    all.sort((a, b) => a.nome.localeCompare(b.nome));
    setList(all);
  }
  useEffect(() => { reload(); }, []);

  async function save(seg: Segment) {
    if (!seg.slug.trim()) { toast.error("Slug é obrigatório."); return; }
    await set("segments", seg.id, seg);
    broadcast();
    toast.success("Segmento salvo. LP no ar em /lp/" + seg.slug);
    reload();
  }

  async function del(id: string) {
    await remove("segments", id);
    broadcast();
    toast.success("Segmento removido.");
    reload();
  }

  return (
    <>
      <PageHeader
        title="Segmentos / Landing Pages"
        description="Cada segmento é uma LP em /lp/[slug]. A LP reusa a estrutura da página de visto escolhida — só o Hero muda entre segmentos e variantes A/B."

        actions={
          <Button className="gap-1.5 bg-slate-900 hover:bg-slate-800" onClick={async () => {
            const s = empty();
            await set("segments", s.id, s);
            broadcast();
            setOpenId(s.id);
            reload();
          }}>
            <Plus className="h-4 w-4" /> Novo segmento
          </Button>
        }
      />

      <div className="space-y-3">
        {list_.map((seg) => (
          <SegmentRow
            key={seg.id}
            segment={seg}
            open={openId === seg.id}
            onToggle={() => setOpenId(openId === seg.id ? null : seg.id)}
            onSave={save}
            onDelete={del}
          />
        ))}
      </div>
    </>
  );
}

function SegmentRow({ segment, open, onToggle, onSave, onDelete }: {
  segment: Segment; open: boolean; onToggle: () => void;
  onSave: (s: Segment) => void; onDelete: (id: string) => void;
}) {
  const [draft, setDraft] = useState<Segment>(segment);
  useEffect(() => { setDraft(segment); }, [segment]);

  const upd = <K extends keyof Segment>(k: K, v: Segment[K]) => setDraft({ ...draft, [k]: v });

  return (
    <SectionCard>
      <div className="flex items-center justify-between gap-3">
        <button onClick={onToggle} className="flex items-center gap-3 flex-1 text-left">
          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          <div>
            <div className="font-medium">{draft.nome}</div>
            <div className="text-xs text-slate-500">/lp/{draft.slug} · {draft.ativo ? "ativo" : "inativo"}</div>
          </div>
        </button>
        <a href={`/lp/${draft.slug}`} target="_blank" rel="noopener noreferrer"
           className="text-xs text-slate-500 hover:text-amber-600 inline-flex items-center gap-1">
          ver LP <ExternalLink className="h-3 w-3" />
        </a>
        <Switch checked={draft.ativo} onCheckedChange={(v) => { const next = { ...draft, ativo: v }; setDraft(next); onSave(next); }} />
      </div>

      {open && (
        <div className="mt-5 space-y-5 border-t border-slate-100 pt-5">
          <div className="grid sm:grid-cols-2 gap-3">
            <Fld label="Nome"><Input value={draft.nome} onChange={(e) => upd("nome", e.target.value)} /></Fld>
            <Fld label="Slug (URL)"><Input value={draft.slug} onChange={(e) => upd("slug", e.target.value.replace(/\s+/g, "-").toLowerCase())} /></Fld>
            <Fld label="Estrutura de visto usada no corpo">
              <select
                className="w-full h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm"
                value={draft.visa_slug ?? "eb2-niw"}
                onChange={(e) => upd("visa_slug", e.target.value as Segment["visa_slug"])}
              >
                <option value="eb2-niw">EB-2 NIW</option>
                <option value="eb1">EB-1</option>
                <option value="eb3">EB-3</option>
              </select>
            </Fld>
            <Fld label="Profissão default (chave do select)"><Input value={draft.profissao_default ?? ""} onChange={(e) => upd("profissao_default", e.target.value)} /></Fld>
            <Fld label="Eyebrow (badge acima do H1)"><Input value={draft.eyebrow} onChange={(e) => upd("eyebrow", e.target.value)} /></Fld>
            <Fld label="Prova social (citação sob o CTA do Hero)" full>
              <Textarea value={draft.prova_social} onChange={(e) => upd("prova_social", e.target.value)} rows={2} />
            </Fld>
          </div>

          <Group title="Hero default (fallback quando não há variantes A/B ativas — só o Hero varia entre variantes)">
            <Fld label="Eyebrow"><Input value={draft.hero_default.eyebrow} onChange={(e) => upd("hero_default", { ...draft.hero_default, eyebrow: e.target.value })} /></Fld>
            <Fld label="CTA"><Input value={draft.hero_default.cta_texto} onChange={(e) => upd("hero_default", { ...draft.hero_default, cta_texto: e.target.value })} /></Fld>
            <Fld label="H1" full><Textarea rows={2} value={draft.hero_default.h1} onChange={(e) => upd("hero_default", { ...draft.hero_default, h1: e.target.value })} /></Fld>
            <Fld label="Subtítulo" full><Textarea rows={2} value={draft.hero_default.sub} onChange={(e) => upd("hero_default", { ...draft.hero_default, sub: e.target.value })} /></Fld>
            <Fld label="Imagem (URL)" full><Input value={draft.hero_default.imagem ?? ""} placeholder="https://..." onChange={(e) => upd("hero_default", { ...draft.hero_default, imagem: e.target.value })} /></Fld>
          </Group>

          <Group title="SEO da LP">
            <Fld label="Meta title" full><Input value={draft.meta_title} onChange={(e) => upd("meta_title", e.target.value)} /></Fld>
            <Fld label="Meta description" full><Textarea rows={2} value={draft.meta_description} onChange={(e) => upd("meta_description", e.target.value)} /></Fld>
            <div className="flex items-center gap-2">
              <Switch checked={!!draft.noindex} onCheckedChange={(v) => upd("noindex", v)} />
              <span className="text-sm">noindex (esconder dos buscadores)</span>
            </div>
          </Group>


          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" className="text-rose-600 hover:text-rose-700 gap-1.5">
                  <Trash2 className="h-4 w-4" /> Excluir
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir segmento?</AlertDialogTitle>
                  <AlertDialogDescription>
                    A LP /lp/{draft.slug} deixará de existir. Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDelete(draft.id)}>Excluir</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Button onClick={() => onSave(draft)} className="bg-amber-400 text-slate-900 hover:bg-amber-500">
              Salvar segmento
            </Button>
          </div>
        </div>
      )}
    </SectionCard>
  );
}

function Fld({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <Label className="text-xs text-slate-500">{label}</Label>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function Group({ title, children, cols = 2 }: { title: string; children: React.ReactNode; cols?: 1 | 2 }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2">{title}</div>
      <div className={`grid gap-3 ${cols === 2 ? "sm:grid-cols-2" : ""}`}>{children}</div>
    </div>
  );
}

function StringList({ items, onChange, placeholder }: { items: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  return (
    <div className="space-y-2">
      {items.map((it, i) => (
        <div key={i} className="flex gap-2">
          <Input value={it} placeholder={placeholder} onChange={(e) => { const c = [...items]; c[i] = e.target.value; onChange(c); }} />
          <Button variant="ghost" size="icon" onClick={() => onChange(items.filter((_, idx) => idx !== i))}>
            <Trash2 className="h-4 w-4 text-rose-500" />
          </Button>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={() => onChange([...items, ""])} className="gap-1.5">
        <Plus className="h-3.5 w-3.5" /> Adicionar
      </Button>
    </div>
  );
}

function ChecklistEditor({ items, onChange }: { items: Segment["checklist"]; onChange: (v: Segment["checklist"]) => void }) {
  return (
    <div className="space-y-2">
      {items.map((it, i) => (
        <div key={i} className="flex gap-2 items-center">
          <Switch checked={it.positivo} onCheckedChange={(v) => { const c = [...items]; c[i] = { ...it, positivo: v }; onChange(c); }} />
          <span className="text-xs text-slate-500 w-12">{it.positivo ? "✓ é" : "✗ não é"}</span>
          <Input value={it.texto} onChange={(e) => { const c = [...items]; c[i] = { ...it, texto: e.target.value }; onChange(c); }} />
          <Button variant="ghost" size="icon" onClick={() => onChange(items.filter((_, idx) => idx !== i))}>
            <Trash2 className="h-4 w-4 text-rose-500" />
          </Button>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={() => onChange([...items, { texto: "", positivo: true }])} className="gap-1.5">
        <Plus className="h-3.5 w-3.5" /> Adicionar item
      </Button>
    </div>
  );
}

function FaqEditor({ items, onChange }: { items: Segment["faq_segmento"]; onChange: (v: Segment["faq_segmento"]) => void }) {
  return (
    <div className="space-y-3">
      {items.map((it, i) => (
        <div key={i} className="rounded-md border border-slate-200 p-3 space-y-2">
          <div className="flex items-start gap-2">
            <Input placeholder="Pergunta" value={it.q} onChange={(e) => { const c = [...items]; c[i] = { ...it, q: e.target.value }; onChange(c); }} />
            <Button variant="ghost" size="icon" onClick={() => onChange(items.filter((_, idx) => idx !== i))}>
              <Trash2 className="h-4 w-4 text-rose-500" />
            </Button>
          </div>
          <Textarea rows={2} placeholder="Resposta" value={it.a} onChange={(e) => { const c = [...items]; c[i] = { ...it, a: e.target.value }; onChange(c); }} />
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={() => onChange([...items, { q: "", a: "" }])} className="gap-1.5">
        <Plus className="h-3.5 w-3.5" /> Adicionar pergunta
      </Button>
    </div>
  );
}
