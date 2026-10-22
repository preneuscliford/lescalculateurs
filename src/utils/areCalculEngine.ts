import { socialBaremes } from "../data/social-baremes";

export interface AREData {
  situation: "seul" | "couple" | "parent";
  ancienneteEmploi: number;
  salaireReferent: number;
  personnesCharge: number;
  agePersonne: number;
  /** Fin de contrat par rupture conventionnelle (durées réduites depuis le 01/09/2026) */
  ruptureConventionnelle?: boolean;
  /** Date de fin du contrat : détermine le régime applicable à la rupture conventionnelle */
  dateFinContrat?: Date;
}

export interface AREResult {
  eligible: boolean;
  montantEstime: number;
  durationMax: number;
  explication: string;
  details: {
    tauxRemplacement: number;
    montantMinimum: number;
    montantMaximum: number;
  };
}

const areBaremes = socialBaremes.are;

function getReferenceWindow(agePersonne: number): number {
  return agePersonne >= 55
    ? areBaremes.reglesEligibilite.fenetreReference55AnsEtPlusMois
    : areBaremes.reglesEligibilite.fenetreReferenceMoins55AnsMois;
}

function isRuptureConventionnelleReduite(data: AREData): boolean {
  if (!data.ruptureConventionnelle) return false;
  const dateEffet = new Date(`${areBaremes.ruptureConventionnelle.dateEffet}T00:00:00Z`);
  return !data.dateFinContrat || data.dateFinContrat >= dateEffet;
}

function getDurationCapDays(data: { agePersonne: number; ruptureConventionnelle?: boolean; dateFinContrat?: Date }): number {
  const durees = isRuptureConventionnelleReduite(data as AREData)
    ? areBaremes.ruptureConventionnelle.dureeMaximaleJours
    : areBaremes.dureeMaximaleJours;
  if (data.agePersonne >= 57) return durees.aPartirDe57Ans;
  if (data.agePersonne >= 55) return durees.de55a56Ans;
  return durees.moinsDe55Ans;
}

export interface DureeIndemnisationData {
  /** Jours calendaires du 1er jour du 1er contrat de la période de référence à la fin du contrat */
  joursCalendaires: number;
  /** Jours sans contrat compris dans cette période (retenus dans la limite de 70 % des jours travaillés) */
  joursNonTravailles?: number;
  agePersonne: number;
  ruptureConventionnelle?: boolean;
  dateFinContrat?: Date;
}

export interface DureeIndemnisationResult {
  jours: number;
  joursAvantCoefficient: number;
  coefficientApplique: boolean;
  plancherApplique: boolean;
  plafondJours: number;
  plafondApplique: boolean;
}

/**
 * Durée d'indemnisation en jours (Unédic, fiche « Durée d'indemnisation ») : jours calendaires
 * de la période de référence, jours non travaillés limités à 70 % des jours travaillés,
 * coefficient 0,75 (fins de contrat depuis le 01/02/2023), minimum 182 jours, plafond selon
 * l'âge à la fin du contrat (et rupture conventionnelle depuis le 01/09/2026). Métropole
 * uniquement : le coefficient ne s'applique pas outre-mer.
 */
export function calculerDureeIndemnisation(data: DureeIndemnisationData): DureeIndemnisationResult {
  const D = areBaremes.dureeIndemnisation;
  const calendaires = Math.max(0, Math.floor(data.joursCalendaires || 0));
  const nonTravailles = Math.min(calendaires, Math.max(0, Math.floor(data.joursNonTravailles || 0)));
  const travailles = calendaires - nonTravailles;
  // (arrondi préalable au millième : 330 × 0,7 vaut 230,999… en virgule flottante)
  const maxNonTravailles = Math.floor(Math.round(travailles * D.ratioJoursNonTravaillesMax * 1000) / 1000);
  const joursAvantCoefficient = travailles + Math.min(nonTravailles, maxNonTravailles);
  const coefficientApplique =
    !data.dateFinContrat || data.dateFinContrat >= new Date(`${D.dateEffetCoefficient}T00:00:00Z`);
  const apresCoefficient = coefficientApplique ? Math.round(joursAvantCoefficient * D.coefficient) : joursAvantCoefficient;
  const plafondJours = getDurationCapDays(data);
  const plancherApplique = apresCoefficient < D.dureeMinimaleJours;
  const plafondApplique = apresCoefficient > plafondJours;
  const jours = Math.min(plafondJours, Math.max(D.dureeMinimaleJours, apresCoefficient));
  return { jours, joursAvantCoefficient, coefficientApplique, plancherApplique, plafondJours, plafondApplique };
}

