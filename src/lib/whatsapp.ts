/**
 * Helpers para montar links de WhatsApp (wa.me) com mensagem pré-preenchida.
 *
 * O número-fonte é o `whatsapp_br` salvo em `settings` (admin/configuracoes).
 * Em SSR ou erro, cai para o default em `defaultSettings`.
 */

import { getSiteSettings, defaultSettings } from "@/lib/admin/settings";

/** Remove tudo que não for dígito (wa.me exige E.164 sem +). */
function digits(s: string): string {
  return (s || "").replace(/\D+/g, "");
}

/**
 * Gera href https://wa.me/<num>?text=<msg>.
 * Lê o número configurado de forma assíncrona — para uso em handlers e effects.
 */
export async function buildWhatsAppLink(message: string): Promise<string> {
  const s = await getSiteSettings().catch(() => defaultSettings);
  const num = digits(s.whatsapp_br || defaultSettings.whatsapp_br);
  return `https://wa.me/${num}?text=${encodeURIComponent(message)}`;
}

/** Versão síncrona quando o caller já tem o número em mãos. */
export function whatsappLinkFor(number: string, message: string): string {
  return `https://wa.me/${digits(number)}?text=${encodeURIComponent(message)}`;
}

/**
 * Monta a mensagem enviada ao WhatsApp após o envio do formulário geral.
 * Inclui os dados que o lead preencheu para o atendente já entrar em contexto.
 */
export interface LeadWhatsAppInput {
  nome?: string;
  email?: string;
  whatsapp?: string;
  objetivo_visto?: string;
  profissao?: string;
  formacao?: string;
  faixaEtaria?: string;
  cidade?: string;
  uf?: string;
  renda?: string;
  momento?: string;
}

export function leadWhatsAppMessage(lead: LeadWhatsAppInput): string {
  const cidadeUf = [lead.cidade, lead.uf].filter(Boolean).join("/");
  const linhas: string[] = [
    "Olá! Acabei de enviar meu perfil para análise no site da Status na América.",
    "",
    "*Meus dados:*",
    lead.nome ? `• Nome: ${lead.nome}` : null,
    lead.email ? `• E-mail: ${lead.email}` : null,
    lead.whatsapp ? `• WhatsApp: ${lead.whatsapp}` : null,
    lead.profissao ? `• Profissão: ${lead.profissao}` : null,
    lead.formacao ? `• Formação: ${lead.formacao}` : null,
    lead.faixaEtaria ? `• Faixa etária: ${lead.faixaEtaria}` : null,
    cidadeUf ? `• Cidade: ${cidadeUf}` : null,
    lead.renda ? `• Renda mensal: ${lead.renda}` : null,
    lead.momento ? `• Momento: ${lead.momento}` : null,
    "",
    "Gostaria de conversar sobre os próximos passos.",
  ].filter((l): l is string => l !== null);
  return linhas.join("\n");
}
