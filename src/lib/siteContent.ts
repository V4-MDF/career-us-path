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
