/**
 * Parse a video URL and return the correct embed shape.
 *
 * Suporta:
 * - YouTube: watch?v=, youtu.be/, /shorts/, /embed/
 * - Vimeo: vimeo.com/<id>
 * - Arquivos diretos (mp4/webm/mov/m4v) e qualquer outra URL http(s) → tratada como arquivo
 * - Vazio/inválido → null
 *
 * `thumbnailUrl` traz a capa oficial do próprio vídeo quando existe URL
 * estável (YouTube). Vimeo exige API → sem thumb.
 */
export type ParsedVideo =
  | { kind: "youtube"; id: string; embedUrl: string; autoplayUrl: string; thumbnailUrl: string; thumbnailFallbackUrl: string }
  | { kind: "vimeo"; id: string; embedUrl: string; autoplayUrl: string }
  | { kind: "file"; src: string };

const YT_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "youtu.be",
  "youtube-nocookie.com",
  "www.youtube-nocookie.com",
]);

const VIMEO_HOSTS = new Set(["vimeo.com", "www.vimeo.com", "player.vimeo.com"]);

const FILE_EXT = /\.(mp4|webm|mov|m4v|ogg)(\?.*)?$/i;

function ytId(u: URL): string | null {
  const host = u.hostname.toLowerCase();
  if (host === "youtu.be") return u.pathname.slice(1).split("/")[0] || null;
  if (u.pathname.startsWith("/watch")) return u.searchParams.get("v");
  const m = u.pathname.match(/^\/(embed|shorts|v)\/([^/?#]+)/);
  if (m) return m[2];
  return null;
}

function vimeoId(u: URL): string | null {
  // vimeo.com/123456789  ou  player.vimeo.com/video/123456789
  const m = u.pathname.match(/\/(?:video\/)?(\d+)/);
  return m ? m[1] : null;
}

export function parseVideoUrl(raw: string | null | undefined): ParsedVideo | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  // Caminho relativo (ex.: /__l5e/assets-v1/.../hero.mp4) → arquivo direto.
  if (trimmed.startsWith("/")) {
    return { kind: "file", src: trimmed };
  }

  let u: URL;
  try {
    u = new URL(trimmed);
  } catch {
    return null;
  }
  if (u.protocol !== "http:" && u.protocol !== "https:") return null;

  const host = u.hostname.toLowerCase();

  if (YT_HOSTS.has(host)) {
    const id = ytId(u);
    if (id) {
      const base = `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1`;
      return {
        kind: "youtube",
        id,
        embedUrl: base,
        autoplayUrl: `${base}&autoplay=1&playsinline=1`,
        thumbnailUrl: `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`,
        thumbnailFallbackUrl: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
      };
    }
  }

  if (VIMEO_HOSTS.has(host)) {
    const id = vimeoId(u);
    if (id) {
      const base = `https://player.vimeo.com/video/${id}?dnt=1`;
      return {
        kind: "vimeo",
        id,
        embedUrl: base,
        autoplayUrl: `${base}&autoplay=1&playsinline=1`,
      };
    }
  }

  // Se termina com extensão de vídeo OU não é YT/Vimeo → tratamos como arquivo direto.
  if (FILE_EXT.test(u.pathname) || (!YT_HOSTS.has(host) && !VIMEO_HOSTS.has(host))) {
    return { kind: "file", src: trimmed };
  }

  return null;
}

/** Capa do próprio vídeo, quando disponível. */
export function videoThumbnail(parsed: ParsedVideo | null): { src: string; fallback?: string } | null {
  if (!parsed) return null;
  if (parsed.kind === "youtube") {
    return { src: parsed.thumbnailUrl, fallback: parsed.thumbnailFallbackUrl };
  }
  return null;
}
