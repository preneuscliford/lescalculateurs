#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const cheerio = require("cheerio");
const https = require("https");

console.error(`\n🚀 TEST PIPELINE - Scan + Correction sur contact.html\n`);

const filePath = "src/pages/contact.html";
const html = fs.readFileSync(filePath, "utf8");
const $ = cheerio.load(html);

// Extraire texte visible
$("script, style, meta, title, link, noscript, [class*='hidden']").remove();
const visibleText = $("body").text();

console.error(`📄 Fichier: ${filePath}`);
console.error(`📊 Texte visible: ${visibleText.length} caractères\n`);

// Règles à ignorer (faux positifs)
const IGNORED_RULES = [
  "WHITESPACE_RULE",
  "FR_SPELLING_RULE",
  "FRENCH_WHITESPACE",
];

// Lancer le scan LanguageTool
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

      console.error(`🔍 Erreurs détectées: ${matches.length}\n`);

      // Filtrer les faux positifs
      const filtered = matches.filter((m) => {
        if (IGNORED_RULES.includes(m.rule.id)) return false;
        if (m.length > 50) return false;
        if (m.offset < 50) return false;
        return true;
      });

      console.error(`✅ Erreurs réelles (après filtre): ${filtered.length}\n`);

      // Afficher les erreurs filtrées
      filtered.forEach((match, idx) => {
        const { rule, message, replacements } = match;
        const suggestion = replacements?.[0]?.value;

        console.error(`[${idx + 1}] ${rule.id}`);
        console.error(`     Message: ${message}`);
        console.error(`     Suggestion: "${suggestion}"`);
      });

      // Appliquer les corrections
      console.error(`\n${'─'.repeat(60)}`);
      console.error(`🔧 Application des corrections...\n`);

      const correctedHtml = cheerio.load(html);
      let correctionCount = 0;

      filtered.forEach((match) => {
        const { offset, length, replacements, context } = match;
        const suggestion = replacements?.[0]?.value;

        if (!suggestion) return;

        // ⚠️ EXTRACTION: le texte ERRONÉ est à position [offset, offset+length] dans visibleText
        const errorText = visibleText.substring(offset, offset + length);

        console.error(`  ✅ "${errorText}" → "${suggestion}"`);

        // Stratégie: chercher le contexte AUTOUR du texte erroné dans le HTML
        // Ça évite de remplacer tous les "a" du document
        const contextStart = Math.max(0, offset - 30);
        const contextEnd = Math.min(visibleText.length, offset + length + 30);
        const contextPattern = visibleText.substring(contextStart, contextEnd);

        // Chercher dans le HTML via ce contexte plus large
        correctedHtml("body *")
          .contents()
          .each(function () {
            if (this.type !== "text") return;

            // Vérifier que le contexte est présent
            if (!this.data.includes(contextPattern.trim())) return;

            // Maintenant remplacer le texte erroné SEULEMENT UNE FOIS dans ce node
            if (this.data.includes(errorText)) {
              this.data = this.data.replace(errorText, suggestion);
              correctionCount++;
            }
          });
      });

      // Sauvegarder
      const newHtml = correctedHtml.html();
      fs.writeFileSync(filePath, newHtml, "utf8");

      console.error(`\n${'═'.repeat(60)}`);
      console.error(`✅ Résumé:`);
      console.error(`  ✏️  Corrections appliquées: ${correctionCount}`);
      console.error(`  📝 Fichier modifié: ${filePath}`);
      console.error(`═`.repeat(60) + "\n");
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
