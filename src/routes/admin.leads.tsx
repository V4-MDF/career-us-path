/**
 * /admin/leads — pontuação de qualidade ao vivo (Prompt 7).
 *
 * - Score 0–100 DERIVADO em runtime via scoring.computeScore(lead, model).
 *   Nunca lê score "congelado" do lead. Trocar pesos em /admin/scoring
 *   repontua a lista inteira na hora.
 * - Faixa de prioridade (calor → frio) também derivada do modelo.
 * - Status (Novo · Em contato · Qualificado · Proposta · Convertido · Descartado)
 *   é MANUAL e independente do score (funil de vendas).
 */
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Download, Search, Flame } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { PageHeader, StatCard, SectionCard } from "@/components/admin/ui";
import { list, set } from "@/lib/dataStore";
import type { LeadOrigin } from "@/lib/origin";
import type { LeadInput } from "@/lib/leadScoring";
import {
  loadModel, computeScore, TONE_CLASS, TONE_BAR, FUNNEL_STATUSES, FUNNEL_LABEL,
  type ScoringModel, type FunnelStatus, type ComputedScore,
} from "@/lib/scoring";
import { downloadCsv } from "@/lib/admin/csv";

export const Route = createFileRoute("/admin/leads")({ component: LeadsPage });

/** Lead persistido — apenas respostas cruas + metadados. */
type StoredLead = LeadInput & {
  id: string;
  createdAt: string;
  utm?: Record<string, string>;
  origin?: LeadOrigin;
  segmento?: string;
  variante_ab?: string | null;
  status?: FunnelStatus;
  /** Legado de prompts anteriores (ignorado). */
  score?: number;
  classificacao?: string;
};

type ScoredRow = StoredLead & { _calc: ComputedScore };

