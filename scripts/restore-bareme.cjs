/**
 * RESTORE Official Barème Tranches
 * The aggressive cleanup accidentally replaced the official barème tranches
 * This script restores them to their proper values
 */

const fs = require("fs");
const path = require("path");

const folder = path.join(
  __dirname,
  "..",
  "src",
  "pages",
  "blog",
  "departements",
);

let totalFixed = 0;

fs.readdirSync(folder)
  .filter((f) => f.endsWith(".html"))
  .forEach((file) => {
    const filePath = path.join(folder, file);
    let content = fs.readFileSync(filePath, "utf8");
    const original = content;

    // Restore barème tranches
    // Pattern: "De un montant variable à un montant variable" followed by specific percentages

    // Tranche 1: 3,945% = 0€ à 6 500€
    content = content.replace(
      /<span class="text-gray-700">De un montant variable à un montant variable<\/span>\s*<span class="font-mono bg-blue-100 px-3 py-1 rounded">3,945%<\/span>/g,
      '<span class="text-gray-700">De 0€ à 6 500€</span>\n                <span class="font-mono bg-blue-100 px-3 py-1 rounded">3,945%</span>',
    );

    // Tranche 2: 1,627% = 6 500€ à 17 000€
    content = content.replace(
      /<span class="text-gray-700">De un montant variable à un montant variable<\/span>\s*<span class="font-mono bg-blue-100 px-3 py-1 rounded">1,627%<\/span>/g,
      '<span class="text-gray-700">De 6 500€ à 17 000€</span>\n                <span class="font-mono bg-blue-100 px-3 py-1 rounded">1,627%</span>',
    );

    // Tranche 3: 1,085% = 17 000€ à 60 000€
    content = content.replace(
      /<span class="text-gray-700">De un montant variable à un montant variable<\/span>\s*<span class="font-mono bg-blue-100 px-3 py-1 rounded">1,085%<\/span>/g,
      '<span class="text-gray-700">De 17 000€ à 60 000€</span>\n                <span class="font-mono bg-blue-100 px-3 py-1 rounded">1,085%</span>',
    );

    // Tranche 4: 0,814% = Au-delà de 60 000€
    content = content.replace(
      /<span class="text-gray-700">Au-delà de un montant variable<\/span>\s*<span class="font-mono bg-blue-100 px-3 py-1 rounded">0,814%<\/span>/g,
      '<span class="text-gray-700">Au-delà de 60 000€</span>\n                <span class="font-mono bg-blue-100 px-3 py-1 rounded">0,814%</span>',
    );

    // CSI: min 15€ ou 0,10%
    content = content.replace(
      /<span class="font-mono bg-indigo-100 px-3 py-1 rounded"><strong>min un montant variable ou 0,10%<\/strong><\/span>/g,
      '<span class="font-mono bg-indigo-100 px-3 py-1 rounded"><strong>min 15€ ou 0,10%</strong></span>',
    );

    if (content !== original) {
      fs.writeFileSync(filePath, content, "utf8");
      console.log(`Restored: ${file}`);
      totalFixed++;
    }
  });

console.log(`\n✅ Total files restored: ${totalFixed}`);
