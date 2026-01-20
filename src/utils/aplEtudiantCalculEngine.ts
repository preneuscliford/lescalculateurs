/**
 * APL Étudiant / Jeune Actif 2026 - Calculation Engine
 * Allocation Personnalisée au Logement (simplified for students)
 */

export interface APLEtudiantData {
  situation: "seul" | "couple" | "parent";
  age: number;
  revenus: number; // monthly
  chargesLocatives: number; // monthly rent
  personnesCharge: number; // number of dependents
}

export interface APLEtudiantResult {
  eligible: boolean;
  montantEstime: number;
  explication: string;
  details: {
    ressourcesMaxi: number;
    pourcentageLoyer: number;
  };
}

/**
 * Calculate APL for students/young workers
 * 2026 rates based on CNRH
 */
export function calculerAPLEtudiant(data: APLEtudiantData): APLEtudiantResult {
  // APL student rules (simplified)
  // Base: cover ~50-65% of rent up to ceiling

  const { situation, age, revenus, chargesLocatives, personnesCharge } = data;

  // Resources ceiling 2026 (updated)
  let ressourcesMaxiBase = 0;
  switch (situation) {
    case "seul":
      ressourcesMaxiBase = 1500;
      break;
    case "couple":
      ressourcesMaxiBase = 2200;
      break;
    case "parent":
      ressourcesMaxiBase = 1800 + personnesCharge * 600;
      break;
  }

  // Check eligibility
  const eligible = revenus <= ressourcesMaxiBase;

  if (!eligible) {
    return {
      eligible: false,
      montantEstime: 0,
      explication: `Vos revenus (${revenus}€) dépassent le plafond autorisé (${ressourcesMaxiBase}€). Vous ne pouvez pas bénéficier de l'APL étudiant.`,
      details: {
        ressourcesMaxi: ressourcesMaxiBase,
        pourcentageLoyer: 0,
      },
    };
  }

  // Calculate APL (simplified model)
  // APL typically covers 50-60% of rent for students
  const pourcentageLoyer = 0.55;
  let montantEstime = chargesLocatives * pourcentageLoyer;

  // Minimum rent threshold
  const loyerMinimum = 150;
  if (chargesLocatives < loyerMinimum) {
    return {
      eligible: false,
      montantEstime: 0,
      explication: `Le loyer (${chargesLocatives}€) est inférieur au minimum requis (${loyerMinimum}€).`,
      details: {
        ressourcesMaxi: ressourcesMaxiBase,
        pourcentageLoyer: 0,
      },
    };
  }

  // Ceiling by situation
  let plafondMonthly = 0;
  switch (situation) {
    case "seul":
      plafondMonthly = 350;
      break;
    case "couple":
      plafondMonthly = 420;
      break;
    case "parent":
      plafondMonthly = 380 + personnesCharge * 50;
      break;
  }

  montantEstime = Math.min(montantEstime, plafondMonthly);

  // Rounding
  montantEstime = Math.round(montantEstime * 100) / 100;

  return {
    eligible: true,
    montantEstime,
    explication: `En fonction de votre situation, vous pourriez percevoir environ ${montantEstime.toFixed(2)}€ par mois. Ce montant dépend notamment de la zone géographique du logement, du loyer retenu par la CAF et de votre situation personnelle. Consultez la CAF pour confirmer.`,
    details: {
      ressourcesMaxi: ressourcesMaxiBase,
      pourcentageLoyer,
    },
  };
}
