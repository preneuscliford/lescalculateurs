/**
 * ARE (Allocation Retour Emploi) - Unemployment Benefits 2026 - Calculation Engine
 * Géré par France Travail (ancien Pôle Emploi)
 */

export interface AREData {
  situation: "seul" | "couple" | "parent";
  ancienneteEmploi: number; // months worked in last 28 months
  salaireReferent: number; // monthly average
  personnesCharge: number; // dependents
  agePersonne: number; // age (impacts max duration)
}

export interface AREResult {
  eligible: boolean;
  montantEstime: number;
  durationMax: number; // months
  explication: string;
  details: {
    tauxRemplacement: number;
    montantMinimum: number;
    montantMaximum: number;
  };
}

/**
 * Calculate ARE (Allocation Retour Emploi) - Unemployment benefits
 * France Travail - 2026 rates
 */
export function calculerARE(data: AREData): AREResult {
  const {
    situation,
    ancienneteEmploi,
    salaireReferent,
    personnesCharge,
    agePersonne,
  } = data;

  // ARE eligibility: minimum 4 months worked in last 28 months
  const minAnciennete = 4;
  if (ancienneteEmploi < minAnciennete) {
    return {
      eligible: false,
      montantEstime: 0,
      durationMax: 0,
      explication: `Vous devez justifier d'au minimum ${minAnciennete} mois d'activité dans les 28 derniers mois. Votre durée (${ancienneteEmploi} mois) est insuffisante.`,
      details: {
        tauxRemplacement: 0,
        montantMinimum: 0,
        montantMaximum: 0,
      },
    };
  }

  // ARE calculation: 57.43% of reference salary (2026)
  const tauxRemplacement = 0.5743;
  let montantEstime = salaireReferent * tauxRemplacement;

  // ARE minimum and maximum (2026 rates)
  // Source : France Travail - Barèmes officiels au 1er janvier 2026
  const montantMinimum = 31.50; // euros/day minimum ARE 2026
  const montantMaximumDaily = 91.82; // euros/day maximum ARE 2026
  const montantMaximum = montantMaximumDaily * 30; // ~2 755€/mois

  // Check minimums/maximums
  if (montantEstime < montantMinimum * 30) {
    montantEstime = montantMinimum * 30;
  }
  if (montantEstime > montantMaximum) {
    montantEstime = montantMaximum;
  }

  // Duration: based on age (2026 rules)
  // - Under 53: max 24 months
  // - 53 and over: max 36 months
  let durationMax = agePersonne >= 53 ? 36 : 24;
  
  // Note: Actual duration also depends on exact days worked and deferral periods

  montantEstime = Math.round(montantEstime * 100) / 100;

  return {
    eligible: true,
    montantEstime,
    durationMax,
    explication: `Montant estimé: ${montantEstime.toFixed(2)}€ brut/mois (base: ${salaireReferent}€ × 57.43% = ${(salaireReferent * 0.5743).toFixed(2)}€, plafonné entre ${(31.50 * 30).toFixed(0)}€ et ${(91.82 * 30).toFixed(0)}€). Durée max: ${durationMax} mois. France Travail confirmera le montant définitif lors de l'étude de votre dossier.`,
    details: {
      tauxRemplacement,
      montantMinimum: Math.round(montantMinimum * 30),
      montantMaximum: Math.round(montantMaximum),
    },
  };
}
