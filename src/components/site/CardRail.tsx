/**
 * CardRail — trilha deslizante (swipe lateral) no mobile, grid no desktop.
 *
 * Mobile: os cards ficam lado a lado com scroll-snap, sangrando até a borda
 * da tela (compensa o padding do container-x) e deixando o próximo card
 * "espiando". Um indicador de posição acompanha o scroll.
 * md+: volta a ser a grade informada em `mdClassName`.
 *
 * Uso:
 *   <CardRail mdClassName="md:grid md:grid-cols-3 md:gap-5" count={items.length}>
 *     {items.map(...)}  // cada filho recebe as classes de item via `itemClassName`
 *   </CardRail>
 */
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

interface CardRailProps {
  children: ReactNode;
  /** Classes aplicadas a partir de md (grade original da seção). */
  mdClassName: string;
  /** Quantidade de cards, para o indicador de posição. */
  count: number;
  /** Largura do card no mobile. */
  itemWidth?: string;
  className?: string;
  ariaLabel?: string;
}

export function CardRail({
  children,
  mdClassName,
  count,
  itemWidth = "82vw",
  className = "",
  ariaLabel,
}: CardRailProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const onScroll = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const first = el.firstElementChild as HTMLElement | null;
    if (!first) return;
    const step = first.offsetWidth + 16;
    setActive(Math.round(el.scrollLeft / Math.max(step, 1)));
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [onScroll]);

  return (
    <div className={className}>
      <div
        ref={ref}
        aria-label={ariaLabel}
        style={{ ["--rail-item" as string]: itemWidth }}
        className={`card-rail ${mdClassName}`}
      >
        {children}
      </div>
      {count > 1 && (
        <div aria-hidden className="mt-4 flex justify-center gap-1.5 md:hidden">
          {Array.from({ length: count }).map((_, i) => (
            <span
              key={i}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === active ? "w-6 bg-gold" : "w-3 bg-gold/25"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default CardRail;
