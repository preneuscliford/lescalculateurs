/**
 * Moteur de calcul RSA 2026
 * Basé sur les montants de base CAF et les règles d'éligibilité
 */

// Montants RSA 2026 (sources : CAF et Légifrance, applicable au 1er avril 2025)
// Références officielles :
// - https://www.caf.fr/allocataires/aides-et-demarches/mes-aides/fiches-aides/le-revenu-de-solidarite-active-rsa
// - https://www.service-public.fr/particuliers/vosdroits/N19775
const RSA_BASE_MONTANTS = {
  seul: 652.02,        // Personne seule (montant forfaitaire depuis avril 2025)
  couple: 978.03,      // Couple sans enfant (montant forfaitaire depuis avril 2025)
  monoparental_1enfant: 1141.04,  // Parent isolé avec 1 enfant
  monoparental_2enfants: 1304.04, // Couple avec 2 enfants ou parent isolé avec 2 enfants
  monoparental_3enfants: 1467.04, // Parent isolé avec 3 enfants
};

// Majorations par enfant supplémentaire (au-delà du nombre de base)
// Source : https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000029950390
const RSA_MAJORATION_ENFANT = 163.01; // Majoration par enfant pour couple (après le premier)
const RSA_MAJORATION_ENFANT_MONOPARENTAL = 163.01; // Majoration par enfant supplémentaire pour parent isolé

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
  // Règle : majoration de 163,01€ par enfant supplémentaire au-delà de la composition de base
  let majorations = 0;
  if (data.situation === "monoparental" && data.enfants > 1) {
    // Parent isolé : montant base déjà inclus pour 1 enfant, majoration à partir du 2ème
    majorations = (data.enfants - 1) * RSA_MAJORATION_ENFANT_MONOPARENTAL;
  } else if (data.situation === "couple" && data.enfants > 0) {
    // Couple : majoration de 163,01€ par enfant
    majorations = data.enfants * RSA_MAJORATION_ENFANT;
  } else if (data.situation === "seul" && data.enfants > 0) {
    // Personne seule avec enfants (devient monoparental)
    // Déjà géré par les montants monoparentaux
    majorations = 0;
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
