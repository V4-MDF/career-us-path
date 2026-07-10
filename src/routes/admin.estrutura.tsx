/**
 * /admin/estrutura, reordenar e ocultar dobras de cada página do site.
 *
 * Hoje cobre a Home. Para adicionar outra página: estender PageSlug,
 * DEFAULT_LAYOUTS e o registry de componentes da rota correspondente
 * (ver src/lib/pageStructure.ts).
 */
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Eye, EyeOff, GripVertical, Lock, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHeader, SectionCard } from "@/components/admin/ui";
import {
  defaultLayout,
  loadPageSections,
  pinnedFirst,
  savePageSections,
  sectionLabel,
  type PageSlug,
  type SectionItem,
} from "@/lib/pageStructure";

export const Route = createFileRoute("/admin/estrutura")({ component: EstruturaPage });

// Hoje só Home, manter array para crescer (Vistos pillars no próximo passo).
const PAGES: Array<{ slug: PageSlug; label: string; hint?: string }> = [
  { slug: "home", label: "Home", hint: "Páginas Sobre/Contato ainda são stubs. Vistos virão no próximo ciclo." },
];

function EstruturaPage() {
  const [active, setActive] = useState<PageSlug>("home");
  const [items, setItems] = useState<SectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    loadPageSections(active).then((next) => {
      if (!cancelled) {
        setItems(next);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [active]);

  async function persist(next: SectionItem[]) {
    setItems(next);
    await savePageSections(active, next);
  }

  function move(idx: number, dir: -1 | 1) {
    const j = idx + dir;
    const pinIdx = items.findIndex((s) => s.id === pinnedFirst(active));
    // não mover a primeira dobra (pinned) nem trocar com ela
    if (idx === pinIdx) return;
    if (j === pinIdx) return;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[idx], next[j]] = [next[j], next[idx]];
    persist(next);
  }

  function toggle(idx: number) {
    if (items[idx].id === pinnedFirst(active)) return; // pinned sempre ativa
    const next = items.map((s, i) => (i === idx ? { ...s, active: !s.active } : s));
    persist(next);
  }

  async function restoreDefaults() {
    if (!confirm("Restaurar a ordem e visibilidade padrão desta página?")) return;
    await persist(defaultLayout(active));
    toast.success("Estrutura restaurada ao padrão.");
  }

  // drag handlers
  function onDragStart(idx: number) {
    if (items[idx].id === pinnedFirst(active)) return;
    setDragIdx(idx);
  }
  function onDragOver(e: React.DragEvent) { e.preventDefault(); }
  function onDrop(targetIdx: number) {
    if (dragIdx === null || dragIdx === targetIdx) { setDragIdx(null); return; }
    const pinIdx = items.findIndex((s) => s.id === pinnedFirst(active));
    if (targetIdx === pinIdx) { setDragIdx(null); return; }
    const next = [...items];
    const [moved] = next.splice(dragIdx, 1);
    next.splice(targetIdx, 0, moved);
    setDragIdx(null);
    persist(next);
  }

  const activePage = PAGES.find((p) => p.slug === active)!;
  const total = items.length;
  const visible = items.filter((s) => s.active).length;

  return (
    <>
      <PageHeader
        title="Estrutura de Páginas"
        description="Reordene e oculte dobras de cada página. As mudanças refletem no site imediatamente."
        actions={
          <Button variant="outline" className="gap-1.5" onClick={restoreDefaults}>
            <RotateCcw className="h-4 w-4" /> Restaurar padrão
          </Button>
        }
      />

      {/* Seletor de página */}
      <div className="mb-4 inline-flex rounded-md border border-slate-200 bg-white p-1">
        {PAGES.map((p) => (
          <button
            key={p.slug}
            onClick={() => setActive(p.slug)}
            className={`px-3 py-1.5 text-sm rounded ${
              active === p.slug
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {activePage.hint && (
        <p className="mb-4 text-xs text-slate-500">{activePage.hint}</p>
      )}

      <SectionCard
        title={`${activePage.label}, ${visible}/${total} dobras visíveis`}
        description="Arraste pelo punho para reordenar. Use os botões ↑↓ no teclado. A primeira dobra (Abertura) é fixa."
      >
        {loading ? (
          <p className="py-6 text-sm text-slate-500">Carregando…</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {items.map((s, i) => {
              const pinned = s.id === pinnedFirst(active);
              const dim = !s.active;
              return (
                <li
                  key={s.id}
                  draggable={!pinned}
                  onDragStart={() => onDragStart(i)}
                  onDragOver={onDragOver}
                  onDrop={() => onDrop(i)}
                  className={`flex items-center gap-3 py-2.5 px-1 rounded transition-colors ${
                    dragIdx === i ? "bg-amber-50" : ""
                  } ${dim ? "opacity-60" : ""}`}
                >
                  <span
                    className={`shrink-0 ${pinned ? "cursor-not-allowed text-slate-300" : "cursor-grab text-slate-400 active:cursor-grabbing"}`}
                    aria-label={pinned ? "Dobra fixa" : "Arrastar para reordenar"}
                  >
                    {pinned ? <Lock className="h-4 w-4" /> : <GripVertical className="h-4 w-4" />}
                  </span>

                  <span className="w-6 text-xs text-slate-400 tabular-nums">{i + 1}.</span>

                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-900 truncate">
                      {sectionLabel(active, s.id)}
                      {pinned && (
                        <span className="ml-2 text-[10px] uppercase tracking-wider text-slate-400">fixa</span>
                      )}
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 truncate">#{s.id}</div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost" size="sm"
                      disabled={pinned || i <= 1}
                      onClick={() => move(i, -1)}
                      aria-label="Mover para cima"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost" size="sm"
                      disabled={pinned || i >= items.length - 1}
                      onClick={() => move(i, 1)}
                      aria-label="Mover para baixo"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={s.active ? "secondary" : "outline"}
                      size="sm"
                      disabled={pinned}
                      onClick={() => toggle(i)}
                      className="gap-1.5 min-w-[88px] justify-center"
                    >
                      {s.active ? <><Eye className="h-3.5 w-3.5" />Ativa</> : <><EyeOff className="h-3.5 w-3.5" />Oculta</>}
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </SectionCard>

      <p className="mt-4 text-xs text-slate-500">
        A nova ordem é persistida em <code className="font-mono">page_sections.{active}</code> e
        lida em tempo real pela página pública via <code className="font-mono">useOrderedSections</code>.
      </p>
    </>
  );
}
