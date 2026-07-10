/**
 * Lista de chaves de conteúdo / estatística que estão PENDENTES de validação
 * pelo cliente (substituem o antigo placeholder "[CONFIRMAR]" que vazava no front).
 *
 * O site público NUNCA renderiza esse rótulo, exibe apenas o valor limpo.
 * O admin pode consultar essa lista para mostrar um pequeno indicador
 * "pendente de validação" ao lado do campo correspondente.
 */
export const PENDING_VALIDATION: Record<string, true> = {
  // Home
  "hero.proof": true,
  "why.stat.experience": true,
  "why.stat.families": true,
  "salary.medico": true,
  "salary.engenheiro": true,
  "salary.ti": true,
  // Footer / contato
  "contact.whatsapp_br": true,
  "contact.whatsapp_us": true,
  "contact.cnpj": true,
  "contact.address_us": true,
  // Segmentos (LPs)
  "segment.medicos.prova_social": true,
  "segment.medicos.lado_eua": true,
  "segment.engenheiros.prova_social": true,
  "segment.engenheiros.lado_brasil": true,
  "segment.engenheiros.lado_eua": true,
  "segment.empresarios.prova_social": true,
  // Sobre — números/credenciais aguardando confirmação do cliente
  "sobre.numeros.n1.valor": true,
  "sobre.numeros.n2.valor": true,
  "sobre.numeros.n3.valor": true,
  "sobre.numeros.n4.valor": true,
  "sobre.numeros.n5.valor": true,
  "sobre.numeros.n6.valor": true,
};

export function isPending(key: string): boolean {
  return PENDING_VALIDATION[key] === true;
}
