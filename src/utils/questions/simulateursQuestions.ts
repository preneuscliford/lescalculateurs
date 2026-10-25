/**
 * Simulateurs utilisables par le moteur de questions : champs attendus, validation des paramètres,
 * et calcul par le moteur existant du site. Aucun montant ne vient de l'analyse de la question.
 *
 * Ce fichier sert de schéma unique :
 * - à l'analyseur de questions (src/utils/questions/analyseurQuestion.ts) ;
 * - aux pages de résultat /r/<simulateur> (paramètres lus dans l'URL) ;
 * - plus tard, à la validation de la réponse du service d'analyse côté serveur.
 */
import { calculerAPL, type Zone } from "../aplCalculEngine";
import { calculerRSA } from "../rsaCalculEngine";
import { calculerPrimeActivite } from "../primeActiviteCalculEngine";
import { calculerSalaire } from "../salaireCalculEngine";
import { baremes } from "../../data/baremes";

export type SimulateurId = "apl" | "rsa" | "prime-activite" | "salaire";
export const SIMULATEURS_IDS: SimulateurId[] = ["apl", "rsa", "prime-activite", "salaire"];

export interface OptionChamp {
  valeur: string;
  libelle: string;
}

export interface ChampQuestion {
  cle: string;
  libelle: string;
  type: "nombre" | "choix";
  options?: OptionChamp[];
  /** Valeur retenue si l'information manque (affichée comme hypothèse) ; sinon, l'information est demandée */
  defaut?: string | number;
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
  montant: number;
  /** « APL estimée », « Salaire net »… */
  libelle: string;
  unite: string;
  /** Phrase de résultat, sans le montant principal */
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
  calculer(p: ParametresQuestion): ResultatQuestion | { erreur: string };
  /** Variantes proches proposées en liens visibles */
  proches(p: ParametresQuestion): LienProche[];
  /** Pages indexées du site sur le même sujet */
  pagesLiees: { href: string; libelle: string }[];
}

const SITUATIONS: OptionChamp[] = [
  { valeur: "seul", libelle: "Personne seule" },
  { valeur: "couple", libelle: "Couple" },
  { valeur: "monoparental", libelle: "Parent isolé" },
];
const LOGEMENT_AIDES: OptionChamp[] = [
  { valeur: "aide_logement", libelle: "Locataire qui touche une aide au logement (APL)" },
  { valeur: "loue", libelle: "Locataire sans aide au logement" },
  { valeur: "proprio", libelle: "Propriétaire" },
  { valeur: "gratuit", libelle: "Logé gratuitement" },
];

const euros = (n: number, decimales = 0) =>
  `${n.toLocaleString("fr-FR", { minimumFractionDigits: decimales, maximumFractionDigits: decimales })} €`;
const libelleOption = (champ: ChampQuestion | undefined, valeur: unknown) =>
  champ?.options?.find((o) => o.valeur === String(valeur))?.libelle ?? String(valeur);

const ENFANTS: ChampQuestion = { cle: "enfants", libelle: "Enfants à charge", type: "nombre", defaut: 0, min: 0, max: 10 };
const SITUATION: ChampQuestion = { cle: "situation", libelle: "Situation familiale", type: "choix", options: SITUATIONS };

