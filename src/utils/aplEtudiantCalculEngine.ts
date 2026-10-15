/**
 * APL Étudiant 2026 - moteur de calcul
 *
 * 1. Éligibilité : depuis le 1er juillet 2026, un étudiant de nationalité
 *    extra-européenne (hors UE, EEE et Suisse) doit être boursier sur critères
 *    sociaux, sauf activité professionnelle, apprentissage / contrat de
 *    professionnalisation, statut de réfugié ou d'apatride, ou conjoint
 *    (caf.fr, actualité du 3 juillet 2026).
 * 2. Ressources : la CAF retient au moins un montant forfaitaire annuel pour les
 *    étudiants (8 600 EUR non boursier / 6 900 EUR boursier en logement classique,
 *    6 600 / 5 400 EUR en logement-foyer) : article 6 de l'arrêté du 27/09/2019,
 *    version du 30/12/2024 en vigueur (relue sur Légifrance le 15/10/2026). Les
 *    bourses d'études ne sont pas comptées dans les ressources.
 * 3. Montant : moteur APL général (formule officielle, barème au 01/10/2026) ; le
 *    forfait est passé comme ressources annuelles minimales (sans abattement).
 */

import { calculerAPL, type SituationFamiliale, type Zone } from "./aplCalculEngine";

export type ZoneAPL = "1" | "2" | "3";
export type LogementEtudiant = "classique" | "foyer";
export type ExceptionEtudiantEtranger = "aucune" | "activite" | "apprenti" | "refugie" | "conjoint";

export interface APLEtudiantData {
  situation: "seul" | "couple" | "parent";
  /** Conservé pour compatibilité avec l'API, non utilisé dans le calcul */
  age?: number;
  /** Revenus mensuels du foyer hors bourse d'études */
  revenus: number;
  /** Loyer mensuel (hors charges) */
  chargesLocatives: number;
  personnesCharge: number;
  zone?: ZoneAPL;
  logement?: LogementEtudiant;
  boursier?: boolean;
  /** Nationalité hors UE, EEE et Suisse */
  horsUE?: boolean;
  exception?: ExceptionEtudiantEtranger;
}

export interface APLEtudiantResult {
  eligible: boolean;
  montantEstime: number;
  explication: string;
  details: {
    /** Montant forfaitaire mensuel de ressources retenu au minimum */
    ressourcesMaxi: number;
    ressourcesRetenues: number;
    loyerRetenu: number;
    plafondLoyer: number;
    /** Part du loyer couverte par l'aide estimée */
    pourcentageLoyer: number;
  };
}

/** Montants forfaitaires annuels de ressources des étudiants (gelés en 2026) */
export const FORFAIT_RESSOURCES_ETUDIANT = {
  classique: { boursier: 6900, nonBoursier: 8600 },
  foyer: { boursier: 5400, nonBoursier: 6600 },
} as const;

const ZONE_MOTEUR: Record<ZoneAPL, Zone> = { "1": "idf", "2": "province", "3": "dom" };
const SITUATION_MOTEUR: Record<APLEtudiantData["situation"], SituationFamiliale> = {
  seul: "seul",
  couple: "couple",
  parent: "monoparental",
};

const round2 = (v: number) => Math.round(v * 100) / 100;

export function calculerAPLEtudiant(data: APLEtudiantData): APLEtudiantResult {
  const boursier = data.boursier === true;
  const logement: LogementEtudiant = data.logement === "foyer" ? "foyer" : "classique";
  const zone: ZoneAPL = data.zone ?? "2";
  const forfaitAnnuel = boursier
    ? FORFAIT_RESSOURCES_ETUDIANT[logement].boursier
    : FORFAIT_RESSOURCES_ETUDIANT[logement].nonBoursier;
  const forfaitMensuel = round2(forfaitAnnuel / 12);

  const detailsVides = {
    ressourcesMaxi: forfaitMensuel,
    ressourcesRetenues: 0,
    loyerRetenu: 0,
    plafondLoyer: 0,
    pourcentageLoyer: 0,
  };

  // 1. Réforme du 1er juillet 2026 : étudiants extra-européens
  if (data.horsUE === true && !boursier && (data.exception ?? "aucune") === "aucune") {
    return {
      eligible: false,
      montantEstime: 0,
      explication:
        "Depuis le 1er juillet 2026, un étudiant de nationalité extra-européenne doit être boursier sur critères sociaux pour toucher l'APL, sauf s'il exerce une activité professionnelle, est apprenti ou en contrat de professionnalisation, réfugié ou apatride, ou conjoint d'un bénéficiaire.",
      details: detailsVides,
    };
  }

  // 2. Ressources retenues : au moins le montant forfaitaire étudiant
  const revenus = Math.max(0, Number(data.revenus) || 0);
  // 3. Calcul avec le moteur APL général
  const result = calculerAPL({
    situation: SITUATION_MOTEUR[data.situation] ?? "seul",
    enfants: Math.max(0, Math.floor(Number(data.personnesCharge) || 0)),
    revenus_mensuels: revenus,
    loyer_mensuel: Math.max(0, Number(data.chargesLocatives) || 0),
    region: ZONE_MOTEUR[zone],
    ressources_annuelles_minimum: forfaitAnnuel,
  });

  if (!result.success || !result.data) {
    return {
      eligible: false,
      montantEstime: 0,
      explication: result.error || "Données incomplètes.",
      details: detailsVides,
    };
  }

  const montantEstime = result.data.apl_estimee;
  const loyer = Math.max(0, Number(data.chargesLocatives) || 0);
  const details = {
    ressourcesMaxi: forfaitMensuel,
    ressourcesRetenues: round2(result.data.ressources_annuelles / 12),
    loyerRetenu: result.data.loyer_pris_compte,
    plafondLoyer: result.data.plafond_loyer,
    pourcentageLoyer: loyer > 0 ? round2(montantEstime / loyer) : 0,
  };

  const baseRessources =
    revenus < forfaitMensuel
      ? `la CAF retient au minimum ${forfaitAnnuel.toLocaleString("fr-FR")} € de ressources par an pour un étudiant ${boursier ? "boursier" : "non boursier"} (${forfaitMensuel.toLocaleString("fr-FR")} € par mois)`
      : `vos ressources de ${round2(revenus).toLocaleString("fr-FR")} € par mois sont retenues`;

  if (montantEstime <= 0) {
    return {
      eligible: false,
      montantEstime: 0,
      explication: `Avec ces informations, l'APL estimée est nulle : ${baseRessources}, et votre loyer est retenu dans la limite de ${details.plafondLoyer.toLocaleString("fr-FR")} € en zone ${zone}.`,
      details,
    };
  }

  return {
    eligible: true,
    montantEstime,
    explication: `Estimation : environ ${montantEstime.toLocaleString("fr-FR")} € par mois. Votre loyer est retenu dans la limite de ${details.plafondLoyer.toLocaleString("fr-FR")} € (zone ${zone}, barème au 1er octobre 2026) et ${baseRessources}. Estimation indicative : la CAF calcule le montant définitif.`,
    details,
  };
}
