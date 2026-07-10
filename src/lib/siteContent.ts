/**
 * Conteúdo editável da home, defaults consumidos pelos componentes.
 *
 * Os componentes leem via `useContent(key)` que tenta primeiro o dataStore
 * (tabela `site_content`) e cai para o default abaixo. Assim o admin pode
 * espelhar/sobrescrever sem alterar componentes.
 *
 * Prompt 3.1: removido o sufixo "[CONFIRMAR]", o site público nunca renderiza
 * esse marcador. Itens pendentes de validação ficam em
 * src/lib/pendingValidation.ts (visível só no admin).
 */

import { useEffect, useState } from "react";
import { get } from "./dataStore";

export const defaultContent = {
  "hero.eyebrow": "IMIGRAÇÃO PARA OS ESTADOS UNIDOS. EB-2 NIW",
  "hero.title": "Transforme a sua carreira em um Green Card americano.",
  "hero.subtitle":
    "A Status na América ajuda profissionais brasileiros consolidados a conquistar a residência permanente nos EUA pelo EB-2 NIW, sem patrocinador, sem loteria, com Green Card para o cônjuge e os filhos.",
  "hero.cta": "Fazer minha análise gratuita",
  "hero.proof":
    "+1.000 famílias atendidas · Nota 5,0 no Google · Sede em Orlando, Flórida",

  "contrast.title": "Você não precisa começar do zero.",
  "contrast.subtitle": "Precisa de um novo cenário para a carreira que você já construiu.",

  "niw.title": "EB-2 NIW: o Green Card por mérito profissional",
  "niw.lead":
    "O National Interest Waiver permite que profissionais altamente qualificados solicitem a residência permanente nos EUA sem patrocinador, demonstrando que sua atuação é de interesse nacional americano, geração de renda, impostos e empregos.",

  "process.title": "Um método. Três passos. Acompanhamento até a aprovação.",

  "why.title": "Por que a Status na América",
  "why.lead":
    "Sede própria em Orlando, equipe dedicada e mais de duas décadas estruturando casos de mobilidade migratória para brasileiros.",

  "cta.title": "Descubra se você já tem perfil para o Green Card.",
  "cta.subtitle":
    "Análise gratuita e confidencial. Em até 48h nossa equipe analisa seu perfil e indica o caminho mais coerente com sua história.",

  // ==== Selos e parceiros (Correções 3) ============================
  // Faixa de credenciais tratada como selos oficiais. Slots com `.url`
  // vazio renderizam moldura placeholder, o cliente envia os arquivos
  // e o admin cola a URL da imagem no /admin/conteudo.
  "partners.eyebrow": "CREDENCIAIS E PARCEIROS",
  "partners.title": "Reconhecimentos oficiais que sustentam nossa operação.",
  "partners.slot1.label": "BBB · Nota A",
  "partners.slot1.url": "",
  "partners.slot2.label": "Google Business · 5,0",
  "partners.slot2.url": "",
  "partners.slot3.label": "EIN 99-4846502",
  "partners.slot3.url": "",
  "partners.slot4.label": "AILA (parceiro)",
  "partners.slot4.url": "",
  "partners.slot5.label": "USCIS · Documentação",
  "partners.slot5.url": "",
  "partners.slot6.label": "Parceiro (placeholder)",
  "partners.slot6.url": "",

  // ==== Depoimentos em vídeo + estudos de caso =====================
  // O caso EB-2 on-message é o do Helder (sócio que obteve Green Card
  // via EB-2 NIW). O segundo slot fica reservado para vídeo de cliente
  // real (ex.: engenheiro/empresário aprovado) conforme surgirem os
  // estudos de caso do YouTube. URLs vazias → renderiza placeholder.
  "testimonials.videoEyebrow": "CASOS REAIS EM VÍDEO",
  "testimonials.videoTitle": "Quem já passou pelo processo, no vídeo.",
  "testimonials.helderName": "Helder Moreira",
  "testimonials.helderCaption": "Caso real. Green Card EB-2 NIW",
  "testimonials.helderRole": "Sócio da Status na América",
  "testimonials.helderVideoUrl": "",
  "testimonials.secondaryName": "Cliente aprovado",
  "testimonials.secondaryCaption": "Caso de cliente, em breve",
  "testimonials.secondaryRole": "Engenheiro / Empresário",
  "testimonials.secondaryVideoUrl": "",
  "testimonials.googleReviewsUrl":
    "https://www.google.com/search?q=Status+na+Am%C3%A9rica+Orlando+reviews",
  "testimonials.caseStudiesEyebrow": "ESTUDOS DE CASO",
  "testimonials.caseStudiesTitle": "Casos reais, documentados.",
  "testimonials.caseStudiesLead":
    "Estamos preparando os primeiros estudos de caso completos, perfil, estratégia adotada e resultado. Publicados em breve.",

  // ==== Hero das páginas de visto (subtítulo enxuto + vídeo por página) ====
  // Cada página de visto lê seu próprio vídeo aqui; vazio → placeholder.
  "visa.eb2-niw.heroSubtitle":
    "O Green Card por mérito profissional, sem empresa patrocinadora e sem oferta de emprego.",
  "visa.eb2-niw.heroVideoUrl": "",
  "visa.eb2-niw.heroVideoThumb": "",
  "visa.eb1.heroSubtitle":
    "O Green Card para quem tem reconhecimento internacional comprovado, sem patrocinador, sem PERM.",
  "visa.eb1.heroVideoUrl": "",
  "visa.eb1.heroVideoThumb": "",
  "visa.eb3.heroSubtitle":
    "O Green Card com oferta formal de emprego nos EUA, exige patrocinador e PERM.",
  "visa.eb3.heroVideoUrl": "",
  "visa.eb3.heroVideoThumb": "",

  // ==== Página de Contato =========================================
  "contato.eyebrow": "FALE CONOSCO",
  "contato.title": "Vamos conversar sobre o seu caso.",
  "contato.subtitle":
    "Tire suas dúvidas com nossa equipe ou faça sua análise gratuita de perfil.",
  "contato.usa.title": "Matriz. Estados Unidos",
  "contato.usa.company": "Status na America LLC",
  "contato.usa.address": "7575 KingsPointe Pkwy #4, Orlando, FL 32819",
  "contato.usa.phone1": "+1 689 251-0985",
  "contato.usa.phone2": "+1 689 220-9691",
  "contato.usa.ein": "EIN 99-4846502",
  "contato.br.title": "Filial. Brasil",
  "contato.br.company": "Alphaville · CEA Corporate",
  "contato.br.address": "Alameda Araguaia 2104, Barueri/SP · CEP 06455-000",
  "contato.br.cnpj": "CNPJ 62.917.376/0001-21",
  "contato.br.phone": "+1 689 220-9714",
  "contato.expansao.title": "Expansão internacional",
  "contato.expansao.text": "Portugal e Dubai · em breve.",
  "contato.form.title": "Deixe uma mensagem",
  "contato.form.lead":
    "Para uma análise de perfil completa, use o botão “Análise gratuita”. Este canal é para dúvidas rápidas e mensagens.",
  "contato.form.success": "Recebemos sua mensagem. Retornaremos em breve.",

  // ==== Página Sobre ==============================================
  "sobre.hero.eyebrow": "QUEM SOMOS",
  "sobre.hero.title": "Status na América. De Orlando para o Brasil.",
  "sobre.hero.subtitle":
    "Mais de duas décadas estruturando processos de imigração para brasileiros qualificados, com equipe presente nos Estados Unidos.",
  "sobre.hero.image": "",

  "sobre.historia.eyebrow": "NOSSA HISTÓRIA",
  "sobre.historia.title": "Um novo modelo de assessoria, feito por quem já viveu o antigo.",
  "sobre.historia.body":
    "[Conteúdo a completar com o cliente] A Status na América nasceu da decisão da fundadora Lia de sair de um modelo antigo de assessoria migratória e construir algo mais próximo, transparente e conectado à realidade do cliente brasileiro. A empresa se estabeleceu em Orlando para acompanhar de perto quem chega aos Estados Unidos, não apenas até a aprovação do processo, mas na adaptação e nos primeiros passos da nova vida.",
  "sobre.historia.image": "",

  "sobre.diferencial.eyebrow": "NOSSO DIFERENCIAL",
  "sobre.diferencial.title": "Estamos fisicamente nos Estados Unidos.",
  "sobre.diferencial.lead":
    "Diferente de quem opera apenas à distância, a Status tem sede em Orlando. Acompanhamos o cliente antes, durante e depois da chegada.",
  "sobre.diferencial.p1.title": "Chegada aos EUA",
  "sobre.diferencial.p1.text": "Recepção, orientação inicial e conexão com a rede local de suporte.",
  "sobre.diferencial.p2.title": "Bancos e documentação",
  "sobre.diferencial.p2.text": "Suporte para abertura de contas, SSN, ITIN e documentos essenciais.",
  "sobre.diferencial.p3.title": "Moradia e escolas",
  "sobre.diferencial.p3.text": "Indicações de bairros, imobiliárias parceiras e escolas para os filhos.",
  "sobre.diferencial.p4.title": "Adaptação de família",
  "sobre.diferencial.p4.text": "Acompanhamento humano nos primeiros meses de vida nos EUA.",

  "sobre.equipe.eyebrow": "QUEM CUIDA DO SEU CASO",
  "sobre.equipe.title": "Uma equipe presente nos dois países.",
  "sobre.equipe.note":
    "Fotos e biografias a substituir por conteúdo real fornecido pelo cliente.",
  "sobre.equipe.m1.nome": "Lia",
  "sobre.equipe.m1.papel": "Fundadora",
  "sobre.equipe.m1.bio": "",
  "sobre.equipe.m1.foto": "",
  "sobre.equipe.m2.nome": "David",
  "sobre.equipe.m2.papel": "Sócio",
  "sobre.equipe.m2.bio": "",
  "sobre.equipe.m2.foto": "",
  "sobre.equipe.m3.nome": "Helder Moreira",
  "sobre.equipe.m3.papel": "Sócio",
  "sobre.equipe.m3.bio": "",
  "sobre.equipe.m3.foto": "",
  "sobre.equipe.m4.nome": "Case Managers",
  "sobre.equipe.m4.papel": "Estrutura de atendimento",
  "sobre.equipe.m4.bio": "",
  "sobre.equipe.m4.foto": "",

  "sobre.numeros.eyebrow": "NÚMEROS E CREDENCIAIS",
  "sobre.numeros.title": "O que sustenta a nossa operação.",
  "sobre.numeros.n1.valor": "25+",
  "sobre.numeros.n1.label": "anos de experiência",
  "sobre.numeros.n2.valor": "1.000+",
  "sobre.numeros.n2.label": "famílias atendidas",
  "sobre.numeros.n3.valor": "5.000+",
  "sobre.numeros.n3.label": "processos estruturados",
  "sobre.numeros.n4.valor": "98%",
  "sobre.numeros.n4.label": "de satisfação",
  "sobre.numeros.n5.valor": "130+",
  "sobre.numeros.n5.label": "avaliações 5★",
  "sobre.numeros.n6.valor": "A",
  "sobre.numeros.n6.label": "acreditação BBB",

  "sobre.cta.title": "Vamos estruturar o seu caso.",
  "sobre.cta.subtitle":
    "Comece pela análise gratuita: em até 48h retornamos com um caminho coerente com sua história.",
};



export type ContentKey = keyof typeof defaultContent;

export function useContent(key: ContentKey): string {
  const [value, setValue] = useState<string>(defaultContent[key]);
  useEffect(() => {
    let active = true;
    get<{ value: string }>("site_content", key).then((row) => {
      if (active && row?.value) setValue(row.value);
    });
    return () => { active = false; };
  }, [key]);
  return value;
}
