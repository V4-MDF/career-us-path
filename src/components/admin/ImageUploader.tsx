/**
 * ImageUploader, botão de upload com preview para o admin.
 *
 * Sobe o arquivo direto para o bucket `media` do Supabase Storage (RLS:
 * leitura pública, escrita apenas para admin). Devolve a URL pública via
 * `onChange`, o formato do dado armazenado no `kv_records` continua sendo
 * uma string URL, então o site público não precisa de nenhuma mudança.
 *
 * Também aceita colar uma URL externa como fallback (para quem já hospeda
 * imagens em outro CDN).
 *
 * Detecta imagens legadas em base64 (`data:image/...`) e mostra aviso
 * pedindo re-upload, o novo pipeline nunca gera base64.
 */
import { useEffect, useRef, useState } from "react";
import { Loader2, Upload, X, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

export interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  /** Subpasta dentro do bucket `media`. Ex.: "blog", "segmentos", "seo". */
  folder: string;
  /** Dica de nome (vira parte do filename). Use algo estável por slot. */
  filenameHint?: string;
  /** Tamanho máximo em MB. Default 5. */
  maxMB?: number;
  /** Tipos aceitos. Default: jpeg/png/webp/avif/svg. */
  accept?: string;
  /** Rótulo mostrado no header do slot. */
  label?: string;
  /** Ratio do preview (ex.: "aspect-video", "aspect-square"). */
  previewClass?: string;
}

const DEFAULT_ACCEPT = "image/jpeg,image/png,image/webp,image/avif,image/svg+xml";
const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/svg+xml": "svg",
};

function slugify(s: string) {
  return s.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
    .slice(0, 40) || "img";
}

export function ImageUploader({
  value,
  onChange,
  folder,
  filenameHint = "img",
  maxMB = 5,
  accept = DEFAULT_ACCEPT,
  label,
  previewClass = "aspect-video",
}: ImageUploaderProps) {
  const [busy, setBusy] = useState(false);
  const [meta, setMeta] = useState<{ w: number; h: number; kb: number } | null>(null);
  const [urlDraft, setUrlDraft] = useState(value);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setUrlDraft(value); }, [value]);

  const isBase64 = value.startsWith("data:image/");

  // Ao mudar o value, tenta ler dimensões (para dar feedback visual).
  useEffect(() => {
    if (!value || isBase64) { setMeta(null); return; }
    const img = new Image();
    img.onload = () => setMeta((m) => ({ w: img.naturalWidth, h: img.naturalHeight, kb: m?.kb ?? 0 }));
    img.onerror = () => setMeta(null);
    img.src = value;
  }, [value, isBase64]);

  async function handleFile(file: File) {
    // Validações client-side antes de mandar pro Storage.
    if (!accept.split(",").map((s) => s.trim()).includes(file.type)) {
      toast.error(`Tipo não aceito (${file.type || "desconhecido"}).`);
      return;
    }
    if (file.size > maxMB * 1024 * 1024) {
      toast.error(`Arquivo maior que ${maxMB} MB.`);
      return;
    }
    const ext = EXT_BY_TYPE[file.type] ?? (file.name.split(".").pop() ?? "bin");
    const name = `${folder}/${Date.now()}-${slugify(filenameHint)}.${ext}`;

    setBusy(true);
    try {
      const { error } = await supabase.storage
        .from("media")
        .upload(name, file, {
          contentType: file.type,
          cacheControl: "31536000, immutable", // filename tem timestamp → seguro cachear pra sempre
          upsert: false,
        });
      if (error) throw error;
      const { data } = supabase.storage.from("media").getPublicUrl(name);
      onChange(data.publicUrl);
      setUrlDraft(data.publicUrl);
      setMeta({ w: 0, h: 0, kb: Math.round(file.size / 1024) });
      toast.success("Imagem enviada.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Falha no upload.";
      toast.error(msg);
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) void handleFile(f);
  }

  function applyUrl() {
    onChange(urlDraft.trim());
    toast.success("URL aplicada.");
  }

  function clear() {
    onChange("");
    setUrlDraft("");
    setMeta(null);
  }

  return (
    <div className="space-y-2">
      {label ? <div className="text-xs font-medium text-slate-600">{label}</div> : null}

      {/* Preview + dropzone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        className={`${previewClass} relative overflow-hidden rounded-md border border-dashed border-slate-300 bg-slate-50 grid place-items-center`}
      >
        {value ? (
          <>
            <img src={value} alt="" className="h-full w-full object-contain" />
            <button
              type="button"
              onClick={clear}
              className="absolute top-2 right-2 rounded-full bg-white/90 p-1 shadow-sm hover:bg-white"
              aria-label="Remover imagem"
            >
              <X className="h-3.5 w-3.5 text-slate-700" />
            </button>
          </>
        ) : (
          <span className="text-xs text-slate-400">Arraste uma imagem ou clique em Enviar</span>
        )}
        {busy ? (
          <div className="absolute inset-0 bg-white/70 grid place-items-center">
            <Loader2 className="h-5 w-5 animate-spin text-slate-500" />
          </div>
        ) : null}
      </div>

      {/* Alerta base64 legado */}
      {isBase64 ? (
        <div className="flex gap-2 rounded border border-amber-200 bg-amber-50 px-2.5 py-2 text-[11px] text-amber-900">
          <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
          <span>Imagem legada em base64. Reenvie para migrar ao CDN.</span>
        </div>
      ) : meta ? (
        <div className="text-[11px] text-slate-500">
          {meta.w ? `${meta.w}×${meta.h}px` : ""} {meta.kb ? `· ${meta.kb} KB` : ""}
        </div>
      ) : null}

      {/* Ações */}
      <div className="flex flex-wrap gap-2">
        <input
          ref={fileRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleFile(f); }}
        />
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={busy}
          onClick={() => fileRef.current?.click()}
          className="gap-1.5"
        >
          <Upload className="h-3.5 w-3.5" /> Enviar imagem
        </Button>
      </div>

      {/* Fallback URL externa */}
      <div className="flex gap-2">
        <Input
          value={urlDraft}
          placeholder="ou cole uma URL pública (https://...)"
          onChange={(e) => setUrlDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); applyUrl(); } }}
          className="text-xs"
        />
        <Button type="button" size="sm" variant="ghost" onClick={applyUrl} disabled={urlDraft === value}>
          Aplicar URL
        </Button>
      </div>

      <div className="text-[10px] text-slate-400">
        Máx {maxMB} MB · JPG, PNG, WebP, AVIF, SVG · pasta <code>media/{folder}</code>
      </div>
    </div>
  );
}
