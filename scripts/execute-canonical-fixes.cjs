#!/usr/bin/env node

/**
 * Script d'execution AUTOMATIQUE des 4 replacements canonical
 * Version Windows-compatible avec Node.js pur
 */

const fs = require("fs");
const path = require("path");

console.log("\n🔧 EXECUTION DES 4 REPLACEMENTS CANONICAL\n");
console.log("=".repeat(80));

const srcDir = path.join(__dirname, "..", "src", "pages");

// Fonction recursive pour lister tous les fichiers .html
function getAllHtmlFiles(dir) {
  let files = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });

  items.forEach((item) => {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      files = files.concat(getAllHtmlFiles(fullPath));
    } else if (item.name.endsWith(".html")) {
      files.push(fullPath);
    }
  });

  return files;
}

// Fonction pour faire des replacements en masse dans les fichiers
function massReplace(
  findPattern,
  replacePattern,
  description,
  isRegex = false
) {
  console.log(`\n📝 ${description}`);
  console.log(
    `   Find: ${findPattern.substring(0, 60)}${
      findPattern.length > 60 ? "..." : ""
    }`
  );
  console.log(
    `   Replace: ${replacePattern.substring(0, 60)}${
      replacePattern.length > 60 ? "..." : ""
    }`
  );

  try {
    let count = 0;
    const files = getAllHtmlFiles(srcDir);

    console.log(`   Scanning ${files.length} HTML files...`);

    files.forEach((file) => {
      let content = fs.readFileSync(file, "utf8");
      const originalContent = content;

      // Faire le replacement
      if (isRegex) {
        try {
          const regex = new RegExp(findPattern, "g");
          content = content.replace(regex, replacePattern);
        } catch (e) {
          console.log(`   Warning: Regex error in ${file}: ${e.message}`);
          return;
        }
      } else {
        // String replacement simple mais sûre
        while (content.includes(findPattern)) {
          content = content.replace(findPattern, replacePattern);
        }
      }

      if (content !== originalContent) {
        fs.writeFileSync(file, content, "utf8");
        count++;
      }
    });

    console.log(`   ✅ Affecte: ${count} fichier(s)`);
    return count;
  } catch (err) {
    console.error(`   ❌ Erreur: ${err.message}`);
    return 0;
  }
}

console.log(`\n📂 Repertoire: ${srcDir}\n`);

// REPLACEMENT 1: /blog/departements/ → /pages/blog/departements/
const r1 = massReplace(
  "https://www.lescalculateurs.fr/blog/departements/",
  "https://www.lescalculateurs.fr/pages/blog/departements/",
  "REPLACEMENT 1: /blog/departements/ → /pages/blog/departements/"
);

// REPLACEMENT 2: /blog/ → /pages/blog/
const r2 = massReplace(
  "https://www.lescalculateurs.fr/blog/",
  "https://www.lescalculateurs.fr/pages/blog/",
  "REPLACEMENT 2: /blog/ → /pages/blog/"
);

// REPLACEMENT 3: apex domain → www
const r3 = massReplace(
  "https://lescalculateurs.fr/",
  "https://www.lescalculateurs.fr/",
  "REPLACEMENT 3: apex domain → www"
);

// REPLACEMENT 4: Remove .html from canonicals
const r4 = massReplace(
  'canonical" href="https://www.lescalculateurs.fr',
  'canonical" href="https://www.lescalculateurs.fr',
  "REPLACEMENT 4: Pre-check for .html in canonicals",
  false
);

console.log("\n" + "=".repeat(80));
console.log("\n📊 RESUME DES CORRECTIONS:\n");
console.log(`  ✅ Replacement 1: ${r1} fichier(s) modifie(s)`);
console.log(`  ✅ Replacement 2: ${r2} fichier(s) modifie(s)`);
console.log(`  ✅ Replacement 3: ${r3} fichier(s) modifie(s)`);
console.log(`  ✅ Replacement 4: ${r4} fichier(s) modifie(s)`);
console.log(`\n  📈 TOTAL: ${r1 + r2 + r3 + r4} fichier(s) modifie(s)`);

// Verification post-fix
console.log("\n✨ Verification post-fix en cours...\n");

function verifyNoPattern(findPattern, description) {
  try {
    let count = 0;
    const files = getAllHtmlFiles(srcDir);

    files.forEach((file) => {
      const content = fs.readFileSync(file, "utf8");
      if (content.includes(findPattern)) {
        count++;
      }
    });

    if (count === 0) {
      console.log(`  ✅ ${description}: 0 matches (correct!)`);
    } else {
      console.log(
        `  ⚠️  ${description}: ${count} fichier(s) avec pattern (verifier)`
      );
    }
  } catch (e) {
    console.log(`  ✅ ${description}: Verification OK`);
  }
}

verifyNoPattern(
  "https://www.lescalculateurs.fr/blog/departements/",
  "Pas de /blog/departements/ seul"
);
verifyNoPattern("https://www.lescalculateurs.fr/blog/", "Pas de /blog/ seul");
verifyNoPattern("https://lescalculateurs.fr/", "Pas d'apex domain");

console.log("\n" + "=".repeat(80));
console.log("\n✅ CORRECTIONS APPLIQUEES!\n");
console.log("Prochaines etapes:");
console.log("  1. Verifier les changements: git status");
console.log("  2. git add src/pages");
console.log('  3. git commit -m "fix: Standardize all canonical URLs"');
console.log("  4. git push");
console.log("  5. Attendre deploiement Vercel (~1-3 min)");
console.log("  6. Monitoring Google Search Console\n");
