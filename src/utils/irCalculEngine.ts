export interface BaremeTranche {
  plafond: number;
  taux: number;
}

export interface IRInput {
  revenu: number;
  parts: number;
  /** Couple marié ou pacsé (imposition commune). Par défaut : couple si parts >= 2. */
  couple?: boolean;
  /** Parent isolé (case T) : plafond spécifique pour la part du premier enfant */
  parentIsole?: boolean;
}

export interface IRResult {
  revenu: number;
  parts: number;
  qf: number;
  /** Impôt issu du barème, après plafonnement du quotient familial, avant décote */
  irBrut: number;
  /** Impôt issu du barème sans plafonnement (pour information) */
  irSansPlafonnement: number;
  /** Supplément d'impôt dû au plafonnement des effets du quotient familial */
  plafonnementQF: number;
  decote: number;
  /** Impôt net après décote (0 si inférieur au seuil de recouvrement de 61 EUR) */
  impotNet: number;
  tauxMoyen: number;
  tauxMarginal: number;
  mensualiteMoyenne: number;
}

// Barème IR 2026 (revenus 2025) - Article 197 du CGI, loi n°2026-103 du
// 19/02/2026. Verifie sur Legifrance (LEGIARTI000051212954) le 11/08/2026 :
// https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000051212954
export const baremeIR2026: BaremeTranche[] = [
  { plafond: 11600, taux: 0 }, // 0%
  { plafond: 29579, taux: 0.11 }, // 11%
  { plafond: 84577, taux: 0.3 }, // 30%
  { plafond: 181917, taux: 0.41 }, // 41%
  { plafond: Number.POSITIVE_INFINITY, taux: 0.45 }, // 45%
];

// Paramètres 2026 (revenus 2025), art. 197 du CGI, revalorisés de 0,9 % par la loi n°2026-103 :
// plafond de l'avantage par demi-part, décote, seuil de recouvrement (art. 1657 du CGI).
export const PARAMETRES_IR_2026 = {
  plafondDemiPart: 1807,
  /** Parent isolé : plafond pour la part entière attribuée au premier enfant à charge */
  plafondParentIsolePremierEnfant: 4262,
  decote: {
    seul: { forfait: 897, seuil: 1982 },
    couple: { forfait: 1483, seuil: 3277 },
    taux: 0.4525,
  },
  seuilRecouvrement: 61,
};

/** Impôt du barème pour un revenu et un nombre de parts donnés */
function impotBareme(revenu: number, parts: number, bareme: BaremeTranche[]): number {
  const qf = revenu / parts;
  let impotsParPart = 0;
  let prev = 0;
  for (const tranche of bareme) {
    const base = Math.max(0, Math.min(qf, tranche.plafond) - prev);
    impotsParPart += base * tranche.taux;
    prev = tranche.plafond;
    if (qf <= tranche.plafond) break;
  }
  return impotsParPart * parts;
}

/**
 * Impôt sur le revenu 2026 : barème progressif, plafonnement du quotient familial (plafond
 * général par demi-part et plafond parent isolé ; sans les cas invalidité ou ancien
 * combattant), décote et seuil de recouvrement. Hors réductions et crédits d'impôt.
 */
export function calculerIR(input: IRInput, bareme: BaremeTranche[] = baremeIR2026): IRResult {
  const revenu = Number(input.revenu);
  const parts = Number(input.parts);
  if (!isFinite(revenu) || revenu < 0 || !isFinite(parts) || parts <= 0) {
    throw new Error("Entrées invalides");
  }

  const qf = revenu / parts;
  const P = PARAMETRES_IR_2026;
  const couple = input.couple ?? parts >= 2;
  const partsBase = couple ? 2 : 1;

  // Plafonnement : l'avantage lié aux demi-parts supplémentaires est limité par demi-part
  const irSansPlafonnement = impotBareme(revenu, parts, bareme);
  const demiPartsSupp = Math.max(0, (parts - partsBase) * 2);
  const irBase = impotBareme(revenu, Math.min(parts, partsBase), bareme);
  const avantageMax =
    !couple && input.parentIsole === true && demiPartsSupp >= 2
      ? P.plafondParentIsolePremierEnfant + (demiPartsSupp - 2) * P.plafondDemiPart
      : demiPartsSupp * P.plafondDemiPart;
  const irBrut = Math.max(irSansPlafonnement, irBase - avantageMax);
  const plafonnementQF = irBrut - irSansPlafonnement;

  // Décote : forfait − 45,25 % de l'impôt brut, si l'impôt brut est sous le seuil
  const d = couple ? P.decote.couple : P.decote.seul;
  const decote = irBrut > 0 && irBrut < d.seuil ? Math.min(irBrut, Math.max(0, d.forfait - P.decote.taux * irBrut)) : 0;
  const apresDecote = Math.round(irBrut - decote);
  const impotNet = apresDecote < P.seuilRecouvrement ? 0 : apresDecote;

  const tauxMoyen = revenu > 0 ? impotNet / revenu : 0;
  const mensualiteMoyenne = impotNet / 12;
  const tauxMarginal = bareme.find((b) => qf <= b.plafond)?.taux ?? bareme[bareme.length - 1]?.taux ?? 0;

  return {
    revenu,
    parts,
    qf,
    irBrut,
    irSansPlafonnement,
    plafonnementQF,
    decote,
    impotNet,
    tauxMoyen,
    tauxMarginal,
    mensualiteMoyenne,
  };
}
