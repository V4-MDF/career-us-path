import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Copy, Plus, RotateCcw, Trash2, Trophy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { PageHeader, SectionCard } from "@/components/admin/ui";
import { list, newId, remove, set } from "@/lib/dataStore";
import { ensureSeed, type AbStats, type HeroVariant, type Segment } from "@/lib/segments";
import { broadcast } from "@/lib/admin/settings";
import { ImageUploader } from "@/components/admin/ImageUploader";

export const Route = createFileRoute("/admin/ab")({ component: AbPage });

function AbPage() {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [variants, setVariants] = useState<HeroVariant[]>([]);
  const [stats, setStats] = useState<AbStats[]>([]);

  async function reload() {
    await ensureSeed();
    setSegments(await list<Segment>("segments"));
    setVariants(await list<HeroVariant>("hero_variants"));
    setStats(await list<AbStats>("ab_stats"));
  }
  useEffect(() => { reload(); }, []);

  async function saveVariant(v: HeroVariant) {
    await set("hero_variants", v.id, v);
    broadcast();
    toast.success("Variante salva.");
    reload();
  }

  async function delVariant(id: string) {
    await remove("hero_variants", id);
    await remove("ab_stats", id);
    broadcast();
    toast.success("Variante removida.");
    reload();
  }

  async function duplicate(v: HeroVariant) {
    const nv: HeroVariant = { ...v, id: newId("var"), nome: v.nome + " (cópia)", peso: 50 };
    await set("hero_variants", nv.id, nv);
    toast.success("Variante duplicada.");
    reload();
  }

  async function addVariant(segmentId: string) {
    const nv: HeroVariant = {
      id: newId("var"), segment_id: segmentId, nome: "Nova variante",
      ativo: true, peso: 50, eyebrow: "", h1: "", sub: "", cta_texto: "Fazer minha análise gratuita",
    };
    await set("hero_variants", nv.id, nv);
    toast.success("Variante criada.");
    reload();
  }

  async function declareWinner(segmentId: string, winnerId: string) {
    const segVars = variants.filter((v) => v.segment_id === segmentId);
    for (const v of segVars) {
      await set("hero_variants", v.id, { ...v, ativo: v.id === winnerId, peso: v.id === winnerId ? 100 : 0 });
    }
    broadcast();
    toast.success("Vencedora declarada.");
    reload();
  }

  async function resetStats(segmentId: string) {
    const segVars = variants.filter((v) => v.segment_id === segmentId);
    for (const v of segVars) await remove("ab_stats", v.id);
    toast.success("Estatísticas resetadas.");
    reload();
  }

  return (
    <>
      <PageHeader
        title="Teste A/B"
        description="Variantes de Hero por segmento, com pesos, placar e ações de vencedora."
      />

      {segments.map((s) => {
        const segVars = variants.filter((v) => v.segment_id === s.id);
        const ranked = segVars.map((v) => {
          const st = stats.find((x) => x.variant_id === v.id);
          const imp = st?.impressions ?? 0;
          const conv = st?.conversions ?? 0;
          return { v, imp, conv, rate: imp > 0 ? conv / imp : 0 };
        }).sort((a, b) => b.rate - a.rate);
        const leaderId = ranked[0]?.v.id;
        const sumActiveWeights = segVars.filter((v) => v.ativo).reduce((a, v) => a + (v.peso || 0), 0);

        return (
          <div key={s.id} className="mb-6 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">{s.nome}</h2>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => addVariant(s.id)} className="gap-1.5">
                  <Plus className="h-3.5 w-3.5" /> Nova variante
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="ghost" className="gap-1.5 text-slate-600">
                      <RotateCcw className="h-3.5 w-3.5" /> Resetar estatísticas
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Resetar estatísticas de {s.nome}?</AlertDialogTitle>
                      <AlertDialogDescription>Zera impressões e conversões de todas as variantes deste segmento.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => resetStats(s.id)}>Resetar</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

            {/* Placar */}
            <SectionCard title="Placar">
              {segVars.length === 0 ? (
                <p className="text-sm text-slate-500">Nenhuma variante criada ainda.</p>
              ) : (
                <div className="overflow-x-auto -mx-5">
                  <table className="w-full text-sm">
                    <thead className="text-xs uppercase text-slate-500 text-left border-b border-slate-200">
                      <tr>
                        <th className="px-5 py-2">Variante</th><th className="py-2 text-right">Peso</th>
                        <th className="py-2 text-right">Impressões</th><th className="py-2 text-right">Conversões</th>
                        <th className="py-2 text-right">Taxa</th><th className="py-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {ranked.map(({ v, imp, conv, rate }) => {
                        const isLeader = v.id === leaderId && imp > 0;
                        const lowSample = imp < 100;
                        return (
                          <tr key={v.id} className={`border-b border-slate-100 ${isLeader ? "bg-amber-50" : ""}`}>
                            <td className="px-5 py-2">
                              <div className="flex items-center gap-2">
                                {isLeader && <Trophy className="h-4 w-4 text-amber-500" />}
                                <span className="font-medium">{v.nome}</span>
                                {!v.ativo && <span className="text-[10px] uppercase text-slate-400">pausada</span>}
                              </div>
                              <div className="text-xs text-slate-500 line-clamp-1">{v.h1}</div>
                            </td>
                            <td className="py-2 text-right">{v.peso}</td>
                            <td className="py-2 text-right">{imp}</td>
                            <td className="py-2 text-right">{conv}</td>
                            <td className="py-2 text-right font-semibold">{(rate * 100).toFixed(1)}%
                              {lowSample && imp > 0 && (
                                <div className="text-[10px] text-amber-600 font-normal">amostra pequena</div>
                              )}
                            </td>
                            <td className="py-2 text-right pr-3">
                              {!isLeader && imp > 0 && (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button size="sm" variant="outline">Declarar vencedora</Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Declarar {v.nome} como vencedora?</AlertDialogTitle>
                                      <AlertDialogDescription>Coloca em peso 100 e pausa as demais variantes deste segmento.</AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => declareWinner(s.id, v.id)}>Declarar</AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
              {sumActiveWeights > 0 && sumActiveWeights !== 100 && (
                <p className="mt-3 text-xs text-amber-700">
                  Os pesos das variantes ativas somam {sumActiveWeights}. O motor normaliza automaticamente, para sortear 50/50, defina 50 em cada.
                </p>
              )}
            </SectionCard>

            {/* Edição das variantes */}
            <div className="grid lg:grid-cols-2 gap-3">
              {segVars.map((v) => (
                <VariantEditor key={v.id} variant={v}
                  onSave={saveVariant}
                  onDuplicate={() => duplicate(v)}
                  onDelete={() => delVariant(v.id)} />
              ))}
            </div>
          </div>
        );
      })}
    </>
  );
}

function VariantEditor({ variant, onSave, onDuplicate, onDelete }: {
  variant: HeroVariant;
  onSave: (v: HeroVariant) => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const [d, setD] = useState(variant);
  useEffect(() => setD(variant), [variant]);

  return (
    <SectionCard>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Switch checked={d.ativo} onCheckedChange={(v) => setD({ ...d, ativo: v })} />
          <span className="text-sm">{d.ativo ? "ativa" : "pausada"}</span>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" className="gap-1.5" onClick={onDuplicate}>
            <Copy className="h-3.5 w-3.5" /> Duplicar
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-rose-600"><Trash2 className="h-3.5 w-3.5" /></Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir variante?</AlertDialogTitle>
                <AlertDialogDescription>As estatísticas também serão apagadas.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={onDelete}>Excluir</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <Label className="text-xs text-slate-500">Nome interno</Label>
          <Input value={d.nome} onChange={(e) => setD({ ...d, nome: e.target.value })} className="mt-1" />
        </div>
        <div>
          <Label className="text-xs text-slate-500">Peso (0–100)</Label>
          <Input type="number" min={0} max={100} value={d.peso}
            onChange={(e) => setD({ ...d, peso: Math.max(0, Math.min(100, Number(e.target.value) || 0)) })} className="mt-1" />
        </div>
        <div>
          <Label className="text-xs text-slate-500">CTA</Label>
          <Input value={d.cta_texto} onChange={(e) => setD({ ...d, cta_texto: e.target.value })} className="mt-1" />
        </div>
        <div className="col-span-2">
          <Label className="text-xs text-slate-500">Eyebrow</Label>
          <Input value={d.eyebrow} onChange={(e) => setD({ ...d, eyebrow: e.target.value })} className="mt-1" />
        </div>
        <div className="col-span-2">
          <Label className="text-xs text-slate-500">H1</Label>
          <Textarea rows={2} value={d.h1} onChange={(e) => setD({ ...d, h1: e.target.value })} className="mt-1" />
        </div>
        <div className="col-span-2">
          <Label className="text-xs text-slate-500">Subtítulo</Label>
          <Textarea rows={2} value={d.sub} onChange={(e) => setD({ ...d, sub: e.target.value })} className="mt-1" />
        </div>
        <div className="col-span-2">
          <Label className="text-xs text-slate-500">Imagem do Hero (opcional)</Label>
          <div className="mt-1">
            <ImageUploader
              value={d.imagem ?? ""}
              onChange={(url) => setD({ ...d, imagem: url })}
              folder="ab"
              filenameHint={`variant-${d.id || "hero"}`}
            />
          </div>
        </div>
      </div>

      <div className="mt-3 text-right">
        <Button onClick={() => onSave(d)} className="bg-amber-400 text-slate-900 hover:bg-amber-500" size="sm">Salvar</Button>
      </div>
    </SectionCard>
  );
}