/** Allocation journalière brute (formule France Travail), avant dégressivité */
export function calculerAllocationJournaliere(salaireMensuelBrut: number): { sjr: number; allocationJournaliere: number } {
  const salaireMensuel = Math.max(0, salaireMensuelBrut || 0);
  const sjr = (salaireMensuel * 12) / 365;
  const C = areBaremes.calculJournalier;
  const formule = Math.max(sjr * C.tauxOption1 + C.partFixe, sjr * C.tauxOption2);
  const allocationJournaliere = Math.min(Math.max(formule, C.minimumJournalier), sjr * C.plafondPourcentageSjr);
  return { sjr, allocationJournaliere };
}

export function calculerARE(data: AREData): AREResult {
  const minAnciennete = areBaremes.reglesEligibilite.dureeAffiliationMois;
  const referenceWindow = getReferenceWindow(data.agePersonne);

  if (data.ancienneteEmploi < minAnciennete) {
    return {
      eligible: false,
      montantEstime: 0,
      durationMax: 0,
      explication: `Pour ouvrir des droits a l'ARE, il faut avoir travaille au moins ${minAnciennete} mois sur les ${referenceWindow} derniers mois.`,
      details: {
        tauxRemplacement: 0,
        montantMinimum: 0,
        montantMaximum: 0,
      },
    };
  }

  const { sjr, allocationJournaliere } = calculerAllocationJournaliere(data.salaireReferent);

  const montantMensuelBrut =
    Math.round(allocationJournaliere * areBaremes.calculJournalier.coefficientMensuel * 100) / 100;

  // Durée : ancienneté (en mois) limitée à la période de référence (24 mois, 36 mois à partir de
  // 55 ans), convertie en jours calendaires, sans jour non travaillé
  const moisRetenus = Math.min(Math.max(0, data.ancienneteEmploi), referenceWindow);
  const duree = calculerDureeIndemnisation({
    joursCalendaires: Math.round(moisRetenus * 30.42),
    agePersonne: data.agePersonne,
    ruptureConventionnelle: data.ruptureConventionnelle,
    dateFinContrat: data.dateFinContrat,
  });
  // Arrondi au demi-mois (ex. 685 jours = 22,5 mois, 624 jours = 20,5 mois)
  const durationMax = Math.max(1, Math.round((duree.jours / 30.42) * 2) / 2);

  return {
    eligible: true,
    montantEstime: montantMensuelBrut,
    durationMax,
    explication: `Cette estimation applique la formule officielle France Travail sur votre salaire journalier de reference, avec une duree maximale d'environ ${durationMax} mois selon votre anciennete et votre age.`,
    details: {
      tauxRemplacement: Math.round((allocationJournaliere / Math.max(sjr, 1)) * 10000) / 10000,
      montantMinimum: Math.round(
        areBaremes.calculJournalier.minimumJournalier *
          areBaremes.calculJournalier.coefficientMensuel,
      ),
      montantMaximum: Math.round(
        sjr *
          areBaremes.calculJournalier.plafondPourcentageSjr *
          areBaremes.calculJournalier.coefficientMensuel,
      ),
    },
  };
}

export function formatAREResult(result: AREResult): {
  montantDisplay: string;
  explDisplay: string;
  detailsDisplay: string;
} {
  const formatMonnaie = (montant: number) => {
    return (
      montant.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) +
      " EUR"
    );
  };

  const montantDisplay =
    result.eligible && result.montantEstime > 0
      ? `${formatMonnaie(result.montantEstime)} / mois`
      : "Non eligible";

  const detailsDisplay = `
    • Taux de remplacement : ${(result.details.tauxRemplacement * 100).toFixed(1)}%
    • Durée maximum : ${result.durationMax} mois
    • = Montant mensuel estimé : ${formatMonnaie(result.montantEstime)}
  `
    .trim()
    .split("\n")
    .filter((l) => l.trim())
    .join("\n");

  return {
    montantDisplay,
    explDisplay: result.explication,
    detailsDisplay,
  };
}
