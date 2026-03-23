#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const https = require("https");
const glob = require("glob");

// Scan rapide: SEULEMENT les patterns ultra-sûrs
console.error(`\n🔍 Scan rapide des erreurs ultra-sûres\n`);

const htmlFiles = glob.sync("src/pages/**/*.html");
console.error(`📊 ${htmlFiles.length} fichiers HTML trouvés\n`);

const SAFE_RULES = {
  MOIS: "Les mois s'écrivent sans majuscule",
  APOS_M: "Apostrophe manquante",
  ETRE_VPPA_OU_ADJ: "Accord genre/nombre",
  A_ACCENT: "Accent manquant",
};

const corrections = {};
let totalProcessed = 0;

// Scan synchrone avec délai
async function scanHTMLFiles() {
  for (const filePath of htmlFiles) {
    const content = fs.readFileSync(filePath, "utf8");

    // Scan avec LanguageTool API
    try {
      const errors = await checkWithLanguageTool(content);

      // Filtrer SEULEMENT les règles sûres
      const safeErrors = errors
        .filter((e) => SAFE_RULES[e.rule.id])
        .filter((e) => e.length < 50)
        .filter((e) => e.offset > 100)
        .map((e) => ({
          rule: e.rule.id,
          message: SAFE_RULES[e.rule.id],
          suggestions: e.replacements
            ? e.replacements.map((r) => r.value)
            : [],
          context: content.substring(
            Math.max(0, e.offset - 50),
            Math.min(content.length, e.offset + e.length + 50)
          ),
          offset: e.offset,
          length: e.length,
        }));

      if (safeErrors.length > 0) {
        corrections[filePath] = safeErrors;
        console.error(
          `  ✅ ${filePath}: ${safeErrors.length} erreur(s) détectée(s)`
        );
      }

      totalProcessed++;

      // Délai pour rate-limiting
      await new Promise((r) => setTimeout(r, 300));
    } catch (err) {
      console.error(`  ⚠️  ${filePath}: ${err.message}`);
    }
  }
}

async function checkWithLanguageTool(text) {
  return new Promise((resolve, reject) => {
    const postData = new URLSearchParams({
      text,
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
          resolve(result.matches || []);
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on("error", reject);
    req.write(postData.toString());
    req.end();
  });
}

scanHTMLFiles().then(() => {
  const totalSafe = Object.values(corrections).reduce((s, e) => s + e.length, 0);

  const output = {
    timestamp: new Date().toISOString(),
    summary: {
      totalFiles: htmlFiles.length,
      filesWithErrors: Object.keys(corrections).length,
      totalErrors: totalSafe,
    },
    corrections,
  };

  fs.writeFileSync(
    "real-errors.json",
    JSON.stringify(output, null, 2),
    "utf8"
  );

  console.error(`\n${'═'.repeat(60)}`);
  console.error(`✅ Scan terminé`);
  console.error(`  📁 Fichiers scannés: ${totalProcessed}`);
  console.error(`  🐛 Erreurs détectées: ${totalSafe}`);
  console.error(`  📄 Résultat: real-errors.json`);
  console.error(`═`.repeat(60) + "\n");
});
