/**
 * PreQualResult, exibe o veredicto do teste, alternativas e próximos passos.
 *
 * Reutilizado em duas situações:
 *  1) imediatamente após o envio do formulário (com nome em primeira pessoa);
 *  2) na página pública compartilhável `/pre-qualificacao/r/:token` (modo
 *     "dossiê", neutro, sem auto-save).
 */

import { Check, AlertTriangle, ShieldAlert, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { publicResultUrl, type PreQualResponse } from "@/lib/prequal";
import type { Verdict, VisaScore } from "@/lib/visaQualifier";

interface Props {
  record: PreQualResponse;
  variant: "personal" | "public"; // personal = pós-envio; public = link compartilhado
}

const VERDICT_STYLES: Record<Verdict, { label: string; cls: string; icon: typeof Check }> = {
  apto:           { label: "Perfil apto",        cls: "border-emerald-400/40 bg-emerald-500/10 text-emerald-200", icon: Check },
  parcial:        { label: "Perfil parcial",     cls: "border-amber-400/40 bg-amber-500/10 text-amber-200", icon: AlertTriangle },
  nao_elegivel:   { label: "Perfil ainda não atende os critérios", cls: "border-rose-400/40 bg-rose-500/10 text-rose-200", icon: ShieldAlert },
};

function ScoreBar({ value }: { value: number }) {
  const w = Math.max(0, Math.min(100, value));
  return (
    <div className="h-1.5 w-full bg-ink-raise overflow-hidden">
      <div className="h-full bg-gold transition-all" style={{ width: `${w}%` }} />
    </div>
  );
}

function VisaCard({ v, primary }: { v: VisaScore; primary?: boolean }) {
  const meta = VERDICT_STYLES[v.verdict];
  const Icon = meta.icon;
  return (
    <article className={`liquid-card rounded-2xl p-6 ${primary ? "border-gold" : "border-gold/20"}`}>
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono-label text-gold/80">{primary ? "MAIOR AFINIDADE" : "OUTRA CATEGORIA MAPEADA"}</p>
          <h3 className="mt-1 font-display text-xl">{v.label}</h3>
        </div>
        <span className={`inline-flex items-center gap-1.5 border px-2 py-1 text-[11px] uppercase tracking-wider ${meta.cls}`}>
          <Icon className="h-3 w-3" /> {meta.label}
        </span>
      </header>

      <p className="mt-3 text-[14px] text-foreground/75">
        O seu perfil apresenta afinidade com os critérios de <strong>{v.label}</strong>. {v.short}
      </p>

      <div className="mt-4">
        <div className="flex justify-between font-mono-label text-[10px] text-foreground/80">
          <span>AFINIDADE COM SEU PERFIL</span><span>{v.score}/100</span>
        </div>
        <div className="mt-1.5"><ScoreBar value={v.score} /></div>
      </div>

      {v.metCriteria.length > 0 && (
        <div className="mt-5">
          <p className="font-mono-label text-[10px] text-foreground/80">CRITÉRIOS QUE VOCÊ JÁ ATENDE</p>
          <ul className="mt-2 space-y-1.5 text-[13px] text-foreground/85">
            {v.metCriteria.map((c) => (
              <li key={c} className="flex gap-2"><Check className="h-3.5 w-3.5 mt-0.5 text-emerald-400 shrink-0" />{c}</li>
            ))}
          </ul>
        </div>
      )}

      {v.gaps.length > 0 && (
        <div className="mt-4">
          <p className="font-mono-label text-[10px] text-foreground/80">A DESENVOLVER</p>
          <ul className="mt-2 space-y-1.5 text-[13px] text-foreground/70">
            {v.gaps.map((c) => (
              <li key={c} className="flex gap-2"><AlertTriangle className="h-3.5 w-3.5 mt-0.5 text-amber-300 shrink-0" />{c}</li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}

export function PreQualResult({ record, variant }: Props) {
  const { result, answers } = record;

  function copyLink() {
    const url = publicResultUrl(record.id);
    navigator.clipboard.writeText(url)
      .then(() => toast.success("Link copiado para a área de transferência."))
      .catch(() => toast.error("Não foi possível copiar."));
  }

  const firstName = answers.fullName.trim().split(" ")[0] || "você";
  const qualified = result.qualifiedOverall;

  return (
    <div className="space-y-8">
      {/* Cabeçalho do mapeamento */}
      <header className="border-l-2 border-gold pl-5">
        <p className="font-mono-label text-gold/80">MAPA DAS CATEGORIAS APLICÁVEIS</p>
        <h1 className="mt-2 font-display text-3xl sm:text-4xl text-foreground">
          {variant === "personal" ? `${firstName}, ` : ""}
          {qualified
            ? "veja quais documentos costumam ser exigidos em cada categoria."
            : "ainda não identificamos afinidade clara com as categorias avaliadas."}
        </h1>
        <p className="mt-3 text-foreground/70 max-w-2xl">
          {qualified
            ? "Abaixo estão as categorias com maior afinidade segundo as respostas, os critérios que o seu perfil já cobre e os pontos que ainda precisam de documentação."
            : "Esta triagem é uma fotografia inicial. Vale conhecer os critérios de cada categoria e voltar quando puder responder com mais documentação em mãos."}
        </p>
        {result.blocker && (
          <div className="mt-4 border border-amber-400/40 bg-amber-500/10 text-amber-200 px-4 py-3 text-[14px]">
            <strong className="font-medium">Atenção:</strong> {result.blocker}
          </div>
        )}
      </header>

      {/* Veredictos */}
      <section className="space-y-4">
        <VisaCard v={result.best} primary />
        {result.alternatives.length > 0 && (
          <div className="grid md:grid-cols-2 gap-4">
            {result.alternatives.map((v) => <VisaCard key={v.code} v={v} />)}
          </div>
        )}
      </section>

      {/* Próximo passo: copiar link do mapeamento */}
      {qualified && (
        <section className="liquid-card rounded-3xl p-6 sm:p-7">
          <p className="font-mono-label text-gold/80">PRÓXIMO PASSO</p>
          <h2 className="mt-2 font-display text-2xl text-foreground">
            Guarde ou compartilhe o seu mapeamento
          </h2>
          <p className="mt-3 text-[15px] text-foreground/75 max-w-2xl">
            Enviamos automaticamente o mapa por e-mail. Você também pode copiar o
            link público para consultar depois ou compartilhar com quem acompanha sua decisão.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Button
              type="button" variant="outline" onClick={copyLink}
              className="btn-label h-12 px-5 gap-2 border-gold/40 text-foreground hover:bg-gold/10"
            >
              <Copy className="h-4 w-4" /> Copiar link do mapeamento
            </Button>
          </div>

          {variant === "personal" && (
            <p className="mt-4 text-[12px] text-foreground/80 break-all">
              Link público: {publicResultUrl(record.id)}
            </p>
          )}
        </section>
      )}

      {/* Sem afinidade clara: convida a conhecer o conteúdo */}
      {!qualified && (
        <section className="liquid-card rounded-3xl p-6 sm:p-7">
          <p className="font-mono-label text-gold/80">CONTINUE EXPLORANDO</p>
          <h2 className="mt-2 font-display text-2xl text-foreground">
            Aprofunde-se nas categorias EB enquanto organiza a sua documentação.
          </h2>
          <p className="mt-3 text-[15px] text-foreground/75 max-w-2xl">
            Conheça os critérios completos e leia os artigos sobre EB-2 NIW e EB-1, a maioria
            dos perfis aprovados leva alguns meses construindo evidências antes de dar entrada no processo.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a href="/vistos/eb2-niw"><Button className="btn-label h-11 px-5">Entender EB-2 NIW</Button></a>
            <a href="/blog"><Button variant="outline" className="btn-label h-11 px-5 border-gold/40 text-foreground hover:bg-gold/10">Ler o blog</Button></a>
          </div>
        </section>
      )}

      <p className="text-[13px] text-foreground/80 leading-relaxed border-t border-gold/15 pt-5">
        Este é um mapeamento informativo baseado nas suas respostas. Não é análise jurídica
        e não determina qualificação. Somente um advogado de imigração licenciado pode
        avaliar o seu caso.
      </p>
    </div>
  );
}
