/**
 * /avaliacao/whatsapp
 *
 * Segunda versão da página de análise. Ao enviar o formulário, abre o
 * WhatsApp em nova aba já com as respostas do lead na mensagem.
 * Salva o lead normalmente (mesma persistência de /avaliacao) e dispara
 * os eventos de tracking padrão. Não usa páginas de obrigado.
 */

import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { ChevronLeft, MessageCircle, ShieldCheck } from "lucide-react";
import { LeadFormProgressive } from "@/components/site/LeadFormProgressive";
import { trackFormView, trackWhatsAppSubmit, trackWhatsAppOpened } from "@/lib/tracking";
import { getOrigin } from "@/lib/origin";
import { buildWhatsAppLink, leadWhatsAppMessage } from "@/lib/whatsapp";
import { normalizeBrPhone } from "@/lib/phone";
import type { LeadInput } from "@/lib/leadScoring";
import avaliacaoBg from "@/assets/avaliacao-bg.jpg";
import logoAsset from "@/assets/logo-status-na-america.webp.asset.json";

type SegKey = "medicos" | "engenheiros" | "empresarios";

interface AvaliacaoSearch {
  seg?: string;
  src?: string;
  [k: string]: string | undefined;
}

const SEG_DEFAULTS: Record<SegKey, { headline: string; profissao: string }> = {
  medicos: {
    headline: "Pré-qualificação documental para médicos brasileiros.",
    profissao: "medico",
  },
  engenheiros: {
    headline: "Pré-qualificação documental para engenheiros brasileiros.",
    profissao: "engenheiro",
  },
  empresarios: {
    headline: "Pré-qualificação documental para empresários brasileiros.",
    profissao: "empresario",
  },
};

