/**
 * Moteur de calcul RSA 2026
 * Basé sur les montants de base CAF et les règles d'éligibilité
 */

// Montants RSA 2026 (source : Légifrance, applicable au 1er avril 2025)
const RSA_BASE_MONTANTS = {
  seul: 646.52,        // Personne seule sans APL
  couple: 969.78,      // Couple sans APL
  monoparental_1enfant: 1106.94,  // Parent isolé avec 1 enfant sans APL
  monoparental_2enfants: 1383.68, // Parent isolé avec 2 enfants sans APL
  monoparental_3enfants: 1660.41, // Parent isolé avec 3 enfants sans APL
};

// Majorations par enfant supplémentaire (au-delà de 3 enfants)
const RSA_MAJORATION_ENFANT = 258.61; // 276.73 pour parent isolé

// Seuils de revenus (limites d'éligibilité)
const RSA_SEUILS = {
  seul: 600,
  couple: 900,
  monoparental: 700,
};

export interface RSACalculData {
  situation: string; // 'seul', 'couple', 'monoparental'
  enfants: number;
  revenus: number;
  logement: string; // 'loue', 'proprio', 'gratuit', 'sans-abri'
  activite: string; // 'actif', 'inactif', 'chomage'
}

export interface RSAResult {
  success: boolean;
  montantEstime: number;
  eligibilite: string;
  explication: string;
  details: {
    montantBase: number;
    majorations: number;
    revenusPris: number;
    abattement: number;
    montantFinal: number;
  };
}

/**
 * Calcule l'estimation RSA
 */
export function calculerRSA(data: RSACalculData): RSAResult {
  // Validation
  if (!data.situation || !data.logement || !data.activite) {
    return {
      success: false,
      montantEstime: 0,
      eligibilite: "Données incomplètes",
      explication: "Veuillez remplir tous les champs obligatoires.",
      details: {
        montantBase: 0,
        majorations: 0,
        revenusPris: 0,
        abattement: 0,
        montantFinal: 0,
      },
    };
  }

  // Calcul du montant de base selon la situation
  let montantBase = 0;
  if (data.situation === "seul") {
    montantBase = RSA_BASE_MONTANTS.seul;
  } else if (data.situation === "couple") {
    montantBase = RSA_BASE_MONTANTS.couple;
  } else if (data.situation === "monoparental") {
    if (data.enfants === 0) {
      montantBase = RSA_BASE_MONTANTS.seul; // Pas de monoparental sans enfant
    } else if (data.enfants === 1) {
      montantBase = RSA_BASE_MONTANTS.monoparental_1enfant;
    } else if (data.enfants === 2) {
      montantBase = RSA_BASE_MONTANTS.monoparental_2enfants;
    } else if (data.enfants >= 3) {
      montantBase = RSA_BASE_MONTANTS.monoparental_3enfants;
    }
  }

  // Majorations pour enfants supplémentaires
  let majorations = 0;
  if (data.situation === "monoparental" && data.enfants > 3) {
    majorations = (data.enfants - 3) * RSA_MAJORATION_ENFANT;
  } else if (data.situation !== "monoparental" && data.enfants > 0) {
    majorations = data.enfants * RSA_MAJORATION_ENFANT;
  }

  const montantBaseTotal = montantBase + majorations;

  // Prise en compte des revenus
  // Abattement de 38 % des revenus (règle simplifée)
  const revenusPris = data.revenus * 0.62; // 38% d'abattement = 62% comptabilisé

  // Calcul du montant final
  let montantFinal = montantBaseTotal - revenusPris;

  if (montantFinal < 0) {
    montantFinal = 0;
  }

  // Détermination de l'éligibilité
  let eligibilite = "";
  let explication = "";

  if (data.revenus > 1500) {
    // Seuil très haute indicatif (simplification)
    eligibilite = "Probablement non éligible";
    explication =
      "Vos revenus semblent dépasser les plafonds d'éligibilité au RSA.";
    montantFinal = 0;
  } else if (montantFinal <= 0) {
    eligibilite = "Non éligible";
    explication =
      "Vos revenus dépassent le montant de base du RSA. Vous ne pouvez pas en bénéficier.";
  } else if (montantFinal < 50) {
    eligibilite = "Éligible (montant très réduit)";
    explication = `Vous pourriez être éligible au RSA, mais le montant estimé est très faible (${montantFinal.toFixed(2)}€). La CAF évaluera votre dossier complètement.`;
  } else {
    eligibilite = "Probablement éligible";
    explication = `Vous pourriez être éligible au RSA selon les informations renseignées. Le montant estimé dépend de votre situation exacte et de la décision de la CAF. Le montant du RSA peut évoluer en fonction des ressources du foyer, de la composition familiale et des aides perçues.`;
  }

  // Ajustement selon situation de logement
  let explAjout = "";
  if (data.logement === "sans-abri") {
    explAjout =
      " (La CAF peut appliquer des règles ou ajustements spécifiques selon votre situation.)";
  }

  return {
    success: true,
    montantEstime: Math.max(0, montantFinal),
    eligibilite,
    explication: explication + explAjout,
    details: {
      montantBase,
      majorations,
      revenusPris: Math.round(revenusPris * 100) / 100,
      abattement: Math.round((data.revenus - revenusPris) * 100) / 100,
      montantFinal: Math.max(0, Math.round(montantFinal * 100) / 100),
    },
  };
}

/**
 * Formate le résultat pour affichage
 */
export function formatRSAResult(result: RSAResult): {
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
