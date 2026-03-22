#!/usr/bin/env node
/**
 * Supprimer la ligne du footer des tarifs officiels
 */

const fs = require("fs");
const glob = require("glob");

const blogFiles = glob.sync("src/pages/blog/departements/frais-notaire-*.html");

console.log(`\n🗑️  Suppression de la ligne du footer des tarifs officiels\n`);

const lineToRemove =
  '          <p class="text-xs text-gray-600 mt-4">\n            ✓ Donnees officielles mises a jour novembre 2024 |\n            <a href="https://www.notaires.fr/fr/vous-etes-proprietaire-immobilier-ou-acquereur/le-role-du-notaire/les-tarifs-notariaux" target="_blank" class="text-blue-600 hover:underline">Consulter les baremes complets</a>\n          </p>';

let updated = 0;

blogFiles.forEach((file) => {
  let content = fs.readFileSync(file, "utf-8");

  if (content.includes(lineToRemove)) {
    content = content.replace(lineToRemove, "");
    fs.writeFileSync(file, content);
    updated++;
    console.log(`✅ ${file.split("\\").pop()}`);
  }
});

console.log(`\n${"─".repeat(70)}`);
console.log(`✅ ${updated} fichiers mis a jour`);
