/**
 * /admin/origens, resumo de métricas por canal.
 *
 * Agrega SESSÕES (visitantes do site), leads completos + parciais por:
 *   - utm_source, utm_medium, utm_campaign
 *   - referrer externo (host)
 *   - página interna anterior (from_path) / landing_path
 *
 * Métricas por bucket:
 *   - Sessões (visitantes únicos por aba)
 *   - Iniciados (sessões que começaram o form OU leads sem sessão histórica)
 *   - Completos
 *   - Conv. sessão→lead = completos ÷ sessões
 *   - Conv. lead→completo = completos ÷ iniciados
 *   - Qualificados = leads com qualification="qualificado" OU score ≥ 70
 *   - Taxa de qualidade = qualificados ÷ sessões
 *   - Score médio (modelo ao vivo)
 *
 * Tudo derivado em runtime do dataStore (localStorage).
 */
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Download, Compass, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, StatCard, SectionCard } from "@/components/admin/ui";
import { list } from "@/lib/dataStore";
import type { LeadInput } from "@/lib/leadScoring";
import type { LeadOrigin } from "@/lib/origin";
import type { PartialLead } from "@/components/site/LeadFormProgressive";
import type { SessionRecord } from "@/lib/sessions";
import { loadModel, computeScore, type ScoringModel } from "@/lib/scoring";
import { downloadCsv } from "@/lib/admin/csv";

export const Route = createFileRoute("/admin/origens")({ component: OrigensPage });

