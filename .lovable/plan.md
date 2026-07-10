## Problema
O rodapé (`src/components/site/Footer.tsx`, linhas 33-38) ainda renderiza um "logo" fabricado em HTML: um quadradinho com a letra "S" + texto "Status. na América" ao lado, em vez da logo oficial já salva em `src/assets/n-na-america.webp.asset.json` — que é a mesma imagem usada em Header, /auth, /avaliacao e /admin.

## Auditoria feita
- `Header.tsx`, `auth.tsx`, `avaliacao.index.tsx`, `admin.tsx` → já usam `n-na-america.webp.asset.json` (ok).
- `Footer.tsx` → único ponto ainda com o "S + texto" fake (bug).
- Não há outras ocorrências do padrão textual no site.

## Correção
Em `src/components/site/Footer.tsx`:
1. Importar o asset da logo oficial: `import logoAsset from "@/assets/n-na-america.webp.asset.json"`.
2. Substituir o bloco `<span>S</span> + <span>Status. na América</span>` por um `<img src={logoAsset.url} alt="Status na América" />` com altura ~40–48px, `width/height` definidos para evitar CLS, e `loading="lazy"`.
3. Manter o parágrafo descritivo e as redes sociais logo abaixo, sem outras mudanças de layout.

Nada mais é alterado — funil, tracking, admin, tipografia e demais dobras permanecem intactos.