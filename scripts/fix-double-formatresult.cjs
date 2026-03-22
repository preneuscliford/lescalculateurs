const fs = require("fs");
const path = require("path");

// Charger les donnees depuis departements.json
const deptDataPath = path.join(__dirname, "../src/data/departements.json");
const deptData = JSON.parse(fs.readFileSync(deptDataPath, "utf-8"));

function fixBlogFile(filePath, departement) {
  try {
    let content = fs.readFileSync(filePath, "utf-8");

    // Trouver et supprimer la DEUXIÈME formatResult (qui ecrase la premiere)
    // Pattern: chercher le deuxieme "formatResult:" dans la section config
    const configStart = content.indexOf("const config = {");
    const configEnd = content.indexOf(
      "new CalculatorFrame(containerId, config);"
    );

    if (configStart === -1 || configEnd === -1) {
      console.log(
        `⚠️  Structure config non trouvee dans ${path.basename(filePath)}`
      );
      return false;
    }

    const configSection = content.substring(configStart, configEnd);

    // Compter les occurences de "formatResult:"
    const matches = configSection.match(/formatResult:/g);
    if (!matches || matches.length < 2) {
      console.log(`✅ ${path.basename(filePath)} OK (une seule formatResult)`);
      return true;
    }

    // Trouver la deuxieme occurence de formatResult: et la supprimer
    const firstFormatResultIndex = configSection.indexOf("formatResult:");
    const secondFormatResultStart = configSection.indexOf(
      "formatResult:",
      firstFormatResultIndex + 1
    );

    if (secondFormatResultStart === -1) {
      console.log(
        `✅ ${path.basename(filePath)} OK (une seule formatResult trouvee)`
      );
      return true;
    }

    // Trouver la fin de la deuxieme formatResult (jusqu'au prochain },)
    const afterSecond = configSection.substring(secondFormatResultStart);
    let braceCount = 0;
    let endIndex = -1;

    for (let i = 0; i < afterSecond.length; i++) {
      if (afterSecond[i] === "{") braceCount++;
      if (afterSecond[i] === "}") braceCount--;

      // Si on a une }, et braceCount = 0, c'est la fin
      if (braceCount === 0 && i > 20) {
        endIndex = i + 1;
        break;
      }
    }

    if (endIndex === -1) {
      console.log(
        `⚠️  Impossible de trouver la fin de formatResult dans ${path.basename(
          filePath
        )}`
      );
      return false;
    }

    // Supprimer la deuxieme formatResult complete
    const beforeSecond = content.substring(
      0,
      configStart + secondFormatResultStart
    );
    const afterSecondFormatResult = content.substring(
      configStart + secondFormatResultStart + endIndex
    );

    // Nettoyer les espaces/virgules superflues
    let newContent = beforeSecond + afterSecondFormatResult;
    newContent = newContent.replace(/,\s*};/, "};"); // Enlever virgule avant }

    fs.writeFileSync(filePath, newContent, "utf-8");
    console.log(
      `✅ Corrige ${path.basename(filePath)} (double formatResult supprimee)`
    );
    return true;
  } catch (error) {
    console.error(`❌ Erreur pour ${path.basename(filePath)}:`, error.message);
    return false;
  }
}

// Traiter tous les fichiers de departement
const deptDir = path.join(__dirname, "../src/pages/blog/departements");
const files = fs
  .readdirSync(deptDir)
  .filter((f) => f.startsWith("frais-notaire-") && f.endsWith(".html"));

console.log(
  `\n🔧 Correction des doublons formatResult dans ${files.length} articles...\n`
);

let successCount = 0;
let failCount = 0;

files.forEach((file) => {
  const match = file.match(/frais-notaire-([^.]+)\.html/);
  if (match) {
    const departement = match[1];
    const filePath = path.join(deptDir, file);
    if (fixBlogFile(filePath, departement)) {
      successCount++;
    } else {
      failCount++;
    }
  }
});

console.log(
  `\n✨ Resultat: ${successCount}/${files.length} corrections reussies`
);
if (failCount > 0) {
  console.log(`⚠️  ${failCount} fichiers n'ont pas pu etre corriges`);
}
console.log(
  "\n📝 Les doublons formatResult ont ete supprimes. L'affichage detaille des frais est maintenant visible."
);
