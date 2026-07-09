/**
 * Silhuetas simplificadas dos mapas do Brasil e dos EUA em SVG inline.
 * Usadas como watermark discreto atrás dos cards "Brasil vs EUA".
 * Stroke fino em currentColor, sem preenchimento.
 */

import type { SVGProps } from "react";

export function BrazilMap(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 500 500"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinejoin="round"
      strokeLinecap="round"
      aria-hidden
      {...props}
    >
      <path d="M175 60 L215 55 L245 70 L285 62 L325 80 L360 95 L385 130 L410 165 L425 205 L430 245 L420 285 L400 320 L385 355 L360 385 L325 410 L285 425 L245 430 L210 420 L180 400 L155 370 L135 335 L120 295 L110 255 L105 215 L110 175 L125 135 L145 100 L165 75 Z" />
      <path d="M175 60 L155 90 L145 130 L155 165 L180 185 L215 175 L235 155 L225 125 L200 100 Z" opacity="0.6" />
    </svg>
  );
}

export function UsaMap(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 600 380"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinejoin="round"
      strokeLinecap="round"
      aria-hidden
      {...props}
    >
      <path d="M60 130 L95 105 L140 95 L185 100 L225 90 L270 85 L315 80 L360 78 L405 82 L450 90 L495 105 L530 130 L555 165 L560 200 L545 225 L520 235 L490 240 L470 260 L455 285 L440 305 L410 315 L375 320 L340 315 L305 325 L270 335 L235 340 L200 335 L170 320 L145 300 L125 275 L105 250 L85 220 L70 190 L60 160 Z" />
      <path d="M40 260 L60 275 L75 295 L70 315 L55 320 L40 305 L30 285 Z" opacity="0.5" />
      <path d="M480 130 L500 118 L520 122 L530 138 L520 152 L500 150 L485 142 Z" opacity="0.4" />
    </svg>
  );
}
