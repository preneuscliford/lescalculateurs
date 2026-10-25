/**
 * Lecture minimale du fichier .env (sans dépendance) : seules les variables demandées sont
 * chargées, sans écraser celles déjà définies, et leurs valeurs ne sont jamais affichées.
 */
const fs = require("fs");

function chargerEnv(fichier, noms) {
  if (!fs.existsSync(fichier)) return [];
  const charges = [];
  for (const ligne of fs.readFileSync(fichier, "utf8").split(/\r?\n/)) {
    const m = ligne.match(/^\s*(?:export\s+)?([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (!m || !noms.includes(m[1]) || process.env[m[1]]) continue;
    process.env[m[1]] = m[2].replace(/^(['"])(.*)\1$/, "$2");
    charges.push(m[1]);
  }
  return charges;
}

module.exports = { chargerEnv };
