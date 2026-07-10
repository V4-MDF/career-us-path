/**
 * /admin/scoring. Configuração da pontuação de qualidade do perfil.
 *
 * - Edita PESOS (somam 100, normalização automática).
 * - Edita VALORES de aderência (0..1) por resposta de cada fator.
 * - Edita LIMIARES das faixas de prioridade (calor → frio).
 * - HISTOGRAMA ao vivo dos leads atuais (preview ao mexer nos pesos).
 *
 * Toda alteração é salva no dataStore e reflete imediatamente em /admin/leads
 * (repontuação ao vivo, score nunca é congelado por lead).
 *
 * Roadmap (Supabase + tracking por lead): adicionar segundo eixo
 * "pontuação de engajamento" (chegou em /avaliacao, retornos, tempo de
 * preenchimento, páginas vistas) e visão de matriz perfil × engajamento.
 * A estrutura de `scoring_model.factors` aceita fatores comportamentais
 * sem refatorar a função de cálculo.
 */
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { RotateCcw, Save, Info } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { PageHeader, SectionCard } from "@/components/admin/ui";
import { list } from "@/lib/dataStore";
import {
  loadModel, saveModel, DEFAULT_MODEL, computeScore, weightSum,
  histogram, TONE_BAR, TONE_CLASS,
  type ScoringModel, type Factor, type PriorityBand,
} from "@/lib/scoring";
import type { LeadInput } from "@/lib/leadScoring";

export const Route = createFileRoute("/admin/scoring")({ component: ScoringPage });

