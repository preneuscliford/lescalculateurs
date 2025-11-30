#!/usr/bin/env node
/**
 * Améliorer la phrase sur le devis gratuit du notaire
 */

const fs = require("fs");
const glob = require("glob");

const blogFiles = glob.sync("src/pages/blog/departements/frais-notaire-*.html");

console.log(`\n📝 Amélioration du message sur le devis gratuit\n`);

// Ancien texte
const oldText =
  "Pour un devis exact: Contactez directement le notaire de votre région — c'est gratuit et sans engagement.";

// Nouveau texte amélioré
const newText =
  "📋 <strong>Devis gratuit</strong>: Contactez un notaire de votre région pour un devis précis et personnalisé — c'est <strong>gratuit</strong>, <strong>sans engagement</strong> et <strong>sans frais supplémentaires</strong>. La loi vous garantit le droit à un devis détaillé avant toute intervention.";

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
console.log(`✅ ${updated} fichiers mis à jour`);
console.log(`\nAncien: ${oldText}`);
console.log(`\nNouveau: ${newText}`);
