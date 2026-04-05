import { socialBaremes } from "../data/social-baremes";

export interface PrimeActiviteCalculData {
  situation: string;
  enfants: number;
  revenusProf: number;
  autresRevenus: number;
  logement: string;
  typeActivite: string;
}

export interface PrimeActiviteResult {
  success: boolean;
  montantEstime: number;
  eligibilite: string;
  explication: string;
  details: {
    montantBase: number;
    bonification: number;
    majorations: number;
    forfaitLogement: number;
    revenusProfsComptabilises: number;
    autresRevenusComptabilises: number;
    totalRevenusComptabilises: number;
    montantFinal: number;
  };
}

const primeBaremes = socialBaremes.primeActivite;

function getPrimeForfait(situation: string, enfants: number): number {
  const nbEnfants = Math.max(0, Math.floor(enfants || 0));

  if (situation === "monoparental") {
    if (nbEnfants <= 0) return primeBaremes.montantForfaitaire.nonMajoree.unePersonne;
    if (nbEnfants === 1) return primeBaremes.montantForfaitaire.majoree.isole1Enfant;
    if (nbEnfants === 2) return primeBaremes.montantForfaitaire.majoree.isole2Enfants;
    if (nbEnfants === 3) return primeBaremes.montantForfaitaire.majoree.isole3Enfants;
    return (
      primeBaremes.montantForfaitaire.majoree.isole4Enfants +
      (nbEnfants - 4) * primeBaremes.montantForfaitaire.majoree.personneSupplementaire
    );
  }

  if (situation === "couple") {
    if (nbEnfants <= 0) return primeBaremes.montantForfaitaire.nonMajoree.coupleOuIsole1Enfant;
    if (nbEnfants === 1) return primeBaremes.montantForfaitaire.nonMajoree.couple1EnfantOuIsole2Enfants;
    if (nbEnfants === 2) return primeBaremes.montantForfaitaire.nonMajoree.couple2Enfants;
    if (nbEnfants === 3) return primeBaremes.montantForfaitaire.nonMajoree.couple3Enfants;
    return (
      primeBaremes.montantForfaitaire.nonMajoree.couple3Enfants +
      (nbEnfants - 3) * primeBaremes.montantForfaitaire.nonMajoree.personneSupplementaire
    );
  }

  if (nbEnfants <= 0) return primeBaremes.montantForfaitaire.nonMajoree.unePersonne;
  if (nbEnfants === 1) return primeBaremes.montantForfaitaire.nonMajoree.coupleOuIsole1Enfant;
  if (nbEnfants === 2) return primeBaremes.montantForfaitaire.nonMajoree.couple1EnfantOuIsole2Enfants;
  if (nbEnfants === 3) return primeBaremes.montantForfaitaire.nonMajoree.isole3Enfants;
  return (
    primeBaremes.montantForfaitaire.nonMajoree.isole3Enfants +
    (nbEnfants - 3) * primeBaremes.montantForfaitaire.nonMajoree.personneSupplementaire
  );
}

function getHousingForfait(logement: string, situation: string, enfants: number): number {
  if (logement === "loue") return 0;

  const foyerSize = (situation === "couple" ? 2 : 1) + Math.max(0, Math.floor(enfants || 0));
  if (foyerSize <= 1) return primeBaremes.forfaitLogement.unePersonne;
  if (foyerSize === 2) return primeBaremes.forfaitLogement.deuxPersonnes;
  return primeBaremes.forfaitLogement.troisPersonnesOuPlus;
}

function getBonification(revenusProf: number): number {
  const revenus = Math.max(0, revenusProf || 0);
  const { seuilDebut, seuilMaximum, montantMaximum } = primeBaremes.bonification;

  if (revenus < seuilDebut) return 0;
  if (revenus >= seuilMaximum) return montantMaximum;

  const ratio = (revenus - seuilDebut) / (seuilMaximum - seuilDebut);
  return Math.round(montantMaximum * ratio * 100) / 100;
}

