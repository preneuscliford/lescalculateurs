#!/usr/bin/env node
/**
 * Scan de mots-clés orienté « calcul personnel » (dates, délais, montants, durées).
 *
 *   node scripts/keyword-scan/scan.cjs [--themes=chomage,caf,logement] [--dry-run]
 *        [--sans-expansion] [--cse=40] [--top=60]
 *
 * 1. Autocomplétion Google sur les amorces de seeds.json (+ expansion a…z), cache 30 jours,
 *    1 requête toutes les 2 à 3 s, arrêt propre sur 429.
 * 2. Classement : calcul personnel ou information générale.
 * 3. Croisement facultatif avec les CSV de reports/keyword-scan/input/ (Search Console, Semrush).
 * 4. Contrôle des 10 premiers résultats Google (Custom Search, si GOOGLE_CSE_KEY et
 *    GOOGLE_CSE_CX sont définies) sur les meilleurs candidats.
 * 5. Rapport Markdown + CSV par thème dans reports/keyword-scan/<date>/.
 * --dry-run : aucun appel réseau, uniquement le cache.
 */
const fs = require("fs");
const path = require("path");
const { normaliser } = require("./lib/normaliser.cjs");
const { creerCache } = require("./lib/cache.cjs");
const { creerAutocompletion, ArretScan } = require("./lib/autocompletion.cjs");
const { classer } = require("./lib/classement.cjs");
const { creerSerp, niveauConcurrence } = require("./lib/serp.cjs");
const { chargerEntrees } = require("./lib/entrees.cjs");
const { scorer, proposer } = require("./lib/score.cjs");
const { ecrireRapportTheme } = require("./lib/rapport.cjs");

const racine = path.resolve(__dirname, "../..");
const dossierRapports = path.join(racine, "reports/keyword-scan");
const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v = "true"] = a.replace(/^--/, "").split("=");
    return [k, v];
  }),
);
const dryRun = args["dry-run"] === "true";
const config = JSON.parse(fs.readFileSync(path.join(__dirname, "config.json"), "utf8"));
const seeds = JSON.parse(fs.readFileSync(path.join(__dirname, "seeds.json"), "utf8"));
const themesDemandes = (args.themes || "chomage,caf,logement").split(",").map((s) => s.trim());
const themes = seeds.themes.filter((t) => themesDemandes.includes(t.id));
if (!themes.length) {
  console.error(`Aucun thème reconnu dans --themes=${args.themes}. Thèmes : ${seeds.themes.map((t) => t.id).join(", ")}`);
  process.exit(1);
}

const journal = (m) => console.log(m);
const cache = creerCache(path.join(dossierRapports, "cache"), config.cacheTtlJours);
const auto = creerAutocompletion({ cache, delaiMinMs: config.delaiMinMs, delaiMaxMs: config.delaiMaxMs, dryRun, journal });
const serp = creerSerp({ cache, config, dryRun, journal });
const entrees = chargerEntrees(path.join(dossierRapports, "input"));

/** Requêtes à envoyer pour un thème : amorces, débuts communs × termes, expansion a…z */
function requetesTheme(theme) {
  const req = new Map(); // requête -> { amorce, directe }
  const ajouter = (q, amorce, directe) => {
    const k = q.trim();
    if (k && !req.has(k)) req.set(k, { amorce, directe });
  };
  for (const a of theme.amorces) ajouter(a, a, true);
  for (const terme of theme.termes) {
    for (const debut of seeds.debutsCommuns) ajouter(`${debut} ${terme}`, `${debut} ${terme}`, true);
    for (const fin of seeds.suffixesCommuns) ajouter(`${terme} ${fin}`, `${terme} ${fin}`, true);
  }
  if (args["sans-expansion"] !== "true") {
    for (const a of theme.expansion) for (const l of config.lettresExpansion) ajouter(`${a} ${l}`, a, false);
  }
  return req;
}

const contientMot = (t, mot) => new RegExp(`\\b${normaliser(mot)}\\b`).test(t);
const garderPourTheme = (theme, formulation) => {
  const t = normaliser(formulation);
  return theme.filtre.some((f) => contientMot(t, f)) && !(theme.exclure || []).some((m) => contientMot(t, m));
};

// Les exports Search Console et Semrush enrichissent le signal des suggestions. Ils n'ajoutent
// eux-mêmes des candidats que pour les questions de date, de délai ou de durée (nouvelle direction) :
// les requêtes génériques (« simulation apl ») relèvent des simulateurs existants.
const TYPES_NOUVEAUX = ["date", "delai", "duree"];
const candidatExterne = (theme, texte) => garderPourTheme(theme, texte) && TYPES_NOUVEAUX.includes(classer(texte).typeCalcul);

