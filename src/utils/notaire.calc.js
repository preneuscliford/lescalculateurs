/**
 * CALCUL FRAIS DE NOTAIRE - CENTRALISÉ
 * Toutes les pages doivent utiliser ce module
 */

import { NOTAIRE_2026, getDmtoTaux } from "../data/notaire.baremes.2026.js";

/**
 * Calculer les émoluments selon le barème progressif
 * @param {number} prix - Prix du bien
 * @returns {number} Montant des émoluments HT
 */
export function calculEmoluments(prix) {
  let reste = prix;
  let total = 0;
  let prevMax = 0;

  for (const tranche of NOTAIRE_2026.emoluments.tranches) {
    const plafond = tranche.max === Infinity ? reste : tranche.max - prevMax;
    const part = Math.min(reste, plafond);
    if (part <= 0) break;
    total += part * tranche.taux;
    reste -= part;
    prevMax = tranche.max;
  }
  return total;
}

/**
 * Calculer le total des frais de notaire
 * @param {number} prix - Prix du bien
 * @param {string} type - 'ancien' ou 'neuf'
 * @param {number|string} dmtoTauxOuCode - Taux DMTO ou code département
 * @returns {object} Détail des frais
 */
export function calculFraisNotaire(
  prix,
  type = "ancien",
  dmtoTauxOuCode = null,
) {
  // Déterminer le taux DMTO
  let dmtoTaux;
  if (type === "neuf") {
    dmtoTaux = NOTAIRE_2026.neuf.droits;
  } else if (typeof dmtoTauxOuCode === "string") {
    // C'est un code département
    dmtoTaux = getDmtoTaux(dmtoTauxOuCode);
  } else if (typeof dmtoTauxOuCode === "number") {
    // C'est un taux direct
    dmtoTaux = dmtoTauxOuCode;
  } else {
    // Défaut : taux majoré
    dmtoTaux = NOTAIRE_2026.dmto.majore;
  }

  const droits = prix * dmtoTaux;
  const emoluments = calculEmoluments(prix);
  const csi = Math.max(prix * NOTAIRE_2026.csi.taux, NOTAIRE_2026.csi.minimum);
  const tva = emoluments * NOTAIRE_2026.tva;
  const debours = NOTAIRE_2026.debours.moyenne;
  const formalites = NOTAIRE_2026.debours.formalites;

  const total = droits + emoluments + csi + tva + debours + formalites;

  return {
    prix,
    type,
    dmtoTaux,
    dmtoPct: (dmtoTaux * 100).toFixed(2),
    droits: Math.round(droits),
    emoluments: Math.round(emoluments),
    csi: Math.round(csi),
    tva: Math.round(tva),
    debours,
    formalites,
    total: Math.round(total),
    pourcentage: ((total / prix) * 100).toFixed(2),
  };
}

/**
 * Calculer pour un département spécifique
 * @param {number} prix - Prix du bien
 * @param {string} codeDept - Code département
 * @returns {object} { ancien, neuf }
 */
export function calculParDepartement(prix, codeDept) {
  return {
    ancien: calculFraisNotaire(prix, "ancien", codeDept),
    neuf: calculFraisNotaire(prix, "neuf"),
  };
}

/**
 * Exemples de référence pour 200 000 €
 */
export function getExemples200k() {
  return {
    ancien_majore: calculFraisNotaire(
      200000,
      "ancien",
      NOTAIRE_2026.dmto.majore,
    ),
    ancien_standard: calculFraisNotaire(
      200000,
      "ancien",
      NOTAIRE_2026.dmto.standard,
    ),
    ancien_reduit: calculFraisNotaire(
      200000,
      "ancien",
      NOTAIRE_2026.dmto.reduit,
    ),
    neuf: calculFraisNotaire(200000, "neuf"),
  };
}
