#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

console.error(`\n🔒 APPLICATEUR ULTRA-SIMPLE - Recherche directe\n`);

const errors = JSON.parse(fs.readFileSync("real-errors.json", "utf8"));

let appliedCount = 0;
let filesModified = 0;

Object.entries(errors.corrections).forEach(([filePath, fileErrors]) => {
  const fullPath = path.join(process.cwd(), filePath);

  if (!fs.existsSync(fullPath)) return;

  let content = fs.readFileSync(fullPath, "utf8");
  const originalContent = content;
  let fileApplied = 0;

  fileErrors.forEach((err) => {
    const { rule, suggestions } = err;
    const suggestion = suggestions[0];

    if (!suggestion) return;

    // Dériver le texte ancien basé sur la règle
    const oldText = deriveOldText(suggestion, rule);

    // Simple recherche-remplacement
    if (content.includes(oldText)) {
      content = content.replace(oldText, suggestion);
      console.error(
        `  ✅ "${oldText}" → "${suggestion}" (${path.basename(filePath)})`
      );
      fileApplied++;
      appliedCount++;
    }
  });

  if (fileApplied > 0) {
    // Vérifier que le fichier n'est pas détruit
    if (content.substring(0, 100).match(/<!DOCTYPE|<html/i)) {
      fs.writeFileSync(fullPath, content, "utf8");
      filesModified++;
    } else {
      console.error(
        `  ❌ ${filePath} - DOCTYPE/HTML cassé, ANNULÉ`
      );
      // Restaurer
      fs.writeFileSync(fullPath, originalContent, "utf8");
    }
  }
});

console.error(`\n${'═'.repeat(60)}`);
console.error(`✅ Résumé:`);
console.error(`  📝 Fichiers modifiés: ${filesModified}`);
console.error(`  ✏️  Corrections appliquées: ${appliedCount}`);
console.error(`═`.repeat(60));
console.error(`\n🔄 Prochaine étape: npm run build\n`);

function deriveOldText(suggestion, rule) {
  switch (rule) {
    case "MOIS":
      // "janvier" → "Janvier"
      return suggestion.charAt(0).toUpperCase() + suggestion.slice(1);
    case "A_ACCENT":
      // "à" → "a"
      return "a";
    case "APOS_M":
      // "d'activité" → "d activité"
      return suggestion.replace("'", " ");
    case "ETRE_VPPA_OU_ADJ":
      // S'il propose "indicatives", chercher "indicatifs"
      if (suggestion.endsWith("ves")) {
        return suggestion.slice(0, -3) + "fs";
      }
      return suggestion;
    default:
      return suggestion;
  }
}
