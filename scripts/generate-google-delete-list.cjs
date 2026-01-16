#!/usr/bin/env node
/**
 * Génère une liste des anciennes URLs à supprimer de Google Search Console
 * Ces URLs existent toujours en cache Google mais redirigent maintenant
 */

const fs = require("fs");
const path = require("path");

console.log("\n" + "=".repeat(80));
console.log("🗑️ GÉNÉRER LISTE DES URLs À SUPPRIMER DE GOOGLE");
console.log("=".repeat(80) + "\n");

// Lire le sitemap pour avoir la liste des URLs valides
const sitemapPath = path.resolve(__dirname, "..", "public", "sitemap.xml");
const sitemap = fs.readFileSync(sitemapPath, "utf8");

const urlMatches = sitemap.match(/<loc>(.*?)<\/loc>/g) || [];
const validUrls = urlMatches.map((m) => m.replace(/<\/?loc>/g, ""));

console.log(`✓ URLs valides trouvées: ${validUrls.length}\n`);

// Générer les variantes à supprimer
const urlsToDelete = new Set();

validUrls.forEach((url) => {
  // URL propre (déjà valide)
  urlsToDelete.add(url);

  // Variantes avec .html
  urlsToDelete.add(url + ".html");

  // Variantes avec .htm
  urlsToDelete.add(url + ".htm");

  // Variantes apex domain (sans www)
  const urlApex = url.replace("https://www.", "https://");
  urlsToDelete.add(urlApex);
  urlsToDelete.add(urlApex + ".html");
  urlsToDelete.add(urlApex + ".htm");

  // Variantes avec /index.html
  if (!url.endsWith("/")) {
    urlsToDelete.add(url + "/index.html");
    const urlApexIndex =
      url.replace("https://www.", "https://") + "/index.html";
    urlsToDelete.add(urlApexIndex);
  }
});

// Créer le fichier de suppression
const deleteList = Array.from(urlsToDelete).sort().join("\n");

const outputPath = path.resolve(
  __dirname,
  "..",
  "urls-to-delete-from-google.txt"
);
fs.writeFileSync(outputPath, deleteList, "utf8");

console.log(`✅ Fichier généré: urls-to-delete-from-google.txt`);
console.log(`📊 Total de variantes d'URLs: ${urlsToDelete.size}\n`);

console.log("📋 PREMIÈRES 10 URLs À SUPPRIMER:");
console.log("-".repeat(80));
Array.from(urlsToDelete)
  .sort()
  .slice(0, 10)
  .forEach((url) => {
    console.log(`  ${url}`);
  });

console.log("\n" + "=".repeat(80));
console.log("🔗 INSTRUCTIONS DE SUPPRESSION DANS GOOGLE SEARCH CONSOLE:");
console.log("=".repeat(80) + "\n");

console.log(`1. Accéder à: https://search.google.com/search-console`);
console.log(`2. Sélectionner: lescalculateurs.fr`);
console.log(`3. Menu de gauche: "Suppression"→"Suppression d'URL"`);
console.log(`4. Cliquer "Nouveau"→"Supprimer les URL"`);
console.log(`5. Copier-coller chaque URL de ${outputPath}`);
console.log(`   (ou uploader le fichier si Google permet)\n`);

console.log(`Raison à sélectionner: "Le site redirige l'URL"`);
console.log(`Raison secondaire: "Migration / Restructuration du site"\n`);

console.log("⏱️  DÉLAI: 48h à 7 jours pour la suppression complète\n");

console.log(
  "💡 ASTUCE: Vous pouvez aussi utiliser l'outil \"Remappage d'URL\" si"
);
console.log(
  "   disponible pour mapper automatiquement les anciennes → nouvelles URLs\n"
);
