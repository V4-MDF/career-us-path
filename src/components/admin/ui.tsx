import type { ReactNode } from "react";

export function PageHeader({
  title, description, actions,
}: { title: string; description?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
        {description && <p className="mt-1 text-sm text-slate-600">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function StatCard({
  label, value, hint, accent,
}: { label: string; value: ReactNode; hint?: string; accent?: "gold" | "green" | "blue" | "yellow" | "gray" }) {
  const ring: Record<NonNullable<typeof accent>, string> = {
    gold: "border-l-amber-400", green: "border-l-emerald-500",
    blue: "border-l-sky-500", yellow: "border-l-yellow-400", gray: "border-l-slate-300",
  };
  return (
    <div className={`rounded-lg border border-slate-200 bg-white p-4 border-l-4 ${ring[accent ?? "gold"]}`}>
      <div className="text-xs uppercase tracking-wider text-slate-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-slate-900">{value}</div>
      {hint && <div className="mt-1 text-xs text-slate-500">{hint}</div>}
    </div>
  );
}

export function SectionCard({
  title, description, children, footer,
}: { title?: string; description?: ReactNode; children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white">
      {(title || description) && (
        <div className="px-5 py-4 border-b border-slate-200">
          {title && <h2 className="text-base font-semibold text-slate-900">{title}</h2>}
          {description && <p className="mt-0.5 text-xs text-slate-500">{description}</p>}
        </div>
      )}
      <div className="p-5">{children}</div>
      {footer && <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 rounded-b-lg">{footer}</div>}
    </div>
  );
}

export function ClassBadge({ c }: { c: "A" | "B" | "C" | "D" }) {
  const map = {
    A: "bg-emerald-100 text-emerald-800 border-emerald-300",
    B: "bg-sky-100 text-sky-800 border-sky-300",
    C: "bg-yellow-100 text-yellow-800 border-yellow-300",
    D: "bg-slate-100 text-slate-600 border-slate-300",
  } as const;
  return <span className={`inline-flex items-center justify-center w-7 h-6 rounded text-xs font-semibold border ${map[c]}`}>{c}</span>;
}
