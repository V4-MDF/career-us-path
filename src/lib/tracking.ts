/**
 * Eventos de remarketing, disparados em /avaliacao e /avaliacao/obrigado.
 *
 * Públicos de remarketing (configurar no Meta/GA):
 *   • Público A. Form View: visitantes que chegaram em /avaliacao
 *       Meta:  ViewContent (content_name: "Avaliacao") + custom "FormView"
 *       GA4:   "form_view"
 *   • Público B. Lead: visitantes que chegaram em /avaliacao/obrigado
 *       Meta:  Lead
 *       GA4:   "generate_lead"
 *   • Remarketing quente = A excluindo B (chegaram ao form mas não enviaram).
 *
 * Tudo é no-op se o Pixel/GA4 não estiver carregado (TrackingInjector lê
 * settings.tracking; se desligado no admin, nada dispara, sem erro).
 */

type Params = Record<string, unknown>;

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

function isBrowser() {
  return typeof window !== "undefined";
}

/** Dispara apenas se o pixel/GA4 estiver carregado (admin → Tracking). */
function emitMeta(event: "Lead" | "ViewContent", params?: Params) {
  if (!isBrowser() || typeof window.fbq !== "function") return;
  try {
    window.fbq("track", event, params ?? {});
  } catch {
    /* noop */
  }
}

function emitMetaCustom(name: string, params?: Params) {
  if (!isBrowser() || typeof window.fbq !== "function") return;
  try {
    window.fbq("trackCustom", name, params ?? {});
  } catch {
    /* noop */
  }
}

function emitGa(event: string, params?: Params) {
  if (!isBrowser()) return;
  try {
    if (typeof window.gtag === "function") {
      window.gtag("event", event, params ?? {});
    } else if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push({ event, ...(params ?? {}) });
    }
  } catch {
    /* noop */
  }
}

/** Público A, chegou ao formulário (/avaliacao). */
export function trackFormView(meta?: Params) {
  emitMeta("ViewContent", { content_name: "Avaliacao", content_category: "Form", ...meta });
  emitMetaCustom("FormView", { content_name: "Avaliacao", ...meta });
  emitGa("form_view", { form_name: "avaliacao", ...meta });
}

/** Primeira interação real com o formulário (usuário começou a preencher). */
export function trackFormStart(meta?: Params) {
  emitMetaCustom("FormStart", { content_name: "Avaliacao", ...meta });
  emitGa("form_start", { form_name: "avaliacao", ...meta });
}

/** Clique no botão de envio do formulário (intenção de submit). */
export function trackFormSubmit(meta?: Params) {
  emitMetaCustom("FormSubmit", { content_name: "Avaliacao", ...meta });
  emitGa("form_submit", { form_name: "avaliacao", ...meta });
}

/** Público B, preencheu o formulário (/avaliacao/obrigado-*). */
export function trackLead(meta?: Params) {
  emitMeta("Lead", { content_name: "Avaliacao", ...meta });
  emitGa("generate_lead", { form_name: "avaliacao", ...meta });
}

/** Lead qualificado (score >= 50). Dispara Lead + evento custom qualificado. */
export function trackLeadQualified(meta?: Params) {
  emitMeta("Lead", { content_name: "Avaliacao", qualification: "qualificado", ...meta });
  emitMetaCustom("LeadQualified", { content_name: "Avaliacao", ...meta });
  emitGa("generate_lead", { form_name: "avaliacao", qualification: "qualificado", ...meta });
  emitGa("lead_qualificado", { form_name: "avaliacao", ...meta });
}

/** Lead não qualificado. Evento custom separado para excluir do público de conversão. */
export function trackLeadUnqualified(meta?: Params) {
  emitMetaCustom("LeadUnqualified", { content_name: "Avaliacao", ...meta });
  emitGa("lead_nao_qualificado", { form_name: "avaliacao", ...meta });
}

/**
 * Etapa 1 — clique em "Enviar" na variante WhatsApp (intenção de envio,
 * antes do link do WhatsApp abrir). Serve para medir a taxa de submit
 * do formulário separadamente de aberturas reais do WhatsApp.
 */
export function trackWhatsAppSubmit(meta?: Params) {
  emitMetaCustom("WhatsAppSubmit", { content_name: "Avaliacao", ...meta });
  emitGa("whatsapp_submit", { form_name: "avaliacao", ...meta });
}

/**
 * Etapa 2 — WhatsApp efetivamente aberto (window.open executou).
 * Considerado a conversão principal desta variante.
 */
export function trackWhatsAppOpened(meta?: Params) {
  emitMeta("Lead", { content_name: "Avaliacao", channel: "whatsapp", ...meta });
  emitMetaCustom("WhatsAppOpened", { content_name: "Avaliacao", ...meta });
  emitGa("whatsapp_opened", { form_name: "avaliacao", ...meta });
  emitGa("generate_lead", { form_name: "avaliacao", channel: "whatsapp", ...meta });
}

/**
 * @deprecated Use trackWhatsAppSubmit / trackWhatsAppOpened.
 * Mantido para compatibilidade com integrações antigas.
 */
export function trackWhatsAppClick(meta?: Params) {
  trackWhatsAppOpened(meta);
}


