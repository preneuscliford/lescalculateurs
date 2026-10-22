/**
 * Date de fin de droits chômage (ARE) : premier jour indemnisé, durée, date de fin, délai
 * d'attente et différés, dégressivité.
 *
 * Règles (src/data/social-baremes.ts, are.*, sources Unédic et France Travail) :
 * - différé spécifique = indemnités supra-légales ÷ 111,8 (150 jours au plus, 75 en cas de
 *   licenciement économique) ; différé congés payés = indemnités compensatrices ÷ SJR (30 jours au
 *   plus). Les différés courent à partir de la fin du contrat ;
 * - délai d'attente de 7 jours, après les différés, au plus tôt à la date d'inscription
 *   (exemples Unédic : fin le 1er novembre, inscription le 10, différé de 12 jours → indemnisé à
 *   partir du 20 novembre ; inscription le 1er décembre → le 8 décembre) ;
 * - durée : calculerDureeIndemnisation (areCalculEngine) ;
 * - dégressivité de 30 % à partir du 7e mois d'indemnisation pour les moins de 55 ans dont
 *   l'allocation dépasse 92,57 € par jour, sans descendre sous 92,57 € ;
 * - inscription dans les 12 mois suivant la fin du contrat.
 *
 * Hypothèses : indemnisation continue (sans reprise d'emploi, arrêt maladie ou formation, qui
 * décalent la date de fin) ; métropole seulement (outre-mer : règles de durée non vérifiées).
 */

import { socialBaremes } from "../data/social-baremes";
import { calculerAllocationJournaliere, calculerDureeIndemnisation } from "./areCalculEngine";

const ARE = socialBaremes.are;

export type TypeRupture =
  | "licenciement"
  | "licenciement-economique"
  | "fin-cdd"
  | "rupture-conventionnelle"
  | "demission-legitime"
  | "demission";

export interface FinDroitsData {
  /** Date de fin du contrat (AAAA-MM-JJ) */
  dateFinContrat: string;
  /** Date d'inscription à France Travail (AAAA-MM-JJ) */
  dateInscription: string;
  /** Âge à la date de fin du contrat */
  agePersonne: number;
  /** Début du premier contrat dans les 24 derniers mois (36 à partir de 55 ans) */
  dateDebutPremierContrat: string;
  /** Jours sans contrat entre ce premier contrat et la fin du dernier */
  joursSansContrat?: number;
  typeRupture: TypeRupture;
  /** Salaire mensuel brut moyen des 24 derniers mois */
  salaireMensuelBrut: number;
  /** Indemnité compensatrice de congés payés perçue à la fin du contrat (brut) */
  indemniteCongesPayes?: number;
  /** Part des indemnités de rupture qui dépasse le minimum légal */
  indemnitesSupraLegales?: number;
  /** Délai d'attente déjà appliqué lors d'une ouverture de droits dans les 12 derniers mois */
  delaiAttenteDejaApplique?: boolean;
  /** Résidence en outre-mer à l'ouverture des droits */
  outreMer?: boolean;
}

export interface FinDroitsResult {
  eligible: boolean;
  message: string;
  differeSpecifiqueJours: number;
  differeCongesPayesJours: number;
  delaiAttenteJours: number;
  /** Premier jour indemnisé (AAAA-MM-JJ) */
  premierJourIndemnise: string | null;
  dureeJours: number | null;
  /** Dernier jour indemnisé si l'indemnisation est continue (AAAA-MM-JJ) */
  dateFinDroits: string | null;
  dateLimiteInscription: string;
  inscriptionHorsDelai: boolean;
  allocationJournaliere: number;
  sjr: number;
  degressivite: {
    applicable: boolean;
    /** Début approximatif du 7e mois d'indemnisation (AAAA-MM-JJ) */
    dateDebut: string | null;
    allocationApres: number | null;
    raison: string;
  };
  duree: {
    joursCalendaires: number;
    coefficientApplique: boolean;
    plancherApplique: boolean;
    plafondApplique: boolean;
    plafondJours: number;
  } | null;
  /** Points non calculés faute de règle vérifiée */
  aVerifier: string[];
}

const JOUR_MS = 86400000;

