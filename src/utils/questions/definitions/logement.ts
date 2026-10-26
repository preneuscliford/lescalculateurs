/** Simulateurs logement du moteur de questions : frais de notaire, PTZ, DPE et location, dépôt de garantie */
import { calculerNotaire, type TypeBienNotaire } from "../../notaireCalculEngine";
import { verifierEligibilitePTZ, type ZonePTZ } from "../../ptzEligibiliteCalculEngine";
import { calculerDpeLocation, type ClasseDpe, type TypeBail } from "../../dpeLocationCalculEngine";
import { calculerDepotGarantie, type TypeLocation } from "../../depotGarantieCalculEngine";
import departements from "../../../data/departements.json";
import { OUI_NON, dateLongue, euros, eurosAuto, pluriel, type DefinitionSimulateur, type OptionChamp } from "../commun";
import { EXEMPLES_QUESTIONS } from "../exemples";

/** Départements du barème des frais de notaire (hors entrées techniques) */
export const DEPARTEMENTS: OptionChamp[] = Object.entries(departements as Record<string, { nom?: string }>)
  .filter(([code, d]) => /^(\d{2}|2A|2B|97\d)$/.test(code) && code !== "20" && d.nom)
  .sort(([a], [b]) => a.localeCompare(b, "fr", { numeric: true }))
  .map(([code, d]) => ({ valeur: code, libelle: `${code} – ${d.nom}` }));

const nomDepartement = (code: string | number) => DEPARTEMENTS.find((d) => d.valeur === String(code))?.libelle.split(" – ")[1] ?? String(code);

export const NOTAIRE: DefinitionSimulateur = {
  id: "notaire",
  nom: "frais de notaire",
  titre: "Estimation des frais de notaire",
  chemin: "/pages/notaire",
  exemple: EXEMPLES_QUESTIONS["notaire"],
  champs: [
    { cle: "prix", libelle: "Prix d'achat", type: "nombre", min: 1000, max: 50000000, suffixe: "€" },
    {
      cle: "bien",
      libelle: "Type de bien",
      type: "choix",
      options: [
        { valeur: "ancien", libelle: "Logement ancien" },
        { valeur: "neuf", libelle: "Logement neuf (moins de 5 ans, première vente)" },
        { valeur: "terrain", libelle: "Terrain à bâtir" },
      ],
    },
    { cle: "departement", libelle: "Département du bien", type: "choix", options: DEPARTEMENTS },
    { cle: "primo", libelle: "Primo-accédant (pas propriétaire de sa résidence principale depuis 2 ans) achetant sa résidence principale", type: "choix", defaut: "non", options: OUI_NON },
  ],
  calculer(p) {
    const r = calculerNotaire({ prixAchat: Number(p.prix), typeBien: p.bien as TypeBienNotaire, departement: String(p.departement), primoAccedant: p.primo === "oui" });
    if (!r.success) return { erreur: "Calcul impossible avec ces informations." };
    return {
      principal: euros(Math.round(r.total)),
      montant: Math.round(r.total),
      libelle: "Frais de notaire estimés",
      unite: `soit ${r.pourcentage.toLocaleString("fr-FR", { maximumFractionDigits: 2 })} % du prix`,
      phrase: `Pour un achat à ${euros(Number(p.prix))} (${p.bien === "neuf" ? "neuf" : p.bien === "terrain" ? "terrain" : "ancien"}, ${nomDepartement(p.departement)}), les frais de notaire sont d'environ`,
      details: [
        { libelle: "Droits de mutation (impôts)", valeur: euros(r.droitsEnregistrement, 2) },
        { libelle: "Émoluments du notaire", valeur: euros(r.emoluments, 2) },
        ...(r.tva > 0 ? [{ libelle: "TVA sur les émoluments", valeur: euros(r.tva, 2) }] : []),
        { libelle: "Débours et formalités", valeur: euros(r.debours + r.formalites, 2) },
        { libelle: "Contribution de sécurité immobilière", valeur: euros(r.csi, 2) },
      ],
      limites: ["Sans prêt immobilier : les frais de garantie du prêt ne sont pas comptés.", "Sans déduction du mobilier vendu avec le bien."],
    };
  },
  proches(p) {
    const prix = Number(p.prix) || 0;
    return [
      { libelle: `Pour ${euros(prix + 50000)}`, params: { ...p, prix: prix + 50000 } },
      ...(prix > 60000 ? [{ libelle: `Pour ${euros(prix - 50000)}`, params: { ...p, prix: prix - 50000 } }] : []),
      { libelle: p.bien === "neuf" ? "Même prix dans l'ancien" : "Même prix dans le neuf", params: { ...p, bien: p.bien === "neuf" ? "ancien" : "neuf" } },
      ...(p.primo !== "oui" ? [{ libelle: "Pour un primo-accédant", params: { ...p, primo: "oui" } }] : []),
    ];
  },
  pagesLiees: [
    { href: "/pages/notaire", libelle: "Simulateur frais de notaire complet (prêt, mobilier)" },
    { href: "/pages/comment-calculer-frais-notaire", libelle: "Comment sont calculés les frais de notaire" },
  ],
  resume: {
    prix: (v) => `achat à ${euros(Number(v))}`,
    bien: (v) => ({ ancien: "ancien", neuf: "neuf", terrain: "terrain" })[v as "neuf"] ?? "",
    departement: (v, p) => (p.ville ? `${p.ville} (${v})` : nomDepartement(v)),
    primo: (v) => (v === "oui" ? "primo-accédant" : ""),
  },
};

