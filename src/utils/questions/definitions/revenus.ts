/**
 * Simulateurs revenus et emploi du moteur de questions : salaire brut en net, impôt sur le revenu, ARE,
 * fin de droits au chômage, indemnité de licenciement, âge de départ à la retraite.
 */
import { calculerSalaire } from "../../salaireCalculEngine";
import { calculerIR } from "../../irCalculEngine";
import { calculerARE } from "../../areCalculEngine";
import { calculerFinDroits, type TypeRupture } from "../../finDroitsChomageCalculEngine";
import { calculerIndemniteLicenciement, formatAnciennete } from "../../indemniteLicenciementCalculEngine";
import { calculerAgeLegalRetraite, formatAge } from "../../retraiteCalculEngine";
import { baremes } from "../../../data/baremes";
import {
  ENFANTS,
  OUI_NON,
  RESUME_COMMUN,
  SITUATION,
  dateLongue,
  euros,
  eurosAuto,
  pluriel,
  type DefinitionSimulateur,
  type ParametresQuestion,
} from "../commun";
import { EXEMPLES_QUESTIONS } from "../exemples";

const MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
const pourcent = (x: number) => `${(x * 100).toLocaleString("fr-FR", { maximumFractionDigits: 2 })} %`;

export const SALAIRE: DefinitionSimulateur = {
  id: "salaire",
  nom: "salaire",
  titre: "Salaire brut en net",
  chemin: "/pages/salaire",
  exemple: EXEMPLES_QUESTIONS["salaire"],
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
        principal: euros(Math.round(r.netAvantImpot)),
        montant: Math.round(r.netAvantImpot),
        libelle: "Salaire net avant impôt",
        unite: "par mois",
        phrase: `Pour ${euros(r.brut)} brut par mois (${r.statut === "cadre" ? "cadre" : "non-cadre"}), le salaire net avant impôt est d'environ`,
        details: [
          { libelle: "Cotisations salariales", valeur: pourcent(r.tauxSalarial) },
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
  resume: {
    brut: (v) => `${euros(Number(v))} brut`,
    statut: (v) => (v === "cadre" ? "cadre" : "non-cadre"),
    pas: (v) => (Number(v) > 0 ? `prélèvement à la source de ${v} %` : ""),
  },
};

/**
 * Nombre de parts (CGI, art. 194) : 1 pour une personne seule, 2 pour un couple marié ou pacsé ;
 * une demi-part pour chacun des deux premiers enfants, une part à partir du troisième ;
 * une demi-part de plus pour un parent qui élève seul ses enfants (case T).
 */
export function nombreDeParts(situation: string, enfants: number): number {
  const n = Math.max(0, Math.floor(enfants));
  const enfantsParts = Math.min(n, 2) * 0.5 + Math.max(0, n - 2);
  return (situation === "couple" ? 2 : 1) + enfantsParts + (situation === "monoparental" && n > 0 ? 0.5 : 0);
}

export const IMPOT: DefinitionSimulateur = {
  id: "impot",
  nom: "impôt sur le revenu",
  titre: "Estimation de l'impôt sur le revenu",
  chemin: "/pages/impot",
  exemple: EXEMPLES_QUESTIONS["impot"],
  champs: [
    { cle: "revenu", libelle: "Revenu net imposable du foyer", type: "nombre", min: 0, max: 5000000, suffixe: "€ / an", aide: "montant de la déclaration de revenus, après la déduction de 10 % pour frais professionnels" },
    { ...SITUATION, libelle: "Situation fiscale", options: [
      { valeur: "seul", libelle: "Célibataire, divorcé ou veuf" },
      { valeur: "couple", libelle: "Marié ou pacsé" },
      { valeur: "monoparental", libelle: "Parent qui élève seul ses enfants" },
    ] },
    ENFANTS,
  ],
  calculer(p) {
    const parts = nombreDeParts(String(p.situation), Number(p.enfants));
    try {
      const r = calculerIR({ revenu: Number(p.revenu), parts, couple: p.situation === "couple", parentIsole: p.situation === "monoparental" });
      return {
        principal: euros(Math.round(r.impotNet)),
        montant: Math.round(r.impotNet),
        libelle: "Impôt sur le revenu estimé",
        unite: "par an",
        phrase: `Pour ${euros(Number(p.revenu))} de revenu net imposable et ${parts.toLocaleString("fr-FR")} part${parts > 1 ? "s" : ""}, l'impôt estimé est de`,
        details: [
          { libelle: "Nombre de parts", valeur: parts.toLocaleString("fr-FR") },
          { libelle: "Taux moyen", valeur: pourcent(r.tauxMoyen) },
          { libelle: "Taux marginal", valeur: pourcent(r.tauxMarginal) },
          { libelle: "Décote", valeur: euros(Math.round(r.decote)) },
          { libelle: "Soit par mois", valeur: euros(Math.round(r.mensualiteMoyenne)) },
        ],
        limites: ["Barème 2026 sur les revenus 2025, sans réduction ni crédit d'impôt.", "Pas de demi-part pour invalidité ou ancien combattant."],
      };
    } catch (e) {
      return { erreur: (e as Error).message };
    }
  },
  proches(p) {
    const revenu = Number(p.revenu) || 0;
    const enfants = Number(p.enfants) || 0;
    return [
      { libelle: `Avec ${euros(revenu + 5000)} de revenu`, params: { ...p, revenu: revenu + 5000 } },
      ...(revenu > 5000 ? [{ libelle: `Avec ${euros(revenu - 5000)} de revenu`, params: { ...p, revenu: revenu - 5000 } }] : []),
      { libelle: `Avec ${pluriel(enfants + 1, "enfant")}`, params: { ...p, enfants: enfants + 1, situation: p.situation === "seul" ? "monoparental" : p.situation } },
      ...(p.situation !== "couple" ? [{ libelle: "Pour un couple marié ou pacsé", params: { ...p, situation: "couple" } }] : []),
    ];
  },
  pagesLiees: [
    { href: "/pages/impot", libelle: "Simulateur impôt sur le revenu complet" },
    { href: "/pages/guide-complet-impot-revenu-2026", libelle: "Guide de l'impôt sur le revenu 2026" },
  ],
  ordreResume: ["situation", "enfants"],
  resume: {
    ...RESUME_COMMUN,
    situation: (v) => ({ seul: "célibataire", couple: "couple marié ou pacsé", monoparental: "parent isolé" })[v as "seul"] ?? "",
    revenu: (v) => `${euros(Number(v))} de revenu imposable`,
  },
};

export const ARE: DefinitionSimulateur = {
  id: "are",
  nom: "ARE",
  titre: "Estimation de l'allocation chômage (ARE)",
  chemin: "/pages/are",
  exemple: EXEMPLES_QUESTIONS["are"],
  champs: [
    { cle: "salaire", libelle: "Salaire brut mensuel moyen", type: "nombre", min: 1, max: 50000, suffixe: "€ / mois" },
    { cle: "age", libelle: "Âge à la fin du contrat", type: "nombre", min: 16, max: 70, suffixe: "ans" },
    { cle: "anciennete", libelle: "Mois travaillés sur les 2 dernières années (3 ans à partir de 55 ans)", type: "nombre", min: 0, max: 36, suffixe: "mois" },
    { cle: "rupture", libelle: "Fin de contrat par rupture conventionnelle", type: "choix", defaut: "non", options: OUI_NON },
  ],
  calculer(p) {
    const r = calculerARE({
      situation: "seul",
      ancienneteEmploi: Number(p.anciennete),
      salaireReferent: Number(p.salaire),
      personnesCharge: 0,
      agePersonne: Number(p.age),
      ruptureConventionnelle: p.rupture === "oui",
    });
    if (!r.eligible) return { erreur: r.explication };
    return {
      principal: euros(Math.round(r.montantEstime)),
      montant: Math.round(r.montantEstime),
      libelle: "Allocation chômage brute estimée",
      unite: "par mois",
      phrase: `Avec un salaire de ${euros(Number(p.salaire))} brut par mois, l'allocation chômage estimée est d'environ`,
      details: [
        { libelle: "Durée d'indemnisation maximale", valeur: `environ ${r.durationMax.toLocaleString("fr-FR")} mois` },
        { libelle: "Part du salaire journalier", valeur: pourcent(r.details.tauxRemplacement) },
      ],
      limites: [
        "Montant brut, avant les éventuelles retenues sociales.",
        "Salaire de référence supposé régulier, sans période non travaillée.",
      ],
    };
  },
  proches(p) {
    const salaire = Number(p.salaire) || 0;
    return [
      { libelle: `Avec ${euros(salaire + 300)} brut`, params: { ...p, salaire: salaire + 300 } },
      ...(salaire > 500 ? [{ libelle: `Avec ${euros(salaire - 300)} brut`, params: { ...p, salaire: salaire - 300 } }] : []),
      { libelle: "Après une rupture conventionnelle", params: { ...p, rupture: "oui" } },
    ];
  },
  pagesLiees: [
    { href: "/pages/are", libelle: "Simulateur ARE complet" },
    { href: "/pages/fin-de-droits-chomage", libelle: "Date de fin de droits au chômage" },
  ],
  resume: {
    salaire: (v) => `${euros(Number(v))} brut`,
    age: (v) => `${v} ans`,
    anciennete: (v) => `${v} mois travaillés`,
    rupture: (v) => (v === "oui" ? "rupture conventionnelle" : ""),
  },
};

const RUPTURES = [
  { valeur: "licenciement", libelle: "Licenciement" },
  { valeur: "licenciement-economique", libelle: "Licenciement économique" },
  { valeur: "fin-cdd", libelle: "Fin de CDD ou de mission d'intérim" },
  { valeur: "rupture-conventionnelle", libelle: "Rupture conventionnelle" },
  { valeur: "demission-legitime", libelle: "Démission considérée comme légitime" },
  { valeur: "demission", libelle: "Autre démission" },
];

export const FIN_DROITS: DefinitionSimulateur = {
  id: "fin-droits",
  nom: "fin de droits au chômage",
  titre: "Date de fin de droits au chômage",
  chemin: "/pages/fin-de-droits-chomage",
  exemple: EXEMPLES_QUESTIONS["fin-droits"],
  champs: [
    { cle: "fin", libelle: "Dernier jour du contrat", type: "date" },
    { cle: "inscription", libelle: "Date d'inscription à France Travail", type: "date" },
    { cle: "rupture", libelle: "Fin du contrat", type: "choix", options: RUPTURES },
    { cle: "salaire", libelle: "Salaire brut mensuel moyen", type: "nombre", min: 1, max: 50000, suffixe: "€ / mois" },
    { cle: "age", libelle: "Âge à la fin du contrat", type: "nombre", min: 16, max: 70, suffixe: "ans" },
    { cle: "debut", libelle: "Début du premier contrat des 2 dernières années (3 ans à partir de 55 ans)", type: "date" },
    { cle: "iccp", libelle: "Indemnité compensatrice de congés payés", type: "nombre", defaut: 0, min: 0, max: 100000, suffixe: "€" },
    { cle: "supra", libelle: "Indemnités de rupture au-delà du minimum légal", type: "nombre", defaut: 0, min: 0, max: 1000000, suffixe: "€" },
  ],
  calculer(p) {
    const r = calculerFinDroits({
      dateFinContrat: String(p.fin),
      dateInscription: String(p.inscription),
      agePersonne: Number(p.age),
      dateDebutPremierContrat: String(p.debut),
      typeRupture: p.rupture as TypeRupture,
      salaireMensuelBrut: Number(p.salaire),
      indemniteCongesPayes: Number(p.iccp),
      indemnitesSupraLegales: Number(p.supra),
    });
    if (!r.eligible || !r.dateFinDroits) return { erreur: r.message };
    return {
      principal: dateLongue(r.dateFinDroits),
      libelle: "Dernier jour indemnisé",
      phrase: "Si vous êtes indemnisé sans interruption, vos droits au chômage s'arrêtent le",
      details: [
        { libelle: "Premier jour indemnisé", valeur: dateLongue(r.premierJourIndemnise) },
        { libelle: "Durée d'indemnisation", valeur: `${r.dureeJours} jours` },
        { libelle: "Allocation journalière brute", valeur: euros(r.allocationJournaliere, 2) },
        ...(r.degressivite.applicable && r.degressivite.dateDebut
          ? [{ libelle: "Baisse de l'allocation (dégressivité)", valeur: `à partir du ${dateLongue(r.degressivite.dateDebut)}` }]
          : []),
      ],
      limites: [
        "Un arrêt maladie, une formation ou une reprise d'emploi repoussent cette date : le simulateur complet les prend en compte.",
        ...r.aVerifier,
      ],
    };
  },
  proches(p) {
    return [
      { libelle: "Après une rupture conventionnelle", params: { ...p, rupture: "rupture-conventionnelle" } },
      { libelle: "Après une fin de CDD", params: { ...p, rupture: "fin-cdd" } },
      { libelle: `À ${Number(p.age) + 15} ans`, params: { ...p, age: Math.min(70, Number(p.age) + 15) } },
    ];
  },
  pagesLiees: [
    { href: "/pages/fin-de-droits-chomage", libelle: "Simulateur fin de droits complet (arrêt maladie, reprise d'emploi)" },
    { href: "/pages/are", libelle: "Montant de l'allocation chômage" },
  ],
  ordreResume: ["rupture"],
  resume: {
    rupture: (v) => RUPTURES.find((r) => r.valeur === v)?.libelle.toLowerCase() ?? "",
    fin: (v) => `contrat terminé le ${dateLongue(String(v))}`,
    salaire: (v) => `${euros(Number(v))} brut`,
    age: (v) => `${v} ans`,
  },
};

export const LICENCIEMENT: DefinitionSimulateur = {
  id: "indemnite-licenciement",
  nom: "indemnité de licenciement",
  titre: "Indemnité légale de licenciement",
  chemin: "/pages/indemnite-licenciement",
  exemple: EXEMPLES_QUESTIONS["indemnite-licenciement"],
  champs: [
    { cle: "salaire", libelle: "Salaire brut mensuel moyen", type: "nombre", min: 1, max: 100000, suffixe: "€ / mois", aide: "moyenne des 12 ou des 3 derniers mois, la plus favorable" },
    { cle: "anciennete", libelle: "Ancienneté dans l'entreprise", type: "nombre", min: 0, max: 60, suffixe: "ans", aide: "par exemple 7,5 pour 7 ans et 6 mois" },
  ],
  calculer(p, aujourdhui) {
    const mois = Math.round(Number(p.anciennete) * 12);
    const sortie = new Date(`${aujourdhui}T00:00:00Z`);
    const entree = new Date(sortie.getTime());
    entree.setUTCMonth(entree.getUTCMonth() - mois);
    const r = calculerIndemniteLicenciement({ dateEntree: entree, dateSortie: sortie, salaireMensuelBrutMoyen: Number(p.salaire) });
    if (!r.eligible) return { erreur: "L'indemnité légale de licenciement suppose au moins 8 mois d'ancienneté ininterrompue." };
    return {
      principal: eurosAuto(r.montantTotal),
      montant: r.montantTotal,
      libelle: "Indemnité légale minimale",
      unite: "brut",
      phrase: `Pour ${formatAnciennete(r.ancienneteMois)} d'ancienneté et ${euros(Number(p.salaire))} brut par mois, l'indemnité légale est d'au moins`,
      details: [
        { libelle: "Part des 10 premières années (1/4 de mois par an)", valeur: euros(r.montantJusqua10Ans, 2) },
        { libelle: "Part au-delà de 10 ans (1/3 de mois par an)", valeur: euros(r.montantAuDela10Ans, 2) },
      ],
      limites: [
        "Minimum légal : la convention collective ou le contrat peuvent prévoir plus.",
        "Pas d'indemnité en cas de faute grave ou lourde.",
      ],
    };
  },
  proches(p) {
    const a = Number(p.anciennete) || 0;
    const s = Number(p.salaire) || 0;
    return [
      { libelle: `Avec ${pluriel(Math.floor(a) + 2, "an")} d'ancienneté`, params: { ...p, anciennete: Math.floor(a) + 2 } },
      { libelle: `Avec ${euros(s + 500)} brut`, params: { ...p, salaire: s + 500 } },
      ...(a < 10 ? [{ libelle: "Avec 12 ans d'ancienneté", params: { ...p, anciennete: 12 } }] : []),
    ];
  },
  pagesLiees: [
    { href: "/pages/indemnite-licenciement", libelle: "Simulateur indemnité de licenciement complet" },
    { href: "/pages/rupture-conventionnelle", libelle: "Rupture conventionnelle" },
  ],
  resume: {
    anciennete: (v) => `${Number(v).toLocaleString("fr-FR")} an${Number(v) >= 2 ? "s" : ""} d'ancienneté`,
    salaire: (v) => `${euros(Number(v))} brut`,
  },
};

export const RETRAITE: DefinitionSimulateur = {
  id: "retraite",
  nom: "retraite",
  titre: "Âge légal de départ à la retraite",
  chemin: "/pages/retraite",
  exemple: EXEMPLES_QUESTIONS["retraite"],
  champs: [
    { cle: "annee", libelle: "Année de naissance", type: "nombre", min: 1940, max: 2010 },
    { cle: "mois", libelle: "Mois de naissance", type: "choix", options: MOIS.map((m, i) => ({ valeur: String(i + 1), libelle: m[0].toUpperCase() + m.slice(1) })) },
    { cle: "trimestres", libelle: "Trimestres déjà validés", type: "nombre", optionnel: true, min: 0, max: 250, aide: "facultatif, voir le relevé de carrière sur info-retraite.fr" },
  ],
  calculer(p) {
    const naissance = new Date(Date.UTC(Number(p.annee), Number(p.mois) - 1, 1));
    const r = calculerAgeLegalRetraite({ dateNaissance: naissance, trimestresValides: p.trimestres === undefined ? null : Number(p.trimestres) });
    const mois = (d: Date) => `${MOIS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
    return {
      principal: formatAge(r.ageLegalYears, r.ageLegalMonths),
      libelle: "Âge légal de départ",
      phrase: `Né en ${MOIS[Number(p.mois) - 1]} ${p.annee}, vous pouvez partir à la retraite à partir de`,
      details: [
        { libelle: "Âge légal atteint en", valeur: mois(r.dateAgeLegal) },
        { libelle: "Trimestres pour le taux plein", valeur: `${r.trimestresRequis} trimestres` },
        ...(r.trimestresManquants !== null ? [{ libelle: "Trimestres manquants", valeur: String(r.trimestresManquants) }] : []),
        { libelle: "Taux plein automatique (67 ans) en", valeur: mois(r.dateTauxPleinAutomatique) },
      ],
      limites: ["Hors carrière longue, handicap et métiers à départ anticipé.", "Âge légal : partir à cet âge ne garantit pas le taux plein."],
    };
  },
  proches(p) {
    const a = Number(p.annee);
    return [
      { libelle: `Né en ${MOIS[Number(p.mois) - 1]} ${a + 1}`, params: { ...p, annee: a + 1 } },
      { libelle: `Né en ${MOIS[Number(p.mois) - 1]} ${a - 1}`, params: { ...p, annee: a - 1 } },
    ];
  },
  pagesLiees: [{ href: "/pages/retraite", libelle: "Simulateur âge de départ à la retraite complet" }],
  ordreResume: ["mois", "annee"],
  resume: {
    mois: (v, p: ParametresQuestion) => `né en ${MOIS[Number(v) - 1]} ${p.annee ?? ""}`.trim(),
    trimestres: (v) => `${v} trimestres validés`,
  },
};
