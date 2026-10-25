/** Simulateurs d'aides du moteur de questions : APL, APL étudiant, RSA, prime d'activité, AAH, ASF */
import { calculerAPL, type Zone } from "../../aplCalculEngine";
import { calculerAPLEtudiant } from "../../aplEtudiantCalculEngine";
import { calculerRSA } from "../../rsaCalculEngine";
import { calculerPrimeActivite } from "../../primeActiviteCalculEngine";
import { calculerAAH } from "../../aahCalculEngine";
import { calculerASF } from "../../asfCalculEngine";
import {
  ENFANTS,
  LOGEMENT_AIDES,
  OUI_NON,
  RESUME_COMMUN,
  SITUATION,
  euros,
  eurosAuto,
  pluriel,
  type DefinitionSimulateur,
  type LienProche,
} from "../commun";
import { EXEMPLES_QUESTIONS } from "../exemples";

const plusUnEnfant = (p: Record<string, string | number>): LienProche => {
  const enfants = (Number(p.enfants) || 0) + 1;
  return { libelle: `Avec ${pluriel(enfants, "enfant")}`, params: { ...p, enfants, situation: p.situation === "seul" ? "monoparental" : p.situation } };
};

const zoneResume = (v: string | number, p: Record<string, string | number>) => {
  const zone = v === "dom" ? "outre-mer" : `zone ${String(v).replace("zone", "")}`;
  return p.ville ? `${p.ville} (${zone})` : zone;
};

export const APL: DefinitionSimulateur = {
  id: "apl",
  nom: "APL",
  titre: "Estimation de l'APL",
  chemin: "/pages/apl",
  exemple: EXEMPLES_QUESTIONS["apl"],
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
      principal: euros(d.apl_estimee),
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
    const liens: LienProche[] = [];
    if (loyer) {
      liens.push({ libelle: `Avec un loyer de ${euros(loyer + 100)}`, params: { ...p, loyer: loyer + 100 } });
      if (loyer > 150) liens.push({ libelle: `Avec un loyer de ${euros(loyer - 100)}`, params: { ...p, loyer: loyer - 100 } });
    }
    if (p.situation !== "seul") liens.push(plusUnEnfant(p));
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
  ordreResume: ["situation", "enfants"],
  resume: {
    ...RESUME_COMMUN,
    loyer: (v) => `loyer de ${euros(Number(v))}`,
    zone: zoneResume,
    logement: (v) => ({ colocation: "colocation", hlm: "logement social" })[v as "hlm"] ?? "",
  },
};

