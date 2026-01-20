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
const legacyBlogDir = path.resolve(__dirname, "../dist/pages/blog");
const assetsDir = path.resolve(__dirname, "../dist/assets");

console.log("📦 Copie des pages SEO départementales...\n");

try {
  // Trouver les fichiers CSS et JS générés par Vite
  const assetFiles = fs.readdirSync(assetsDir);
  const cssFile = assetFiles.find(
    (f) =>
      (f.startsWith("main-") || f.startsWith("tailwind-")) &&
      f.endsWith(".css"),
  );
  const jsFile = assetFiles.find(
    (f) => f.startsWith("main-") && f.endsWith(".js"),
  );
  const calculatorFrameJs = assetFiles.find(
    (f) => f.startsWith("CalculatorFrame-") && f.endsWith(".js"),
  );
  const baremesJs = assetFiles.find(
    (f) => f.startsWith("baremes-") && f.endsWith(".js"),
  );

  if (!cssFile || !jsFile) {
    console.error("❌ Fichiers CSS/JS introuvables dans dist/assets/");
    process.exit(1);
  }

  if (!calculatorFrameJs || !baremesJs) {
    console.warn(
      "⚠️ Chunks CalculatorFrame ou baremes introuvables, les imports dynamiques ne seront pas réécrits.",
    );
  }

  console.log(`🎨 CSS trouvé: ${cssFile}`);
  console.log(`📜 JS trouvé: ${jsFile}\n`);

  // Créer les dossiers de destination s'ils n'existent pas
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
    console.log("✅ Dossier créé:", targetDir);
  }
  if (!fs.existsSync(legacyBlogDir)) {
    fs.mkdirSync(legacyBlogDir, { recursive: true });
    console.log("✅ Dossier créé:", legacyBlogDir);
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

      // Remplacer les imports de développement (main.ts) par les bundles hashés
      htmlContent = htmlContent.replace(
        /<script[^>]*type="module"[^>]*src="[^"]*main\.ts"[^>]*><\/script>/g,
        `<script type="module" crossorigin src="../../../assets/${jsFile}"></script>`,
      );

      // Réécrire les imports dynamiques inline du mini-calculateur vers les chunks dist
      if (calculatorFrameJs) {
        htmlContent = htmlContent.replace(
          /import\("\.\.\/\.\.\/\.\.\/components\/CalculatorFrame\.ts"\)/g,
          `import("../../../assets/${calculatorFrameJs}")`,
        );
      }
      if (baremesJs) {
        htmlContent = htmlContent.replace(
          /import\("\.\.\/\.\.\/\.\.\/data\/baremes\.ts"\)/g,
          `import("../../../assets/${baremesJs}")`,
        );
      }
      // Réécrire import de main.ts si présent dans les scripts inline
      htmlContent = htmlContent.replace(
        /import\("\.\.\/\.\.\/\.\.\/main\.ts"\)/g,
        `import("../../../assets/${jsFile}")`,
      );

      // Remplacer la destructuration fragile par une résolution robuste des exports minifiés
      htmlContent = htmlContent.replace(
        /const\s*\[\s*\{\s*CalculatorFrame\s*\}\s*,\s*\{\s*formatCurrency\s*\}\s*,\s*\{\s*baremes\s*\}\s*\]\s*=\s*await\s*Promise\.all\(\s*\[\s*([\s\S]*?)\s*\]\s*\);/g,
        (match, importsBlock) => {
          return (
            `const [cfMod, mainMod, dataMod] = await Promise.all([\n${importsBlock}\n]);\n` +
            `const CalculatorFrame = cfMod.CalculatorFrame || cfMod.C || cfMod.default;\n` +
            `const formatCurrency = mainMod.formatCurrency || mainMod.f || ((amount) => new Intl.NumberFormat(\"fr-FR\", { style: \"currency\", currency: \"EUR\" }).format(amount));\n` +
            `const baremes = dataMod.baremes || dataMod.b || dataMod.default;`
          );
        },
      );

      // Remplacer les chemins CSS/JS absolus par des chemins relatifs corrects
      // De /assets/main-xxx.css vers ../../../assets/main-yyy.css
      // (pages départementales sont dans dist/pages/blog/departements/)
      htmlContent = htmlContent.replace(
        /href="\/assets\/main-[^"]+\.css"/g,
        `href="../../../assets/${cssFile}"`,
      );
      htmlContent = htmlContent.replace(
        /src="\/assets\/main-[^"]+\.js"/g,
        `src="../../../assets/${jsFile}"`,
      );

      // Au cas où il y aurait déjà des chemins relatifs
      htmlContent = htmlContent.replace(
        /href="\.\.\/\.\.\/\.\.\/assets\/main-[^"]+\.css"/g,
        `href="../../../assets/${cssFile}"`,
      );
      htmlContent = htmlContent.replace(
        /src="\.\.\/\.\.\/\.\.\/assets\/main-[^"]+\.js"/g,
        `src="../../../assets/${jsFile}"`,
      );

      // S'assurer que la feuille de style est injectée si absente
      if (!/href="\.{2}\/\.{2}\/\.{2}\/assets\/[^"]+\.css"/.test(htmlContent)) {
        htmlContent = htmlContent.replace(/<head>([\s\S]*?)<\/head>/, (m) =>
          m.replace(
            /<\/head>/,
            `    <link rel="stylesheet" crossorigin href="../../../assets/${cssFile}">\n  </head>`,
          ),
        );
      }

      // Écrire le fichier modifié (chemins pour /departements)
      fs.writeFileSync(targetPath, htmlContent, "utf-8");
      copiedCount++;

      // Dupliquer sous /pages/blog/frais-notaire-XX.html sans redirection
      try {
        let legacyContent = htmlContent
          .replace(/\.\.\/\.\.\/\.\.\/assets\//g, "../../assets/")
          .replace(
            new RegExp(
              `href=\"\.\.\/\.\.\/\.\.\/assets\/main-[^\"]+\\.css\"`,
              "g",
            ),
            `href=\"../../assets/${cssFile}\"`,
          )
          .replace(
            new RegExp(
              `src=\"\.\.\/\.\.\/\.\.\/assets\/main-[^\"]+\\.js\"`,
              "g",
            ),
            `src=\"../../assets/${jsFile}\"`,
          )
          .replace(
            new RegExp(
              `<link rel=\"stylesheet\" crossorigin href=\"\.\.\/\.\.\/\.\.\/assets\/[^\"]+\\.css\">`,
              "g",
            ),
            `<link rel=\"stylesheet\" crossorigin href=\"../../assets/${cssFile}\">`,
          );

        const legacyPath = path.join(legacyBlogDir, file);
        fs.writeFileSync(legacyPath, legacyContent, "utf-8");
        console.log(`   ↳ Dupliqué: ${legacyPath}`);
      } catch (e) {
        console.warn(
          `⚠️ Duplication legacy échouée pour ${file}: ${e.message}`,
        );
      }

      // Afficher un message tous les 20 fichiers
      if (copiedCount % 20 === 0) {
        console.log(`   Copié: ${copiedCount}/${htmlFiles.length} pages...`);
      }
    } catch (err) {
      console.error(`❌ Erreur lors de la copie de ${file}:`, err.message);
      errorCount++;
    }
  });

  /**
   * Duplique l'article global "ancien vs neuf" sous /departements pour servir une page physique.
   * - Réécrit les imports vers les bundles hashés
   * - Ajuste les chemins des assets
   * - Injecte la CSS si absente
   */
  try {
    const globalArticleSrc = path.resolve(
      __dirname,
      "../src/pages/blog/frais-notaire-ancien-neuf-2026.html",
    );
    const departementsArticleDst = path.resolve(
      __dirname,
      "../dist/pages/blog/departements/frais-notaire-ancien-neuf-2026.html",
    );
    if (fs.existsSync(globalArticleSrc)) {
      let htmlContent = fs.readFileSync(globalArticleSrc, "utf-8");

      // Réécriture du script main.ts vers le bundle produit (../../main.ts)
      htmlContent = htmlContent.replace(
        /<script[^>]*type="module"[^>]*src="\.\.\/\.\.\/main\.ts"[^>]*><\/script>/g,
        `<script type="module" crossorigin src="../../../assets/${jsFile}"></script>`,
      );

      // Ajustement des assets ../../assets/* vers ../../../assets/*
      htmlContent = htmlContent.replace(
        /(href|src)="\.\.\/\.\.\/assets\//g,
        `$1="../../../assets/`,
      );

      // Injection CSS si absente
      if (
        !new RegExp(`href=\"\.\.\.\/\.\.\.\/assets\/${cssFile}\"`).test(
          htmlContent,
        ) &&
        !new RegExp(`href=\"\.\.\.\/\.\.\.\/assets\/main-.*\\.css\"`).test(
          htmlContent,
        )
      ) {
        htmlContent = htmlContent.replace(/<head>([\s\S]*?)<\/head>/, (m) =>
          m.replace(
            /<\/head>/,
            `    <link rel="stylesheet" crossorigin href="../../../assets/${cssFile}">\n  </head>`,
          ),
        );
      }

      // Écrire la page dupliquée
      fs.writeFileSync(departementsArticleDst, htmlContent, "utf-8");
      console.log(
        "✅ Article ancien/neuf copié sous /departements:",
        departementsArticleDst,
      );
    } else {
      console.warn(
        "⚠️ Article global ancien/neuf introuvable:",
        globalArticleSrc,
      );
    }
  } catch (e) {
    console.error("❌ Erreur duplication article ancien/neuf:", e.message);
  }

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