const APL: DefinitionSimulateur = {
  id: "apl",
  nom: "APL",
  titre: "Estimation de l'APL",
  chemin: "/pages/apl",
  champs: [
    { cle: "loyer", libelle: "Loyer mensuel hors charges", type: "nombre", min: 1, max: 10000, suffixe: "€ / mois" },
    {
      cle: "revenus",
      libelle: "Revenus nets du foyer",
      type: "nombre",
      min: 0,
      max: 100000,
      suffixe: "€ / mois",
      aide: "salaires, allocations chômage et pensions, en moyenne sur 12 mois",
    },
    SITUATION,
    ENFANTS,
    {
      cle: "zone",
      libelle: "Zone du logement",
      type: "choix",
      options: [
        { valeur: "zone1", libelle: "Zone 1 (Paris et communes proches)" },
        { valeur: "zone2", libelle: "Zone 2 (grandes agglomérations)" },
        { valeur: "zone3", libelle: "Zone 3 (autres communes)" },
        { valeur: "dom", libelle: "Outre-mer (hors Mayotte)" },
      ],
    },
    {
      cle: "logement",
      libelle: "Type de location",
      type: "choix",
      defaut: "location",
      options: [
        { valeur: "location", libelle: "Location" },
        { valeur: "colocation", libelle: "Colocation" },
        { valeur: "hlm", libelle: "Logement social conventionné (HLM)" },
      ],
    },
  ],
  calculer(p) {
    const r = calculerAPL({
      situation: p.situation as "seul" | "couple" | "monoparental",
      enfants: Number(p.enfants),
      revenus_mensuels: Number(p.revenus),
      loyer_mensuel: Number(p.loyer),
      region: p.zone as Zone,
      type_logement: p.logement as "location" | "colocation" | "hlm",
    });
    if (!r.success || !r.data) return { erreur: r.error || "Calcul impossible avec ces informations." };
    const d = r.data;
    return {
      montant: d.apl_estimee,
      libelle: "APL estimée",
      unite: "par mois",
      phrase:
        d.apl_estimee > 0
          ? `Avec ${euros(Number(p.loyer))} de loyer et ${euros(Number(p.revenus))} de revenus par mois, l'aide au logement estimée est de`
          : d.raison_zero || "Avec ces revenus et ce loyer, l'aide au logement calculée est nulle.",
      details: [
        { libelle: "Loyer retenu (plafond de la zone)", valeur: `${euros(d.loyer_pris_compte, 2)} sur ${euros(d.loyer_mensuel)}` },
        { libelle: "Forfait charges", valeur: euros(d.forfait_charges, 2) },
        { libelle: "Participation personnelle", valeur: euros(d.participation, 2) },
        { libelle: "Ressources annuelles retenues", valeur: euros(d.ressources_annuelles) },
        { libelle: "Reste à charge (loyer − APL)", valeur: euros(d.reste_charge, 2) },
      ],
      limites: [
        "Revenus assimilés à des salaires nets sur 12 mois, sans abattement particulier.",
        "Pas de réduction de loyer de solidarité en HLM.",
      ],
    };
  },
  proches(p) {
    const loyer = Number(p.loyer) || 0;
    const enfants = Number(p.enfants) || 0;
    const liens: LienProche[] = [];
    if (loyer) {
      liens.push({ libelle: `Avec un loyer de ${euros(loyer + 100)}`, params: { ...p, loyer: loyer + 100 } });
      if (loyer > 150) liens.push({ libelle: `Avec un loyer de ${euros(loyer - 100)}`, params: { ...p, loyer: loyer - 100 } });
    }
    if (p.situation !== "seul") liens.push({ libelle: `Avec ${enfants + 1} enfant${enfants + 1 > 1 ? "s" : ""}`, params: { ...p, enfants: enfants + 1 } });
    for (const z of ["zone1", "zone2", "zone3"].filter((z) => z !== p.zone)) {
      liens.push({ libelle: `Même situation en ${z.replace("zone", "zone ")}`, params: { ...p, zone: z, ville: "" } });
    }
    return liens;
  },
  pagesLiees: [
    { href: "/pages/apl", libelle: "Simulateur APL complet" },
    { href: "/pages/apl-zones", libelle: "Montant de l'APL en zone 1, 2 et 3" },
    { href: "/pages/combien-apl-loyer", libelle: "Combien d'APL selon le loyer" },
  ],
};

