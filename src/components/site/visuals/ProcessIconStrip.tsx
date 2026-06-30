/**
 * ProcessIconStrip — tira horizontal com 4 ícones SVG ilustrando o
 * processo EB-2 NIW: passaporte → documentos → carimbo USCIS → Green Card.
 * Usado como camada decorativa atrás da dobra de processo.
 */
export function ProcessIconStrip({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 1200 200"
      preserveAspectRatio="xMidYMid meet"
      className={`absolute inset-x-0 bottom-0 w-full h-[160px] motif-soft ${className}`}
    >
      <g stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round">
        {/* linha de base */}
        <line x1="80" y1="120" x2="1120" y2="120" strokeDasharray="2 6" opacity="0.5" />

        {/* 01 passaporte */}
        <g transform="translate(160 60)">
          <rect width="80" height="110" rx="4" />
          <circle cx="40" cy="40" r="14" />
          <line x1="20" y1="74" x2="60" y2="74" />
          <line x1="20" y1="86" x2="60" y2="86" />
          <line x1="20" y1="98" x2="50" y2="98" />
        </g>

        {/* 02 documento I-140 */}
        <g transform="translate(420 60)">
          <path d="M0 0 L60 0 L80 20 L80 110 L0 110 Z" />
          <path d="M60 0 L60 20 L80 20" />
          <line x1="14" y1="44" x2="66" y2="44" />
          <line x1="14" y1="58" x2="66" y2="58" />
          <line x1="14" y1="72" x2="50" y2="72" />
          <text x="40" y="98" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="10" fill="currentColor">I-140</text>
        </g>

        {/* 03 carimbo USCIS */}
        <g transform="translate(680 60)">
          <circle cx="40" cy="55" r="38" />
          <circle cx="40" cy="55" r="30" strokeDasharray="2 3" />
          <text x="40" y="50" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="currentColor">USCIS</text>
          <text x="40" y="65" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="7" fill="currentColor">APPROVED</text>
          <path d="M30 105 L50 105 L46 110 L34 110 Z" />
        </g>

        {/* 04 Green Card */}
        <g transform="translate(940 60)">
          <rect width="120" height="76" rx="6" />
          <circle cx="22" cy="38" r="10" />
          <line x1="44" y1="28" x2="100" y2="28" />
          <line x1="44" y1="40" x2="100" y2="40" />
          <line x1="44" y1="52" x2="80" y2="52" />
          <text x="60" y="74" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="currentColor">PERMANENT RESIDENT</text>
        </g>

        {/* setas entre ícones */}
        {[290, 550, 810].map((x) => (
          <path key={x} d={`M${x} 115 L${x + 60} 115 M${x + 50} 110 L${x + 60} 115 L${x + 50} 120`} opacity="0.6" />
        ))}
      </g>
    </svg>
  );
}
