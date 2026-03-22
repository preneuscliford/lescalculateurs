/**
 * Script de mise a jour des pages departements frais de notaire
 * Sans dependance externe (pas de glob)
 */

const fs = require("fs");
const path = require("path");

const deptDir = path.join(__dirname, "../src/pages/blog/departements");

function updateFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return false;
  }

  let content = fs.readFileSync(filePath, "utf8");
  const originalContent = content;

  // ========================================
  // 1. Corrections des taux DMTO obsoletes
  // ========================================

  // Ancien taux reduit incorrect
  content = content.replace(/3,80\s*%/g, "5,09%");
  content = content.replace(/≈\s*3,80/g, "≈ 5,09");

  // Ancien taux majore incorrect (IDF)
  content = content.replace(/6,45\s*%/g, "6,32%");
  content = content.replace(/≈\s*6,45/g, "≈ 6,32");

  // Paris ancien taux
  content = content.replace(/5,81\s*%/g, "6,32%");
  content = content.replace(/≈\s*5,81/g, "≈ 6,32");

  // ========================================
  // 2. Mise a jour annees
  // ========================================

  // 2025 → 2026 pour les frais notaire
  content = content.replace(/frais de notaire 2025/gi, "frais de notaire 2026");
  content = content.replace(/Frais de notaire 2025/g, "Frais de notaire 2026");
  content = content.replace(/frais notaire 2025/gi, "frais notaire 2026");
  content = content.replace(/notaire 2025/gi, "notaire 2026");

  // Baremes
  content = content.replace(
    /Baremes officiels 2024-2025/g,
    "Baremes officiels 2026",
  );
  content = content.replace(
    /baremes officiels 2024-2025/g,
    "baremes officiels 2026",
  );
  content = content.replace(
    /Bareme officiel 2024-2025/g,
    "Bareme officiel 2026",
  );
  content = content.replace(
    /bareme officiel 2024-2025/g,
    "bareme officiel 2026",
  );

  // ========================================
  // 3. Mise a jour sources
  // ========================================

  content = content.replace(
    /https:\/\/bofip\.impots\.gouv\.fr\/bofip\/4739-PGP\.html/g,
    "https://www.impots.gouv.fr/droits-denregistrement",
  );
  content = content.replace(/BOFiP - Taux DMTO/g, "impots.gouv.fr - Taux DMTO");

  // Verifier si modifie
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, "utf8");
    return true;
  }
  return false;
}

// Execution
console.log("🔧 Mise a jour des pages departements...\n");

const files = fs
  .readdirSync(deptDir)
  .filter((f) => f.startsWith("frais-notaire-") && f.endsWith(".html"));

console.log(`📁 ${files.length} fichiers trouves dans ${deptDir}\n`);

let updatedCount = 0;
let errorCount = 0;

for (const file of files) {
  const fullPath = path.join(deptDir, file);
  try {
    if (updateFile(fullPath)) {
      updatedCount++;
    }
  } catch (err) {
    console.error(`❌ Erreur sur ${file}: ${err.message}`);
    errorCount++;
  }
}

console.log(`\n✅ ${updatedCount} fichiers mis a jour`);
if (errorCount > 0) {
  console.log(`❌ ${errorCount} erreurs`);
}
console.log(
  `⏭️ ${files.length - updatedCount - errorCount} fichiers sans changement`,
);
