#!/usr/bin/env node
/**
 * Script d'indexation des pages simulateurs
 * Génère la liste des URLs et les soumet à l'API Google Indexing
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_URL = "https://www.lescalculateurs.fr";
const PAGES_DIR = path.resolve("pages_SIMULATEURS_PLUS");

/**
 * Génère la liste des URLs à partir des fichiers HTML
 */
function generateUrls() {
  const urls = [];
  
  // Fonction récursive pour parcourir les dossiers
  function scanDir(dir, basePath = "/pages") {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      
      if (item.isDirectory()) {
        // Ignorer certains dossiers
        if (item.name === "assets" || item.name === "js" || item.name === "css") continue;
        scanDir(fullPath, `${basePath}/${item.name}`);
      } else if (item.name.endsWith("_SIMULATEURS_PLUS.html")) {
        // Extraire le nom de la page
        const pageName = item.name.replace("_SIMULATEURS_PLUS.html", "");
        const url = pageName === "index" 
          ? `${BASE_URL}${basePath}`
          : `${BASE_URL}${basePath}/${pageName}`;
        urls.push(url);
      }
    }
  }
  
  scanDir(PAGES_DIR);
  return urls;
}

/**
 * Sauvegarde les URLs dans un fichier
 */
function saveUrls(urls, outputPath) {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, urls.join("\n"), "utf-8");
  console.log(`✅ ${urls.length} URLs sauvegardées dans ${outputPath}`);
}

/**
 * Point d'entrée principal
 */
function main() {
  console.log("🔍 Génération de la liste des URLs des simulateurs...\n");
  
  const urls = generateUrls();
  
  if (urls.length === 0) {
    console.error("❌ Aucune URL trouvée dans", PAGES_DIR);
    process.exit(1);
  }
  
  console.log(`📊 ${urls.length} URLs trouvées:\n`);
  
  // Afficher les 10 premières
  urls.slice(0, 10).forEach((url, i) => {
    console.log(`  ${i + 1}. ${url}`);
  });
  if (urls.length > 10) {
    console.log(`  ... (${urls.length - 10} autres)`);
  }
  
  // Sauvegarder dans un fichier
  const outputFile = path.resolve("scripts", "simulateurs-urls.txt");
  saveUrls(urls, outputFile);
  
  console.log("\n🚀 Pour indexer ces URLs, exécutez :");
  console.log(`   node scripts/publish-indexing.js --file=${outputFile} --type=URL_UPDATED`);
  console.log("\n💡 Pour un dry-run (test sans envoi) :");
  console.log(`   node scripts/publish-indexing.js --file=${outputFile} --type=URL_UPDATED --dry-run`);
  console.log("\n⚠️  Limites API Google :");
  console.log("   - 200 URLs/jour pour URL_UPDATED");
  console.log("   - Si plus de 200 URLs, ajoutez --limit=200");
}

main();
