#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const cheerio = require("cheerio");
const https = require("https");

console.error(`\n🚀 PIPELINE SIMPLE - Scan + Corrections par regex\n`);

const filePath = "src/pages/contact.html";
let html = fs.readFileSync(filePath, "utf8");
const $ = cheerio.load(html);

// Extraire texte visible pour scanner
$("script, style, meta, title, link, noscript, [class*='hidden']").remove();
const visibleText = $("body").text();

console.error(`📄 Fichier: ${filePath}`);
console.error(`📊 Texte visible: ${visibleText.length} caractères\n`);

const IGNORED_RULES = [
  "WHITESPACE_RULE",
  "FR_SPELLING_RULE",
  "FRENCH_WHITESPACE",
];

// Scanner LanguageTool
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

      console.error(`🔍 Erreurs détectées: ${matches.length}`);

      // Filtrer
      const filtered = matches.filter((m) => {
        if (IGNORED_RULES.includes(m.rule.id)) return false;
        if (m.length > 50) return false;
        if (m.offset < 50) return false;
        return true;
      });

      console.error(`✅ Erreurs réelles: ${filtered.length}\n`);

      // Extraire les corrections attendues
      const corrections = filtered
        .map((m) => ({
          rule: m.rule.id,
          old: visibleText.substring(m.offset, m.offset + m.length),
          new: m.replacements?.[0]?.value,
        }))
        .filter((c) => c.new && c.old);

      console.error(`🔧 Corrections à appliquer:\n`);
      corrections.forEach((c) => {
        console.error(`  • "${c.old}" → "${c.new}" (${c.rule})`);
      });

      // Appliquer les corrections directement dans le HTML brut
      console.error(`\n${'─'.repeat(60)}\n`);

      let appliedCount = 0;
      corrections.forEach((correction) => {
        const { old, new: newText } = correction;

        // Remplacer dans le HTML
        if (html.includes(old)) {
          html = html.replace(old, newText);
          console.error(`  ✅ Appliquée: "${old}" → "${newText}"`);
          appliedCount++;
        } else {
          console.error(
            `  ⚠️  Non trouvée: "${old}" (peut être fragmentée dans le HTML)`
          );
        }
      });

      // Sauvegarder
      fs.writeFileSync(filePath, html, "utf8");

      console.error(`\n${'═'.repeat(60)}`);
      console.error(`✅ Résumé:`);
      console.error(`  ✏️  Corrections appliquées: ${appliedCount}/${corrections.length}`);
      console.error(`  📝 Fichier: ${filePath}`);
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
