/**
 * Simulateur simplifié : âge légal de départ à la retraite (régime général)
 * Barème par génération, incluant la suspension 2026 du calendrier 2023
 * pour les générations 1964-1968 (LFSS 2026, effet 1er septembre 2026).
 *
 * Source : info-retraite.fr (portail inter-régimes) + DREES.
 * Ne couvre pas les carrières longues, catégories actives/insalubres,
 * incapacité, ni les régimes spéciaux : simulation indicative uniquement.
 */

export interface AgeLegalBracket {
  /** Première année-mois de naissance incluse dans la tranche (mois 1-12) */
  from: { year: number; month: number };
  /** Dernière année-mois de naissance incluse (mois 1-12), null = pas de limite haute */
  to: { year: number; month: number } | null;
  ageLegalYears: number;
  ageLegalMonths: number;
  trimestresRequis: number;
}

// Ordonné du plus ancien au plus récent. -Infinity/+Infinity gérés via null.
export const AGE_LEGAL_BAREME: AgeLegalBracket[] = [
  { from: { year: 1900, month: 1 }, to: { year: 1957, month: 12 }, ageLegalYears: 62, ageLegalMonths: 0, trimestresRequis: 166 },
  { from: { year: 1958, month: 1 }, to: { year: 1960, month: 12 }, ageLegalYears: 62, ageLegalMonths: 0, trimestresRequis: 167 },
  { from: { year: 1961, month: 1 }, to: { year: 1961, month: 8 }, ageLegalYears: 62, ageLegalMonths: 0, trimestresRequis: 168 },
  { from: { year: 1961, month: 9 }, to: { year: 1961, month: 12 }, ageLegalYears: 62, ageLegalMonths: 3, trimestresRequis: 169 },
  { from: { year: 1962, month: 1 }, to: { year: 1962, month: 12 }, ageLegalYears: 62, ageLegalMonths: 6, trimestresRequis: 169 },
  { from: { year: 1963, month: 1 }, to: { year: 1963, month: 12 }, ageLegalYears: 62, ageLegalMonths: 9, trimestresRequis: 170 },
  // Générations 1964 à 1968 (Q1 1965 inclus) : calendrier suspendu par la LFSS 2026
  // (recul de 3 mois de l'âge légal, trimestres requis réduits), effet au 1er septembre 2026.
  { from: { year: 1964, month: 1 }, to: { year: 1964, month: 12 }, ageLegalYears: 62, ageLegalMonths: 9, trimestresRequis: 170 },
  { from: { year: 1965, month: 1 }, to: { year: 1965, month: 3 }, ageLegalYears: 62, ageLegalMonths: 9, trimestresRequis: 170 },
  { from: { year: 1965, month: 4 }, to: { year: 1965, month: 12 }, ageLegalYears: 63, ageLegalMonths: 0, trimestresRequis: 171 },
  { from: { year: 1966, month: 1 }, to: { year: 1966, month: 12 }, ageLegalYears: 63, ageLegalMonths: 3, trimestresRequis: 172 },
  { from: { year: 1967, month: 1 }, to: { year: 1967, month: 12 }, ageLegalYears: 63, ageLegalMonths: 6, trimestresRequis: 172 },
  { from: { year: 1968, month: 1 }, to: { year: 1968, month: 12 }, ageLegalYears: 63, ageLegalMonths: 9, trimestresRequis: 172 },
  { from: { year: 1969, month: 1 }, to: null, ageLegalYears: 64, ageLegalMonths: 0, trimestresRequis: 172 },
];

export const AGE_TAUX_PLEIN_AUTOMATIQUE = 67;

export interface RetraiteData {
  dateNaissance: Date;
  trimestresValides?: number | null;
}

export interface RetraiteResult {
  ageLegalYears: number;
  ageLegalMonths: number;
  trimestresRequis: number;
  dateAgeLegal: Date;
  dateTauxPleinAutomatique: Date;
  trimestresValides: number | null;
  trimestresManquants: number | null;
  bareme: "avant-reforme-2010-2014" | "reforme-2023-suspension-2026" | "reforme-2023-complete";
}

function compareYearMonth(a: { year: number; month: number }, b: { year: number; month: number }): number {
  if (a.year !== b.year) return a.year - b.year;
  return a.month - b.month;
}

