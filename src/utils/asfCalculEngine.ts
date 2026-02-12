/**
 * ASF (Allocation de Soutien Familial) 2026 - Calculation Engine
 * Support allocation for single parents and orphans
 */

export interface ASFData {
  situation: "parentisole" | "orphelin" | "depourvu";
  nombreEnfants: number; // number of children under 21
  revenus: number; // monthly household income
  enfantACharge: boolean; // at least one child under 21
}

export interface ASFResult {
  eligible: boolean;
  montantEstime: number;
  explication: string;
  details: {
    montantParEnfant: number;
    ressourcesMaxi: number;
    nombreEnfantsEligibles: number;
  };
}

/**
 * Calculate ASF (Allocation de Soutien Familial)
 * For single parents and orphans - 2026 rates
 */
export function calculerASF(data: ASFData): ASFResult {
  const { situation, nombreEnfants, revenus, enfantACharge } = data;

  // ASF requires at least one child under 21
  if (!enfantACharge || nombreEnfants === 0) {
    return {
      eligible: false,
      montantEstime: 0,
      explication:
        "L'ASF nécessite d'avoir au moins un enfant à charge de moins de 21 ans.",
      details: {
        montantParEnfant: 0,
        ressourcesMaxi: 0,
        nombreEnfantsEligibles: 0,
      },
    };
  }

  // ASF monthly amount 2026 (per child)
  // Source officielle : service-public.fr - Montant actualisé au 1er avril 2025
  const montantParEnfant = 199.19; // 2026 rate per child (taux de base)

  // Resource ceiling 2026
  // Single parent with children
  const ressourcesMaxi = 945 + nombreEnfants * 250;

  // Check resources
  if (revenus > ressourcesMaxi) {
    return {
      eligible: false,
      montantEstime: 0,
      explication: `Vos ressources (${revenus}€) dépassent le plafond autorisé (${ressourcesMaxi.toFixed(2)}€). Vous ne pouvez pas bénéficier de l\'ASF actuellement.`,
      details: {
        montantParEnfant,
        ressourcesMaxi,
        nombreEnfantsEligibles: 0,
      },
    };
  }

  // Calculate estimated amount
  const nombreEnfantsEligibles = Math.min(
    nombreEnfants,
    3, // ASF typically capped at 3 children
  );
  let montantEstime = montantParEnfant * nombreEnfantsEligibles;

  montantEstime = Math.round(montantEstime * 100) / 100;

  return {
    eligible: true,
    montantEstime,
    explication: `En fonction de votre situation familiale (parent isolé, nombre d'enfants à charge), vous pourriez recevoir environ ${montantEstime.toFixed(2)}€ par mois pour ${nombreEnfantsEligibles} enfant(s). Ce montant est indicatif et dépend de l'examen complet de votre dossier par la CAF.`,
    details: {
      montantParEnfant,
      ressourcesMaxi,
      nombreEnfantsEligibles,
    },
  };
}
