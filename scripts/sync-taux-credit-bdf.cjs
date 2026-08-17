#!/usr/bin/env node
/**
 * Synchronise le taux de credit immobilier indicatif de pret.html depuis
 * l'API Webstat de la Banque de France (gratuite, officielle, verifiee le
 * 17/08/2026 - voir docs/recherche-api-temps-reel.md).
 *
 * Serie utilisee : MIR.M.FR.B.A2C.P.R.A.2250.EUR.N
 * "Taux d'interet sur contrats nouveaux, Credits a l'habitat, Menages,
 * PFIT superieure a 10 ans" - taux nominal (hors assurance/frais), le plus
 * proche de ce qu'affiche pret.html ("hors assurance"). A ne pas confondre
 * avec le TEG (serie ...A2C.A.C.A...) qui inclut assurance+frais et donne
 * un chiffre plus eleve.
 *
 * Le taux Banque de France est une moyenne reelle du marche (tous profils,
 * y compris gros dossiers/bons profils qui tirent la moyenne vers le bas),
 * avec ~1 mois de decalage - different des "barometres" de courtiers qui
 * annoncent le meilleur taux accessible aujourd'hui. Voir la note dans
 * pret.html.
 *
 * Usage : node scripts/sync-taux-credit-bdf.cjs [--dry-run]
 * A rebrancher plus tard sur un job planifie (GitHub Actions mensuel).
 */

const fs = require("fs");
const path = require("path");

const SERIES_KEY = "MIR.M.FR.B.A2C.P.R.A.2250.EUR.N";
const OBSERVATIONS_URL =
  "https://webstat.banque-france.fr/api/explore/v2.1/catalog/datasets/observations/records";
const CACHE_PATH = path.resolve(process.cwd(), "data", "taux-credit-bdf.json");
const PRET_HTML_PATH = path.resolve(process.cwd(), "src", "pages", "pret.html");

function readEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  const env = {};
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed
      .slice(idx + 1)
      .trim()
      .replace(/^"|"$/g, "");
    env[key] = value;
  }
  return env;
}

async function fetchLatestRate(apiKey) {
  const where = encodeURIComponent(`series_key="${SERIES_KEY}"`);
  const url = `${OBSERVATIONS_URL}?where=${where}&order_by=time_period_start%20desc&limit=1`;
  const res = await fetch(url, { headers: { Authorization: `Apikey ${apiKey}` } });
  if (!res.ok) {
    throw new Error(`Webstat API a repondu ${res.status}: ${await res.text()}`);
  }
  const json = await res.json();
  const record = json.results?.[0];
  if (!record) {
    throw new Error(`Aucune observation trouvee pour la serie ${SERIES_KEY}`);
  }
  return {
    seriesKey: record.series_key,
    titleFr: record.title_fr,
    timePeriod: record.time_period,
    value: record.obs_value,
    fetchedAt: new Date().toISOString(),
  };
}

/** Arrondit au 0,1 le plus proche, format francais avec virgule ("3,2"). */
function formatRateFr(value) {
  const rounded = Math.round(value * 10) / 10;
  return rounded.toFixed(1).replace(".", ",");
}

function loadCache() {
  if (!fs.existsSync(CACHE_PATH)) return null;
  try {
    return JSON.parse(fs.readFileSync(CACHE_PATH, "utf-8"));
  } catch {
    return null;
  }
}

function saveCache(data) {
  fs.mkdirSync(path.dirname(CACHE_PATH), { recursive: true });
  fs.writeFileSync(CACHE_PATH, JSON.stringify(data, null, 2) + "\n", "utf-8");
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const envFile = readEnvFile(path.resolve(process.cwd(), ".env"));
  const apiKey = process.env.BANQUE_DE_FRANCE_API_KEY || envFile.BANQUE_DE_FRANCE_API_KEY;

  if (!apiKey) {
    console.error("Erreur: BANQUE_DE_FRANCE_API_KEY introuvable (env ou .env).");
    process.exit(1);
  }

  const observation = await fetchLatestRate(apiKey);
  const rateFr = formatRateFr(observation.value);

  console.log(`Serie      : ${observation.seriesKey}`);
  console.log(`Periode    : ${observation.timePeriod}`);
  console.log(`Valeur brute: ${observation.value}%`);
  console.log(`Arrondi    : ${rateFr}%`);

  const cache = loadCache();
  const unchanged = cache && cache.timePeriod === observation.timePeriod && cache.rateFr === rateFr;

  if (unchanged) {
    console.log("Aucun changement depuis la derniere synchro.");
    return;
  }

  if (dryRun) {
    console.log("(--dry-run) Pas d'ecriture. Rate calcule:", rateFr + "%");
    return;
  }

  saveCache({
    ...observation,
    rateFr,
    source: "https://webstat.banque-france.fr/fr/",
  });
  console.log(`✅ Cache mis a jour dans ${path.relative(process.cwd(), CACHE_PATH)}`);
  console.log(
    `ℹ️ Pour propager ${rateFr}% dans pret.html, lancer : node scripts/apply-taux-credit-bdf.cjs`,
  );
}

main().catch((err) => {
  console.error("Echec de la synchro taux credit BdF:", err.message);
  process.exit(1);
});