function versDate(iso: string): Date {
  const [a, m, j] = String(iso).split("-").map(Number);
  return new Date(Date.UTC(a, (m || 1) - 1, j || 1));
}
export function versIso(d: Date): string {
  return d.toISOString().slice(0, 10);
}
const ajouterJours = (d: Date, n: number) => new Date(d.getTime() + n * JOUR_MS);
const ecartJours = (a: Date, b: Date) => Math.round((b.getTime() - a.getTime()) / JOUR_MS);
function ajouterMois(d: Date, n: number): Date {
  const r = new Date(d.getTime());
  r.setUTCMonth(r.getUTCMonth() + n);
  return r;
}
const dateValide = (iso: string) => /^\d{4}-\d{2}-\d{2}$/.test(String(iso)) && !isNaN(versDate(iso).getTime());

export function calculerFinDroits(data: FinDroitsData): FinDroitsResult {
  const fin = versDate(data.dateFinContrat);
  const inscription = versDate(data.dateInscription);
  const age = Math.max(0, Math.floor(Number(data.agePersonne) || 0));
  const D = ARE.delais;
  const { sjr, allocationJournaliere } = calculerAllocationJournaliere(data.salaireMensuelBrut);
  const dateLimiteInscription = ajouterMois(fin, ARE.forclusion.mois);
  const aVerifier: string[] = [];

  const vide = (message: string): FinDroitsResult => ({
    eligible: false,
    message,
    differeSpecifiqueJours: 0,
    differeCongesPayesJours: 0,
    delaiAttenteJours: 0,
    premierJourIndemnise: null,
    dureeJours: null,
    dateFinDroits: null,
    dateLimiteInscription: versIso(dateLimiteInscription),
    inscriptionHorsDelai: false,
    allocationJournaliere: Math.round(allocationJournaliere * 100) / 100,
    sjr: Math.round(sjr * 100) / 100,
    degressivite: { applicable: false, dateDebut: null, allocationApres: null, raison: "" },
    duree: null,
    aVerifier,
  });

  if (![data.dateFinContrat, data.dateInscription, data.dateDebutPremierContrat].every(dateValide)) {
    return vide("Dates invalides : utilisez le format jour/mois/année.");
  }
  if (data.typeRupture === "demission") {
    return vide(
      "Une démission ne donne pas droit à l'ARE, sauf démission considérée comme légitime ou démission pour un projet professionnel validé.",
    );
  }

  // Période de référence : 24 mois avant la fin du contrat (36 mois à partir de 55 ans)
  const moisReference = age >= 55 ? ARE.reglesEligibilite.fenetreReference55AnsEtPlusMois : ARE.reglesEligibilite.fenetreReferenceMoins55AnsMois;
  const debutReference = ajouterJours(ajouterMois(fin, -moisReference), 1);
  const debut = versDate(data.dateDebutPremierContrat);
  const premierJourEmploi = debut > debutReference ? debut : debutReference;
  const joursCalendaires = Math.max(0, ecartJours(premierJourEmploi, fin) + 1);
  const joursSansContrat = Math.min(joursCalendaires, Math.max(0, Math.floor(Number(data.joursSansContrat) || 0)));
  const joursSousContrat = joursCalendaires - joursSansContrat;

  // Condition d'affiliation : 6 mois (130 jours ou 910 heures travaillés), approchés ici par
  // 182 jours sous contrat
  if (joursSousContrat < ARE.dureeIndemnisation.dureeMinimaleJours) {
    return vide(
      `Il faut avoir travaillé au moins ${ARE.reglesEligibilite.dureeAffiliationMois} mois sur les ${moisReference} derniers mois pour ouvrir des droits (environ ${joursSousContrat} jours sous contrat saisis).`,
    );
  }

  // Différés (courent à partir de la fin du contrat)
  const economique = data.typeRupture === "licenciement-economique";
  const differeSpecifiqueJours = Math.min(
    economique ? D.differeSpecifique.maxJoursLicenciementEconomique : D.differeSpecifique.maxJours,
    Math.floor(Math.max(0, Number(data.indemnitesSupraLegales) || 0) / D.differeSpecifique.diviseur),
  );
  const differeCongesPayesJours =
    sjr > 0 ? Math.min(D.differeCongesPayesMaxJours, Math.floor(Math.max(0, Number(data.indemniteCongesPayes) || 0) / sjr)) : 0;

  // Délai d'attente : après les différés, au plus tôt à l'inscription
  const finDifferes = ajouterJours(fin, differeSpecifiqueJours + differeCongesPayesJours);
  const departAttente = inscription > finDifferes ? inscription : finDifferes;
  const delaiAttenteJours = data.delaiAttenteDejaApplique ? 0 : D.delaiAttenteJours;
  const premierJour = ajouterJours(departAttente, delaiAttenteJours);
  const inscriptionHorsDelai = inscription > dateLimiteInscription;

  if (data.outreMer) {
    aVerifier.push(
      "Outre-mer : le coefficient de 0,75 ne s'applique pas et les durées maximales propres à l'outre-mer (notamment après une rupture conventionnelle) n'ont pas été vérifiées : durée et date de fin non calculées.",
    );
  }

  const duree = data.outreMer
    ? null
    : calculerDureeIndemnisation({
        joursCalendaires,
        joursNonTravailles: joursSansContrat,
        agePersonne: age,
        ruptureConventionnelle: data.typeRupture === "rupture-conventionnelle",
        dateFinContrat: fin,
      });
  const dateFinDroits = duree ? ajouterJours(premierJour, duree.jours - 1) : null;

  // Dégressivité
  const G = ARE.degressivite;
  const ageExemption = fin < versDate(G.dateReformeAge) ? G.ageExemptionAvantReforme : G.ageExemption;
  let degressivite: FinDroitsResult["degressivite"];
  if (age >= ageExemption) {
    degressivite = { applicable: false, dateDebut: null, allocationApres: null, raison: `pas de dégressivité à partir de ${ageExemption} ans à la fin du contrat` };
  } else if (allocationJournaliere <= G.seuilAllocationJournaliere) {
    degressivite = { applicable: false, dateDebut: null, allocationApres: null, raison: `allocation journalière inférieure ou égale à ${G.seuilAllocationJournaliere.toLocaleString("fr-FR")} €` };
  } else if (duree && duree.jours <= 182) {
    degressivite = { applicable: false, dateDebut: null, allocationApres: null, raison: "droits épuisés avant le 7e mois d'indemnisation" };
  } else {
    degressivite = {
      applicable: true,
      // Début du 7e mois : 6 mois d'indemnisation continue après le premier jour indemnisé
      dateDebut: versIso(ajouterMois(premierJour, G.moisDebut - 1)),
      allocationApres:
        Math.round(Math.max(G.plancherAllocationJournaliere, allocationJournaliere * (1 - G.coefficientReduction)) * 100) / 100,
      raison: `allocation supérieure à ${G.seuilAllocationJournaliere.toLocaleString("fr-FR")} € par jour et moins de ${ageExemption} ans`,
    };
  }

  return {
    eligible: true,
    message: inscriptionHorsDelai
      ? `Inscription au-delà du délai de 12 mois après la fin du contrat (${versIso(dateLimiteInscription)}) : les droits liés à ce contrat sont en principe perdus, sauf allongement (arrêt maladie, congé maternité…).`
      : "Estimation pour une indemnisation continue, sans reprise d'emploi, arrêt maladie ou formation.",
    differeSpecifiqueJours,
    differeCongesPayesJours,
    delaiAttenteJours,
    premierJourIndemnise: versIso(premierJour),
    dureeJours: duree ? duree.jours : null,
    dateFinDroits: dateFinDroits ? versIso(dateFinDroits) : null,
    dateLimiteInscription: versIso(dateLimiteInscription),
    inscriptionHorsDelai,
    allocationJournaliere: Math.round(allocationJournaliere * 100) / 100,
    sjr: Math.round(sjr * 100) / 100,
    degressivite,
    duree: duree
      ? {
          joursCalendaires,
          coefficientApplique: duree.coefficientApplique,
          plancherApplique: duree.plancherApplique,
          plafondApplique: duree.plafondApplique,
          plafondJours: duree.plafondJours,
        }
      : null,
    aVerifier,
  };
}

/** Date au format « 20 novembre 2026 » */
export function formaterDateLongue(iso: string | null): string {
  if (!iso) return "";
  return versDate(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}
