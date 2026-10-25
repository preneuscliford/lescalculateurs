#!/usr/bin/env node
/**
 * Génère public/data/zones-apl-communes.json : département et zone APL (1, 2, 3) de chaque commune,
 * à partir des données de référence du simulateur service-public « Connaître la zone de sa commune :
 * 1, 1 bis, 2 ou 3 » (DILA, arrêté du 17 mars 1978 révisé) :
 * https://gitlab.com/pidila/sp-simulateurs-data/-/raw/master/donnees-de-reference/Zone123.json
 *
 * Usage : node scripts/build-zones-apl.cjs [chemin/vers/Zone123.json]
 * Sans argument, le fichier est téléchargé.
 *
 * Format : departements[département][zone] = noms de communes normalisés. Codes de zone :
 *   "1" : zone 1 (la zone 1 bis, Paris et 29 communes voisines, est rattachée à la zone 1 :
 *         À VÉRIFIER PAR CLIFF, le texte de l'arrêté du 27 septembre 2019 n'a pas pu être relu)
 *   "2", "3" : zones 2 et 3
 *   "D" : département d'outre-mer (paramètres outre-mer du moteur APL)
 *   "M" : Mayotte (règles propres, non calculé)
 */
const fs = require("fs");
const path = require("path");

const SOURCE_URL =
  "https://gitlab.com/pidila/sp-simulateurs-data/-/raw/master/donnees-de-reference/Zone123.json";
const SORTIE = path.resolve(__dirname, "../public/data/zones-apl-communes.json");

/** Même normalisation que src/utils/questions/communesZones.ts (normaliserNomCommune) */
function normaliser(nom) {
  return String(nom)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/œ/g, "oe")
    .replace(/[’']/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\bst(e?)\b/g, "saint$1")
    .trim();
}

function departement(codeInsee) {
  return codeInsee.startsWith("97") ? codeInsee.slice(0, 3) : codeInsee.slice(0, 2);
}

function zoneApl(commune) {
  const dep = departement(commune.codeInsee);
  if (dep === "976") return "M";
  if (dep.startsWith("97")) return "D";
  return commune.zone === "1 bis" ? "1" : commune.zone;
}

async function main() {
  const fichier = process.argv[2];
  const brut = fichier
    ? fs.readFileSync(fichier, "utf8")
    : await (await fetch(SOURCE_URL)).text();
  const communes = JSON.parse(brut).zone123;
  if (!Array.isArray(communes) || communes.length < 30000) {
    throw new Error(`Données inattendues : ${communes && communes.length} communes`);
  }

  const departements = {};
  for (const c of communes) {
    const zone = zoneApl(c);
    if (!["1", "2", "3", "D", "M"].includes(zone)) throw new Error(`Zone inconnue : ${JSON.stringify(c)}`);
    const dep = departement(c.codeInsee);
    departements[dep] ??= {};
    departements[dep][zone] ??= new Set();
    departements[dep][zone].add(normaliser(c.nomCommune));
  }
  const trie = {};
  for (const dep of Object.keys(departements).sort()) {
    trie[dep] = {};
    for (const zone of Object.keys(departements[dep]).sort()) trie[dep][zone] = [...departements[dep][zone]].sort();
  }

  const sortie = {
    source: "service-public.gouv.fr (DILA), simulateur « Connaître la zone de sa commune : 1, 1 bis, 2 ou 3 »",
    sourceUrl: SOURCE_URL,
    genereLe: new Date().toISOString().slice(0, 10),
    note: "Zone 1 bis rattachée à la zone 1. D : outre-mer, M : Mayotte (non calculé).",
    departements: trie,
  };
  fs.mkdirSync(path.dirname(SORTIE), { recursive: true });
  fs.writeFileSync(SORTIE, JSON.stringify(sortie) + "\n", "utf8");
  console.log(
    `${communes.length} communes, ${Object.keys(trie).length} départements → ${path.relative(process.cwd(), SORTIE)} (${Math.round(fs.statSync(SORTIE).size / 1024)} Ko)`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
