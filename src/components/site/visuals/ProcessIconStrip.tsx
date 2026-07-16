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
      className={`absolute inset-x-0 bottom-0 w-full h-[160px] motif-soft flex items-end justify-center pb-8 ${className}`}
    >
      <div className="flex items-center gap-4 opacity-70">
        <span className="h-px w-16 bg-current" />
        <span
          className="font-mono-label tracking-[0.35em] text-[11px] sm:text-[12px] whitespace-nowrap"
          style={{ fontFamily: "JetBrains Mono, monospace" }}
        >
          PREPARAÇÃO DOCUMENTAL · EB-2 NIW
        </span>
        <span className="h-px w-16 bg-current" />
      </div>
    </div>
  );
}
