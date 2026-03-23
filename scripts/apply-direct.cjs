#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const cheerio = require("cheerio");

console.error(`\n🔒 APPLICATEUR DIRECT - Variables texte simples\n`);

const errors = JSON.parse(fs.readFileSync("real-errors.json", "utf8"));

let appliedCount = 0;
let filesModified = 0;
let skippedCount = 0;

Object.entries(errors.corrections).forEach(([filePath, fileErrors]) => {
  const fullPath = path.join(process.cwd(), filePath);

  if (!fs.existsSync(fullPath)) {
    console.error(`⚠️  Non trouvé: ${filePath}`);
    return;
  }

  try {
    let htmlContent = fs.readFileSync(fullPath, "utf8");
    const $ = cheerio.load(htmlContent);

    let modified = false;

    // Pour chaque erreur dans ce fichier
    fileErrors.forEach((err) => {
      const { rule, suggestions, context } = err;
      const suggestion = suggestions[0];

      if (!suggestion) return;

      // Stratégie ultra-simple: utiliser le contexte
      // Le contexte = environ 100 chars autour de l'erreur
      // On va utiliser le contexte pour trouver et remplacer

      // Chercher les mots clés du contexte
      const contextWords = context
        .split(/[\s\-():,\n]/gi)
        .filter((w) => w.length > 4)
        .slice(-5); // Derniers 5 mots

      let foundAndReplaced = false;

      // Vérifier dans le texte brut du fichier
      for (const word of contextWords) {
        // Si on trouve ce mot dans le contexte original
        if (word && htmlContent.includes(word)) {
          // Maintenant chercher UNIQUEMENT dans les TextNodes
          $("body")
            .contents()
            .each(function findAndReplace() {
              if (foundAndReplaced) return;

              // Pour les nœuds texte seulement
              if (this.type !== "text") return;

              let text = this.data;

              // Chercher si le contexte existe dans ce nœud
              if (!text.includes(word)) return;

              // Vérifier le parent n'est pas sensible
              const parent = this.parent;
              if (!parent) return;

              const tag = parent.name;
              if (["title", "meta", "script", "style", "a"].includes(tag))
                return;

              // Chercher le pattern ancien
              const oldText = deriveOldText(suggestion, rule);

              if (text.includes(oldText)) {
                // 🎯 REMPLACER!
                this.data = text.replace(oldText, suggestion);
                console.error(
                  `  ✅ ${path.basename(filePath)}: "${oldText}" → "${suggestion}"`
                );
                foundAndReplaced = true;
                appliedCount++;
                modified = true;
              }
            });

          if (foundAndReplaced) break;
        }
      }

      if (!foundAndReplaced) {
        console.error(
          `  ⚠️  Pas trouvé: ${rule} "${suggestion}" dans contexte`
        );
        skippedCount++;
      }
    });

    // Sauvegarder
    if (modified) {
      const newHtml = $.html();
      fs.writeFileSync(fullPath, newHtml, "utf8");
      filesModified++;
    }
  } catch (err) {
    console.error(`🚨 ${filePath}: ${err.message}`);
  }
});

console.error(`\n${'═'.repeat(60)}`);
console.error(`✅ Résumé:`);
console.error(`  📝 Fichiers modifiés: ${filesModified}`);
console.error(`  ✏️  Corrections appliquées: ${appliedCount}`);
console.error(`  ⚠️  Ignorées: ${skippedCount}`);
console.error(`═`.repeat(60));
console.error(`\n🔄 Prochaine étape: npm run build\n`);

/**
 * Dériver le texte ancien basé sur la suggestion et la règle
 */
function deriveOldText(suggestion, rule) {
  switch (rule) {
    case "MOIS":
      return suggestion.charAt(0).toUpperCase() + suggestion.slice(1);
    case "A_ACCENT":
      return suggestion.replace("à", "a");
    case "APOS_M":
      return suggestion.replace("'", " ");
    case "ETRE_VPPA_OU_ADJ":
      // "indicatives" → "indicatifs" ou variantes
      if (suggestion.includes("indicatives"))
        return suggestion.replace("ves", "");
      return suggestion;
    default:
      return suggestion;
  }
}
