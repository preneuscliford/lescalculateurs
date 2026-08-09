/**
 * Indemnite legale de licenciement (regime general, hors faute grave/lourde)
 * Formule : 1/4 de mois de salaire par annee d'anciennete jusqu'a 10 ans,
 * puis 1/3 de mois par annee au-dela. Anciennete minimale : 8 mois continus
 * (article L1234-9 du Code du travail). Les annees incompletes comptent au
 * prorata des mois.
 *
 * Une convention collective peut prevoir un montant plus favorable : c'est
 * alors celui-ci qui s'applique. Ce simulateur ne calcule que le minimum legal.
 */

export const ANCIENNETE_MINIMALE_MOIS = 8;
export const SEUIL_ANNEES_TIER_SUPERIEUR = 10;
export const QUOTE_PART_JUSQUA_10_ANS = 1 / 4;
export const QUOTE_PART_AU_DELA_10_ANS = 1 / 3;

export interface IndemniteLicenciementData {
  dateEntree: Date;
  dateSortie: Date;
  salaireMensuelBrutMoyen: number;
}

export interface IndemniteLicenciementResult {
  eligible: boolean;
  ancienneteMois: number;
  ancienneteAnneesDecimal: number;
  portionJusqua10Ans: number;
  portionAuDela10Ans: number;
  montantJusqua10Ans: number;
  montantAuDela10Ans: number;
  montantTotal: number;
}

function moisEntreDates(dateEntree: Date, dateSortie: Date): number {
  const anneeDiff = dateSortie.getUTCFullYear() - dateEntree.getUTCFullYear();
  const moisDiff = dateSortie.getUTCMonth() - dateEntree.getUTCMonth();
  const jourAjustement = dateSortie.getUTCDate() < dateEntree.getUTCDate() ? -1 : 0;
  return Math.max(0, anneeDiff * 12 + moisDiff + jourAjustement);
}

export function calculerIndemniteLicenciement(
  data: IndemniteLicenciementData,
): IndemniteLicenciementResult {
  const { dateEntree, dateSortie, salaireMensuelBrutMoyen } = data;
  const ancienneteMois = moisEntreDates(dateEntree, dateSortie);
  const eligible = ancienneteMois >= ANCIENNETE_MINIMALE_MOIS;

  const ancienneteAnneesDecimal = ancienneteMois / 12;
  const portionJusqua10Ans = Math.min(ancienneteAnneesDecimal, SEUIL_ANNEES_TIER_SUPERIEUR);
  const portionAuDela10Ans = Math.max(0, ancienneteAnneesDecimal - SEUIL_ANNEES_TIER_SUPERIEUR);

  const salaire = Number.isFinite(salaireMensuelBrutMoyen) ? Math.max(0, salaireMensuelBrutMoyen) : 0;
  const montantJusqua10Ans = eligible ? salaire * QUOTE_PART_JUSQUA_10_ANS * portionJusqua10Ans : 0;
  const montantAuDela10Ans = eligible ? salaire * QUOTE_PART_AU_DELA_10_ANS * portionAuDela10Ans : 0;

  return {
    eligible,
    ancienneteMois,
    ancienneteAnneesDecimal,
    portionJusqua10Ans,
    portionAuDela10Ans,
    montantJusqua10Ans,
    montantAuDela10Ans,
    montantTotal: Math.round((montantJusqua10Ans + montantAuDela10Ans) * 100) / 100,
  };
}

export function formatAnciennete(mois: number): string {
  const annees = Math.floor(mois / 12);
  const moisRestants = mois % 12;
  if (annees === 0) return `${moisRestants} mois`;
  if (moisRestants === 0) return `${annees} an${annees > 1 ? "s" : ""}`;
  return `${annees} an${annees > 1 ? "s" : ""} et ${moisRestants} mois`;
}

export function formatEuro(value: number): string {
  return value.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
}

export function formatIndemniteLicenciementResult(result: IndemniteLicenciementResult): {
  montantDisplay: string;
  explicationDisplay: string;
  detailsDisplay: string;
} {
  if (!result.eligible) {
    return {
      montantDisplay: "Non éligible",
      explicationDisplay: `Avec ${formatAnciennete(result.ancienneteMois)} d'ancienneté, le seuil minimum de ${ANCIENNETE_MINIMALE_MOIS} mois continus n'est pas atteint pour ouvrir droit à l'indemnité légale de licenciement.`,
      detailsDisplay: "",
    };
  }

  const montantDisplay = formatEuro(result.montantTotal);
  const explicationDisplay = `Avec ${formatAnciennete(result.ancienneteMois)} d'ancienneté, l'indemnité légale minimale est estimée à ${montantDisplay}. Une convention collective peut prévoir un montant plus favorable : c'est alors celui-ci qui s'applique.`;

  const detailsDisplay = [
    `• Ancienneté prise en compte : ${formatAnciennete(result.ancienneteMois)}`,
    `• Part jusqu'à 10 ans (1/4 de mois/an) : ${formatEuro(result.montantJusqua10Ans)}`,
    result.portionAuDela10Ans > 0
      ? `• Part au-delà de 10 ans (1/3 de mois/an) : ${formatEuro(result.montantAuDela10Ans)}`
      : null,
    `• = Indemnité légale minimale estimée : ${montantDisplay}`,
  ]
    .filter((line): line is string => line !== null)
    .join("\n");

  return { montantDisplay, explicationDisplay, detailsDisplay };
}
