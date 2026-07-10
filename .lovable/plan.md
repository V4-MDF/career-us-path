# Trocar vídeo de fundo da hero

## Objetivo
Substituir o vídeo padrão da hero da Home (atualmente `hero-family.mp4`, família caminhando em rua americana) por um novo clipe de banco de imagens mostrando uma **família americana** (pais + filhos) em contexto cotidiano dos EUA — casa, quintal, parque ou caminhada em bairro suburbano. Manter tudo o mais igual: loop, mudo, autoplay, só no desktop, respeitando `prefers-reduced-motion`, com poster de fallback (skyline).

## Passos

1. **Sourcing do clipe**
   - Buscar em bancos gratuitos com licença permissiva (Coverr, Pexels, Mixkit) por termos como "american family suburb", "family walking home", "parents kids american backyard".
   - Critérios: MP4 H.264, ~8–15s, ≤ ~8 MB, 1080p, movimento lento (não vira "clipe promocional"), coerente com o tom editorial "Silent Luxury".

2. **Publicação no CDN**
   - Baixar para `/tmp/`.
   - `lovable-assets create --file /tmp/<nome>.mp4 --filename hero-american-family.mp4 > src/assets/hero-american-family.mp4.asset.json`.

3. **Trocar o default no componente**
   - Em `src/components/site/HeroBackgroundMedia.tsx`:
     - Trocar o import `heroFamilyVideo` para o novo pointer `hero-american-family.mp4.asset.json`.
     - `DEFAULT_VIDEO_URL` passa a apontar para o novo asset.
   - Deletar o pointer antigo `src/assets/hero-family.mp4.asset.json` via `lovable-assets delete --file …` (evita órfão no CDN).

4. **Não mexer em**
   - Overlays / opacidades ajustadas ontem.
   - Poster (`hero-skyline`) continua como fallback.
   - Campo `hero.videoUrl` do admin continua sobrescrevendo o default quando preenchido.

## Detalhes técnicos
- O clipe fica **só como default** — o admin em `/admin/conteudo` → Home → Hero pode substituir a qualquer momento sem novo deploy.
- Nada no mobile muda: continua exibindo apenas o poster.
- Se a busca não achar clipe adequado sob licença clara, aviso e proponho alternativas antes de trocar.
