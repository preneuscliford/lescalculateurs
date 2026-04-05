/**
 * 🧩 MOTEUR DE CALCUL APL UNIQUE
 * ================================
 * Source unique pour tous les calculs APL (calcul principal + comparateur).
 * Logique CAF simplifiée mais cohérente et réaliste.
 *
 * Règles intégrées:
 * 1. Loyer plafonné selon zone + situation familiale + nombre d'enfants
 * 2. Participation personnelle = 30% revenus - forfait logement
 * 3. Règle sécurité: Si participation ≥ loyer plafonné → APL = 0€
 * 4. Plafonds APL réalistes (anti-bullshit) par profil
 *
 * @version 2026-01
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
}

export interface APLResult {
  success: boolean;
  data?: APLData;
  error?: string;
}

export interface APLData {
  apl_estimee: number;
  apl_brute: number; // Avant application du plafond réaliste
  loyer_mensuel: number;
  loyer_pris_compte: number;
  participation: number;
  forfait_logement: number;
  reste_charge: number;
  situation: SituationFamiliale;
  enfants: number;
  revenus_mensuels: number;
  zone: Zone;
  plafond_loyer: number;
  plafond_apl: number; // Plafond réaliste appliqué
  is_plafonne: boolean; // Montant a été plafonné
  raison_zero?: string; // Explication si APL = 0
}

const aplBaremes = socialBaremes.apl;
const PLAFONDS_LOYER_BASE: Record<Zone, number> = {
  idf: aplBaremes.plafondsLoyer.zone1.seul,
  province: aplBaremes.plafondsLoyer.zone2.seul,
  dom: aplBaremes.plafondsLoyer.zone3.seul,
};
const BONUS_LOYER_PAR_ENFANT = aplBaremes.moteur.bonusLoyerParEnfant;
const BONUS_LOYER_COUPLE = aplBaremes.moteur.bonusLoyerCouple;
const FORFAIT_LOGEMENT: Record<SituationFamiliale, number> = {
  ...aplBaremes.moteur.forfaitLogement,
};
const TAUX_PARTICIPATION = aplBaremes.moteur.tauxParticipation;
const PARTICIPATION_MINIMUM = aplBaremes.moteur.participationMinimum;

// ==========================================
// 🧮 PROPOSITION 2: PLAFONDS APL RÉALISTES
// ==========================================

/**
 * Plafonds APL réalistes par profil (soft caps anti-bullshit)
 * Basés sur les ordres de grandeur constatés CAF
 */
function getPlafondAPLRealiste(
  situation: SituationFamiliale,
  enfants: number
): number {
  const base: Record<SituationFamiliale, number> = {
    ...aplBaremes.moteur.plafondAplBase,
  };
  const bonusParEnfant = aplBaremes.moteur.bonusPlafondAplParEnfant;
  const enfantsComptabilises = Math.min(enfants, 3);

  let plafond = base[situation] + enfantsComptabilises * bonusParEnfant;

  return Math.min(plafond, aplBaremes.moteur.plafondAplAbsolu);
}

// ==========================================
// FONCTION DE CALCUL PRINCIPALE
// ==========================================

/**
 * Calcule l'APL estimée selon les règles CAF simplifiées
 * @param input - Paramètres du calcul
 * @returns APLResult avec données détaillées ou erreur
 */
export function calculerAPL(input: APLInput): APLResult {
  try {
    // Validation des entrées
    const validation = validerEntrees(input);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    const { situation, enfants, revenus_mensuels, loyer_mensuel, region } =
      input;

    const revenus = Number(revenus_mensuels);
    const loyer = Number(loyer_mensuel);
    const nb_enfants = Math.max(0, Math.floor(Number(enfants) || 0));

    // ─────────────────────────────────────────
    // 1️⃣ PLAFOND LOYER (zone + situation + enfants)
    // ─────────────────────────────────────────
    let plafond_loyer =
      PLAFONDS_LOYER_BASE[region] || PLAFONDS_LOYER_BASE.province;

    // Bonus couple
    if (situation === "couple") {
      plafond_loyer += BONUS_LOYER_COUPLE;
    }

    // Bonus enfants
    plafond_loyer += nb_enfants * BONUS_LOYER_PAR_ENFANT;

    const loyer_pris_compte = Math.min(loyer, plafond_loyer);

    // ─────────────────────────────────────────
    // 2️⃣ FORFAIT LOGEMENT
    // ─────────────────────────────────────────
    const forfait_logement =
      FORFAIT_LOGEMENT[situation] || FORFAIT_LOGEMENT.seul;

    // ─────────────────────────────────────────
    // 3️⃣ PARTICIPATION PERSONNELLE
    // ─────────────────────────────────────────
    let participation = revenus * TAUX_PARTICIPATION - forfait_logement;

    // Participation minimale
    participation = Math.max(PARTICIPATION_MINIMUM, participation);

    // ─────────────────────────────────────────
    // 4️⃣ CALCUL APL BRUTE
    // ─────────────────────────────────────────
    let apl_brute = loyer_pris_compte - participation;

    // ─────────────────────────────────────────
    // 5️⃣ RÈGLE DE SÉCURITÉ ABSOLUE
    // ─────────────────────────────────────────
    // Si participation >= loyer plafonné → APL = 0€
    let raison_zero: string | undefined;

    if (participation >= loyer_pris_compte) {
      apl_brute = 0;
      raison_zero =
        "Avec vos revenus actuels et le plafond de loyer applicable, l'APL est généralement nulle selon les règles CAF.";
    }

    // L'APL ne peut pas être négative
    apl_brute = Math.max(0, apl_brute);

    // ─────────────────────────────────────────
    // 6️⃣ PLAFOND APL RÉALISTE (anti-bullshit)
    // ─────────────────────────────────────────
    const plafond_apl = getPlafondAPLRealiste(situation, nb_enfants);
    let apl_estimee = Math.min(apl_brute, plafond_apl);
    const is_plafonne = apl_brute > plafond_apl;

    // Arrondir à l'euro inférieur
    apl_estimee = Math.floor(apl_estimee);
    apl_brute = Math.floor(apl_brute);

    // Reste à charge
    const reste_charge = Math.max(0, loyer - apl_estimee);

    return {
      success: true,
      data: {
        apl_estimee,
        apl_brute,
        loyer_mensuel: loyer,
        loyer_pris_compte,
        participation: Math.round(participation),
        forfait_logement,
        reste_charge,
        situation,
        enfants: nb_enfants,
        revenus_mensuels: revenus,
        zone: region,
        plafond_loyer,
        plafond_apl,
        is_plafonne,
        raison_zero,
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

  apl_plafonne:
    "ℹ️ Montant plafonné selon les règles généralement constatées par la CAF.",

  disclaimer_comparateur:
    "📊 Les scénarios affichés respectent les plafonds de loyer et de ressources généralement appliqués par la CAF.",

  sources:
    "Sources et règles basées sur les barèmes CAF, observatoires logement et pratiques constatées (simulation non contractuelle).",

  cta_caf: "Pour connaître votre droit réel, consultez la CAF.",
};
