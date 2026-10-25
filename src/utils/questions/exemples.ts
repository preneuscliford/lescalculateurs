/**
 * Exemple de question de chaque simulateur, dans l'ordre d'affichage sous la barre de question.
 * Fichier léger, sans moteur de calcul : la barre l'affiche sans charger l'analyseur.
 */
import type { SimulateurId } from "./commun";

export const EXEMPLES_QUESTIONS: Record<SimulateurId, string> = {
  "apl": "Combien d'APL pour 700 € de loyer avec 2 enfants à Lyon ?",
  "rsa": "RSA pour un couple avec 2 enfants sans revenu ni emploi, hébergés gratuitement",
  "prime-activite": "Prime d'activité au SMIC, seul, locataire avec APL",
  "salaire": "2 500 € brut en net",
  "notaire": "Frais de notaire pour un appartement ancien à 250 000 € à Bordeaux",
  "impot": "Impôt sur le revenu pour 60 000 € en couple avec 2 enfants",
  "are": "Allocation chômage pour 2 200 € brut, 38 ans, 3 ans de travail",
  "fin-droits": "Quand finissent mes droits au chômage ? Licencié le 31 octobre 2026, 2 600 € brut, 42 ans",
  "indemnite-licenciement": "Indemnité de licenciement pour 8 ans d'ancienneté et 2 400 € brut",
  "retraite": "À quel âge partir à la retraite, né en mars 1966 ?",
  "apl-etudiant": "APL étudiant boursier, studio à 450 € à Rennes",
  "aah": "AAH taux 80 %, seul, locataire, 400 € de revenus",
  "asf": "ASF pour 2 enfants, pension alimentaire non versée",
  "ptz": "Suis-je éligible au PTZ en zone B1 à 3 personnes avec 45 000 € de revenu fiscal ?",
  "dpe-location": "Logement classé F, bail vide depuis septembre 2025 : jusqu'à quand le louer ?",
  "depot-garantie": "Caution de 750 € pas rendue, loyer de 750 €, clés rendues le 30 avril 2026, état des lieux conforme, nouvelle adresse donnée",
};
