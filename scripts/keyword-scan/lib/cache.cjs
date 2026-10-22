/**
 * Cache disque : une entrée JSON par requête, réutilisée tant qu'elle a moins de `ttlJours`.
 */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

function creerCache(dossier, ttlJours = 30) {
  fs.mkdirSync(dossier, { recursive: true });
  const fichier = (cle) => path.join(dossier, crypto.createHash("sha1").update(cle).digest("hex").slice(0, 16) + ".json");

  return {
    /** Valeur en cache (même expirée si `memeExpire`), ou undefined */
    lire(cle, { memeExpire = false } = {}) {
      const f = fichier(cle);
      if (!fs.existsSync(f)) return undefined;
      try {
        const entree = JSON.parse(fs.readFileSync(f, "utf8"));
        const ageJours = (Date.now() - new Date(entree.date).getTime()) / 86400000;
        if (!memeExpire && ageJours > ttlJours) return undefined;
        return entree.valeur;
      } catch {
        return undefined;
      }
    },
    ecrire(cle, valeur) {
      fs.writeFileSync(fichier(cle), JSON.stringify({ cle, date: new Date().toISOString(), valeur }, null, 1), "utf8");
    },
  };
}

module.exports = { creerCache };
