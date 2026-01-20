/**
 * Moteur de calcul Prime d'activité 2026
 * Basé sur les montants de base CAF et les règles d'éligibilité
 */

// Montants Prime d'activité 2026 (références CAF indicatives)
const PRIME_BASE_MONTANTS = {
  seul: 163.83,
  couple: 245.74,
  monoparental_1enfant: 196.38,
  monoparental_2enfants: 235.54,
  monoparental_3enfants: 274.71,
};

// Majoration par enfant supplémentaire
const PRIME_MAJORATION_ENFANT = 39.17;

// Plafond minimum de revenu d'activité
const PRIME_SEUIL_MIN_REVENU_ACTIVITE = 150; // Doit travailler minimum

export interface PrimeActiviteCalculData {
  situation: string; // 'seul', 'couple', 'monoparental'
  enfants: number;
  revenusProf: number; // Revenus professionnels
  autresRevenus: number; // Autres revenus (allocations, etc.)
  logement: string; // 'loue', 'proprio', 'gratuit'
  typeActivite: string; // 'salarie', 'independant', 'apprenti'
}

export interface PrimeActiviteResult {
  success: boolean;
  montantEstime: number;
  eligibilite: string;
  explication: string;
  details: {
    montantBase: number;
    majorations: number;
    revenusProfsComptabilises: number;
    autresRevenusComptabilises: number;
    totalRevenusComptabilises: number;
    montantFinal: number;
  };
}

/**
 * Calcule l'estimation Prime d'activité
 */
export function calculerPrimeActivite(
  data: PrimeActiviteCalculData,
): PrimeActiviteResult {
  // Validation
  if (!data.situation || !data.logement || !data.typeActivite) {
    return {
      success: false,
      montantEstime: 0,
      eligibilite: "Données incomplètes",
      explication: "Veuillez remplir tous les champs obligatoires.",
      details: {
        montantBase: 0,
        majorations: 0,
        revenusProfsComptabilises: 0,
        autresRevenusComptabilises: 0,
        totalRevenusComptabilises: 0,
        montantFinal: 0,
      },
    };
  }

  // Vérification que l'on travaille (condition essentielle)
  if (data.revenusProf < PRIME_SEUIL_MIN_REVENU_ACTIVITE) {
    return {
      success: true,
      montantEstime: 0,
      eligibilite: "Non éligible",
      explication:
        "La Prime d'activité est réservée aux personnes exerçant une activité professionnelle. Vos revenus d'activité doivent être au minimum 150€/mois.",
      details: {
        montantBase: 0,
        majorations: 0,
        revenusProfsComptabilises: data.revenusProf,
        autresRevenusComptabilises: data.autresRevenus,
        totalRevenusComptabilises: data.revenusProf + data.autresRevenus,
        montantFinal: 0,
      },
    };
  }

  // Calcul du montant de base selon la situation
  let montantBase = 0;
  if (data.situation === "seul") {
    montantBase = PRIME_BASE_MONTANTS.seul;
  } else if (data.situation === "couple") {
    montantBase = PRIME_BASE_MONTANTS.couple;
  } else if (data.situation === "monoparental") {
    if (data.enfants === 0) {
      montantBase = PRIME_BASE_MONTANTS.seul; // Pas de monoparental sans enfant
    } else if (data.enfants === 1) {
      montantBase = PRIME_BASE_MONTANTS.monoparental_1enfant;
    } else if (data.enfants === 2) {
      montantBase = PRIME_BASE_MONTANTS.monoparental_2enfants;
    } else if (data.enfants >= 3) {
      montantBase = PRIME_BASE_MONTANTS.monoparental_3enfants;
    }
  }

  // Majorations pour enfants supplémentaires
  let majorations = 0;
  if (data.situation === "monoparental" && data.enfants > 3) {
    majorations = (data.enfants - 3) * PRIME_MAJORATION_ENFANT;
  } else if (data.situation !== "monoparental" && data.enfants > 0) {
    majorations = data.enfants * PRIME_MAJORATION_ENFANT;
  }

  const montantBaseTotal = montantBase + majorations;

  // Calcul de la prise en compte des revenus
  // Pourcentage d'abattement sur revenus (règle simplifiée : 12%)
  const tauxAbattement = 0.12;
  const revenusProfsComptabilises = data.revenusProf * (1 - tauxAbattement);
  const autresRevenusComptabilises = data.autresRevenus; // Pris intégralement

  const totalRevenusComptabilises =
    revenusProfsComptabilises + autresRevenusComptabilises;

  // Montant final = montant de base - revenus comptabilisés
  let montantFinal = montantBaseTotal - totalRevenusComptabilises;

  if (montantFinal < 0) {
    montantFinal = 0;
  }

  // Détermination de l'éligibilité
  let eligibilite = "";
  let explication = "";

  if (data.revenusProf + data.autresRevenus > 2000) {
    // Seuil très haut indicatif
    eligibilite = "Probablement non éligible";
    explication =
      "Vos revenus totaux semblent dépasser les plafonds d'éligibilité à la Prime d'activité.";
    montantFinal = 0;
  } else if (montantFinal <= 0) {
    eligibilite = "Non éligible";
    explication =
      "Vos revenus dépassent le montant de base de la Prime d'activité. Vous ne semblez pas pouvoir en bénéficier selon les informations renseignées. La Prime d'activité dépend de seuils précis et peut évoluer en cas de changement de revenus ou de situation.";
  } else if (montantFinal < 15) {
    eligibilite = "Éligible (montant très faible)";
    explication = `Vous pourriez être éligible à la Prime d'activité, mais le montant estimé est très réduit (${montantFinal.toFixed(2)}€). La CAF évaluera votre dossier.`;
  } else {
    eligibilite = "Probablement éligible";
    explication = `Vous pourriez être éligible à la Prime d'activité. Le montant estimé dépend de votre situation exacte et de la validation par la CAF.`;
  }

  return {
    success: true,
    montantEstime: Math.max(0, montantFinal),
    eligibilite,
    explication,
    details: {
      montantBase,
      majorations,
      revenusProfsComptabilises:
        Math.round(revenusProfsComptabilises * 100) / 100,
      autresRevenusComptabilises:
        Math.round(autresRevenusComptabilises * 100) / 100,
      totalRevenusComptabilises:
        Math.round(totalRevenusComptabilises * 100) / 100,
      montantFinal: Math.max(0, Math.round(montantFinal * 100) / 100),
    },
  };
}

/**
 * Formate le résultat pour affichage
 */
export function formatPrimeActiviteResult(result: PrimeActiviteResult): {
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
