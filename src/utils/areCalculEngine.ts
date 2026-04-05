import { socialBaremes } from "../data/social-baremes";

export interface AREData {
  situation: "seul" | "couple" | "parent";
  ancienneteEmploi: number;
  salaireReferent: number;
  personnesCharge: number;
  agePersonne: number;
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

function getDurationCapDays(agePersonne: number): number {
  if (agePersonne >= 57) return areBaremes.dureeMaximaleJours.aPartirDe57Ans;
  if (agePersonne >= 55) return areBaremes.dureeMaximaleJours.de55a56Ans;
  return areBaremes.dureeMaximaleJours.moinsDe55Ans;
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

  const salaireMensuel = Math.max(0, data.salaireReferent || 0);
  const sjr = (salaireMensuel * 12) / 365;
  const option1 =
    sjr * areBaremes.calculJournalier.tauxOption1 + areBaremes.calculJournalier.partFixe;
  const option2 = sjr * areBaremes.calculJournalier.tauxOption2;
  let allocationJournaliere = Math.max(option1, option2);
  allocationJournaliere = Math.max(
    allocationJournaliere,
    areBaremes.calculJournalier.minimumJournalier,
  );
  allocationJournaliere = Math.min(
    allocationJournaliere,
    sjr * areBaremes.calculJournalier.plafondPourcentageSjr,
  );

  const montantMensuelBrut = Math.round(
    allocationJournaliere * areBaremes.calculJournalier.coefficientMensuel * 100,
  ) / 100;

  const durationCapDays = getDurationCapDays(data.agePersonne);
  const durationTheoriqueDays = Math.round(Math.max(0, data.ancienneteEmploi) * 30.42);
  const durationRetenueDays = Math.min(durationTheoriqueDays, durationCapDays);
  const durationMax = Math.max(1, Math.round(durationRetenueDays / 30.42));

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

