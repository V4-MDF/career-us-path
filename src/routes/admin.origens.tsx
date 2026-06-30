/**
 * /admin/origens — resumo de métricas por canal.
 *
 * Agrega leads completos + parciais por:
 *   - utm_source
 *   - utm_medium
 *   - utm_campaign
 *   - referrer externo (host)
 *   - página interna anterior (from_path) / landing_path
 *
 * Para cada bucket calcula: iniciados, completados, taxa de conversão,
 * pontuação média (modelo ao vivo) e participação no total.
 *
 * Tudo derivado em runtime do dataStore (localStorage). Nenhuma escrita.
 */
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Download, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, StatCard, SectionCard } from "@/components/admin/ui";
import { list } from "@/lib/dataStore";
import type { LeadInput } from "@/lib/leadScoring";
import type { LeadOrigin } from "@/lib/origin";
import type { PartialLead } from "@/components/site/LeadFormProgressive";
import { loadModel, computeScore, type ScoringModel } from "@/lib/scoring";
import { downloadCsv } from "@/lib/admin/csv";

export const Route = createFileRoute("/admin/origens")({ component: OrigensPage });

type StoredLead = LeadInput & {
  id: string;
  createdAt: string;
  utm?: Record<string, string>;
  origin?: LeadOrigin;
  segmento?: string;
};

type Dim = "utm_source" | "utm_medium" | "utm_campaign" | "referrer" | "from_path";

const DIM_LABEL: Record<Dim, string> = {
  utm_source: "utm_source",
  utm_medium: "utm_medium",
  utm_campaign: "utm_campaign",
  referrer: "Referrer externo",
  from_path: "Página interna anterior",
};

const DIRECT = "(direto / sem origem)";

/** Normaliza um lead/partial para um objeto de origem unificado. */
function unifyOrigin(o?: LeadOrigin, fallbackUtm?: Record<string, string>): LeadOrigin {
  if (o) return o;
  return {
    utm: fallbackUtm ?? {},
    internal: { from_path: null, from_title: null, referrer: null, landing_path: null, landing_ts: null },
  };
}

function refHost(referrer: string | null): string | null {
  if (!referrer) return null;
  try { return new URL(referrer).host; } catch { return referrer; }
}

function bucketValue(dim: Dim, origin: LeadOrigin): string {
  switch (dim) {
    case "utm_source":   return origin.utm.utm_source   || DIRECT;
    case "utm_medium":   return origin.utm.utm_medium   || DIRECT;
    case "utm_campaign": return origin.utm.utm_campaign || DIRECT;
    case "referrer":     return refHost(origin.internal.referrer) || DIRECT;
    case "from_path":    return origin.internal.from_path || origin.internal.landing_path || DIRECT;
  }
}

interface Row {
  bucket: string;
  started: number;
  completed: number;
  avgScore: number | null;
  rate: number; // 0..1
}

