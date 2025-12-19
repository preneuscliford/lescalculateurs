#!/usr/bin/env node

/**
 * Script de vérification POST-FIX des canonicals
 * Vérifie que tous les canonicals sont au bon format
 */

const fs = require("fs");
const path = require("path");

console.log("\n🔍 VÉRIFICATION POST-FIX - CANONICALS\n");
console.log("=".repeat(80));

const srcDir = path.join(__dirname, "..", "src", "pages");

// Fonction récursive pour lister tous les fichiers .html
function getAllHtmlFiles(dir) {
  let files = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });

  items.forEach((item) => {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      files = files.concat(getAllHtmlFiles(fullPath));
    } else if (item.name.endsWith(".html")) {
      files.push(fullPath);
    }
  });

  return files;
}

// Regex pour extraire les canonicals
const canonicalRegex = /rel="canonical"\s+href="([^"]+)"/;

// Statistiques
const stats = {
  totalFiles: 0,
  withCanonical: 0,
  correct: 0,
  issues: [],
};

// Patterns corrects
const correctPattern = /^https:\/\/www\.lescalculateurs\.fr\/pages\//;
const hasHtmlPattern = /\.html"/;
const hasApexPattern = /^https:\/\/lescalculateurs\.fr\//;
const hasBlogDirectPattern = /^https:\/\/www\.lescalculateurs\.fr\/blog\//;

console.log(`\n📂 Scanning: ${srcDir}\n`);

const files = getAllHtmlFiles(srcDir);
stats.totalFiles = files.length;

files.forEach((file) => {
  const content = fs.readFileSync(file, "utf8");
  const match = content.match(canonicalRegex);

  if (match) {
    stats.withCanonical++;
    const canonical = match[1];
    const relativePath = path.relative(srcDir, file);

    // Vérifier si le canonical est correct
    if (correctPattern.test(canonical) && !hasHtmlPattern.test(match[0])) {
      stats.correct++;
    } else {
      // Trouver le type d'issue
      let issue = "";
      if (hasApexPattern.test(canonical)) {
        issue = "❌ APEX domain (sans www)";
      } else if (hasBlogDirectPattern.test(canonical)) {
        issue = "⚠️  /blog/ direct (pas /pages/blog/)";
      } else if (hasHtmlPattern.test(match[0])) {
        issue = "❌ .html dans canonical";
      } else if (!correctPattern.test(canonical)) {
        issue = "⚠️  Format incorrect";
      }

      stats.issues.push({
        file: relativePath,
        canonical: canonical,
        issue: issue,
      });
    }
  }
});

// Afficher les résultats
console.log(`📊 RÉSUMÉ:\n`);
console.log(`  Total fichiers HTML: ${stats.totalFiles}`);
console.log(`  Avec canonical: ${stats.withCanonical}`);
console.log(
  `  ✅ Canonicals CORRECTS: ${stats.correct} / ${stats.withCanonical}`
);

if (stats.issues.length > 0) {
  console.log(`\n⚠️  PROBLÈMES TROUVÉS: ${stats.issues.length}\n`);

  stats.issues.forEach((issue, idx) => {
    console.log(`  ${idx + 1}. ${issue.issue}`);
    console.log(`     File: ${issue.file}`);
    console.log(`     Canonical: ${issue.canonical}\n`);
  });
} else {
  console.log(`\n✅ AUCUN PROBLÈME TROUVÉ!\n`);
  console.log(`Tous les ${stats.correct} canonicals sont corrects:\n`);
  console.log(`  ✓ Format: https://www.lescalculateurs.fr/pages/...`);
  console.log(`  ✓ JAMAIS d'apex domain`);
  console.log(`  ✓ JAMAIS de .html`);
  console.log(`  ✓ TOUJOURS /pages/ (pas /blog/)\n`);
}

console.log("=".repeat(80));

// Afficher le taux de succès
const successRate = ((stats.correct / stats.withCanonical) * 100).toFixed(1);
console.log(
  `\n📈 Taux de succès: ${successRate}% (${stats.correct}/${stats.withCanonical})\n`
);

if (stats.issues.length === 0) {
  console.log("🎉 VÉRIFICATION RÉUSSIE - Prêt pour le deployment!\n");
  process.exit(0);
} else {
  console.log("⚠️  Il reste des problèmes à corriger\n");
  process.exit(1);
}
