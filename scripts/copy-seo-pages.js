/**
 * Script de copie des pages SEO départementales vers dist/
 * Exécuté automatiquement après le build Vite
 * Injecte automatiquement les bons liens CSS/JS
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Chemins
const sourceDir = path.resolve(__dirname, "../src/pages/blog/departements");
const targetDir = path.resolve(__dirname, "../dist/pages/blog/departements");
const assetsDir = path.resolve(__dirname, "../dist/assets");

console.log("📦 Copie des pages SEO départementales...\n");

try {
  // Trouver les fichiers CSS et JS générés par Vite
  const assetFiles = fs.readdirSync(assetsDir);
  const cssFile = assetFiles.find(
    (f) => f.startsWith("main-") && f.endsWith(".css")
  );
  const jsFile = assetFiles.find(
    (f) => f.startsWith("main-") && f.endsWith(".js")
  );

  if (!cssFile || !jsFile) {
    console.error("❌ Fichiers CSS/JS introuvables dans dist/assets/");
    process.exit(1);
  }

  console.log(`🎨 CSS trouvé: ${cssFile}`);
  console.log(`📜 JS trouvé: ${jsFile}\n`);

  // Créer le dossier de destination s'il n'existe pas
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
    console.log("✅ Dossier créé:", targetDir);
  }

  // Lire tous les fichiers du dossier source
  const files = fs.readdirSync(sourceDir);
  const htmlFiles = files.filter((file) => file.endsWith(".html"));

  console.log(`📄 ${htmlFiles.length} pages SEO trouvées\n`);

  let copiedCount = 0;
  let errorCount = 0;

  // Copier et injecter CSS/JS dans chaque fichier
  htmlFiles.forEach((file) => {
    try {
      const sourcePath = path.join(sourceDir, file);
      const targetPath = path.join(targetDir, file);

      // Lire le contenu HTML
      let htmlContent = fs.readFileSync(sourcePath, "utf-8");

      // Remplacer les anciens noms de fichiers par les nouveaux
      htmlContent = htmlContent.replace(
        /src="\.\.\/\.\.\/assets\/main-[^"]+\.js"/g,
        `src="../../assets/${jsFile}"`
      );
      htmlContent = htmlContent.replace(
        /href="\.\.\/\.\.\/assets\/main-[^"]+\.css"/g,
        `href="../../assets/${cssFile}"`
      );

      // Écrire le fichier modifié
      fs.writeFileSync(targetPath, htmlContent, "utf-8");
      copiedCount++;

      // Afficher un message tous les 20 fichiers
      if (copiedCount % 20 === 0) {
        console.log(`   Copié: ${copiedCount}/${htmlFiles.length} pages...`);
      }
    } catch (err) {
      console.error(`❌ Erreur lors de la copie de ${file}:`, err.message);
      errorCount++;
    }
  });

  console.log(`\n✅ Copie terminée !`);
  console.log(`   • ${copiedCount} pages copiées avec succès`);
  console.log(`   • CSS/JS injectés automatiquement`);
  if (errorCount > 0) {
    console.log(`   • ${errorCount} erreurs`);
  }
  console.log(`   • Destination: dist/pages/blog/departements/\n`);
} catch (error) {
  console.error("❌ Erreur fatale:", error.message);
  process.exit(1);
}
