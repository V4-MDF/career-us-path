/**
 * FamilySealBackdrop, silhuetas de família + selo de águia/credencial.
 * Usado na dobra "Legado" para fixar a ideia de família como beneficiária
 * do Green Card. Pure SVG, aria-hidden.
 */
export function FamilySealBackdrop({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 1200 600"
      preserveAspectRatio="xMidYMid slice"
      className={`absolute inset-0 h-full w-full motif-soft ${className}`}
    >
      {/* Família, 4 figuras lineares (pai, mãe, criança, bebê) */}
      <g fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" opacity="0.9">
        {/* pai */}
        <circle cx="180" cy="200" r="22" />
        <path d="M158 230 L158 340 M202 230 L202 340 M158 280 L202 280 M158 340 L150 420 M202 340 L210 420" />
        {/* mãe */}
        <circle cx="260" cy="210" r="20" />
        <path d="M240 238 Q 260 260 280 238 L290 360 L270 360 L260 280 L250 360 L230 360 Z" />
        {/* criança */}
        <circle cx="320" cy="240" r="14" />
        <path d="M306 260 L306 330 M334 260 L334 330 M306 295 L334 295 M306 330 L300 380 M334 330 L340 380" />
        {/* bebê (mãe segura) */}
        <circle cx="232" cy="278" r="10" />
        <path d="M222 290 L222 310 M242 290 L242 310" />
      </g>

      {/* Selo circular, águia estilizada à direita */}
      <g transform="translate(960 280)" stroke="currentColor" strokeWidth="1.4" fill="none">
        <circle r="170" opacity="0.45" />
        <circle r="148" opacity="0.6" strokeDasharray="3 4" />
        {/* águia geométrica */}
        <g opacity="0.95" strokeLinejoin="round" strokeLinecap="round">
          <path d="M0 -70 L-50 -30 L-90 -10 L-50 -20 L-30 10 L0 -20 L30 10 L50 -20 L90 -10 L50 -30 Z" />
          <circle cx="0" cy="-60" r="6" fill="currentColor" />
          <path d="M-30 10 L-20 50 L-10 30 L0 60 L10 30 L20 50 L30 10" />
          {/* escudo */}
          <path d="M-22 65 L22 65 L18 110 L0 124 L-18 110 Z" />
          <path d="M-22 75 L22 75 M-20 85 L20 85" />
        </g>
        <text
          x="0" y="-110"
          textAnchor="middle"
          fontFamily="JetBrains Mono, monospace"
          fontSize="10"
          letterSpacing="3"
          fill="currentColor"
        >FAMILY · LEGACY · USA</text>
      </g>

      {/* Estrelas pontuais ligando família e selo */}
      <g fill="currentColor" opacity="0.6">
        {[420, 540, 680, 800].map((x, i) => (
          <polygon
            key={x}
            points={`${x},300 ${x + 4},308 ${x + 12},308 ${x + 6},313 ${x + 8},321 ${x},316 ${x - 8},321 ${x - 6},313 ${x - 12},308 ${x - 4},308`}
            opacity={0.4 + i * 0.1}
          />
        ))}
      </g>
    </svg>
  );
}
