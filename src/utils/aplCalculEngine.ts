/**
 * Moteur de calcul APL unique (simulateur, comparateur, pages SEO, API).
 *
 * Formule officielle du secteur locatif (articles D. 823-16 et D. 823-17 du code de la
 * construction et de l'habitation), paramètres de l'arrêté du 27 septembre 2019 en vigueur
 * au 1er octobre 2026 (src/data/social-baremes.ts, apl.formule) :
 *
 *   Aide = L + C − Pp
 *   L  = loyer retenu dans la limite du plafond (zone, composition du foyer)
 *   C  = forfait charges
 *   Pp = P0 + Tp × (R − R0)        participation personnelle (mensuelle)
 *   P0 = max(8,5 % × (L + C) ; 40,01 €)
 *   Tp = TF + TL                    TF selon le foyer, TL selon le rapport L / loyer de référence
 *   R  = ressources annuelles (revenus nets − 10 % de frais professionnels, arrondies à la
 *        centaine supérieure) ; R0 = forfait annuel selon le foyer
 *
 * Puis : dégressivité pour les loyers très élevés, minoration de 5 €, seuil de versement
 * (10 € pour une allocation de logement, 0 € pour l'APL en logement conventionné), CRDS 0,5 %.
 *
 * Limites (estimation) : revenus mensuels saisis assimilés à des salaires nets sur 12 mois ;
 * pas d'abattements spécifiques (double activité, enfants), ni de réduction de loyer de
 * solidarité en HLM ; pour les DOM, plafonds de la zone III (classement des communes non vérifié).
 *
 * @version 2026-10 (barème au 1er octobre 2026)
 */

import { socialBaremes } from "../data/social-baremes";

// ==========================================
// TYPES & INTERFACES
// ==========================================

export type SituationFamiliale = "seul" | "couple" | "monoparental" | "autre";
export type Zone = "idf" | "province" | "dom";
export type TypeLogement = "location" | "accession" | "hlm" | "colocation";

export interface APLInput {
  situation: SituationFamiliale;
  enfants: number;
  revenus_mensuels: number;
  loyer_mensuel: number;
  region: Zone;
  type_logement?: TypeLogement;
  economie?: number;
  /** Ressources annuelles retenues au minimum (ex. forfait étudiant, art. 6 de l'arrêté) */
  ressources_annuelles_minimum?: number;
}

export interface APLResult {
  success: boolean;
  data?: APLData;
  error?: string;
}

export interface APLData {
  apl_estimee: number;
  apl_brute: number; // L + C − Pp, avant dégressivité, minoration, seuil et CRDS
  loyer_mensuel: number;
  loyer_pris_compte: number;
  forfait_charges: number;
  participation: number; // Pp mensuelle
  participation_minimale: number; // P0
  taux_participation: number; // Tp = TF + TL
  ressources_annuelles: number; // R
  abattement_r0: number; // R0
  coefficient_degressivite: number; // 1 = pas de dégressivité
  reste_charge: number;
  situation: SituationFamiliale;
  enfants: number;
  revenus_mensuels: number;
  zone: Zone;
  plafond_loyer: number;
  raison_zero?: string; // Explication si APL = 0
}

const aplBaremes = socialBaremes.apl;
const F = aplBaremes.formule;

// Plafonds de loyer officiels (art. 7) par zone CAF
const PLAFONDS_LOYER_ZONE = {
  idf: aplBaremes.plafondsLoyer.zone1,
  province: aplBaremes.plafondsLoyer.zone2,
  dom: aplBaremes.plafondsLoyer.zone3,
} as const;
const DEGRESSIVITE_ZONE = {
  idf: F.coefficientsDegressivite.zone1,
  province: F.coefficientsDegressivite.zone2,
  dom: F.coefficientsDegressivite.zone3,
} as const;

const arrondi = (v: number, dec = 2) => Math.round(v * 10 ** dec) / 10 ** dec;
const estCouple = (situation: SituationFamiliale) => situation === "couple";

