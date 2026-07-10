/**
 * TrackingInjector, lê settings/tracking do dataStore e injeta scripts/metas
 * no <head>. Re-aplica em mudanças (admin) e na navegação entre rotas.
 *
 * Roda apenas no client.
 */
import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";
import { getTrackingSettings } from "@/lib/admin/settings";

const MARK = "data-status-tracking";

function clear() {
  document.head.querySelectorAll(`[${MARK}]`).forEach((n) => n.remove());
}

function addScript(id: string, src?: string, inner?: string) {
  const s = document.createElement("script");
  s.setAttribute(MARK, id);
  if (src) { s.async = true; s.src = src; }
  if (inner) s.text = inner;
  document.head.appendChild(s);
}

function addMeta(id: string, name: string, content: string) {
  const m = document.createElement("meta");
  m.setAttribute(MARK, id);
  m.setAttribute("name", name);
  m.setAttribute("content", content);
  document.head.appendChild(m);
}

async function apply() {
  if (typeof window === "undefined") return;
  const t = await getTrackingSettings();
  clear();

  if (t.ga4_enabled && t.ga4_id) {
    addScript("ga4-src", `https://www.googletagmanager.com/gtag/js?id=${t.ga4_id}`);
    addScript("ga4-init", undefined,
      `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${t.ga4_id}');`);
  }
  if (t.gtm_enabled && t.gtm_id) {
    addScript("gtm-init", undefined,
      `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${t.gtm_id}');`);
  }
  if (t.meta_pixel_enabled && t.meta_pixel_id) {
    addScript("pixel-init", undefined,
      `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${t.meta_pixel_id}');fbq('track','PageView');`);
  }
  if (t.gsc_enabled && t.gsc_verification) addMeta("gsc", "google-site-verification", t.gsc_verification);
  if (t.rdstation_enabled && t.rdstation_id) {
    addScript("rd", `https://d335luupugsy2.cloudfront.net/js/loader-scripts/${t.rdstation_id}-loader.js`);
  }
  if (t.custom_head_enabled && t.custom_head.trim()) {
    const wrap = document.createElement("div");
    wrap.innerHTML = t.custom_head;
    Array.from(wrap.children).forEach((el) => { el.setAttribute(MARK, "custom"); document.head.appendChild(el); });
  }
}

export function TrackingInjector() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  useEffect(() => { apply(); }, [pathname]);
  useEffect(() => {
    const onChange = () => apply();
    window.addEventListener("status:admin-change", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("status:admin-change", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);
  return null;
}
