/**
 * Dépôt de garantie : montant maximal, date limite de restitution, pénalité de retard.
 *
 * Règles (src/data/logement-baremes.ts, service-public.gouv.fr F31269) :
 * - restitution au plus tard 1 mois après la remise des clés si l'état des lieux de sortie est
 *   conforme à celui d'entrée, 2 mois sinon ;
 * - en cas de retard, le montant à rendre est augmenté de 10 % du loyer mensuel hors charges pour
 *   chaque mois de retard commencé (exemple de la fiche : dépôt de 90 €, loyer de 120 €, 5 mois de
 *   retard → 60 € de pénalité, 150 € à rendre), sauf si le locataire n'a pas indiqué sa nouvelle
 *   adresse lors de la remise des clés ;
 * - dépôt plafonné à 1 mois de loyer hors charges (vide), 2 mois (meublé), interdit en bail mobilité ;
 * - copropriété : provision de 20 % du dépôt au plus jusqu'à l'approbation des comptes annuels.
 */
import { logementBaremes } from "../data/logement-baremes";

const D = logementBaremes.depotGarantie;

export type TypeLocation = "vide" | "meuble" | "mobilite";

export interface DepotGarantieData {
  typeLocation: TypeLocation;
  /** Loyer mensuel hors charges */
  loyerHorsCharges: number;
  /** Dépôt de garantie versé */
  depotVerse: number;
  /** Date de remise des clés (AAAA-MM-JJ) */
  dateRemiseCles: string;
  /** État des lieux de sortie conforme à celui d'entrée */
  etatDesLieuxConforme: boolean;
  /** Date à laquelle le dépôt a été rendu, ou date du jour s'il ne l'est pas encore (AAAA-MM-JJ) */
  dateReference: string;
  /** Nouvelle adresse communiquée lors de la remise des clés */
  nouvelleAdresseCommuniquee: boolean;
  /** Logement en copropriété */
  copropriete?: boolean;
}

export interface DepotGarantieResult {
  valide: boolean;
  message: string;
  /** Montant maximal légal du dépôt */
  depotMaximal: number;
  depotExcessif: boolean;
  /** Dernier jour pour rendre le dépôt (AAAA-MM-JJ) */
  dateLimite: string | null;
  delaiMois: number;
  moisDeRetard: number;
  penaliteParMois: number;
  penalite: number;
  penaliteApplicable: boolean;
  /** Provision maximale que le bailleur peut garder en copropriété */
  provisionCoproprieteMax: number | null;
  /** Date limite pour saisir le juge (AAAA-MM-JJ) */
  dateLimiteJuge: string | null;
}

const arrondi = (n: number) => Math.round(n * 100) / 100;

function versDate(iso: string): Date {
  const [a, m, j] = String(iso).split("-").map(Number);
  return new Date(Date.UTC(a, (m || 1) - 1, j || 1));
}
const versIso = (d: Date) => d.toISOString().slice(0, 10);
const dateValide = (iso: string) => /^\d{4}-\d{2}-\d{2}$/.test(String(iso)) && !isNaN(versDate(iso).getTime());

/** Ajoute des mois en restant sur le dernier jour du mois si besoin (31 janvier + 1 mois = 28/29 février) */
function ajouterMois(d: Date, n: number): Date {
  const cible = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + n, 1));
  const dernierJour = new Date(Date.UTC(cible.getUTCFullYear(), cible.getUTCMonth() + 1, 0)).getUTCDate();
  cible.setUTCDate(Math.min(d.getUTCDate(), dernierJour));
  return cible;
}

/** Nombre de mois de retard commencés entre la date limite et la date de référence */
export function moisDeRetardCommences(dateLimite: Date, dateReference: Date): number {
  if (dateReference <= dateLimite) return 0;
  let n = 1;
  while (ajouterMois(dateLimite, n) < dateReference) n++;
  return n;
}

export function calculerDepotGarantie(data: DepotGarantieData): DepotGarantieResult {
  const loyer = Math.max(0, Number(data.loyerHorsCharges) || 0);
  const depot = Math.max(0, Number(data.depotVerse) || 0);
  const depotMaximal = arrondi(loyer * D.maxMoisLoyer[data.typeLocation]);
  const vide: DepotGarantieResult = {
    valide: false,
    message: "",
    depotMaximal,
    depotExcessif: depot > depotMaximal,
    dateLimite: null,
    delaiMois: 0,
    moisDeRetard: 0,
    penaliteParMois: 0,
    penalite: 0,
    penaliteApplicable: false,
    provisionCoproprieteMax: null,
    dateLimiteJuge: null,
  };

  if (data.typeLocation === "mobilite") {
    return { ...vide, message: "En bail mobilité, le propriétaire ne peut pas demander de dépôt de garantie : la somme versée doit être rendue." };
  }
  if (!dateValide(data.dateRemiseCles) || !dateValide(data.dateReference)) {
    return { ...vide, message: "Indiquez la date de remise des clés et la date du jour ou de restitution." };
  }

  const remise = versDate(data.dateRemiseCles);
  const reference = versDate(data.dateReference);
  const delaiMois = data.etatDesLieuxConforme ? D.delaiMois.conforme : D.delaiMois.nonConforme;
  const limite = ajouterMois(remise, delaiMois);
  const moisDeRetard = moisDeRetardCommences(limite, reference);
  const penaliteParMois = arrondi(loyer * D.penaliteParMoisCommence);
  const penaliteApplicable = moisDeRetard > 0 && data.nouvelleAdresseCommuniquee;

  return {
    valide: true,
    message: moisDeRetard === 0
      ? "Le délai de restitution n'est pas dépassé."
      : penaliteApplicable
        ? `Le délai est dépassé : ${moisDeRetard} mois de retard commencé(s).`
        : "Le délai est dépassé, mais la pénalité ne s'applique pas si vous n'avez pas indiqué votre nouvelle adresse lors de la remise des clés.",
    depotMaximal,
    depotExcessif: depot > depotMaximal,
    dateLimite: versIso(limite),
    delaiMois,
    moisDeRetard,
    penaliteParMois,
    penalite: penaliteApplicable ? arrondi(moisDeRetard * penaliteParMois) : 0,
    penaliteApplicable,
    provisionCoproprieteMax: data.copropriete ? arrondi(depot * D.provisionCoproprieteMax) : null,
    dateLimiteJuge: versIso(ajouterMois(limite, 12 * D.prescriptionAns)),
  };
}

/** Date au format « 15 avril 2026 » */
export function formaterDateLongue(iso: string | null): string {
  if (!iso) return "";
  return versDate(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}