/** Plafond de loyer selon la zone, la situation et les personnes à charge (art. 7, art. 16). */
function getPlafondLoyer(region: Zone, situation: SituationFamiliale, enfants: number, colocation: boolean): number {
  const p = PLAFONDS_LOYER_ZONE[region] || PLAFONDS_LOYER_ZONE.province;
  const plafond =
    enfants <= 0
      ? estCouple(situation)
        ? p.couple
        : p.seul
      : p.une_personne_a_charge + (enfants - 1) * p.par_personne_supplementaire;
  return arrondi(colocation ? plafond * F.coefficientPlafondColocation : plafond);
}

/** Forfait charges (art. 9, art. 16 en colocation, art. 46 outre-mer). */
function getForfaitCharges(region: Zone, situation: SituationFamiliale, enfants: number, colocation: boolean): number {
  if (region === "dom") return arrondi(F.outreMer.forfaitCharges.base + enfants * F.outreMer.forfaitCharges.parPersonneACharge);
  if (colocation) {
    const base = estCouple(situation) || enfants > 0 ? F.forfaitChargesColocation.couple : F.forfaitChargesColocation.seul;
    return arrondi(base + enfants * F.forfaitChargesColocation.parPersonneACharge);
  }
  return arrondi(F.forfaitCharges.base + enfants * F.forfaitCharges.parPersonneACharge);
}

/** Taux TF (art. 14, art. 46 outre-mer). */
function getTauxFamille(region: Zone, situation: SituationFamiliale, enfants: number): number {
  const t = region === "dom" ? F.outreMer.tauxFamille : F.tauxFamille;
  if (enfants <= 0) return estCouple(situation) ? t.couple : t.isole;
  const table = t.parPersonnesACharge;
  if (enfants <= table.length) return table[enfants - 1];
  return table[table.length - 1] + (enfants - table.length) * t.majorationParPersonneSupplementaire;
}

/** Taux TL selon le rapport RL = L / LR (art. 14), arrondi à la 3e décimale du pourcentage. */
function getTauxLoyer(loyerRetenu: number, situation: SituationFamiliale, enfants: number): number {
  const LR = F.loyerReference;
  const ref =
    enfants <= 0
      ? estCouple(situation)
        ? LR.couple
        : LR.isole
      : LR.unePersonneACharge + (enfants - 1) * LR.parPersonneSupplementaire;
  const RL = arrondi((loyerRetenu / ref) * 100, 2) / 100;
  const [s1, s2] = F.tauxLoyer.seuils;
  const [t2, t3] = F.tauxLoyer.taux;
  const TL = RL < s1 ? 0 : RL <= s2 ? t2 * (RL - s1) : t2 * (s2 - s1) + t3 * (RL - s2);
  return arrondi(TL * 100, 3) / 100;
}

/** Forfait R0 annuel (art. 15, art. 46 outre-mer). */
function getR0(region: Zone, situation: SituationFamiliale, enfants: number): number {
  const r = F.r0;
  if (enfants <= 0) return estCouple(situation) ? r.couple : r.isole;
  if (enfants === 1 && region === "dom") return F.outreMer.r0UnePersonneACharge;
  if (enfants <= r.parPersonnesACharge.length) return r.parPersonnesACharge[enfants - 1];
  return r.parPersonnesACharge[r.parPersonnesACharge.length - 1] + (enfants - r.parPersonnesACharge.length) * r.parPersonneSupplementaire;
}

/** Ressources annuelles R : revenus nets × 12 − 10 % de frais professionnels, à la centaine supérieure. */
function getRessourcesAnnuelles(revenusMensuels: number): number {
  const annuel = arrondi(revenusMensuels * 12 * (1 - F.abattementFraisProfessionnels));
  return Math.ceil(annuel / 100) * 100;
}

// ==========================================
// FONCTION DE CALCUL PRINCIPALE
// ==========================================

