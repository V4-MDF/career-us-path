import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, BarChart3, Flame } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PageHeader, StatCard, SectionCard } from "@/components/admin/ui";
import { list } from "@/lib/dataStore";
import { ensureSeed, type AbStats, type HeroVariant, type Segment } from "@/lib/segments";
import type { LeadInput } from "@/lib/leadScoring";
import type { PartialLead } from "@/components/site/LeadFormProgressive";
import {
  loadModel, computeScore, TONE_BAR, TONE_CLASS, FUNNEL_LABEL,
  type ScoringModel, type FunnelStatus,
} from "@/lib/scoring";

export const Route = createFileRoute("/admin/")({
  component: DashboardPage,
});

type StoredLead = LeadInput & {
  id: string;
  createdAt: string;
  segmento?: string;
  status?: FunnelStatus;
};

function DashboardPage() {
  const [leads, setLeads] = useState<StoredLead[]>([]);
  const [partials, setPartials] = useState<PartialLead[]>([]);
  const [model, setModel] = useState<ScoringModel | null>(null);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [variants, setVariants] = useState<HeroVariant[]>([]);
  const [stats, setStats] = useState<AbStats[]>([]);

  useEffect(() => {
    (async () => {
      await ensureSeed();
      setLeads(await list<StoredLead>("leads"));
      setPartials(await list<PartialLead>("leads_partial"));
      setModel(await loadModel());
      setSegments(await list<Segment>("segments"));
      setVariants(await list<HeroVariant>("hero_variants"));
      setStats(await list<AbStats>("ab_stats"));
    })();
  }, []);

  const scored = useMemo(() => {
    if (!model) return [] as Array<StoredLead & { score: number; bandId: string; tone: "hot" | "warm" | "cool" | "cold"; bandLabel: string }>;
    return leads.map((l) => {
      const c = computeScore(l, model);
      return { ...l, score: c.score, bandId: c.band.id, tone: c.band.tone, bandLabel: c.band.label };
    });
  }, [leads, model]);

  const total = scored.length;
  const prio = scored.filter((l) => l.bandId === "prioritario").length;
  const weekAgo = Date.now() - 7 * 86400000;
  const weekly = scored.filter((l) => new Date(l.createdAt).getTime() >= weekAgo).length;
  const partialsWeek = partials.filter((p) => new Date(p.updatedAt).getTime() >= weekAgo).length;
  const startedTotal = total + partials.length;
  const completionRate = startedTotal > 0 ? Math.round((total / startedTotal) * 100) : 0;

  const bySeg = new Map<string, number>();
  scored.forEach((l) => { if (l.segmento) bySeg.set(l.segmento, (bySeg.get(l.segmento) ?? 0) + 1); });

  const topLeads = [...scored].sort((a, b) => b.score - a.score).slice(0, 5);

  // Líder A/B por segmento
  const leaders = segments.map((s) => {
    const segVars = variants.filter((v) => v.segment_id === s.id);
    const ranked = segVars
      .map((v) => {
        const st = stats.find((x) => x.variant_id === v.id);
        const imp = st?.impressions ?? 0;
        const conv = st?.conversions ?? 0;
        return { v, imp, conv, rate: imp > 0 ? conv / imp : 0 };
      })
      .sort((a, b) => b.rate - a.rate);
    return { segment: s, leader: ranked[0], all: ranked };
  });

  return (
    <>
      <div className="mb-6 flex gap-3 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
        <div>
          <strong>Modo validação (localStorage):</strong> leads são por navegador e não sincronizam entre
          dispositivos. <span className="opacity-80">Migrar para Supabase antes de tráfego pago.</span>
        </div>
      </div>

      <PageHeader title="Dashboard" description="Captação, qualidade de perfil e teste A/B." />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard label="Leads (total)" value={total} accent="blue" />
        <StatCard label="Prioritários" value={`${prio}${total ? ` · ${Math.round((prio/total)*100)}%` : ""}`} accent="green" />
        <StatCard label="Leads na semana" value={weekly} accent="gold" />
        <StatCard label="Segmentos ativos" value={segments.filter((s) => s.ativo).length} accent="gray" />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard label="Incompletos (7d)" value={partialsWeek} accent="yellow" hint={`${partials.length} no total`} />
        <StatCard
          label="Taxa de conclusão" value={`${completionRate}%`} accent="green"
          hint={`${total} de ${startedTotal} iniciados`}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <SectionCard title="Conversões por segmento">
          {segments.length === 0 ? (
            <p className="text-sm text-slate-500">Nenhum segmento ainda.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {segments.map((s) => (
                <li key={s.id} className="py-2.5 flex items-center justify-between text-sm">
                  <Link to="/admin/segmentos" className="hover:text-amber-600">{s.nome}</Link>
                  <span className="font-semibold">{bySeg.get(s.id) ?? 0}</span>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard
          title="Líder A/B por segmento"
          description="Variante com maior taxa de conversão (conv ÷ impressões)."
        >
          <ul className="divide-y divide-slate-100">
            {leaders.map(({ segment, leader, all }) => (
              <li key={segment.id} className="py-2.5 text-sm flex items-start justify-between gap-3">
                <div>
                  <div className="font-medium text-slate-800">{segment.nome}</div>
                  {leader ? (
                    <div className="text-xs text-slate-500">
                      <BarChart3 className="inline h-3 w-3 mr-1" />
                      {leader.v.nome} · {leader.imp} imp · {leader.conv} conv
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400">sem variantes</div>
                  )}
                </div>
                <div className="text-right">
                  <div className="font-semibold text-amber-600">
                    {leader ? `${(leader.rate * 100).toFixed(1)}%` : "—"}
                  </div>
                  <div className="text-[10px] text-slate-400">{all.length} variantes</div>
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>

      <div className="mt-5">
        <SectionCard title="Top 5 leads por pontuação" description="Worklist priorizada por aderência de perfil ao EB-2 NIW.">
          {topLeads.length === 0 ? (
            <p className="text-sm text-slate-500">Ainda sem leads. Os envios do formulário aparecerão aqui.</p>
          ) : (
            <div className="overflow-x-auto -mx-5">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-2 w-[140px]">Pontuação</th>
                    <th className="py-2">Nome</th>
                    <th className="py-2">Profissão</th>
                    <th className="py-2">Segmento</th>
                    <th className="py-2">Status</th>
                    <th className="py-2 text-right">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {topLeads.map((l) => (
                    <tr key={l.id} className="border-b border-slate-100">
                      <td className="px-5 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="text-lg font-semibold tabular-nums w-8 text-right">{l.score}</div>
                          <div className="flex-1 min-w-[60px]">
                            <div className="h-1.5 bg-slate-100 rounded">
                              <div className={`h-full rounded ${TONE_BAR[l.tone]}`} style={{ width: `${l.score}%` }} />
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 font-medium">{l.nome}</td>
                      <td className="py-2.5 text-slate-600">{l.profissao}</td>
                      <td className="py-2.5 text-slate-600">{l.segmento ?? "—"}</td>
                      <td className="py-2.5">
                        <Badge variant="outline" className={`text-[10px] ${TONE_CLASS[l.tone]}`}>
                          <Flame className="h-3 w-3 mr-1" /> {l.bandLabel}
                        </Badge>
                        <span className="ml-2 text-xs text-slate-500">{FUNNEL_LABEL[l.status ?? "novo"]}</span>
                      </td>
                      <td className="py-2.5 text-right text-slate-500 text-xs">{new Date(l.createdAt).toLocaleDateString("pt-BR")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="mt-3 text-right">
            <Link to="/admin/leads" className="text-xs text-amber-600 hover:underline">Ver todos os leads →</Link>
          </div>
        </SectionCard>
      </div>
    </>
  );
}
