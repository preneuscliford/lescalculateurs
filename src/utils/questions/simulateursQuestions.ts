/**
 * Simulateurs utilisables par le moteur de questions : champs attendus, validation des paramètres,
 * et calcul par les moteurs existants du site. Aucun montant ne vient de l'analyse de la question.
 *
 * Ce fichier sert de schéma unique :
 * - à l'analyseur de questions (src/utils/questions/analyseurQuestion.ts) ;
 * - aux pages de résultat /r/<simulateur> (paramètres lus dans l'URL) ;
 * - plus tard, à la validation de la réponse du service d'analyse côté serveur.
 *
 * Définitions : src/utils/questions/definitions/{aides,revenus,logement}.ts
 */
import { AAH, APL, APL_ETUDIANT, ASF, PRIME_ACTIVITE, RSA } from "./definitions/aides";
import { ARE, FIN_DROITS, IMPOT, LICENCIEMENT, RETRAITE, SALAIRE } from "./definitions/revenus";
import { DEPOT, DPE, NOTAIRE, PTZ } from "./definitions/logement";
import type { DefinitionSimulateur, ParametresQuestion, SimulateurId } from "./commun";

export * from "./commun";

/** Ordre d'affichage (exemples de la barre de question) */
export const SIMULATEURS: Record<SimulateurId, DefinitionSimulateur> = {
  apl: APL,
  rsa: RSA,
  "prime-activite": PRIME_ACTIVITE,
  salaire: SALAIRE,
  notaire: NOTAIRE,
  impot: IMPOT,
  are: ARE,
  "fin-droits": FIN_DROITS,
  "indemnite-licenciement": LICENCIEMENT,
  retraite: RETRAITE,
  "apl-etudiant": APL_ETUDIANT,
  aah: AAH,
  asf: ASF,
  ptz: PTZ,
  "dpe-location": DPE,
  "depot-garantie": DEPOT,
};

export const SIMULATEURS_IDS = Object.keys(SIMULATEURS) as SimulateurId[];

/** Paramètres de contexte acceptés en plus des champs (affichage seulement) */
const CONTEXTE = ["ville"];

const dateValide = (v: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
  const [a, m, j] = v.split("-").map(Number);
  const d = new Date(Date.UTC(a, m - 1, j));
  return d.getUTCFullYear() === a && d.getUTCMonth() === m - 1 && d.getUTCDate() === j && a >= 1940 && a <= 2100;
};

export interface ValidationParametres {
  /** Paramètres complets et typés (champs manquants remplacés par leur valeur par défaut) */
  params: ParametresQuestion;
  /** Clés des champs obligatoires absents ou invalides */
  manquants: string[];
  /** Champs remplis par leur valeur par défaut */
  hypotheses: string[];
}

/**
 * Valide des paramètres bruts (URL, réponse d'analyse) contre la définition du simulateur.
 * Toute clé inconnue est ignorée ; toute valeur hors bornes ou hors liste est considérée comme manquante.
 */
export function validerParametres(id: SimulateurId, brut: Record<string, unknown>): ValidationParametres {
  const def = SIMULATEURS[id];
  const params: ParametresQuestion = {};
  const manquants: string[] = [];
  const hypotheses: string[] = [];
  for (const champ of def.champs) {
    const v = brut[champ.cle];
    let valeur: string | number | undefined;
    if (v !== undefined && v !== null && String(v).trim() !== "") {
      if (champ.type === "nombre") {
        const n = Number(String(v).replace(",", "."));
        if (isFinite(n) && n >= (champ.min ?? -Infinity) && n <= (champ.max ?? Infinity)) {
          valeur = champ.cle === "enfants" || champ.cle === "personnes" ? Math.floor(n) : Math.round(n * 100) / 100;
        }
      } else if (champ.type === "date") {
        if (dateValide(String(v))) valeur = String(v);
      } else if (champ.options?.some((o) => o.valeur === String(v))) {
        valeur = String(v);
      }
    }
    if (valeur === undefined && champ.defaut !== undefined) {
      valeur = champ.defaut;
      hypotheses.push(champ.cle);
    }
    if (valeur !== undefined) params[champ.cle] = valeur;
    else if (!champ.optionnel) manquants.push(champ.cle);
  }
  // Une personne seule avec enfants est un parent isolé
  if (params.situation === "seul" && Number(params.enfants) > 0 && def.champs.some((c) => c.cle === "situation" && c.options?.some((o) => o.valeur === "monoparental"))) {
    params.situation = "monoparental";
  }
  for (const cle of CONTEXTE) {
    const v = brut[cle];
    if (typeof v === "string" && /^[\p{L} '-]{2,60}$/u.test(v)) params[cle] = v;
  }
  return { params, manquants, hypotheses };
}

/** Chemin de la page de résultat : /r/apl?loyer=700&… (paramètres dans l'ordre des champs) */
export function cheminResultat(id: SimulateurId, params: ParametresQuestion): string {
  const def = SIMULATEURS[id];
  const q = new URLSearchParams();
  for (const cle of [...def.champs.map((c) => c.cle), ...CONTEXTE]) {
    const v = params[cle];
    if (v !== undefined && v !== "") q.set(cle, String(v));
  }
  const s = q.toString();
  return `/r/${id}${s ? `?${s}` : ""}`;
}

/** Résumé de la situation : « couple, 2 enfants, loyer de 700 €, 1 500 € de revenus, Lyon (zone 2) » */
export function resumeSituation(id: SimulateurId, p: ParametresQuestion, manquants: string[] = []): string {
  const def = SIMULATEURS[id];
  const ordre = def.ordreResume ?? [];
  const cles = def.champs
    .map((c) => c.cle)
    .sort((a, b) => {
      const ia = ordre.indexOf(a), ib = ordre.indexOf(b);
      return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
    });
  return cles
    .filter((cle) => !manquants.includes(cle) && p[cle] !== undefined)
    .map((cle) => def.resume[cle]?.(p[cle], p) ?? "")
    .filter(Boolean)
    .join(", ");
}
