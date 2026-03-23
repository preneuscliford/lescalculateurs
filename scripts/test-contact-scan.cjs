#!/usr/bin/env node

const fs = require("fs");
const https = require("https");

console.error(`\n🔍 Test: Scanner contact.html avec LanguageTool\n`);

const htmlPath = "src/pages/contact.html";
const html = fs.readFileSync(htmlPath, "utf8");

console.error(`📄 Fichier: ${htmlPath}`);
console.error(`📊 Taille: ${html.length} caractères\n`);

// Appel direct à LanguageTool
const postData = new URLSearchParams({
  text: html,
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
      const matches = result.matches || [];

      console.error(`📋 Total d'erreurs détectées: ${matches.length}\n`);

      // Afficher tous les détails bruts
      matches.forEach((match, idx) => {
        const { rule, message, offset, length, replacements, context } = match;
        const errorText = html.substring(offset, offset + length);

        console.error(`\n[${ idx + 1}] ${rule.id}`);
        console.error(`    Message: ${message}`);
        console.error(`    Position: offset ${offset}, length ${length}`);
        console.error(`    Texte erroné: "${errorText}"`);
        console.error(`    Contexte: ...${context}...`);
        if (replacements && replacements.length > 0) {
          console.error(`    Suggestions: ${replacements.map((r) => `"${r.value}"`).join(", ")}`);
        }
      });

      // Sauvegarder les résultats bruts
      fs.writeFileSync(
        "contact-lt-scan.json",
        JSON.stringify(
          {
            file: htmlPath,
            totalErrors: matches.length,
            errors: matches,
          },
          null,
          2
        ),
        "utf8"
      );

      console.error(`\n${'═'.repeat(60)}`);
      console.error(`✅ Résultats sauvegardés: contact-lt-scan.json\n`);
    } catch (err) {
      console.error(`❌ Erreur: ${err.message}`);
    }
  });
});

req.on("error", (err) => {
  console.error(`🚨 Erreur HTTP: ${err.message}`);
});

req.write(postData.toString());
req.end();
