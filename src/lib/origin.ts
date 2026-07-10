/**
 * origin.ts, captura de origem do lead (UTM + página interna).
 *
 * Combina:
 *  - utm_*, gclid, fbclid, src (querystring no momento do submit)
 *  - referrer externo (document.referrer)
 *  - última rota interna conhecida ANTES de chegar em /avaliacao
 *    (mantida por um listener no __root.tsx em sessionStorage)
 *  - landing path/title (primeira página vista nesta sessão)
 *
 * Persistência puramente client-side (sessionStorage). Nada aqui toca
 * scoring, A/B ou tracking, é só metadado para o admin.
 */
export interface LeadOrigin {
  utm: Record<string, string>;
  internal: {
    from_path: string | null;   // rota interna anterior à /avaliacao
    from_title: string | null;
    referrer: string | null;    // document.referrer (externo)
    landing_path: string | null; // primeira rota da sessão
    landing_ts: string | null;
  };
}

const SS_LAST_PATH = "sna_last_path";
const SS_LAST_TITLE = "sna_last_title";
const SS_LANDING = "sna_landing";
const SS_REFERRER = "sna_referrer";

const isBrowser = () => typeof window !== "undefined";

/**
 * Chamado pelo __root.tsx a cada mudança de rota.
 * Antes de sobrescrever last_path, salva o anterior, esse "anterior"
 * é o que importa quando o usuário chega em /avaliacao.
 */
export function trackRouteChange(pathname: string, title?: string) {
  if (!isBrowser()) return;
  try {
    // landing: só seta uma vez por sessão
    if (!sessionStorage.getItem(SS_LANDING)) {
      sessionStorage.setItem(
        SS_LANDING,
        JSON.stringify({ path: pathname, ts: new Date().toISOString() }),
      );
      if (document.referrer) sessionStorage.setItem(SS_REFERRER, document.referrer);
    }
    sessionStorage.setItem(SS_LAST_PATH, pathname);
    if (title) sessionStorage.setItem(SS_LAST_TITLE, title);
  } catch {
    /* sessionStorage indisponível, ignorar */
  }
}

/**
 * Snapshot da origem para gravar junto do lead (parcial ou completo).
 * `currentPath` é passado para não confundir a própria rota de captura
 * (ex.: /avaliacao) com a "origem".
 */
export function getOrigin(currentPath?: string): LeadOrigin {
  const utm: Record<string, string> = {};
  if (!isBrowser()) {
    return {
      utm,
      internal: { from_path: null, from_title: null, referrer: null, landing_path: null, landing_ts: null },
    };
  }
  try {
    const params = new URLSearchParams(window.location.search);
    [
      "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term",
      "gclid", "fbclid", "src",
    ].forEach((k) => {
      const v = params.get(k);
      if (v) utm[k] = v;
    });

    const lastPath = sessionStorage.getItem(SS_LAST_PATH);
    const lastTitle = sessionStorage.getItem(SS_LAST_TITLE);
    const referrer = sessionStorage.getItem(SS_REFERRER) || document.referrer || null;
    const landingRaw = sessionStorage.getItem(SS_LANDING);
    let landing_path: string | null = null;
    let landing_ts: string | null = null;
    if (landingRaw) {
      try {
        const l = JSON.parse(landingRaw) as { path: string; ts: string };
        landing_path = l.path;
        landing_ts = l.ts;
      } catch { /* ignore */ }
    }
    // não considera a própria rota atual como "origem"
    const from_path = lastPath && lastPath !== currentPath ? lastPath : null;
    return {
      utm,
      internal: {
        from_path,
        from_title: from_path ? lastTitle : null,
        referrer: referrer || null,
        landing_path,
        landing_ts,
      },
    };
  } catch {
    return {
      utm,
      internal: { from_path: null, from_title: null, referrer: null, landing_path: null, landing_ts: null },
    };
  }
}

/**
 * Texto curto para exibir na LP ("Você veio de: …").
 * Prioriza utm_campaign / utm_source; cai para from_path; depois referrer.
 */
export function describeOrigin(o: LeadOrigin): string | null {
  const { utm, internal } = o;
  const parts: string[] = [];
  if (utm.utm_campaign) parts.push(`Campanha: ${utm.utm_campaign}`);
  else if (utm.utm_source) parts.push(`Fonte: ${utm.utm_source}`);
  if (internal.from_path) parts.push(`Página: ${internal.from_path}`);
  else if (internal.referrer && !internal.from_path) {
    try {
      const host = new URL(internal.referrer).host;
      parts.push(`Origem: ${host}`);
    } catch { /* ignore */ }
  }
  return parts.length ? parts.join(" · ") : null;
}
