#!/usr/bin/env node

/**
 * Vérifie les données de la page revenu-median-commune.html
 * contre le CSV source vdf/revenu-des-francais-a-la-commune-*.csv
 */

const fs = require("fs");
const path = require("path");

const CSV_PATH = path.resolve(
  __dirname,
  "..",
  "vdf",
  "revenu-des-francais-a-la-commune-1765372688826.csv",
);

// Les 25 villes du panel (nom exact tel qu'affiche sur la page)
const VILLES = [
  "Aix-en-Provence",
  "Bordeaux",
  "Nantes",
  "Rennes",
  "Dijon",
  "Nancy",
  "Toulouse",
  "Grenoble",
  "Caen",
  "Nice",
  "Angers",
  "Brest",
  "Orléans",
  "Tours",
  "Metz",
  "Besançon",
  "Valence",
  "Lille",
  "Clermont-Ferrand",
  "Dunkerque",
  "Reims",
  "Montpellier",
  "Saint-Étienne",
  "Nîmes",
  "Tourcoing",
];

// Valeurs affichées sur la page actuelle (après correction)
const PAGE_VALUES = {
  "Aix-en-Provence": { annuel: 25810, rang: 1 },
  Bordeaux: { annuel: 24870, rang: 2 },
  Nantes: { annuel: 24170, rang: 3 },
  Rennes: { annuel: 22770, rang: 4 },
  Dijon: { annuel: 22720, rang: 5 },
  Nancy: { annuel: 22360, rang: 6 },
  Toulouse: { annuel: 22140, rang: 7 },
  Grenoble: { annuel: 22140, rang: 8 },
  Caen: { annuel: 21600, rang: 9 },
  Nice: { annuel: 21570, rang: 10 },
  Angers: { annuel: 21450, rang: 11 },
  Brest: { annuel: 21420, rang: 12 },
  Orléans: { annuel: 21370, rang: 13 },
  Tours: { annuel: 21250, rang: 14 },
  Metz: { annuel: 20940, rang: 15 },
  Besançon: { annuel: 20680, rang: 16 },
  Valence: { annuel: 20610, rang: 17 },
  Lille: { annuel: 20520, rang: 18 },
  "Clermont-Ferrand": { annuel: 20430, rang: 19 },
  Dunkerque: { annuel: 20240, rang: 20 },
  Reims: { annuel: 20210, rang: 21 },
  Montpellier: { annuel: 19670, rang: 22 },
  "Saint-Étienne": { annuel: 19010, rang: 23 },
  Nîmes: { annuel: 18760, rang: 24 },
  Tourcoing: { annuel: 18300, rang: 25 },
};

// Parcourir le CSV et extraire les villes
const content = fs.readFileSync(CSV_PATH, "utf-8");
const lines = content.split("\n");
const header = lines[0].split(";");

// Trouver les indices des colonnes
// [DISP] Médiane (€) → colonne avec "Médiane" et "DISP"
// [DEC] Médiane (€) → colonne avec "Médiane" et "DEC"
let idxDispMediane = -1;
let idxDecMediane = -1;
let idxNom = -1;
let idxCompartDec = -1;

for (let i = 0; i < header.length; i++) {
  const h = header[i];
  if (h === "Nom géographique GMS") idxNom = i;
  if (h.includes("DISP") && h.includes("Médiane")) idxDispMediane = i;
  if (h.includes("DEC") && h.includes("Médiane")) idxDecMediane = i;
  if (h.includes("DEC") && h.includes("ménages fiscaux imposés")) idxCompartDec = i;
}

console.log(
  `Colonnes identifiées: Nom=${idxNom}, DISP Médiane=${idxDispMediane}, DEC Médiane=${idxDecMediane}, Part imposés DEC=${idxCompartDec}`,
);

// Chercher chaque ville
const found = {};

for (let i = 1; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;
  const cols = line.split(";");
  const nom = cols[idxNom]?.trim();

  for (const ville of VILLES) {
    if (nom && nom.toLowerCase() === ville.toLowerCase()) {
      const dispMed = cols[idxDispMediane]
        ? parseInt(cols[idxDispMediane].replace(/\s/g, "")) || null
        : null;
      const decMed = cols[idxDecMediane]
        ? parseInt(cols[idxDecMediane].replace(/\s/g, "")) || null
        : null;
      const partImp = cols[idxCompartDec] ? parseFloat(cols[idxCompartDec]) || null : null;
      found[ville] = { nom, dispMediane: dispMed, decMediane: decMed, partImposesDec: partImp };
    }
  }
}

// Afficher la comparaison
console.log("");
console.log("=".repeat(80));
console.log("  COMPARAISON PAGE vs CSV SOURCE");
console.log("=".repeat(80));
console.log("");

const medians = [];
let erreurs = 0;

for (const [ville, pageData] of Object.entries(PAGE_VALUES)) {
  const csv = found[ville];
  const pageVal = pageData.annuel;

  if (!csv) {
    console.log(`  ❌ ${ville}: NON TROUVÉ dans le CSV !`);
    erreurs++;
    continue;
  }

  // Utiliser DISP Médiane (disponible) ou DEC Médiane (décile)
  const csvMediane = csv.dispMediane || csv.decMediane;
  medians.push(csvMediane);

  const diff = csvMediane ? csvMediane - pageVal : "N/A";
  const match = csvMediane === pageVal ? "✓" : csvMediane ? "✗ DIFFÉRENCE" : "⚠ pas de donnée";

  const line = csvMediane
    ? `  ${match} ${ville.padEnd(22)} | Page: ${String(pageVal).padStart(6)} € | CSV: ${String(csvMediane).padStart(6)} € | Diff: ${String(diff).padStart(6)} €`
    : `  ${match} ${ville.padEnd(22)} | Page: ${String(pageVal).padStart(6)} € | CSV: pas de médiane`;

  if (match.startsWith("✗")) {
    console.log(line);
    erreurs++;
  } else {
    console.log(line);
  }
}

// Calculer la médiane réelle
const sorted = medians.filter((m) => m !== null && m !== undefined).sort((a, b) => a - b);
const medianeReelle = sorted.length > 0 ? sorted[Math.floor(sorted.length / 2)] : null;

console.log("");
console.log("─".repeat(80));
console.log(`  Médiane réelle du panel (calculée depuis CSV): ${medianeReelle} €`);
console.log(`  Médiane affichée sur la page: 21 370 € (Orléans)`);
if (medianeReelle && Math.abs(medianeReelle - 21370) <= 50) {
  console.log("  ✓ Cohérent");
} else {
  console.log(`  ✗ À VÉRIFIER - page à corriger`);
  erreurs++;
}
console.log("");
console.log(`  Total erreurs/incohérences: ${erreurs}`);
console.log("=".repeat(80));
