/**
 * DualFlagIcons — SVGs inline monocromáticos das bandeiras BR e US.
 *
 * Usados como accents em eyebrows, cabeçalhos de cards e watermarks
 * discretos para reforçar a dualidade "Brasil ↔ EUA" sem colar
 * bandeiras coloridas literais (que destoariam do sistema Dossiê).
 * Cor herdada de `currentColor` — combina com qualquer surface.
 */

import type { SVGProps } from "react";

type FlagProps = SVGProps<SVGSVGElement> & { title?: string };

export function FlagBR({ title = "Brasil", className, ...rest }: FlagProps) {
  return (
    <svg
      viewBox="0 0 60 42"
      role="img"
      aria-label={title}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      {...rest}
    >
      <rect x="1" y="1" width="58" height="40" rx="1.5" />
      <path d="M30 5 L54 21 L30 37 L6 21 Z" />
      <circle cx="30" cy="21" r="7.5" />
      <path d="M22.5 22.5 Q30 18 37.5 22.5" strokeLinecap="round" />
    </svg>
  );
}

export function FlagUS({ title = "Estados Unidos", className, ...rest }: FlagProps) {
  return (
    <svg
      viewBox="0 0 60 42"
      role="img"
      aria-label={title}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.2}
      {...rest}
    >
      <rect x="1" y="1" width="58" height="40" rx="1.5" />
      {/* faixas */}
      {[7, 12, 17, 22, 27, 32, 37].map((y) => (
        <line key={y} x1="1" x2="59" y1={y} y2={y} />
      ))}
      {/* canton */}
      <rect x="1" y="1" width="26" height="20" fill="currentColor" fillOpacity="0.12" />
      {/* estrelas simplificadas — pontos */}
      {[5, 10, 15, 20].map((x) =>
        [5, 10, 15].map((y) => (
          <circle key={`${x}-${y}`} cx={x + 1.5} cy={y + 1.5} r="0.9" fill="currentColor" stroke="none" />
        )),
      )}
    </svg>
  );
}

/** Par de bandeirinhas com filete dourado entre elas — para eyebrows de dobra. */
export function FlagsBRUSDual({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`} aria-hidden>
      <FlagBR className="h-3.5 w-5 text-brazil-green" />
      <span className="h-px w-3 bg-gold/60" />
      <FlagUS className="h-3.5 w-5 text-usa-blue" />
    </span>
  );
}