function findBracket(year: number, month: number): AgeLegalBracket {
  const target = { year, month };
  const match = AGE_LEGAL_BAREME.find(
    (bracket) =>
      compareYearMonth(target, bracket.from) >= 0 &&
      (bracket.to === null || compareYearMonth(target, bracket.to) <= 0),
  );
  // Filet de sécurité : naissance très ancienne -> première tranche, très récente -> dernière tranche.
  return match ?? AGE_LEGAL_BAREME[AGE_LEGAL_BAREME.length - 1];
}

function addYearsMonths(date: Date, years: number, months: number): Date {
  const result = new Date(date.getTime());
  result.setUTCFullYear(result.getUTCFullYear() + years);
  result.setUTCMonth(result.getUTCMonth() + months);
  return result;
}

function baremeLabel(year: number, month: number): RetraiteResult["bareme"] {
  if (year < 1961 || (year === 1961 && month < 9)) return "avant-reforme-2010-2014";
  if (year >= 1964 && (year < 1965 || (year === 1965 && month <= 3))) {
    return "reforme-2023-suspension-2026";
  }
  return "reforme-2023-complete";
}

export function calculerAgeLegalRetraite(data: RetraiteData): RetraiteResult {
  const { dateNaissance, trimestresValides } = data;
  const year = dateNaissance.getUTCFullYear();
  const month = dateNaissance.getUTCMonth() + 1;

  const bracket = findBracket(year, month);
  const dateAgeLegal = addYearsMonths(dateNaissance, bracket.ageLegalYears, bracket.ageLegalMonths);
  const dateTauxPleinAutomatique = addYearsMonths(dateNaissance, AGE_TAUX_PLEIN_AUTOMATIQUE, 0);

  const trimestresManquants =
    typeof trimestresValides === "number" && Number.isFinite(trimestresValides)
      ? Math.max(0, bracket.trimestresRequis - trimestresValides)
      : null;

  return {
    ageLegalYears: bracket.ageLegalYears,
    ageLegalMonths: bracket.ageLegalMonths,
    trimestresRequis: bracket.trimestresRequis,
    dateAgeLegal,
    dateTauxPleinAutomatique,
    trimestresValides: typeof trimestresValides === "number" ? trimestresValides : null,
    trimestresManquants,
    bareme: baremeLabel(year, month),
  };
}

export function formatAge(years: number, months: number): string {
  if (months === 0) return `${years} ans`;
  return `${years} ans et ${months} mois`;
}

export function formatDateFr(date: Date): string {
  return date.toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
}

export function formatRetraiteResult(result: RetraiteResult): {
  ageLegalDisplay: string;
  dateAgeLegalDisplay: string;
  trimestresDisplay: string;
  statutTrimestresDisplay: string;
  detailsDisplay: string;
} {
  const ageLegalDisplay = formatAge(result.ageLegalYears, result.ageLegalMonths);
  const dateAgeLegalDisplay = formatDateFr(result.dateAgeLegal);
  const trimestresDisplay = `${result.trimestresRequis} trimestres`;

  let statutTrimestresDisplay: string;
  if (result.trimestresValides === null) {
    statutTrimestresDisplay =
      "Renseignez vos trimestres déjà validés pour savoir si vous atteindrez le taux plein à l'âge légal.";
  } else if (result.trimestresManquants === 0) {
    statutTrimestresDisplay = `Avec ${result.trimestresValides} trimestres déjà validés, vous auriez le compte pour le taux plein dès l'âge légal (${ageLegalDisplay}).`;
  } else {
    statutTrimestresDisplay = `Il vous manquerait environ ${result.trimestresManquants} trimestre(s) à l'âge légal. Sans eux, la retraite à taux plein est accordée automatiquement à ${AGE_TAUX_PLEIN_AUTOMATIQUE} ans (${formatDateFr(result.dateTauxPleinAutomatique)}), ou avec une décote si vous partez plus tôt.`;
  }

  const detailsDisplay = [
    `• Âge légal de départ : ${ageLegalDisplay} (${dateAgeLegalDisplay})`,
    `• Trimestres requis pour le taux plein : ${result.trimestresRequis}`,
    `• Taux plein automatique (sans condition de trimestres) : ${AGE_TAUX_PLEIN_AUTOMATIQUE} ans, soit le ${formatDateFr(result.dateTauxPleinAutomatique)}`,
  ].join("\n");

  return {
    ageLegalDisplay,
    dateAgeLegalDisplay,
    trimestresDisplay,
    statutTrimestresDisplay,
    detailsDisplay,
  };
}
