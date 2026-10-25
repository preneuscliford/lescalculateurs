/**
 * DPE et location : jusqu'à quand un logement peut-il être loué, et le loyer peut-il augmenter ?
 *
 * Règles (src/data/logement-baremes.ts) :
 * - en métropole, un logement n'est plus décent pour un nouveau bail, un renouvellement ou une
 *   reconduction tacite : G+ depuis le 01/01/2023, G depuis le 01/01/2025, F à partir du
 *   01/01/2028, E à partir du 01/01/2034 ;
 * - un bail en cours continue jusqu'à sa prochaine échéance (renouvellement ou reconduction) ;
 *   les baux sans reconduction (meublé étudiant, bail mobilité) s'arrêtent à leur terme ;
 * - loyer gelé pour les classes F et G (révision annuelle, relocation, renouvellement).
 * Outre-mer : calendrier non vérifié sur une source officielle, non calculé.
 */
import { logementBaremes } from "../data/logement-baremes";

const DE = logementBaremes.decenceEnergetique;
const DB = logementBaremes.dureeBail;

export type ClasseDpe = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "G+";
export type TypeBail = "vide-particulier" | "vide-societe" | "meuble" | "meuble-etudiant" | "mobilite";

export interface DpeLocationData {
  classe: ClasseDpe;
  outreMer?: boolean;
  /** Bail en cours : type et date de début (AAAA-MM-JJ) ; sans bail, seule la date d'interdiction est calculée */
  typeBail?: TypeBail;
  dateDebutBail?: string;
  /** Date du jour (AAAA-MM-JJ) */
  dateReference: string;
}

export interface DpeLocationResult {
  valide: boolean;
  message: string;
  /** Date à partir de laquelle le logement n'est plus décent pour un nouveau bail (AAAA-MM-JJ), null si jamais (A à D) */
  dateInterdiction: string | null;
  /** Peut-on signer un nouveau bail à la date de référence ? */
  nouveauBailPossible: boolean;
  /** Bail en cours : dernier jour avant l'échéance où le critère s'applique (AAAA-MM-JJ) */
  bailEnCoursJusquAu: string | null;
  /** Échéance du bail en cours (renouvellement, reconduction ou terme) à laquelle le critère s'applique */
  echeanceConcernee: string | null;
  bailSansReconduction: boolean;
  /** L'échéance concernée est déjà passée : le logement aurait dû être mis aux normes */
  echeanceDepassee: boolean;
  loyerGele: boolean;
  aVerifier: string[];
}

function versDate(iso: string): Date {
  const [a, m, j] = String(iso).split("-").map(Number);
  return new Date(Date.UTC(a, (m || 1) - 1, j || 1));
}
const versIso = (d: Date) => d.toISOString().slice(0, 10);
const dateValide = (iso?: string) => !!iso && /^\d{4}-\d{2}-\d{2}$/.test(iso) && !isNaN(versDate(iso).getTime());

function ajouterMois(d: Date, n: number): Date {
  const cible = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + n, 1));
  const dernierJour = new Date(Date.UTC(cible.getUTCFullYear(), cible.getUTCMonth() + 1, 0)).getUTCDate();
  cible.setUTCDate(Math.min(d.getUTCDate(), dernierJour));
  return cible;
}
const veille = (d: Date) => new Date(d.getTime() - 86400000);

export function calculerDpeLocation(data: DpeLocationData): DpeLocationResult {
  const aVerifier: string[] = [];
  const loyerGele = DE.classesGelLoyer.includes(data.classe);
  const resultatVide = (message: string): DpeLocationResult => ({
    valide: false,
    message,
    dateInterdiction: null,
    nouveauBailPossible: false,
    bailEnCoursJusquAu: null,
    echeanceConcernee: null,
    bailSansReconduction: false,
    echeanceDepassee: false,
    loyerGele,
    aVerifier,
  });

  if (!dateValide(data.dateReference)) return resultatVide("Date du jour invalide.");
  if (data.outreMer) {
    aVerifier.push(
      "Outre-mer : le calendrier d'interdiction propre à la Guadeloupe, la Martinique, la Guyane, La Réunion et Mayotte n'a pas pu être vérifié sur une source officielle. Renseignez-vous auprès de l'ADIL de votre département.",
    );
    return { ...resultatVide("Calendrier outre-mer non calculé."), valide: true, loyerGele: false };
  }

  const reference = versDate(data.dateReference);
  const interdictionIso = DE.interdictionMetropole[data.classe] || null;
  const interdiction = interdictionIso ? versDate(interdictionIso) : null;
  const nouveauBailPossible = !interdiction || reference < interdiction;

  let bailEnCoursJusquAu: string | null = null;
  let echeanceConcernee: string | null = null;
  const bailSansReconduction = !!data.typeBail && DB.sansReconduction.includes(data.typeBail);
  if (interdiction && data.typeBail && dateValide(data.dateDebutBail)) {
    const debut = versDate(data.dateDebutBail!);
    const duree = DB.mois[data.typeBail];
    // Première échéance (fin de la période en cours) à partir de la date d'interdiction : à
    // cette date, le bail ne peut être ni renouvelé ni reconduit (ou, sans reconduction, un
    // nouveau bail ne peut pas être signé)
    let n = 1;
    while (ajouterMois(debut, n * duree) < interdiction) n++;
    if (bailSansReconduction) n = 1;
    const echeance = ajouterMois(debut, n * duree);
    echeanceConcernee = versIso(echeance);
    bailEnCoursJusquAu = versIso(veille(echeance));
  }

  let message: string;
  if (!interdiction) message = "Les classes A à D ne sont pas concernées par une interdiction de location.";
  else if (nouveauBailPossible) message = `Le logement peut encore être loué avec un nouveau bail jusqu'au ${formaterDateLongue(versIso(veille(interdiction)))}.`;
  else message = "Le logement ne peut plus faire l'objet d'un nouveau bail, d'un renouvellement ni d'une reconduction tacite sans travaux.";

  return {
    valide: true,
    message,
    dateInterdiction: interdictionIso,
    nouveauBailPossible,
    bailEnCoursJusquAu,
    echeanceConcernee,
    bailSansReconduction,
    echeanceDepassee: !!echeanceConcernee && versDate(echeanceConcernee) <= reference,
    loyerGele,
    aVerifier,
  };
}

/** Date au format « 1 janvier 2028 » */
export function formaterDateLongue(iso: string | null): string {
  if (!iso) return "";
  // « 1er » pour le premier jour du mois, selon l'usage français
  return versDate(iso)
    .toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })
    .replace(/^1 /, "1er ");
}
