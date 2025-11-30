const fs = require("fs");
const path = require("path");

function fixBlogFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, "utf-8");
    let hasChanged = false;

    // Pattern: trouver "formatResult: (result) => { ... }," suivi d'un "=> {"
    // Ce qui indique que la deuxième formatResult n'a pas été correctement supprimée

    // Chercher "}, \n => {"
    const badPattern = /},\s*\n\s*=>\s*\{/;
    if (badPattern.test(content)) {
      console.log(
        `❌ Reste de syntaxe cassée trouvé dans ${path.basename(filePath)}`
      );

      // Supprimer tout ce qui suit jusqu'au prochain "formatResult:" ou "new CalculatorFrame"
      // Le plus simple: chercher le premier "formatResult:" et supprimer tout après sa fermeture jusqu'à "new CalculatorFrame"

      // Approche: trouver la section entre },\n => { et },\n };
      const match = content.match(/},\s*\n\s*=>\s*\{[\s\S]*?\},\s*};/);
      if (match) {
        console.log(`  Suppression de: ${match[0].substring(0, 50)}...`);
        content = content.replace(match[0], "},\n              };");
        hasChanged = true;
      }
    }

    // Vérifier s'il y a des ", => {" orphelins
    const orphanPattern = /,\s*=>\s*\{/;
    if (orphanPattern.test(content)) {
      console.log(
        `❌ Reste orphelin "=> {" trouvé dans ${path.basename(filePath)}`
      );

      // Supprimer jusqu'au prochain }
      const match = content.match(/,\s*=>\s*\{[\s\S]*?\},/);
      if (match) {
        content = content.replace(match[0], ",");
        hasChanged = true;
      }
    }

    if (hasChanged) {
      fs.writeFileSync(filePath, content, "utf-8");
      console.log(`✅ Corrigé ${path.basename(filePath)}`);
      return true;
    } else {
      console.log(`✅ ${path.basename(filePath)} OK`);
      return true;
    }
  } catch (error) {
    console.error(`❌ Erreur pour ${path.basename(filePath)}:`, error.message);
    return false;
  }
}

// Traiter tous les fichiers de département
const deptDir = path.join(__dirname, "../src/pages/blog/departements");
const files = fs
  .readdirSync(deptDir)
  .filter((f) => f.startsWith("frais-notaire-") && f.endsWith(".html"));

console.log(
  `\n🔧 Nettoyage des restes de syntaxe cassée dans ${files.length} articles...\n`
);

let successCount = 0;
let failCount = 0;

files.forEach((file) => {
  const filePath = path.join(deptDir, file);
  if (fixBlogFile(filePath)) {
    successCount++;
  } else {
    failCount++;
  }
});

console.log(
  `\n✨ Résultat: ${successCount}/${files.length} traitements réussis`
);
if (failCount > 0) {
  console.log(`⚠️  ${failCount} fichiers n'ont pas pu être traités`);
}
console.log("\n📝 Les restes de syntaxe cassée ont été nettoyés.");
