import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { PageHeader, SectionCard } from "@/components/admin/ui";
import { getTrackingSettings, saveTrackingSettings, type TrackingSettings } from "@/lib/admin/settings";

export const Route = createFileRoute("/admin/tracking")({ component: TrackingPage });

function TrackingPage() {
  const [t, setT] = useState<TrackingSettings | null>(null);
  useEffect(() => { getTrackingSettings().then(setT); }, []);
  if (!t) return null;
  const upd = <K extends keyof TrackingSettings>(k: K, v: TrackingSettings[K]) => setT({ ...t, [k]: v });

  async function save() {
    await saveTrackingSettings(t!);
    toast.success("Tracking salvo. Códigos ativos são injetados no <head> do site.");
  }

  const items: Array<{ enKey: keyof TrackingSettings; vKey: keyof TrackingSettings; label: string; placeholder: string; multi?: boolean }> = [
    { enKey: "ga4_enabled", vKey: "ga4_id", label: "Google Analytics 4", placeholder: "G-XXXXXXXX" },
    { enKey: "gtm_enabled", vKey: "gtm_id", label: "Google Tag Manager", placeholder: "GTM-XXXXXXX" },
    { enKey: "meta_pixel_enabled", vKey: "meta_pixel_id", label: "Meta Pixel", placeholder: "000000000000000" },
    { enKey: "gsc_enabled", vKey: "gsc_verification", label: "Google Search Console (meta verificação)", placeholder: "código de verificação" },
    { enKey: "rdstation_enabled", vKey: "rdstation_id", label: "RD Station", placeholder: "token RD" },
    { enKey: "custom_head_enabled", vKey: "custom_head", label: "Script personalizado (injetado no <head>)", placeholder: "<script>…</script>", multi: true },
  ];

  return (
    <>
      <PageHeader title="Tracking" description="Códigos injetados no <head> quando ativos. Salvo no dataStore (settings)."
        actions={<Button onClick={save} className="bg-amber-400 text-slate-900 hover:bg-amber-500 gap-1.5"><Save className="h-4 w-4" />Salvar</Button>} />
      <div className="grid md:grid-cols-2 gap-4">
        {items.map((it) => (
          <SectionCard key={it.vKey as string} title={it.label}>
            <div className="flex items-center gap-2 mb-3">
              <Switch checked={t[it.enKey] as boolean} onCheckedChange={(v) => upd(it.enKey, v as never)} />
              <span className="text-sm text-slate-600">{(t[it.enKey] as boolean) ? "Ativo — será injetado" : "Inativo"}</span>
            </div>
            {it.multi ? (
              <Textarea rows={5} placeholder={it.placeholder} value={t[it.vKey] as string} onChange={(e) => upd(it.vKey, e.target.value as never)} className="font-mono text-xs" />
            ) : (
              <Input placeholder={it.placeholder} value={t[it.vKey] as string} onChange={(e) => upd(it.vKey, e.target.value as never)} />
            )}
          </SectionCard>
        ))}
      </div>
      <p className="mt-4 text-xs text-slate-500">Preview: o injetor lê estas configurações ao carregar cada página e adiciona os scripts/metas ao <code>&lt;head&gt;</code>.</p>
    </>
  );
}
