/**
 * Analyseur de questions en langage naturel, sans service extérieur.
 *
 * « combien d'APL pour 700 € de loyer avec 2 enfants à Lyon »
 *   → { simulateur: "apl", params: { loyer: 700, enfants: 2, zone: "zone2", … }, manquants: ["revenus", "situation"] }
 *
 * L'analyseur ne calcule rien : il repère le simulateur et les paramètres, puis le moteur du site calcule
 * (src/utils/questions/simulateursQuestions.ts). Il reçoit une question déjà passée par le filtre de
 * données personnelles.
 */
import { normaliser } from "./donneesPersonnelles";
import { departementsCites, normaliserNomCommune, trouverCommune, type CommuneTrouvee, type IndexCommunes } from "./communesZones";
import {
  cheminResultat,
  validerParametres,
  type ParametresQuestion,
  type SimulateurId,
  type ValidationParametres,
} from "./simulateursQuestions";
import { DEPARTEMENTS } from "./definitions/logement";
import { TAUX_SALARIAL } from "../salaireCalculEngine";
import { baremes } from "../../data/baremes";

export interface AnalyseQuestion {
  simulateur: SimulateurId | null;
  /** Paramètres repérés dans la question, avant validation */
  extraits: ParametresQuestion;
  /** Paramètres validés, informations manquantes et hypothèses (null si aucun simulateur) */
  validation: ValidationParametres | null;
  /** Commune repérée, avec sa zone */
  commune: CommuneTrouvee | null;
  /** La question cite peut-être une commune, mais l'index des communes n'a pas été fourni */
  communeAChercher: boolean;
  /** Remarques à afficher (hypothèses de lecture, cas non pris en charge) */
  remarques: string[];
  /** Page de résultat : /r/apl?… */
  chemin: string | null;
}

const CHIFFRES: Record<string, number> = { un: 1, une: 1, deux: 2, trois: 3, quatre: 4, cinq: 5, six: 6, sept: 7, huit: 8, neuf: 9, dix: 10 };
const NOMBRE = String.raw`(\d{1,2}|un|une|deux|trois|quatre|cinq|six|sept|huit|neuf|dix)`;
const nombre = (s: string) => CHIFFRES[s] ?? Number(s);
const MOIS = ["janvier", "fevrier", "mars", "avril", "mai", "juin", "juillet", "aout", "septembre", "octobre", "novembre", "decembre"];

// ---------------------------------------------------------------------------------------------
// Simulateur demandé
// ---------------------------------------------------------------------------------------------

/**
 * Motifs par niveau de priorité : un simulateur nommé (niveau 1) l'emporte sur le chômage cité comme
 * revenu (niveau 2), qui l'emporte sur « brut » ou « net » (niveau 3). À niveau égal, le premier cité.
 */
const MOTIFS_SIMULATEURS: [SimulateurId, number, RegExp][] = [
  ["prime-activite", 1, /\bprime (?:d )?(?:l )?activite\b|\bppa\b/],
  ["rsa", 1, /\brsa\b|\brevenu de solidarite/],
  ["apl", 1, /\b(?:apl|als|alf)\b|\baides? (?:au|aux|pour le|pour mon) (?:logement|loyer)\b|\ballocations? (?:de |au |pour le )?logement\b|\baide caf (?:pour le |au )?logement\b/],
  ["apl", 1, /\bcaf\b.*\b(?:loyer|logement)\b|\b(?:loyer|logement)\b.*\bcaf\b|\baides? (?:pour|au|a) (?:mon |le |payer (?:mon |le )?)?loyer\b/],
  ["aah", 1, /\baah\b|\ballocation (?:aux )?adultes? handicapes?\b/],
  ["asf", 1, /\basf\b|\ballocation de soutien familial\b|\bpension alimentaire (?:non versee|impayee|pas versee|pas payee)\b/],
  ["notaire", 1, /\bnotaires?\b|\bdroits de mutation\b|\bfrais d acquisition\b/],
  ["ptz", 1, /\bptz\b|\bpret a taux zero\b/],
  ["dpe-location", 1, /\bdpe\b|\bpassoires? (?:thermiques?|energetiques?)\b|\b(?:classe|etiquette) energetique\b|\bdecence energetique\b|\b(?:logement|appartement|appart|maison|studio|bien) (?:est )?classee? (?:g\s?\+|[a-g])\b/],
  ["depot-garantie", 1, /\bdepot de garantie\b|\bcaution\b(?! solidaire)|\brestitution (?:de la |du )?(?:caution|depot)\b/],
  ["indemnite-licenciement", 1, /\bindemnites? (?:legales? )?(?:de|du) licenciement\b|\bprime de licenciement\b|\bindemnite de rupture\b/],
  ["fin-droits", 1, /\b(?:finissent|se terminent|terminent|s arretent|arretent|expirent|fin)\b.{0,25}\b(?:mes |les |de mes )?droits\b|\bfin (?:de|des) (?:mes )?droits\b|\bjusqu a quand\b.{0,30}\b(?:chomage|droits|are|indemnise(?:e)?)\b|\bquand\b.{0,30}\b(?:chomage|droits)\b.{0,30}\b(?:fin|finissent|terminent|arretent|arreter|s arrete)\b|\bdroits au chomage\b.*\b(?:fin|finissent|terminent|arretent|jusqu)\b|\bepuisement des droits\b/],
  ["retraite", 1, /\b(?:partir|depart|departs|pars|partirai) (?:a|en) (?:la )?retraite\b|\bage (?:legal|de depart)\b|\ba quel age\b.*\bretraite\b|\bretraite\b.*\ba quel age\b/],
  ["impot", 1, /\bimpots?\b|\bimpose(?:e|s)?\b|\bimposition\b|\bquotient familial\b|\bnombre de parts\b|\btranche marginale\b|\bir\b/],
  ["are", 2, /\bchomage\b|\b(?:l )?are\b|\ballocation (?:de )?retour a l emploi\b|\bpole emploi\b|\bfrance travail\b/],
  ["retraite", 2, /\bretraite\b/],
  ["salaire", 3, /\bbrut\b|\bsalaire net\b|\ben net\b|\bnet (?:en|vers) brut\b|\bsmic\b/],
];