export const PTZ: DefinitionSimulateur = {
  id: "ptz",
  nom: "PTZ",
  titre: "Éligibilité au prêt à taux zéro (PTZ)",
  chemin: "/pages/ptz",
  exemple: EXEMPLES_QUESTIONS["ptz"],
  champs: [
    {
      cle: "zone",
      libelle: "Zone PTZ de la commune",
      type: "choix",
      options: [
        { valeur: "A", libelle: "Zone A ou A bis" },
        { valeur: "B1", libelle: "Zone B1" },
        { valeur: "B2", libelle: "Zone B2" },
        { valeur: "C", libelle: "Zone C" },
      ],
      aide: "zonage A, B1, B2, C du logement (différent des zones de l'APL)",
    },
    { cle: "personnes", libelle: "Personnes qui vivront dans le logement", type: "nombre", min: 1, max: 12 },
    { cle: "rfr", libelle: "Revenu fiscal de référence du foyer", type: "nombre", min: 0, max: 1000000, suffixe: "€ / an", aide: "avis d'impôt de l'avant-dernière année" },
  ],
  calculer(p) {
    const r = verifierEligibilitePTZ({ zone: p.zone as ZonePTZ, nombrePersonnes: Number(p.personnes), revenuFiscalReference: Number(p.rfr) });
    return {
      principal: r.eligible ? "Éligible" : "Non éligible",
      libelle: "au plafond de ressources du PTZ",
      phrase: `En zone ${p.zone}, pour ${pluriel(Number(p.personnes), "personne")} et ${euros(Number(p.rfr))} de revenu fiscal de référence :`,
      details: [
        { libelle: "Plafond de ressources", valeur: euros(r.plafondApplicable) },
        { libelle: r.ecart >= 0 ? "Marge sous le plafond" : "Dépassement du plafond", valeur: euros(Math.abs(r.ecart)) },
      ],
      limites: [
        "Seul le plafond de ressources est vérifié : le montant du prêt et les conditions sur le logement ne sont pas calculés.",
        "Le PTZ est réservé à l'achat d'une première résidence principale.",
      ],
    };
  },
  proches(p) {
    const n = Number(p.personnes) || 1;
    return [
      { libelle: `À ${pluriel(n + 1, "personne")}`, params: { ...p, personnes: n + 1 } },
      ...["A", "B1", "B2", "C"].filter((z) => z !== p.zone).map((z) => ({ libelle: `En zone ${z}`, params: { ...p, zone: z } })),
    ];
  },
  pagesLiees: [{ href: "/pages/ptz", libelle: "Simulateur PTZ complet" }],
  resume: {
    zone: (v) => `zone ${v}`,
    personnes: (v) => pluriel(Number(v), "personne"),
    rfr: (v) => `${euros(Number(v))} de revenu fiscal`,
  },
};