const RSA: DefinitionSimulateur = {
  id: "rsa",
  nom: "RSA",
  titre: "Estimation du RSA",
  chemin: "/pages/rsa",
  champs: [
    SITUATION,
    ENFANTS,
    { cle: "revenus", libelle: "Revenus du foyer", type: "nombre", min: 0, max: 20000, suffixe: "€ / mois" },
    {
      cle: "activite",
      libelle: "Activité",
      type: "choix",
      options: [
        { valeur: "actif", libelle: "Je travaille (revenus d'activité)" },
        { valeur: "chomage", libelle: "Demandeur d'emploi" },
        { valeur: "inactif", libelle: "Sans activité" },
      ],
    },
    {
      cle: "logement",
      libelle: "Logement",
      type: "choix",
      options: [...LOGEMENT_AIDES, { valeur: "sans-abri", libelle: "Sans logement stable" }],
    },
  ],
  calculer(p) {
    if (p.situation === "monoparental" && Number(p.enfants) < 1) return { erreur: "Un parent isolé a au moins un enfant à charge." };
    const r = calculerRSA({
      situation: String(p.situation),
      enfants: Number(p.enfants),
      revenus: Number(p.revenus),
      logement: String(p.logement),
      activite: String(p.activite),
    });
    if (!r.success) return { erreur: r.explication };
    const d = r.details;
    return {
      montant: r.montantEstime,
      libelle: "RSA estimé",
      unite: "par mois",
      phrase:
        r.montantEstime > 0
          ? `Pour ce foyer, avec ${euros(Number(p.revenus))} de revenus par mois, le RSA estimé est de`
          : "Avec ces ressources et ce logement, le RSA estimé est nul.",
      details: [
        { libelle: "Montant forfaitaire du foyer", valeur: euros(d.montantBase, 2) },
        { libelle: "Revenus déduits", valeur: euros(d.revenusPris, 2) },
        { libelle: "Forfait logement déduit", valeur: euros(d.forfaitLogement, 2) },
      ],
      limites: [
        "Pas de majoration pour parent isolé dans cette estimation de base.",
        "Les aides au logement elles-mêmes ne sont pas comptées dans les revenus : seul le forfait logement est déduit.",
      ],
    };
  },
  proches(p) {
    const revenus = Number(p.revenus) || 0;
    const enfants = Number(p.enfants) || 0;
    const liens: LienProche[] = [
      { libelle: `Avec ${enfants + 1} enfant${enfants + 1 > 1 ? "s" : ""}`, params: { ...p, enfants: enfants + 1, situation: p.situation === "seul" ? "monoparental" : p.situation } },
      { libelle: `Avec ${euros(revenus + 200)} de revenus`, params: { ...p, revenus: revenus + 200 } },
    ];
    if (revenus >= 200) liens.push({ libelle: `Avec ${euros(revenus - 200)} de revenus`, params: { ...p, revenus: revenus - 200 } });
    if (p.situation !== "couple") liens.push({ libelle: "Pour un couple", params: { ...p, situation: "couple" } });
    return liens;
  },
  pagesLiees: [
    { href: "/pages/rsa", libelle: "Simulateur RSA complet" },
    { href: "/pages/rsa-apl-combines", libelle: "RSA et APL ensemble" },
    { href: "/pages/rsa-vs-smic", libelle: "RSA ou SMIC : ce qui reste" },
  ],
};

const PRIME: DefinitionSimulateur = {
  id: "prime-activite",
  nom: "prime d'activité",
  titre: "Estimation de la prime d'activité",
  chemin: "/pages/prime-activite",
  champs: [
    { cle: "salaire", libelle: "Revenus d'activité nets", type: "nombre", min: 0, max: 20000, suffixe: "€ / mois" },
    SITUATION,
    ENFANTS,
    { cle: "autres", libelle: "Autres revenus du foyer", type: "nombre", defaut: 0, min: 0, max: 20000, suffixe: "€ / mois", aide: "chômage, pensions…" },
    { cle: "logement", libelle: "Logement", type: "choix", options: LOGEMENT_AIDES },
    {
      cle: "activite",
      libelle: "Activité",
      type: "choix",
      defaut: "salarie",
      options: [
        { valeur: "salarie", libelle: "Salarié" },
        { valeur: "independant", libelle: "Indépendant, auto-entrepreneur" },
        { valeur: "apprenti", libelle: "Apprenti" },
      ],
    },
  ],
  calculer(p) {
    if (p.situation === "monoparental" && Number(p.enfants) < 1) return { erreur: "Un parent isolé a au moins un enfant à charge." };
    const r = calculerPrimeActivite({
      situation: String(p.situation),
      enfants: Number(p.enfants),
      revenusProf: Number(p.salaire),
      autresRevenus: Number(p.autres),
      logement: String(p.logement),
      typeActivite: String(p.activite),
    });
    if (!r.success) return { erreur: r.explication };
    const d = r.details;
    return {
      montant: r.montantEstime,
      libelle: "Prime d'activité estimée",
      unite: "par mois",
      phrase:
        r.montantEstime > 0
          ? `Avec ${euros(Number(p.salaire))} de revenus d'activité nets par mois, la prime d'activité estimée est de`
          : r.explication,
      details: [
        { libelle: "Montant forfaitaire", valeur: euros(d.montantBase, 2) },
        { libelle: "Bonification individuelle", valeur: euros(d.bonification, 2) },
        { libelle: "Ressources prises en compte", valeur: euros(d.totalRevenusComptabilises, 2) },
        { libelle: "Forfait logement déduit", valeur: euros(d.forfaitLogement, 2) },
      ],
      limites: ["Revenus du conjoint non saisis : ajoutez-les dans le simulateur complet.", "Pas de majoration pour isolement."],
    };
  },
  proches(p) {
    const salaire = Number(p.salaire) || 0;
    const enfants = Number(p.enfants) || 0;
    const liens: LienProche[] = [
      { libelle: `Avec un salaire de ${euros(salaire + 200)}`, params: { ...p, salaire: salaire + 200 } },
      { libelle: `Avec ${enfants + 1} enfant${enfants + 1 > 1 ? "s" : ""}`, params: { ...p, enfants: enfants + 1, situation: p.situation === "seul" ? "monoparental" : p.situation } },
    ];
    if (salaire > 300) liens.push({ libelle: `Avec un salaire de ${euros(salaire - 200)}`, params: { ...p, salaire: salaire - 200 } });
    return liens;
  },
  pagesLiees: [
    { href: "/pages/prime-activite", libelle: "Simulateur prime d'activité complet" },
    { href: "/pages/aides/cumul-aides-rsa-apl-prime-activite", libelle: "Cumul RSA, APL et prime d'activité" },
  ],
};

