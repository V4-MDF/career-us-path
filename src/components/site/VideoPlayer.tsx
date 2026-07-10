/**
 * VideoPlayer, renderiza um vídeo a partir de qualquer URL suportada
 * (YouTube, Vimeo ou arquivo direto). Sem URL, mostra placeholder
 * "VÍDEO EM BREVE" com o estilo já usado na dobra de depoimentos.
 */
import { PlayCircle } from "lucide-react";
import { parseVideoUrl } from "@/lib/videoEmbed";

export interface VideoPlayerProps {
  url: string | null | undefined;
  title: string;
  className?: string;
}

export function VideoPlayer({ url, title, className }: VideoPlayerProps) {
  const parsed = parseVideoUrl(url);
  const wrapper = className ?? "absolute inset-0";

  if (!parsed) {
    return (
      <div className={`${wrapper} flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-ink to-ink-raise text-foreground/70`}>
        <PlayCircle className="h-14 w-14 text-gold/80" aria-hidden />
        <span className="font-mono-label text-gold/80 text-xs">VÍDEO EM BREVE</span>
      </div>
    );
  }

  if (parsed.kind === "youtube" || parsed.kind === "vimeo") {
    return (
      <iframe
        src={parsed.embedUrl}
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
      preload="metadata"
      className={`${wrapper} h-full w-full object-cover`}
    />
  );
}
