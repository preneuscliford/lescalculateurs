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

  // ARE eligibility: minimum gross salary
  const salaireMinimumARE = 1000; // approximate, depends on region
  if (salaireReferent < salaireMinimumARE) {
    return {
      eligible: false,
      montantEstime: 0,
      durationMax: 0,
      explication: `Le salaire de référence (${salaireReferent}€) semble insuffisant pour ouvrir les droits ARE. France Travail fixe des seuils minimums selon votre région.`,
      details: {
        tauxRemplacement: 0,
        montantMinimum: 0,
        montantMaximum: 0,
      },
    };
  }

  // ARE calculation: 57.4% of reference salary (2026)
  const tauxRemplacement = 0.574;
  let montantEstime = salaireReferent * tauxRemplacement;

  // ARE minimum and maximum (2026 rates)
  // Source : Unédic - Montant minimum applicable depuis le 1er juillet 2025
  const montantMinimum = 32.13; // euros/day (corrigé : 31.45 → 32.13)
  const montantMaximumDaily = 186.92; // euros/day (max 2026)
  const montantMaximum = montantMaximumDaily * 30; // approximate monthly

  // Check minimums/maximums
  if (montantEstime < montantMinimum * 30) {
    montantEstime = montantMinimum * 30;
  }
  if (montantEstime > montantMaximum) {
    montantEstime = montantMaximum;
  }

  // Duration: DO NOT return fixed number (YMYL risk)
  // Duration depends on age, seniority, deferral periods, and regulatory changes
  let durationMax = 0; // placeholder - not used in display

  montantEstime = Math.round(montantEstime * 100) / 100;

  return {
    eligible: true,
    montantEstime,
    durationMax,
    explication: `Vous pourriez percevoir environ ${montantEstime.toFixed(2)}€ par mois. La durée d'indemnisation est variable et dépend de votre âge, votre ancienneté exacte, les différés applicables et les règles en vigueur. France Travail déterminera précisément votre situation lors de l'étude de votre dossier.`,
    details: {
      tauxRemplacement,
      montantMinimum: Math.round(montantMinimum * 30),
      montantMaximum: Math.round(montantMaximum),
    },
  };
}
