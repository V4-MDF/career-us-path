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
