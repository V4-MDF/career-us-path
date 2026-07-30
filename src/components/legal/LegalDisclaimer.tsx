/**
 * LegalDisclaimer — Aviso obrigatório exigido pela Fla. Stat. § 501.1391
 * (em vigor desde 01/07/2025).
 *
 * REQUISITOS LEGAIS (não editar sem parecer jurídico):
 *  - Texto em inglês, visível e legível, com contraste real.
 *  - Conspicuous notice: ≥14px mobile, ≥15px desktop, sem colapso, largura total.
 *  - Fundo navy sólido, texto parchment, filete superior antique gold 2px.
 *  - Deve ser posicionado imediatamente ACIMA do rodapé institucional
 *    em todas as páginas do site.
 */

const NAVY = "#0B1120";
const PARCHMENT = "#F4EBD9";
const ANTIQUE_GOLD = "#C8A24B";

const EN =
  "i am not an attorney licensed to practice law and may not give legal advice or accept fees for legal advice. i am not accredited to represent you in immigration matters.";

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
          className="mx-auto max-w-4xl text-center text-[13px] md:text-[14px] leading-relaxed"
          style={{ color: PARCHMENT, opacity: 0.85 }}
        >
          {EN}
        </p>
      </div>
    </aside>
  );
}

