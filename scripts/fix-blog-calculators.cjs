const fs = require("fs");
const path = require("path");

function fixBlogFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, "utf-8");

    // Retirer les try-catch en double
    content = content.replace(
      /(\} catch \(e\) \{[\s\S]*?return \{ success: false, error: "Erreur lors du calcul\." \};\s*\})\s*catch \(e\) \{[\s\S]*?return \{ success: false, error: "Erreur lors du calcul\." \};\s*\}/,
      "$1"
    );

    // Corriger la structure: ajouter une virgule après formatResult et avant }
    content = content.replace(
      /(\s+\},[\s\S]*?formatResult:[\s\S]*?\},)\s*(\};[\s\S]*?new CalculatorFrame)/,
      "$1\n            $2"
    );

    // Corriger les accolades mal placées
    content = content.replace(
      /(\s+\};[\s\S]*?)(new CalculatorFrame\(containerId, config\);)/,
      "$2"
    );

    // Nettoyer les accolades supplémentaires
    content = content.replace(/(\s+\};\s+\};)/g, "          };");

    fs.writeFileSync(filePath, content, "utf-8");
    console.log(`✅ Corrigé: ${path.basename(filePath)}`);
    return true;
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

console.log(`\n🔄 Correction de ${files.length} articles de département...\n`);

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
  `\n✨ Résultat: ${successCount}/${files.length} corrections réussies`
);
if (failCount > 0) {
  console.log(`⚠️  ${failCount} fichiers n'ont pas pu être corrigés`);
}
