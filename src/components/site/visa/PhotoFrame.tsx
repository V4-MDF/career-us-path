/**
 * PhotoFrame, moldura fotográfica padrão do site "Status Immigration Law Firm".
 *
 * Aplica o tratamento visual único a QUALQUER fotografia usada nas páginas
 * de visto: warmth dourada leve, contraste elevado sutil, dessaturação
 * discreta, grão fino e vinheta, para que toda foto pareça da mesma
 * "família visual" (Dossiê/Credencial).
 *
 * Uso:
 *   <PhotoFrame src={img} alt="..." ratio="4/5" priority />
 *   <PhotoFrame src={img} alt="..." fill /> // preenche o pai (position:relative)
 *
 * NUNCA usar ilustração/imagem genérica de IA, sempre fotografia real
 * art-direcionada com este tratamento.
 */
import { cn } from "@/lib/utils";

interface PhotoFrameProps {
  src: string;
  alt: string;
  /** Aspect ratio CSS ("4/5", "3/2", "16/9"). Ignorado se `fill`. */
  ratio?: string;
  /** Preenche o container pai (position:absolute inset-0). */
  fill?: boolean;
  /** LCP hint, usar apenas no hero. */
  priority?: boolean;
  className?: string;
  width?: number;
  height?: number;
  /** Object-position: "center", "top", "50% 30%". */
  focal?: string;
}

export function PhotoFrame({
  src, alt, ratio, fill, priority, className, width, height, focal = "center",
}: PhotoFrameProps) {
  return (
    <div
      className={cn(
        "photo-treatment relative overflow-hidden",
        fill ? "absolute inset-0" : "w-full",
        !fill && "rounded-2xl",
        className,
      )}
      style={!fill && ratio ? { aspectRatio: ratio } : undefined}
    >
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
        className="h-full w-full object-cover"
        style={{ objectPosition: focal }}
      />
      {/* Grão fino + vinheta discreta, parte do tratamento padrão. */}
      <div aria-hidden className="photo-treatment__grain" />
      <div aria-hidden className="photo-treatment__vignette" />
    </div>
  );
}
