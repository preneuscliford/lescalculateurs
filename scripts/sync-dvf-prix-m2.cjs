#!/usr/bin/env node
/**
 * Synchronise le prix median au m2 (DVF, DGFiP/Etalab) par commune.
 *
 * Telecharge le fichier national geo-dvf de l'annee la plus recente
 * (https://files.data.gouv.fr/geo-dvf/latest/csv/{annee}/full.csv.gz) vers
 * un fichier local, puis fait deux passes dessus :
 *   1) compte, par id_mutation, le nombre de lots Appartement / Maison
 *      (une mutation peut regrouper plusieurs biens sous UNE seule
 *      valeur_fonciere totale : diviser cette valeur par la surface d'un
 *      seul lot fausserait totalement le prix/m2 si on ne filtre pas) ;
 *   2) ne retient que les mutations "1 seul bien" (1 Appartement OU 1
 *      Maison, pas les deux, pas de doublon) pour calculer un prix/m2
 *      median fiable par commune et par type de bien.
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
const os = require("os");

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

async function downloadTo(url, destPath) {
  const res = await fetch(url);
  if (!res.ok || !res.body) {
    throw new Error(`HTTP ${res.status} sur ${url}`);
  }
  await require("stream/promises").pipeline(require("stream").Readable.fromWeb(res.body), fs.createWriteStream(destPath));
}

function readIndex(header) {
  return {
    idMutation: header.indexOf("id_mutation"),
    nature: header.indexOf("nature_mutation"),
    valeur: header.indexOf("valeur_fonciere"),
    codeCommune: header.indexOf("code_commune"),
    nomCommune: header.indexOf("nom_commune"),
    codeDept: header.indexOf("code_departement"),
    typeLocal: header.indexOf("type_local"),
    surface: header.indexOf("surface_reelle_bati"),
  };
}

async function forEachLine(localGzPath, onLine) {
  const gunzip = zlib.createGunzip();
  const rl = readline.createInterface({
    input: fs.createReadStream(localGzPath).pipe(gunzip),
    crlfDelay: Infinity,
  });
  let idx = null;
  for await (const line of rl) {
    if (!idx) {
      idx = readIndex(line.split(","));
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
  const localGz = path.join(os.tmpdir(), `dvf-full-${annee}.csv.gz`);

  console.log(`Telechargement: ${url}`);
  await downloadTo(url, localGz);
  console.log(`Telecharge vers ${localGz}`);

  // Passe 1 : compte les lots Appartement/Maison par mutation.
  console.log("Passe 1/2 : comptage des lots par mutation…");
  const mutationCounts = new Map();
  let totalLines = 0;
  await forEachLine(localGz, (line, idx) => {
    totalLines++;
    const cols = line.split(",");
    if (cols.length < 30) return;
    const type = cols[idx.typeLocal];
    if (type !== "Appartement" && type !== "Maison") return;
    if (cols[idx.nature] !== "Vente") return;

    const id = cols[idx.idMutation];
    if (!mutationCounts.has(id)) mutationCounts.set(id, { Appartement: 0, Maison: 0 });
    mutationCounts.get(id)[type]++;
  });
  console.log(`Lignes lues: ${totalLines}, mutations avec Appartement/Maison: ${mutationCounts.size}`);

  // Passe 2 : ne garde que les mutations "1 seul bien" pour le calcul du prix/m2.
  console.log("Passe 2/2 : calcul des prix/m2 sur les ventes a lot unique…");
  const communeData = new Map();
  const deptData = new Map();
  const communeNames = new Map();
  let kept = 0;

  const getBucket = (map, key, type) => {
    if (!map.has(key)) map.set(key, { Appartement: [], Maison: [] });
    return map.get(key)[type];
  };

  await forEachLine(localGz, (line, idx) => {
    const cols = line.split(",");
    if (cols.length < 30) return;

    const type = cols[idx.typeLocal];
    if (type !== "Appartement" && type !== "Maison") return;
    if (cols[idx.nature] !== "Vente") return;

    const id = cols[idx.idMutation];
    const counts = mutationCounts.get(id);
    if (!counts) return;
    // Mutation "1 seul bien" : exactement 1 lot du type concerne, et aucun lot de l'autre type residentiel.
    if (type === "Appartement" && !(counts.Appartement === 1 && counts.Maison === 0)) return;
    if (type === "Maison" && !(counts.Maison === 1 && counts.Appartement === 0)) return;

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

  try {
    fs.unlinkSync(localGz);
  } catch (_) {
    /* fichier temporaire, tant pis si le nettoyage echoue */
  }

  console.log(`Ventes a lot unique retenues: ${kept}`);
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
