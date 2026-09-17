/**
 * Bloco tipográfico neutro usado como camada decorativa atrás da dobra
 * de processo (EB-2 NIW). Substitui a antiga ilustração com selos de
 * "I-140 / USCIS / APPROVED / PERMANENT RESIDENT", que sugeria chancela
 * oficial. Mantém o mesmo footprint visual (faixa horizontal inferior,
 * baixo contraste) sem elementos que possam ser lidos como credencial.
 */
export function ProcessIconStrip({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`absolute inset-x-0 bottom-0 w-full h-[160px] motif-soft flex items-end justify-center px-5 pb-8 ${className}`}
    >
      <div className="flex w-full max-w-full items-center justify-center gap-2 opacity-70 sm:gap-4">
        <span className="hidden h-px w-8 shrink bg-current sm:block sm:w-16" />
        <span
          className="min-w-0 truncate font-mono-label tracking-[0.2em] text-[9px] sm:tracking-[0.35em] sm:text-[12px]"
          style={{ fontFamily: "JetBrains Mono, monospace" }}
        >
          ESTRATÉGIA JURÍDICA · EB-2 NIW
        </span>
        <span className="hidden h-px w-8 shrink bg-current sm:block sm:w-16" />
      </div>
    </div>

  );
}