const CLASSES: OptionChamp[] = [
  { valeur: "G+", libelle: "G, plus de 450 kWh d'énergie finale par m² et par an" },
  ...["G", "F", "E", "D", "C", "B", "A"].map((c) => ({ valeur: c, libelle: c })),
];
const BAUX: OptionChamp[] = [
  { valeur: "aucun", libelle: "Pas de bail en cours" },
  { valeur: "vide-particulier", libelle: "Location vide, bailleur particulier (3 ans)" },
  { valeur: "vide-societe", libelle: "Location vide, bailleur société (6 ans)" },
  { valeur: "meuble", libelle: "Location meublée (1 an)" },
  { valeur: "meuble-etudiant", libelle: "Meublé étudiant (9 mois)" },
  { valeur: "mobilite", libelle: "Bail mobilité" },
];

export const DPE: DefinitionSimulateur = {
  id: "dpe-location",
  nom: "DPE et location",
  titre: "DPE : jusqu'à quand le logement est-il louable ?",
  chemin: "/pages/dpe-location",
  exemple: EXEMPLES_QUESTIONS["dpe-location"],
  champs: [
    { cle: "classe", libelle: "Classe énergétique (DPE)", type: "choix", options: CLASSES },
    { cle: "bail", libelle: "Bail en cours", type: "choix", defaut: "aucun", options: BAUX },
    { cle: "debut", libelle: "Date de début du bail en cours", type: "date", optionnel: true },
    { cle: "outremer", libelle: "Logement en outre-mer", type: "choix", defaut: "non", options: OUI_NON },
  ],
  calculer(p, aujourdhui) {
    if (p.bail !== "aucun" && !p.debut) return { erreur: "Indiquez la date de début du bail en cours." };
    const r = calculerDpeLocation({
      classe: p.classe as ClasseDpe,
      outreMer: p.outremer === "oui",
      typeBail: p.bail === "aucun" ? undefined : (p.bail as TypeBail),
      dateDebutBail: p.debut ? String(p.debut) : undefined,
      dateReference: aujourdhui,
    });
    if (r.aVerifier.length) return { erreur: `${r.message} ${r.aVerifier.join(" ")}` };
    const details = [
      { libelle: "Loyer", valeur: r.loyerGele ? "gelé (pas de hausse)" : "hausse possible (révision selon l'IRL)" },
    ];
    if (r.echeanceConcernee) {
      details.unshift(
        r.echeanceDepassee
          ? { libelle: "Échéance du bail déjà passée", valeur: dateLongue(r.echeanceConcernee) }
          : { libelle: r.bailSansReconduction ? "Le bail s'arrête à son terme le" : "Le bail en cours peut continuer jusqu'au", valeur: dateLongue(r.bailEnCoursJusquAu) },
      );
    }
    return {
      principal: r.dateInterdiction ? dateLongue(r.dateInterdiction) : "Aucune interdiction",
      libelle: r.dateInterdiction ? (r.nouveauBailPossible ? "plus de nouveau bail à partir de cette date" : "nouveau bail interdit depuis cette date") : "prévue pour les classes A à D",
      phrase: r.message,
      details,
      limites: ["Logement loué en résidence principale, avec un DPE en cours de validité."],
    };
  },
  proches(p) {
    return ["G", "F", "E"].filter((c) => c !== p.classe).map((c) => ({ libelle: `Même bail en classe ${c}`, params: { ...p, classe: c } }));
  },
  pagesLiees: [{ href: "/pages/dpe-location", libelle: "Calculateur DPE et location complet" }],
  resume: {
    classe: (v) => `classe ${v}`,
    bail: (v) => (v === "aucun" ? "" : BAUX.find((b) => b.valeur === v)?.libelle.toLowerCase().replace(/ \(.*\)$/, "") ?? ""),
    debut: (v) => `depuis le ${dateLongue(String(v))}`,
    outremer: (v) => (v === "oui" ? "outre-mer" : ""),
  },
};

