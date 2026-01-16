/**
 * FORMATAGE - Utilitaires d'affichage
 */

/**
 * Formater un montant en euros
 * @param {number} montant
 * @returns {string} Ex: "16 434 €"
 */
export function formatEuro(montant) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(Math.round(montant));
}

/**
 * Formater un pourcentage
 * @param {number} valeur - Valeur décimale (0.0632 pour 6,32%)
 * @returns {string} Ex: "6,32 %"
 */
export function formatPct(valeur) {
  return (valeur * 100).toFixed(2).replace(".", ",") + " %";
}

/**
 * Formater un pourcentage depuis une valeur déjà en %
 * @param {number} valeur - Valeur en % (6.32 pour 6,32%)
 * @returns {string} Ex: "6,32 %"
 */
export function formatPctDirect(valeur) {
  return valeur.toFixed(2).replace(".", ",") + " %";
}

/**
 * Formater une fourchette de pourcentages
 * @param {number} min
 * @param {number} max
 * @returns {string} Ex: "7 à 8 %"
 */
export function formatFourchettePct(min, max) {
  return `${Math.round(min * 100)} à ${Math.round(max * 100)} %`;
}