function ScoringPage() {
  const [model, setModel] = useState<ScoringModel | null>(null);
  const [leads, setLeads] = useState<LeadInput[]>([]);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    (async () => {
      setModel(await loadModel());
      setLeads(await list<LeadInput>("leads"));
    })();
  }, []);

  if (!model) return <div className="p-8 text-sm text-slate-500">Carregando…</div>;

  const sum = weightSum(model);

  const scores = leads.map((l) => computeScore(l, model).score);
  const hist = histogram(scores);

  function update(next: ScoringModel) {
    setModel(next);
    setDirty(true);
  }

  async function save() {
    if (!model) return;
    await saveModel(model);
    setDirty(false);
    toast.success("Modelo salvo. Leads repontuados.");
  }

  async function reset() {
    await saveModel({ ...DEFAULT_MODEL });
    setModel(await loadModel());
    setDirty(false);
    toast.success("Modelo restaurado para o padrão.");
  }

  return (
    <>
      <PageHeader
        title="Pontuação de qualidade"
        description="Ajuste pesos, aderências e faixas. O score de todos os leads é recalculado ao vivo."
        actions={
          <div className="flex gap-2">
            <Button variant="ghost" onClick={reset} className="gap-1.5">
              <RotateCcw className="h-4 w-4" /> Restaurar padrão
            </Button>
            <Button onClick={save} disabled={!dirty} className="gap-1.5">
              <Save className="h-4 w-4" /> Salvar modelo
            </Button>
          </div>
        }
      />

      <div className="mb-5 flex gap-3 rounded-md border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
        <Info className="h-4 w-4 mt-0.5 shrink-0" />
        <div>
          A pontuação mede a <strong>aderência do perfil</strong> ao EB-2 NIW. Ela <strong>prioriza
          e diagnostica</strong>, não é uma classe fixa. Ajuste os pesos conforme aprender o que converte.
        </div>
      </div>

      <SectionCard
        title="Pesos por fator"
        description={`Soma atual: ${sum} (normalizada para 100 no cálculo).`}
      >
        <div className="space-y-4">
          {model.factors.map((f, i) => (
            <div key={f.key} className="grid grid-cols-12 items-center gap-3">
              <div className="col-span-3 text-sm font-medium">{f.label}</div>
              <div className="col-span-7">
                <Slider
                  value={[f.peso]}
                  min={0} max={50} step={1}
                  onValueChange={(v) => {
                    const next = { ...model };
                    next.factors = [...model.factors];
                    next.factors[i] = { ...f, peso: v[0] };
                    update(next);
                  }}
                />
              </div>
              <div className="col-span-2 flex items-center gap-2">
                <Input
                  type="number" min={0} value={f.peso}
                  className="h-8 w-20 text-right"
                  onChange={(e) => {
                    const v = Math.max(0, Number(e.target.value) || 0);
                    const next = { ...model };
                    next.factors = [...model.factors];
                    next.factors[i] = { ...f, peso: v };
                    update(next);
                  }}
                />
                <span className="text-xs text-slate-500">
                  → {sum > 0 ? Math.round((f.peso / sum) * 100) : 0}%
                </span>
              </div>
            </div>
          ))}
          {sum === 0 && (
            <div className="text-xs text-rose-600">Todos os pesos zerados, score sairá sempre 0.</div>
          )}
        </div>
      </SectionCard>

      <div className="mt-5">
        <SectionCard
          title="Distribuição dos leads atuais"
          description={`${leads.length} leads · histograma em bins de 5 pts. Atualiza ao mexer nos pesos.`}
        >
          <Histogram bins={hist} model={model} />
        </SectionCard>
      </div>

      <div className="mt-5">
        <SectionCard
          title="Faixas de prioridade"
          description="Limiares ajustáveis. A faixa é só um recorte do score, a worklist é o score em si."
        >
          <div className="space-y-2">
            {model.faixas.map((b, i) => (
              <div key={b.id} className="grid grid-cols-12 items-center gap-3">
                <div className="col-span-3">
                  <Badge variant="outline" className={`text-[11px] ${TONE_CLASS[b.tone]}`}>{b.label}</Badge>
                </div>
                <div className="col-span-2 text-xs text-slate-500">score mínimo</div>
                <div className="col-span-2">
                  <Input
                    type="number" min={0} max={100} value={b.min}
                    className="h-8 w-20"
                    onChange={(e) => {
                      const v = Math.max(0, Math.min(100, Number(e.target.value) || 0));
                      const next = { ...model };
                      next.faixas = [...model.faixas];
                      next.faixas[i] = { ...b, min: v };
                      update(next);
                    }}
                  />
                </div>
                <div className="col-span-5">
                  <Input
                    value={b.label}
                    className="h-8"
                    onChange={(e) => {
                      const next = { ...model };
                      next.faixas = [...model.faixas];
                      next.faixas[i] = { ...b, label: e.target.value };
                      update(next);
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="mt-5">
        <SectionCard
          title="Valores de aderência por resposta"
          description="Calibração fina: o quanto cada resposta possível 'puxa' o score (0..1)."
        >
          <div className="space-y-6">
            {model.factors.map((f, i) => (
              <FactorEditor
                key={f.key}
                factor={f}
                onChange={(nf) => {
                  const next = { ...model };
                  next.factors = [...model.factors];
                  next.factors[i] = nf;
                  update(next);
                }}
              />
            ))}
          </div>
        </SectionCard>
      </div>

      {dirty && (
        <div className="fixed bottom-6 right-6 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 shadow-lg flex items-center gap-3">
          Alterações não salvas.
          <Button size="sm" onClick={save} className="gap-1.5"><Save className="h-3.5 w-3.5" /> Salvar</Button>
        </div>
      )}
    </>
  );
}

function FactorEditor({ factor, onChange }: { factor: Factor; onChange: (f: Factor) => void }) {
  const entries = Object.entries(factor.valores);
  return (
    <div>
      <div className="text-sm font-medium mb-2">{factor.label}</div>
      <div className="border border-slate-200 rounded-md overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider">
            <tr>
              <th className="text-left px-3 py-2">Resposta</th>
              <th className="text-left px-3 py-2">Chave</th>
              <th className="text-right px-3 py-2 w-32">Aderência (0..1)</th>
            </tr>
          </thead>
          <tbody>
            {entries.map(([k, v]) => (
              <tr key={k} className="border-t border-slate-100">
                <td className="px-3 py-2">{factor.labels[k] ?? k}</td>
                <td className="px-3 py-2 font-mono text-slate-500">{k}</td>
                <td className="px-3 py-2 text-right">
                  <Input
                    type="number" step="0.05" min={0} max={1} value={v}
                    className="h-7 w-24 text-right ml-auto"
                    onChange={(e) => {
                      const nv = Math.max(0, Math.min(1, Number(e.target.value) || 0));
                      onChange({ ...factor, valores: { ...factor.valores, [k]: nv } });
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Histogram({ bins, model }: { bins: number[]; model: ScoringModel }) {
  const max = Math.max(1, ...bins);
  // descobre o tom da faixa para cada bin (centro do bin)
  const sorted = [...model.faixas].sort((a, b) => b.min - a.min);
  const toneOf = (binIdx: number) => {
    const center = binIdx * 5 + 2.5;
    return (sorted.find((b) => center >= b.min) ?? sorted[sorted.length - 1]).tone;
  };
  return (
    <div>
      <div className="flex items-end gap-0.5 h-32">
        {bins.map((c, i) => (
          <div key={i} className="flex-1 flex flex-col justify-end" title={`${i * 5}–${i * 5 + 4}: ${c}`}>
            <div className={`rounded-t ${TONE_BAR[toneOf(i)]}`} style={{ height: `${(c / max) * 100}%`, minHeight: c > 0 ? 2 : 0 }} />
          </div>
        ))}
      </div>
      <div className="mt-1 flex justify-between text-[10px] text-slate-400 font-mono">
        <span>0</span><span>25</span><span>50</span><span>75</span><span>100</span>
      </div>
    </div>
  );
}

// silencia warning de import não usado em alguns paths
export const _useBand = (_: PriorityBand) => null;
