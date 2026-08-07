# Vídeo do hero: player inline com capa do próprio vídeo

## O que muda

Hoje o slot de vídeo nas páginas de visto é só um botão: ao clicar, abre um pop-up (modal) e, se nenhuma imagem de capa foi enviada no admin, aparece um fundo escuro sem thumbnail.

Ajustes:

1. **Sem pop-up.** O player passa a tocar no próprio quadro do hero, no lugar da moldura dourada. O modal é removido.
2. **Capa automática do YouTube/Vimeo.** Quando não houver capa enviada no admin, a imagem de capa é buscada automaticamente do próprio vídeo (thumbnail oficial do YouTube; Vimeo idem). Uma capa enviada manualmente no admin continua tendo prioridade.
3. **Um clique para tocar.** A capa + botão de play continuam aparecendo (bom para velocidade de carregamento); ao clicar, o vídeo começa a tocar ali mesmo, já em reprodução automática, sem segundo clique.
4. Se não houver vídeo configurado, o comportamento atual ("VÍDEO EM BREVE") é mantido.

## Detalhes técnicos

- `src/lib/videoEmbed.ts`: adicionar `thumbnailUrl` ao retorno de `parseVideoUrl` para YouTube (`https://i.ytimg.com/vi/<id>/maxresdefault.jpg`, com fallback para `hqdefault.jpg` no `onError`) e expor o id para Vimeo.
- `src/components/site/VideoPlayer.tsx`: aceitar props `autoPlay` e `poster`, montar a facade (capa + play) internamente e, no clique, renderizar o iframe com `autoplay=1` (YouTube e Vimeo) ou `<video autoPlay controls>` para arquivo direto. Sem `Dialog`.
- `src/components/site/visa/VisaPageBody.tsx` (`VisaHero`): remover `Dialog`/`useState open` e renderizar `<VideoPlayer>` dentro da moldura `aspect-video`, passando `poster={videoThumb}`. Manter o filete dourado e a legenda "Saiba mais sobre o Visto".
- Vimeo não tem URL de thumb estável sem API; nesse caso mantém o gradiente atual como fundo da facade.