function LeadsPage() {
  const [rows, setRows] = useState<StoredLead[]>([]);
  const [model, setModel] = useState<ScoringModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<StoredLead | null>(null);

  // filtros
  const [scoreRange, setScoreRange] = useState<[number, number]>([0, 100]);
  const [fStatus, setFStatus] = useState<string>("all");
  const [fSeg, setFSeg] = useState<string>("all");
  const [fUtm, setFUtm] = useState<string>("all");
  const [fProf, setFProf] = useState<string>("all");
  const [fFrom, setFFrom] = useState<string>("");
  const [fTo, setFTo] = useState<string>("");
  const [q, setQ] = useState<string>("");
  const [sortBy, setSortBy] = useState<"score" | "date" | "status">("score");

  async function reload() {
    setLoading(true);
    const [all, m] = await Promise.all([list<StoredLead>("leads"), loadModel()]);
    setRows(all);
    setModel(m);
    setLoading(false);
  }
  useEffect(() => { reload(); }, []);

  // Repontuação ao vivo: recomputa toda vez que mudam model ou rows.
  const scored: ScoredRow[] = useMemo(() => {
    if (!model) return [];
    return rows.map((r) => ({ ...r, _calc: computeScore(r, model) }));
  }, [rows, model]);

  const segments = useMemo(() => Array.from(new Set(rows.map((r) => r.segmento).filter(Boolean))) as string[], [rows]);
  const utms = useMemo(() => Array.from(new Set(rows.map((r) => r.utm?.utm_source).filter(Boolean))) as string[], [rows]);
  const profs = useMemo(() => Array.from(new Set(rows.map((r) => r.profissao).filter(Boolean))), [rows]);

  const filtered = useMemo(() => {
    const out = scored.filter((r) => {
      const s = r._calc.score;
      if (s < scoreRange[0] || s > scoreRange[1]) return false;
      if (fStatus !== "all" && (r.status ?? "novo") !== fStatus) return false;
      if (fSeg !== "all" && (r.segmento ?? "") !== fSeg) return false;
      if (fUtm !== "all" && (r.utm?.utm_source ?? "") !== fUtm) return false;
      if (fProf !== "all" && r.profissao !== fProf) return false;
      if (fFrom && new Date(r.createdAt) < new Date(fFrom)) return false;
      if (fTo) { const end = new Date(fTo); end.setHours(23,59,59,999); if (new Date(r.createdAt) > end) return false; }
      if (q) {
        const qq = q.toLowerCase();
        if (![r.nome, r.email, r.whatsapp, r.cidade].some((v) => v?.toLowerCase().includes(qq))) return false;
      }
      return true;
    });
    if (sortBy === "score") out.sort((a, b) => b._calc.score - a._calc.score);
    else if (sortBy === "date") out.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    else out.sort((a, b) => (a.status ?? "novo").localeCompare(b.status ?? "novo"));
    return out;
  }, [scored, scoreRange, fStatus, fSeg, fUtm, fProf, fFrom, fTo, q, sortBy]);

  const stats = useMemo(() => {
    const total = filtered.length;
    const prio = filtered.filter((r) => r._calc.band.id === "prioritario").length;
    const byStatus: Record<string, number> = {};
    FUNNEL_STATUSES.forEach((s) => (byStatus[s] = 0));
    filtered.forEach((r) => { byStatus[r.status ?? "novo"]++; });
    return { total, prio, pctPrio: total > 0 ? Math.round((prio / total) * 100) : 0, byStatus };
  }, [filtered]);

  async function setStatus(lead: StoredLead, status: FunnelStatus) {
    const next: StoredLead = { ...lead, status };
    await set("leads", lead.id, next);
    setRows((rs) => rs.map((r) => (r.id === lead.id ? next : r)));
    setOpen((o) => (o && o.id === lead.id ? next : o));
    toast.success(`Status: ${FUNNEL_LABEL[status]}`);
  }

  function exportCsv() {
    if (!model) return;
    downloadCsv(`leads_${new Date().toISOString().slice(0,10)}.csv`,
      filtered.map((l) => {
        const comp: Record<string, string> = {};
        l._calc.composicao.forEach((c) => {
          comp[`f_${c.key}_resposta`] = c.display;
          comp[`f_${c.key}_pontos`] = c.pontos.toFixed(1);
        });
        return {
          data: l.createdAt, nome: l.nome, email: l.email, whatsapp: l.whatsapp,
          profissao: l.profissao, faixa_etaria: l.faixaEtaria, formacao: l.formacao,
          cidade: l.cidade, uf: l.uf, renda: l.renda, momento: l.momento,
          pontuacao: l._calc.score, faixa: l._calc.band.label,
          status: l.status ?? "novo",
          segmento: l.segmento ?? "", variante_ab: l.variante_ab ?? "",
          utm_source: l.utm?.utm_source ?? "", utm_medium: l.utm?.utm_medium ?? "",
          utm_campaign: l.utm?.utm_campaign ?? "", utm_content: l.utm?.utm_content ?? "",
          utm_term: l.utm?.utm_term ?? "",
          ...comp,
        };
      }));
  }

  return (
    <>
      <PageHeader
        title="Leads"
        description="Pontuação de qualidade do perfil (0–100) derivada ao vivo do modelo em /admin/scoring."
        actions={
          <Button variant="outline" onClick={exportCsv} className="gap-1.5">
            <Download className="h-4 w-4" /> Exportar CSV
          </Button>
        }
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <StatCard label="Total filtrado" value={stats.total} accent="blue" />
        <StatCard label="% Prioritários" value={`${stats.pctPrio}%`} accent="green" />
        <StatCard label="Novos" value={stats.byStatus.novo ?? 0} accent="gray" />
        <StatCard label="Em contato + Qualificados" value={(stats.byStatus.em_contato ?? 0) + (stats.byStatus.qualificado ?? 0)} accent="gold" />
      </div>

      <SectionCard title="Filtros">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="lg:col-span-2">
            <label className="text-xs text-slate-500 flex justify-between">
              <span>Faixa de pontuação</span>
              <span className="font-mono text-slate-700">{scoreRange[0]} – {scoreRange[1]}</span>
            </label>
            <div className="mt-3 px-1">
              <Slider
                value={scoreRange}
                min={0} max={100} step={5}
                onValueChange={(v) => setScoreRange([v[0], v[1]] as [number, number])}
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-500">Buscar</label>
            <div className="relative mt-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input className="pl-8" placeholder="Nome, email, cidade…" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
          </div>
          <FilterSelect label="Status" value={fStatus} onChange={setFStatus}
            options={[["all","Todos"], ...FUNNEL_STATUSES.map((s) => [s, FUNNEL_LABEL[s]] as [string,string])]} />
          <FilterSelect label="Segmento" value={fSeg} onChange={setFSeg}
            options={[["all","Todos"], ...segments.map((s) => [s, s] as [string,string])]} />
          <FilterSelect label="utm_source" value={fUtm} onChange={setFUtm}
            options={[["all","Todas"], ...utms.map((s) => [s, s] as [string,string])]} />
          <FilterSelect label="Profissão" value={fProf} onChange={setFProf}
            options={[["all","Todas"], ...profs.map((s) => [s, s] as [string,string])]} />
          <div>
            <label className="text-xs text-slate-500">De</label>
            <Input type="date" className="mt-1" value={fFrom} onChange={(e) => setFFrom(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-slate-500">Até</label>
            <Input type="date" className="mt-1" value={fTo} onChange={(e) => setFTo(e.target.value)} />
          </div>
          <FilterSelect label="Ordenar por" value={sortBy} onChange={(v) => setSortBy(v as typeof sortBy)}
            options={[["score","Pontuação ↓"],["date","Data ↓"],["status","Status"]]} />
          <div className="flex items-end">
            <Button variant="ghost" className="text-slate-600"
              onClick={() => { setScoreRange([0,100]); setFStatus("all"); setFSeg("all"); setFUtm("all"); setFProf("all"); setFFrom(""); setFTo(""); setQ(""); }}>
              Limpar filtros
            </Button>
          </div>
        </div>
      </SectionCard>

      <div className="mt-5">
        <SectionCard>
          <div className="overflow-x-auto -mx-5">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-2 w-[180px]">Pontuação de qualidade do perfil</th>
                  <th className="py-2">Nome</th>
                  <th className="py-2">Profissão</th>
                  <th className="py-2">Segmento</th>
                  <th className="py-2">Variante</th>
                  <th className="py-2">utm_source</th>
                  <th className="py-2">Origem</th>
                  <th className="py-2 w-[180px]">Status</th>
                  <th className="py-2 text-right whitespace-nowrap">Data</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={9} className="px-5 py-8 text-center text-slate-400">Carregando…</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={9} className="px-5 py-8 text-center text-slate-400">Nenhum lead com esses filtros.</td></tr>
                ) : filtered.map((l) => (
                  <tr key={l.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-5 py-3 cursor-pointer" onClick={() => setOpen(l)}>
                      <ScoreCell calc={l._calc} />
                    </td>
                    <td className="py-3 font-medium cursor-pointer" onClick={() => setOpen(l)}>{l.nome}</td>
                    <td className="py-3 text-slate-600">{l.profissao}</td>
                    <td className="py-3 text-slate-600">{l.segmento ?? "—"}</td>
                    <td className="py-3 text-slate-600 text-xs">{l.variante_ab ?? "—"}</td>
                    <td className="py-3 text-slate-600">{l.utm?.utm_source ?? "—"}</td>
                    <td className="py-3 text-slate-600 text-xs max-w-[220px] truncate" title={originSummary(l)}>{originSummary(l)}</td>
                    <td className="py-3">
                      <Select value={l.status ?? "novo"} onValueChange={(v) => setStatus(l, v as FunnelStatus)}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {FUNNEL_STATUSES.map((s) => <SelectItem key={s} value={s}>{FUNNEL_LABEL[s]}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="py-3 text-right text-slate-500 whitespace-nowrap text-xs">
                      {new Date(l.createdAt).toLocaleDateString("pt-BR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>

      <Sheet open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <SheetContent className="sm:max-w-xl overflow-y-auto">
          {open && model && (() => {
            const calc = computeScore(open, model);
            return (
              <>
                <SheetHeader>
                  <SheetTitle>{open.nome}</SheetTitle>
                  <SheetDescription>
                    {new Date(open.createdAt).toLocaleString("pt-BR")}
                  </SheetDescription>
                </SheetHeader>

                <div className="mt-5 space-y-5 text-sm">
                  {/* Score grande + faixa */}
                  <div className="rounded-md border border-slate-200 p-4">
                    <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-2">
                      Pontuação de qualidade do perfil
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-5xl font-semibold tabular-nums">{calc.score}</div>
                      <div className="flex-1">
                        <div className="h-2 bg-slate-100 rounded">
                          <div className={`h-full rounded ${TONE_BAR[calc.band.tone]}`} style={{ width: `${calc.score}%` }} />
                        </div>
                        <div className="mt-2">
                          <Badge variant="outline" className={`text-[10px] ${TONE_CLASS[calc.band.tone]}`}>
                            <Flame className="h-3 w-3 mr-1" /> {calc.band.label}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status (manual) */}
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-2">Status do funil</div>
                    <Select value={open.status ?? "novo"} onValueChange={(v) => setStatus(open, v as FunnelStatus)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {FUNNEL_STATUSES.map((s) => <SelectItem key={s} value={s}>{FUNNEL_LABEL[s]}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Composição */}
                  <div className="rounded-md border border-slate-200">
                    <div className="px-4 py-2 bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                      Composição da pontuação
                    </div>
                    <div className="p-4 space-y-2 text-xs">
                      {calc.composicao.map((c) => (
                        <div key={c.key} className="flex items-center gap-2">
                          <div className="w-28 text-slate-500">{c.label}</div>
                          <div className="flex-1 text-slate-700 truncate">{c.display}</div>
                          <div className="w-24 h-1.5 bg-slate-100 rounded">
                            <div className="h-full bg-amber-400 rounded" style={{ width: `${c.pesoNorm > 0 ? (c.pontos / c.pesoNorm) * 100 : 0}%` }} />
                          </div>
                          <div className="w-20 text-right font-medium tabular-nums">
                            {c.pontos.toFixed(1)}<span className="text-slate-400"> / {c.pesoNorm.toFixed(0)}</span>
                          </div>
                        </div>
                      ))}
                      <div className="flex justify-between border-t border-slate-100 pt-2 mt-2 font-semibold">
                        <span>Total</span><span className="tabular-nums">{calc.score} / 100</span>
                      </div>
                    </div>
                  </div>

                  {/* Respostas */}
                  <div className="grid grid-cols-2 gap-3">
                    <Field k="Email" v={open.email} />
                    <Field k="WhatsApp" v={open.whatsapp} />
                    <Field k="Cidade / UF" v={`${open.cidade} / ${open.uf}`} />
                    <Field k="Profissão" v={open.profissao} />
                    <Field k="Faixa etária" v={open.faixaEtaria} />
                    <Field k="Formação" v={open.formacao} />
                    <Field k="Renda" v={open.renda} />
                    <Field k="Momento" v={open.momento} />
                    <Field k="Segmento (LP)" v={open.segmento ?? "—"} />
                    <Field k="Variante A/B" v={open.variante_ab ?? "—"} />
                  </div>

                  {/* UTMs */}
                  <div className="rounded-md border border-slate-200">
                    <div className="px-4 py-2 bg-slate-50 text-xs uppercase tracking-wider text-slate-500">UTMs</div>
                    <div className="p-4 grid grid-cols-2 gap-2 text-xs">
                      {(["utm_source","utm_medium","utm_campaign","utm_content","utm_term"] as const).map((k) => (
                        <div key={k}><span className="text-slate-500">{k}:</span> {open.utm?.[k] ?? "—"}</div>
                      ))}
                      {open.utm?.gclid && <div><span className="text-slate-500">gclid:</span> {open.utm.gclid}</div>}
                      {open.utm?.fbclid && <div><span className="text-slate-500">fbclid:</span> {open.utm.fbclid}</div>}
                    </div>
                  </div>

                  {/* Origem (referrer + página interna) */}
                  <div className="rounded-md border border-slate-200">
                    <div className="px-4 py-2 bg-slate-50 text-xs uppercase tracking-wider text-slate-500">Origem do tráfego</div>
                    <div className="p-4 grid grid-cols-1 gap-2 text-xs">
                      <div><span className="text-slate-500">Referrer externo:</span> {open.origin?.internal.referrer ?? "—"}</div>
                      <div><span className="text-slate-500">Página interna anterior:</span> {open.origin?.internal.from_path ?? "—"}{open.origin?.internal.from_title ? ` · ${open.origin.internal.from_title}` : ""}</div>
                      <div><span className="text-slate-500">Landing (1ª página da sessão):</span> {open.origin?.internal.landing_path ?? "—"}</div>
                      <div><span className="text-slate-500">Início da sessão:</span> {open.origin?.internal.landing_ts ? new Date(open.origin.internal.landing_ts).toLocaleString("pt-BR") : "—"}</div>
                    </div>
                  </div>
                </div>
              </>
            );
          })()}
        </SheetContent>
      </Sheet>
    </>
  );
}

function ScoreCell({ calc }: { calc: ComputedScore }) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-2xl font-semibold tabular-nums w-10 text-right">{calc.score}</div>
      <div className="flex-1 min-w-[80px]">
        <div className="h-1.5 bg-slate-100 rounded">
          <div className={`h-full rounded ${TONE_BAR[calc.band.tone]}`} style={{ width: `${calc.score}%` }} />
        </div>
        <div className="mt-1">
          <Badge variant="outline" className={`text-[10px] ${TONE_CLASS[calc.band.tone]}`}>{calc.band.label}</Badge>
        </div>
      </div>
    </div>
  );
}

function Field({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-slate-500">{k}</div>
      <div className="text-slate-800">{v}</div>
    </div>
  );
}

function FilterSelect({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: [string, string][];
}) {
  return (
    <div>
      <label className="text-xs text-slate-500">{label}</label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
        <SelectContent>
          {options.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}
