/**
 * Fundo de mídia da hero da Home.
 *
 * - Poster: imagem estática exibida imediatamente (evita CLS/tela preta).
 *   Se `posterUrl` estiver vazio, usa o fallback (hero-skyline).
 * - Vídeo: só é montado quando:
 *   • desktop (min-width: 1024px), E
 *   • usuário NÃO pediu prefers-reduced-motion, E
 *   • `videoUrl` é uma URL válida (arquivo MP4/WebM ou YouTube).
 * - Autoplay/mute/loop/playsinline/no-controls. Fallback silencioso para poster
 *   se o navegador não puder reproduzir.
 * - Overlay navy é aplicado no componente pai (Hero) — este é só a MÍDIA.
 */

import { useEffect, useState } from "react";
import { parseVideoUrl } from "@/lib/videoEmbed";
import heroSkyline from "@/assets/hero-skyline.jpg";
import heroFamilyVideo from "@/assets/hero-family-motion.mp4.asset.json";

/** Foto motion padrão: família caminhando em direção ao lar (horizontal, 1920x1080). */
const DEFAULT_VIDEO_URL = heroFamilyVideo.url;

/** Filtro para escurecer a mídia e garantir contraste do texto sobreposto. */
const DARKEN_FILTER = "brightness(0.55) saturate(0.9)";

type Props = {
  videoUrl: string;
  posterUrl: string;
};

function useCanPlayVideo(): boolean {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const desktop = window.matchMedia("(min-width: 1024px)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const compute = () => setOk(desktop.matches && !reduce.matches);
    compute();
    desktop.addEventListener?.("change", compute);
    reduce.addEventListener?.("change", compute);
    return () => {
      desktop.removeEventListener?.("change", compute);
      reduce.removeEventListener?.("change", compute);
    };
  }, []);
  return ok;
}

function isValidHttpOrAssetUrl(u: string): boolean {
  const s = u.trim();
  if (!s) return false;
  if (s.startsWith("/") || s.startsWith("http://") || s.startsWith("https://") || s.startsWith("data:")) return true;
  return false;
}

export function HeroBackgroundMedia({ videoUrl, posterUrl }: Props) {
  const canPlay = useCanPlayVideo();
  const trimmedVideo = videoUrl?.trim() ?? "";
  // Try user-supplied URL; if invalid/unparseable, silently fall back to the default motion clip.
  const userParsed = trimmedVideo ? parseVideoUrl(trimmedVideo) : null;
  const parsed = userParsed ?? parseVideoUrl(DEFAULT_VIDEO_URL);
  const poster = posterUrl && isValidHttpOrAssetUrl(posterUrl) ? posterUrl.trim() : heroSkyline;


  // Sempre renderiza o poster (também serve de fallback).
  return (
    <div aria-hidden className="absolute inset-0 -z-20">
      <img
        src={poster}
        alt=""
        width={1600}
        height={1024}
        fetchPriority="high"
        style={{ filter: DARKEN_FILTER }}
        className="h-full w-full object-cover object-center opacity-90 [mask-image:linear-gradient(to_bottom,black_75%,transparent_100%)]"
      />

      {canPlay && parsed?.kind === "file" && (
        <video
          className="absolute inset-0 h-full w-full object-cover object-center opacity-95 [mask-image:linear-gradient(to_bottom,black_75%,transparent_100%)]"
          style={{ filter: DARKEN_FILTER }}
          src={parsed.src}
          poster={typeof poster === "string" ? poster : undefined}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          disablePictureInPicture
          controls={false}
        />

      )}

      {canPlay && parsed?.kind === "youtube" && (
        <div className="absolute inset-0 overflow-hidden">
          {/*
            Wrapper 16:9 escalado para cobrir toda a área — YouTube não expõe object-cover.
            pointer-events-none: iframe não intercepta cliques/rolagem.
          */}
          <iframe
            title=""
            aria-hidden
            tabIndex={-1}
            className="pointer-events-none absolute left-1/2 top-1/2 h-[56.25vw] min-h-[100%] w-[177.78vh] min-w-[100%] -translate-x-1/2 -translate-y-1/2 opacity-90 motion-safe:[mask-image:linear-gradient(to_bottom,black_55%,transparent_100%)]"
            src={`https://www.youtube-nocookie.com/embed/${parsed.id}?autoplay=1&mute=1&loop=1&playlist=${parsed.id}&controls=0&modestbranding=1&playsinline=1&rel=0&iv_load_policy=3&disablekb=1&fs=0`}
            allow="autoplay; encrypted-media; picture-in-picture"
            frameBorder={0}
          />
        </div>
      )}
    </div>
  );
}
