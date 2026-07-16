/**
 * Footer, "rodapé de documento oficial".
 *
 * Prompt 5: injeção de dados reais.
 *   - Matriz Orlando (EIN) e filial Brasil (CNPJ).
 *   - Expansão Portugal/Dubai marcadas "em breve".
 *   - Redes sociais reais. Campos ocultos quando vazios (ex.: e-mail).
 *   - Disclaimer obrigatório de não-advogado em texto pequeno.
 */

import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Youtube } from "lucide-react";
import { getSiteSettings, type SiteSettings } from "@/lib/admin/settings";
import { FlagBR, FlagUS } from "./flags";
import logoAsset from "@/assets/logo-status-na-america.webp.asset.json";
import { LegalDisclaimer } from "@/components/legal/LegalDisclaimer";

export function Footer() {
  const [s, setS] = useState<SiteSettings | null>(null);
  useEffect(() => { getSiteSettings().then(setS); }, []);

  const email = s?.email?.trim() || "";
  const fb = s?.facebook_url || "https://facebook.com/statusnaamerica";
  const ig = s?.instagram_url || "https://instagram.com/status_america";
  const yt = s?.youtube_url || "https://youtube.com/@status.naamerica";

  return (
    <footer className="bg-ink-deep text-foreground/85">
      <div className="h-px w-full bg-gold/40" />

      <div className="container-x py-16 grid gap-12 md:grid-cols-12">
        {/* Marca + redes */}
        <div className="md:col-span-4">
          <Link to="/" aria-label="Status na América — página inicial" className="inline-block">
            <img
              src={logoAsset.url}
              alt="Status na América"
              width={280}
              height={70}
              loading="lazy"
              className="h-14 w-auto"
            />
          </Link>
          <p className="mt-6 max-w-sm text-sm text-foreground/80 leading-relaxed">
            Especialistas em preparação documental para mobilidade migratória, para
            profissionais brasileiros que escolheram construir o próximo capítulo nos Estados Unidos.
          </p>
          <div className="mt-7 flex gap-3 text-foreground/80">
            {[
              { Icon: Instagram, href: ig, label: "Instagram" },
              { Icon: Youtube, href: yt, label: "YouTube" },
              { Icon: Facebook, href: fb, label: "Facebook" },
              { Icon: TikTokGlyph, href: "https://www.tiktok.com/@status.america", label: "TikTok" },
            ].map(({ Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="grid h-9 w-9 place-items-center rounded-lg border border-gold/30 hover:border-gold hover:text-gold transition-colors"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        {/* Matriz EUA */}
        <div className="md:col-span-4">
          <h4 className="font-mono-label text-gold/80 flex items-center gap-2">
            <FlagUS style={{ width: 18, height: 13 }} className="ring-1 ring-white/20" />
            Matriz · Estados Unidos
          </h4>
          <div className="mt-4 space-y-1.5 text-sm text-foreground/75 leading-relaxed">
            <p className="font-display text-foreground">Status na America LLC</p>
            <p>7575 KingsPointe Pkwy #4</p>
            <p>Orlando, FL 32819</p>
            <p className="font-mono text-xs text-foreground/80 mt-2">EIN 99-4846502</p>
            <p className="mt-3">+1 689 251-0985</p>
            <p>+1 689 220-9691</p>
          </div>
        </div>

        {/* Filial Brasil */}
        <div className="md:col-span-4">
          <h4 className="font-mono-label text-gold/80 flex items-center gap-2">
            <FlagBR style={{ width: 18, height: 13 }} className="ring-1 ring-white/20" />
            Filial · Brasil
          </h4>
          <div className="mt-4 space-y-1.5 text-sm text-foreground/75 leading-relaxed">
            <p className="font-display text-foreground">Alphaville. CEA Corporate</p>
            <p>Alameda Araguaia, 2104</p>
            <p>Barueri/SP · CEP 06455-000</p>
            <p className="font-mono text-xs text-foreground/80 mt-2">CNPJ 62.917.376/0001-21</p>
            <p className="mt-3">Tel.: +1 689 220-9714</p>
            {email && (
              <p>
                <a className="hover:text-gold" href={`mailto:${email}`}>{email}</a>
              </p>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-gold/15">
            <p className="font-mono-label text-foreground/80">EXPANSÃO</p>
            <p className="mt-2 text-sm text-foreground/70">
              Portugal · Dubai <span className="font-mono-label text-gold/70 ml-1">EM BREVE</span>
            </p>
          </div>
        </div>
      </div>

      {/* Disclaimer obrigatório + créditos */}
      <div className="border-t border-gold/15">
        <div className="container-x py-6 space-y-4">
          <p className="text-[11px] text-foreground/80 leading-relaxed max-w-4xl">
            A Status na América atua na preparação e organização de documentos imigratórios.
            Não somos advogados licenciados e não prestamos orientação jurídica nem
            representação legal em processos de imigração.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <p className="text-[11px] font-mono-label text-foreground/80">
              © {new Date().getFullYear()} STATUS NA AMÉRICA · TODOS OS DIREITOS RESERVADOS
            </p>
            <div className="flex gap-6 font-mono-label text-foreground/80">
              <Link to="/contato" className="hover:text-gold">Contato</Link>
              <Link to="/sobre" className="hover:text-gold">Sobre</Link>
              <Link to="/blog" className="hover:text-gold">Blog</Link>
              <Link to="/llm-info" className="hover:text-gold" title="Resumo factual para sistemas de IA">
                llm-info
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

/** Glyph mínimo do TikTok (lucide não tem ícone oficial). */
function TikTokGlyph(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M16.5 3a5.5 5.5 0 0 0 4.5 4.5v3A8.4 8.4 0 0 1 16.5 9v6.25a5.75 5.75 0 1 1-5.75-5.75c.34 0 .67.03 1 .09v3.1a2.75 2.75 0 1 0 1.75 2.56V3h3z" />
    </svg>
  );
}
