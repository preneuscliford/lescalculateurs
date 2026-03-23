#!/usr/bin/env node

const fs = require("fs");
const cheerio = require("cheerio");
const https = require("https");

console.error(`\n🔍 Test: Extraire texte visible + scanner\n`);

const htmlPath = "src/pages/contact.html";
const html = fs.readFileSync(htmlPath, "utf8");

// Étape 1: Extraire le texte visible SEULEMENT
const $ = cheerio.load(html);

// Supprimer les balises qui ne doivent pas être scannées
$("script, style, meta, title, link, noscript").remove();

// Récupérer uniquement le texte visible
const visibleText = $("body").text();

console.error(`📄 Fichier: ${htmlPath}`);
console.error(`📊 HTML brut: ${html.length} caractères`);
console.error(`✅ Texte visible (sans HTML): ${visibleText.length} caractères\n`);
console.error(`Texte visible:\n${'─'.repeat(60)}`);
console.error(visibleText);
console.error(`${'─'.repeat(60)}\n`);

// Étape 2: Scanner avec LanguageTool SEULEMENT le texte visible
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
      const matches = result.matches || [];

      console.error(`🔍 ERREURS DÉTECTÉES: ${matches.length}\n`);

      // Filtrer les faux positifs évidents
      const realErrors = matches.filter((match) => {
        const { rule, message } = match;
        
        // Ignorer les règles qui génèrent trop de faux positifs
        if (rule.id === "WHITESPACE_RULE") return false; // Espaces répétées
        if (rule.id === "FR_SPELLING_RULE") return false; // Détecte tout en anglais
        
        return true;
      });

      console.error(`✅ ERREURS RÉELLES (après filtre): ${realErrors.length}\n`);

      if (realErrors.length > 0) {
        realErrors.forEach((match, idx) => {
          const { rule, message, offset, length, replacements } = match;
          const errorText = visibleText.substring(offset, offset + length);

          console.error(`[${idx + 1}] ${rule.id}`);
          console.error(`     Message: ${message}`);
          console.error(`     Texte: "${errorText}"`);
          if (replacements && replacements.length > 0) {
            console.error(
              `     Suggestions: ${replacements
                .slice(0, 3)
                .map((r) => `"${r.value}"`)
                .join(", ")}`
            );
          }
          console.error();
        });
      } else {
        console.error(`✨ Pas d'erreurs réelles trouvées!\n`);
      }

      // Sauvegarder
      fs.writeFileSync(
        "contact-real-errors.json",
        JSON.stringify(
          {
            file: htmlPath,
            visibleTextLength: visibleText.length,
            totalDetected: matches.length,
            realErrors: realErrors,
          },
          null,
          2
        ),
        "utf8"
      );

      console.error(`${'═'.repeat(60)}`);
      console.error(`✅ Résultats sauvegardés: contact-real-errors.json\n`);
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
