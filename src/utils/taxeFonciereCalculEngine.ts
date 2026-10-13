/**
 * Taxe foncière sur les propriétés bâties : moteur unique du simulateur /pages/taxe.
 *
 * Taxe = valeur locative cadastrale × taux global (taux officiel DGFiP de la commune,
 * ou taux saisi depuis l'avis d'imposition). Aucun taux « moyen » de repli : sans taux
 * de la commune, le calcul n'est pas fait.
 *
 * Exonérations et dégrèvement : seules les règles officielles sont signalées, sans les
 * déduire du montant, car elles dépendent du revenu fiscal de référence (limite de
 * l'article 1417-I du CGI) que le simulateur ne demande pas.
 * Source : impots.gouv.fr, « Exonérations et dégrèvements » (vérifié le 13/10/2026).
 */

export interface TaxeFonciereInput {
  valeurLocative: number;
  /** Taux global en pourcentage (ex. 33,5 pour 33,5 %) */
  tauxPct: number;
  age?: number;
  /** Titulaire de l'AAH, de l'ASPA ou de l'ASI */
  allocataire?: boolean;
}

export interface TaxeFonciereResult {
  valeurLocative: number;
  taux: number;
  taxeFonciere: number;
  allegementsPossibles: string[];
}

export const AGE_DEGREVEMENT_100 = 65;
export const AGE_EXONERATION = 75;
export const MONTANT_DEGREVEMENT = 100;

export function allegementsPossibles(age = 0, allocataire = false): string[] {
  const out: string[] = [];
  if (allocataire) {
    out.push(
      "Titulaire de l'ASPA ou de l'ASI : exonération totale de la taxe foncière de votre résidence principale. Titulaire de l'AAH : même exonération si votre revenu fiscal de référence ne dépasse pas la limite de l'article 1417-I du CGI.",
    );
  }
  if (age >= AGE_EXONERATION) {
    out.push(
      `Plus de ${AGE_EXONERATION} ans au 1er janvier : exonération totale de la taxe foncière de votre résidence principale si votre revenu fiscal de référence ne dépasse pas la limite de l'article 1417-I du CGI.`,
    );
  } else if (age >= AGE_DEGREVEMENT_100) {
    out.push(
      `Entre ${AGE_DEGREVEMENT_100} et ${AGE_EXONERATION} ans au 1er janvier : dégrèvement d'office de ${MONTANT_DEGREVEMENT} € sur la taxe foncière de votre résidence principale si votre revenu fiscal de référence est inférieur à la limite de l'article 1417-I du CGI.`,
    );
  }
  return out;
}

export function calculerTaxeFonciere(input: TaxeFonciereInput): TaxeFonciereResult {
  const valeurLocative = Math.max(0, Number(input.valeurLocative) || 0);
  const taux = Math.max(0, Number(input.tauxPct) || 0) / 100;
  return {
    valeurLocative,
    taux,
    taxeFonciere: valeurLocative * taux,
    allegementsPossibles: allegementsPossibles(Number(input.age) || 0, !!input.allocataire),
  };
}