export function calculerPrimeActivite(
  data: PrimeActiviteCalculData,
): PrimeActiviteResult {
  if (!data.situation || !data.logement || !data.typeActivite) {
    return {
      success: false,
      montantEstime: 0,
      eligibilite: "Donnees incompletes",
      explication: "Veuillez remplir tous les champs obligatoires.",
      details: {
        montantBase: 0,
        bonification: 0,
        majorations: 0,
        forfaitLogement: 0,
        revenusProfsComptabilises: 0,
        autresRevenusComptabilises: 0,
        totalRevenusComptabilises: 0,
        montantFinal: 0,
      },
    };
  }

  if (data.revenusProf <= 0) {
    return {
      success: true,
      montantEstime: 0,
      eligibilite: "Non eligible",
      explication:
        "La Prime d'activite concerne les personnes qui exercent une activite professionnelle et declarent un revenu d'activite.",
      details: {
        montantBase: 0,
        bonification: 0,
        majorations: 0,
        forfaitLogement: 0,
        revenusProfsComptabilises: 0,
        autresRevenusComptabilises: Math.round(data.autresRevenus * 100) / 100,
        totalRevenusComptabilises: Math.round(data.autresRevenus * 100) / 100,
        montantFinal: 0,
      },
    };
  }

  const montantBase = getPrimeForfait(data.situation, data.enfants);
  const bonification = getBonification(data.revenusProf);
  const forfaitLogement = getHousingForfait(data.logement, data.situation, data.enfants);
  const revenusProfsComptabilises =
    data.revenusProf * primeBaremes.revenusProfessionnelsPrisEnCompte;
  const autresRevenusComptabilises = Math.max(0, data.autresRevenus || 0);
  const totalRevenusComptabilises =
    Math.max(0, data.revenusProf || 0) + autresRevenusComptabilises + forfaitLogement;

  let montantFinal =
    montantBase + bonification + revenusProfsComptabilises - totalRevenusComptabilises;
  montantFinal = Math.max(0, Math.round(montantFinal * 100) / 100);

  let eligibilite = "Probablement eligible";
  let explication =
    "Cette estimation repose sur le forfait foyer 2026, la bonification individuelle et les revenus declares. La CAF confirmera le montant final a partir de votre declaration trimestrielle.";

  if (montantFinal === 0) {
    eligibilite = "Non eligible";
    explication =
      "Avec les revenus renseignes, le droit estime a la Prime d'activite est nul ou trop faible. Le resultat peut evoluer en cas de changement de revenus, de foyer ou de logement.";
  } else if (montantFinal < primeBaremes.montantMinimumVerse) {
    eligibilite = "Montant trop faible pour versement";
    explication = `Le droit theorique existe, mais la Prime d'activite n'est versee qu'a partir de ${primeBaremes.montantMinimumVerse} EUR par mois.`;
    montantFinal = 0;
  }

  return {
    success: true,
    montantEstime: montantFinal,
    eligibilite,
    explication,
    details: {
      montantBase: Math.round(montantBase * 100) / 100,
      bonification,
      majorations: Math.max(0, Math.round((montantBase - primeBaremes.montantForfaitaire.nonMajoree.unePersonne) * 100) / 100),
      forfaitLogement: Math.round(forfaitLogement * 100) / 100,
      revenusProfsComptabilises: Math.round(revenusProfsComptabilises * 100) / 100,
      autresRevenusComptabilises: Math.round(autresRevenusComptabilises * 100) / 100,
      totalRevenusComptabilises: Math.round(totalRevenusComptabilises * 100) / 100,
      montantFinal,
    },
  };
}

export function formatPrimeActiviteResult(result: PrimeActiviteResult): {
  montantDisplay: string;
  explDisplay: string;
} {
  return {
    montantDisplay:
      result.montantEstime > 0
        ? `${Math.round(result.montantEstime)} EUR / mois`
        : "Non eligible",
    explDisplay: result.explication,
  };
}