export const APL_ETUDIANT: DefinitionSimulateur = {
  id: "apl-etudiant",
  nom: "APL étudiant",
  titre: "Estimation de l'APL étudiant",
  chemin: "/pages/apl-etudiant",
  exemple: EXEMPLES_QUESTIONS["apl-etudiant"],
  champs: [
    { cle: "loyer", libelle: "Loyer mensuel hors charges", type: "nombre", min: 1, max: 5000, suffixe: "€ / mois" },
    { cle: "boursier", libelle: "Boursier sur critères sociaux", type: "choix", options: OUI_NON },
    {
      cle: "zone",
      libelle: "Zone du logement",
      type: "choix",
      options: [
        { valeur: "1", libelle: "Zone 1 (Paris et communes proches)" },
        { valeur: "2", libelle: "Zone 2 (grandes agglomérations)" },
        { valeur: "3", libelle: "Zone 3 (autres communes)" },
      ],
    },
    { cle: "revenus", libelle: "Revenus hors bourse", type: "nombre", defaut: 0, min: 0, max: 10000, suffixe: "€ / mois", aide: "job étudiant, aide des parents déclarée…" },
    {
      cle: "logement",
      libelle: "Type de logement",
      type: "choix",
      defaut: "classique",
      options: [
        { valeur: "classique", libelle: "Logement classique (studio, colocation, appartement)" },
        { valeur: "foyer", libelle: "Logement-foyer, résidence universitaire conventionnée" },
      ],
    },
    {
      cle: "horsue",
      libelle: "Nationalité hors Union européenne, EEE et Suisse",
      type: "choix",
      defaut: "non",
      options: OUI_NON,
    },
  ],
  calculer(p) {
    const r = calculerAPLEtudiant({
      situation: "seul",
      revenus: Number(p.revenus),
      chargesLocatives: Number(p.loyer),
      personnesCharge: 0,
      zone: String(p.zone) as "1" | "2" | "3",
      logement: p.logement as "classique" | "foyer",
      boursier: p.boursier === "oui",
      horsUE: p.horsue === "oui",
    });
    const d = r.details;
    return {
      principal: euros(r.montantEstime),
      montant: r.montantEstime,
      libelle: "APL étudiant estimée",
      unite: "par mois",
      phrase: r.eligible ? `Pour un loyer de ${euros(Number(p.loyer))}, l'APL étudiant estimée est de` : r.explication,
      details: r.eligible
        ? [
            { libelle: "Ressources retenues au minimum (forfait étudiant)", valeur: `${euros(d.ressourcesMaxi, 2)} par mois` },
            { libelle: "Loyer retenu", valeur: `${euros(d.loyerRetenu, 2)} (plafond ${euros(d.plafondLoyer, 2)})` },
            { libelle: "Part du loyer couverte", valeur: `${Math.round(d.pourcentageLoyer)} %` },
          ]
        : [],
      limites: ["Étudiant seul, sans personne à charge.", "Les bourses d'études ne sont pas comptées dans les ressources."],
    };
  },
  proches(p) {
    const loyer = Number(p.loyer) || 0;
    return [
      { libelle: p.boursier === "oui" ? "Même logement sans bourse" : "Même logement avec une bourse", params: { ...p, boursier: p.boursier === "oui" ? "non" : "oui" } },
      { libelle: `Avec un loyer de ${euros(loyer + 100)}`, params: { ...p, loyer: loyer + 100 } },
      { libelle: p.logement === "foyer" ? "En logement classique" : "En résidence universitaire", params: { ...p, logement: p.logement === "foyer" ? "classique" : "foyer" } },
    ];
  },
  pagesLiees: [
    { href: "/pages/apl-etudiant", libelle: "Simulateur APL étudiant complet" },
    { href: "/pages/apl", libelle: "Simulateur APL" },
  ],
  resume: {
    loyer: (v) => `loyer de ${euros(Number(v))}`,
    boursier: (v) => (v === "oui" ? "boursier" : "non boursier"),
    zone: (v, p) => (p.ville ? `${p.ville} (zone ${v})` : `zone ${v}`),
    revenus: (v) => (Number(v) > 0 ? `${euros(Number(v))} de revenus` : ""),
    logement: (v) => (v === "foyer" ? "résidence universitaire" : ""),
    horsue: (v) => (v === "oui" ? "hors Union européenne" : ""),
  },
};

export const RSA: DefinitionSimulateur = {
  id: "rsa",
  nom: "RSA",
  titre: "Estimation du RSA",
  chemin: "/pages/rsa",
  exemple: EXEMPLES_QUESTIONS["rsa"],
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
    { cle: "logement", libelle: "Logement", type: "choix", options: [...LOGEMENT_AIDES, { valeur: "sans-abri", libelle: "Sans logement stable" }] },
  ],
  calculer(p) {
    if (p.situation === "monoparental" && Number(p.enfants) < 1) return { erreur: "Un parent isolé a au moins un enfant à charge." };
    const r = calculerRSA({ situation: String(p.situation), enfants: Number(p.enfants), revenus: Number(p.revenus), logement: String(p.logement), activite: String(p.activite) });
    if (!r.success) return { erreur: r.explication };
    const d = r.details;
    return {
      principal: eurosAuto(r.montantEstime),
      montant: r.montantEstime,
      libelle: "RSA estimé",
      unite: "par mois",
      phrase: r.montantEstime > 0 ? `Pour ce foyer, avec ${euros(Number(p.revenus))} de revenus par mois, le RSA estimé est de` : "Avec ces ressources et ce logement, le RSA estimé est nul.",
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
    const liens: LienProche[] = [plusUnEnfant(p), { libelle: `Avec ${euros(revenus + 200)} de revenus`, params: { ...p, revenus: revenus + 200 } }];
    if (revenus >= 200) liens.push({ libelle: `Avec ${euros(revenus - 200)} de revenus`, params: { ...p, revenus: revenus - 200 } });
    if (p.situation !== "couple") liens.push({ libelle: "Pour un couple", params: { ...p, situation: "couple" } });
    return liens;
  },
  pagesLiees: [
    { href: "/pages/rsa", libelle: "Simulateur RSA complet" },
    { href: "/pages/rsa-apl-combines", libelle: "RSA et APL ensemble" },
    { href: "/pages/rsa-vs-smic", libelle: "RSA ou SMIC : ce qui reste" },
  ],
  resume: {
    ...RESUME_COMMUN,
    activite: (v) => ({ chomage: "demandeur d'emploi", inactif: "sans activité" })[v as "inactif"] ?? "",
  },
};

