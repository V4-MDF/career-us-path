## Objetivo
1. Trocar o vídeo da hero por uma **foto motion** (cinemagraph curto e sutil) de uma família, priorizando um clipe leve com pouco movimento (mais próximo de uma foto viva do que de um vídeo tradicional).
2. No painel admin (`/admin/conteudo` e onde mais aparecer), todos os campos de **imagem** (e vídeo enviável) passam a ter **upload direto para o CDN**, além da opção de colar URL.

## Passos

### 1. Foto motion da família (hero da Home)
- Sourcing em Pexels/Coverr por clipes tipo "cinemagraph family", "family portrait subtle motion", "parents children slow motion still". Critérios:
  - Horizontal 16:9, 1920x1080.
  - Movimento sutil (cabelo ao vento, folhas, luz) — não caminhada rápida.
  - Tom naturalmente mais escuro / golden hour, para manter contraste do título.
  - ≤ 8 MB, 6–12s, loop-friendly.
- Publicar no CDN via `lovable-assets create` → `src/assets/hero-family-motion.mp4.asset.json`.
- Deletar o asset anterior `hero-family-children.mp4` do CDN.
- Atualizar `HeroBackgroundMedia.tsx` para apontar `DEFAULT_VIDEO_URL` ao novo pointer. Manter `filter: brightness(0.55) saturate(0.9)` e o mask-image atual.
- Se não achar clipe adequado, aviso antes com 2–3 opções para você escolher.

### 2. Upload em campos de imagem/vídeo do admin
- Reaproveitar `src/components/admin/ImageUploader.tsx` (já usado em `/admin/midia`) e criar um `MediaUploader` irmão que aceite também vídeo (`video/mp4`, `video/webm`), com preview em `<video muted>`.
- Em `src/routes/admin.conteudo.tsx`, detectar por rótulo/chave se o campo é:
  - **Imagem** (`heroImage`, `posterUrl`, `partners.slotN.url`, `heroVideoThumb`, `definitionImage`) → renderizar `ImageUploader` acima do `Input` de URL. O upload preenche o campo automaticamente e salva.
  - **Vídeo** (`hero.videoUrl`, `heroVideoUrl`, `testimonials.*VideoUrl`) → renderizar `MediaUploader` (aceita mp4/webm) OU manter o input para colar link do YouTube/Vimeo. Ambos coexistem: uploader p/ arquivo, campo de texto p/ link externo.
- Manter o input de URL visível e editável (nem tudo é upload — YouTube continua colando link).
- Salvar segue o mesmo fluxo `onBlur` → `set("site_content", ...)` + `broadcast()`.
- Não mexer em `/admin/midia` (já tem uploader); apenas garantir consistência visual.

## Não mexer
- Estrutura de dobras, tipografia, `mask-image`, comportamento mobile do hero.
- Auto-gen: `client.ts`, `types.ts`.
- Campos de texto puro (título, subtítulo etc.) continuam como `Input`/`Textarea`.

## Detalhe técnico
- O `ImageUploader` atual já usa storage `media` do Cloud com upload direto; `MediaUploader` para vídeo reutilizará o mesmo bucket, apenas ampliando o `accept` e o preview. Nenhuma nova tabela/migração.
