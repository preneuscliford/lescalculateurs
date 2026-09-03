#!/usr/bin/env node
/**
 * Synchronise le prix moyen au m2 (DVF, DGFiP/Etalab) par commune.
 *
 * Telecharge le fichier national geo-dvf de l'annee la plus recente
 * (https://files.data.gouv.fr/geo-dvf/latest/csv/{annee}/full.csv.gz),
 * le decompresse en flux (sans le charger entierement en memoire) et
 * calcule, par commune (code INSEE) et par type de bien (Appartement /
 * Maison), le prix median au m2 sur les ventes "pures" (nature_mutation
 * = Vente) avec une surface batie renseignee et un prix/m2 plausible
 * (entre 300 et 25000 EUR/m2, pour ecarter les erreurs de saisie).
 *
 * Ecrit data/dvf-prix-m2.json (source) + public/data/dvf-prix-m2.json
 * (charge a la demande cote client, meme pattern que resume-ia-summaries).
 *
 * Usage : node scripts/sync-dvf-prix-m2.cjs [--annee=2024] [--dry-run]
 */
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");
const readline = require("readline");

const MIN_PRIX_M2 = 300;
const MAX_PRIX_M2 = 25000;
const MIN_SURFACE = 9;
const MIN_VENTES_COMMUNE = 5;

/**
 * geo.api.gouv.fr resout un code postal vers la commune mere (Paris 75056,
 * Lyon 69123, Marseille 13055), alors que le DVF classe les ventes par
 * arrondissement (751xx/693xx/132xx). On agrege donc aussi vers la commune
 * mere pour que la recherche par code postal fonctionne sur ces 3 villes.
 */
function parentCommuneCode(codeCommune) {
  if (/^751\d\d$/.test(codeCommune)) return "75056";
  if (/^693\d\d$/.test(codeCommune)) return "69123";
  if (/^132\d\d$/.test(codeCommune)) return "13055";
  return null;
}

function median(values) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? Math.round((sorted[mid - 1] + sorted[mid]) / 2) : sorted[mid];
}

async function fetchGunzippedLines(url, onLine) {
  const res = await fetch(url);
  if (!res.ok || !res.body) {
    throw new Error(`HTTP ${res.status} sur ${url}`);
  }
  const gunzip = zlib.createGunzip();
  const nodeStream = require("stream").Readable.fromWeb(res.body);
  const rl = readline.createInterface({ input: nodeStream.pipe(gunzip), crlfDelay: Infinity });
  let header = null;
  let idx = null;
  for await (const line of rl) {
    if (!header) {
      header = line.split(",");
      idx = {
        nature: header.indexOf("nature_mutation"),
        valeur: header.indexOf("valeur_fonciere"),
        codeCommune: header.indexOf("code_commune"),
        nomCommune: header.indexOf("nom_commune"),
        codeDept: header.indexOf("code_departement"),
        typeLocal: header.indexOf("type_local"),
        surface: header.indexOf("surface_reelle_bati"),
      };
      continue;
    }
    onLine(line, idx);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const anneeArg = args.find((a) => a.startsWith("--annee="));
  const annee = anneeArg ? anneeArg.split("=")[1] : "2024";

  const url = `https://files.data.gouv.fr/geo-dvf/latest/csv/${annee}/full.csv.gz`;
  console.log(`Telechargement et analyse: ${url}`);

  const communeData = new Map();
  const deptData = new Map();
  const communeNames = new Map();
  let totalLines = 0;
  let kept = 0;

  const getBucket = (map, key, type) => {
    if (!map.has(key)) map.set(key, { Appartement: [], Maison: [] });
    return map.get(key)[type];
  };

  await fetchGunzippedLines(url, (line, idx) => {
    totalLines++;
    const cols = line.split(",");
    if (cols.length < 30) return;

    const type = cols[idx.typeLocal];
    if (type !== "Appartement" && type !== "Maison") return;
    if (cols[idx.nature] !== "Vente") return;

    const surface = parseFloat(cols[idx.surface]);
    const valeur = parseFloat(cols[idx.valeur]);
    if (!isFinite(surface) || surface < MIN_SURFACE) return;
    if (!isFinite(valeur) || valeur <= 0) return;

    const prixM2 = valeur / surface;
    if (prixM2 < MIN_PRIX_M2 || prixM2 > MAX_PRIX_M2) return;

    const codeCommune = cols[idx.codeCommune];
    const codeDept = cols[idx.codeDept];
    if (!codeCommune || !codeDept) return;

    getBucket(communeData, codeCommune, type).push(prixM2);
    getBucket(deptData, codeDept, type).push(prixM2);
    if (!communeNames.has(codeCommune)) communeNames.set(codeCommune, cols[idx.nomCommune]);

    const parentCode = parentCommuneCode(codeCommune);
    if (parentCode) {
      getBucket(communeData, parentCode, type).push(prixM2);
      if (!communeNames.has(parentCode)) {
        communeNames.set(parentCode, parentCode === "75056" ? "Paris" : parentCode === "69123" ? "Lyon" : "Marseille");
      }
    }

    kept++;
  });

  console.log(`Lignes lues: ${totalLines}, ventes retenues: ${kept}`);
  console.log(`Communes distinctes: ${communeData.size}`);

  const communes = {};
  for (const [code, buckets] of communeData) {
    const appartement = median(buckets.Appartement);
    const maison = median(buckets.Maison);
    if (appartement === null && maison === null) continue;
    communes[code] = {
      nom: communeNames.get(code) || "",
      appartement: appartement ? { prixM2: appartement, n: buckets.Appartement.length } : null,
      maison: maison ? { prixM2: maison, n: buckets.Maison.length } : null,
      fiable: buckets.Appartement.length >= MIN_VENTES_COMMUNE || buckets.Maison.length >= MIN_VENTES_COMMUNE,
    };
  }

  const departements = {};
  for (const [code, buckets] of deptData) {
    const appartement = median(buckets.Appartement);
    const maison = median(buckets.Maison);
    departements[code] = {
      appartement: appartement ? { prixM2: appartement, n: buckets.Appartement.length } : null,
      maison: maison ? { prixM2: maison, n: buckets.Maison.length } : null,
    };
  }

  const output = {
    annee: Number(annee),
    generatedAt: new Date().toISOString(),
    source: "https://files.data.gouv.fr/geo-dvf/latest/csv/",
    sourceDataset: "https://www.data.gouv.fr/datasets/demandes-de-valeurs-foncieres-geolocalisees",
    communes,
    departements,
  };

  console.log(`Communes avec donnees: ${Object.keys(communes).length}`);
  console.log(`Departements avec donnees: ${Object.keys(departements).length}`);

  if (dryRun) {
    console.log("(--dry-run) Pas d'ecriture.");
    return;
  }

  const dataPath = path.resolve(process.cwd(), "data", "dvf-prix-m2.json");
  const publicPath = path.resolve(process.cwd(), "public", "data", "dvf-prix-m2.json");
  fs.mkdirSync(path.dirname(dataPath), { recursive: true });
  fs.mkdirSync(path.dirname(publicPath), { recursive: true });
  const json = JSON.stringify(output);
  fs.writeFileSync(dataPath, json, "utf-8");
  fs.writeFileSync(publicPath, json, "utf-8");
  console.log(`Ecrit: ${path.relative(process.cwd(), dataPath)} (${(json.length / 1024 / 1024).toFixed(2)} Mo)`);
  console.log(`Ecrit: ${path.relative(process.cwd(), publicPath)}`);
}

main().catch((err) => {
  console.error("Echec sync DVF prix/m2:", err.message);
  process.exit(1);
});
