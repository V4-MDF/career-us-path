# Migração Lovable → Cloudflare: checklist

Feito no código (branch `migrate-cloudflare`):

- [x] Build com `@cloudflare/vite-plugin` (sem `@lovable.dev/*`, sem `nitro`)
- [x] Supabase/Lovable Cloud substituído por D1 (`/api/kv` + `src/lib/kv.server.ts`)
- [x] Upload de mídia do admin → R2 (`/api/admin/upload`, servido em `/media/*`)
- [x] Login do admin → e-mail + senha próprios (D1)
- [x] Arquivos da Lovable (`/__l5e/...`: logo, imagem OG, vídeo do hero) copiados para `public/`
- [x] URLs do site trocadas para `statusimmigrationlaw.com.br`
- [x] Worker publicado: https://career-us-path.v4mdf-ferramentas.workers.dev

Falta (no painel / terminal):

1. **Conta da Cloudflare**: domínio e Worker precisam estar na MESMA conta
   (CNAME entre contas dá erro 1014). Decidir antes dos passos abaixo, porque
   D1, R2 e Workers Builds são por conta.
2. **Ativar o R2** no painel (R2 → Enable) e criar o bucket:
   `npx wrangler r2 bucket create career-us-path-media` (feito na conta de teste).
3. **Workers Builds**: Worker `career-us-path` → Settings → Builds → Connect →
   repositório `V4-MDF/career-us-path`.
   - Build command: `npm run build`
   - Deploy command: `npx wrangler deploy`
   - Excluir/desconectar o projeto **Pages** `career-us-path` (senão são dois deploys por push).
4. **Primeiro admin** (em cada conta/banco novo): `node scripts/criar-admin.mjs`.
5. **Dados do Lovable Cloud**:
   `node scripts/migrar-dados-lovable.mjs` (só baixa e confere) e depois
   `node scripts/migrar-dados-lovable.mjs --aplicar` (importa no D1/R2).
   Os dados reais estão no Supabase ORIGINAL (rtbknvkquybujxsvvrfy), não no
   Lovable Cloud do `.env` antigo. Login: `LOVABLE_ACCESS_TOKEN=$(pbpaste)` com o
   token de uma sessão logada no admin antigo, ou e-mail/senha de admin.
6. **Domínio**: Worker → Domains → Add Domain → `statusimmigrationlaw.com.br`
   (e `www`, se quiser) e descomentar `routes` em `wrangler.jsonc`.
7. Testar o site e o `/admin` no domínio novo e depois desconectar o GitHub da Lovable.
