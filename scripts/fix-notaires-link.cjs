#!/usr/bin/env node
/**
 * Corriger le lien des baremes notariaux
 */

const fs = require("fs");
const glob = require("glob");

const blogFiles = glob.sync("src/pages/blog/departements/frais-notaire-*.html");

console.log(`\n🔗 Correction du lien des baremes notariaux\n`);

// Ancien lien casse
const oldLink = "https://www.notaires.fr/fr/les-baremes-notariaux";
// Nouveau lien correct
const newLink =
  "https://www.notaires.fr/fr/actualites/les-tarifs-notariaux-2024-2025";

let updated = 0;

blogFiles.forEach((file) => {
  const content = fs.readFileSync(file, "utf-8");

  if (content.includes(oldLink)) {
    const newContent = content.replace(
      new RegExp(oldLink.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
      newLink
    );
    fs.writeFileSync(file, newContent);
    updated++;
    console.log(`✅ ${file.split("\\").pop()}`);
  }
});

console.log(`\n${"─".repeat(70)}`);
console.log(`✅ ${updated} fichiers corriges`);
console.log(`\nAncien lien: ${oldLink}`);
console.log(`Nouveau lien: ${newLink}`);
