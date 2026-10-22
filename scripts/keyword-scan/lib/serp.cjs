/**
 * Contrôle des 10 premiers résultats Google via l'API Custom Search (offre gratuite : 100
 * requêtes par jour). Clés lues dans GOOGLE_CSE_KEY et GOOGLE_CSE_CX, jamais dans le code.
 */

const URL_CSE = "https://www.googleapis.com/customsearch/v1";

function domaine(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function correspond(host, motif) {
  return host === motif || host.endsWith("." + motif);
}

/** Classe un résultat : fort (concurrent avec simulateur), faible (PDF, forum…) ou neutre */
function qualifierResultat({ url, titre = "" }, config) {
  const host = domaine(url);
  if (config.siteSuivi && correspond(host, config.siteSuivi)) return { host, force: "site", raison: "notre site" };
  if (/\.pdf($|\?)/i.test(url)) return { host, force: "faible", raison: "PDF" };
  if (config.domainesFaibles.some((m) => correspond(host, m))) return { host, force: "faible", raison: "domaine faible" };
  if (/forum|communaute|reddit|doctissimo|commentcamarche\.net\/forum/i.test(url)) return { host, force: "faible", raison: "forum" };
  if (config.domainesForts.some((m) => correspond(host, m))) return { host, force: "forte", raison: "concurrent installé" };
  if (/simulat|calcul/i.test(titre + " " + url)) return { host, force: "forte", raison: "page de calcul" };
  return { host, force: "neutre", raison: "" };
}

/** Synthèse de la concurrence sur les 10 premiers résultats */
function niveauConcurrence(resultats) {
  if (!resultats) return { niveau: "non vérifiée", forts: 0, faibles: 0, domaines: [] };
  const forts = resultats.filter((r) => r.force === "forte").length;
  const faibles = resultats.filter((r) => r.force === "faible").length;
  // forte : au moins 3 concurrents installés ; faible : aucun (résultats PDF, forums, articles)
  const niveau = forts >= 3 ? "forte" : forts >= 1 ? "moyenne" : "faible";
  const rangSite = resultats.findIndex((r) => r.force === "site");
  return { niveau, forts, faibles, rangSite: rangSite >= 0 ? rangSite + 1 : null, domaines: resultats.map((r) => r.host) };
}

function creerSerp({ cache, config, dryRun = false, journal = () => {} }) {
  const cle = process.env.GOOGLE_CSE_KEY;
  const cx = process.env.GOOGLE_CSE_CX;
  const disponible = Boolean(cle && cx);
  const jour = new Date().toISOString().slice(0, 10);
  const quota = cache.lire(`quota-cse:${jour}`) || { utilisees: 0 };
  const stats = { reseau: 0, cache: 0, horsQuota: 0 };

  async function top10(q) {
    const cleCache = `cse:fr:${q}`;
    const enCache = cache.lire(cleCache, { memeExpire: dryRun });
    if (enCache) {
      stats.cache++;
      return enCache.map((r) => qualifierResultat(r, config));
    }
    if (dryRun || !disponible) return null;
    if (quota.utilisees >= config.quotaCseJour) {
      stats.horsQuota++;
      return null;
    }
    const url = `${URL_CSE}?key=${encodeURIComponent(cle)}&cx=${encodeURIComponent(cx)}&gl=fr&hl=fr&lr=lang_fr&num=10&q=${encodeURIComponent(q)}`;
    const reponse = await fetch(url);
    quota.utilisees++;
    cache.ecrire(`quota-cse:${jour}`, quota);
    if (!reponse.ok) {
      journal(`  ! Custom Search ${q} : HTTP ${reponse.status}`);
      if (reponse.status === 429 || reponse.status === 403) quota.utilisees = config.quotaCseJour;
      return null;
    }
    const donnees = await reponse.json();
    const resultats = (donnees.items || []).map((it) => ({ url: it.link, titre: it.title || "" }));
    stats.reseau++;
    cache.ecrire(cleCache, resultats);
    return resultats.map((r) => qualifierResultat(r, config));
  }

  return { top10, disponible, stats, quotaRestant: () => Math.max(0, config.quotaCseJour - quota.utilisees) };
}

module.exports = { creerSerp, qualifierResultat, niveauConcurrence, domaine };
