/**
 * PTZ (pret a taux zero) - verification rapide d'eligibilite au plafond de
 * ressources uniquement. Ne calcule PAS le montant du pret (quotite de
 * financement, plafond de cout d'operation) : cette partie depend aussi du
 * type de logement (collectif/individuel) et n'est pas couverte ici par
 * prudence. Renvoyer vers le simulateur officiel pour le montant exact.
 *
 * Source des plafonds : bareme PTZ 2026 (inchange vs 2025), zone A regroupe
 * A bis et A.
 */

export type ZonePTZ = "A" | "B1" | "B2" | "C";

const PLAFONDS_RESSOURCES: Record<ZonePTZ, number[]> = {
  // index 0 = 1 personne, ..., index 6 = 7 personnes, index 7 = 8 personnes et plus
  A: [49000, 73500, 88200, 102900, 117600, 132300, 147000, 161700],
  B1: [34500, 51750, 62100, 72450, 82800, 93150, 103500, 113850],
  B2: [31500, 47250, 56700, 66150, 75600, 85050, 94500, 103950],
  C: [28500, 42750, 51300, 59850, 68400, 76950, 85500, 94050],
};

export interface PTZEligibiliteData {
  zone: ZonePTZ;
  nombrePersonnes: number;
  revenuFiscalReference: number;
}

export interface PTZEligibiliteResult {
  eligible: boolean;
  plafondApplicable: number;
  ecart: number;
}

export function verifierEligibilitePTZ(data: PTZEligibiliteData): PTZEligibiliteResult {
  const { zone, nombrePersonnes, revenuFiscalReference } = data;
  const index = Math.min(Math.max(1, Math.round(nombrePersonnes)), 8) - 1;
  const plafondApplicable = PLAFONDS_RESSOURCES[zone][index];
  const rfr = Number.isFinite(revenuFiscalReference) ? Math.max(0, revenuFiscalReference) : 0;

  return {
    eligible: rfr <= plafondApplicable,
    plafondApplicable,
    ecart: Math.round((plafondApplicable - rfr) * 100) / 100,
  };
}

export function formatEuro(value: number): string {
  return Math.round(value).toLocaleString("fr-FR") + " €";
}

export function formatPTZEligibiliteResult(result: PTZEligibiliteResult): {
  statutDisplay: string;
  explicationDisplay: string;
  detailsDisplay: string;
} {
  const statutDisplay = result.eligible ? "Potentiellement éligible" : "Plafond dépassé";

  const explicationDisplay = result.eligible
    ? `Votre revenu fiscal de référence est inférieur au plafond de ${formatEuro(result.plafondApplicable)} pour votre zone et la taille de votre foyer. Vous passez cette première condition du PTZ — le montant exact dépend ensuite du type de logement et du coût de l'opération.`
    : `Votre revenu fiscal de référence dépasse le plafond de ${formatEuro(result.plafondApplicable)} pour votre zone et la taille de votre foyer. Le PTZ n'est a priori pas accessible sur ce critère de ressources.`;

  const detailsDisplay = [
    `• Plafond de ressources applicable : ${formatEuro(result.plafondApplicable)}`,
    `• ${result.eligible ? "Marge sous le plafond" : "Dépassement du plafond"} : ${formatEuro(Math.abs(result.ecart))}`,
  ].join("\n");

  return { statutDisplay, explicationDisplay, detailsDisplay };
}
