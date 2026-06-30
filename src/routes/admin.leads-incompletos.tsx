/**
 * /admin/leads-incompletos — funil de abandono do form progressivo.
 *
 * Mostra:
 *  - Tabela de leads parciais (não enviaram), com último campo, % concluído
 *    e origem (utm + página interna anterior).
 *  - Funil: quantos leads pararam em cada pergunta vs concluíram.
 *  - Detalhe lateral (drawer) com tudo que foi capturado.
 *
 * Dados vêm de:
 *  - `leads_partial` (PartialLead em LeadFormProgressive)
 *  - `leads` (completos, para taxa de conclusão e funil)
 *
 * Manutenção: parciais com >30 dias são purgados ao abrir.
 */
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Eye, Trash2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader, StatCard, SectionCard } from "@/components/admin/ui";
import { list, remove } from "@/lib/dataStore";
import { PROGRESSIVE_FIELDS, type PartialLead } from "@/components/site/LeadFormProgressive";
import type { LeadInput } from "@/lib/leadScoring";

export const Route = createFileRoute("/admin/leads-incompletos")({
  component: IncompletePage,
});

type StoredLead = LeadInput & {
  id: string;
  createdAt: string;
  segmento?: string;
};

const FIELD_LABEL: Record<string, string> = {
  nome: "Nome",
  email: "E-mail",
  whatsapp: "WhatsApp",
  profissao: "Profissão",
  formacao: "Formação",
  faixaEtaria: "Faixa etária",
  cidade_uf: "Cidade/UF",
  renda: "Renda",
  momento: "Momento",
};

