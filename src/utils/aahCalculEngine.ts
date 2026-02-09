/**
 * Moteur de calcul AAH 2026
 * Basé sur les montants CAF et règles d'éligibilité
 */

// PLAFOND STRICT AAH 2026 - Ne jamais dépasser
// Source : Décret du 29 mars 2025 - applicable au 1er avril 2025
const AAH_PLAFOND_2026 = 1033.32; // Montant maximum AAH versé (taux plein)

// Montants de référence CAF
// Note : Depuis la déconjugalisation (oct 2023), seul le montant "seul" est pertinent
const AAH_MONTANTS_2026 = {
  seul: 1033.32,  // Taux plein (sans revenus)
  couple: 1033.32, // Identique depuis déconjugalisation
};

// Seuils d'incapacité
const AAH_SEUIL_MIN_INCAPACITE = 50; // Minimum 50%
const AAH_SEUIL_MAJORÉ = 80; // Majoré à 80%

// Seuil maximum de revenus (simplifié)
const AAH_SEUIL_MAX_REVENUS = 1500;

export interface AAHCalculData {
  situation: string; // 'seul', 'couple', 'monoparental'
  enfants: number;
  tauxIncapacite: number; // 50-79 ou 80+
  revenus: number; // Revenus mensuels du foyer
  logement: string; // 'locataire', 'proprio', 'heberge'
}

export interface AAHResult {
  success: boolean;
  montantEstime: number;
  eligibilite: string;
  explication: string;
  details: {
    montantBase: number;
    majorations: number;
    revenusComptabilises: number;
    abattement: number;
    montantFinal: number;
  };
}

/**
 * Calcule l'estimation AAH
 */
export function calculerAAH(data: AAHCalculData): AAHResult {
  // Validation
  if (
    !data.situation ||
    !data.logement ||
    data.tauxIncapacite < AAH_SEUIL_MIN_INCAPACITE
  ) {
    return {
      success: false,
      montantEstime: 0,
      eligibilite: "Données incomplètes",
      explication:
        "Le taux d'incapacité doit être d'au minimum 50%. Veuillez remplir tous les champs.",
      details: {
        montantBase: 0,
        majorations: 0,
        revenusComptabilises: 0,
        abattement: 0,
        montantFinal: 0,
      },
    };
  }

  // Calcul du montant de base selon la situation
  let montantBase = 0;
  if (data.situation === "seul") {
    montantBase = AAH_MONTANTS_2026.seul;
  } else if (data.situation === "couple") {
    montantBase = AAH_MONTANTS_2026.couple;
  } else {
    // Monoparental: utiliser le montant seul (sans majoration enfants)
    // Les enfants ne majorent pas l'AAH directement
    montantBase = AAH_MONTANTS_2026.seul;
  }

  // IMPORTANT: Les enfants ne majorent PAS l'AAH
  // L'AAH est une allocation individuelle, même pour les parents
  const majorations = 0;
  const montantBaseTotal = montantBase;

  // Calcul de la prise en compte des revenus (abattement simplifié)
  const tauxAbattement = 0.1; // 10% d'abattement simplifié
  const revenusComptabilises = Math.max(0, data.revenus * (1 - tauxAbattement));
  const abattement = data.revenus - revenusComptabilises;

  // Montant final = montant de base - revenus comptabilisés
  let montantFinal = montantBaseTotal - revenusComptabilises;

  if (montantFinal < 0) {
    montantFinal = 0;
  }

  // ⚠️ MANDATORY CAP: AAH cannot exceed regulatory ceiling (YMYL safety)
  montantFinal = Math.min(montantFinal, AAH_PLAFOND_2026);

  // Détermination de l'éligibilité
  let eligibilite = "";
  let explication = "";

  if (data.tauxIncapacite < AAH_SEUIL_MIN_INCAPACITE) {
    eligibilite = "Non éligible";
    explication =
      "L'AAH nécessite un taux d'incapacité d'au minimum 50% reconnu par la MDPH. Votre situation ne semble pas correspondre.";
    montantFinal = 0;
  } else if (data.revenus > AAH_SEUIL_MAX_REVENUS) {
    eligibilite = "Probablement non éligible";
    explication =
      "Vos revenus totaux semblent dépasser les plafonds d'éligibilité à l'AAH selon les règles CAF.";
    montantFinal = 0;
  } else if (montantFinal <= 0) {
    eligibilite = "Non éligible";
    explication =
      "Vos ressources dépassent le montant de base de l'AAH. Vous ne semblez pas pouvoir en bénéficier selon les informations renseignées.";
  } else if (montantFinal < 50) {
    eligibilite = "Éligible (montant très réduit)";
    explication = `Vous pourriez percevoir environ ${montantFinal.toFixed(2)}€ par mois. Ce montant est plafonné au plafond réglementaire de l'AAH (≈ ${AAH_PLAFOND_2026}€). La CAF évaluera votre dossier complètement en prenant en compte votre taux d'incapacité reconnu par la MDPH, vos ressources exactes et votre composition familiale.`;
  } else {
    eligibilite = "Probablement éligible";
    explication = `Vous pourriez percevoir environ ${montantFinal.toFixed(2)}€ par mois. Ce montant est plafonné au plafond réglementaire de l'AAH. L'estimation dépend de votre situation exacte et de la décision finale de la CAF, qui prendra en compte votre taux d'incapacité reconnu par la MDPH, vos ressources et votre situation familiale.`;
  }

  return {
    success: true,
    montantEstime: Math.max(0, montantFinal),
    eligibilite,
    explication,
    details: {
      montantBase,
      majorations,
      revenusComptabilises: Math.round(revenusComptabilises * 100) / 100,
      abattement: Math.round(abattement * 100) / 100,
      montantFinal: Math.max(0, Math.round(montantFinal * 100) / 100),
    },
  };
}

/**
 * Formate le résultat pour affichage
 */
export function formatAAHResult(result: AAHResult): {
  montantDisplay: string;
  explDisplay: string;
} {
  const montantDisplay =
    result.montantEstime > 0
      ? `${Math.round(result.montantEstime)}€ / mois`
      : "Non éligible";

  const explDisplay = result.explication;

  return {
    montantDisplay,
    explDisplay,
  };
}
