#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

// Re-charger depuis real-errors.json (qui doit exister)
if (!fs.existsSync("real-errors.json")) {
  console.error("❌ real-errors.json manquant. Exécutez d'abord le scan French.");
  process.exit(1);
}

const allErrors = JSON.parse(fs.readFileSync("real-errors.json", "utf8"));

console.error(`\n🔍 APPLICATEUR PAR TEXTE EXACT - Sans offset\n`);

// Filtrer les corrections dangereuses
const dangerousRules = ["FRENCH_WORD_REPEAT_RULE", "UPPERCASE_SENTENCE_START"];
const safeErrors = { corrections: {} };

Object.entries(allErrors.corrections).forEach(([filePath, errors]) => {
  const filtered = errors.filter((err) => {
    if (dangerousRules.includes(err.rule)) return false;
    if (err.offset < 150) return false; // Trop proche du début
    if (err.length > 50) return false; // Remplacement trop long
    return true;
  });

  if (filtered.length > 0) {
    safeErrors.corrections[filePath] = filtered;
  }
});

console.error(
  `📊 Erreurs valides (après filtrage dangereux): ${
    Object.values(safeErrors.corrections).reduce((s, e) => s + e.length, 0)
  }\n`
);

// Appliquer par recherche de texte
let totalApplied = 0;
let totalNotFound = 0;
let totalErrors = 0;

Object.entries(safeErrors.corrections).forEach(([filePath, errors]) => {
  const fullPath = path.join(process.cwd(), filePath);

  if (!fs.existsSync(fullPath)) {
    console.error(`⚠️  Non trouvé: ${filePath}`);
    return;
  }

  try {
    let content = fs.readFileSync(fullPath, "utf8");
    const originalContent = content;
    let fileApplied = 0;

    // Pour chaque correction
    errors.forEach((err) => {
      const { suggestions, rule, context } = err;
      const newText = suggestions[0];

      if (!newText) return;

      // Stratégie: chercher les mots clés du contexte
      // Par exemple, le contexte "Taux d'incapacité ≥ 50% reconnu" → chercher "50%"
      const contextWords = context.split(/\s+/).slice(-5); // Derniers 5 mots du contexte

      // Essayer de trouver une position qui correspond
      let found = false;

      // Approche 1: Chercher juste le mot/phrase neuve (souvent juste avant/après contexte)
      for (let searchText of contextWords) {
        const idx = content.indexOf(searchText.toLowerCase());
        if (idx === -1) continue;

        // Chercher la phrase à corriger autour de cet emplacement
        const searchWindow = content.substring(
          Math.max(0, idx - 200),
          Math.min(content.length, idx + 200)
        );

        // Vérifier s'il y a un mot de la suggestion
        const suggestionWords = newText.split(/\s+/)[0]; // Premier mot de la suggestion
        if (searchWindow.toLowerCase().includes(suggestionWords.toLowerCase())) {
          // On a trouvé! Chercher du ANCIEN texte autour
          // Mais on ne sait pas quel est l'ancien texte...
          // Stratégie simple: chercher juste le contexte et remplacer la première occurrence après

          console.error(`  ⚠️  Contexte ambigu pour ${rule}, SKIP (besoin manuel)`);
          totalNotFound++;
          return;
        }
      }

      if (!found) {
        console.error(
          `  ⚠️  Contexte non trouvé pour "${newText.substring(0, 30)}"`
        );
        totalNotFound++;
      }
    });

    if (fileApplied > 0) {
      fs.writeFileSync(fullPath, content, "utf8");
      console.error(`✅ ${filePath}: ${fileApplied} correction(s)`);
      totalApplied += fileApplied;
    }
  } catch (err) {
    console.error(`🚨 ${filePath}: ${err.message}`);
    totalErrors++;
  }
});

console.error(`\n${'═'.repeat(60)}`);
console.error(`❌ Approche par texte trop complexe sans l'ANCIEN texte`);
console.error(`✅ Meilleure solution: Générer un RAPPORT pour révision manuelle`);
console.error(`═`.repeat(60) + "\n");