function OrigensPage() {
  const [leads, setLeads] = useState<StoredLead[]>([]);
  const [partials, setPartials] = useState<PartialLead[]>([]);
  const [model, setModel] = useState<ScoringModel | null>(null);
  const [dim, setDim] = useState<Dim>("utm_source");

  useEffect(() => {
    (async () => {
      setLeads(await list<StoredLead>("leads"));
      setPartials(await list<PartialLead>("leads_partial"));
      setModel(await loadModel());
    })();
  }, []);

  // Cada "iniciado" é UM lead único: completos OU parciais (sem dupla contagem,
  // já que LeadFormProgressive remove o parcial ao concluir).
  const startedTotal = leads.length + partials.length;
  const completedTotal = leads.length;
  const convTotal = startedTotal ? completedTotal / startedTotal : 0;

  const rowsByDim = useMemo<Row[]>(() => {
    if (!model) return [];
    const buckets = new Map<string, { started: number; completed: number; scoreSum: number; scoreN: number }>();
    const bump = (key: string, isCompleted: boolean, score: number | null) => {
      const cur = buckets.get(key) ?? { started: 0, completed: 0, scoreSum: 0, scoreN: 0 };
      cur.started += 1;
      if (isCompleted) cur.completed += 1;
      if (score != null) { cur.scoreSum += score; cur.scoreN += 1; }
      buckets.set(key, cur);
    };
    leads.forEach((l) => {
      const o = unifyOrigin(l.origin, l.utm);
      const s = computeScore(l, model).score;
      bump(bucketValue(dim, o), true, s);
    });
    partials.forEach((p) => {
      bump(bucketValue(dim, p.origin), false, null);
    });
    return Array.from(buckets.entries())
      .map(([bucket, v]) => ({
        bucket,
        started: v.started,
        completed: v.completed,
        avgScore: v.scoreN ? Math.round(v.scoreSum / v.scoreN) : null,
        rate: v.started ? v.completed / v.started : 0,
      }))
      .sort((a, b) => b.completed - a.completed || b.started - a.started);
  }, [leads, partials, model, dim]);

  // KPIs auxiliares: melhor canal por taxa (min 3 iniciados).
  const bestRate = useMemo(() => {
    const eligible = rowsByDim.filter((r) => r.started >= 3);
    if (!eligible.length) return null;
    return [...eligible].sort((a, b) => b.rate - a.rate)[0];
  }, [rowsByDim]);

  const distinctChannels = rowsByDim.filter((r) => r.bucket !== DIRECT).length;

  const exportCsv = () => {
    downloadCsv(
      `origens-${dim}-${new Date().toISOString().slice(0,10)}.csv`,
      rowsByDim.map((r) => ({
        dimensao: DIM_LABEL[dim],
        valor: r.bucket,
        iniciados: r.started,
        completados: r.completed,
        taxa_conversao_pct: (r.rate * 100).toFixed(1),
        score_medio: r.avgScore ?? "",
      })),
    );
  };

  return (
    <>
      <PageHeader
        title="Origens & Canais"
        description="Comparativo de conversão por UTM, referrer e página interna de origem."
        actions={
          <Button variant="outline" size="sm" onClick={exportCsv} className="gap-1.5">
            <Download className="h-3.5 w-3.5" /> Exportar CSV
          </Button>
        }
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard label="Iniciados (total)" value={startedTotal} accent="blue" />
        <StatCard
          label="Completados"
          value={`${completedTotal}${startedTotal ? ` · ${Math.round(convTotal * 100)}%` : ""}`}
          accent="green"
          hint="Conversão geral"
        />
        <StatCard label="Canais distintos" value={distinctChannels} accent="gold" hint={`Dimensão: ${DIM_LABEL[dim]}`} />
        <StatCard
          label="Melhor canal"
          value={bestRate ? `${(bestRate.rate * 100).toFixed(0)}%` : "—"}
          accent="yellow"
          hint={bestRate ? bestRate.bucket : "Min. 3 iniciados"}
        />
      </div>

      <SectionCard
        title="Comparativo por dimensão"
        description="Inclui leads completos e parciais. Conversão = completados ÷ iniciados."
      >
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="text-xs uppercase tracking-wider text-slate-500">Agrupar por:</span>
          {(Object.keys(DIM_LABEL) as Dim[]).map((d) => (
            <button
              key={d}
              onClick={() => setDim(d)}
              className={`px-3 py-1.5 rounded-md text-xs border transition-colors ${
                dim === d
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-700 border-slate-200 hover:border-slate-400"
              }`}
            >
              {DIM_LABEL[d]}
            </button>
          ))}
        </div>

        {rowsByDim.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-500">
            <Compass className="mx-auto mb-2 h-6 w-6 text-slate-400" />
            Sem leads suficientes para esta dimensão ainda.
          </div>
        ) : (
          <div className="overflow-x-auto -mx-5">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-2">{DIM_LABEL[dim]}</th>
                  <th className="py-2 text-right">Iniciados</th>
                  <th className="py-2 text-right">Completados</th>
                  <th className="py-2 w-[220px]">Conversão</th>
                  <th className="py-2 text-right pr-5">Score médio</th>
                </tr>
              </thead>
              <tbody>
                {rowsByDim.map((r) => {
                  const pct = Math.round(r.rate * 100);
                  return (
                    <tr key={r.bucket} className="border-b border-slate-100">
                      <td className="px-5 py-2.5 font-medium text-slate-800 max-w-[280px] truncate" title={r.bucket}>
                        {r.bucket}
                      </td>
                      <td className="py-2.5 text-right tabular-nums">{r.started}</td>
                      <td className="py-2.5 text-right tabular-nums">{r.completed}</td>
                      <td className="py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-slate-100 rounded overflow-hidden">
                            <div
                              className="h-full bg-emerald-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-xs tabular-nums w-10 text-right">{pct}%</span>
                        </div>
                      </td>
                      <td className="py-2.5 text-right pr-5 tabular-nums text-slate-700">
                        {r.avgScore ?? "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </>
  );
}
