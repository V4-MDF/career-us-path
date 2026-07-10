/**
 * <SectionAnchor>, wrapper semântico para uma dobra com URL própria.
 *
 * - Aplica `id`, `aria-labelledby` e o utilitário CSS `section-anchor`
 *   (que injeta `scroll-margin-top` para compensar o header fixo).
 * - Não muda layout, render via `as` (default `section`).
 *
 * Não é obrigatório para que o useScrollSpy funcione (basta um id no
 * `<section>`), mas centraliza a semântica e o offset de scroll.
 */

import type { ElementType, ReactNode } from "react";

interface Props {
  id: string;
  /** Label da dobra (usado em aria-label se não houver heading interno). */
  label?: string;
  as?: ElementType;
  className?: string;
  children: ReactNode;
}

export function SectionAnchor({
  id,
  label,
  as: As = "section",
  className,
  children,
}: Props) {
  const Comp = As as ElementType;
  return (
    <Comp
      id={id}
      aria-label={label}
      className={`section-anchor ${className ?? ""}`.trim()}
    >
      {children}
    </Comp>
  );
}
