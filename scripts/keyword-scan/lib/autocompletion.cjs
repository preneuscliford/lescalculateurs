/**
 * Suggestions de l'autocomplétion Google (service non officiel) :
 * une requête toutes les 2 à 3 secondes au plus, cache de 30 jours, arrêt propre sur 429.
 */

const URL_SUGGEST = "https://suggestqueries.google.com/complete/search";

class ArretScan extends Error {
  constructor(message) {
    super(message);
    this.name = "ArretScan";
  }
}

const attendre = (ms) => new Promise((r) => setTimeout(r, ms));

function creerAutocompletion({ cache, delaiMinMs = 2000, delaiMaxMs = 3000, dryRun = false, journal = () => {} }) {
  let dernierAppel = 0;
  const stats = { reseau: 0, cache: 0, manquants: 0 };

  async function suggestions(q) {
    const cle = `suggest:fr:${q}`;
    const enCache = cache.lire(cle);
    if (enCache) {
      stats.cache++;
      return enCache;
    }
    if (dryRun) {
      // Sans réseau : on accepte une entrée expirée plutôt que rien
      const ancienne = cache.lire(cle, { memeExpire: true });
      if (ancienne) {
        stats.cache++;
        return ancienne;
      }
      stats.manquants++;
      return [];
    }

    const pause = delaiMinMs + Math.random() * (delaiMaxMs - delaiMinMs) - (Date.now() - dernierAppel);
    if (pause > 0) await attendre(pause);
    dernierAppel = Date.now();

    const url = `${URL_SUGGEST}?client=firefox&hl=fr&gl=fr&ie=utf-8&oe=utf-8&q=${encodeURIComponent(q)}`;
    const reponse = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (lescalculateurs.fr keyword-scan)" } });
    if (reponse.status === 429) {
      throw new ArretScan("Autocomplétion : erreur 429 (trop de requêtes). Scan arrêté, relancez plus tard : le cache sera réutilisé.");
    }
    if (!reponse.ok) {
      journal(`  ! ${q} : HTTP ${reponse.status}, ignorée`);
      return [];
    }
    const brut = new Uint8Array(await reponse.arrayBuffer());
    const charset = (reponse.headers.get("content-type") || "").match(/charset=([\w-]+)/i)?.[1] || "utf-8";
    const donnees = JSON.parse(new TextDecoder(charset).decode(brut));
    const liste = Array.isArray(donnees?.[1]) ? donnees[1].map(String) : [];
    stats.reseau++;
    cache.ecrire(cle, liste);
    return liste;
  }

  return { suggestions, stats };
}

module.exports = { creerAutocompletion, ArretScan };
