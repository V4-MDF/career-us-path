/**
 * Conteúdo editável da home — defaults consumidos pelos componentes.
 *
 * Os componentes leem via `useContent(key)` que tenta primeiro o dataStore
 * (tabela `site_content`) e cai para o default abaixo. Assim o admin futuro
 * pode espelhar/sobrescrever sem alterar componentes.
 */

import { useEffect, useState } from "react";
import { get } from "./dataStore";

export const defaultContent = {
  "hero.eyebrow": "IMIGRAÇÃO PARA OS ESTADOS UNIDOS • EB-2 NIW",
  "hero.title": "Seu Green Card americano baseado no mérito da sua carreira.",
  "hero.subtitle":
    "A Status na América ajuda profissionais brasileiros consolidados a conquistar a residência permanente nos EUA pelo EB-2 NIW — sem patrocinador, sem loteria, com Green Card para o cônjuge e os filhos.",
  "hero.cta": "Fazer minha avaliação gratuita",
  "hero.proof": "+1.000 famílias atendidas [CONFIRMAR] · Nota 5,0 no Google · Sede em Orlando, Flórida",

  "contrast.title": "Você não precisa recomeçar do zero.",
  "contrast.subtitle": "Precisa de um novo cenário para a carreira que você já construiu.",

  "niw.title": "EB-2 NIW: o Green Card por mérito profissional",
  "niw.lead":
    "O National Interest Waiver permite que profissionais altamente qualificados solicitem a residência permanente nos EUA sem patrocinador, demonstrando que sua atuação é de interesse nacional americano — geração de renda, impostos e empregos.",

  "process.title": "Um método. Três passos. Acompanhamento até a aprovação.",

  "why.title": "Por que a Status na América",
  "why.lead":
    "Sede própria em Orlando, equipe dedicada e mais de duas décadas estruturando casos de mobilidade migratória para brasileiros.",

  "cta.title": "Descubra se você já tem perfil para o Green Card.",
  "cta.subtitle":
    "Avaliação gratuita e confidencial. Em até 48h nossa equipe analisa seu perfil e indica o caminho mais coerente com sua história.",
};

export type ContentKey = keyof typeof defaultContent;

export function useContent(key: ContentKey): string {
  const [value, setValue] = useState<string>(defaultContent[key]);
  useEffect(() => {
    let active = true;
    get<{ value: string }>("site_content", key).then((row) => {
      if (active && row?.value) setValue(row.value);
    });
    return () => {
      active = false;
    };
  }, [key]);
  return value;
}
