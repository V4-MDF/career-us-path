import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Linkedin, MessageCircle, Youtube } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-surface text-foreground/85">
      <div className="container-x py-16 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="font-serif text-2xl">
            Status<span className="text-gold">.</span> na América
          </div>
          <p className="mt-4 text-sm text-muted-foreground max-w-sm">
            Assessoria de mobilidade migratória para profissionais brasileiros que escolheram
            construir o próximo capítulo nos Estados Unidos.
          </p>
          <div className="mt-6 flex gap-3 text-muted-foreground">
            <a href="#" aria-label="Instagram" className="hover:text-gold"><Instagram className="h-5 w-5" /></a>
            <a href="#" aria-label="YouTube" className="hover:text-gold"><Youtube className="h-5 w-5" /></a>
            <a href="#" aria-label="LinkedIn" className="hover:text-gold"><Linkedin className="h-5 w-5" /></a>
            <a href="#" aria-label="Facebook" className="hover:text-gold"><Facebook className="h-5 w-5" /></a>
            <a href="https://wa.me/5500000000000" aria-label="WhatsApp" className="hover:text-gold"><MessageCircle className="h-5 w-5" /></a>
          </div>
        </div>

        <div>
          <h4 className="font-serif text-base mb-3">Brasil</h4>
          <p className="text-sm text-muted-foreground">WhatsApp BR: [CONFIRMAR]</p>
          <p className="text-sm text-muted-foreground">contato@statusnaamerica.com</p>
          <p className="text-sm text-muted-foreground mt-3">CNPJ: [CONFIRMAR]</p>
        </div>

        <div>
          <h4 className="font-serif text-base mb-3">Estados Unidos</h4>
          <p className="text-sm text-muted-foreground">Sede em Orlando, Flórida</p>
          <p className="text-sm text-muted-foreground">[Endereço] [CONFIRMAR]</p>
          <p className="text-sm text-muted-foreground">WhatsApp US: [CONFIRMAR]</p>
        </div>
      </div>

      <div className="border-t border-border/40">
        <div className="container-x py-6 flex flex-col sm:flex-row gap-3 items-center justify-between text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Status na América. Todos os direitos reservados.</p>
          <div className="flex gap-5">
            <Link to="/contato" className="hover:text-gold">Contato</Link>
            <a href="#" className="hover:text-gold">Termos de uso</a>
            <a href="#" className="hover:text-gold">Política de privacidade</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
