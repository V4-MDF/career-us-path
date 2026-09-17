/** Assinatura institucional e aviso para contatos iniciais. */

const NAVY = "#0B1120";
const PARCHMENT = "#F4EBD9";
const ANTIQUE_GOLD = "#C8A24B";

const EN = "Licensed in NY and AZ. Federal immigration practice only.";

/** Assinatura canônica de licenciamento. */
export const LEGAL_NOTICE_EN = EN;

/**
 * Aviso inline para formulários: o contato inicial não constitui contratação.
 */
export function LegalNoteInline({ className = "" }: { className?: string }) {
  return (
    <p lang="en" className={`text-[12px] leading-relaxed text-muted-foreground ${className}`}>
      O envio deste formulário não cria, por si só, uma relação advogado-cliente.
    </p>
  );
}

export function LegalDisclaimer() {
  return (
    <aside
      role="note"
      aria-label="Required legal notice"
      style={{
        backgroundColor: NAVY,
        color: PARCHMENT,
        borderTop: `1px solid ${ANTIQUE_GOLD}`,
        paddingTop: 18,
        paddingBottom: 18,
        width: "100%",
      }}
    >
      <div className="container-x">
        <p
          lang="en"
          className="mx-auto max-w-4xl text-center text-[14px] md:text-[15px] leading-relaxed"
          style={{ color: PARCHMENT, opacity: 0.85 }}
        >
          {EN} · Segurança jurídica para a sua mobilidade imigratória.
        </p>
      </div>
    </aside>
  );
}

