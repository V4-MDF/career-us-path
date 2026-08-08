/**
 * Webhook de leads. Envia cada lead novo para uma URL externa configurada
 * em Admin › Tracking. O POST é feito através de um endpoint próprio do app
 * (/api/public/lead-webhook) para evitar bloqueio de CORS no destino.
 */
import { getTrackingSettings } from "@/lib/admin/settings";
import { buildLeadWebhookPayload } from "@/lib/leadWebhookPayload";

async function post(url: string, payload: unknown) {
  const res = await fetch("/api/public/lead-webhook", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, payload }),
  });
  const body = (await res.json().catch(() => ({}))) as { ok?: boolean; status?: number; error?: string };
  if (!res.ok || !body.ok) {
    throw new Error(body.error ?? `Falha no webhook (status ${body.status ?? res.status})`);
  }
  return body;
}

/** Fire-and-forget: nunca lança para o fluxo do formulário. */
export async function sendLeadWebhook(lead: Record<string, unknown>): Promise<void> {
  try {
    const t = await getTrackingSettings();
    if (!t.webhook_enabled || !t.webhook_url.trim()) return;
    await post(t.webhook_url.trim(), buildLeadWebhookPayload(lead, "lead.created"));
  } catch (e) {
    console.warn("[webhook] envio do lead falhou", e);
  }
}

/** Usado pelo botão "Testar webhook" no admin. Lança em caso de erro. */
export async function testLeadWebhook(url: string): Promise<void> {
  const exemplo: Record<string, unknown> = {
    id: "lead_teste",
    createdAt: new Date().toISOString(),
    nome: "Lead de Teste",
    email: "teste@statusnaamerica.com.br",
    whatsapp: "(31) 97338-6303",
    objetivo_visto: "morar",
    profissao: "medico",
    formacao: "mestrado",
    faixaEtaria: "40_49",
    renda: "40_80",
    momento: "ja_decidi",
    cidade: "",
    uf: "",
    score: 85,
    qualification: "qualificado",
    qualification_reasons: [],
    status: "novo",
    segmento: null,
    variante_ab: null,
    utm: { utm_source: "teste", utm_medium: "admin", utm_campaign: "webhook_test" },
    origin: {
      utm: {},
      internal: {
        from_path: "/",
        from_title: "Home",
        referrer: "",
        landing_path: "/",
        landing_ts: new Date().toISOString(),
      },
    },
  };
  await post(url, buildLeadWebhookPayload(exemplo, "lead.test"));
}
