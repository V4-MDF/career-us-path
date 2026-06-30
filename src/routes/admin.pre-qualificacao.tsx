/**
 * /admin/pre-qualificacao — listagem das respostas do teste de pré-qualificação.
 *
 * KPIs no topo: total, qualificados (apto/parcial sem blocker), abertura
 * WhatsApp, distribuição por visto recomendado.
 *
 * Tabela: nome, contato, visto recomendado, score, veredicto, origem,
 * link público + botão para abrir o resultado no admin.
 */

import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink, MessageCircle } from "lucide-react";
import { PageHeader, StatCard, SectionCard } from "@/components/admin/ui";
import { Badge } from "@/components/ui/badge";
import { listResponses, publicResultUrl, type PreQualResponse } from "@/lib/prequal";
import type { VisaCode } from "@/lib/visaQualifier";
import { describeOrigin } from "@/lib/origin";

export const Route = createFileRoute("/admin/pre-qualificacao")({ component: PreQualAdmin });

const VERDICT_BADGE: Record<string, string> = {
  apto: "bg-emerald-100 text-emerald-700 border-emerald-200",
  parcial: "bg-amber-100 text-amber-700 border-amber-200",
  nao_elegivel: "bg-rose-100 text-rose-700 border-rose-200",
};

function PreQualAdmin() {
  const [rows, setRows] = useState<PreQualResponse[]>([]);

  useEffect(() => {
    listResponses().then((r) =>
      setRows([...r].sort((a, b) => b.createdAt.localeCompare(a.createdAt)))
    );
  }, []);

  const total = rows.length;
  const qualified = rows.filter((r) => r.result.qualifiedOverall).length;
  const waOpened = rows.filter((r) => r.whatsappOpened).length;
  const conv = total ? Math.round((waOpened / total) * 100) : 0;

  const byVisa = useMemo(() => {
    const map = new Map<VisaCode, number>();
    rows.forEach((r) => {
      const k = r.result.best.code;
      map.set(k, (map.get(k) ?? 0) + 1);
    });
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [rows]);

  return (
    <>
      <PageHeader
        title="Pré-qualificação"
        description="Respostas do teste estruturado (/pre-qualificacao) com veredicto automático por visto."
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard label="Respostas (total)" value={total} accent="blue" />
        <StatCard label="Qualificados" value={`${qualified}${total ? ` · ${Math.round((qualified / total) * 100)}%` : ""}`} accent="green" />
        <StatCard label="Abriram WhatsApp" value={waOpened} accent="gold" />
        <StatCard label="Conv. → WhatsApp" value={`${conv}%`} accent="yellow" />
      </div>

      <SectionCard title="Distribuição por visto recomendado" description="Top visto sugerido pelo motor para cada resposta.">
        {byVisa.length === 0 ? (
          <p className="text-sm text-slate-500">Sem respostas registradas ainda.</p>
        ) : (
          <ul className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {byVisa.map(([code, n]) => (
              <li key={code} className="flex items-center justify-between border border-slate-200 rounded-md px-3 py-2 text-sm">
                <span className="font-medium text-slate-800">{code}</span>
                <span className="text-slate-500">{n} · {Math.round((n / total) * 100)}%</span>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      <div className="mt-6">
        <SectionCard title="Respostas" description="Mais recentes primeiro.">
          {rows.length === 0 ? (
            <p className="text-sm text-slate-500">Nenhuma resposta ainda.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="py-2 pr-3">Lead</th>
                    <th className="py-2 pr-3">Visto · score</th>
                    <th className="py-2 pr-3">Veredicto</th>
                    <th className="py-2 pr-3">WA</th>
                    <th className="py-2 pr-3">Origem</th>
                    <th className="py-2 pr-3">Quando</th>
                    <th className="py-2 pr-3">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => {
                    const orig = r.origin ? describeOrigin(r.origin) : null;
                    return (
                      <tr key={r.id} className="border-b border-slate-100 align-top">
                        <td className="py-3 pr-3">
                          <div className="font-medium text-slate-800">{r.answers.fullName || "(sem nome)"}</div>
                          <div className="text-xs text-slate-500">{r.answers.email}</div>
                          <div className="text-xs text-slate-500">{r.answers.whatsapp}</div>
                        </td>
                        <td className="py-3 pr-3 whitespace-nowrap">
                          <div className="font-medium">{r.result.best.code}</div>
                          <div className="text-xs text-slate-500">{r.result.best.score}/100</div>
                        </td>
                        <td className="py-3 pr-3">
                          <Badge className={`border ${VERDICT_BADGE[r.result.best.verdict] ?? ""}`} variant="outline">
                            {r.result.best.verdict}
                          </Badge>
                        </td>
                        <td className="py-3 pr-3">
                          {r.whatsappOpened
                            ? <span className="inline-flex items-center gap-1 text-emerald-700"><MessageCircle className="h-3.5 w-3.5" /> abriu</span>
                            : <span className="text-slate-400">—</span>}
                        </td>
                        <td className="py-3 pr-3 text-xs text-slate-600 max-w-[220px] truncate" title={orig ?? ""}>
                          {orig ?? "—"}
                        </td>
                        <td className="py-3 pr-3 text-xs text-slate-500 whitespace-nowrap">
                          {new Date(r.createdAt).toLocaleString("pt-BR")}
                        </td>
                        <td className="py-3 pr-3">
                          <a
                            href={publicResultUrl(r.id)} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-amber-700 hover:text-amber-900 text-xs"
                          >
                            Abrir <ExternalLink className="h-3 w-3" />
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>
      </div>
    </>
  );
}
