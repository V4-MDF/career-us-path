/**
 * Settings store — wrappers tipados sobre a tabela `settings` (chave/valor).
 *
 * Centraliza branding, contatos, links sociais e tracking. Lido pelo site
 * público com fallback aos defaults abaixo; editado no admin (Links,
 * Tracking, Configurações).
 */

import { get, set } from "@/lib/dataStore";

export interface SiteSettings {
  // Configurações gerais
  site_name: string;
  site_tagline: string;
  primary_color: string; // hex
  accent_color: string;  // hex

  // Contatos
  whatsapp_br: string;       // E.164 sem +, ex 5511999999999
  whatsapp_us: string;
  email: string;
  phone_br: string;
  phone_us: string;
  endereco_orlando: string;
  cnpj: string;

  // Redes
  instagram_url: string;
  facebook_url: string;
  linkedin_url: string;
  youtube_url: string;

  // CTAs globais
  cta_hero_label: string;
  cta_form_label: string;
}

export interface TrackingSettings {
  ga4_id: string;          ga4_enabled: boolean;
  gtm_id: string;          gtm_enabled: boolean;
  meta_pixel_id: string;   meta_pixel_enabled: boolean;
  gsc_verification: string; gsc_enabled: boolean;
  rdstation_id: string;    rdstation_enabled: boolean;
  custom_head: string;     custom_head_enabled: boolean;
}

export const defaultSettings: SiteSettings = {
  site_name: "Status na América",
  site_tagline: "Green Card EB-2 NIW para profissionais brasileiros",
  primary_color: "#C9A24B",
  accent_color: "#1E3A5F",

  // Contatos reais (Prompt 5). WhatsApp Brasil ainda pendente de validação.
  whatsapp_br: "16892209714",
  whatsapp_us: "16892209714",
  email: "",
  phone_br: "",
  phone_us: "+1 689 251-0985",
  endereco_orlando: "7575 KingsPointe Pkwy #4, Orlando, FL 32819",
  cnpj: "62.917.376/0001-21",

  instagram_url: "https://instagram.com/status_america",
  facebook_url: "https://facebook.com/statusnaamerica",
  linkedin_url: "",
  youtube_url: "https://youtube.com/@status.naamerica",

  cta_hero_label: "Fazer minha avaliação gratuita",
  cta_form_label: "Quero minha avaliação gratuita",
};

export const defaultTracking: TrackingSettings = {
  ga4_id: "", ga4_enabled: false,
  gtm_id: "", gtm_enabled: false,
  meta_pixel_id: "", meta_pixel_enabled: false,
  gsc_verification: "", gsc_enabled: false,
  rdstation_id: "", rdstation_enabled: false,
  custom_head: "", custom_head_enabled: false,
};

const SETTINGS_KEY = "site";
const TRACKING_KEY = "tracking";

export async function getSiteSettings(): Promise<SiteSettings> {
  const row = await get<SiteSettings>("settings", SETTINGS_KEY);
  return { ...defaultSettings, ...(row ?? {}) };
}

export async function saveSiteSettings(values: Partial<SiteSettings>): Promise<void> {
  const current = await getSiteSettings();
  await set("settings", SETTINGS_KEY, { ...current, ...values });
  broadcast();
}

export async function getTrackingSettings(): Promise<TrackingSettings> {
  const row = await get<TrackingSettings>("settings", TRACKING_KEY);
  return { ...defaultTracking, ...(row ?? {}) };
}

export async function saveTrackingSettings(values: Partial<TrackingSettings>): Promise<void> {
  const current = await getTrackingSettings();
  await set("settings", TRACKING_KEY, { ...current, ...values });
  broadcast();
}

/* -------- media (logo/og/heros) -------- */

export interface MediaAsset {
  id: string;        // slot: logo, favicon, og_default, hero_home, hero_<segment>
  url: string;       // URL ou data:base64
  alt?: string;
  updatedAt: string;
}

export const mediaSlots = [
  { id: "logo", label: "Logo principal" },
  { id: "favicon", label: "Favicon" },
  { id: "og_default", label: "OG Image padrão" },
  { id: "hero_home", label: "Hero da Home" },
  { id: "hero_medicos", label: "Hero — Médicos" },
  { id: "hero_engenheiros", label: "Hero — Engenheiros" },
  { id: "hero_empresarios", label: "Hero — Empresários" },
];

export async function getMedia(slot: string): Promise<MediaAsset | null> {
  return get<MediaAsset>("media", slot);
}

export async function saveMedia(slot: string, url: string, alt?: string): Promise<void> {
  const asset: MediaAsset = { id: slot, url, alt, updatedAt: new Date().toISOString() };
  await set("media", slot, asset);
  broadcast();
}

/* -------- broadcast (sincroniza abas) -------- */

const CHANNEL = "status_admin_change";

export function broadcast() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CHANNEL, String(Date.now()));
    window.dispatchEvent(new CustomEvent("status:admin-change"));
  } catch { /* noop */ }
}
