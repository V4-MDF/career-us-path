## Verificação do toggle "Ocultar vídeo"

Estado atual no banco: `hero.videoHidden = ""` (vídeo VISÍVEL — condiz com o print).

Vou rodar um teste ponta a ponta com Playwright no preview local para confirmar que o toggle está de fato:

1. Abre `/admin/conteudo` autenticado, expande a seção **Hero**.
2. Lê o estado inicial do toggle `hero.videoHidden` (deve exibir "Visível").
3. Clica em **Ocultar** e verifica:
   - PATCH em `kv_records` com `{value:"1"}` volta 204;
   - o rótulo muda para "Oculto";
   - recarrega a página e o estado persiste (confirma que o novo loader com `list()` está lendo o valor gravado);
   - a Home (`/`) não exibe mais a dobra do vídeo do hero.
4. Repete o clique para reverter para "Visível" e confere que a dobra do vídeo volta na Home.
5. Faz o mesmo ciclo com **um** toggle de página de visto (`visa.eb2-niw.heroVideoHidden`) para garantir que a lógica genérica `/Hidden$/` funciona além do da Home.

Screenshots são salvos em `/tmp/browser/toggle-video/` a cada passo para inspeção.

Se algum passo falhar, corrijo o toggle correspondente. Se todos passarem, respondo com o resultado — nenhuma alteração de código será feita.