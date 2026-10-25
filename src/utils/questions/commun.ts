/**
 * Types et outils communs aux définitions de simulateurs du moteur de questions
 * (src/utils/questions/definitions/*.ts).
 */

export type SimulateurId =
  | "apl"
  | "apl-etudiant"
  | "rsa"
  | "prime-activite"
  | "aah"
  | "asf"
  | "salaire"
  | "impot"
  | "are"
  | "fin-droits"
  | "indemnite-licenciement"
  | "retraite"
  | "notaire"
  | "ptz"
  | "dpe-location"
  | "depot-garantie";

export interface OptionChamp {
  valeur: string;
  libelle: string;
}

export interface ChampQuestion {
  cle: string;
  libelle: string;
  /** "date" : valeur AAAA-MM-JJ */
  type: "nombre" | "choix" | "date";
  options?: OptionChamp[];
  /** Valeur retenue si l'information manque (affichée comme hypothèse) ; sinon, l'information est demandée */
  defaut?: string | number;
  /** Information facultative : ni demandée, ni supposée */
  optionnel?: boolean;
  min?: number;
  max?: number;
  suffixe?: string;
  aide?: string;
}

export type ParametresQuestion = Record<string, string | number>;

export interface LienProche {
  libelle: string;
  params: ParametresQuestion;
}

export interface ResultatQuestion {
  /** Valeur principale affichée en grand : « 309 € », « 64 ans et 6 mois », « 31 août 2028 » */
  principal: string;
  /** Montant numérique, quand le résultat principal en est un */
  montant?: number;
  /** « APL estimée », « Âge légal de départ »… */
  libelle: string;
  /** « par mois », « au total »… */
  unite?: string;
  /** Phrase qui introduit le résultat principal */
  phrase: string;
  details: { libelle: string; valeur: string }[];
  limites: string[];
}

export interface DefinitionSimulateur {
  id: SimulateurId;
  /** Nom court : « APL » */
  nom: string;
  /** Titre de la page de résultat */
  titre: string;
  /** Simulateur complet (canonique de la page de résultat) */
  chemin: string;
  champs: ChampQuestion[];
  /** `aujourdhui` (AAAA-MM-JJ) : date de référence des calculs datés */
  calculer(p: ParametresQuestion, aujourdhui: string): ResultatQuestion | { erreur: string };
  /** Variantes proches proposées en liens visibles */
  proches(p: ParametresQuestion): LienProche[];
  /** Pages indexées du site sur le même sujet */
  pagesLiees: { href: string; libelle: string }[];
  /** Exemple de question proposé sous la barre de question */
  exemple: string;
  /** Formulation courte de chaque information dans le titre de la page de résultat */
  resume: Record<string, (v: string | number, p: ParametresQuestion) => string>;
  /** Ordre des informations dans le titre (les autres suivent dans l'ordre des champs) */
  ordreResume?: string[];
}

export const euros = (n: number, decimales = 0) =>
  `${n.toLocaleString("fr-FR", { minimumFractionDigits: decimales, maximumFractionDigits: decimales })} €`;

/** Montant avec centimes seulement s'il en a */
export const eurosAuto = (n: number) => euros(n, Math.round(n * 100) % 100 ? 2 : 0);

export const libelleOption = (champ: ChampQuestion | undefined, valeur: unknown) =>
  champ?.options?.find((o) => o.valeur === String(valeur))?.libelle ?? String(valeur);

/** Date du jour (AAAA-MM-JJ) dans le fuseau du navigateur */
export function aujourdhuiIso(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** « 1er janvier 2028 » */
export function dateLongue(iso: string | null | undefined): string {
  if (!iso) return "";
  const [a, m, j] = iso.split("-").map(Number);
  return new Date(Date.UTC(a, m - 1, j))
    .toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })
    .replace(/^1 /, "1er ");
}

export const OUI_NON: OptionChamp[] = [
  { valeur: "oui", libelle: "Oui" },
  { valeur: "non", libelle: "Non" },
];

export const SITUATIONS: OptionChamp[] = [
  { valeur: "seul", libelle: "Personne seule" },
  { valeur: "couple", libelle: "Couple" },
  { valeur: "monoparental", libelle: "Parent isolé" },
];

export const LOGEMENT_AIDES: OptionChamp[] = [
  { valeur: "aide_logement", libelle: "Locataire qui touche une aide au logement (APL)" },
  { valeur: "loue", libelle: "Locataire sans aide au logement" },
  { valeur: "proprio", libelle: "Propriétaire" },
  { valeur: "gratuit", libelle: "Logé gratuitement" },
];

export const ENFANTS: ChampQuestion = { cle: "enfants", libelle: "Enfants à charge", type: "nombre", defaut: 0, min: 0, max: 10 };
export const SITUATION: ChampQuestion = { cle: "situation", libelle: "Situation familiale", type: "choix", options: SITUATIONS };

/** Formulations courtes partagées */
export const RESUME_COMMUN: Record<string, (v: string | number, p: ParametresQuestion) => string> = {
  situation: (v) => ({ seul: "personne seule", couple: "couple", monoparental: "parent isolé" })[v as "seul"] ?? "",
  enfants: (v) => (Number(v) === 0 ? "sans enfant" : `${v} enfant${Number(v) > 1 ? "s" : ""}`),
  revenus: (v) => (Number(v) === 0 ? "sans revenu" : `${euros(Number(v))} de revenus`),
  logement: (v) =>
    ({
      aide_logement: "locataire avec APL",
      loue: "locataire sans APL",
      proprio: "propriétaire",
      gratuit: "logé gratuitement",
      "sans-abri": "sans logement stable",
    })[v as "loue"] ?? "",
};

export const pluriel = (n: number, mot: string) => `${n} ${mot}${n > 1 ? "s" : ""}`;
