## Problema

No hero da Home (`src/components/site/sections.tsx`, linha 137), o slot do vídeo está com `hidden lg:block`. Isso esconde o vídeo em qualquer tela < 1024px — inclusive celular e tablet.

## Correção

**Arquivo:** `src/components/site/sections.tsx` (linha ~137)

Trocar:
```tsx
<div className="relative hidden lg:block">
  <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-gold/40 ...">
    <VideoPlayer url={heroVideoUrl} title="Vídeo institucional Status na América" />
  </div>
</div>
```

Por uma versão sempre visível, mas com ordem responsiva: em mobile o vídeo aparece **abaixo** do headline/CTA (ordem natural, mais leve para o LCP da imagem hero de fundo); em desktop mantém a coluna direita.

- Remover `hidden lg:block`.
- Adicionar `mt-10 lg:mt-0` para respirar em mobile.
- Envelope mantém `aspect-video` (16:9), então funciona em qualquer largura sem quebrar layout.
- O `<iframe>` do YouTube/Vimeo já tem `loading="lazy"`, então não prejudica o LCP mobile (que agora é a imagem `hero-family.webp` preloaded).

Nada mais muda: sem alteração no `VideoPlayer`, sem mexer no tracking, no LCP preload, ou nas outras seções (o vídeo institucional da dobra ~544 já aparece em mobile normalmente).

## Verificação

Após aplicar, checar no viewport 390×844 (o que você está usando) que o quadro 16:9 aparece logo abaixo dos botões, com o player carregando o YouTube/Vimeo/MP4 configurado no admin.

## Fora do escopo

- Redesenhar o hero mobile.
- Trocar player ou hospedagem do vídeo.
- Alterar o preload/LCP da imagem de fundo.
