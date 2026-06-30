/**
 * Glifos de bandeiras BR e US — SVG inline, monocromáticos por padrão (currentColor)
 * ou em cores oficiais quando `color="brand"`. Sem dependência externa.
 */
import type { SVGProps } from "react";

type FlagProps = SVGProps<SVGSVGElement> & { color?: "mono" | "brand" };

export function FlagBR({ color = "brand", ...p }: FlagProps) {
  if (color === "mono") {
    return (
      <svg viewBox="0 0 60 42" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden {...p}>
        <rect x="0.5" y="0.5" width="59" height="41" />
        <polygon points="30,5 55,21 30,37 5,21" />
        <circle cx="30" cy="21" r="7" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 60 42" aria-hidden {...p}>
      <rect width="60" height="42" fill="#009C3B" />
      <polygon points="30,5 55,21 30,37 5,21" fill="#FFDF00" />
      <circle cx="30" cy="21" r="7" fill="#002776" />
    </svg>
  );
}

export function FlagUS({ color = "brand", ...p }: FlagProps) {
  if (color === "mono") {
    return (
      <svg viewBox="0 0 60 42" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden {...p}>
        <rect x="0.5" y="0.5" width="59" height="41" />
        {[...Array(6)].map((_, i) => (
          <line key={i} x1="0" y1={6 + i * 6} x2="60" y2={6 + i * 6} />
        ))}
        <rect x="0.5" y="0.5" width="24" height="18" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 60 42" aria-hidden {...p}>
      <rect width="60" height="42" fill="#fff" />
      {[0, 2, 4, 6, 8, 10, 12].map((i) => (
        <rect key={i} y={i * 3} width="60" height="3" fill="#B22234" />
      ))}
      <rect width="24" height="18" fill="#3C3B6E" />
      {[...Array(9)].flatMap((_, r) =>
        [...Array(r % 2 === 0 ? 6 : 5)].map((_, c) => (
          <circle
            key={`${r}-${c}`}
            cx={2 + c * 4 + (r % 2 === 0 ? 0 : 2)}
            cy={2 + r * 2}
            r="0.6"
            fill="#fff"
          />
        ))
      )}
    </svg>
  );
}

/** Par de bandeiras "BR → US" usado em headers/badges. */
export function FlagsBRUS({ className = "", size = 18 }: { className?: string; size?: number }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <FlagBR style={{ width: size * 1.4, height: size }} className="ring-1 ring-black/10" />
      <span aria-hidden className="text-gold/70 text-xs">→</span>
      <FlagUS style={{ width: size * 1.4, height: size }} className="ring-1 ring-black/10" />
    </span>
  );
}
