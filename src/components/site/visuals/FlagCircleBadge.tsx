/**
 * FlagCircleBadge, círculo com bandeira colorida (BR ou US)
 * acompanhado de um pequeno badge circular com seta diagonal
 * (ArrowUpRight) para sinalizar "travessia / movimento".
 */

import { ArrowUpRight } from "lucide-react";
import { FlagBR as FlagBRColor, FlagUS as FlagUSColor } from "../flags";

interface Props {
  country: "br" | "us";
  size?: number;
}

export function FlagCircleBadge({ country, size = 44 }: Props) {
  const Flag = country === "br" ? FlagBRColor : FlagUSColor;
  return (
    <span className="relative inline-flex shrink-0" style={{ width: size + 10, height: size }}>
      <span
        className="inline-flex items-center justify-center rounded-full overflow-hidden ring-1 ring-white/15 shadow-md"
        style={{ width: size, height: size }}
      >
        <Flag
          preserveAspectRatio="xMidYMid slice"
          style={{ width: size * 1.35, height: size * 1.35 }}
        />
      </span>
      <span
        aria-hidden
        className="absolute -right-0 -bottom-0 inline-flex items-center justify-center rounded-full bg-ink border border-gold/60 text-gold"
        style={{ width: size * 0.5, height: size * 0.5 }}
      >
        <ArrowUpRight className="h-3 w-3" strokeWidth={2.4} />
      </span>
    </span>
  );
}
