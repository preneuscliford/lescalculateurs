/**
 * Total des aides d'un foyer : RSA, prime d'activité, aide au logement, allocation de soutien
 * familial (ASF) et allocations familiales, avec leurs interactions.
 *
 * Règles de combinaison (sources dans src/data/social-baremes.ts) :
 * - l'aide au logement est calculée sur les revenus d'activité ; ni le RSA ni les prestations
 *   familiales n'entrent dans ses ressources ;
 * - quand le foyer touche une aide au logement, le RSA et la prime d'activité sont diminués du
 *   forfait logement (CASF R262-10, CSS R844-3) ;
 * - les allocations familiales (hors majoration pour âge) et une part de l'ASF (22,5 % de la BMAF
 *   par enfant) comptent dans les ressources du RSA et de la prime d'activité (DREES, Minima
 *   sociaux 2025, fiche 9) ;
 * - le RSA n'entre pas dans les ressources de la prime d'activité : les deux se cumulent.
 *
 * Non compris : complément familial, majoration pour âge des allocations familiales, allocation
 * de rentrée scolaire, pension alimentaire (l'ASF suppose qu'aucune pension n'est versée).
 */
import { calculerAPL } from "./aplCalculEngine";
import { calculerASF } from "./asfCalculEngine";
import { calculerPrimeActivite, getAllocationsFamiliales } from "./primeActiviteCalculEngine";
import { calculerRSA } from "./rsaCalculEngine";
import { socialBaremes } from "../data/social-baremes";

export interface AidesFoyerData {
  /** Parent isolé (ASF, majoration possible) ou couple */
  situation: "parent-isole" | "couple";
  enfants: number;
  /** Salaire net mensuel du foyer */
  salaire: number;
  zone: "zone1" | "zone2" | "zone3";
  loyer: number;
  /** RSA et prime d'activité majorés pour isolement (parent isolé) */
  majorationIsolement?: boolean;
}

export interface AidesFoyerResult {
  rsa: number;
  prime: number;
  apl: number;
  asf: number;
  allocationsFamiliales: number;
  /** Total des aides */
  aides: number;
  /** Salaire + aides */
  total: number;
}

const arrondi = (n: number) => Math.round(n * 100) / 100;

export function calculerAidesFoyer(d: AidesFoyerData): AidesFoyerResult {
  const enfants = Math.max(0, Math.floor(d.enfants || 0));
  const salaire = Math.max(0, d.salaire || 0);
  const isole = d.situation === "parent-isole";

  const apl =
    calculerAPL({
      situation: enfants > 0 ? "monoparental" : isole ? "seul" : "couple",
      enfants,
      revenus_mensuels: salaire,
      loyer_mensuel: d.loyer,
      region: d.zone,
      type_logement: "location",
    }).data?.apl_estimee ?? 0;

  const allocationsFamiliales = getAllocationsFamiliales(enfants);
  const asf = isole && enfants > 0 ? calculerASF({ situation: "parentisole", nombreEnfants: enfants, revenus: salaire, enfantACharge: true }).montantEstime : 0;
  const asfComptee = isole ? Math.min(asf, arrondi(socialBaremes.asf.partRessourcesRsaPrime * socialBaremes.bmaf.montant * enfants)) : 0;
  const logement = apl > 0 ? "aide-logement" : "loue";

  const rsa = calculerRSA({
    situation: isole ? "seul" : "couple",
    enfants,
    revenus: salaire,
    logement,
    activite: salaire > 0 ? "actif" : "inactif",
    majorationIsolement: isole && d.majorationIsolement === true,
    prestationsFamiliales: arrondi(allocationsFamiliales + asfComptee),
  }).montantEstime;

  const prime =
    salaire > 0
      ? calculerPrimeActivite({
          situation: isole ? (enfants > 0 ? "monoparental" : "seul") : "couple",
          enfants,
          revenusProf: salaire,
          autresRevenus: asfComptee,
          logement,
          typeActivite: "salarie",
          majorationIsolement: isole && d.majorationIsolement === true,
        }).montantEstime
      : 0;

  const aides = arrondi(rsa + prime + apl + asf + allocationsFamiliales);
  return { rsa, prime, apl, asf, allocationsFamiliales, aides, total: arrondi(salaire + aides) };
}
