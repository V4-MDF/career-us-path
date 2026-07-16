/**
 * LegalDisclaimer — Aviso obrigatório exigido pela Fla. Stat. § 501.1391
 * (em vigor desde 01/07/2025).
 *
 * REQUISITOS LEGAIS (não editar sem parecer jurídico):
 *  - Texto EXATO em EN e PT-BR, ambos com o mesmo peso visual.
 *  - "Conspicuous notice": ≥14px mobile, ≥15px desktop, contraste real,
 *    sem colapso, sem opacidade reduzida, largura total.
 *  - Fundo navy sólido, texto parchment, filete superior antique gold 2px.
 *  - Deve ser posicionado imediatamente ACIMA do rodapé institucional
 *    em todas as páginas do site.
 */

const NAVY = "#0B1120";
const PARCHMENT = "#F4EBD9";
const ANTIQUE_GOLD = "#C8A24B";

const EN =
  "I AM NOT AN ATTORNEY LICENSED TO PRACTICE LAW AND MAY NOT GIVE LEGAL ADVICE OR ACCEPT FEES FOR LEGAL ADVICE. I AM NOT ACCREDITED TO REPRESENT YOU IN IMMIGRATION MATTERS.";

const PT =
  "NÃO SOU ADVOGADO LICENCIADO PARA EXERCER A ADVOCACIA E NÃO POSSO PRESTAR ORIENTAÇÃO JURÍDICA NEM COBRAR HONORÁRIOS POR ORIENTAÇÃO JURÍDICA. NÃO SOU CREDENCIADO PARA REPRESENTÁ-LO EM MATÉRIAS DE IMIGRAÇÃO.";

export function LegalDisclaimer() {
  return (
    <aside
      role="note"
      aria-label="Aviso legal obrigatório / Required legal notice"
      style={{
        backgroundColor: NAVY,
        color: PARCHMENT,
        borderTop: `2px solid ${ANTIQUE_GOLD}`,
        paddingTop: 28,
        paddingBottom: 28,
        width: "100%",
      }}
    >
      <div className="container-x">
        <div
          className="mx-auto max-w-4xl space-y-5"
          style={{
            fontSize: "14px",
            lineHeight: 1.55,
            fontWeight: 600,
          }}
        >
          <p lang="en" style={{ color: PARCHMENT }} className="md:text-[15px]">
            {EN}
          </p>
          <p lang="pt-BR" style={{ color: PARCHMENT }} className="md:text-[15px]">
            {PT}
          </p>
        </div>
      </div>
    </aside>
  );
}
