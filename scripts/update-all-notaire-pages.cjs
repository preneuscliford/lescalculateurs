/**
 * Script de mise a jour globale des pages frais de notaire
 * - Corrige les references 2025 → 2026 (sauf impots qui restent en 2025)
 * - Corrige les anciens taux DMTO (3,80%, 6,45%, 5,81%) → nouveaux taux 2026
 * - Met a jour les sources vers impots.gouv.fr
 */

const fs = require("fs");
const path = require("path");
const glob = require("glob");

// Pages a mettre a jour pour les frais de notaire
const notairePages = [
  "src/pages/comment-calculer-frais-notaire.html",
  "src/pages/methodologie.html",
  "src/pages/sources.html",
  "src/pages/blog/frais-notaire-departements.html",
  "src/pages/blog/frais-notaire-ancien-neuf-2026.html",
];

// Pages de departements
const deptPagesPattern = "src/pages/blog/departements/frais-notaire-*.html";

function updateFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️ Fichier non trouve: ${filePath}`);
    return false;
  }

  let content = fs.readFileSync(filePath, "utf8");
  const originalContent = content;

  // ========================================
  // 1. Corrections des taux DMTO obsoletes
  // ========================================

  // Ancien taux reduit incorrect
  content = content.replace(
    /3,80\s*%\s*\(56,?\s*57,?\s*67,?\s*68\)/g,
    "5,09% (36 Indre, 976 Mayotte)",
  );
  content = content.replace(/≈\s*3,80\s*%/g, "5,09%");
  content = content.replace(/3,80%/g, "5,09%");

  // Ancien taux majore incorrect (IDF)
  content = content.replace(
    /6,45\s*%\s*\(92,?\s*93,?\s*94\)/g,
    "6,32% (taux majore)",
  );
  content = content.replace(/≈\s*6,45\s*%/g, "6,32%");
  content = content.replace(/6,45%/g, "6,32%");

  // Paris ancien taux
  content = content.replace(
    /5,81\s*%\s*\(Paris\)/g,
    "6,32% (Paris, taux majore)",
  );
  content = content.replace(/Paris.*5,81\s*%/g, "Paris 6,32%");
  content = content.replace(/≈\s*5,81\s*%/g, "6,32%");

  // ========================================
  // 2. Mise a jour annees (frais notaire uniquement)
  // ========================================

  // Frais de notaire 2025 → 2026
  content = content.replace(/frais de notaire 2025/gi, "frais de notaire 2026");
  content = content.replace(/Frais de notaire 2025/g, "Frais de notaire 2026");
  content = content.replace(/frais notaire 2025/gi, "frais notaire 2026");

  // Bareme notaire 2025 → 2026
  content = content.replace(/bareme notaire 2025/gi, "bareme notaire 2026");
  content = content.replace(/baremes notaire 2025/gi, "baremes notaire 2026");
  content = content.replace(/Bareme notaire 2025/g, "Bareme notaire 2026");

  // Baremes officiels 2024-2025 → 2026
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

  // Emoluments 2025 → 2026
  content = content.replace(
    /emoluments notariaux 2025/gi,
    "emoluments notariaux 2026",
  );
  content = content.replace(
    /Bareme des emoluments notariaux 2025/g,
    "Bareme des emoluments notariaux 2026",
  );

  // ========================================
  // 3. Corrections termes juridiques
  // ========================================

  // exactitude → precision (securite juridique)
  content = content.replace(/avec exactitude/g, "avec precision");

  // ========================================
  // 4. Mise a jour sources
  // ========================================

  // BOFiP → impots.gouv.fr
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
console.log("🔧 Mise a jour des pages frais de notaire...\n");

let updatedCount = 0;

// Pages principales
for (const page of notairePages) {
  const fullPath = path.join(__dirname, "..", page);
  if (updateFile(fullPath)) {
    console.log(`✅ ${page}`);
    updatedCount++;
  } else {
    console.log(`⏭️ ${page} (pas de changement ou non trouve)`);
  }
}

// Pages departements
const deptPages = glob.sync(path.join(__dirname, "..", deptPagesPattern));
console.log(`\n📁 ${deptPages.length} pages de departements trouvees`);

let deptUpdated = 0;
for (const fullPath of deptPages) {
  if (updateFile(fullPath)) {
    deptUpdated++;
  }
}
console.log(`✅ ${deptUpdated} pages de departements mises a jour`);

updatedCount += deptUpdated;

console.log(`\n🎯 Total: ${updatedCount} fichiers mis a jour`);
console.log(
  '\n⚠️ Note: Les pages impot/IR gardent "bareme 2025" car c\'est correct (revenus 2024)',
);
