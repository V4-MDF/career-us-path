/**
 * BrUsRouteBackdrop. SVG decorativo de fundo para o hero.
 * Silhuetas simplificadas de Brasil e EUA conectadas por uma rota
 * pontilhada estática. aria-hidden, leve, sem dependências e sem
 * animação contínua para não competir com o scroll.
 */
export function BrUsRouteBackdrop({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 1200 700"
      preserveAspectRatio="xMidYMid slice"
      className={`absolute inset-0 h-full w-full motif-soft ${className}`}
    >
      <defs>
        <pattern id="dot-grid" width="14" height="14" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="0.6" fill="currentColor" />
        </pattern>
      </defs>

      {/* EUA (esquerda-superior), contorno simplificado */}
      <g fill="url(#dot-grid)" stroke="currentColor" strokeWidth="0.6" opacity="0.9">
        <path d="M120 150 L380 150 L420 170 L470 165 L500 200 L470 250 L430 270 L360 285 L300 270 L250 260 L180 250 L140 230 L120 200 Z" />
      </g>
      {/* Estrela representando os EUA */}
      <g fill="currentColor" opacity="0.55">
        <polygon points="310,210 318,232 341,232 322,246 330,268 310,255 290,268 298,246 279,232 302,232" />
      </g>

      {/* Brasil (direita-inferior), contorno simplificado */}
      <g fill="url(#dot-grid)" stroke="currentColor" strokeWidth="0.6" opacity="0.9">
        <path d="M820 380 L900 360 L970 380 L1030 410 L1060 460 L1080 520 L1050 580 L990 610 L910 600 L850 560 L820 510 L800 460 Z" />
      </g>
      {/* Losango (bandeira BR) */}
      <g fill="none" stroke="currentColor" strokeWidth="1.4" opacity="0.6">
        <polygon points="935,440 1000,490 935,540 870,490" />
        <circle cx="935" cy="490" r="14" />
      </g>

      {/* Rota tracejada animada BR ↔ USA */}
      <g fill="none" stroke="currentColor" strokeWidth="1.6" opacity="0.85">
        <path
          d="M330 230 Q 600 80 935 490"
          strokeDasharray="6 8"
          strokeLinecap="round"
        />
        {/* "Avião", triângulo pequeno */}
        <polygon points="690,240 706,248 690,256 695,248" fill="currentColor" opacity="0.9" transform="rotate(38 698 248)" />
      </g>
    </svg>
  );
}
