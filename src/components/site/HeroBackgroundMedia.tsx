/**
 * Fundo de mídia da hero da Home — imagem estática de família (sem vídeo).
 *
 * - Poster: imagem estática exibida imediatamente (evita CLS/tela preta).
 *   Se `posterUrl` estiver vazio/ inválido / falhar ao carregar, usa o
 *   fallback padrão (hero-family).
 * - Prop `videoUrl` mantida por compatibilidade com o admin, mas ignorada.
 * - Overlay navy é aplicado no componente pai (Hero).
 */

import { useState } from "react";
import heroFamily from "@/assets/hero-family.webp";

/** Filtro para escurecer a mídia e garantir contraste do texto sobreposto. */
const DARKEN_FILTER = "brightness(0.6) saturate(0.95)";

type Props = {
  videoUrl?: string;
  posterUrl: string;
};

function isValidHttpOrAssetUrl(u: string): boolean {
  const s = u.trim();
  if (!s) return false;
  return s.startsWith("/") || s.startsWith("http://") || s.startsWith("https://") || s.startsWith("data:");
}

export function HeroBackgroundMedia({ posterUrl }: Props) {
  const [posterFailed, setPosterFailed] = useState(false);
  const userValid = !!posterUrl && isValidHttpOrAssetUrl(posterUrl);
  const poster = userValid && !posterFailed ? posterUrl.trim() : heroFamily;

  return (
    <div aria-hidden className="absolute inset-0 -z-20">
      <img
        src={poster}
        alt=""
        width={1920}
        height={1080}
        fetchPriority="high"
        onError={() => setPosterFailed(true)}
        style={{ filter: DARKEN_FILTER }}
        className="h-full w-full object-cover object-center opacity-95 [mask-image:linear-gradient(to_bottom,black_75%,transparent_100%)]"
      />
    </div>
  );
}
