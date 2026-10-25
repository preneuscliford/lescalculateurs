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
import { normaliserNomCommune, trouverCommune, type CommuneTrouvee, type IndexCommunes } from "./communesZones";
import {
  cheminResultat,
  validerParametres,
  type ParametresQuestion,
  type SimulateurId,
  type ValidationParametres,
} from "./simulateursQuestions";
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

/** Simulateur cité le plus tôt dans la question */
function detecterSimulateur(t: string): SimulateurId | null {
  const motifs: [SimulateurId, RegExp][] = [
    ["prime-activite", /\bprime (?:d )?(?:l )?activite\b|\bppa\b/],
    ["rsa", /\brsa\b|\brevenu de solidarite/],
    ["apl", /\b(?:apl|als|alf)\b|\baides? (?:au|aux|pour le|pour mon) (?:logement|loyer)\b|\ballocations? (?:de |au |pour le )?logement\b|\baide caf (?:pour le |au )?logement\b/],
    ["apl", /\bcaf\b.*\b(?:loyer|logement)\b|\b(?:loyer|logement)\b.*\bcaf\b|\baides? (?:pour|au|a) (?:mon |le |payer (?:mon |le )?)?loyer\b/],
    ["salaire", /\bbrut\b|\bsalaire net\b|\ben net\b|\bnet (?:en|vers) brut\b|\bsmic\b/],
  ];
  let meilleur: { id: SimulateurId; position: number } | null = null;
  for (const [id, motif] of motifs) {
    const m = motif.exec(t);
    if (!m) continue;
    // « brut » ou « net » seuls ne désignent le salaire que si aucune aide n'est citée
    const position = id === "salaire" ? Number.MAX_SAFE_INTEGER : m.index;
    if (!meilleur || position < meilleur.position) meilleur = { id, position };
  }
  return meilleur?.id ?? null;
}

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
      if (/^\s*(?:enfants?|gosses?|petits|bebes?|fils|filles|ans?\b|mois\b|jours?|semaines?|%|pour ?cent|personnes?|pieces?|m2|m²|h\b|heures?|e(?:me|r)?\b)/.test(apres)) continue;
      if (/(?:zone|le|dans le|en|\()\s*$/.test(avant) && valeur < 1000 && !/^\s*(?:de loyer|de revenu|de salaire)/.test(apres)) continue;
      // Année (« en 2026 », « smic 2027 »), sauf si un mot de montant suit (« 2000 net »)
      if (valeur >= 1990 && valeur <= 2099 && Number.isInteger(valeur) && !/^\s*(?:nets?|bruts?|de (?:loyer|salaire|revenus?|chomage)|par mois)\b/.test(apres)) continue;
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

type Role = "loyer" | "revenus" | "autres" | "brut" | "net";

/** Rôle d'un montant d'après le mot-clé le plus proche (dans la même portion de phrase) */
function roleMontant(t: string, m: Montant, tous: Montant[], simulateur: SimulateurId): Role | null {
  const indice = tous.indexOf(m);
  const borneAvant = indice > 0 ? tous[indice - 1].fin : 0;
  const borneApres = indice < tous.length - 1 ? tous[indice + 1].debut : t.length;
  const avant = t.slice(Math.max(borneAvant, m.debut - 35), m.debut);
  const apres = t.slice(m.fin, Math.min(borneApres, m.fin + 35));
  const cles: [Role, RegExp][] = [
    ["loyer", /\b(?:loyers?|loue|louer|location|studio|appartement|appart|chambre|maison|t1|t2|t3|t4|f1|f2|f3|f4)\b/g],
    ["autres", /\b(?:chomage|are|allocations? chomage|pensions?|retraite|indemnites?)\b/g],
    ["brut", /\bbruts?\b/g],
    ["net", /\bnets?\b/g],
    ["revenus", /\b(?:gagne|gagnons|gagnent|salaires?|revenus?|ressources|touche|touchons|percois|paye|payee|smic|paie)\b/g],
  ];
  let meilleur: { role: Role; distance: number } | null = null;
  for (const [role, motif] of cles) {
    for (const k of avant.matchAll(motif)) {
      const entre = avant.slice((k.index ?? 0) + k[0].length);
      // Un mot-clé séparé du montant par une ponctuation ou « et » se rapporte à autre chose
      const distance = entre.length + (/[,;.]|\bet\b/.test(entre) ? 30 : 0);
      if (!meilleur || distance < meilleur.distance) meilleur = { role, distance };
    }
    const k = new RegExp(motif.source).exec(apres);
    if (k) {
      // « 700 € de loyer », « 300 € de chômage » : le mot-clé qui suit l'emporte
      const distance = /^\s*(?:€|euros?)?\s*(?:de|d)\s*$/.test(apres.slice(0, k.index)) ? -1 : k.index;
      if (!meilleur || distance < meilleur.distance) meilleur = { role, distance };
    }
  }
  if (!meilleur) return null;
  if (simulateur !== "salaire" && (meilleur.role === "brut" || meilleur.role === "net")) return "revenus";
  if (simulateur === "salaire" && meilleur.role === "revenus") return null;
  return meilleur.role;
}

function extraireEnfants(t: string): number | undefined {
  if (/\b(?:sans|pas d|aucun|0|zero) (?:enfants?|gosses?)\b/.test(t)) return 0;
  const m = /\b(\d{1,2}|un|une|deux|trois|quatre|cinq|six|sept|huit|neuf|dix) (?:enfants?|gosses?|petits|bebes?|fils|filles)\b/.exec(t);
  if (m) return CHIFFRES[m[1]] ?? Number(m[1]);
  if (/\b(?:mon|ma|notre) (?:enfant|fils|fille|bebe)\b|\bun bebe\b/.test(t)) return 1;
  return undefined;
}

function extraireSituation(t: string): string | undefined {
  if (/\b(?:parent (?:isole|seul|solo)|famille monoparentale|monoparental|maman solo|papa solo|(?:mere|maman) (?:seule|celibataire|isolee|solo)|(?:pere|papa) (?:seul|celibataire|isole|solo)|seule? avec (?:mon|ma|mes|\d+|un|une|deux|trois|quatre) (?:enfants?|fils|filles?|bebes?|gosses?))\b/.test(t)) return "monoparental";
  if (/\b(?:en couple|couple|marie(?:e|s|es)?|pacse(?:e|s|es)?|concubins?|concubinage|mon (?:mari|conjoint|compagnon|copain|epoux)|ma (?:femme|conjointe|compagne|copine|epouse)|nous deux|a deux)\b/.test(t)) return "couple";
  if (/\b(?:seule?|celibataire|personne seule|isolee?|tout seul|toute seule|divorcee?|veuve?|separee?)\b/.test(t)) return "seul";
  return undefined;
}

function extraireZone(t: string, remarques: string[]): string | undefined {
  const m = /\bzone (1|2|3|i{1,3}|un|deux|trois)\b/.exec(t);
  if (m) {
    const n = { i: 1, ii: 2, iii: 3, un: 1, deux: 2, trois: 3 }[m[1] as "i"] ?? Number(m[1]);
    return `zone${n}`;
  }
  if (/\bmayotte\b/.test(t)) {
    remarques.push("Mayotte a ses propres règles d'aide au logement : ce cas n'est pas calculé.");
    return undefined;
  }
  if (/\b(?:outre mer|dom(?: tom)?|drom|reunion|guadeloupe|martinique|guyane)\b/.test(t)) return "dom";
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

function nomAffiche(nom: string): string {
  return nom.replace(/(^|\s)([a-z])/g, (_, a, b) => a + b.toUpperCase());
}

export interface OptionsAnalyse {
  /** Index des communes ; sans lui, la commune n'est pas cherchée (communeAChercher indique s'il faut le charger) */
  communes?: IndexCommunes;
}

export function analyserQuestion(question: string, options: OptionsAnalyse = {}): AnalyseQuestion {
  // Les tirets séparent les mots (« auto-entrepreneur », « touche-t-on »)
  const t = normaliser(question).replace(/-/g, " ").replace(/\s+/g, " ");
  const remarques: string[] = [];
  const simulateur = detecterSimulateur(t);
  const vide: AnalyseQuestion = { simulateur, extraits: {}, validation: null, commune: null, communeAChercher: false, remarques, chemin: null };
  if (!simulateur) return vide;

  const extraits: ParametresQuestion = {};
  const montants = extraireMontants(t);
  for (const m of montants) {
    let role = roleMontant(t, m, montants, simulateur);
    // Un seul montant, sans mot-clé : revenu d'activité pour la prime, brut pour le salaire
    if (!role && montants.length === 1 && simulateur === "prime-activite") role = "revenus";
    if (!role && montants.length === 1 && simulateur === "salaire") role = "brut";
    if (!role) continue;
    const mensuel = m.annuel ? Math.round((m.valeur / 12) * 100) / 100 : m.valeur;
    const cle: Record<SimulateurId, Partial<Record<Role, string>>> = {
      apl: { loyer: "loyer", revenus: "revenus", autres: "revenus" },
      rsa: { revenus: "revenus", autres: "revenus" },
      "prime-activite": { revenus: "salaire", autres: "autres" },
      salaire: { brut: "brut", net: "net" },
    };
    const c = cle[simulateur][role];
    if (!c) continue;
    // Plusieurs revenus (salaire + chômage) : on les additionne pour l'APL et le RSA
    if (extraits[c] !== undefined && c === "revenus") extraits[c] = Number(extraits[c]) + mensuel;
    else if (extraits[c] === undefined) extraits[c] = mensuel;
    if (m.annuel) remarques.push(`Montant annuel de ${m.valeur.toLocaleString("fr-FR")} € ramené à ${mensuel.toLocaleString("fr-FR")} € par mois.`);
  }

  // Revenus nuls, SMIC
  if (/\b(?:sans|pas de|aucun|0|zero) (?:revenus?|ressources?|salaires?)\b|\bje ne (?:gagne|touche) rien\b/.test(t)) {
    if (simulateur === "prime-activite") extraits.salaire ??= 0;
    else if (simulateur !== "salaire") extraits.revenus ??= 0;
  }
  if (/\bsmic\b/.test(t)) {
    const partiel = /\b(?:mi temps|temps partiel|a 50 ?%)\b/.test(t) ? 0.5 : 1;
    const net = Math.round(baremes.smic.mensuel_net_35h_estimation * partiel * 100) / 100;
    const brut = Math.round(baremes.smic.mensuel_brut_35h * partiel * 100) / 100;
    if (simulateur === "salaire") extraits.brut ??= brut;
    else if (simulateur === "prime-activite") extraits.salaire ??= net;
    else extraits.revenus ??= net;
    remarques.push(`SMIC ${partiel < 1 ? "à mi-temps " : ""}retenu : ${(simulateur === "salaire" ? brut : net).toLocaleString("fr-FR")} € ${simulateur === "salaire" ? "brut" : "net"} par mois.`);
  }

  if (simulateur !== "salaire") {
    const enfants = extraireEnfants(t);
    if (enfants !== undefined) extraits.enfants = enfants;
    const situation = extraireSituation(t);
    if (situation) extraits.situation = situation;
  }

  let commune: CommuneTrouvee | null = null;
  let communeAChercher = false;
  if (simulateur === "apl") {
    if (/\betudiante?s?\b/.test(t)) {
      remarques.push("Étudiant : la CAF retient un montant minimal de ressources. Le simulateur APL étudiant en tient compte.");
    }
    if (/\b(?:coloc|colocation|colocataires?)\b/.test(t)) extraits.logement = "colocation";
    else if (/\b(?:hlm|logement social|logement conventionne|office public)\b/.test(t)) extraits.logement = "hlm";
    const zone = extraireZone(t, remarques);
    if (zone) extraits.zone = zone;
    else if (!/mayotte/.test(t)) {
      if (options.communes) {
        commune = trouverCommune(normaliserNomCommune(t), options.communes);
        if (commune) {
          extraits.ville = nomAffiche(commune.nom);
          if (commune.zone === "M") remarques.push("Mayotte a ses propres règles d'aide au logement : ce cas n'est pas calculé.");
          else if (commune.zone === "D") extraits.zone = "dom";
          else if (commune.zone) extraits.zone = `zone${commune.zone}`;
          else remarques.push(`Plusieurs communes s'appellent ${nomAffiche(commune.nom)} : précisez la zone.`);
        } else if (/\bile de france\b/.test(t)) {
          remarques.push("L'Île-de-France compte des communes en zone 1, 2 et 3 : précisez la commune ou la zone.");
        }
      } else {
        communeAChercher = /\b(?:a|au|aux|sur|dans|vers|habite|commune de|ville de|pres de) [a-z]/.test(t);
      }
    }
  }

  if (simulateur === "rsa" || simulateur === "prime-activite") {
    const logement = extraireLogementAides(t);
    if (logement && !(simulateur === "prime-activite" && logement === "sans-abri")) extraits.logement = logement;
  }
  if (simulateur === "rsa") {
    if (/\b(?:chomage|demandeur d emploi|pole emploi|france travail|are)\b/.test(t)) extraits.activite = "chomage";
    else if (/\b(?:travaille|salarie(?:e)?|salaire|cdi|cdd|interim|gagne|temps partiel|mi temps)\b/.test(t)) extraits.activite = "actif";
    else if (/\b(?:sans emploi|sans activite|inactif|inactive|ne travaille pas|sans travail)\b/.test(t)) extraits.activite = "inactif";
  }
  if (simulateur === "prime-activite") {
    if (/\b(?:auto entrepreneur|autoentrepreneur|micro entrepreneur|micro entreprise|independant(?:e)?|freelance)\b/.test(t)) extraits.activite = "independant";
    else if (/\b(?:apprenti(?:e)?|apprentissage|alternance|alternant(?:e)?)\b/.test(t)) extraits.activite = "apprenti";
  }
  if (simulateur === "salaire") {
    if (/\bnon cadres?\b/.test(t)) extraits.statut = "non_cadre";
    else if (/\bcadres?\b/.test(t)) extraits.statut = "cadre";
    const pas = /\b(?:pas|prelevement a la source|taux d imposition|taux)\D{0,15}(\d{1,2}(?:[,.]\d{1,2})?) ?%/.exec(t);
    if (pas) extraits.pas = Number(pas[1].replace(",", "."));
    // « 1 800 € net en brut » : le brut est retrouvé avec le taux de cotisations du moteur
    if (extraits.brut === undefined && extraits.net !== undefined) {
      const taux = TAUX_SALARIAL[(extraits.statut as "cadre" | "non_cadre") || "non_cadre"];
      extraits.brut = Math.round((Number(extraits.net) / (1 - taux)) * 100) / 100;
      remarques.push(`Salaire brut retrouvé à partir de ${Number(extraits.net).toLocaleString("fr-FR")} € net.`);
    }
    delete extraits.net;
  }

  const validation = validerParametres(simulateur, extraits);
  return {
    simulateur,
    extraits,
    validation,
    commune,
    communeAChercher,
    remarques,
    chemin: cheminResultat(simulateur, validation.params),
  };
}
