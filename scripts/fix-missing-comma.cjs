const fs = require("fs");
const path = require("path");

function fixMissingSemicolon(filePath) {
  try {
    let content = fs.readFileSync(filePath, "utf-8");

    // Remplacer }formatResult par },\n              formatResult
    content = content.replace(
      /\}formatResult:/g,
      "},\n              formatResult:"
    );

    // Supprimer les formatResult en double (l'ancien après le nouveau)
    content = content.replace(
      /(formatResult: \(result\) => \{[\s\S]*?\+ '<\/div>';[\s\S]*?\},)\s+(formatResult: \(result\) => \{[\s\S]*?\+ '<\/div>';\s*\},)/,
      "$1"
    );

    fs.writeFileSync(filePath, content, "utf-8");
    console.log(`✅ Fixé: ${path.basename(filePath)}`);
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

console.log(`\n🔧 Fix de ${files.length} articles...\n`);

let successCount = 0;
files.forEach((file) => {
  const filePath = path.join(deptDir, file);
  if (fixMissingSemicolon(filePath)) {
    successCount++;
  }
});

console.log(`\n✨ ${successCount}/${files.length} fichiers fixés`);