export const PRIME_ACTIVITE: DefinitionSimulateur = {
  id: "prime-activite",
  nom: "prime d'activité",
  titre: "Estimation de la prime d'activité",
  chemin: "/pages/prime-activite",
  exemple: EXEMPLES_QUESTIONS["prime-activite"],
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
      principal: eurosAuto(r.montantEstime),
      montant: r.montantEstime,
      libelle: "Prime d'activité estimée",
      unite: "par mois",
      phrase: r.montantEstime > 0 ? `Avec ${euros(Number(p.salaire))} de revenus d'activité nets par mois, la prime d'activité estimée est de` : r.explication,
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
    const liens: LienProche[] = [{ libelle: `Avec un salaire de ${euros(salaire + 200)}`, params: { ...p, salaire: salaire + 200 } }, plusUnEnfant(p)];
    if (salaire > 300) liens.push({ libelle: `Avec un salaire de ${euros(salaire - 200)}`, params: { ...p, salaire: salaire - 200 } });
    return liens;
  },
  pagesLiees: [
    { href: "/pages/prime-activite", libelle: "Simulateur prime d'activité complet" },
    { href: "/pages/aides/cumul-aides-rsa-apl-prime-activite", libelle: "Cumul RSA, APL et prime d'activité" },
  ],
  resume: {
    ...RESUME_COMMUN,
    salaire: (v) => `${euros(Number(v))} de salaire net`,
    autres: (v) => (Number(v) > 0 ? `${euros(Number(v))} d'autres revenus` : ""),
    activite: (v) => ({ independant: "indépendant", apprenti: "apprenti" })[v as "apprenti"] ?? "",
  },
};

