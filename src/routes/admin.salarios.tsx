/**
 * /admin/salarios — CRUD da lista de profissões da dobra "Renda em dólar".
 *
 * Persistência via site_content (id "salary_list"), lida por
 * src/components/site/sections.tsx#SalaryCompare e editável apenas por
 * administradores autenticados.
 */
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { PageHeader, SectionCard } from "@/components/admin/ui";
import {
  loadSalaryList, saveSalaryList, SEED_SALARY, type SalaryRow,
} from "@/lib/salaryList";

export const Route = createFileRoute("/admin/salarios")({ component: SalariosAdmin });

function uid() {
  return `row_${Math.random().toString(36).slice(2, 9)}`;
}

function SalariosAdmin() {
  const [rows, setRows] = useState<SalaryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSalaryList().then((list) => {
      setRows(list);
      setLoading(false);
    });
  }, []);

  const update = (id: string, patch: Partial<SalaryRow>) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };
  const remove = (id: string) => setRows((prev) => prev.filter((r) => r.id !== id));
  const move = (id: string, dir: -1 | 1) => {
    setRows((prev) => {
      const idx = prev.findIndex((r) => r.id === id);
      if (idx < 0) return prev;
      const target = idx + dir;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[target]] = [next[target], next[idx]];
      return next.map((r, i) => ({ ...r, ordem: i + 1 }));
    });
  };
  const add = () => {
    setRows((prev) => [
      ...prev,
      { id: uid(), profissao: "Nova profissão", br_mensal: "R$ 0", eua_anual: "US$ 0", ordem: prev.length + 1, ativo: true },
    ]);
  };
  const resetSeed = () => setRows(SEED_SALARY);

  const save = async () => {
    setSaving(true);
    try {
      await saveSalaryList(rows);
      toast.success("Lista de salários salva.");
    } catch (e) {
      toast.error("Falha ao salvar.");
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Renda em dólar · Lista de profissões"
        description="Dobra pública da Home. Brasil = valor mensal · EUA = valor anual (formato usual de cada país). Estes números são referências pendentes de validação."
        actions={
          <>
            <Button variant="outline" onClick={resetSeed}>Restaurar sugestão</Button>
            <Button variant="outline" onClick={add}><Plus className="h-4 w-4 mr-1" /> Adicionar</Button>
            <Button onClick={save} disabled={saving}>
              <Save className="h-4 w-4 mr-1" /> {saving ? "Salvando..." : "Salvar"}
            </Button>
          </>
        }
      />

      <SectionCard title="Profissões">
        {loading ? (
          <p className="text-sm text-ink-text/60">Carregando...</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-ink-text/60">
            Nenhuma profissão. Use “Restaurar sugestão” ou “Adicionar”.
          </p>
        ) : (
          <div className="space-y-3">
            {rows.map((r, i) => (
              <div
                key={r.id}
                className="grid grid-cols-1 lg:grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)_minmax(0,1fr)_auto_auto] gap-3 rounded-lg border border-ink-text/10 bg-white/60 p-3"
              >
                <div className="min-w-0">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-ink-text/55">Profissão</label>
                  <Input
                    value={r.profissao}
                    onChange={(e) => update(r.id, { profissao: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase tracking-widest text-ink-text/55">Brasil · por mês</label>
                  <Input
                    value={r.br_mensal}
                    placeholder="R$ 25.000"
                    onChange={(e) => update(r.id, { br_mensal: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase tracking-widest text-gold">EUA · por ano</label>
                  <Input
                    value={r.eua_anual}
                    placeholder="US$ 280.000"
                    onChange={(e) => update(r.id, { eua_anual: e.target.value })}
                  />
                </div>
                <div className="flex items-center gap-2 lg:pt-5">
                  <Switch checked={r.ativo} onCheckedChange={(v) => update(r.id, { ativo: v })} />
                  <span className="text-xs text-ink-text/70">{r.ativo ? "ativo" : "oculto"}</span>
                </div>
                <div className="flex items-center gap-1 lg:pt-4">
                  <Button variant="ghost" size="icon" onClick={() => move(r.id, -1)} disabled={i === 0} aria-label="Subir">
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => move(r.id, 1)} disabled={i === rows.length - 1} aria-label="Descer">
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => remove(r.id)} aria-label="Remover">
                    <Trash2 className="h-4 w-4 text-oxblood" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
        <p className="mt-6 text-xs text-ink-text/55 leading-relaxed">
          Os valores mostrados no site vêm exatamente do que está aqui. Empresários não entram nesta
          lista — para eles o comparativo é de ambiente de negócio, tratado na LP de empresários.
        </p>
      </SectionCard>
    </>
  );
}