function detecterSimulateur(t: string): SimulateurId | null {
  let meilleur: { id: SimulateurId; niveau: number; position: number } | null = null;
  for (const [id, niveau, motif] of MOTIFS_SIMULATEURS) {
    const m = motif.exec(t);
    if (!m) continue;
    if (!meilleur || niveau < meilleur.niveau || (niveau === meilleur.niveau && m.index < meilleur.position)) {
      meilleur = { id, niveau, position: m.index };
    }
  }
  let id = meilleur?.id ?? null;
  // L'impôt cité comme simple « net après impôt » d'un salaire reste un calcul de salaire
  if (id === "impot" && /\bbrut\b/.test(t) && /\b(?:net )?apres impots?\b/.test(t)) id = "salaire";
  if (id === "apl" && /\b(?:etudiante?s?|boursiere?s?|crous|residence universitaire)\b/.test(t)) id = "apl-etudiant";
  return id;
}

// ---------------------------------------------------------------------------------------------
// Dates
// ---------------------------------------------------------------------------------------------

interface DateTrouvee {
  iso: string;
  debut: number;
  fin: number;
  /** Jour absent de la question (« septembre 2025 ») : le 1er du mois est retenu */
  jourSuppose: boolean;
}

const iso = (a: number, m: number, j: number) => {
  const d = new Date(Date.UTC(a, m - 1, j));
  if (d.getUTCFullYear() !== a || d.getUTCMonth() !== m - 1 || d.getUTCDate() !== j) return null;
  return `${a}-${String(m).padStart(2, "0")}-${String(j).padStart(2, "0")}`;
};

/** « 31/10/2026 », « 31 10 2026 », « 2026 10 31 », « 1er septembre 2025 », « septembre 2025 » */
function extraireDates(t: string): DateTrouvee[] {
  const dates: DateTrouvee[] = [];
  const ajouter = (m: RegExpMatchArray, a: number, mo: number, j: number, jourSuppose = false) => {
    const v = iso(a, mo, j);
    if (v && !dates.some((d) => d.debut <= (m.index ?? 0) && (m.index ?? 0) < d.fin)) {
      dates.push({ iso: v, debut: m.index ?? 0, fin: (m.index ?? 0) + m[0].length, jourSuppose });
    }
  };
  for (const m of t.matchAll(/\b(\d{4})[ /.](\d{1,2})[ /.](\d{1,2})\b/g)) ajouter(m, +m[1], +m[2], +m[3]);
  for (const m of t.matchAll(/\b(\d{1,2})[ /.](\d{1,2})[ /.](\d{4})\b/g)) ajouter(m, +m[3], +m[2], +m[1]);
  const mois = MOIS.join("|");
  for (const m of t.matchAll(new RegExp(`\\b(\\d{1,2})(?:er)? (${mois}) (\\d{4})\\b`, "g"))) ajouter(m, +m[3], MOIS.indexOf(m[2]) + 1, +m[1]);
  for (const m of t.matchAll(new RegExp(`\\b(${mois}) (\\d{4})\\b`, "g"))) ajouter(m, +m[2], MOIS.indexOf(m[1]) + 1, 1, true);
  return dates.sort((a, b) => a.debut - b.debut);
}

/** Date la plus proche d'un mot-clé (avant ou juste après), dans les 40 caractères */
function dateApres(t: string, dates: DateTrouvee[], motif: RegExp, dejaPrises: Set<DateTrouvee>): DateTrouvee | undefined {
  let meilleure: { d: DateTrouvee; distance: number } | undefined;
  for (const k of t.matchAll(new RegExp(motif.source, "g"))) {
    const finCle = (k.index ?? 0) + k[0].length;
    for (const d of dates) {
      if (dejaPrises.has(d)) continue;
      const distance = d.debut >= finCle ? d.debut - finCle : (k.index ?? 0) - d.fin + 15;
      if (distance >= 0 && distance <= 40 && (!meilleure || distance < meilleure.distance)) meilleure = { d, distance };
    }
  }
  if (meilleure) dejaPrises.add(meilleure.d);
  return meilleure?.d;
}

// ---------------------------------------------------------------------------------------------
// Montants
// ---------------------------------------------------------------------------------------------

interface Montant {
  valeur: number;
  debut: number;
  fin: number;
  annuel: boolean;
  /** Écrit avec €, euros ou k */
  devise: boolean;
}

