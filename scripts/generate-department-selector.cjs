#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

// Charger les données
const departements = JSON.parse(
  fs.readFileSync("src/data/departements.json", "utf-8")
);
const baremes = JSON.parse(fs.readFileSync("src/data/baremes.json", "utf-8"));

// Fonction pct: convertir decimal en pourcentage formaté
const pct = (n) => {
  const p = n * 100;
  const t = Math.floor(p * 100) / 100;
  return `${t.toFixed(2)}`;
};

// Créer les options du sélecteur
const options = Object.entries(departements)
  .map(([code, data]) => {
    let tauxDmto = baremes.dmto[code] || 5.81; // Fallback 5.81%
    // baremes.dmto stocke les pourcentages comme 5.81, pas 0.0581
    const tauxDmtoDecimal = tauxDmto / 100;
    return `  { value: "${code}", label: \`${code} - ${data.nom} (${pct(
      tauxDmtoDecimal
    )}%)\` }`;
  })
  .sort((a, b) => {
    const codeA = a.match(/value: "([^"]+)"/)[1];
    const codeB = b.match(/value: "([^"]+)"/)[1];
    return codeA.localeCompare(codeB, "fr", { numeric: true });
  });

console.log("Generated department selector options:");
console.log("[");
console.log(options.join(",\n"));
console.log("]");

// Sauvegarder dans un fichier temporaire pour copier-coller
const outputFile = "department-selector-options.js";
fs.writeFileSync(outputFile, `[\n${options.join(",\n")}\n]\n`);
console.log(`\n✅ Options générées dans ${outputFile}`);
console.log(`📋 Total: ${options.length} départements`);
