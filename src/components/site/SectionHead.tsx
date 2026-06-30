/**
 * SectionHead — assinatura visual do sistema "Dossiê / Credencial".
 * Filete dourado + número de seção em mono + eyebrow + título display.
 *
 * Uso:
 *   <SectionHead num="02" eyebrow="POR QUE OS EUA" title="..." />
 * Sem número (seções não-sequenciais), basta omitir `num`.
 */

import type { ReactNode } from "react";

interface Props {
  num?: string;
  eyebrow: string;
  title?: ReactNode;
  kicker?: ReactNode;
  align?: "left" | "center";
  variant?: "ink" | "parchment";
}

export function SectionHead({
  num,
  eyebrow,
  title,
  kicker,
  align = "left",
  variant = "ink",
}: Props) {
  const titleClass =
    variant === "parchment"
      ? "text-ink-text"
      : "text-foreground";
  const eyebrowClass =
    variant === "parchment" ? "text-ink-text/70" : "text-gold";

  return (
    <div className={align === "center" ? "text-center mx-auto max-w-3xl" : "max-w-3xl"}>
      <div className={`flex items-center gap-3 ${align === "center" ? "justify-center" : ""}`}>
        <span aria-hidden className="h-px w-10 bg-gold/70" />
        <span className={`font-mono-label ${eyebrowClass}`}>
          {num && <span className="mr-2 text-gold">{num}</span>}
          {eyebrow}
        </span>
      </div>
      {title && (
        <h2 className={`display-2 mt-6 ${titleClass}`}>
          {title}
        </h2>
      )}
      {kicker && (
        <p className={`mt-6 lead max-w-2xl ${variant === "parchment" ? "text-ink-text/75" : ""}`}>
          {kicker}
        </p>
      )}

    </div>
  );
}