export const AAH: DefinitionSimulateur = {
  id: "aah",
  nom: "AAH",
  titre: "Estimation de l'AAH",
  chemin: "/pages/aah",
  exemple: EXEMPLES_QUESTIONS["aah"],
  champs: [
    {
      cle: "taux",
      libelle: "Taux d'incapacité reconnu par la MDPH",
      type: "choix",
      options: [
        { valeur: "80", libelle: "80 % ou plus" },
        { valeur: "50", libelle: "Entre 50 % et 79 %" },
      ],
    },
    SITUATION,
    ENFANTS,
    {
      cle: "revenus",
      libelle: "Vos revenus personnels",
      type: "nombre",
      min: 0,
      max: 20000,
      suffixe: "€ / mois",
      aide: "depuis octobre 2023, les revenus du conjoint ne sont plus pris en compte",
    },
    {
      cle: "logement",
      libelle: "Logement",
      type: "choix",
      options: [
        { valeur: "locataire", libelle: "Locataire" },
        { valeur: "proprio", libelle: "Propriétaire" },
        { valeur: "heberge", libelle: "Hébergé" },
      ],
    },
  ],
  calculer(p) {
    const r = calculerAAH({ situation: String(p.situation), enfants: Number(p.enfants), tauxIncapacite: Number(p.taux), revenus: Number(p.revenus), logement: String(p.logement) });
    if (!r.success) return { erreur: r.explication };
    return {
      principal: eurosAuto(r.montantEstime),
      montant: r.montantEstime,
      libelle: "AAH estimée",
      unite: "par mois",
      phrase: r.montantEstime > 0 ? `Avec ${euros(Number(p.revenus))} de revenus par mois, l'AAH estimée est de` : r.explication,
      details: [
        { libelle: "Montant maximal", valeur: euros(r.details.montantBase, 2) },
        { libelle: "Revenus pris en compte", valeur: euros(r.details.revenusComptabilises, 2) },
      ],
      limites: [
        "Entre 50 % et 79 %, l'AAH suppose aussi une restriction substantielle et durable d'accès à l'emploi, reconnue par la MDPH.",
        "Abattements sur les revenus simplifiés : le simulateur complet détaille le calcul.",
      ],
    };
  },
  proches(p) {
    const revenus = Number(p.revenus) || 0;
    return [
      { libelle: `Avec ${euros(revenus + 200)} de revenus`, params: { ...p, revenus: revenus + 200 } },
      ...(revenus >= 200 ? [{ libelle: `Avec ${euros(revenus - 200)} de revenus`, params: { ...p, revenus: revenus - 200 } }] : []),
      { libelle: p.situation === "couple" ? "Pour une personne seule" : "Pour un couple", params: { ...p, situation: p.situation === "couple" ? "seul" : "couple" } },
    ];
  },
  pagesLiees: [{ href: "/pages/aah", libelle: "Simulateur AAH complet" }],
  ordreResume: ["taux", "situation", "enfants"],
  resume: {
    ...RESUME_COMMUN,
    taux: (v) => (v === "80" ? "taux de 80 % ou plus" : "taux entre 50 et 79 %"),
    logement: (v) => ({ locataire: "locataire", proprio: "propriétaire", heberge: "hébergé" })[v as "heberge"] ?? "",
  },
};

export const ASF: DefinitionSimulateur = {
  id: "asf",
  nom: "ASF",
  titre: "Estimation de l'allocation de soutien familial",
  chemin: "/pages/asf",
  exemple: EXEMPLES_QUESTIONS["asf"],
  champs: [
    {
      cle: "cas",
      libelle: "Situation de l'enfant",
      type: "choix",
      options: [
        { valeur: "parentisole", libelle: "Élevé par un seul parent (l'autre ne paie pas ou peu de pension)" },
        { valeur: "orphelin", libelle: "Orphelin d'un parent" },
        { valeur: "depourvu", libelle: "Privé de l'aide de ses deux parents (recueilli)" },
      ],
    },
    { cle: "enfants", libelle: "Enfants concernés", type: "nombre", min: 1, max: 10 },
  ],
  calculer(p) {
    const r = calculerASF({ situation: p.cas as "parentisole", nombreEnfants: Number(p.enfants), revenus: 0, enfantACharge: true });
    return {
      principal: eurosAuto(r.montantEstime),
      montant: r.montantEstime,
      libelle: "ASF estimée",
      unite: "par mois",
      phrase: `Pour ${pluriel(Number(p.enfants), "enfant")}, l'allocation de soutien familial est de`,
      details: [{ libelle: "Montant par enfant", valeur: euros(r.details.montantParEnfant, 2) }],
      limites: [
        "Pour un parent séparé, l'ASF est supprimée s'il vit en couple (service-public.gouv.fr, fiche F815).",
        "Si l'autre parent verse une pension inférieure au montant de l'ASF, seule la différence est versée : ce cas n'est pas calculé ici.",
      ],
    };
  },
  proches(p) {
    const n = Number(p.enfants) || 1;
    return [
      { libelle: `Pour ${pluriel(n + 1, "enfant")}`, params: { ...p, enfants: n + 1 } },
      ...(n > 1 ? [{ libelle: `Pour ${pluriel(n - 1, "enfant")}`, params: { ...p, enfants: n - 1 } }] : []),
    ];
  },
  pagesLiees: [{ href: "/pages/asf", libelle: "Simulateur ASF complet" }],
  resume: {
    cas: (v) => ({ parentisole: "parent seul", orphelin: "orphelin d'un parent", depourvu: "enfant recueilli" })[v as "orphelin"] ?? "",
    enfants: (v) => pluriel(Number(v), "enfant"),
  },
};
