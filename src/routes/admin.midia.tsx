import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader, SectionCard } from "@/components/admin/ui";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { getMedia, mediaSlots, saveMedia } from "@/lib/admin/settings";

export const Route = createFileRoute("/admin/midia")({ component: MediaPage });

function MediaPage() {
  return (
    <>
      <PageHeader
        title="Imagens & Mídia"
        description="Logo, favicon, OG e heros. Upload direto para o CDN — mantém a qualidade original."
      />
      <div className="grid md:grid-cols-2 gap-4">
        {mediaSlots.map((s) => <MediaSlot key={s.id} id={s.id} label={s.label} />)}
      </div>
    </>
  );
}

function MediaSlot({ id, label }: { id: string; label: string }) {
  const [url, setUrl] = useState("");
  useEffect(() => { getMedia(id).then((m) => setUrl(m?.url ?? "")); }, [id]);

  async function handleChange(next: string) {
    setUrl(next);
    await saveMedia(id, next);
  }

  return (
    <SectionCard title={label}>
      <ImageUploader
        value={url}
        onChange={handleChange}
        folder="site"
        filenameHint={id}
        previewClass={id === "favicon" ? "aspect-square max-w-[160px]" : "aspect-video"}
      />
      <div className="text-[10px] text-slate-400 mt-2">Slot: <code>{id}</code></div>
    </SectionCard>
  );
}
