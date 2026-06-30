import { Link } from "@tanstack/react-router";
import { Menu, MessageCircle, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const nav = [
  { label: "Início", to: "/" },
  { label: "EB-2 NIW", to: "/vistos/eb2-niw" },
  { label: "EB-1", to: "/vistos/eb1" },
  { label: "EB-3", to: "/vistos/eb3" },
  { label: "Médicos", to: "/lp/medicos" },
  { label: "Engenheiros", to: "/lp/engenheiros" },
  { label: "Empresários", to: "/lp/empresarios" },
  { label: "Sobre", to: "/sobre" },
  { label: "Conteúdo", to: "/blog" },
  { label: "Contato", to: "/contato" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="container-x flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-gold text-gold-foreground font-serif text-lg font-bold">
            S
          </span>
          <span className="font-serif text-lg leading-none">
            Status<span className="text-gold">.</span>
            <span className="block text-[10px] tracking-[0.2em] text-muted-foreground">NA AMÉRICA</span>
          </span>
        </Link>

        <nav className="hidden xl:flex items-center gap-6 text-sm text-foreground/80">
          {nav.slice(0, 7).map((n) => (
            <Link key={n.to} to={n.to} className="hover:text-gold transition-colors">
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href="https://wa.me/5500000000000"
            target="_blank"
            rel="noopener"
            className="hidden sm:grid h-9 w-9 place-items-center rounded-full border border-border text-gold hover:bg-gold/10"
            aria-label="WhatsApp"
          >
            <MessageCircle className="h-4 w-4" />
          </a>
          <a href="#avaliacao" className="hidden sm:block">
            <Button variant="default" size="sm">Avaliação gratuita</Button>
          </a>
          <button
            className="xl:hidden grid h-9 w-9 place-items-center rounded-md border border-border"
            onClick={() => setOpen((o) => !o)}
            aria-label="Menu"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="xl:hidden border-t border-border/40 bg-background">
          <div className="container-x flex flex-col py-4 gap-3">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="text-sm py-1 text-foreground/85 hover:text-gold"
              >
                {n.label}
              </Link>
            ))}
            <a href="#avaliacao" onClick={() => setOpen(false)}>
              <Button className="w-full mt-2">Avaliação gratuita</Button>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