function IncompletePage() {
  const [partials, setPartials] = useState<PartialLead[]>([]);
  const [completed, setCompleted] = useState<StoredLead[]>([]);
  const [selected, setSelected] = useState<PartialLead | null>(null);

  const reload = async () => {
    const all = await list<PartialLead>("leads_partial");
    // purge >30d
    const cutoff = Date.now() - 30 * 86400000;
    const fresh: PartialLead[] = [];
    for (const p of all) {
      const ts = new Date(p.updatedAt || p.createdAt).getTime();
      if (ts < cutoff) {
        await remove("leads_partial", p.id);
      } else {
        fresh.push(p);
      }
    }
    fresh.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    setPartials(fresh);
    setCompleted(await list<StoredLead>("leads"));
  };

  useEffect(() => { void reload(); }, []);

  const total = partials.length + completed.length;
  const rate = total > 0 ? Math.round((completed.length / total) * 100) : 0;

  const week = Date.now() - 7 * 86400000;
  const weeklyPartial = partials.filter((p) => new Date(p.updatedAt).getTime() >= week).length;

  // Funil: para cada pergunta, conta leads cujo ÚLTIMO campo válido é essa.
  // Concluído = lead em `leads`.
  const funnel = useMemo(() => {
    const counts: Record<string, number> = {};
    PROGRESSIVE_FIELDS.forEach((f) => { counts[f.key] = 0; });
    partials.forEach((p) => {
      const last = p.last_field;
      if (last && counts[last] !== undefined) counts[last] += 1;
    });
    const max = Math.max(completed.length, ...Object.values(counts), 1);
    return PROGRESSIVE_FIELDS.map((f) => ({
      key: f.key, label: FIELD_LABEL[f.key] ?? f.key,
      count: counts[f.key] ?? 0, max,
    })).concat([{ key: "__done__", label: "Enviou o formulário", count: completed.length, max }]);
  }, [partials, completed]);

  const purgeAll = async () => {
    if (!confirm("Apagar TODOS os leads incompletos? Esta ação é irreversível.")) return;
    for (const p of partials) await remove("leads_partial", p.id);
    void reload();
  };

  const deleteOne = async (id: string) => {
    await remove("leads_partial", id);
    if (selected?.id === id) setSelected(null);
    void reload();
  };

  return (
    <>
      <PageHeader
        title="Leads incompletos"
        description="Visitantes que iniciaram o formulário em /avaliacao mas não enviaram. Use os dados capturados para resgate ativo."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => reload()} className="gap-1.5">
              <RefreshCw className="h-3.5 w-3.5" /> Recarregar
            </Button>
            {partials.length > 0 && (
              <Button variant="outline" size="sm" onClick={purgeAll} className="gap-1.5 text-red-600 border-red-200 hover:bg-red-50">
                <Trash2 className="h-3.5 w-3.5" /> Limpar tudo
              </Button>
            )}
          </>
        }
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard label="Incompletos (total)" value={partials.length} accent="yellow" />
        <StatCard label="Incompletos (7 dias)" value={weeklyPartial} accent="gold" />
        <StatCard label="Concluídos (total)" value={completed.length} accent="green" />
        <StatCard label="Taxa de conclusão" value={`${rate}%`} accent="blue" hint={`${completed.length} de ${total} iniciados`} />
      </div>

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-5">
        <SectionCard
          title="Lista de leads incompletos"
          description="Ordenados pelo mais recente. Clique em uma linha para ver detalhes."
        >
          {partials.length === 0 ? (
            <p className="text-sm text-slate-500">Sem leads incompletos no momento.</p>
          ) : (
            <div className="overflow-x-auto -mx-5">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-2">% / Última pergunta</th>
                    <th className="py-2">Contato</th>
                    <th className="py-2">Origem</th>
                    <th className="py-2 text-right pr-5">Atualizado</th>
                  </tr>
                </thead>
                <tbody>
                  {partials.map((p) => {
                    const pct = Math.round((p.completed_fields.length / PROGRESSIVE_FIELDS.length) * 100);
                    return (
                      <tr
                        key={p.id}
                        className={`border-b border-slate-100 cursor-pointer hover:bg-slate-50 ${selected?.id === p.id ? "bg-amber-50/60" : ""}`}
                        onClick={() => setSelected(p)}
                      >
                        <td className="px-5 py-2.5">
                          <div className="flex items-center gap-2">
                            <div className="text-sm font-semibold tabular-nums w-9">{pct}%</div>
                            <div className="flex-1 min-w-[80px]">
                              <div className="h-1.5 bg-slate-100 rounded">
                                <div className="h-full rounded bg-amber-400" style={{ width: `${pct}%` }} />
                              </div>
                              <div className="text-[11px] text-slate-500 mt-1">
                                parou em <span className="font-medium">{FIELD_LABEL[p.last_field ?? ""] ?? "—"}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5">
                          <div className="font-medium truncate max-w-[180px]">{p.data.nome || <span className="text-slate-400">sem nome</span>}</div>
                          <div className="text-xs text-slate-500 truncate max-w-[180px]">
                            {p.data.email || p.data.whatsapp || "—"}
                          </div>
                        </td>
                        <td className="py-2.5 text-xs text-slate-600">
                          <div className="truncate max-w-[200px]">
                            {p.origin.utm.utm_campaign || p.origin.utm.utm_source || p.origin.internal.from_path || "direto"}
                          </div>
                          {p.origin.internal.from_path && (
                            <div className="text-[10px] text-slate-400 truncate max-w-[200px]">via {p.origin.internal.from_path}</div>
                          )}
                        </td>
                        <td className="py-2.5 text-right pr-5 text-xs text-slate-500 whitespace-nowrap">
                          {new Date(p.updatedAt).toLocaleString("pt-BR")}
                          <button
                            className="ml-2 inline-flex items-center text-slate-400 hover:text-amber-600"
                            onClick={(e) => { e.stopPropagation(); setSelected(p); }}
                            aria-label="Detalhes"
                          ><Eye className="h-3.5 w-3.5" /></button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Funil de abandono"
          description="Onde os leads paralisam vs quantos concluem."
        >
          <ul className="space-y-2.5">
            {funnel.map((row) => (
              <li key={row.key}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className={row.key === "__done__" ? "font-semibold text-emerald-700" : "text-slate-700"}>
                    {row.label}
                  </span>
                  <span className="tabular-nums text-slate-500">{row.count}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded overflow-hidden">
                  <div
                    className={`h-full ${row.key === "__done__" ? "bg-emerald-500" : "bg-amber-400"}`}
                    style={{ width: `${(row.count / row.max) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>

      {/* Detalhe */}
      {selected && (
        <div className="fixed inset-0 z-40 bg-black/40 flex" onClick={() => setSelected(null)}>
          <div className="ml-auto w-full max-w-md h-full bg-white shadow-2xl overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900">{selected.data.nome || "Lead incompleto"}</h3>
                <p className="text-xs text-slate-500">Atualizado {new Date(selected.updatedAt).toLocaleString("pt-BR")}</p>
              </div>
              <button className="text-slate-400 hover:text-slate-700" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="p-5 space-y-5">
              <section>
                <h4 className="text-xs uppercase tracking-wider text-slate-500 mb-2">Respostas capturadas</h4>
                <dl className="space-y-1.5 text-sm">
                  {PROGRESSIVE_FIELDS.map((f) => {
                    const value = f.key === "cidade_uf"
                      ? `${selected.data.cidade}${selected.data.cidade && selected.data.uf ? "/" : ""}${selected.data.uf}`
                      : (selected.data as unknown as Record<string, string>)[f.key as string] ?? "";
                    return (
                      <div key={f.key} className="flex justify-between gap-2">
                        <dt className="text-slate-500">{FIELD_LABEL[f.key]}</dt>
                        <dd className="text-slate-900 text-right truncate max-w-[60%]">{value || <span className="text-slate-300">—</span>}</dd>
                      </div>
                    );
                  })}
                </dl>
              </section>

              <section>
                <h4 className="text-xs uppercase tracking-wider text-slate-500 mb-2">Origem</h4>
                <dl className="space-y-1.5 text-sm">
                  {Object.entries(selected.origin.utm).map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-2">
                      <dt className="text-slate-500">{k}</dt>
                      <dd className="text-slate-900 text-right truncate max-w-[60%]">{v}</dd>
                    </div>
                  ))}
                  <div className="flex justify-between gap-2">
                    <dt className="text-slate-500">página anterior</dt>
                    <dd className="text-slate-900 text-right truncate max-w-[60%]">{selected.origin.internal.from_path ?? "—"}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-slate-500">landing</dt>
                    <dd className="text-slate-900 text-right truncate max-w-[60%]">{selected.origin.internal.landing_path ?? "—"}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-slate-500">referrer</dt>
                    <dd className="text-slate-900 text-right truncate max-w-[60%]">{selected.origin.internal.referrer ?? "—"}</dd>
                  </div>
                </dl>
              </section>

              {selected.segmento && (
                <section>
                  <h4 className="text-xs uppercase tracking-wider text-slate-500 mb-2">Segmento</h4>
                  <Badge variant="outline">{selected.segmento}</Badge>
                </section>
              )}

              <div className="pt-2 flex gap-2">
                {selected.data.whatsapp && (
                  <Button
                    size="sm" variant="outline" className="gap-1.5"
                    onClick={() => navigator.clipboard.writeText(selected.data.whatsapp)}
                  >Copiar WhatsApp</Button>
                )}
                <Button
                  size="sm" variant="outline" className="gap-1.5 text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => deleteOne(selected.id)}
                ><Trash2 className="h-3.5 w-3.5" /> Excluir</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
