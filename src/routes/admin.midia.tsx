import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AlertTriangle, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader, SectionCard } from "@/components/admin/ui";
import { getMedia, mediaSlots, saveMedia } from "@/lib/admin/settings";

export const Route = createFileRoute("/admin/midia")({ component: MediaPage });

const MAX_KB = 400; // limite educado para localStorage

function MediaPage() {
  return (
    <>
      <PageHeader
        title="Imagens & Mídia"
        description="Logo, favicon, OG e heros. Aceita URL pública ou upload (base64)."
      />
      <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 flex gap-2">
        <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
        <div>
          localStorage tem ~5MB no total. Upload de imagens grandes pode estourar.
          <strong> Na migração ao Supabase, isso passa para Storage</strong> sem mudança de UI.
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {mediaSlots.map((s) => <MediaSlot key={s.id} id={s.id} label={s.label} />)}
      </div>
    </>
  );
}

function MediaSlot({ id, label }: { id: string; label: string }) {
  const [url, setUrl] = useState("");
  useEffect(() => { getMedia(id).then((m) => setUrl(m?.url ?? "")); }, [id]);

  async function onFile(file: File) {
    if (file.size > MAX_KB * 1024) {
      toast.error(`Arquivo > ${MAX_KB}KB. Comprima ou use URL pública.`);
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      const data = String(reader.result ?? "");
      setUrl(data);
      try {
        await saveMedia(id, data);
        toast.success("Imagem salva.");
      } catch {
        toast.error("Não foi possível salvar (limite do localStorage).");
      }
    };
    reader.readAsDataURL(file);
  }

  async function saveUrl() {
    await saveMedia(id, url);
    toast.success("URL salva.");
  }

  return (
    <SectionCard title={label}>
      <div className="aspect-video rounded-md bg-slate-100 border border-slate-200 overflow-hidden mb-3 grid place-items-center">
        {url ? (
          <img src={url} alt={label} className="max-h-full max-w-full object-contain" />
        ) : (
          <span className="text-xs text-slate-400">Sem imagem</span>
        )}
      </div>
      <div className="flex gap-2 mb-2">
        <Input value={url} placeholder="URL pública (https://...)" onChange={(e) => setUrl(e.target.value)} />
        <Button variant="outline" size="sm" onClick={saveUrl}>Salvar URL</Button>
      </div>
      <label className="inline-flex items-center gap-2 text-sm text-slate-600 cursor-pointer hover:text-amber-600">
        <Upload className="h-4 w-4" />
        <span>Upload</span>
        <input type="file" accept="image/*" className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }} />
      </label>
      <div className="text-[10px] text-slate-400 mt-1">Slot: <code>{id}</code></div>
    </SectionCard>
  );
}
