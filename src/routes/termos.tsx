/**
 * /termos — Termos de Uso.
 *
 * COMPLIANCE (PARTE A · P1): documento obrigatório para operar tráfego pago.
 */
import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/termos")({
  head: () => ({
    meta: [
      { title: "Termos de Uso | Status na América" },
      {
        name: "description",
        content:
          "Termos de uso do site da Status na América: condições de acesso, natureza do serviço prestado e limites de responsabilidade.",
      },
      { name: "robots", content: "noindex,follow" },
    ],
  }),
  component: TermosPage,
});

function TermosPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="container-x py-16 md:py-24 max-w-3xl">
        <p className="font-mono-label text-gold/85">DOCUMENTO LEGAL</p>
        <h1 className="mt-3 font-display text-4xl md:text-5xl leading-tight">
          Termos de Uso
        </h1>
        <p className="mt-4 text-sm text-foreground/70">
          Última atualização: {new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}.
        </p>

        <section className="mt-10 space-y-8 text-[15px] leading-relaxed text-foreground/85">
          <div>
            <h2 className="font-display text-2xl text-foreground">1. Aceitação</h2>
            <p className="mt-3">
              Ao acessar o site <strong>lp.statusnaamerica.com</strong> e demais domínios
              operados pela Status na América, o usuário declara ter lido, compreendido e
              aceito integralmente estes Termos de Uso e a{" "}
              <Link to="/privacidade" className="text-gold underline underline-offset-4 hover:text-gold/80">
                Política de Privacidade
              </Link>.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl text-foreground">2. Natureza do serviço</h2>
            <p className="mt-3">
              A Status na América presta serviços de <strong>preparação e organização
              documental</strong> para processos imigratórios americanos, incluindo
              vistos EB-1, EB-2 NIW, EB-3 e O-1.
            </p>
            <p className="mt-3">
              A Status na América <strong>não é escritório de advocacia</strong>, não
              possui advogados licenciados nos EUA em seu quadro operacional e não presta
              consultoria ou aconselhamento jurídico. As informações fornecidas no site,
              em materiais, redes sociais e comunicações têm <strong>caráter meramente
              informativo</strong> e não substituem parecer jurídico individual de
              advogado de imigração licenciado.
            </p>
            <p className="mt-3">
              As informações compartilhadas com a Status na América{" "}
              <strong>não são protegidas por sigilo advogado-cliente</strong>
              (attorney-client privilege).
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl text-foreground">3. Sem garantia de resultado</h2>
            <p className="mt-3">
              A aprovação de qualquer visto ou petição é decisão exclusiva do{" "}
              <strong>USCIS (U.S. Citizenship and Immigration Services)</strong>{" "}
              e dos consulados americanos. Nenhuma empresa, escritório ou profissional
              pode garantir aprovação, prazo ou resultado específico. Toda estimativa de
              tempo, chances ou desempenho apresentada é referencial e não constitui
              promessa contratual.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl text-foreground">4. Análise gratuita</h2>
            <p className="mt-3">
              A análise gratuita de perfil oferecida no site é <strong>não
              vinculante</strong> e tem como objetivo indicar se o perfil do usuário
              apresenta afinidade com os critérios das categorias de visto trabalhadas
              pela empresa. Não constitui contrato, proposta comercial nem parecer
              jurídico.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl text-foreground">5. Uso do site</h2>
            <p className="mt-3">O usuário compromete-se a:</p>
            <ul className="mt-3 list-disc pl-6 space-y-2">
              <li>Fornecer informações verdadeiras nos formulários.</li>
              <li>Não utilizar o site para fins ilícitos ou fraudulentos.</li>
              <li>Não interferir na integridade técnica do site (scraping em massa, ataques, engenharia reversa).</li>
              <li>Respeitar os direitos autorais e de marca dos conteúdos publicados.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-display text-2xl text-foreground">6. Propriedade intelectual</h2>
            <p className="mt-3">
              Todos os textos, imagens, vídeos, marcas, logotipos, layouts e códigos
              publicados neste site são de titularidade da Status na América ou de seus
              licenciantes, e são protegidos pelas leis de direitos autorais e de
              propriedade industrial. Qualquer reprodução exige autorização prévia por
              escrito.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl text-foreground">7. Limitação de responsabilidade</h2>
            <p className="mt-3">
              A Status na América não se responsabiliza por decisões tomadas pelo usuário
              com base apenas em conteúdo informativo do site, sem contratação formal do
              serviço de preparação documental e sem orientação jurídica individualizada
              por advogado licenciado.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl text-foreground">8. Alterações e foro</h2>
            <p className="mt-3">
              Estes Termos podem ser atualizados a qualquer tempo. A versão em vigor é a
              publicada nesta página. Para o serviço prestado pela filial brasileira, fica
              eleito o foro da Comarca de Barueri/SP. Para o serviço prestado pela matriz
              americana, aplica-se a legislação do Estado da Flórida (EUA).
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl text-foreground">9. Contato</h2>
            <p className="mt-3">
              Dúvidas sobre estes Termos devem ser enviadas para{" "}
              <a href="mailto:contato@statusnaamerica.com" className="text-gold underline underline-offset-4 hover:text-gold/80">
                contato@statusnaamerica.com
              </a>.
            </p>
          </div>
        </section>

        <div className="mt-14 flex flex-wrap gap-4 text-sm">
          <Link to="/privacidade" className="text-gold hover:text-gold/80 underline underline-offset-4">
            Ver Política de Privacidade
          </Link>
          <Link to="/contato" className="text-gold hover:text-gold/80 underline underline-offset-4">
            Falar com a equipe
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
