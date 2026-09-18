/**
 * Constantes institucionais de credenciais / provas sociais.
 *
 * COMPLIANCE (FTC Act §5 e FDUTPA): números em publicidade nos EUA
 * exigem lastro documental verificável ANTES da publicação. Todos os
 * Os valores institucionais abaixo estão ativos no site público.
 *
 * Preserve documentação comprobatória para toda afirmação publicitária.
 */

export type PendingClaim = {
  value: string;
  label: string;
  /** Controla a exibição pública da afirmação. */
  pending: boolean;
  /** Nota interna sobre o que precisa ser confirmado. */
  note?: string;
};

// ==== Números institucionais ativos =====
export const CLAIM_FAMILIAS: PendingClaim = {
  value: "1.000+",
  label: "famílias atendidas",
  pending: false,
};

export const CLAIM_PROCESSOS: PendingClaim = {
  value: "5.000+",
  label: "processos estruturados",
  pending: false,
};

export const CLAIM_SATISFACAO: PendingClaim = {
  value: "98%",
  label: "de satisfação",
  pending: false,
};

export const CLAIM_AVALIACOES: PendingClaim = {
  value: "130+",
  label: "avaliações 5★",
  pending: false,
};

// ==== Trajetória =====
/**
 * Texto institucional ativo, sem afirmações numéricas adicionais.
 */
export const TRAJECTORY_STATEMENT =
  "Equipe com trajetória consolidada em processos de imigração, com sede própria em Orlando desde 2022.";

// ==== Google ======================================================
// Não cravar "5,0" nem "Nota 5,0": a média muda no dia em que
// qualquer avaliação inferior aparece.
export const GOOGLE_RATING_LABEL = "Avaliações 5★ no Google";

// ==== BBB =========================================================
/**
 * As opções abaixo são mutuamente excludentes:
 *   - "BBB Accredited Business": a empresa é acreditada pelo BBB.
 *   - "BBB Rating A": a empresa apenas tem a nota A, sem acreditação.
 * Tratar como sinônimo é falso.
 */
export const BBB_LABEL_ACCREDITED = "BBB Accredited Business";
export const BBB_LABEL_RATING_ONLY = "BBB Rating A";
/** Rótulo público adotado. */
export const BBB_LABEL: string = BBB_LABEL_RATING_ONLY;
export const BBB_PENDING = false;

// ==== Identificadores públicos (verificáveis) =====================
// Não são "claims"; são registros públicos confirmáveis.
export const EIN = "42-4745152";
export const CNPJ = "62.917.376/0001-21";
