import type { ReactNode } from "react";

/**
 * Helpers visuais do painel admin — identidade "Dossiê"
 * (parchment + ink + gold, Montserrat display + Inter body).
 * Estas primitivas são usadas por todas as telas /admin/*.
 */

export function PageHeader({
  title, description, actions,
}: { title: string; description?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
      <div className="min-w-0">
        <div className="text-[10px] font-mono uppercase tracking-[0.28em] text-gold">
          Admin
        </div>
        <h1 className="mt-2 font-display text-2xl sm:text-[26px] font-bold uppercase tracking-[0.02em] text-ink-text">
          {title}
        </h1>
        <div className="mt-3 h-px w-12 bg-gold" />
        {description && (
          <p className="mt-3 text-sm text-ink-text/70 max-w-2xl">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap gap-2 shrink-0">{actions}</div>}
    </div>
  );
}

export function StatCard({
  label, value, hint, accent,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  accent?: "gold" | "green" | "blue" | "yellow" | "gray" | "red";
}) {
  const ring: Record<NonNullable<typeof accent>, string> = {
    gold: "before:bg-gold",
    green: "before:bg-success",
    blue: "before:bg-ink",
    yellow: "before:bg-gold",
    gray: "before:bg-slate",
    red: "before:bg-oxblood",
  };
  return (
    <div
      className={`relative overflow-hidden rounded-lg border border-gold/20 bg-parchment p-5 pl-6 before:absolute before:inset-y-0 before:left-0 before:w-1 ${ring[accent ?? "gold"]}`}
    >
      <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-text/60">
        {label}
      </div>
      <div className="mt-2 font-display text-[28px] font-extrabold leading-none tracking-tight text-ink-text">
        {value}
      </div>
      {hint && <div className="mt-2 text-xs text-ink-text/60">{hint}</div>}
    </div>
  );
}

export function SectionCard({
  title, description, children, footer,
}: {
  title?: string;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-gold/20 bg-parchment text-ink-text">
      {(title || description) && (
        <div className="px-5 py-4 border-b border-gold/25">
          {title && (
            <h2 className="font-display text-sm font-bold uppercase tracking-[0.14em] text-ink-text">
              {title}
            </h2>
          )}
          {description && (
            <p className="mt-1 text-xs text-ink-text/65">{description}</p>
          )}
        </div>
      )}
      <div className="p-5">{children}</div>
      {footer && (
        <div className="px-5 py-3 border-t border-gold/25 bg-parchment-deep rounded-b-lg text-xs text-ink-text/70">
          {footer}
        </div>
      )}
    </div>
  );
}

export function ClassBadge({ c }: { c: "A" | "B" | "C" | "D" }) {
  const map = {
    A: "bg-gold text-ink-deep border-gold",
    B: "bg-ink text-parchment border-ink",
    C: "bg-parchment-deep text-ink-text border-gold/40",
    D: "bg-transparent text-ink-text/60 border-ink-text/25",
  } as const;
  return (
    <span
      className={`inline-flex items-center justify-center w-7 h-6 rounded font-mono text-[11px] font-bold border ${map[c]}`}
    >
      {c}
    </span>
  );
}
