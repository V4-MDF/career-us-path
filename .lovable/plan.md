
## Diagnóstico do estado atual

Hoje o admin tem três padrões diferentes — nenhum bom para qualidade:

| Local | Como funciona hoje | Problema |
|---|---|---|
| `/admin/midia` (logo, favicon, OG, heros) | Upload vira **base64** salvo no banco, limitado a **400 KB** | Comprime demais, incha o banco, sem CDN |
| `/admin/blog` (capa + og_image) | Upload vira **base64** no post, **sem limite** | Estoura linhas do banco, imagens de 2 MB carregam inline em todo request |
| `/admin/segmentos`, `/admin/seo`, `/admin/ab` (hero de LP, og_image, variantes A/B) | **Só campo de URL** — sem botão de upload | Obriga o operador a hospedar por fora |

Base64 no banco = imagem trafega dentro do HTML/JSON, sem cache HTTP, sem redimensionamento, e o limite de 400 KB força perda visível de qualidade.

## O que vai mudar

Migrar todos os uploads para **Supabase Storage** (já ativo via Lovable Cloud), servindo os arquivos originais via CDN. Sem base64. Sem limite artificial de 400 KB.

### 1. Bucket de mídia

Criar bucket público `media` (via `storage_create_bucket`), com policies:
- `SELECT` liberado a todos (site público lê as imagens)
- `INSERT / UPDATE / DELETE` apenas para usuários com role `admin` (via `has_role`)
- Sem `TO anon` write — nenhum visitante consegue subir arquivo

Estrutura de pastas: `media/site/`, `media/blog/`, `media/segmentos/`, `media/seo/`, `media/ab/`.

### 2. Componente `<ImageUploader />` reutilizável

Novo em `src/components/admin/ImageUploader.tsx`. Interface única:

```tsx
<ImageUploader
  value={url}
  onChange={setUrl}
  folder="blog"          // subpasta no bucket
  filenameHint="capa"    // usado para nomear o arquivo
  maxMB={5}
  accept="image/jpeg,image/png,image/webp,image/avif,image/svg+xml"
/>
```

Comportamento:
- **Botão "Enviar imagem"** + drag-and-drop na área de preview
- **Fallback "colar URL"** preservado (para quem já tem CDN externo)
- Upload direto ao Storage via cliente supabase (browser → bucket), sem passar pelo servidor
- Nome final: `{folder}/{timestamp}-{slug(filenameHint)}.{ext}` — evita colisão e cache stale
- Valida tipo e tamanho **antes** do upload (default 5 MB, SVG permitido)
- Mostra **preview**, **dimensões (px)**, **tamanho (KB)** e botão **Remover** após upload
- Estado de loading + toast de erro/sucesso
- `onChange` recebe a **URL pública** já pronta para gravar no `kv_records`

### 3. Onde plugar o componente

Substituir os inputs atuais nas 5 telas:

- `admin.midia.tsx` — troca `MediaSlot` inteiro pelo `<ImageUploader />`. Remove o aviso de "localStorage 5 MB" e o limite de 400 KB.
- `admin.blog.tsx` — `capa` e `og_image` passam a usar upload real (não base64).
- `admin.segmentos.tsx` — campo `hero_default.imagem` ganha botão de upload.
- `admin.seo.tsx` — `og_image` por página ganha botão de upload.
- `admin.ab.tsx` — `imagem` da variante ganha botão de upload.

O formato do dado gravado continua sendo uma **string URL** — 100% compatível com os componentes públicos (`LandingPageTemplate`, `BlogStrip`, meta tags), sem tocar em nada do site.

### 4. Migração dos dados antigos (base64 → Storage)

Uma vez, ao carregar cada tela: se `url` começa com `data:image/`, mostrar um aviso "Imagem legada em base64 — reenvie para migrar para o CDN". Não migro em massa automático (pode gerar duplicatas e o operador quer curar).

## Detalhes técnicos

**Client Storage API:**
```ts
const { data, error } = await supabase.storage
  .from("media")
  .upload(`${folder}/${filename}`, file, {
    contentType: file.type,
    cacheControl: "31536000, immutable",  // 1 ano — filename tem timestamp
    upsert: false,
  });
const { data: { publicUrl } } = supabase.storage.from("media").getPublicUrl(data.path);
```

**Qualidade:** o arquivo é armazenado **byte-a-byte como enviado** (sem recompressão do lado do Supabase). Se o usuário quiser otimizar, pode subir WebP/AVIF direto. Não vou introduzir transformações no upload — mantém "boa qualidade" que é o pedido.

**Segurança:** RLS no `storage.objects` filtrando por `bucket_id = 'media'` e `has_role(auth.uid(), 'admin')` para operações de escrita. Leitura pública porque as imagens aparecem no site.

**Fora do escopo:** CDN próprio, transformações on-the-fly (resize/otimização automática), galeria/reuso de imagens já enviadas. Se você quiser depois, monto um `/admin/midia` como biblioteca central.

## Perguntas rápidas antes de executar

1. **Limite por arquivo:** 5 MB é confortável para heros grandes. Quer maior (ex. 10 MB) ou menor?
2. **SVG:** permito upload de SVG (útil para logo)? Tem risco baixo de XSS se o SVG vier de fonte não confiável — como só admin sobe, considero seguro. OK?