export function calculerAPL(input: APLInput): APLResult {
  try {
    const validation = validerEntrees(input);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    const { situation, revenus_mensuels, loyer_mensuel, region } = input;
    const typeLogement = input.type_logement || "location";
    const revenus = Number(revenus_mensuels);
    const loyer = Number(loyer_mensuel);
    const nb_enfants = Math.max(0, Math.floor(Number(input.enfants) || 0));
    const colocation = typeLogement === "colocation";

    const plafond_loyer = getPlafondLoyer(region, situation, nb_enfants, colocation);
    const loyer_pris_compte = Math.min(loyer, plafond_loyer);
    const forfait_charges = getForfaitCharges(region, situation, nb_enfants, colocation);

    // Participation personnelle Pp = P0 + Tp × (R − R0)
    const participation_minimale = Math.max(
      F.participationMinimale.taux * (loyer_pris_compte + forfait_charges),
      F.participationMinimale.forfait,
    );
    const taux_participation = getTauxFamille(region, situation, nb_enfants) + getTauxLoyer(loyer_pris_compte, situation, nb_enfants);
    const ressources_annuelles = Math.max(getRessourcesAnnuelles(revenus), Number(input.ressources_annuelles_minimum) || 0);
    const abattement_r0 = getR0(region, situation, nb_enfants);
    const participation = participation_minimale + taux_participation * Math.max(0, ressources_annuelles - abattement_r0);

    const apl_brute = Math.max(0, loyer_pris_compte + forfait_charges - participation);

    // Dégressivité puis suppression pour les loyers très élevés (art. 10)
    const coefs = DEGRESSIVITE_ZONE[region] || DEGRESSIVITE_ZONE.province;
    const loyerDegressivite = arrondi(plafond_loyer * coefs.degressivite);
    const loyerSuppression = arrondi(plafond_loyer * coefs.suppression);
    const coefficient_degressivite =
      loyer <= loyerDegressivite
        ? 1
        : loyer > loyerSuppression
          ? 0
          : 1 - (loyer - loyerDegressivite) / (loyerSuppression - loyerDegressivite);

    // Minoration forfaitaire (art. 11), seuil de versement (art. 12), CRDS
    let montant = Math.max(0, arrondi(apl_brute * coefficient_degressivite) - F.minorationForfaitaire);
    const seuil = typeLogement === "hlm" ? F.seuilVersement.apl : F.seuilVersement.allocationLogement;
    let raison_zero: string | undefined;
    if (typeLogement === "accession") {
      montant = 0;
      raison_zero = "Depuis le 1er janvier 2018, aucune nouvelle aide au logement n'est ouverte pour l'accession à la propriété.";
    } else if (apl_brute <= 0) {
      raison_zero = "Avec ces revenus, votre participation personnelle dépasse le loyer retenu et les charges : l'aide est nulle selon le barème officiel.";
    } else if (coefficient_degressivite === 0) {
      raison_zero = "Le loyer dépasse le seuil au-delà duquel l'aide est supprimée pour votre zone.";
    } else if (montant < seuil) {
      montant = 0;
      raison_zero = `Le montant calculé est inférieur au seuil de versement (${seuil} €) : l'aide n'est pas versée.`;
    }
    const apl_estimee = Math.floor(montant * (1 - F.tauxCrds));

    return {
      success: true,
      data: {
        apl_estimee,
        apl_brute: Math.floor(apl_brute),
        loyer_mensuel: loyer,
        loyer_pris_compte,
        forfait_charges,
        participation: Math.round(participation),
        participation_minimale: arrondi(participation_minimale),
        taux_participation,
        ressources_annuelles,
        abattement_r0,
        coefficient_degressivite: arrondi(coefficient_degressivite, 4),
        reste_charge: Math.max(0, loyer - apl_estimee),
        situation,
        enfants: nb_enfants,
        revenus_mensuels: revenus,
        zone: region,
        plafond_loyer,
        raison_zero: apl_estimee === 0 ? raison_zero : undefined,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur de calcul",
    };
  }
}

// ==========================================
// VALIDATION DES ENTRÉES
// ==========================================

function validerEntrees(input: APLInput): { valid: boolean; error?: string } {
  const { situation, enfants, revenus_mensuels, loyer_mensuel, region } = input;

  if (!situation) {
    return {
      valid: false,
      error: "Veuillez sélectionner votre situation familiale",
    };
  }

  if (revenus_mensuels === null || revenus_mensuels === undefined) {
    return { valid: false, error: "Veuillez indiquer vos revenus mensuels" };
  }

  if (loyer_mensuel === null || loyer_mensuel === undefined) {
    return { valid: false, error: "Veuillez indiquer votre loyer mensuel" };
  }

  if (enfants === null || enfants === undefined) {
    return { valid: false, error: "Veuillez indiquer le nombre d'enfants" };
  }

  if (!region) {
    return { valid: false, error: "Veuillez sélectionner votre région" };
  }

  const revenus = Number(revenus_mensuels);
  const loyer = Number(loyer_mensuel);

  if (isNaN(revenus) || revenus < 0) {
    return { valid: false, error: "Revenus invalides" };
  }

  if (isNaN(loyer) || loyer < 0) {
    return { valid: false, error: "Loyer invalide" };
  }

  return { valid: true };
}

// ==========================================
// HELPERS POUR L'AFFICHAGE
// ==========================================

/**
 * Formate un montant en euros (format français)
 */
export function formatCurrency(amount: number): string {
  if (amount === undefined || amount === null || isNaN(amount)) return "0 €";
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Labels lisibles pour les situations
 */
export const SITUATION_LABELS: Record<SituationFamiliale, string> = {
  seul: "Célibataire",
  couple: "Couple",
  monoparental: "Parent isolé",
  autre: "Autre",
};

/**
 * Labels lisibles pour les zones
 */
export const ZONE_LABELS: Record<Zone, string> = {
  idf: "Île-de-France",
  province: "Province",
  dom: "DOM-TOM",
};

/**
 * 🧠 PROPOSITION 3: Messages pédagogiques
 */
export const MESSAGES_PEDAGOGIQUES = {
  apl_zero:
    "💡 Avec vos revenus actuels et le plafond de loyer applicable, l'APL est généralement nulle ou très faible selon les règles CAF.",

  disclaimer_comparateur:
    "📊 Les scénarios affichés appliquent le barème officiel des aides au logement au 1er octobre 2026 (estimation).",

  sources:
    "Calcul selon la formule officielle (articles D. 823-16 et D. 823-17 du code de la construction et de l'habitation, arrêté du 27 septembre 2019) : estimation non contractuelle.",

  cta_caf: "Pour connaître votre droit réel, consultez la CAF.",
};

export function formatAPLResult(result: APLResult): {
  montantDisplay: string;
  explDisplay: string;
  detailsDisplay: string;
} {
  const formatMonnaie = (montant: number) => {
    return (
      montant.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) +
      " EUR"
    );
  };

  if (!result.success || !result.data) {
    return {
      montantDisplay: "Non calculable",
      explDisplay: result.error || "Erreur dans le calcul",
      detailsDisplay: "",
    };
  }

  const montantDisplay = `${formatMonnaie(result.data.apl_estimee)} / mois`;

  const detailsDisplay = `
    • Loyer mensuel : ${formatMonnaie(result.data.loyer_mensuel)}
    • Loyer pris en compte (plafonné) : ${formatMonnaie(result.data.loyer_pris_compte)}
    • Forfait charges : ${formatMonnaie(result.data.forfait_charges)}
    • Participation personnelle : ${formatMonnaie(result.data.participation)}
    • = APL estimée : ${formatMonnaie(result.data.apl_estimee)}
  `
    .trim()
    .split("\n")
    .filter((l) => l.trim())
    .join("\n");

  return {
    montantDisplay,
    explDisplay:
      "Aide au logement estimée selon la formule officielle (barème au 1er octobre 2026).",
    detailsDisplay,
  };
}
