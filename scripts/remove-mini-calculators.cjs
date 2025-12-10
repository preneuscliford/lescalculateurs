#!/usr/bin/env node

/**
 * Script pour supprimer les mini-calculateurs des pages blog
 * Enlève la section: "🧮 Calculer vos frais ici" + tout le code JavaScript associé
 */

const fs = require("fs");
const path = require("path");

const blogDir = path.join(__dirname, "../src/pages/blog/departements");
const files = fs.readdirSync(blogDir).filter(f => f.startsWith("frais-notaire-"));

console.log("🗑️  Suppression des mini-calculateurs des pages blog...\n");

let removed = 0;
let notFound = 0;

for (const file of files) {
  try {
    const filePath = path.join(blogDir, file);
    let content = fs.readFileSync(filePath, "utf8");

    // Pattern: cherche le bouton + tout le script jusqu'à la fin du </script>
    // Le pattern cherche depuis "<!-- Mini-calculateur intégré" jusqu'au dernier </script> avant "<!-- Tarifs Officiels"
    const pattern = /<!-- Mini-calculateur intégré.*?<\/script>\s*(?=<!-- Tarifs Officiels)/s;
    
    if (pattern.test(content)) {
      content = content.replace(pattern, "");
      fs.writeFileSync(filePath, content, "utf8");
      removed++;
      
      if (removed % 20 === 0) {
        console.log(`✅ ${removed} pages...`);
      }
    } else {
      notFound++;
    }
  } catch (error) {
    console.error(`❌ Erreur ${file}: ${error.message}`);
  }
}

console.log(`\n✅ ${removed} mini-calculateurs supprimés`);
console.log(`⏭️  ${notFound} pages sans mini-calculateur`);
console.log(`\n💡 Les utilisateurs utiliseront maintenant /pages/notaire pour les calculs avancés`);
