import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Download, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader, StatCard, SectionCard, ClassBadge } from "@/components/admin/ui";
import { list, set } from "@/lib/dataStore";
import type { ScoredLead } from "@/lib/leadScoring";
import { explainScore } from "@/lib/admin/scoreExplain";
import { downloadCsv } from "@/lib/admin/csv";

export const Route = createFileRoute("/admin/leads")({ component: LeadsPage });

type Status = "novo" | "contatado" | "convertido" | "descartado";
type FullLead = ScoredLead & {
  segmento?: string;
  variante_ab?: string | null;
  status?: Status;
};

function LeadsPage() {
  const [rows, setRows] = useState<FullLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<FullLead | null>(null);

  // filtros
  const [fClass, setFClass] = useState<string>("all");
  const [fSeg, setFSeg] = useState<string>("all");
  const [fUtm, setFUtm] = useState<string>("all");
  const [fProf, setFProf] = useState<string>("all");
  const [fFrom, setFFrom] = useState<string>("");
  const [fTo, setFTo] = useState<string>("");
  const [q, setQ] = useState<string>("");

  async function reload() {
    setLoading(true);
    const all = await list<FullLead>("leads");
    all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setRows(all);
    setLoading(false);
  }
  useEffect(() => { reload(); }, []);

  const segments = useMemo(() => Array.from(new Set(rows.map((r) => r.segmento).filter(Boolean))) as string[], [rows]);
  const utms = useMemo(() => Array.from(new Set(rows.map((r) => r.utm?.utm_source).filter(Boolean))) as string[], [rows]);
  const profs = useMemo(() => Array.from(new Set(rows.map((r) => r.profissao).filter(Boolean))), [rows]);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (fClass !== "all" && r.classificacao !== fClass) return false;
      if (fSeg !== "all" && (r.segmento ?? "") !== fSeg) return false;
      if (fUtm !== "all" && (r.utm?.utm_source ?? "") !== fUtm) return false;
      if (fProf !== "all" && r.profissao !== fProf) return false;
      if (fFrom && new Date(r.createdAt) < new Date(fFrom)) return false;
      if (fTo) { const end = new Date(fTo); end.setHours(23,59,59,999); if (new Date(r.createdAt) > end) return false; }
      if (q) {
        const s = q.toLowerCase();
        if (![r.nome, r.email, r.whatsapp, r.cidade].some((v) => v?.toLowerCase().includes(s))) return false;
      }
      return true;
    });
  }, [rows, fClass, fSeg, fUtm, fProf, fFrom, fTo, q]);

  const counts = {
    total: filtered.length,
    A: filtered.filter((r) => r.classificacao === "A").length,
    B: filtered.filter((r) => r.classificacao === "B").length,
    C: filtered.filter((r) => r.classificacao === "C").length,
    D: filtered.filter((r) => r.classificacao === "D").length,
  };

  async function setStatus(lead: FullLead, status: Status) {
    const next = { ...lead, status };
    await set("leads", lead.id, next);
    setRows((rs) => rs.map((r) => (r.id === lead.id ? next : r)));
    setOpen((o) => (o && o.id === lead.id ? next : o));
    toast.success(`Status: ${status}`);
  }

  function exportCsv() {
    downloadCsv(`leads_${new Date().toISOString().slice(0,10)}.csv`,
      filtered.map((l) => ({
        data: l.createdAt, nome: l.nome, email: l.email, whatsapp: l.whatsapp,
        profissao: l.profissao, faixa_etaria: l.faixaEtaria, formacao: l.formacao,
        cidade: l.cidade, uf: l.uf, renda: l.renda, momento: l.momento,
        score: l.score, classificacao: l.classificacao, segmento: l.segmento ?? "",
        variante_ab: l.variante_ab ?? "", status: l.status ?? "novo",
        utm_source: l.utm?.utm_source ?? "", utm_medium: l.utm?.utm_medium ?? "",
        utm_campaign: l.utm?.utm_campaign ?? "", utm_content: l.utm?.utm_content ?? "",
        utm_term: l.utm?.utm_term ?? "",
      })));
  }

  return (
    <>
      <PageHeader
        title="Leads"
        description="Filtre, exporte e gerencie o pipeline."
        actions={
          <Button variant="outline" onClick={exportCsv} className="gap-1.5">
            <Download className="h-4 w-4" /> Exportar CSV
          </Button>
        }
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-5">
        <StatCard label="Total filtrado" value={counts.total} accent="blue" />
        <StatCard label="Classe A" value={counts.A} accent="green" />
        <StatCard label="Classe B" value={counts.B} accent="blue" />
        <StatCard label="Classe C" value={counts.C} accent="yellow" />
        <StatCard label="Classe D" value={counts.D} accent="gray" />
      </div>

      <SectionCard title="Filtros">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="text-xs text-slate-500">Buscar</label>
            <div className="relative mt-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input className="pl-8" placeholder="Nome, email, cidade…" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
          </div>
          <FilterSelect label="Classificação" value={fClass} onChange={setFClass}
            options={[["all", "Todas"], ["A","A"], ["B","B"], ["C","C"], ["D","D"]]} />
          <FilterSelect label="Segmento" value={fSeg} onChange={setFSeg}
            options={[["all", "Todos"], ...segments.map((s) => [s, s] as [string,string])]} />
          <FilterSelect label="utm_source" value={fUtm} onChange={setFUtm}
            options={[["all", "Todas"], ...utms.map((s) => [s, s] as [string,string])]} />
          <FilterSelect label="Profissão" value={fProf} onChange={setFProf}
            options={[["all", "Todas"], ...profs.map((s) => [s, s] as [string,string])]} />
          <div>
            <label className="text-xs text-slate-500">De</label>
            <Input type="date" className="mt-1" value={fFrom} onChange={(e) => setFFrom(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-slate-500">Até</label>
            <Input type="date" className="mt-1" value={fTo} onChange={(e) => setFTo(e.target.value)} />
          </div>
          <div className="flex items-end">
            <Button variant="ghost" className="text-slate-600"
              onClick={() => { setFClass("all"); setFSeg("all"); setFUtm("all"); setFProf("all"); setFFrom(""); setFTo(""); setQ(""); }}>
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
                  <th className="px-5 py-2">Data</th>
                  <th className="py-2">Nome</th>
                  <th className="py-2">WhatsApp</th>
                  <th className="py-2">Profissão</th>
                  <th className="py-2 text-right">Score</th>
                  <th className="py-2 text-center">Classe</th>
                  <th className="py-2">Segmento</th>
                  <th className="py-2">Variante</th>
                  <th className="py-2">Momento</th>
                  <th className="py-2">utm_source</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={11} className="px-5 py-8 text-center text-slate-400">Carregando…</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={11} className="px-5 py-8 text-center text-slate-400">Nenhum lead com esses filtros.</td></tr>
                ) : filtered.map((l) => (
                  <tr key={l.id} className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer"
                      onClick={() => setOpen(l)}>
                    <td className="px-5 py-2 text-slate-500 whitespace-nowrap">{new Date(l.createdAt).toLocaleString("pt-BR")}</td>
                    <td className="py-2 font-medium">{l.nome}</td>
                    <td className="py-2 text-slate-600">{l.whatsapp}</td>
                    <td className="py-2 text-slate-600">{l.profissao}</td>
                    <td className="py-2 text-right font-semibold">{l.score}</td>
                    <td className="py-2 text-center"><ClassBadge c={l.classificacao} /></td>
                    <td className="py-2 text-slate-600">{l.segmento ?? "—"}</td>
                    <td className="py-2 text-slate-600 text-xs">{l.variante_ab ?? "—"}</td>
                    <td className="py-2 text-slate-600">{l.momento}</td>
                    <td className="py-2 text-slate-600">{l.utm?.utm_source ?? "—"}</td>
                    <td className="py-2"><StatusBadge s={l.status ?? "novo"} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>

      <Sheet open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <SheetContent className="sm:max-w-xl overflow-y-auto">
          {open && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  {open.nome} <ClassBadge c={open.classificacao} />
                </SheetTitle>
                <SheetDescription>
                  {new Date(open.createdAt).toLocaleString("pt-BR")} · score {open.score}
                </SheetDescription>
              </SheetHeader>

              <div className="mt-5 space-y-4 text-sm">
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

                <div className="rounded-md border border-slate-200">
                  <div className="px-4 py-2 bg-slate-50 text-xs uppercase tracking-wider text-slate-500">Detalhamento do score</div>
                  <ScoreBreakdown lead={open} />
                </div>

                <div className="rounded-md border border-slate-200">
                  <div className="px-4 py-2 bg-slate-50 text-xs uppercase tracking-wider text-slate-500">UTMs</div>
                  <div className="p-4 grid grid-cols-2 gap-2 text-xs">
                    {(["utm_source","utm_medium","utm_campaign","utm_content","utm_term"] as const).map((k) => (
                      <div key={k}><span className="text-slate-500">{k}:</span> {open.utm?.[k] ?? "—"}</div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-xs uppercase tracking-wider text-slate-500 mb-2">Status</div>
                  <Tabs value={open.status ?? "novo"}>
                    <TabsList>
                      {(["novo","contatado","convertido","descartado"] as Status[]).map((s) => (
                        <TabsTrigger key={s} value={s} onClick={() => setStatus(open, s)}>{s}</TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}

function ScoreBreakdown({ lead }: { lead: FullLead }) {
  const { lines, total, max } = explainScore(lead);
  return (
    <div className="p-4 space-y-1.5 text-xs">
      {lines.map((l) => (
        <div key={l.label} className="flex items-center gap-2">
          <div className="w-28 text-slate-500">{l.label}</div>
          <div className="flex-1 text-slate-700">{l.value}</div>
          <div className="w-24 h-1.5 bg-slate-100 rounded">
            <div className="h-full bg-amber-400 rounded" style={{ width: `${(l.pts / l.max) * 100}%` }} />
          </div>
          <div className="w-12 text-right font-medium">+{l.pts}<span className="text-slate-400">/{l.max}</span></div>
        </div>
      ))}
      <div className="flex justify-between border-t border-slate-100 pt-2 mt-2 font-semibold">
        <span>Total</span><span>{total} / {max}</span>
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

function StatusBadge({ s }: { s: Status }) {
  const m: Record<Status, string> = {
    novo: "bg-slate-100 text-slate-700",
    contatado: "bg-sky-100 text-sky-800",
    convertido: "bg-emerald-100 text-emerald-800",
    descartado: "bg-rose-100 text-rose-700",
  };
  return <Badge variant="outline" className={`${m[s]} border-transparent text-[10px]`}>{s}</Badge>;
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
