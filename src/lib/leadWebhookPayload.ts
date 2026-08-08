/**
 * Monta o payload plano enviado ao webhook de leads.
 *
 * O objeto do lead salvo no banco usa códigos internos (`20_40`, `ja_decidi`)
 * e aninha `utm`/`origin`. Ferramentas de automação (Zapier, Make, planilhas)
 * leem melhor um objeto plano e com rótulos legíveis, então aqui achatamos
 * tudo e adicionamos os campos `*_label`.
 *
 * `LEAD_OPTION_LABELS` é a fonte única dos rótulos, também usada pelo
 * formulário progressivo para exibir o resumo das respostas.
 */

export const LEAD_OPTION_LABELS: Record<string, Record<string, string>> = {
  objetivo_visto: {
    morar: "Morar definitivamente",
    trabalhar: "Trabalhar",
    estudar: "Estudar",
    turismo: "Turismo",
  },
  profissao: {
    medico: "Médico", dentista: "Dentista", engenheiro: "Engenheiro",
    advogado: "Advogado", empresario: "Empresário", ti: "Tecnologia / TI",
    outra_qualificada: "Outra área qualificada", outra: "Outra",
  },
  formacao: {
    doutorado: "Doutorado", mestrado: "Mestrado", pos: "Pós-graduação",
    superior: "Ensino superior", sem_superior: "Sem ensino superior",
  },
  faixaEtaria: {
    "ate_29": "Até 29 anos", "30_39": "30 a 39", "40_49": "40 a 49", "50_mais": "50+",
  },
  renda: {
    "ate_10": "Até R$ 10 mil",
    "10_20": "R$ 10–20 mil",
    "20_40": "R$ 20–40 mil",
    "40_80": "R$ 40–80 mil",
    "80_150": "R$ 80–150 mil",
    "150_mais": "Acima de R$ 150 mil",
  },
  momento: {
    ja_decidi: "Já decidi", proximos_1_2: "Próximos 1–2 anos", sonho: "Pesquisando / sonho",
  },
};

function label(field: string, value: unknown): string {
  const v = typeof value === "string" ? value : "";
  if (!v) return "";
  return LEAD_OPTION_LABELS[field]?.[v] ?? v;
}

function str(v: unknown): string {
  return typeof v === "string" ? v : v == null ? "" : String(v);
}

/** Somente dígitos, com 55 na frente quando o número parece brasileiro. */
function toE164Digits(whatsapp: unknown): string {
  const d = str(whatsapp).replace(/\D/g, "");
  if (!d) return "";
  if (d.startsWith("55")) return d;
  if (d.length === 10 || d.length === 11) return `55${d}`;
  return d;
}

export interface LeadWebhookPayload {
  event: string;
  [key: string]: unknown;
}

export function buildLeadWebhookPayload(
  lead: Record<string, unknown>,
  event = "lead.created",
): LeadWebhookPayload {
  const utm = (lead["utm"] ?? {}) as Record<string, string>;
  const origin = (lead["origin"] ?? {}) as {
    utm?: Record<string, string>;
    internal?: Record<string, string | null>;
  };
  const internal = origin.internal ?? {};
  const u = { ...(origin.utm ?? {}), ...utm };

  return {
    event,

    // Identificação
    id: str(lead["id"]),
    created_at: str(lead["createdAt"]),
    nome: str(lead["nome"]),
    email: str(lead["email"]),
    whatsapp: str(lead["whatsapp"]),
    whatsapp_e164: toE164Digits(lead["whatsapp"]),

    // Respostas (valor bruto + rótulo legível)
    objetivo_visto: str(lead["objetivo_visto"]),
    objetivo_visto_label: label("objetivo_visto", lead["objetivo_visto"]),
    profissao: str(lead["profissao"]),
    profissao_label: label("profissao", lead["profissao"]),
    formacao: str(lead["formacao"]),
    formacao_label: label("formacao", lead["formacao"]),
    faixa_etaria: str(lead["faixaEtaria"]),
    faixa_etaria_label: label("faixaEtaria", lead["faixaEtaria"]),
    renda: str(lead["renda"]),
    renda_label: label("renda", lead["renda"]),
    momento: str(lead["momento"]),
    momento_label: label("momento", lead["momento"]),
    cidade: str(lead["cidade"]),
    uf: str(lead["uf"]),

    // Avaliação
    score: typeof lead["score"] === "number" ? (lead["score"] as number) : null,
    qualification: str(lead["qualification"]),
    qualification_reasons: Array.isArray(lead["qualification_reasons"])
      ? (lead["qualification_reasons"] as unknown[]).map(str)
      : [],
    status: str(lead["status"]),

    // Origem
    segmento: str(lead["segmento"]),
    variante_ab: str(lead["variante_ab"]),
    landing_page: str(internal["landing_path"]),
    from_path: str(internal["from_path"]),
    from_title: str(internal["from_title"]),
    referrer: str(internal["referrer"]),
    utm_source: str(u["utm_source"]),
    utm_medium: str(u["utm_medium"]),
    utm_campaign: str(u["utm_campaign"]),
    utm_content: str(u["utm_content"]),
    utm_term: str(u["utm_term"]),
    gclid: str(u["gclid"]),
    fbclid: str(u["fbclid"]),

    // Objeto original completo, para quem precisar de algo fora do formato plano
    lead_raw: lead,
  };
}
