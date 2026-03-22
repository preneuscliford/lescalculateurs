/**
 * Script global de mise a jour 2025 → 2026
 * Exclut les donnees legitimes 2025 :
 * - Bareme IR (revenus 2024 = annee fiscale 2025)
 * - Jours feries 2025
 * - References legales (LF 2025, art. 116, etc.)
 * - Versions de schema
 * - Dates max dans les inputs
 */

const fs = require("fs");
const path = require("path");

// Fichiers a traiter
const filesToUpdate = [
  // Pages principales
  "src/pages/plusvalue.html",
  "src/pages/taxe.html",
  "src/pages/taxe-fonciere/index.html",
  "src/pages/simulateurs.html",
  "src/pages/salaire.html",
  "src/pages/pret.html",
  "src/pages/travail.html",
  // Utils
  "src/utils/autoExportInit.js",
  "src/utils/autoExportInit_new.js",
  "src/utils/autoExportInit_broken.js",
  // Scripts
  "src/pages/scripts/salaire.ts",
];

// Pages qui gardent 2025 (IR = revenus 2024)
const keepAsIs = [
  "src/pages/impot.html",
  "src/pages/scripts/impot.ts",
  "src/pages/scripts/impot-pedagogique.ts",
  "src/pages/sources.html", // IR 2025 legitime
];

function updateFile(filePath) {
  const fullPath = path.join(__dirname, "..", filePath);

  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️ Non trouve: ${filePath}`);
    return false;
  }

  let content = fs.readFileSync(fullPath, "utf8");
  const original = content;

  // Ne pas modifier les dates max (max="2025-12-31")
  // Ne pas modifier les versions de schema
  // Ne pas modifier les jours feries 2025
  // Ne pas modifier LF 2025 / art. 116

  // Remplacement intelligent ligne par ligne
  const lines = content.split("\n");
  const newLines = lines.map((line) => {
    // Skip: dates max, versions, jours feries, references legales
    if (
      line.includes('max="2025') ||
      line.includes("version:") ||
      line.includes('date: "2025-') ||
      line.includes("LF 2025") ||
      line.includes("art. 116") ||
      line.includes("revenus 2025") ||
      line.includes("2025-2026")
    ) {
      return line;
    }

    // Remplacements 2025 → 2026
    return line.replace(/2025/g, "2026");
  });

  content = newLines.join("\n");

  if (content !== original) {
    fs.writeFileSync(fullPath, content, "utf8");
    return true;
  }
  return false;
}

console.log("🔧 Mise a jour globale 2025 → 2026\n");
console.log(
  "⚠️ Exclusions: IR (revenus 2024), jours feries 2025, LF 2025, dates max\n",
);

let count = 0;

for (const file of filesToUpdate) {
  if (updateFile(file)) {
    console.log(`✅ ${file}`);
    count++;
  } else {
    console.log(`⏭️ ${file}`);
  }
}

console.log(`\n🎯 ${count} fichiers mis a jour`);
console.log("\n📋 Fichiers conserves en 2025 (legitimes):");
keepAsIs.forEach((f) => console.log(`   - ${f}`));
