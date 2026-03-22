#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

// Force UTF-8
process.stdout.setEncoding("utf8");
process.stderr.setEncoding("utf8");

const filesToCheck = [
  "content_SAFE/are.html",
  "content_SAFE/apl.html",
  "content_SAFE/rsa.html",
  "content_SAFE/prime-activite.html",
  "content_SAFE/asf.html",
  "content_SAFE/charges.html",
  "content_SAFE/notaire.html",
  "content_SAFE/impot.html",
  "content_SAFE/crypto-bourse.html",
  "content_SAFE/pret.html",
];

// Patterns d'encodage casse - utiliser UNIQUEMENT hex escapes
const encodingPatterns = [
  // Accents corrupts
  { pattern: /[\xc3][\xa9]/g, name: "e-acute corromp" },
  { pattern: /[\xc3][\xa0]/g, name: "a-grave corromp" },
  { pattern: /[\xc3][\xa8]/g, name: "e-grave corromp" },
  { pattern: /[\xc3][\xaa]/g, name: "e-circumflex corromp" },
  { pattern: /[\xc3][\xa7]/g, name: "c-cedilla corromp" },
  { pattern: /[\xc3][\xb9]/g, name: "u-grave corromp" },
  { pattern: /[\xc3][\xb4]/g, name: "o-circumflex corromp" },
  // Unicode quotes mal decodes
  { pattern: /[\xe2][\x80][\x99]/g, name: "right-quote corromp" },
  { pattern: /[\xe2][\x80][\x98]/g, name: "left-quote corromp" },
  { pattern: /[\xe2][\x80][\x9c]/g, name: "double-quote-left corromp" },
  { pattern: /[\xe2][\x80][\x9d]/g, name: "double-quote-right corromp" },
  { pattern: /[\xe2][\x80][\x93]/g, name: "en-dash corromp" },
  { pattern: /[\xe2][\x80][\x94]/g, name: "em-dash corromp" },
  // Autres
  { pattern: /[\xc3][\xb0][\xc2][\x9f]/g, name: "emoji corromp" },
  { pattern: /[\xef][\xbf][\xbd]/g, name: "replacement-char" },
  { pattern: /[\xc2][\xa0]/g, name: "nbsp corromp" },
];

console.log("[DIAGNOSTIC] Scan des fichiers HTML\n");

let totalIssues = 0;
const reportByFile = {};

for (const filePath of filesToCheck) {
  const fullPath = path.resolve(__dirname, "../", filePath);

  if (!fs.existsSync(fullPath)) {
    console.log(`[SKIP] ${filePath} (not found)`);
    continue;
  }

  const content = fs.readFileSync(fullPath, "utf-8");
  const issues = [];

  for (const { pattern, name } of encodingPatterns) {
    const matches = (content.match(pattern) || []).length;
    if (matches > 0) {
      issues.push(`${name} (${matches}x)`);
      totalIssues += matches;
    }
  }

  if (issues.length === 0) {
    console.log(`[OK] ${filePath}`);
  } else {
    console.log(`[BROKEN] ${filePath}`);
    issues.forEach((issue) => console.log(`  - ${issue}`));
    reportByFile[filePath] = issues;
  }
}

console.log(`\n[SUMMARY] ${totalIssues} probleme(s) d'encodage detecte(s)`);

if (totalIssues > 0) {
  console.log("\nFichiers affectes :");
  Object.entries(reportByFile).forEach(([file, issues]) => {
    console.log(`  ${file} : ${issues.length} type(s) de probleme`);
  });

  console.log("\n[ACTION] Lancez : node scripts/auto-correct-seo.cjs");
  process.exit(1);
} else {
  console.log("\n[PASS] Tous les fichiers sont clean");
  process.exit(0);
}