async function scannerTheme(theme) {
  const candidats = new Map(); // formulation normalisée -> candidat
  const ajouterCandidat = (texte, amorce) => {
    const k = normaliser(texte);
    if (!k) return null;
    let c = candidats.get(k);
    if (!c) {
      c = { formulation: texte, theme: theme.id, amorces: new Set(), sources: {} };
      candidats.set(k, c);
    }
    if (amorce) c.amorces.add(amorce);
    return c;
  };

  const requetes = requetesTheme(theme);
  let n = 0;
  let arret = null;
  for (const [q, { amorce, directe }] of requetes) {
    n++;
    if (n % 25 === 0) journal(`  ${theme.id} : ${n}/${requetes.size} requêtes`);
    let liste;
    try {
      liste = await auto.suggestions(q);
    } catch (e) {
      if (e instanceof ArretScan) {
        arret = e.message;
        break;
      }
      journal(`  ! ${q} : ${e.message}`);
      continue;
    }
    liste.forEach((s, rang) => {
      if (!garderPourTheme(theme, s)) return;
      const c = ajouterCandidat(s, amorce);
      const a = c.sources.autocompletion || { occurrences: 0, meilleurRang: 99, directe: false };
      a.occurrences++;
      a.meilleurRang = Math.min(a.meilleurRang, rang);
      a.directe = a.directe || directe;
      c.sources.autocompletion = a;
    });
  }

  // Requêtes Search Console et mots-clés Semrush de date, délai ou durée, même absents de l'autocomplétion
  for (const v of entrees.gsc.values()) if (candidatExterne(theme, v.texte)) ajouterCandidat(v.texte, "search console");
  for (const v of entrees.semrush.values()) if (candidatExterne(theme, v.texte)) ajouterCandidat(v.texte, "semrush");
  for (const [k, c] of candidats) {
    if (entrees.gsc.has(k)) c.sources.gsc = entrees.gsc.get(k);
    if (entrees.semrush.has(k)) c.sources.semrush = entrees.semrush.get(k);
    c.classement = classer(c.formulation);
    Object.assign(c, scorer(c));
  }

  // Concurrence : seulement sur les meilleurs candidats de calcul (quota de 100 requêtes par jour)
  const aVerifier = [...candidats.values()]
    .filter((c) => c.classement.categorie === "calcul")
    .sort((a, b) => b.score - a.score)
    .slice(0, Number(args.cse || config.cseMaxParScan));
  for (const c of aVerifier) {
    if (!serp.disponible && !dryRun) break;
    const resultats = await serp.top10(c.formulation);
    c.concurrence = niveauConcurrence(resultats);
    Object.assign(c, scorer(c));
  }

  for (const c of candidats.values()) {
    if (!c.concurrence) c.concurrence = niveauConcurrence(null);
    Object.assign(c, proposer(c, theme, { seuilPageDediee: config.seuilPageDediee }));
  }
  return { candidats: [...candidats.values()], requetes: requetes.size, arret };
}

(async () => {
  const date = new Date().toISOString().slice(0, 10);
  const dossier = path.join(dossierRapports, date);
  journal(`Scan ${dryRun ? "(dry-run, cache uniquement) " : ""}des thèmes : ${themes.map((t) => t.id).join(", ")}`);
  if (entrees.fichiers.length) journal(`Entrées : ${entrees.fichiers.join(" ; ")}`);
  if (!serp.disponible) journal("Custom Search : GOOGLE_CSE_KEY / GOOGLE_CSE_CX absentes, concurrence non vérifiée (sauf cache).");

  const resume = [];
  let arret = null;
  for (const theme of themes) {
    if (arret) break;
    journal(`\n${theme.libelle}`);
    const r = await scannerTheme(theme);
    arret = r.arret;
    const sources = [
      `autocomplétion Google (${r.requetes} requêtes${dryRun ? ", cache uniquement" : ""})`,
      ...entrees.fichiers,
    ];
    const concurrence =
      serp.disponible || serp.stats.cache
        ? `Custom Search (${serp.stats.reseau} appels, ${serp.stats.cache} en cache${serp.stats.horsQuota ? `, ${serp.stats.horsQuota} hors quota` : ""})`
        : "non vérifiée (clés GOOGLE_CSE_KEY / GOOGLE_CSE_CX absentes)";
    ecrireRapportTheme({ dossier, theme, candidats: r.candidats, meta: { date, sources, concurrence }, top: Number(args.top || 60) });
    const calc = r.candidats.filter((c) => c.classement.categorie === "calcul");
    resume.push({ theme, total: r.candidats.length, calcul: calc.length, dediees: calc.filter((c) => c.proposition === "page dédiée à étudier").length });
    journal(`  -> ${r.candidats.length} formulations, ${calc.length} de calcul personnel`);
  }

  const index = [
    `# Scan de mots-clés (${date})`,
    "",
    "| Thème | Formulations | Calcul personnel | Pages dédiées à étudier | Rapport |",
    "|---|---:|---:|---:|---|",
    ...resume.map((x) => `| ${x.theme.libelle} | ${x.total} | ${x.calcul} | ${x.dediees} | [${x.theme.id}.md](${x.theme.id}.md) |`),
    "",
    `Requêtes d'autocomplétion : ${auto.stats.reseau} sur le réseau, ${auto.stats.cache} depuis le cache${auto.stats.manquants ? `, ${auto.stats.manquants} absentes du cache (dry-run)` : ""}.`,
    arret ? `\n**Scan interrompu** : ${arret}` : "",
  ].join("\n");
  fs.mkdirSync(dossier, { recursive: true });
  fs.writeFileSync(path.join(dossier, "index.md"), index + "\n", "utf8");
  journal(`\nRapport : ${path.relative(racine, dossier)}/index.md`);
  if (arret) {
    console.error(arret);
    process.exit(2);
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
