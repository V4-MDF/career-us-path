/**
 * Footer — visual de "rodapé de documento oficial".
 * Filete dourado superior + tipografia mono nos rótulos de seção.
 *
 * Sem placeholders "[CONFIRMAR]" no front (Prompt 3.1). Os valores pendentes
 * de validação aparecem como rótulos limpos; o admin tem o controle do que
 * está pendente.
 */

import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Linkedin, MessageCircle, Youtube } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-ink-deep text-foreground/85">
      {/* Filete dourado superior */}
      <div className="h-px w-full bg-gold/40" />

      <div className="container-x py-16 grid gap-12 md:grid-cols-12">
        <div className="md:col-span-5">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center border border-gold/60 text-gold font-display text-xl">S</span>
            <span className="font-display text-2xl">
              Status<span className="text-gold">.</span> na América
            </span>
          </div>
          <p className="mt-6 max-w-sm text-sm text-foreground/65 leading-relaxed">
            Assessoria de mobilidade migratória para profissionais brasileiros que escolheram
            construir o próximo capítulo nos Estados Unidos.
          </p>
          <div className="mt-7 flex gap-3 text-foreground/55">
            {[
              { Icon: Instagram, href: "#", label: "Instagram" },
              { Icon: Youtube, href: "#", label: "YouTube" },
              { Icon: Linkedin, href: "#", label: "LinkedIn" },
              { Icon: Facebook, href: "#", label: "Facebook" },
              { Icon: MessageCircle, href: "https://wa.me/5500000000000", label: "WhatsApp" },
            ].map(({ Icon, href, label }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="grid h-9 w-9 place-items-center border border-gold/30 hover:border-gold hover:text-gold transition-colors"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div className="md:col-span-3">
          <h4 className="font-mono-label text-gold/80">Brasil</h4>
          <div className="mt-4 space-y-2 text-sm text-foreground/70">
            <p>Atendimento via WhatsApp</p>
            <p>contato@statusnaamerica.com</p>
          </div>
        </div>

        <div className="md:col-span-4">
          <h4 className="font-mono-label text-gold/80">Estados Unidos</h4>
          <div className="mt-4 space-y-2 text-sm text-foreground/70">
            <p>Sede em Orlando, Flórida</p>
            <p>Atendimento via WhatsApp (Brasil e EUA)</p>
          </div>
        </div>
      </div>

      <div className="border-t border-gold/15">
        <div className="container-x py-6 flex flex-col sm:flex-row gap-3 items-center justify-between font-mono-label text-foreground/45">
          <p className="normal-case tracking-normal text-xs font-sans">
            © {new Date().getFullYear()} Status na América. Todos os direitos reservados.
          </p>
          <div className="flex gap-6">
            <Link to="/contato" className="hover:text-gold">Contato</Link>
            <Link to="/sobre" className="hover:text-gold">Sobre</Link>
            <a href="#" className="hover:text-gold">Privacidade</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