const SALAIRE: DefinitionSimulateur = {
  id: "salaire",
  nom: "salaire",
  titre: "Salaire brut en net",
  chemin: "/pages/salaire",
  champs: [
    { cle: "brut", libelle: "Salaire brut mensuel", type: "nombre", min: 1, max: 100000, suffixe: "€ / mois" },
    {
      cle: "statut",
      libelle: "Statut",
      type: "choix",
      defaut: "non_cadre",
      options: [
        { valeur: "non_cadre", libelle: "Non-cadre" },
        { valeur: "cadre", libelle: "Cadre" },
      ],
    },
    { cle: "pas", libelle: "Taux de prélèvement à la source", type: "nombre", defaut: 0, min: 0, max: 60, suffixe: "%" },
  ],
  calculer(p) {
    try {
      const r = calculerSalaire({ brutMensuel: Number(p.brut), statut: p.statut as "cadre" | "non_cadre", tauxPAS: Number(p.pas) });
      return {
        montant: Math.round(r.netAvantImpot),
        libelle: "Salaire net avant impôt",
        unite: "par mois",
        phrase: `Pour ${euros(r.brut)} brut par mois (${libelleOption(SALAIRE.champs[1], r.statut).toLowerCase()}), le salaire net avant impôt est d'environ`,
        details: [
          { libelle: "Cotisations salariales", valeur: `${(r.tauxSalarial * 100).toLocaleString("fr-FR", { maximumFractionDigits: 2 })} %` },
          { libelle: "Net après prélèvement à la source", valeur: euros(r.netApresImpot) },
          { libelle: "Net annuel avant impôt", valeur: euros(r.netAvantImpotAnnuel) },
          { libelle: "Brut annuel", valeur: euros(r.brutAnnuel) },
        ],
        limites: ["Salaire sous le plafond de la Sécurité sociale, sans prime ni heure supplémentaire."],
      };
    } catch (e) {
      return { erreur: (e as Error).message };
    }
  },
  proches(p) {
    const brut = Number(p.brut) || 0;
    return [
      { libelle: `${euros(brut + 200)} brut en net`, params: { ...p, brut: brut + 200 } },
      ...(brut > 300 ? [{ libelle: `${euros(brut - 200)} brut en net`, params: { ...p, brut: brut - 200 } }] : []),
      { libelle: p.statut === "cadre" ? "Même salaire pour un non-cadre" : "Même salaire pour un cadre", params: { ...p, statut: p.statut === "cadre" ? "non_cadre" : "cadre" } },
      { libelle: `Le SMIC brut (${euros(baremes.smic.mensuel_brut_35h, 2)}) en net`, params: { ...p, brut: baremes.smic.mensuel_brut_35h } },
    ];
  },
  pagesLiees: [
    { href: "/pages/salaire", libelle: "Simulateur salaire brut net complet" },
    { href: "/pages/salaire-net-apres-impot", libelle: "Salaire net après impôt" },
  ],
};

export const SIMULATEURS: Record<SimulateurId, DefinitionSimulateur> = {
  apl: APL,
  rsa: RSA,
  "prime-activite": PRIME,
  salaire: SALAIRE,
};

/** Paramètres de contexte acceptés en plus des champs (affichage seulement) */
const CONTEXTE = ["ville"];

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
          valeur = champ.cle === "enfants" ? Math.floor(n) : Math.round(n * 100) / 100;
        }
      } else if (champ.options?.some((o) => o.valeur === String(v))) {
        valeur = String(v);
      }
    }
    if (valeur === undefined && champ.defaut !== undefined) {
      valeur = champ.defaut;
      hypotheses.push(champ.cle);
    }
    if (valeur === undefined) manquants.push(champ.cle);
    else params[champ.cle] = valeur;
  }
  // Un parent isolé a au moins un enfant ; une personne seule avec enfants est un parent isolé
  if (params.situation === "seul" && Number(params.enfants) > 0 && id !== "salaire") params.situation = "monoparental";
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

export { libelleOption, euros };
