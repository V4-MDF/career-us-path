# Suporte a YouTube nos campos de vídeo do admin

## Estado atual
- No admin (`/admin/conteudo` → Home → "Depoimentos em vídeo · Estudos de caso") já existem dois campos de URL de vídeo: `testimonials.helderVideoUrl` e `testimonials.secondaryVideoUrl`.
- Porém a Home renderiza esses valores com `<video src={url}>` (em `src/components/site/sections.tsx`), que só toca arquivos de vídeo diretos (MP4/WebM). Colar um link do YouTube ali resulta em player quebrado.
- Nenhum outro lugar do site consome vídeo hoje (fiz a busca).

## O que fazer

### 1. Utilitário `src/lib/videoEmbed.ts` (novo)
Função `parseVideoUrl(url)` que devolve:
- `{ kind: "youtube", embedUrl, id }` para `youtube.com/watch?v=`, `youtu.be/`, `youtube.com/shorts/`, `youtube.com/embed/`.
- `{ kind: "vimeo", embedUrl, id }` para `vimeo.com/<id>`.
- `{ kind: "file", src }` para URLs de arquivo direto (`.mp4`, `.webm`, `.mov`) ou qualquer outra URL http(s).
- `null` se vazio/ inválido.

URLs de embed do YouTube usam `https://www.youtube-nocookie.com/embed/<id>?rel=0&modestbranding=1` (privacy-friendly, sem "vídeos relacionados" de terceiros).

### 2. Componente `src/components/site/VideoPlayer.tsx` (novo)
Recebe `url`, `title`, `className`. Usa `parseVideoUrl`:
- `youtube`/`vimeo` → `<iframe>` responsivo com `allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"` e `allowFullScreen`, `loading="lazy"`, `title={title}`.
- `file` → `<video src controls preload="metadata">` (comportamento atual).
- `null` → placeholder "VÍDEO EM BREVE" já existente (extraído do `sections.tsx`).

### 3. Substituir o bloco `<video>` em `src/components/site/sections.tsx`
No slot de depoimentos (linhas ~661–676), trocar o `<video>`/placeholder por `<VideoPlayer url={v.url} title={v.name} />`. O layout externo (aspect-video, ring de âncora, caption) fica igual.

### 4. Melhoria de UX no admin (`src/routes/admin.conteudo.tsx`)
Nos dois labels de URL de vídeo (`helderVideoUrl`, `secondaryVideoUrl`), trocar de:
- `"Slot Helder · URL do vídeo (mp4/hospedado)"` → `"Slot Helder · URL do vídeo (YouTube, Vimeo ou MP4)"`
- idem para o slot secundário.

Não precisa mudar o widget de input — segue sendo um campo de texto simples. A detecção de formato acontece na renderização.

## Fora de escopo
- Não estou adicionando upload de vídeo (só link externo).
- Não estou tocando na hero nem em outras dobras — não há outros campos de vídeo no site hoje.
- Sem mudança de schema no Supabase; os valores continuam em `site_content` como string.
