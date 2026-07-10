## Objetivo
Trocar o vídeo padrão da hero da Home por um clipe **horizontal (16:9)** mostrando uma **família com crianças** em contexto americano, com **tom mais escuro** para garantir contraste com o título e subtítulo em cima.

## Passos

1. **Sourcing do clipe (banco gratuito, licença permissiva)**
   - Buscar em Coverr / Pexels / Mixkit por termos como "family children walking suburb", "parents kids american home", "family kids park sunset".
   - Critérios obrigatórios:
     - **Horizontal 16:9** (1920x1080 ou 1280x720), nunca vertical/quadrado.
     - Presença clara de **crianças** + pelo menos um adulto.
     - Tom naturalmente mais escuro (fim de tarde / golden hour tardio / interior com luz baixa) — evita clipes estourados de sol.
     - MP4 H.264, 8–15s, ≤ ~8 MB, movimento lento, coerente com "Silent Luxury".

2. **Escurecer o clipe (garantir contraste AA no título)**
   - Estratégia em duas camadas, sem re-encodar o vídeo:
     - **Filtro CSS no `<video>`**: `brightness(0.6) saturate(0.9)` aplicado no `HeroBackgroundMedia.tsx` — cobre também o poster para consistência entre desktop/mobile.
     - **Overlay navy da hero**: aumentar levemente a opacidade do gradiente escuro por cima (na seção Hero em `sections.tsx`) para reforçar leitura do texto sem apagar a imagem.
   - Manter o `mask-image` de fade inferior atual (evita corte abrupto).

3. **Publicação no CDN**
   - Baixar para `/tmp/`.
   - `lovable-assets create --file /tmp/<nome>.mp4 --filename hero-family-children.mp4 > src/assets/hero-family-children.mp4.asset.json`.
   - `lovable-assets delete --file src/assets/hero-american-family.mp4.asset.json` (remove o clipe atual do CDN).

4. **Trocar o default no componente**
   - Em `src/components/site/HeroBackgroundMedia.tsx`:
     - Trocar o import para o novo pointer `hero-family-children.mp4.asset.json`.
     - `DEFAULT_VIDEO_URL` passa a apontar para o novo asset.
     - Adicionar `filter: brightness(0.6) saturate(0.9)` no `<video>` e no `<img>` do poster.

5. **Ajuste fino do overlay (opcional, só se necessário)**
   - Se após escurecer o vídeo o contraste do texto ainda não ficar confortável, subir a opacidade do gradiente navy da hero em `sections.tsx` em ~10%.

## Não mexer
- Formato/altura do hero, mask-image, tipografia, poster de fallback (`hero-skyline`).
- Comportamento mobile (continua só poster) e `prefers-reduced-motion`.
- Campo `hero.videoUrl` no admin continua sobrescrevendo o default.

## Se não achar clipe adequado
- Aviso antes de trocar e proponho 2–3 alternativas com link + thumbnail para você escolher.
