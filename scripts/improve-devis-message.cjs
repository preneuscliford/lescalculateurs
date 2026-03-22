#!/usr/bin/env node
/**
 * Ameliorer la phrase sur le devis gratuit du notaire
 */

const fs = require("fs");
const glob = require("glob");

const blogFiles = glob.sync("src/pages/blog/departements/frais-notaire-*.html");

console.log(`\n📝 Amelioration du message sur le devis gratuit\n`);

// Ancien texte
const oldText =
  "Pour un devis exact: Contactez directement le notaire de votre region - c'est gratuit et sans engagement.";

// Nouveau texte ameliore
const newText =
  "📋 <strong>Devis gratuit</strong>: Contactez un notaire de votre region pour un devis precis et personnalise - c'est <strong>gratuit</strong>, <strong>sans engagement</strong> et <strong>sans frais supplementaires</strong>. La loi vous garantit le droit a un devis detaille avant toute intervention.";

let updated = 0;

blogFiles.forEach((file) => {
  let content = fs.readFileSync(file, "utf-8");

  if (content.includes(oldText)) {
    content = content.replace(oldText, newText);
    fs.writeFileSync(file, content);
    updated++;
    console.log(`✅ ${file.split("\\").pop()}`);
  }
});

console.log(`\n${"─".repeat(70)}`);
console.log(`✅ ${updated} fichiers mis a jour`);
console.log(`\nAncien: ${oldText}`);
console.log(`\nNouveau: ${newText}`);
