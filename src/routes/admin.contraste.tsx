/**
 * /admin/contraste — CRUD das listas "Brasil × EUA" (dobra "Duas realidades").
 *
 * Persistência via site_content (ids "contrast_br_list" e "contrast_us_list"),
 * lidas por src/components/site/sections.tsx#ContrastBrasilEUA.
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
  loadBrList, loadUsList, saveBrList, saveUsList,
  SEED_BR, SEED_US, type ContrastItem,
} from "@/lib/contrastLists";
import { broadcast } from "@/lib/admin/settings";

export const Route = createFileRoute("/admin/contraste")({ component: ContrastAdmin });

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}`;
}

type Side = { key: "BR" | "US"; title: string; accent: string; hint: string };

const SIDES: Side[] = [
  { key: "BR", title: "Realidade no Brasil", accent: "text-oxblood", hint: "O que fica para trás. Itens em vermelho no site." },
  { key: "US", title: "Oportunidades nos EUA", accent: "text-emerald-700", hint: "O que se conquista. Itens em verde no site." },
];

function ContrastAdmin() {
  const [br, setBr] = useState<ContrastItem[]>([]);
  const [us, setUs] = useState<ContrastItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([loadBrList(), loadUsList()]).then(([b, u]) => {
      setBr(b); setUs(u); setLoading(false);
    });
  }, []);

  const pickState = (side: Side["key"]) => (side === "BR"
    ? { rows: br, setRows: setBr, prefix: "br" }
    : { rows: us, setRows: setUs, prefix: "us" });

  const update = (side: Side["key"], id: string, patch: Partial<ContrastItem>) => {
    const s = pickState(side);
    s.setRows(s.rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };
  const remove = (side: Side["key"], id: string) => {
    const s = pickState(side);
    s.setRows(s.rows.filter((r) => r.id !== id));
  };
  const move = (side: Side["key"], id: string, dir: -1 | 1) => {
    const s = pickState(side);
    const idx = s.rows.findIndex((r) => r.id === id);
    if (idx < 0) return;
    const target = idx + dir;
    if (target < 0 || target >= s.rows.length) return;
    const next = [...s.rows];
    [next[idx], next[target]] = [next[target], next[idx]];
    s.setRows(next.map((r, i) => ({ ...r, ordem: i + 1 })));
  };
  const add = (side: Side["key"]) => {
    const s = pickState(side);
    s.setRows([...s.rows, { id: uid(s.prefix), texto: "Novo item", ordem: s.rows.length + 1, ativo: true }]);
  };
  const resetSeed = (side: Side["key"]) => {
    if (side === "BR") setBr(SEED_BR); else setUs(SEED_US);
  };

  const save = async () => {
    setSaving(true);
    try {
      await Promise.all([saveBrList(br), saveUsList(us)]);
      broadcast();
      toast.success("Listas Brasil × EUA salvas.");
    } catch (e) {
      toast.error("Falha ao salvar.");
      console.error(e);
    } finally { setSaving(false); }
  };

  return (
    <>
      <PageHeader
        title="Duas realidades · Brasil × EUA"
        description="Dobra pública da Home. Edite/reordene os itens de cada lado. Vermelho (X) no Brasil, verde (check) nos EUA."
        actions={
          <Button onClick={save} disabled={saving}>
            <Save className="h-4 w-4 mr-1" /> {saving ? "Salvando..." : "Salvar tudo"}
          </Button>
        }
      />

      {loading ? (
        <p className="text-sm text-ink-text/60">Carregando...</p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {SIDES.map((side) => {
            const s = pickState(side.key);
            return (
              <SectionCard
                key={side.key}
                title={side.title}
                description={side.hint}
                actions={
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => resetSeed(side.key)}>Restaurar sugestão</Button>
                    <Button variant="outline" size="sm" onClick={() => add(side.key)}>
                      <Plus className="h-4 w-4 mr-1" /> Adicionar
                    </Button>
                  </div>
                }
              >
                <div className="space-y-2">
                  {s.rows.map((r, i) => (
                    <div
                      key={r.id}
                      className="grid grid-cols-[minmax(0,1fr)_auto_auto] gap-2 rounded-lg border border-ink-text/10 bg-white/60 p-2.5"
                    >
                      <Input
                        value={r.texto}
                        onChange={(e) => update(side.key, r.id, { texto: e.target.value })}
                        className={side.accent}
                      />
                      <div className="flex items-center gap-1.5">
                        <Switch checked={r.ativo} onCheckedChange={(v) => update(side.key, r.id, { ativo: v })} />
                        <span className="text-[10px] font-mono uppercase tracking-widest text-ink-text/60">
                          {r.ativo ? "ativo" : "oculto"}
                        </span>
                      </div>
                      <div className="flex items-center gap-0.5">
                        <Button variant="ghost" size="icon" onClick={() => move(side.key, r.id, -1)} disabled={i === 0} aria-label="Subir">
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => move(side.key, r.id, 1)} disabled={i === s.rows.length - 1} aria-label="Descer">
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => remove(side.key, r.id)} aria-label="Remover">
                          <Trash2 className="h-4 w-4 text-oxblood" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {s.rows.length === 0 && (
                    <p className="text-sm text-ink-text/60">Nenhum item. Use “Restaurar sugestão” ou “Adicionar”.</p>
                  )}
                </div>
              </SectionCard>
            );
          })}
        </div>
      )}
    </>
  );
}
