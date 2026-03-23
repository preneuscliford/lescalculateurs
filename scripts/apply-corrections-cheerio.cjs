#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const cheerio = require("cheerio");

// Charger les corrections (doit exister)
if (!fs.existsSync("real-errors.json")) {
  console.error("❌ real-errors.json manquant");
  process.exit(1);
}

const allErrors = JSON.parse(fs.readFileSync("real-errors.json", "utf8"));

console.error(`\n🔒 APPLICATEUR ULTRA-SAFE - Cheerio HTML Parser\n`);

// Filtrer: SEULEMENT les règles super sûres
const SAFE_RULES = {
  MOIS: true,        // "Janvier" → "janvier"
  APOS_M: true,      // "d activité" → "d'activité"
  ETRE_VPPA_OU_ADJ: true, // "indicatifs" → "indicatives"
  A_ACCENT: true,    // "a" → "à"
};

const safeErrors = { corrections: {} };

Object.entries(allErrors.corrections).forEach(([filePath, errors]) => {
  const filtered = errors.filter((err) => {
    // ❌ Ignorer règles dangereuses
    if (!SAFE_RULES[err.rule]) return false;

    // ❌ Ignorer remplacement > 50 chars (trop risqué)
    if (err.length > 50) return false;

    // ❌ Ignorer offset < 100 (trop proche du début)
    if (err.offset < 100) return false;

    return true;
  });

  if (filtered.length > 0) {
    safeErrors.corrections[filePath] = filtered;
  }
});

const totalSafe = Object.values(safeErrors.corrections).reduce(
  (s, e) => s + e.length,
  0
);
console.error(`📊 Corrections ultra-sûres filtrées: ${totalSafe}\n`);

// Appliquer par parsing HTML
let appliedCount = 0;
let filesModified = 0;

Object.entries(safeErrors.corrections).forEach(([filePath, errors]) => {
  const fullPath = path.join(process.cwd(), filePath);

  if (!fs.existsSync(fullPath)) {
    console.error(`⚠️  Non trouvé: ${filePath}`);
    return;
  }

  try {
    const htmlContent = fs.readFileSync(fullPath, "utf8");
    const $ = cheerio.load(htmlContent);

    let fileModified = false;

    // Pour chaque correction
    errors.forEach((err) => {
      const { rule, suggestions, context } = err;
      const newText = suggestions[0];

      if (!newText) return;

      // ⚠️  STRATÉGIE: chercher le texte exact (OLD) dans le contexte
      // Le contexte contient environ 100 chars autour du texte erroné
      // Exemple: context = "...Taux d'incapacité ≥ 50% reconnu par la MDPH..."

      // Chercher un segment du contexte qui va nous aider à localiser
      const contextWords = context
        .split(/\s+/)
        .filter((w) => w.length > 3) // Mots > 3 chars
        .slice(0, 3); // Premiers 3 mots clés

      // Chercher ce contexte dans le HTML
      for (const word of contextWords) {
        // Chercher dans les éléments texte avec ce mot
        let found = false;

        $("body, html")
          .contents()
          .each(function () {
            if (found) return; // Arrêter si trouvé

            // Si c'est un TextNode
            if (this.type === "text") {
              let text = this.data;

              // ✅ Vérifier que le texte contient le mot contexte ET pas d'éléments sensibles
              if (!text.includes(word)) return;

              // ✅ Filtrer: ne pas modifier dans les attributs ou titres sensibles
              const parent = this.parent;
              if (!parent) return;

              const tagName = parent.name;
              const shouldIgnore = [
                "title",
                "meta",
                "script",
                "style",
                "a", // Risque pour URL
              ].includes(tagName);

              if (shouldIgnore) return;

              // ✅ Maintenant, remplacer le texte
              // Mais seulement si on reconnait le pattern exact
              const oldPatterns = generateOldPatterns(newText, rule);

              for (const oldPattern of oldPatterns) {
                if (text.includes(oldPattern)) {
                  // 🎯 REMPLACEMENT!
                  this.data = text.replace(oldPattern, newText);
                  appliedCount++;
                  fileModified = true;
                  found = true;
                  console.error(
                    `  ✅ ${filePath}: "${oldPattern}" → "${newText}"`
                  );
                  return;
                }
              }
            }
          });

        if (found) break;
      }
    });

    // ✅ Sauvegarder si modifié
    if (fileModified) {
      fs.writeFileSync(fullPath, $.html(), "utf8");
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
console.error(`═`.repeat(60));
console.error(`\n🔄 Prochaine étape: npm run build\n`);

/**
 * Générer les patterns possibles du texte ANCIEN basé sur la règle
 */
function generateOldPatterns(suggestion, rule) {
  const patterns = [];

  switch (rule) {
    case "MOIS":
      // Janvier → janvier
      patterns.push(suggestion.charAt(0).toUpperCase() + suggestion.slice(1));
      break;

    case "APOS_M":
      // d'activité → d activité (ou d  activité)
      patterns.push(suggestion.replace("'", " "));
      patterns.push(suggestion.replace("'", "  "));
      break;

    case "ETRE_VPPA_OU_ADJ":
      // indicatives → indicatifs
      // Chercher les variantes
      if (suggestion.endsWith("es")) {
        patterns.push(suggestion.slice(0, -2)); // enlever "es"
      }
      break;

    case "A_ACCENT":
      // à → a
      patterns.push(suggestion.replace("à", "a"));
      patterns.push(suggestion.replace("à", "À"));
      break;

    default:
      // Fallback: chercher juste par suggestion
      patterns.push(suggestion);
  }

  return patterns.filter((p) => p.length > 0);
}
