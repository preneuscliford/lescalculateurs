#!/usr/bin/env node
/**
 * Nettoie le sitemap:
 * - Remplace apex domain par www dans les URLs
 * - Supprime les .html
 * - Valide la structure
 */

const fs = require("fs");
const path = require("path");

console.log("\n" + "=".repeat(80));
console.log("🧹 NETTOYAGE DU SITEMAP");
console.log("=".repeat(80) + "\n");

const sitemapPath = path.resolve(__dirname, "..", "public", "sitemap.xml");
let sitemap = fs.readFileSync(sitemapPath, "utf8");

const before = sitemap;

// 1. Remplacer apex domain par www dans les <loc> tags
const replacements = [
  // URLs principales avec .html
  {
    pattern: /<loc>https:\/\/lescalculateurs\.fr\/pages\/([^<]+)\.html<\/loc>/g,
    replacement: "<loc>https://www.lescalculateurs.fr/pages/$1</loc>",
    description: "URLs apex avec .html → www sans .html",
  },
  // URLs principales sans .html
  {
    pattern: /<loc>https:\/\/lescalculateurs\.fr\/(pages\/[^<]+)<\/loc>/g,
    replacement: "<loc>https://www.lescalculateurs.fr/$1</loc>",
    description: "URLs apex → www",
  },
  // Images apex → www
  {
    pattern: /https:\/\/lescalculateurs\.fr\/assets/g,
    replacement: "https://www.lescalculateurs.fr/assets",
    description: "Images apex → www",
  },
];

replacements.forEach(({ pattern, replacement, description }) => {
  const matches = sitemap.match(pattern);
  if (matches && matches.length > 0) {
    console.log(`✅ ${description}: ${matches.length} remplacements`);
    sitemap = sitemap.replace(pattern, replacement);
  }
});

// 2. Vérifier et afficher le résumé
const urlMatches = sitemap.match(/<loc>(.*?)<\/loc>/g) || [];
const urls = urlMatches.map((m) => m.replace(/<\/?loc>/g, ""));

const withHtml = urls.filter((u) => u.endsWith(".html"));
const withApex = urls.filter((u) =>
  u.startsWith("https://lescalculateurs.fr/")
);

console.log("\n" + "-".repeat(80));
console.log("📊 ÉTAT DU SITEMAP");
console.log("-".repeat(80));
console.log(`Total d'URLs: ${urls.length}`);
console.log(`Avec .html: ${withHtml.length}`);
console.log(`Apex domain: ${withApex.length}`);

if (withHtml.length > 0) {
  console.log("\n⚠️ URLs avec .html:");
  withHtml.forEach((u) => console.log(`  - ${u}`));
}

if (withApex.length > 0) {
  console.log("\n⚠️ URLs apex domain:");
  withApex.forEach((u) => console.log(`  - ${u}`));
}

// 3. Sauvegarder
if (before !== sitemap) {
  fs.writeFileSync(sitemapPath, sitemap, "utf8");
  console.log("\n✅ Sitemap nettoyé et sauvegardé!");
} else {
  console.log("\n✅ Sitemap déjà propre, aucun changement.");
}

console.log("\n");
