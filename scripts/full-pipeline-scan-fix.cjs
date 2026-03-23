#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const cheerio = require("cheerio");
const https = require("https");
const glob = require("glob");

console.error(`\n🚀 PIPELINE COMPLET - Scan + Correction intelligente\n`);

// Étape 1: Trouver tous les fichiers HTML
const htmlFiles = glob.sync("src/pages/**/*.html");
console.error(`📁 ${htmlFiles.length} fichiers HTML trouvés\n`);

// Résultats
const results = {
  processed: 0,
  corrected: 0,
  errors: 0,
  corrections: [],
};

// Règles à ignorer (faux positifs évidents)
const IGNORED_RULES = [
  "WHITESPACE_RULE",
  "FR_SPELLING_RULE",
  "FRENCH_WHITESPACE",
];

// Règles sûres à appliquer
const SAFE_RULES = [
  "A_ACCENT",
  "APOS_M",
  "MOIS",
  "A_A_ACCENT2",
];

async function scanAndFixFile(filePath) {
  return new Promise((resolve) => {
    try {
      const html = fs.readFileSync(filePath, "utf8");
      const $ = cheerio.load(html);

      // Extraire texte visible
      $("script, style, meta, title, link, noscript, [class*='hidden']").remove();
      const visibleText = $("body").text();

      if (visibleText.trim().length === 0) {
        resolve({ skipped: true });
        return;
      }

      // Scanner avec LanguageTool
      const postData = new URLSearchParams({
        text: visibleText,
        language: "fr",
      });

      const options = {
        hostname: "api.languagetool.org",
        path: "/v2/check",
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Content-Length": postData.toString().length,
        },
      };

      const req = https.request(options, (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          try {
            const result = JSON.parse(data);
            let matches = result.matches || [];

            // Filtrer les règles non sûres
            matches = matches.filter((m) => {
              if (IGNORED_RULES.includes(m.rule.id)) return false;
              if (m.length > 50) return false; // Remplacement trop long
              if (m.offset < 50) return false; // Trop proche du début
              return true;
            });

            if (matches.length === 0) {
              resolve({ fileErrors: 0 });
              return;
            }

            // Appliquer les corrections dans le texte visible
            let correctedCount = 0;
            matches.forEach((match) => {
              const { rule, replacements } = match;
              const suggestion = replacements?.[0]?.value;

              if (!suggestion) return;

              // Créer une map old → new basée sur la règle
              const oldText = deriveOldText(suggestion, rule.id);

              // Chercher et remplacer dans les TextNodes
              $("body *")
                .contents()
                .each(function () {
                  if (this.type !== "text") return;

                  if (this.data.includes(oldText)) {
                    this.data = this.data.replace(oldText, suggestion);
                    correctedCount++;

                    results.corrections.push({
                      file: filePath,
                      rule: rule.id,
                      old: oldText,
                      new: suggestion,
                    });
                  }
                });
            });

            if (correctedCount > 0) {
              const newHtml = $.html();
              fs.writeFileSync(filePath, newHtml, "utf8");
              results.corrected++;
              resolve({ fileErrors: matches.length, corrected: correctedCount });
            } else {
              resolve({ fileErrors: matches.length, corrected: 0 });
            }
          } catch (err) {
            resolve({ error: err.message });
          }
        });
      });

      req.on("error", () => {
        resolve({ error: "HTTP error" });
      });

      req.write(postData.toString());
      req.end();
    } catch (err) {
      resolve({ error: err.message });
    }
  });
}

// Traiter les fichiers séquentiellement
(async () => {
  for (const filePath of htmlFiles) {
    const result = await scanAndFixFile(filePath);
    results.processed++;

    if (result.skipped) {
      // Ignorer fichiers vides
    } else if (result.fileErrors > 0) {
      console.error(
        `  📄 ${path.basename(filePath)}: ${result.fileErrors} erreurs, ${result.corrected} corrigées`
      );
    } else if (result.error) {
      console.error(`  ⚠️  ${path.basename(filePath)}: ${result.error}`);
      results.errors++;
    }

    // Délai pour rate-limiting
    await new Promise((r) => setTimeout(r, 300));
  }

  // Résumé
  console.error(`\n${'═'.repeat(60)}`);
  console.error(`✅ Résumé final:`);
  console.error(`  📁 Fichiers traités: ${results.processed}/${htmlFiles.length}`);
  console.error(`  ✅ Fichiers corrigés: ${results.corrected}`);
  console.error(`  ✏️  Total corrections: ${results.corrections.length}`);
  console.error(`═`.repeat(60));

  // Sauvegarder le rapport
  fs.writeFileSync("corrections-report.json", JSON.stringify(results, null, 2), "utf8");
  console.error(`\n📊 Rapport sauvegardé: corrections-report.json\n`);
})();

/**
 * Dériver le texte ancien basé sur la suggestion et la règle
 */
function deriveOldText(suggestion, ruleId) {
  switch (ruleId) {
    case "A_ACCENT":
    case "A_A_ACCENT2":
      return suggestion.replace("à", "a");
    case "APOS_M":
      return suggestion.replace("'", " ");
    case "MOIS":
      return suggestion.charAt(0).toUpperCase() + suggestion.slice(1);
    default:
      return suggestion;
  }
}
