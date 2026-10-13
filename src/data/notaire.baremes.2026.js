/**
 * NOTAIRE BARÈMES 2026 - SOURCE UNIQUE DE VÉRITÉ
 * ⚠️ INTERDICTION ABSOLUE d'écrire ces chiffres ailleurs !
 *
 * Mise à jour : 1er juin 2026 (relèvement DMTO, applicable jusqu'au 31 mars 2028)
 * Source : https://www.impots.gouv.fr/sites/default/files/media/1_metier/3_partenaire/notaires/nid_11316_dmto_2026-01-01.pdf
 */

export const NOTAIRE_2026 = {
  // Droits de Mutation à Titre Onéreux (DMTO)
  dmto: {
    reduit: 0.0509, // 5,09 % - Indre (36)
    standard: 0.058, // 5,80 % - 11 départements
    majore: 0.0632, // 6,32 % - 89 départements (défaut)
  },

  // Droits pour le neuf
  neuf: {
    droits: 0.00715, // 0,715 %
  },

  // Barème émoluments notaire (inchangé depuis 2021)
  emoluments: {
    tranches: [
      { max: 6500, taux: 0.0387 },
      { max: 17000, taux: 0.01596 },
      { max: 60000, taux: 0.01064 },
      { max: Infinity, taux: 0.00799 },
    ],
  },

  // TVA sur émoluments
  tva: 0.2,

  // Contribution de Sécurité Immobilière
  csi: {
    taux: 0.001,
    minimum: 15,
  },

  // Débours moyens (estimations)
  debours: {
    moyenne: 800,
    formalites: 400,
  },

  // Fourchettes SEO (à utiliser dans les textes)
  references: {
    ancien: { min: 0.07, max: 0.08 },
    neuf: { min: 0.02, max: 0.03 },
  },

  // Départements par catégorie de taux
  departements: {
    reduit: ["36"],
    standard: [
      "05",
      "06",
      "07",
      "16",
      "26",
      "48",
      "60",
      "65",
      "71",
      "971",
      "976",
    ],
    // Tous les autres = majoré (défaut)
  },
};

/**
 * Obtenir le taux DMTO pour un département
 * @param {string} code - Code département
 * @returns {number} Taux DMTO
 */
export function getDmtoTaux(code) {
  if (NOTAIRE_2026.departements.reduit.includes(code)) {
    return NOTAIRE_2026.dmto.reduit;
  }
  if (NOTAIRE_2026.departements.standard.includes(code)) {
    return NOTAIRE_2026.dmto.standard;
  }
  return NOTAIRE_2026.dmto.majore;
}