type StoredLead = LeadInput & {
  id: string;
  createdAt: string;
  utm?: Record<string, string>;
  origin?: LeadOrigin;
  segmento?: string;
  qualification?: "qualificado" | "nao_qualificado";
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

function unifyOrigin(o?: Partial<LeadOrigin> | null, fallbackUtm?: Record<string, string>): LeadOrigin {
  const utm = (o?.utm ?? fallbackUtm ?? {}) as LeadOrigin["utm"];
  const internal = (o?.internal ?? {
    from_path: null, from_title: null, referrer: null, landing_path: null, landing_ts: null,
  }) as LeadOrigin["internal"];
  return { utm, internal };
}

function refHost(referrer: string | null | undefined): string | null {
  if (!referrer) return null;
  try { return new URL(referrer).host; } catch { return referrer; }
}

function bucketValue(dim: Dim, origin?: LeadOrigin | null): string {
  const utm = origin?.utm ?? {};
  const internal = origin?.internal ?? ({} as LeadOrigin["internal"]);
  switch (dim) {
    case "utm_source":   return utm.utm_source   || DIRECT;
    case "utm_medium":   return utm.utm_medium   || DIRECT;
    case "utm_campaign": return utm.utm_campaign || DIRECT;
    case "referrer":     return refHost(internal.referrer) || DIRECT;
    case "from_path":    return internal.from_path || internal.landing_path || DIRECT;
  }
}

interface Row {
  bucket: string;
  sessions: number;
  started: number;
  completed: number;
  qualified: number;
  avgScore: number | null;
  rateSessionToLead: number; // completed / sessions
  rateStartToLead: number;   // completed / started
  qualityRate: number;       // qualified / sessions
}

function pct(n: number): string {
  return `${Math.round(n * 100)}%`;
}

function OrigensPage() {
  const [leads, setLeads] = useState<StoredLead[]>([]);
  const [partials, setPartials] = useState<PartialLead[]>([]);
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [model, setModel] = useState<ScoringModel | null>(null);
  const [dim, setDim] = useState<Dim>("utm_source");

  useEffect(() => {
    (async () => {
      setLeads(await list<StoredLead>("leads"));
      setPartials(await list<PartialLead>("leads_partial"));
      setSessions(await list<SessionRecord>("sessions"));
      setModel(await loadModel());
    })();
  }, []);

  // Totais
  const sessionsTotal = sessions.length;
  const startedTotal = leads.length + partials.length;
  const completedTotal = leads.length;
  const qualifiedTotal = useMemo(() => {
    if (!model) return 0;
    return leads.filter((l) => {
      const s = computeScore(l, model).score;
      return l.qualification === "qualificado" || s >= 70;
    }).length;
  }, [leads, model]);

  const convSessionToLead = sessionsTotal ? completedTotal / sessionsTotal : 0;
  const convStartToLead = startedTotal ? completedTotal / startedTotal : 0;
  const avgScoreTotal = useMemo(() => {
    if (!model || leads.length === 0) return null;
    const sum = leads.reduce((acc, l) => acc + computeScore(l, model).score, 0);
    return Math.round(sum / leads.length);
  }, [leads, model]);

  const rowsByDim = useMemo<Row[]>(() => {
    if (!model) return [];
    interface Bucket {
      sessions: number;
      started: number;
      completed: number;
      qualified: number;
      scoreSum: number;
      scoreN: number;
    }
    const buckets = new Map<string, Bucket>();
    const ensure = (key: string): Bucket => {
      const cur = buckets.get(key) ?? { sessions: 0, started: 0, completed: 0, qualified: 0, scoreSum: 0, scoreN: 0 };
      buckets.set(key, cur);
      return cur;
    };
    sessions.forEach((s) => {
      ensure(bucketValue(dim, s.origin)).sessions += 1;
    });
    leads.forEach((l) => {
      const o = unifyOrigin(l.origin, l.utm);
      const score = computeScore(l, model).score;
      const isQual = l.qualification === "qualificado" || score >= 70;
      const b = ensure(bucketValue(dim, o));
      b.started += 1;
      b.completed += 1;
      if (isQual) b.qualified += 1;
      b.scoreSum += score;
      b.scoreN += 1;
    });
    partials.forEach((p) => {
      ensure(bucketValue(dim, p.origin)).started += 1;
    });
    return Array.from(buckets.entries())
      .map(([bucket, v]) => ({
        bucket,
        sessions: v.sessions,
        started: v.started,
        completed: v.completed,
        qualified: v.qualified,
        avgScore: v.scoreN ? Math.round(v.scoreSum / v.scoreN) : null,
        rateSessionToLead: v.sessions ? v.completed / v.sessions : 0,
        rateStartToLead: v.started ? v.completed / v.started : 0,
        qualityRate: v.sessions ? v.qualified / v.sessions : 0,
      }))
      .sort((a, b) => b.completed - a.completed || b.sessions - a.sessions);
  }, [sessions, leads, partials, model, dim]);

  const distinctChannels = rowsByDim.filter((r) => r.bucket !== DIRECT).length;

  const historyWarn = sessionsTotal > 0 && sessionsTotal < completedTotal;

  const exportCsv = () => {
    downloadCsv(
      `origens-${dim}-${new Date().toISOString().slice(0,10)}.csv`,
      rowsByDim.map((r) => ({
        dimensao: DIM_LABEL[dim],
        valor: r.bucket,
        sessoes: r.sessions,
        iniciados: r.started,
        completados: r.completed,
        qualificados: r.qualified,
        conv_sessao_para_lead_pct: (r.rateSessionToLead * 100).toFixed(1),
        conv_inicio_para_lead_pct: (r.rateStartToLead * 100).toFixed(1),
        taxa_qualidade_pct: (r.qualityRate * 100).toFixed(1),
        score_medio: r.avgScore ?? "",
      })),
    );
  };

  return (
    <>
      <PageHeader
        title="Origens & Canais"
        description="Sessões, conversão e qualidade por UTM, referrer e página interna de origem."
        actions={
          <Button variant="outline" size="sm" onClick={exportCsv} className="gap-1.5">
            <Download className="h-3.5 w-3.5" /> Exportar CSV
          </Button>
        }
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard label="Sessões (total)" value={sessionsTotal} accent="blue" hint="Visitantes únicos por aba" />
        <StatCard
          label="Conv. sessão → lead"
          value={sessionsTotal ? pct(convSessionToLead) : "-"}
          accent="green"
          hint={`${completedTotal} leads completos`}
        />
        <StatCard
          label="Conv. início → completo"
          value={startedTotal ? pct(convStartToLead) : "-"}
          accent="gold"
          hint={`${startedTotal} formulários iniciados`}
        />
        <StatCard
          label="Taxa de qualidade"
          value={sessionsTotal ? pct(qualityRateTotal) : "-"}
          accent="yellow"
          hint={`${qualifiedTotal} qualificados ÷ sessões`}
        />
      </div>

      {historyWarn && (
        <div className="mb-4 flex items-start gap-2 rounded-md border border-amber-300/60 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          <Info className="h-3.5 w-3.5 mt-0.5" />
          <span>
            Há mais leads do que sessões rastreadas, o rastreio de sessões começa a partir
            do deploy deste módulo. Leads antigos aparecem como "sem sessão".
          </span>
        </div>
      )}

      <SectionCard
        title="Comparativo por dimensão"
        description={`Canais distintos: ${distinctChannels} · Qualificado = qualification "qualificado" OU score ≥ 70.`}
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
            Sem dados suficientes para esta dimensão ainda.
          </div>
        ) : (
          <div className="overflow-x-auto -mx-5">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-2">{DIM_LABEL[dim]}</th>
                  <th className="py-2 text-right">Sessões</th>
                  <th className="py-2 text-right">Iniciados</th>
                  <th className="py-2 text-right">Completos</th>
                  <th className="py-2 text-right">Qualif.</th>
                  <th className="py-2 w-[180px]">Conv. sessão→lead</th>
                  <th className="py-2 text-right">Conv. início→lead</th>
                  <th className="py-2 text-right">Taxa qualidade</th>
                  <th className="py-2 text-right pr-5">Score médio</th>
                </tr>
              </thead>
              <tbody>
                {rowsByDim.map((r) => {
                  const pSL = Math.round(r.rateSessionToLead * 100);
                  return (
                    <tr key={r.bucket} className="border-b border-slate-100">
                      <td className="px-5 py-2.5 font-medium text-slate-800 max-w-[240px] truncate" title={r.bucket}>
                        {r.bucket}
                      </td>
                      <td className="py-2.5 text-right tabular-nums">{r.sessions}</td>
                      <td className="py-2.5 text-right tabular-nums">{r.started}</td>
                      <td className="py-2.5 text-right tabular-nums">{r.completed}</td>
                      <td className="py-2.5 text-right tabular-nums text-emerald-700 font-medium">{r.qualified}</td>
                      <td className="py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-slate-100 rounded overflow-hidden">
                            <div
                              className="h-full bg-emerald-500"
                              style={{ width: `${Math.min(pSL, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs tabular-nums w-10 text-right">{r.sessions ? `${pSL}%` : "-"}</span>
                        </div>
                      </td>
                      <td className="py-2.5 text-right tabular-nums">
                        {r.started ? `${Math.round(r.rateStartToLead * 100)}%` : "-"}
                      </td>
                      <td className="py-2.5 text-right tabular-nums">
                        {r.sessions ? `${Math.round(r.qualityRate * 100)}%` : "-"}
                      </td>
                      <td className="py-2.5 text-right pr-5 tabular-nums text-slate-700">
                        {r.avgScore ?? "-"}
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