/** Montants de la question : « 700 € », « 1 200 euros », « 1867,02 », « 24k », « 24 000 € par an » */
function extraireMontants(t: string): Montant[] {
  const montants: Montant[] = [];
  const motif = /(?<![\d,.])(\d{1,3}(?:[ .]\d{3})+|\d+)(?:[,.](\d{1,2}))?(?!\d)\s*(k(?:€|e)?\b)?\s*(€|eur\b|euros?\b|e\b)?/g;
  for (const m of t.matchAll(motif)) {
    const debut = m.index ?? 0;
    const fin = debut + m[0].trimEnd().length;
    const apres = t.slice(fin, fin + 20);
    const avant = t.slice(Math.max(0, debut - 12), debut);
    const devise = Boolean(m[3] || m[4]);
    let valeur = Number(m[1].replace(/[ .]/g, "") + (m[2] ? `.${m[2]}` : ""));
    if (m[3]) valeur *= 1000;
    if (!devise) {
      // Nombre d'enfants, âge, durée, pourcentage, zone, département, année
      if (/^\s*(?:enfants?|gosses?|petits|bebes?|fils|filles|ans?\b|mois\b|jours?|semaines?|%|pour ?cent|personnes?|pieces?|m2|m²|h\b|heures?|trimestres?|e(?:me|r)?\b)/.test(apres)) continue;
      if (/(?:zone|le|dans le|en|\(|ne|nee|depuis)\s*$/.test(avant) && valeur < 1000 && !/^\s*(?:de loyer|de revenu|de salaire)/.test(apres)) continue;
      // Année (« en 2026 », « smic 2027 »), sauf si un mot de montant suit (« 2000 net »)
      if (valeur >= 1940 && valeur <= 2099 && Number.isInteger(valeur) && !/^\s*(?:nets?|bruts?|de (?:loyer|salaire|revenus?|chomage)|par mois)\b/.test(apres)) continue;
      if (valeur < 20) continue;
    }
    // « 24 000 € par an », « 18 000 € de revenus par an », « 42 000 € brut annuel »
    const annuel = /^\s*(?:€|euros?)?\s*(?:(?:de |d )?(?:revenus?|salaires?|ressources|bruts?|nets?)\s*)?(?:par an|\/ ?an\b|l an\b|annuels?|annuellement|sur l annee)/.test(
      t.slice(fin, fin + 30),
    );
    montants.push({ valeur, debut, fin, annuel, devise });
  }
  return montants;
}

type Role = "loyer" | "revenus" | "autres" | "brut" | "net" | "prix" | "depot" | "rfr" | "iccp" | "imposable";

const MOTS_ROLES: [Role, RegExp][] = [
  ["rfr", /\b(?:revenu fiscal(?: de reference)?|rfr)\b/g],
  ["imposable", /\b(?:imposables?|net imposable)\b/g],
  ["depot", /\b(?:caution|depot(?: de garantie)?)\b/g],
  ["iccp", /\b(?:conges payes|indemnite de conges)\b/g],
  ["loyer", /\b(?:loyers?|loue|louer|location|studio|chambre|t1|t2|t3|t4|f1|f2|f3|f4)\b/g],
  ["prix", /\b(?:prix|achat|acheter|achete|acquisition|vendu|vente|bien|terrain|maison|appartement|appart)\b/g],
  ["autres", /\b(?:chomage|are|allocations? chomage|pensions?|retraite|indemnites?)\b/g],
  ["brut", /\bbruts?\b/g],
  ["net", /\bnets?\b/g],
  ["revenus", /\b(?:gagne|gagnons|gagnent|salaires?|revenus?|ressources|touche|touchons|percois|paye|payee|smic|paie)\b/g],
];

/** Rôle d'un montant d'après le mot-clé le plus proche (dans la même portion de phrase) */
function roleMontant(t: string, m: Montant, tous: Montant[]): Role | null {
  const indice = tous.indexOf(m);
  const borneAvant = indice > 0 ? tous[indice - 1].fin : 0;
  const borneApres = indice < tous.length - 1 ? tous[indice + 1].debut : t.length;
  const avant = t.slice(Math.max(borneAvant, m.debut - 35), m.debut);
  const apres = t.slice(m.fin, Math.min(borneApres, m.fin + 35));
  let meilleur: { role: Role; distance: number } | null = null;
  for (const [role, motif] of MOTS_ROLES) {
    for (const k of avant.matchAll(motif)) {
      const entre = avant.slice((k.index ?? 0) + k[0].length);
      // Un mot-clé séparé du montant par une ponctuation ou « et » se rapporte à autre chose
      const distance = entre.length + (/[,;.]|\bet\b/.test(entre) ? 30 : 0);
      if (!meilleur || distance < meilleur.distance) meilleur = { role, distance };
    }
    const k = new RegExp(motif.source).exec(apres);
    if (k) {
      // « 700 € de loyer », « 300 € de chômage » : le mot-clé qui suit l'emporte ; après une
      // ponctuation ou « et », il se rapporte au montant suivant
      const entre = apres.slice(0, k.index);
      const distance = /^\s*(?:€|euros?)?\s*(?:de|d)\s*$/.test(entre) ? -1 : k.index + (/[,;.]|\bet\b/.test(entre) ? 30 : 0);
      if (!meilleur || distance < meilleur.distance) meilleur = { role, distance };
    }
  }
  return meilleur?.role ?? null;
}

/** Paramètre alimenté par chaque rôle de montant, pour chaque simulateur ("+" : les montants s'additionnent) */
const CLES_MONTANTS: Partial<Record<SimulateurId, Partial<Record<Role, string>>>> = {
  apl: { loyer: "loyer", revenus: "+revenus", autres: "+revenus", net: "+revenus", brut: "+revenus" },
  "apl-etudiant": { loyer: "loyer", revenus: "+revenus", net: "+revenus", autres: "+revenus" },
  rsa: { revenus: "+revenus", autres: "+revenus", net: "+revenus" },
  "prime-activite": { revenus: "salaire", net: "salaire", autres: "autres" },
  aah: { revenus: "+revenus", autres: "+revenus", net: "+revenus" },
  salaire: { brut: "brut", net: "net" },
  impot: { imposable: "revenu", revenus: "revenu", net: "revenu" },
  are: { brut: "salaire", revenus: "salaire" },
  "fin-droits": { brut: "salaire", revenus: "salaire", iccp: "iccp" },
  "indemnite-licenciement": { brut: "salaire", revenus: "salaire" },
  notaire: { prix: "prix" },
  ptz: { rfr: "rfr", revenus: "rfr", imposable: "rfr" },
  "depot-garantie": { loyer: "loyer", depot: "depot" },
};

/** Paramètre d'un montant unique sans mot-clé */
const MONTANT_SEUL: Partial<Record<SimulateurId, string>> = {
  "prime-activite": "salaire",
  salaire: "brut",
  notaire: "prix",
  are: "salaire",
  "indemnite-licenciement": "salaire",
  "fin-droits": "salaire",
  "depot-garantie": "depot",
  impot: "revenu",
  ptz: "rfr",
};

/** Simulateurs dont les montants sont annuels (les autres sont mensuels) */
const MONTANTS_ANNUELS: SimulateurId[] = ["impot", "ptz", "notaire"];

// ---------------------------------------------------------------------------------------------
// Situation familiale, logement, activité
// ---------------------------------------------------------------------------------------------

function extraireEnfants(t: string): number | undefined {
  if (/\b(?:sans|pas d|aucun|0|zero) (?:enfants?|gosses?)\b/.test(t)) return 0;
  const m = new RegExp(`\\b${NOMBRE} (?:enfants?|gosses?|petits|bebes?|fils|filles)\\b`).exec(t);
  if (m) return nombre(m[1]);
  if (/\b(?:mon|ma|notre) (?:enfant|fils|fille|bebe)\b|\bun bebe\b/.test(t)) return 1;
  return undefined;
}

function extraireSituation(t: string): string | undefined {
  if (/\b(?:parent (?:isole|seul|solo)|famille monoparentale|monoparental|maman solo|papa solo|(?:mere|maman) (?:seule|celibataire|isolee|solo)|(?:pere|papa) (?:seul|celibataire|isole|solo)|seule? avec (?:mon|ma|mes|\d+|un|une|deux|trois|quatre) (?:enfants?|fils|filles?|bebes?|gosses?))\b/.test(t)) return "monoparental";
  if (/\b(?:en couple|couple|marie(?:e|s|es)?|pacse(?:e|s|es)?|concubins?|concubinage|mon (?:mari|conjoint|compagnon|copain|epoux)|ma (?:femme|conjointe|compagne|copine|epouse)|nous deux|a deux)\b/.test(t)) return "couple";
  if (/\b(?:seule?|celibataire|personne seule|isolee?|tout seul|toute seule|divorcee?|veuve?|separee?)\b/.test(t)) return "seul";
  return undefined;
}

function extraireLogementAides(t: string): string | undefined {
  if (/\b(?:sdf|sans abri|sans domicile|a la rue|sans logement)\b/.test(t)) return "sans-abri";
  if (/\b(?:heberge(?:e|s)?|chez (?:mes|mon|ma) (?:parents?|pere|mere|ami|amie|famille|copain|copine)|loge(?:e)? gratuitement|logement gratuit|gratuitement)\b/.test(t)) return "gratuit";
  if (/\bproprietaires?\b/.test(t)) return "proprio";
  if (/\bsans (?:apl|aide au logement|aide logement|als|alf)\b/.test(t)) return "loue";
  if (/\b(?:avec (?:l )?(?:apl|als|alf|aide au logement|aide logement)|je touche (?:l )?apl|et (?:l )?apl)\b/.test(t)) return "aide_logement";
  return undefined;
}

/** Âge : « 42 ans », « j'ai 58 ans », mais pas « 8 ans d'ancienneté » */
function extraireAge(t: string): number | undefined {
  for (const m of t.matchAll(/\b(\d{2}) ans\b(?! (?:d anciennete|dans l entreprise|de travail|de boite|de cotisation|de carriere|d activite|et \d+ mois d))/g)) {
    const avant = t.slice(Math.max(0, (m.index ?? 0) - 12), m.index);
    if (/\b(?:depuis|pendant|durant|apres)\s*$/.test(avant)) continue;
    const age = Number(m[1]);
    if (age >= 16 && age <= 70) return age;
  }
  return undefined;
}

/** Ancienneté en années : « 8 ans d'ancienneté », « 7 ans et 6 mois dans l'entreprise », « depuis 12 ans » */
function extraireAnciennete(t: string): number | undefined {
  const m = /\b(\d{1,2}(?:[,.]\d{1,2})?) ans?(?: et (\d{1,2}) mois)? (?:d anciennete|dans l entreprise|dans la boite|de boite|de travail|chez)/.exec(t)
    ?? /\b(?:anciennete|depuis)(?: de)? (\d{1,2}(?:[,.]\d{1,2})?) ans?(?: et (\d{1,2}) mois)?/.exec(t);
  if (m) return Math.round((Number(m[1].replace(",", ".")) + (m[2] ? Number(m[2]) / 12 : 0)) * 100) / 100;
  const mois = /\b(\d{1,3}) mois (?:d anciennete|dans l entreprise)/.exec(t);
  return mois ? Math.round((Number(mois[1]) / 12) * 100) / 100 : undefined;
}

/** Mois travaillés : « 18 mois de travail », « 3 ans de travail » */
function extraireMoisTravailles(t: string): number | undefined {
  const mois = /\b(\d{1,3}) mois (?:de travail|travailles|d activite|de cotisation|d emploi|de cdd|de contrat)/.exec(t);
  if (mois) return Number(mois[1]);
  const ans = /\b(\d{1,2}(?:[,.]\d)?) ans? (?:de travail|travailles|d activite|de cotisation|d emploi|d anciennete|de cdi|dans l entreprise)/.exec(t);
  return ans ? Math.round(Number(ans[1].replace(",", ".")) * 12) : undefined;
}

const DEPARTEMENTS_PAR_NOM = new Map(
  DEPARTEMENTS.map((d) => [normaliserNomCommune(d.libelle.split(" – ")[1]), d.valeur] as const).filter(([nom]) => nom),
);

/** Département cité par son nom (« dans le Rhône », « en Gironde ») ou son numéro */
function extraireDepartement(t: string): string | undefined {
  const texte = normaliserNomCommune(t);
  for (const [nom, code] of DEPARTEMENTS_PAR_NOM) {
    if (new RegExp(`\\b(?:dans l?e?s?|en|du|de l?a?) ${nom}\\b`).test(texte)) return code;
  }
  const cites = departementsCites(t);
  return cites.length === 1 ? cites[0] : undefined;
}

function nomAffiche(nom: string): string {
  return nom.replace(/(^|\s)([a-z])/g, (_, a, b) => a + b.toUpperCase());
}

// ---------------------------------------------------------------------------------------------
// Analyse
// ---------------------------------------------------------------------------------------------

export interface OptionsAnalyse {
  /** Index des communes ; sans lui, la commune n'est pas cherchée (communeAChercher indique s'il faut le charger) */
  communes?: IndexCommunes;
  /** Simulateur de la page où la question est posée, retenu si la question n'en cite aucun */
  simulateurParDefaut?: SimulateurId;
}

const AVEC_COMMUNE: SimulateurId[] = ["apl", "apl-etudiant", "notaire"];

export function analyserQuestion(question: string, options: OptionsAnalyse = {}): AnalyseQuestion {
  // Les tirets séparent les mots (« auto-entrepreneur », « touche-t-on »)
  const t = normaliser(question).replace(/-/g, " ").replace(/\s+/g, " ");
  const remarques: string[] = [];
  const simulateur = detecterSimulateur(t) ?? options.simulateurParDefaut ?? null;
  const vide: AnalyseQuestion = { simulateur, extraits: {}, validation: null, commune: null, communeAChercher: false, remarques, chemin: null };
  if (!simulateur) return vide;
  const ex: ParametresQuestion = {};

  // Dates d'abord : leurs chiffres ne sont pas des montants
  const dates = extraireDates(t);
  const sansDates = dates.reduce((s, d) => s.slice(0, d.debut) + " ".repeat(d.fin - d.debut) + s.slice(d.fin), t);

  // Montants
  const montants = extraireMontants(sansDates);
  const cles = CLES_MONTANTS[simulateur] ?? {};
  for (const m of montants) {
    const role = roleMontant(sansDates, m, montants);
    let cle = role ? cles[role] : undefined;
    if (!cle && montants.length === 1) cle = MONTANT_SEUL[simulateur];
    if (!cle) continue;
    const somme = cle.startsWith("+");
    cle = cle.replace("+", "");
    const annuelAttendu = MONTANTS_ANNUELS.includes(simulateur);
    let valeur = m.valeur;
    if (annuelAttendu && !m.annuel && /^\s*(?:€|euros?)?\s*(?:\w+ ){0,2}par mois\b/.test(sansDates.slice(m.fin, m.fin + 25))) {
      remarques.push("Montant mensuel cité : le calcul demande un montant annuel, à vérifier ci-dessous.");
      continue;
    }
    if (!annuelAttendu && m.annuel) {
      valeur = Math.round((m.valeur / 12) * 100) / 100;
      remarques.push(`Montant annuel de ${m.valeur.toLocaleString("fr-FR")} € ramené à ${valeur.toLocaleString("fr-FR")} € par mois.`);
    }
    if (ex[cle] !== undefined && somme) ex[cle] = Number(ex[cle]) + valeur;
    else if (ex[cle] === undefined) ex[cle] = valeur;
  }

  // Revenus nuls, SMIC
  if (/\b(?:sans|pas de|aucun|0|zero) (?:revenus?|ressources?|salaires?)\b|\bje ne (?:gagne|touche) rien\b/.test(t)) {
    if (simulateur === "prime-activite") ex.salaire ??= 0;
    else if (["apl", "apl-etudiant", "rsa", "aah"].includes(simulateur)) ex.revenus ??= 0;
  }
  if (/\bsmic\b/.test(t)) {
    const partiel = /\b(?:mi temps|temps partiel|a 50 ?%)\b/.test(t) ? 0.5 : 1;
    const net = Math.round(baremes.smic.mensuel_net_35h_estimation * partiel * 100) / 100;
    const brut = Math.round(baremes.smic.mensuel_brut_35h * partiel * 100) / 100;
    const cible: Partial<Record<SimulateurId, [string, number, string]>> = {
      salaire: ["brut", brut, "brut"],
      are: ["salaire", brut, "brut"],
      "fin-droits": ["salaire", brut, "brut"],
      "indemnite-licenciement": ["salaire", brut, "brut"],
      "prime-activite": ["salaire", net, "net"],
      apl: ["revenus", net, "net"],
      rsa: ["revenus", net, "net"],
      aah: ["revenus", net, "net"],
    };
    const c = cible[simulateur];
    if (c && ex[c[0]] === undefined) {
      ex[c[0]] = c[1];
      remarques.push(`SMIC ${partiel < 1 ? "à mi-temps " : ""}retenu : ${c[1].toLocaleString("fr-FR")} € ${c[2]} par mois.`);
    }
  }

  // Foyer
  if (["apl", "rsa", "prime-activite", "aah", "impot", "asf", "ptz"].includes(simulateur)) {
    const enfants = extraireEnfants(t);
    if (enfants !== undefined) ex.enfants = enfants;
    const situation = extraireSituation(t);
    if (situation) ex.situation = situation;
  }

  // Commune : zone APL ou département
  let commune: CommuneTrouvee | null = null;
  let communeAChercher = false;
  if (AVEC_COMMUNE.includes(simulateur)) {
    if (/\bmayotte\b/.test(t)) {
      remarques.push(simulateur === "notaire" ? "Mayotte : barème des frais de notaire non disponible." : "Mayotte a ses propres règles d'aide au logement : ce cas n'est pas calculé.");
    } else if (options.communes) {
      commune = trouverCommune(normaliserNomCommune(t), options.communes);
      if (commune) ex.ville = nomAffiche(commune.nom);
    } else {
      // La commune peut être citée sans préposition (« APL Marseille ») : l'index est toujours utile
      communeAChercher = true;
    }
  }

  switch (simulateur) {
    case "apl":
    case "apl-etudiant": {
      if (simulateur === "apl") {
        if (/\b(?:coloc|colocation|colocataires?)\b/.test(t)) ex.logement = "colocation";
        else if (/\b(?:hlm|logement social|logement conventionne|office public)\b/.test(t)) ex.logement = "hlm";
      } else {
        if (/\b(?:residence universitaire|crous|foyer|logement foyer)\b/.test(t)) ex.logement = "foyer";
        if (/\b(?:non boursiere?|pas boursiere?|sans bourse)\b/.test(t)) ex.boursier = "non";
        else if (/\b(?:boursiere?s?|bourse|echelon)\b/.test(t)) ex.boursier = "oui";
        if (/\b(?:hors (?:ue|union europeenne|europe)|extra europeen(?:ne)?|etranger non europeen)\b/.test(t)) ex.horsue = "oui";
      }
      const z = /\bzone (1|2|3|i{1,3}|un|deux|trois)\b/.exec(t);
      const numero = z ? ({ i: 1, ii: 2, iii: 3, un: 1, deux: 2, trois: 3 }[z[1] as "i"] ?? Number(z[1])) : undefined;
      const outreMer = /\b(?:outre mer|dom(?: tom)?|drom|reunion|guadeloupe|martinique|guyane)\b/.test(t) || commune?.zone === "D";
      const code = numero ? String(numero) : outreMer ? "D" : commune?.zone ?? null;
      if (code === "M") remarques.push("Mayotte a ses propres règles d'aide au logement : ce cas n'est pas calculé.");
      else if (code === "D") {
        if (simulateur === "apl") ex.zone = "dom";
        else remarques.push("Outre-mer : le simulateur APL étudiant ne couvre que la métropole.");
      } else if (code) ex.zone = simulateur === "apl" ? `zone${code}` : code;
      else if (commune) remarques.push(`Plusieurs communes s'appellent ${nomAffiche(commune.nom)} : précisez la zone.`);
      else if (/\bile de france\b/.test(t)) remarques.push("L'Île-de-France compte des communes en zone 1, 2 et 3 : précisez la commune ou la zone.");
      break;
    }
    case "rsa":
    case "prime-activite": {
      const logement = extraireLogementAides(t);
      if (logement && !(simulateur === "prime-activite" && logement === "sans-abri")) ex.logement = logement;
      if (simulateur === "rsa") {
        if (/\b(?:chomage|demandeur d emploi|pole emploi|france travail|are)\b/.test(t)) ex.activite = "chomage";
        else if (/\b(?:(?:sans|ni|pas d) (?:emploi|activite|travail)|inactif|inactive|ne travaille (?:pas|plus))\b/.test(t)) ex.activite = "inactif";
        else if (/\b(?:travaille|salarie(?:e)?|salaire|cdi|cdd|interim|gagne|temps partiel|mi temps)\b/.test(t)) ex.activite = "actif";
      } else if (/\b(?:auto entrepreneur|autoentrepreneur|micro entrepreneur|micro entreprise|independant(?:e)?|freelance)\b/.test(t)) ex.activite = "independant";
      else if (/\b(?:apprenti(?:e)?|apprentissage|alternance|alternant(?:e)?)\b/.test(t)) ex.activite = "apprenti";
      break;
    }
    case "aah": {
      const taux = /\b(\d{2}) ?(?:%|pour ?cent)/.exec(t);
      if (taux) ex.taux = Number(taux[1]) >= 80 ? "80" : Number(taux[1]) >= 50 ? "50" : "";
      if (/\b(?:heberge(?:e)?|chez (?:mes|mon|ma) )/.test(t)) ex.logement = "heberge";
      else if (/\bproprietaire\b/.test(t)) ex.logement = "proprio";
      else if (/\b(?:locataire|loyer|location)\b/.test(t)) ex.logement = "locataire";
      break;
    }
    case "asf": {
      if (/\borphelin/.test(t)) ex.cas = "orphelin";
      else if (/\b(?:recueilli|prive de (?:ses deux|ses) parents|sans ses deux parents)\b/.test(t)) ex.cas = "depourvu";
      else if (/\b(?:pension alimentaire|ne paie (?:pas|plus)|ne verse (?:pas|plus)|separe(?:e)?|seule? avec|parent isole|pere absent|mere absente)\b/.test(t)) ex.cas = "parentisole";
      break;
    }
    case "salaire": {
      if (/\bnon cadres?\b/.test(t)) ex.statut = "non_cadre";
      else if (/\bcadres?\b/.test(t)) ex.statut = "cadre";
      const pas = /\b(?:pas|prelevement a la source|taux d imposition|taux)\D{0,15}(\d{1,2}(?:[,.]\d{1,2})?) ?%/.exec(t);
      if (pas) ex.pas = Number(pas[1].replace(",", "."));
      // « 1 800 € net en brut » : le brut est retrouvé avec le taux de cotisations du moteur
      if (ex.brut === undefined && ex.net !== undefined) {
        const taux = TAUX_SALARIAL[(ex.statut as "cadre" | "non_cadre") || "non_cadre"];
        ex.brut = Math.round((Number(ex.net) / (1 - taux)) * 100) / 100;
        remarques.push(`Salaire brut retrouvé à partir de ${Number(ex.net).toLocaleString("fr-FR")} € net.`);
      }
      delete ex.net;
      break;
    }
    case "impot":
      break;
    case "are":
    case "fin-droits": {
      const age = extraireAge(t);
      if (age !== undefined) ex.age = age;
      if (simulateur === "are") {
        const mois = extraireMoisTravailles(t);
        if (mois !== undefined) {
          const plafond = (age ?? 0) >= 55 ? 36 : 24;
          ex.anciennete = Math.min(mois, plafond);
          if (mois > plafond) remarques.push(`Seuls les ${plafond} derniers mois comptent pour l'allocation.`);
        }
        if (/\brupture conventionnelle\b/.test(t)) ex.rupture = "oui";
      } else {
        const rupture = /\brupture conventionnelle\b/.test(t) ? "rupture-conventionnelle"
          : /\blicenci(?:e|ee|ement) (?:pour (?:motif )?)?economique\b/.test(t) ? "licenciement-economique"
          : /\blicenci/.test(t) ? "licenciement"
          : /\b(?:fin de (?:cdd|contrat|mission)|interim)\b/.test(t) ? "fin-cdd"
          : /\bdemission legitime\b/.test(t) ? "demission-legitime"
          : /\bdemission/.test(t) ? "demission"
          : undefined;
        if (rupture) ex.rupture = rupture;
        const prises = new Set<DateTrouvee>();
        const fin = dateApres(t, dates, /\b(?:licencie(?:e)?|fin (?:de|du) (?:mon )?(?:contrat|cdd)|termine|finit|fini|quitte|sorti(?:e)?|dernier jour|rupture conventionnelle|demissionne)\b/, prises);
        const inscription = dateApres(t, dates, /\binscri(?:t|te|ption)\b/, prises);
        const debut = dateApres(t, dates, /\b(?:embauche(?:e)?|debut|depuis|entre(?:e)?|commence|premier contrat)\b/, prises);
        for (const [cle, d] of [["fin", fin], ["inscription", inscription], ["debut", debut]] as const) {
          if (d) {
            ex[cle] = d.iso;
            if (d.jourSuppose) remarques.push(`Jour non précisé : le ${d.iso.slice(8) === "01" ? "1er" : d.iso.slice(8)} du mois est retenu (${cle === "fin" ? "fin du contrat" : cle === "debut" ? "début du contrat" : "inscription"}).`);
          }
        }
      }
      break;
    }
    case "indemnite-licenciement": {
      const anciennete = extraireAnciennete(t);
      if (anciennete !== undefined) ex.anciennete = anciennete;
      break;
    }
    case "retraite": {
      const naissance = new RegExp(`\\bne(?:e)?s? (?:le |en )?(?:(\\d{1,2})(?:er)? )?(?:(${MOIS.join("|")}) )?(?:en )?(\\d{4})\\b`).exec(t)
        ?? /\bne(?:e)?s? le (\d{1,2})[ /.](\d{1,2})[ /.](\d{4})\b/.exec(t);
      if (naissance) {
        ex.annee = Number(naissance[3]);
        const mois = naissance[2] ? (MOIS.includes(naissance[2]) ? MOIS.indexOf(naissance[2]) + 1 : Number(naissance[2])) : undefined;
        if (mois) ex.mois = String(mois);
      } else {
        const annee = /\b(19[4-9]\d|200\d)\b/.exec(t);
        if (annee) ex.annee = Number(annee[1]);
      }
      const trimestres = /\b(\d{1,3}) trimestres?\b/.exec(t);
      if (trimestres) ex.trimestres = Number(trimestres[1]);
      break;
    }
    case "notaire": {
      if (/\b(?:neuf|neuve|vefa|sur plan|programme neuf|construction neuve)\b/.test(t)) ex.bien = "neuf";
      else if (/\bterrain\b/.test(t)) ex.bien = "terrain";
      else if (/\bancien(?:ne)?\b/.test(t)) ex.bien = "ancien";
      if (/\b(?:premier achat|primo accedant(?:e|s)?|premiere acquisition|premiere residence principale)\b/.test(t)) ex.primo = "oui";
      const dep = commune?.departement ?? extraireDepartement(t);
      if (dep) ex.departement = dep;
      else if (commune) remarques.push(`Plusieurs communes s'appellent ${nomAffiche(commune.nom)} : précisez le département.`);
      break;
    }
    case "ptz": {
      const z = /\bzone (a bis|abis|a|b1|b2|c)\b/.exec(t);
      if (z) ex.zone = z[1].startsWith("a") ? "A" : z[1].toUpperCase();
      const personnes = new RegExp(`\\b${NOMBRE} personnes?\\b`).exec(t);
      if (personnes) ex.personnes = nombre(personnes[1]);
      else if (ex.situation || ex.enfants !== undefined) {
        ex.personnes = (ex.situation === "couple" ? 2 : 1) + Number(ex.enfants ?? 0);
      }
      break;
    }
    case "dpe-location": {
      const classe = /\b(?:dpe|classe(?:e)?|etiquette|lettre|note|passoire)(?: energetique)?(?: en| :)? (g\s?\+|[a-g])\b/.exec(t);
      if (classe) ex.classe = classe[1].replace(/\s/g, "").toUpperCase();
      if (/\bmeuble(?:e)? etudiant|\bbail etudiant\b/.test(t)) ex.bail = "meuble-etudiant";
      else if (/\bbail mobilite\b/.test(t)) ex.bail = "mobilite";
      else if (/\bmeuble(?:e)?\b/.test(t)) ex.bail = "meuble";
      else if (/\b(?:sci|societe)\b/.test(t) && /\bvide\b|\bbail\b/.test(t)) ex.bail = "vide-societe";
      else if (/\b(?:vide|non meuble|bail de 3 ans|location nue)\b/.test(t)) ex.bail = "vide-particulier";
      if (/\b(?:outre mer|reunion|guadeloupe|martinique|guyane|mayotte)\b/.test(t)) ex.outremer = "oui";
      const debut = dateApres(t, dates, /\b(?:bail|depuis|signe|commence|debut|entre(?:e)?|loue)\b/, new Set());
      if (debut) {
        ex.debut = debut.iso;
        if (debut.jourSuppose) remarques.push("Jour de début du bail non précisé : le 1er du mois est retenu.");
      }
      break;
    }
    case "depot-garantie": {
      if (/\bbail mobilite\b/.test(t)) ex.type = "mobilite";
      else if (/\bmeuble(?:e)?\b/.test(t)) ex.type = "meuble";
      else if (/\b(?:vide|non meuble)\b/.test(t)) ex.type = "vide";
      if (/\betat des lieux\b.{0,25}\b(?:non conforme|pas conforme|different|differe|degradations?|problemes?)\b|\bdegradations?\b/.test(t)) ex.conforme = "non";
      else if (/\betat des lieux\b.{0,25}\b(?:conforme|identique|ok|bon|sans probleme|nickel|parfait)\b/.test(t)) ex.conforme = "oui";
      if (/\b(?:sans|pas (?:donne|laisse|indique|communique)) (?:ma |de )?nouvelle adresse\b/.test(t)) ex.adresse = "non";
      else if (/\bnouvelle adresse\b/.test(t)) ex.adresse = "oui";
      const prises = new Set<DateTrouvee>();
      const cles = dateApres(t, dates, /\b(?:cles|etat des lieux(?: de sortie)?|parti|quitte|demenage|sortie|depart)\b/, prises);
      const rendu = /\b(?:pas (?:encore )?(?:rendu|restitue|rembourse)|toujours pas|n a (?:pas|toujours pas) rendu)\b/.test(t)
        ? undefined
        : dateApres(t, dates, /\b(?:rendu|rendue|restitue|rembourse|recu|reverse)\b/, prises);
      if (cles) ex.cles = cles.iso;
      if (rendu) ex.rendu = rendu.iso;
      if (cles?.jourSuppose || rendu?.jourSuppose) remarques.push("Jour non précisé : le 1er du mois est retenu.");
      break;
    }
  }

  const validation = validerParametres(simulateur, ex);
  return {
    simulateur,
    extraits: ex,
    validation,
    commune,
    communeAChercher,
    remarques,
    chemin: cheminResultat(simulateur, validation.params),
  };
}