export const DEPOT: DefinitionSimulateur = {
  id: "depot-garantie",
  nom: "dépôt de garantie",
  titre: "Dépôt de garantie : date limite et pénalité",
  chemin: "/pages/depot-de-garantie",
  exemple: EXEMPLES_QUESTIONS["depot-garantie"],
  champs: [
    {
      cle: "type",
      libelle: "Type de location",
      type: "choix",
      defaut: "vide",
      options: [
        { valeur: "vide", libelle: "Location vide" },
        { valeur: "meuble", libelle: "Location meublée" },
        { valeur: "mobilite", libelle: "Bail mobilité" },
      ],
    },
    { cle: "loyer", libelle: "Loyer mensuel hors charges", type: "nombre", min: 1, max: 20000, suffixe: "€" },
    { cle: "depot", libelle: "Dépôt de garantie versé", type: "nombre", min: 0, max: 50000, suffixe: "€" },
    { cle: "cles", libelle: "Date de remise des clés", type: "date" },
    { cle: "conforme", libelle: "État des lieux de sortie identique à celui d'entrée", type: "choix", options: OUI_NON },
    { cle: "rendu", libelle: "Date de restitution du dépôt", type: "date", optionnel: true, aide: "laisser vide s'il n'est pas encore rendu" },
    { cle: "adresse", libelle: "Nouvelle adresse donnée lors de la remise des clés", type: "choix", options: OUI_NON },
  ],
  calculer(p, aujourdhui) {
    const r = calculerDepotGarantie({
      typeLocation: p.type as TypeLocation,
      loyerHorsCharges: Number(p.loyer),
      depotVerse: Number(p.depot),
      dateRemiseCles: String(p.cles),
      etatDesLieuxConforme: p.conforme === "oui",
      dateReference: p.rendu ? String(p.rendu) : aujourdhui,
      nouvelleAdresseCommuniquee: p.adresse === "oui",
    });
    if (!r.valide || !r.dateLimite) return { erreur: r.message };
    const total = Number(p.depot) + r.penalite;
    return {
      principal: dateLongue(r.dateLimite),
      libelle: "date limite de restitution",
      phrase: `Avec un état des lieux ${p.conforme === "oui" ? "conforme" : "différent de celui d'entrée"}, le dépôt doit être rendu au plus tard le`,
      details: [
        { libelle: "Situation", valeur: r.message },
        { libelle: "Mois de retard commencés", valeur: String(r.moisDeRetard) },
        { libelle: "Pénalité de retard", valeur: euros(r.penalite, 2) },
        { libelle: "Total à rendre", valeur: eurosAuto(total) },
        ...(r.depotExcessif ? [{ libelle: "Dépôt supérieur au maximum légal", valeur: euros(r.depotMaximal, 2) }] : []),
      ],
      limites: [
        p.rendu ? "Calcul à la date de restitution indiquée." : `Dépôt pas encore rendu : calcul au ${dateLongue(aujourdhui)}.`,
        "Le propriétaire peut retenir les sommes dues (loyers, réparations) s'il les justifie.",
      ],
    };
  },
  proches(p) {
    return [
      { libelle: p.conforme === "oui" ? "Si l'état des lieux de sortie est différent" : "Si l'état des lieux de sortie est conforme", params: { ...p, conforme: p.conforme === "oui" ? "non" : "oui" } },
      { libelle: p.type === "meuble" ? "Pour une location vide" : "Pour une location meublée", params: { ...p, type: p.type === "meuble" ? "vide" : "meuble" } },
    ];
  },
  pagesLiees: [{ href: "/pages/depot-de-garantie", libelle: "Calculateur dépôt de garantie complet" }],
  resume: {
    depot: (v) => `dépôt de ${euros(Number(v))}`,
    cles: (v) => `clés rendues le ${dateLongue(String(v))}`,
    conforme: (v) => (v === "oui" ? "état des lieux conforme" : "état des lieux différent"),
  },
};
