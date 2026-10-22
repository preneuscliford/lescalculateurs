/**
 * Normalisation des formulations pour comparer suggestions, requêtes Search Console et
 * mots-clés Semrush : minuscules, sans accents, apostrophes et espaces unifiés.
 */

function normaliser(texte) {
  return String(texte || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[’`´]/g, "'")
    .replace(/œ/g, "oe")
    .replace(/[^a-z0-9' ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

module.exports = { normaliser };
