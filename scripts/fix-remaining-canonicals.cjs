#!/usr/bin/env node

/**
 * Script pour fixer les 18 canonicals restants
 */

const fs = require("fs");
const path = require("path");

console.log("\n🔧 FIX DES 18 CANONICALS RESTANTS\n");
console.log("=".repeat(80));

const srcDir = path.join(__dirname, "..", "src", "pages");

// Fichiers problématiques et leurs canonicals attendus
const fixes = [
  {
    file: "apl-zones.html",
    find: "https://www.lescalculateurs.fr/pages/apl-zones.html",
    replace: "https://www.lescalculateurs.fr/pages/apl-zones",
  },
  {
    file: "apl.html",
    find: "https://www.lescalculateurs.fr/pages/apl.html",
    replace: "https://www.lescalculateurs.fr/pages/apl",
  },
  {
    file: "blog/departements/frais-notaire-07.html",
    find: "https://www.lescalculateurs.fr/pages/blog/departements/frais-notaire-07.html",
    replace:
      "https://www.lescalculateurs.fr/pages/blog/departements/frais-notaire-07",
  },
  {
    file: "blog.html",
    find: "https://www.lescalculateurs.fr/blog",
    replace: "https://www.lescalculateurs.fr/pages/blog",
  },
  {
    file: "charges.html",
    find: "https://www.lescalculateurs.fr/pages/charges.html",
    replace: "https://www.lescalculateurs.fr/pages/charges",
  },
  {
    file: "crypto-bourse.html",
    find: "https://www.lescalculateurs.fr/pages/crypto-bourse.html",
    replace: "https://www.lescalculateurs.fr/pages/crypto-bourse",
  },
  {
    file: "financement.html",
    find: "https://www.lescalculateurs.fr/pages/financement.html",
    replace: "https://www.lescalculateurs.fr/pages/financement",
  },
  {
    file: "ik.html",
    find: "https://www.lescalculateurs.fr/pages/ik.html",
    replace: "https://www.lescalculateurs.fr/pages/ik",
  },
  {
    file: "impot.html",
    find: "https://www.lescalculateurs.fr/impot",
    replace: "https://www.lescalculateurs.fr/pages/impot",
  },
  {
    file: "notaire.html",
    find: "https://www.lescalculateurs.fr/notaire",
    replace: "https://www.lescalculateurs.fr/pages/notaire",
  },
  {
    file: "plusvalue.html",
    find: "https://www.lescalculateurs.fr/pages/plusvalue.html",
    replace: "https://www.lescalculateurs.fr/pages/plusvalue",
  },
  {
    file: "ponts.html",
    find: "https://www.lescalculateurs.fr/ponts",
    replace: "https://www.lescalculateurs.fr/pages/ponts",
  },
  {
    file: "pret.html",
    find: "https://www.lescalculateurs.fr/pages/pret.html",
    replace: "https://www.lescalculateurs.fr/pages/pret",
  },
  {
    file: "salaire-seo.html",
    find: "https://www.lescalculateurs.fr/salaire",
    replace: "https://www.lescalculateurs.fr/pages/salaire",
  },
  {
    file: "salaire.html",
    find: "https://www.lescalculateurs.fr/salaire",
    replace: "https://www.lescalculateurs.fr/pages/salaire",
  },
  {
    file: "simulateurs.html",
    find: "https://www.lescalculateurs.fr/simulateurs",
    replace: "https://www.lescalculateurs.fr/pages/simulateurs",
  },
  {
    file: "taxe.html",
    find: "https://www.lescalculateurs.fr/pages/taxe.html",
    replace: "https://www.lescalculateurs.fr/pages/taxe",
  },
  {
    file: "travail.html",
    find: "https://www.lescalculateurs.fr/pages/travail.html",
    replace: "https://www.lescalculateurs.fr/pages/travail",
  },
];

let fixedCount = 0;

fixes.forEach((fix) => {
  const filePath = path.join(srcDir, fix.file);

  try {
    let content = fs.readFileSync(filePath, "utf8");
    const originalContent = content;

    // Remplacer
    content = content.replace(fix.find, fix.replace);

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, "utf8");
      console.log(`  ✅ ${fix.file}`);
      fixedCount++;
    } else {
      console.log(`  ⚠️  ${fix.file} (pas de match)`);
    }
  } catch (err) {
    console.log(`  ❌ ${fix.file}: ${err.message}`);
  }
});

console.log("\n" + "=".repeat(80));
console.log(`\n✅ Fichiers corrigés: ${fixedCount} / ${fixes.length}\n`);

console.log("Prochaines étapes:");
console.log("  1. node scripts/verify-canonicals-fixed.cjs");
console.log("  2. git add src/pages");
console.log('  3. git commit -m "fix: Fix remaining 18 canonical URLs"');
console.log("  4. git push\n");
