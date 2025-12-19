#!/usr/bin/env node

/**
 * Script de CORRECTION des canonicals
 * Standardiser tous les canonicals pour éviter la chaîne de redirects
 */

const fs = require("fs");
const path = require("path");

console.log("\n🔧 CORRECTION DES CANONICALS - GÉNÉRER LE PLAN D'ACTION\n");
console.log("=".repeat(80));

// Charger l'analyse
const analysis = JSON.parse(
  fs.readFileSync("./scripts/canonical-analysis-detailed.json", "utf8")
);

console.log("\n📊 PROBLÈMES À CORRIGER:\n");

console.log("1. 105 URLs avec /pages/ → /blog/ mismatch");
console.log(
  "   Cause: Canonical pointe vers /blog/ mais fichier est en /pages/"
);
console.log("   Impact: Crée redirection supplémentaire");
console.log("   Solution: Canonical doit pointer vers /pages/blog/\n");

console.log("2. 10 URLs avec apex domain + .html");
console.log("   Cause: Canonical = lescalculateurs.fr/...html");
console.log("   Impact: Double problème (apex + .html)");
console.log(
  "   Solution: Canonical doit être www.lescalculateurs.fr sans .html\n"
);

console.log("3. 2 URLs avec apex domain seul");
console.log("   Cause: Canonical = lescalculateurs.fr/...");
console.log("   Impact: Mismatch avec redirect apex → www");
console.log("   Solution: Canonical doit être www.lescalculateurs.fr\n");

console.log("4. 1 URL avec www + .html");
console.log("   Cause: Canonical = www.lescalculateurs.fr/...html");
console.log("   Impact: Contredit redirects .html → sans extension");
console.log("   Solution: Canonical doit être sans .html\n");

console.log("=".repeat(80));

console.log("\n✅ PLAN DE CORRECTION:\n");

console.log("OPTION 1: Changer TOUS les canonicals pour matcher le build réel");
console.log("─────────────────────────────────────────────────────────────");
console.log("");
console.log("  Actuellement: Vercel build transforme");
console.log("    /src/pages/blog/frais-notaire-01.html");
console.log(
  "    → /pages/blog/frais-notaire-01 (dans public/dist/pages/blog/)"
);
console.log("");
console.log("  Les canonicals devraient être:");
console.log("    https://www.lescalculateurs.fr/pages/blog/frais-notaire-01");
console.log("");
console.log("  ADVANTAGE:");
console.log("  • URL réelle = Canonical = une seule URL");
console.log("  • Pas de redirection interne");
console.log("  • Google indexe direct");
console.log("");
console.log("  ACTION:");
console.log("  • Remplacer tous /blog/ → /pages/blog/");
console.log("  • Remplacer tous apex → www");
console.log("  • Supprimer tous .html");
console.log("");

console.log("OPTION 2: Ajouter un rewrite dans vercel.json");
console.log("─────────────────────────────────────────────");
console.log("");
console.log("  Transformer /pages/blog/ → /blog/ au niveau Vercel");
console.log("");
console.log("  ADVANTAGE:");
console.log("  • Canonicals restent /blog/");
console.log("  • Les URLs finales deviennent /blog/ aussi");
console.log("  • Cohérence totale");
console.log("");
console.log("  ACTION:");
console.log("  • Ajouter rewrite vercel.json");
console.log("  • Pas de changement HTML");
console.log("");

console.log("=".repeat(80));

console.log("\n🎯 RECOMMANDATION: OPTION 1 (plus simple et rapide)\n");

console.log("Les changements à faire:");
console.log("");

const fixes = {
  "/blog/departements/": {
    replace: "https://www.lescalculateurs.fr/blog/departements/",
    with: "https://www.lescalculateurs.fr/pages/blog/departements/",
    count: 94,
  },
  "/blog/": {
    replace: "https://www.lescalculateurs.fr/blog/",
    with: "https://www.lescalculateurs.fr/pages/blog/",
    count: 11,
  },
  "lescalculateurs.fr/": {
    replace: 'href="https://lescalculateurs.fr/',
    with: 'href="https://www.lescalculateurs.fr/',
    count: 12,
  },
  ".html": {
    replace: ".html",
    with: "",
    count: 11,
  },
};

Object.entries(fixes).forEach(([key, fix]) => {
  console.log(`1. ${key}`);
  console.log(`   Find:    ${fix.replace}`);
  console.log(`   Replace: ${fix.with}`);
  console.log(`   Approx files: ${fix.count}`);
  console.log("");
});

console.log("AVANT (problématique):");
console.log(
  '  <link rel="canonical" href="https://www.lescalculateurs.fr/blog/departements/frais-notaire-01" />'
);
console.log(
  "  Redirige vers: /pages/blog/departements/frais-notaire-01 (via vercel.json)"
);
console.log("  Problème: Canonical ≠ URL réelle");
console.log("");

console.log("APRÈS (correctif):");
console.log(
  '  <link rel="canonical" href="https://www.lescalculateurs.fr/pages/blog/departements/frais-notaire-01" />'
);
console.log("  URL réelle: /pages/blog/departements/frais-notaire-01");
console.log("  Avantage: Canonical = URL réelle, pas de redirection interne");
console.log("");

console.log("=".repeat(80));

console.log("\n💡 POURQUOI CELA VA RÉSOUDRE LE PROBLÈME:\n");

console.log("Situation actuelle (MAUVAISE):");
console.log(
  "  Google découvre: https://www.lescalculateurs.fr/pages/blog/frais-notaire-01.html"
);
console.log(
  "  Canonical dit: https://www.lescalculateurs.fr/blog/frais-notaire-01"
);
console.log("  CONFLIT! Google ne sait pas laquelle indexer");
console.log("  RÉSULTAT: Non indexée");
console.log("");

console.log("Après correction:");
console.log(
  "  Google découvre: https://www.lescalculateurs.fr/pages/blog/frais-notaire-01.html"
);
console.log(
  "  Redirect .html: https://www.lescalculateurs.fr/pages/blog/frais-notaire-01"
);
console.log(
  "  Canonical dit: https://www.lescalculateurs.fr/pages/blog/frais-notaire-01"
);
console.log("  ✓ PARFAIT! Tout pointe au même endroit");
console.log("  RÉSULTAT: Indexée!");
console.log("");

console.log("=".repeat(80));

// Export plan
const plan = {
  generated: new Date().toISOString(),
  issue: "Canonicals create redirect chains blocking indexation",
  affectedFiles: 118,
  solution:
    "Standardize all canonicals to match actual Vercel build output paths",
  changes: {
    replacements: [
      {
        pattern: "/blog/departements/",
        replacement: "/pages/blog/departements/",
        reason: "Match actual URL path from Vercel build",
        files: 94,
      },
      {
        pattern: "/blog/",
        replacement: "/pages/blog/",
        reason: "Match actual URL path from Vercel build",
        files: 11,
      },
      {
        pattern: "https://lescalculateurs.fr/",
        replacement: "https://www.lescalculateurs.fr/",
        reason: "Enforce www domain (matches redirect rules)",
        files: 12,
      },
      {
        pattern: '.html\\"',
        replacement: '\\"',
        reason: "Remove .html from canonical (matches redirect rules)",
        files: 11,
      },
    ],
    totalFilesToModify: 118,
    estimatedTime: "5-10 minutes with search & replace",
  },
};

fs.writeFileSync(
  "./scripts/canonical-fix-plan.json",
  JSON.stringify(plan, null, 2)
);

console.log("\n📝 Plan exporté: scripts/canonical-fix-plan.json\n");