export const Route = createFileRoute("/avaliacao/whatsapp")({
  validateSearch: (s: Record<string, unknown>): AvaliacaoSearch => {
    const out: AvaliacaoSearch = {};
    Object.entries(s).forEach(([k, v]) => {
      if (typeof v === "string") out[k] = v;
    });
    return out;
  },
  head: () => ({
    meta: [
      { title: "Análise pelo WhatsApp | Status Immigration Law Firm" },
      {
        name: "description",
        content:
          "Preencha seu perfil e continue a análise diretamente pelo WhatsApp com nossa equipe.",
      },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AvaliacaoWhatsAppPage,
});

function AvaliacaoWhatsAppPage() {
  const search = useSearch({ from: "/avaliacao/whatsapp" });
  const [waLink, setWaLink] = useState<string | null>(null);

  useEffect(() => {
    trackFormView({ seg: search.seg ?? null, src: search.src ?? null });
  }, [search.seg, search.src]);

  useEffect(() => {
    getOrigin("/avaliacao/whatsapp");
  }, []);

  const segKey = useMemo<SegKey | null>(() => {
    const s = search.seg as SegKey | undefined;
    return s && SEG_DEFAULTS[s] ? s : null;
  }, [search.seg]);

  const headline = segKey
    ? SEG_DEFAULTS[segKey].headline
    : "Fale com nossa equipe pelo WhatsApp após responder.";

  const handleSubmitted = async ({ data }: { id: string; data: LeadInput }) => {
    // UTMs da sessão (utm_source/medium/campaign/content/term + gclid/fbclid).
    const origin = getOrigin("/avaliacao/whatsapp");
    const utm = origin.utm ?? {};
    const utmLines: string[] = [];
    if (utm.utm_source) utmLines.push(`• utm_source: ${utm.utm_source}`);
    if (utm.utm_medium) utmLines.push(`• utm_medium: ${utm.utm_medium}`);
    if (utm.utm_campaign) utmLines.push(`• utm_campaign: ${utm.utm_campaign}`);
    if (utm.utm_content) utmLines.push(`• utm_content: ${utm.utm_content}`);
    if (utm.utm_term) utmLines.push(`• utm_term: ${utm.utm_term}`);
    if (utm.gclid) utmLines.push(`• gclid: ${utm.gclid}`);
    if (utm.fbclid) utmLines.push(`• fbclid: ${utm.fbclid}`);

    // Normaliza o WhatsApp do lead para E.164 (+55DDNNNNNNNNN); fallback ao
    // valor mascarado caso a normalização falhe, para não perder o dado.
    const normalizedPhone = normalizeBrPhone(data.whatsapp);
    const phoneForMessage = normalizedPhone?.display ?? data.whatsapp;

    const base = leadWhatsAppMessage({
      nome: data.nome,
      email: data.email,
      whatsapp: phoneForMessage,
      objetivo_visto: data.objetivo_visto,
      profissao: data.profissao,
      formacao: data.formacao,
      faixaEtaria: data.faixaEtaria,
      cidade: data.cidade,
      uf: data.uf,
      renda: data.renda,
      momento: data.momento,
    });
    const message = utmLines.length
      ? `${base}\n\n*Origem:*\n${utmLines.join("\n")}`
      : base;

    const utmMeta = {
      utm_source: utm.utm_source ?? null,
      utm_medium: utm.utm_medium ?? null,
      utm_campaign: utm.utm_campaign ?? null,
      utm_content: utm.utm_content ?? null,
      utm_term: utm.utm_term ?? null,
      gclid: utm.gclid ?? null,
      fbclid: utm.fbclid ?? null,
    };

    // Etapa 1: intenção de envio (clique em "Enviar e abrir WhatsApp").
    trackWhatsAppSubmit(utmMeta);

    let link = "";
    try {
      link = await buildWhatsAppLink(message);
    } catch {
      /* segue para fallback */
    }
    if (link) {
      setWaLink(link);
      // Abre em nova aba. Pode ser bloqueado por popup blocker; o fallback
      // exibe um botão manual logo abaixo.
      let opened = false;
      try {
        const w = window.open(link, "_blank", "noopener,noreferrer");
        opened = !!w;
      } catch { /* ignore */ }
      // Etapa 2: WhatsApp efetivamente aberto (conversão da etapa).
      if (opened) trackWhatsAppOpened(utmMeta);
    }
  };


  return (
    <div className="min-h-screen bg-ink text-foreground flex flex-col">
      <header className="sticky top-0 z-20 border-b border-gold/15 bg-ink/85 backdrop-blur">
        <div className="container-x flex h-[64px] items-center justify-between">
          <Link to="/" className="flex items-center" aria-label="Status Immigration Law Firm. Início">
            <img
              src={logoAsset.url}
              alt="Status Immigration Law Firm"
              className="h-10 md:h-12 w-auto"
              width={240}
              height={48}
              decoding="async"
            />
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-xs font-mono-label text-foreground/70 hover:text-gold"
          >
            <ChevronLeft className="h-3.5 w-3.5" /> Voltar ao site
          </Link>
        </div>
      </header>

      <main className="flex-1 relative">
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-[720px] pointer-events-none overflow-hidden"
        >
          <img
            src={avaliacaoBg}
            alt=""
            width={1920}
            height={1280}
            className="w-full h-full object-cover opacity-[0.14]"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, color-mix(in oklab, var(--ink) 75%, transparent) 0%, color-mix(in oklab, var(--ink) 88%, transparent) 45%, var(--ink) 100%), radial-gradient(ellipse at 50% 0%, color-mix(in oklab, var(--gold) 10%, transparent) 0%, transparent 65%)",
            }}
          />
        </div>

        <div className="relative mx-auto w-full max-w-[680px] px-5 md:px-6 py-10 md:py-14">
          <div className="text-center">
            <div className="inline-flex items-center gap-3">
              <span aria-hidden className="h-px w-8 bg-gold" />
              <span className="font-mono-label text-[11px] tracking-wider text-gold">
                ANÁLISE VIA WHATSAPP · 100% CONFIDENCIAL
              </span>
              <span aria-hidden className="h-px w-8 bg-gold" />
            </div>

            <h1 className="mt-5 display-2 text-foreground">{headline}</h1>

            <p className="mt-5 text-base md:text-lg text-foreground/80 leading-relaxed max-w-[560px] mx-auto">
              Responda algumas perguntas rápidas. Ao finalizar, abrimos o WhatsApp
              com suas respostas já preenchidas para nossa equipe continuar a
              conversa.
            </p>
          </div>

          <div className="mt-6">
            {waLink ? (
              <div className="rounded-2xl border border-gold/30 bg-surface p-8 text-center">
                <MessageCircle className="mx-auto h-12 w-12 text-gold" />
                <h3 className="mt-4 font-serif text-2xl">Abrimos o WhatsApp em uma nova aba.</h3>
                <p className="mt-2 text-foreground/80">
                  Se nada aconteceu, o navegador pode ter bloqueado a janela. Toque no
                  botão abaixo para continuar.
                </p>
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackWhatsAppOpened()}
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 font-mono-label text-sm text-ink hover:bg-gold/90"
                >
                  <MessageCircle className="h-4 w-4" /> Abrir WhatsApp
                </a>
              </div>
            ) : (
              <LeadFormProgressive
                segmentId={segKey ?? undefined}
                defaultProfissao={segKey ? SEG_DEFAULTS[segKey].profissao : undefined}
                onSubmitted={handleSubmitted}
                submitLabel="Enviar e abrir WhatsApp"
                currentPath="/avaliacao/whatsapp"
              />
            )}
          </div>

          <div className="mt-8 flex items-start gap-3 text-xs text-foreground/80 border-l border-gold/40 pl-4">
            <ShieldCheck className="h-4 w-4 text-gold mt-0.5 shrink-0" />
            <span>
              Empresa registrada nos EUA (EIN 99-4846502) e no Brasil (CNPJ 62.917.376/0001-21).
              Sede em Orlando, FL · Filial em Barueri/SP.
            </span>
          </div>
        </div>
      </main>

      <footer className="border-t border-gold/15 bg-ink-deep">
        <div className="container-x py-8 text-xs text-foreground/80 leading-relaxed max-w-4xl">
          <p>
            A Status Immigration Law Firm atua na preparação e organização de documentos imigratórios.
            Não somos advogados licenciados e não prestamos orientação jurídica nem
            representação legal em processos de imigração.
          </p>
          <p className="mt-3 font-mono-label text-foreground/80">
            © {new Date().getFullYear()} STATUS IMMIGRATION LAW FIRM LLC · EIN 99-4846502
          </p>
        </div>
      </footer>
    </div>
  );
}
