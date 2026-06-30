/**
 * pageStructure — fonte única para ordem e visibilidade de dobras por página.
 *
 * Persistência: dataStore["page_sections"][pageSlug] = { items, updatedAt }.
 * O admin (/admin/estrutura) edita; a rota pública consome via `useOrderedSections`.
 *
 * Merge defensivo: se o código adicionar dobras novas (ou remover antigas),
 * o estado salvo é reconciliado com os defaults — novas entram no fim como
 * ativas; órfãs somem.
 */

import { useEffect, useState } from "react";
import { get, set } from "@/lib/dataStore";
import { broadcast } from "@/lib/admin/settings";
import { HOME_SECTIONS, type SectionDef } from "@/lib/sectionMap";

export type PageSlug = "home"; // expandir aqui ao suportar outras páginas

export interface SectionItem {
  id: string;
  active: boolean;
}

export interface PageSectionsRow {
  items: SectionItem[];
  updatedAt: string;
}

/* ============================================================
 * Defaults — ordem inicial real de cada página.
 * Devem refletir o JSX original antes de qualquer customização.
 * ============================================================ */

const DEFAULT_LAYOUTS: Record<PageSlug, SectionItem[]> = {
  home: [
    { id: "abertura",            active: true },
    { id: "blog-em-destaque",    active: true },
    { id: "brasil-vs-eua",       active: true },
    { id: "eb-2-niw",            active: true },
    { id: "vistos-eb",           active: true },
    { id: "processo-eb-2-niw",   active: true },
    { id: "por-que-status",      active: true },
    { id: "legado",              active: true },
    { id: "renda-em-dolar",      active: true },
    { id: "depoimentos",         active: true },
    { id: "duvidas-frequentes",  active: true },
    { id: "pre-qualificacao",    active: true },
    { id: "avaliacao-gratuita",  active: true },
  ],
};

/** Dobras que não podem ser ocultadas nem sair da posição 1. */
const PINNED_FIRST: Record<PageSlug, string> = {
  home: "abertura",
};

/* ============================================================
 * Helpers
 * ============================================================ */

export function defaultLayout(page: PageSlug): SectionItem[] {
  return DEFAULT_LAYOUTS[page].map((s) => ({ ...s }));
}

export function pinnedFirst(page: PageSlug): string {
  return PINNED_FIRST[page];
}

export function sectionCatalog(page: PageSlug): SectionDef[] {
  // No futuro, alternar por page; hoje só Home está sob controle.
  if (page === "home") return HOME_SECTIONS;
  return HOME_SECTIONS;
}

export function sectionLabel(page: PageSlug, id: string): string {
  return sectionCatalog(page).find((s) => s.id === id)?.label ?? id;
}

/**
 * Reconcilia um estado salvo contra os defaults atuais do código.
 * - Remove ids que não existem mais no default.
 * - Acrescenta ids novos no fim (como ativos).
 * - Garante que `PINNED_FIRST` esteja sempre na posição 0 e ativo.
 */
export function reconcile(page: PageSlug, saved: SectionItem[] | null | undefined): SectionItem[] {
  const defaults = defaultLayout(page);
  const validIds = new Set(defaults.map((s) => s.id));
  const pinned = pinnedFirst(page);

  const base = (saved ?? defaults).filter((s) => validIds.has(s.id));

  // adiciona novas dobras que apareceram no código depois da última edição
  const existing = new Set(base.map((s) => s.id));
  for (const def of defaults) {
    if (!existing.has(def.id)) base.push({ id: def.id, active: true });
  }

  // força pinned na frente e ativo
  const idx = base.findIndex((s) => s.id === pinned);
  if (idx > 0) {
    const [pin] = base.splice(idx, 1);
    base.unshift({ ...pin, active: true });
  } else if (idx === 0) {
    base[0] = { ...base[0], active: true };
  } else {
    base.unshift({ id: pinned, active: true });
  }

  return base;
}

/* ============================================================
 * Persistência
 * ============================================================ */

export async function loadPageSections(page: PageSlug): Promise<SectionItem[]> {
  const row = await get<PageSectionsRow>("page_sections", page);
  return reconcile(page, row?.items);
}

export async function savePageSections(page: PageSlug, items: SectionItem[]) {
  await set("page_sections", page, {
    items: reconcile(page, items),
    updatedAt: new Date().toISOString(),
  } satisfies PageSectionsRow);
  broadcast();
}

/* ============================================================
 * Hook reativo — usado pela rota pública.
 * Escuta o evento "status:admin-change" para refletir edições do admin
 * em tempo real (mesma aba) sem reload.
 * ============================================================ */

export function useOrderedSections(page: PageSlug): SectionItem[] {
  // Leitura síncrona do localStorage no primeiro render — evita "flash"
  // com a ordem default quando o componente monta após edição no admin.
  const [items, setItems] = useState<SectionItem[]>(() => {
    if (typeof window === "undefined") return reconcile(page, null);
    try {
      const raw = window.localStorage.getItem("status_page_sections");
      const parsed = raw ? (JSON.parse(raw) as Record<string, PageSectionsRow>) : null;
      return reconcile(page, parsed?.[page]?.items);
    } catch {
      return reconcile(page, null);
    }
  });

  useEffect(() => {
    let cancelled = false;
    const refresh = async () => {
      const next = await loadPageSections(page);
      if (!cancelled) setItems(next);
    };
    refresh();
    const onChange = () => refresh();
    const onStorage = (e: StorageEvent) => {
      if (e.key === "status_page_sections" || e.key === "status_admin_change") refresh();
    };
    window.addEventListener("status:admin-change", onChange);
    window.addEventListener("storage", onStorage);
    return () => {
      cancelled = true;
      window.removeEventListener("status:admin-change", onChange);
      window.removeEventListener("storage", onStorage);
    };
  }, [page]);

  return items;
}

