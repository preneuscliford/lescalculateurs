#!/usr/bin/env node
/**
 * Script pour corriger TOUS les canonicals dans le projet
 * Résultat: Tous les canonicals au format https://www.lescalculateurs.fr/pages/... (SANS .html)
 */

const fs = require("fs");
const path = require("path");

console.log("\n" + "=".repeat(80));
console.log("🔧 CORRECTION COMPLÈTE DES CANONICALS");
console.log("=".repeat(80));

const srcDir = path.join(__dirname, "..", "src", "pages");
let totalFiles = 0;
let filesFixed = 0;
const issues = [];

/**
 * Récursivement liste tous les fichiers .html
 */
function getAllHtmlFiles(dir) {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getAllHtmlFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith(".html")) {
      files.push(fullPath);
    }
  }
  return files;
}

/**
 * Calcule l'URL canonique correcte à partir du chemin fichier
 */
function getCorrectCanonical(filePath) {
  // Relative path from src/pages to the file
  const relativePath = path.relative(srcDir, filePath);
  // Remove .html extension and normalize slashes
  const cleanPath = relativePath.replace(/\.html$/, "").replace(/\\/g, "/");
  // Build canonical URL
  return `https://www.lescalculateurs.fr/pages/${cleanPath}`;
}

/**
 * Corrige les canonicals dans un fichier HTML
 */
function fixCanonical(filePath, content) {
  let html = content;
  const correctCanonical = getCorrectCanonical(filePath);

  // Trouver le canonical actuel
  const canonicalRegex =
    /<link\s+rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*\/?>/gi;
  const match = canonicalRegex.exec(html);

  let wasFixed = false;

  if (match) {
    const currentCanonical = match[1];
    if (currentCanonical !== correctCanonical) {
      // Remplacer le canonical
      const oldTag = match[0];
      const newTag = `<link rel="canonical" href="${correctCanonical}" />`;
      html = html.replace(oldTag, newTag);
      wasFixed = true;
    }
  } else {
    // Pas de canonical trouvé, en ajouter un
    if (/<\/head>/i.test(html)) {
      const newTag = `<link rel="canonical" href="${correctCanonical}" />\n  `;
      html = html.replace(/<\/head>/i, newTag + "</head>");
      wasFixed = true;
    }
  }

  return { html, wasFixed, correctCanonical };
}

// Traiter tous les fichiers
const htmlFiles = getAllHtmlFiles(srcDir);
totalFiles = htmlFiles.length;

htmlFiles.forEach((filePath) => {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    const { html, wasFixed, correctCanonical } = fixCanonical(
      filePath,
      content
    );

    if (wasFixed) {
      fs.writeFileSync(filePath, html, "utf8");
      filesFixed++;

      const relPath = filePath.replace(srcDir, "").replace(/\\/g, "/");
      console.log(`✅ ${relPath}`);
      console.log(`   → ${correctCanonical}`);
    }
  } catch (err) {
    issues.push({
      file: filePath,
      error: err.message,
    });
  }
});

// Résumé
console.log("\n" + "=".repeat(80));
console.log(`📊 RÉSUMÉ`);
console.log("=".repeat(80));
console.log(`✅ Fichiers traités: ${filesFixed}/${totalFiles}`);

if (issues.length > 0) {
  console.log(`❌ Erreurs: ${issues.length}`);
  issues.forEach(({ file, error }) => {
    console.log(`   ${file}: ${error}`);
  });
}

console.log("\n✨ Les canonicals sont maintenant standardisés!");
console.log("📝 Prochaine étape: npm run build && git commit && git push\n");
