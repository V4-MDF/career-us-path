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

      {/* Nota sobre os públicos de remarketing usados na LP /avaliacao */}
      <SectionCard title="Públicos de remarketing, /avaliacao">
        <div className="text-sm text-slate-700 space-y-2 leading-relaxed">
          <p>
            A LP <code className="font-mono text-xs bg-slate-100 px-1 py-0.5 rounded">/avaliacao</code> dispara
            <strong> dois eventos</strong> que alimentam públicos distintos:
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>
              <strong>Público A. Form View</strong>: ao montar <code className="font-mono text-xs">/avaliacao</code>.
              Meta Pixel: <code className="font-mono text-xs">ViewContent</code> + custom <code className="font-mono text-xs">FormView</code>.
              GA4: <code className="font-mono text-xs">form_view</code>.
            </li>
            <li>
              <strong>Público B. Lead</strong>: ao montar <code className="font-mono text-xs">/avaliacao/obrigado</code>
              (após submit). Meta Pixel: <code className="font-mono text-xs">Lead</code>. GA4: <code className="font-mono text-xs">generate_lead</code>.
            </li>
            <li>
              <strong>Remarketing quente</strong> = Público A <em>excluindo</em> Público B
              (visitou o form, não enviou). Configurar no gerenciador de anúncios.
            </li>
          </ul>
          <p className="text-xs text-slate-500">
            Os eventos só disparam se Pixel/GA4 estiverem ativos abaixo. Sem ID configurado, são no-op (não há erro).
          </p>
        </div>
      </SectionCard>

      <div className="grid md:grid-cols-2 gap-4">
        {items.map((it) => (
          <SectionCard key={it.vKey as string} title={it.label}>
            <div className="flex items-center gap-2 mb-3">
              <Switch checked={t[it.enKey] as boolean} onCheckedChange={(v) => upd(it.enKey, v as never)} />
              <span className="text-sm text-slate-600">{(t[it.enKey] as boolean) ? "Ativo, será injetado" : "Inativo"}</span>
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
