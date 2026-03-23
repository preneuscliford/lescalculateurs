#!/usr/bin/env node

const fs = require("fs");
const cheerio = require("cheerio");

console.error(`\n🔧 Applicateur intelligent - Texte visible seulement\n`);

const htmlPath = "src/pages/contact.html";
const html = fs.readFileSync(htmlPath, "utf8");
const $ = cheerio.load(html);

// Corrections à appliquer (basées sur contact-real-errors.json)
const corrections = [
  {
    old: "mise a jour",
    new: "mise à jour",
    rule: "A_ACCENT",
  },
  {
    old: "a:",
    new: "à :",
    rule: "DEUX_POINTS_ESPACE",
  },
  {
    old: "Vous pouvez nous ecrire",
    new: "Vous pouvez nous écrire",
    rule: "ACCENT_SIMPLE",
  },
  {
    old: "et au consentement",
    new: "et à permission",
    rule: "A_ACCENT",
  },
  {
    old: "accelerer le",
    new: "accélérer le",
    rule: "ACCENT_SIMPLE",
  },
  {
    old: "concernee",
    new: "concernée",
    rule: "ACCENT_SIMPLE",
  },
  {
    old: "probleme",
    new: "problème",
    rule: "ACCENT_SIMPLE",
  },
  {
    old: "ecran",
    new: "écran",
    rule: "ACCENT_SIMPLE",
  },
  {
    old: "vulgarisation",
    new: "vulgarisation",
    rule: "SPELLING",
  },
  {
    old: "personnalise",
    new: "personnalisé",
    rule: "ACCENT_SIMPLE",
  },
];

let appliedCount = 0;
let checkedCount = 0;

// Chercher et remplacer dans les TextNodes seulement
$("body *")
  .contents()
  .each(function () {
    if (this.type !== "text") return;

    let text = this.data;
    const original = text;

    corrections.forEach((correction) => {
      if (text.includes(correction.old)) {
        text = text.replace(correction.old, correction.new);
        console.error(
          `  ✅ "${correction.old}" → "${correction.new}" (${correction.rule})`
        );
        appliedCount++;
      }
      checkedCount++;
    });

    if (text !== original) {
      this.data = text;
    }
  });

// Sauvegarder le HTML modifié
const newHtml = $.html();

// Vérifications de sécurité
console.error(`\n🔒 Vérifications:`);
console.error(
  `  ✓ DOCTYPE intact: ${newHtml.substring(0, 50).includes("DOCTYPE") ? "✅" : "❌"}`
);
console.error(
  `  ✓ Balises <html>: ${newHtml.match(/<html/gi)?.length || 0}/${newHtml.match(/<\/html>/gi)?.length || 0}`
);
console.error(
  `  ✓ Balises <body>: ${newHtml.match(/<body/gi)?.length || 0}/${newHtml.match(/<\/body>/gi)?.length || 0}`
);

fs.writeFileSync(htmlPath, newHtml, "utf8");

console.error(`\n${'═'.repeat(60)}`);
console.error(`✅ Résumé:`);
console.error(`  ✏️  Corrections appliquées: ${appliedCount}`);
console.error(`  📝 Fichier modifié: ${htmlPath}`);
console.error(`═`.repeat(60));
console.error(`\n🔄 Prochaine étape: npm run build\n`);
