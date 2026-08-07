/**
 * VideoPlayer, renderiza um vídeo a partir de qualquer URL suportada
 * (YouTube, Vimeo ou arquivo direto). Sem URL, mostra placeholder
 * "VÍDEO EM BREVE" com o estilo já usado na dobra de depoimentos.
 *
 * Modo `facade`: mostra a capa do próprio vídeo (thumbnail oficial do
 * YouTube, ou `poster` enviado no admin) com botão de play. O clique carrega
 * o player NO MESMO LUGAR, já em reprodução — sem pop-up.
 */
import { useState } from "react";
import { PlayCircle } from "lucide-react";
import { parseVideoUrl, videoThumbnail } from "@/lib/videoEmbed";

export interface VideoPlayerProps {
  url: string | null | undefined;
  title: string;
  className?: string;
  /** Carrega capa + play e só monta o player após o clique. */
  facade?: boolean;
  /** Capa manual (admin). Tem prioridade sobre a thumb do próprio vídeo. */
  poster?: string | null;
}

export function VideoPlayer({ url, title, className, facade = false, poster }: VideoPlayerProps) {
  const parsed = parseVideoUrl(url);
  const wrapper = className ?? "absolute inset-0";
  const [playing, setPlaying] = useState(false);
  const [thumbFailed, setThumbFailed] = useState(false);

  if (!parsed) {
    return (
      <div className={`${wrapper} flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-ink to-ink-raise text-foreground/70`}>
        <PlayCircle className="h-14 w-14 text-gold/80" aria-hidden />
        <span className="font-mono-label text-gold/80 text-xs">VÍDEO EM BREVE</span>
      </div>
    );
  }

  if (facade && !playing) {
    const auto = videoThumbnail(parsed);
    const cover = poster?.trim()
      ? poster.trim()
      : auto
        ? thumbFailed
          ? auto.fallback
          : auto.src
        : undefined;

    return (
      <button
        type="button"
        onClick={() => setPlaying(true)}
        aria-label={`Assistir vídeo: ${title}`}
        className={`${wrapper} group h-full w-full overflow-hidden bg-ink-raise focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold`}
      >
        {cover ? (
          <img
            src={cover}
            alt=""
            width={1280}
            height={720}
            loading="lazy"
            decoding="async"
            onError={() => setThumbFailed(true)}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div aria-hidden className="absolute inset-0 bg-gradient-to-br from-[#16223A] to-[#0A111C]" />
        )}
        <div aria-hidden className="absolute inset-0 bg-black/25" />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          <PlayCircle
            className="h-12 w-12 sm:h-16 sm:w-16 text-gold drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)] transition-transform group-hover:scale-105"
            aria-hidden
          />
          <span className="hidden sm:block font-mono-label text-gold text-[10px] tracking-[0.2em]">ASSISTIR VÍDEO</span>
        </div>

      </button>
    );
  }

  if (parsed.kind === "youtube" || parsed.kind === "vimeo") {
    return (
      <iframe
        src={playing ? parsed.autoplayUrl : parsed.embedUrl}
        title={title}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className={`${wrapper} h-full w-full border-0`}
      />
    );
  }

  return (
    <video
      src={parsed.src}
      controls
      autoPlay={playing}
      poster={poster?.trim() || undefined}
      preload="metadata"
      className={`${wrapper} h-full w-full object-cover`}
    />
  );
}
