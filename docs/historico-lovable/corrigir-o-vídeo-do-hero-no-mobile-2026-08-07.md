# Corrigir o vídeo do hero no mobile

No print do celular o quadro do vídeo empurra a página para fora da tela: o título, o texto e o botão aparecem cortados na direita, o botão de play fica sobreposto ao texto que já existe dentro da capa do vídeo, e a legenda "ASSISTIR VÍDEO" briga com as letras da própria thumbnail.

## O que ajustar

1. **Fim do estouro horizontal.** A moldura do vídeo usa um filete dourado desenhado para fora do quadro (`-inset-2`) somado a uma largura fixa; no celular isso ultrapassa a largura da tela. O filete passa a ficar dentro do quadro no mobile e a moldura passa a respeitar a largura disponível.
2. **Play mais discreto e sem sobreposição.** No mobile o ícone de play fica menor e a legenda "ASSISTIR VÍDEO" é ocultada (aparece só a partir de tablet), evitando o choque com o texto impresso na capa do vídeo.
3. **Capa sem corte estranho.** A capa continua em 16:9 preenchendo o quadro, com escurecimento suave apenas atrás do botão de play para o ícone continuar legível.
4. **Botão do CTA.** O rótulo "Iniciar pré-qualificação documental" passa a quebrar/reduzir no mobile em vez de forçar largura extra.

## Detalhes técnicos

- `src/components/site/visa/VisaPageBody.tsx` (`VisaHero`): trocar o filete `absolute -inset-2` por `inset-0`/`-inset-1` a partir de `sm:`, adicionar `max-w-full` ao contêiner `max-w-xl`, e garantir `min-w-0` na coluna de texto; no CTA usar `whitespace-normal` + altura/padding menores no mobile.
- `src/components/site/VideoPlayer.tsx`: play `h-12 w-12 sm:h-16 sm:w-16`, legenda com `hidden sm:block`, gradiente do overlay reduzido.
- Verificar em 393px com Playwright que `document.documentElement.scrollWidth` é igual à largura da viewport (sem scroll lateral).
